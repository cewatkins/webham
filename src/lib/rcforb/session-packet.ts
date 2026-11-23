/** 64-byte v0.7 session packet: magic 54, then `user,md5` in ASCII. */
export function buildSessionPacket(user: string, passwordMd5: string): Uint8Array {
  const normalized = user.toLowerCase();
  const name = new TextEncoder().encode(normalized);
  const digest = new TextEncoder().encode(passwordMd5);
  if (name.length !== normalized.length || name.length < 1 || name.length > 21) {
    throw new Error("That RemoteHams name cannot be used on the session packet.");
  }
  if (digest.length !== 32) throw new Error("Password digest is the wrong length.");
  const packet = new Uint8Array(64);
  const view = new DataView(packet.buffer);
  const payloadLength = name.length + 1 + digest.length;
  view.setInt32(0, 54, true);
  view.setInt32(4, payloadLength, true);
  packet.set(name, 8);
  packet[8 + name.length] = 0x2c;
  packet.set(digest, 9 + name.length);
  return packet;
}
