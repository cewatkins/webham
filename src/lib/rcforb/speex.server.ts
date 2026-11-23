import { SPEEX_WASM_BASE64 } from "./vendor/speex-wasm-b64";

/**
 * Narrowband Speex frame sizes in bits, including the 1-bit wideband flag and
 * the 4-bit submode id. Quality 8 (what public v0.7 servers send) is submode
 * 5: 300 bits, and five of those pack to the familiar 188-byte payload.
 */
const NB_FRAME_BITS: Record<number, number> = {
  0: 5,
  1: 43,
  2: 119,
  3: 160,
  4: 220,
  5: 300,
  6: 364,
  7: 492,
  8: 79,
};

type SpeexModule = {
  HEAPU8: Uint8Array;
  HEAP16: Int16Array;
  _malloc(size: number): number;
  _free(pointer: number): void;
  _speex_js_decoder_create(sampleRate: number): number;
  _speex_js_decoder_destroy(handle: number): void;
  _speex_js_decoder_frame_size(handle: number): number;
  _speex_js_decode(handle: number, framePtr: number, length: number, pcmPtr: number): number;
};

type SpeexFactory = (options: { wasmBinary?: Uint8Array }) => Promise<SpeexModule>;

let modulePromise: Promise<SpeexModule> | null = null;

async function loadModule(): Promise<SpeexModule> {
  if (!modulePromise) {
    modulePromise = (async () => {
      const imported = (await import("./vendor/speex-wasm.js")) as { default: SpeexFactory };
      const binary = Uint8Array.from(Buffer.from(SPEEX_WASM_BASE64, "base64"));
      return imported.default({ wasmBinary: binary });
    })().catch((error: unknown) => {
      modulePromise = null;
      throw error;
    });
  }
  return modulePromise;
}

function bitAt(bytes: Uint8Array, index: number): number {
  return (bytes[index >> 3]! >> (7 - (index & 7))) & 1;
}

/** Splits one v0.7 payload into the byte-aligned frames libspeex decodes one at a time. */
export function splitSpeexFrames(payload: Uint8Array): Uint8Array[] {
  const totalBits = payload.length * 8;
  let offset = 0;
  const frames: Uint8Array[] = [];

  while (totalBits - offset > 5 && frames.length < 24) {
    if (bitAt(payload, offset) !== 0) break;
    let mode = 0;
    for (let i = 0; i < 4; i++) mode = (mode << 1) | bitAt(payload, offset + 1 + i);
    if (mode === 15) break;
    if (mode === 13 || mode === 14 || mode > 8) break;
    const bits = NB_FRAME_BITS[mode];
    if (bits == null || totalBits - offset < bits) break;
    const bytes = new Uint8Array(Math.ceil(bits / 8));
    for (let bit = 0; bit < bits; bit++) {
      if (bitAt(payload, offset + bit)) bytes[bit >> 3] |= 1 << (7 - (bit & 7));
    }
    frames.push(bytes);
    offset += bits;
  }

  return frames;
}

export class SpeexStreamDecoder {
  private module: SpeexModule | null = null;
  private handle = 0;
  private framePtr = 0;
  private pcmPtr = 0;
  framesDecoded = 0;
  decodeErrors = 0;

  async open(): Promise<void> {
    this.module = await loadModule();
    this.framePtr = this.module._malloc(512);
    this.pcmPtr = this.module._malloc(160 * 2);
    this.handle = this.module._speex_js_decoder_create(8000);
    const frameSize = this.module._speex_js_decoder_frame_size(this.handle);
    if (!this.handle || frameSize !== 160) {
      throw new Error("Speex decoder did not start in narrowband mode.");
    }
  }

  decode(payload: Uint8Array): Int16Array {
    if (!this.module || !this.handle) return new Int16Array();
    if (payload.length < 2 || payload.length > 2047) return new Int16Array();

    const frames = splitSpeexFrames(payload);
    if (frames.length === 0) {
      this.decodeErrors += 1;
      this.reset();
      return new Int16Array();
    }

    const output = new Int16Array(frames.length * 160);
    let samples = 0;
    for (const frame of frames) {
      this.module.HEAPU8.set(frame, this.framePtr);
      const count = this.module._speex_js_decode(this.handle, this.framePtr, frame.length, this.pcmPtr);
      if (count < 0) {
        this.decodeErrors += 1;
        this.reset();
        break;
      }
      output.set(this.module.HEAP16.subarray(this.pcmPtr >> 1, (this.pcmPtr >> 1) + count), samples);
      samples += count;
      this.framesDecoded += 1;
    }
    return output.subarray(0, samples);
  }

  private reset(): void {
    if (!this.module) return;
    if (this.handle) this.module._speex_js_decoder_destroy(this.handle);
    this.handle = this.module._speex_js_decoder_create(8000);
  }

  close(): void {
    if (!this.module) return;
    if (this.handle) this.module._speex_js_decoder_destroy(this.handle);
    if (this.framePtr) this.module._free(this.framePtr);
    if (this.pcmPtr) this.module._free(this.pcmPtr);
    this.handle = 0;
    this.framePtr = 0;
    this.pcmPtr = 0;
  }
}
