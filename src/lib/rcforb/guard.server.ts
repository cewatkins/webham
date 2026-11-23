import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export class GuardError extends Error {}

function blockedIp(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized.includes(":")) {
    if (normalized === "::" || normalized === "::1") return true;
    if (normalized.startsWith("fe80:") || normalized.startsWith("ff")) return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    const mapped = normalized.match(/:ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return blockedIp(mapped[1]!);
    return false;
  }

  const parts = normalized.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const a = parts[0]!;
  const b = parts[1]!;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0 && parts[2] === 2) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

/**
 * Resolves a station host and refuses loopback, link-local, and private
 * addresses so this listener cannot be aimed at the server's own network.
 */
export async function assertPublicHost(host: string): Promise<string> {
  const bare = host.replace(/^\[|\]$/g, "").trim();
  const lower = bare.toLowerCase();
  if (
    !bare ||
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower === "metadata.google.internal" ||
    lower === "0.0.0.0"
  ) {
    throw new GuardError("That address is not a public station.");
  }

  if (isIP(bare) && blockedIp(bare)) {
    throw new GuardError("That address is not a public station.");
  }

  const lookedUp = await Promise.race([
    lookup(bare, { all: true, verbatim: true }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new GuardError("Could not resolve that host.")), 5000);
    }),
  ]);

  if (lookedUp.length === 0) throw new GuardError("Could not resolve that host.");
  if (lookedUp.some((entry) => blockedIp(entry.address))) {
    throw new GuardError("That address is not a public station.");
  }
  return lookedUp[0]!.address;
}
