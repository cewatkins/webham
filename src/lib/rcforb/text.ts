/** Percent-decoding for chat and dialog text. Malformed escapes are left intact. */
export function decodeProtocolText(encoded: string): string {
  if (!encoded) return "";
  let decoded = encoded;
  try {
    decoded = decodeURIComponent(encoded);
  } catch {
    decoded = encoded;
  }
  return decoded.replace(/\r\n/g, " ").replace(/[\r\n]/g, " ").trim();
}

export function tidyPlace(value: string): string {
  return value.replace(/^[\s-]+|[\s-]+$/g, "").replace(/\s+/g, " ").trim();
}
