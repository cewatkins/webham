export type V07Frame =
  | { kind: "audio"; payload: Uint8Array; keyed: boolean }
  | { kind: "control"; payload: Uint8Array; keyed: boolean }
  | { kind: "session"; payload: Uint8Array; keyed: false };

const HEADER_BYTES = 10;
const SESSION_HEADER_BYTES = 8;
const SESSION_MAGIC = 54;
const MAX_AUDIO_BUFFER = 16384;
const MAX_LINE_BUFFER = 64 * 1024;

function readI32(buf: Uint8Array, offset: number): number {
  return (
    (buf[offset]! | (buf[offset + 1]! << 8) | (buf[offset + 2]! << 16) | (buf[offset + 3]! << 24)) >> 0
  );
}

/** v0.7 audio-channel framing: 10-byte header, no checksum. */
export class V07FrameReader {
  private buffer = new Uint8Array(MAX_AUDIO_BUFFER);
  private count = 0;
  resynchronisedBytes = 0;

  append(data: Uint8Array): void {
    if (data.length === 0) return;
    if (this.count + data.length > MAX_AUDIO_BUFFER) {
      throw new Error("audio framing buffer overflow");
    }
    this.buffer.set(data, this.count);
    this.count += data.length;
  }

  /** One complete frame, or null when more bytes are required. */
  tryRead(): V07Frame | null {
    while (true) {
      if (this.count === 0) return null;
      const span = this.buffer;

      if (
        this.count >= 4 &&
        span[0] === 0 &&
        span[1] === 0 &&
        span[2] === 0 &&
        span[3] === 0
      ) {
        this.consume(4);
        continue;
      }

      if (this.count < SESSION_HEADER_BYTES) return null;

      const isSession =
        span[0] !== 0 &&
        span[1] === 0 &&
        span[2] === 0 &&
        span[3] === 0 &&
        span[4] !== 0 &&
        span[5] === 0 &&
        span[6] === 0 &&
        span[7] === 0;

      let isData = false;
      if (this.count >= HEADER_BYTES) {
        isData =
          span[0] !== 0 &&
          span[4]! <= 2 &&
          span[5] === 0 &&
          span[6] === 0 &&
          span[7] === 0 &&
          span[8] === 0 &&
          span[9] === 0;
      }

      if (!isSession && !isData) {
        if (this.count < HEADER_BYTES) return null;
        this.resynchronise();
        continue;
      }

      const declared = readI32(span, 0);

      if (declared === SESSION_MAGIC) {
        if (!isSession) {
          this.resynchronise();
          continue;
        }
        const sessionPayloadLength = readI32(span, 4);
        if (sessionPayloadLength < 1 || sessionPayloadLength > 64 - SESSION_HEADER_BYTES) {
          this.resynchronise();
          continue;
        }
        const total = SESSION_HEADER_BYTES + sessionPayloadLength;
        if (this.count < total) return null;
        const payload = span.slice(SESSION_HEADER_BYTES, SESSION_HEADER_BYTES + sessionPayloadLength);
        this.consume(total);
        return { kind: "session", payload, keyed: false };
      }

      if (declared >= 1 && declared <= 18) {
        return this.takeData(declared, "control");
      }

      if (declared === 19) {
        this.resynchronise();
        continue;
      }

      if (declared >= 20 && declared <= 2047) {
        return this.takeData(declared, "audio");
      }

      this.resynchronise();
    }
  }

  private takeData(payloadLength: number, kind: "audio" | "control"): V07Frame | null {
    const total = HEADER_BYTES + payloadLength;
    if (this.count < total) return null;
    const keyed = kind === "control" && this.buffer[4] === 2;
    const payload = this.buffer.slice(HEADER_BYTES, HEADER_BYTES + payloadLength);
    this.consume(total);
    return { kind, payload, keyed };
  }

  private resynchronise(): void {
    this.consume(1);
    this.resynchronisedBytes += 1;
  }

  private consume(count: number): void {
    this.count -= count;
    if (this.count > 0) this.buffer.copyWithin(0, count, count + this.count);
  }
}

/** UTF-8 control lines ended by LF, CR LF, or a lone CR. */
export class ControlLineReader {
  private buffer = new Uint8Array(4096);
  private count = 0;

  append(data: Uint8Array): void {
    if (data.length === 0) return;
    if (this.count + data.length > MAX_LINE_BUFFER) {
      throw new Error("control line exceeded 64 KiB");
    }
    if (this.count + data.length > this.buffer.length) {
      const next = new Uint8Array(Math.max(this.buffer.length * 2, this.count + data.length));
      next.set(this.buffer.subarray(0, this.count));
      this.buffer = next;
    }
    this.buffer.set(data, this.count);
    this.count += data.length;
  }

  tryReadLine(): string | null {
    for (let i = 0; i < this.count; i++) {
      const byte = this.buffer[i];
      if (byte === 0x0a) {
        const line = decodeLine(this.buffer.subarray(0, i));
        this.consume(i + 1);
        return line;
      }
      if (byte !== 0x0d) continue;
      if (i + 1 === this.count) return null;
      const consumed = this.buffer[i + 1] === 0x0a ? i + 2 : i + 1;
      const line = decodeLine(this.buffer.subarray(0, i));
      this.consume(consumed);
      return line;
    }
    return null;
  }

  private consume(count: number): void {
    this.count -= count;
    if (this.count > 0) this.buffer.copyWithin(0, count, count + this.count);
  }
}

function decodeLine(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

/** The only audio-socket write a guest performs: IMA liveness, flag 1, never keyed. */
export function imaPacket(): Uint8Array {
  const packet = new Uint8Array(13);
  packet[0] = 3;
  packet[4] = 1;
  packet[10] = 0x49;
  packet[11] = 0x4d;
  packet[12] = 0x41;
  return packet;
}

export function dotnetTicks(now = Date.now()): string {
  return (BigInt(now) * 10000n + 621355968000000000n).toString();
}
