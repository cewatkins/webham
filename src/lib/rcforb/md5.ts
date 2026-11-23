const SHIFT = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
  14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21, 6, 10, 15, 21,
] as const;

/** MD5 as lowercase hex. RemoteHams login uses this digest; the password itself is not stored. */
export function md5Hex(input: string): string {
  const data = new TextEncoder().encode(input);
  const bitLen = data.length * 8;
  let paddedLen = data.length + 1;
  while (paddedLen % 64 !== 56) paddedLen += 1;
  paddedLen += 8;
  const bytes = new Uint8Array(paddedLen);
  bytes.set(data);
  bytes[data.length] = 0x80;
  const view = new DataView(bytes.buffer);
  view.setUint32(paddedLen - 8, bitLen >>> 0, true);
  view.setUint32(paddedLen - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const words = new Uint32Array(16);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i += 1) words[i] = view.getUint32(offset + i * 4, true);
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let i = 0; i < 64; i += 1) {
      let mixed = 0;
      let index = 0;
      if (i < 16) {
        mixed = (b & c) | (~b & d);
        index = i;
      } else if (i < 32) {
        mixed = (b & d) | (~d & c);
        index = (5 * i + 1) % 16;
      } else if (i < 48) {
        mixed = b ^ c ^ d;
        index = (3 * i + 5) % 16;
      } else {
        mixed = c ^ (b | ~d);
        index = (7 * i) % 16;
      }
      const sum = (mixed + a + Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) + (words[index] ?? 0)) >>> 0;
      const shifted = ((sum << SHIFT[i]!) | (sum >>> (32 - SHIFT[i]!))) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + shifted) >>> 0;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const digest = new Uint8Array(16);
  const out = new DataView(digest.buffer);
  out.setUint32(0, a0, true);
  out.setUint32(4, b0, true);
  out.setUint32(8, c0, true);
  out.setUint32(12, d0, true);
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
