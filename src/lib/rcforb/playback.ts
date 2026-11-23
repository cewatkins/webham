import type { ListenEvent } from "./types";

const SAMPLE_RATE = 8000;

/** Schedules 8 kHz mono PCM with a short jitter buffer. Local gain only. */
export class PcmPlayer {
  readonly context: AudioContext;
  private readonly gain: GainNode;
  private readonly wave: Float32Array;
  private wavePos = 0;
  private nextTime = 0;
  private started = false;
  private target = 0.3;
  private pending: Int16Array[] = [];
  private pendingSamples = 0;
  level = 0;
  underruns = 0;
  skippedSamples = 0;
  cursor = 0;

  constructor(context: AudioContext, wave: Float32Array) {
    this.context = context;
    this.wave = wave;
    this.gain = context.createGain();
    this.gain.gain.value = 0.9;
    this.gain.connect(context.destination);
  }

  setTarget(seconds: number): void {
    this.target = Math.min(1, Math.max(0.1, seconds));
  }

  setVolume(value: number): void {
    const next = Math.min(1, Math.max(0, value));
    this.gain.gain.setTargetAtTime(next, this.context.currentTime, 0.01);
  }

  push(samples: Int16Array): void {
    this.note(samples);
    this.pending.push(samples);
    this.pendingSamples += samples.length;
    const targetSamples = Math.floor(this.target * SAMPLE_RATE);
    if (!this.started) {
      if (this.pendingSamples < targetSamples) return;
      this.started = true;
      this.nextTime = this.context.currentTime + 0.04;
    }
    this.flush();
  }

  depth(): number {
    if (!this.started) return this.pendingSamples / SAMPLE_RATE;
    return Math.max(0, this.nextTime - this.context.currentTime);
  }

  stop(): void {
    this.pending = [];
    this.pendingSamples = 0;
    this.started = false;
    void this.context.close().catch(() => undefined);
  }

  private flush(): void {
    const depth = this.nextTime - this.context.currentTime;
    const cap = Math.max(this.target * 2, this.target + 0.6);
    if (this.started && depth > cap) {
      this.skippedSamples += this.pendingSamples;
      this.pending = [];
      this.pendingSamples = 0;
      return;
    }
    if (this.nextTime < this.context.currentTime - 0.02) {
      this.underruns += 1;
      this.nextTime = this.context.currentTime + 0.02;
    }
    for (const samples of this.pending) this.schedule(samples);
    this.pending = [];
    this.pendingSamples = 0;
  }

  private schedule(samples: Int16Array): void {
    const buffer = this.context.createBuffer(1, samples.length, SAMPLE_RATE);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) channel[i] = samples[i]! / 32768;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gain);
    source.start(this.nextTime);
    this.nextTime += buffer.duration;
  }

  private note(samples: Int16Array): void {
    let sum = 0;
    const step = Math.max(1, Math.floor(samples.length / 48));
    for (let i = 0; i < samples.length; i++) {
      const value = samples[i]! / 32768;
      sum += value * value;
      if (i % step === 0) {
        this.wave[this.wavePos] = value;
        this.wavePos = (this.wavePos + 1) % this.wave.length;
        this.cursor = this.wavePos;
      }
    }
    this.level = Math.sqrt(sum / Math.max(1, samples.length));
  }
}

export function scopePoints(wave: Float32Array, cursor = 0, count = 96): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const index = (cursor + Math.floor((i / count) * wave.length)) % wave.length;
    const x = (i / (count - 1)) * 100;
    const y = 50 - (wave[index] ?? 0) * 42;
    parts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return parts.join(" ");
}

export async function readListenStream(
  response: Response,
  handlers: {
    event: (event: ListenEvent) => void;
    pcm: (samples: Int16Array) => void;
  },
): Promise<void> {
  if (!response.body) throw new Error("The station stream did not open.");
  const reader = response.body.getReader();
  let buffer = new Uint8Array(0);
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || value.length === 0) continue;
    const incoming = new Uint8Array(value.byteLength);
    incoming.set(value);
    buffer = concat(buffer, incoming);
    while (buffer.length >= 5) {
      const type = buffer[0]!;
      const length = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength).getUint32(1);
      if (length > 1_000_000) throw new Error("The station sent a frame that was too large.");
      if (buffer.length < 5 + length) break;
      const payload = buffer.slice(5, 5 + length);
      buffer = buffer.slice(5 + length);
      if (type === 1) {
        handlers.event(JSON.parse(new TextDecoder().decode(payload)) as ListenEvent);
      } else if (type === 2 && payload.length >= 2) {
        const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        const samples = new Int16Array(Math.floor(payload.length / 2));
        for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true);
        handlers.pcm(samples);
      }
    }
  }
}

function concat(left: Uint8Array, right: Uint8Array): Uint8Array<ArrayBuffer> {
  const next = new Uint8Array(left.length + right.length);
  next.set(left);
  next.set(right, left.length);
  return next;
}
