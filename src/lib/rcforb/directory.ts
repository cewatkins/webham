import { tidyPlace } from "./text";
import type { Station } from "./types";

const NAMED_ENTITIES: Record<string, string> = {
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  amp: "&",
};

function decodeOnce(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, digits: string) => safeCode(Number(digits)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => safeCode(parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

/** The feed sometimes double-encodes, so a second pass turns leftover entities into text. */
function decodeXml(value: string): string {
  const once = decodeOnce(value);
  return once === value ? once : decodeOnce(once);
}

function safeCode(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

function field(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeXml(match[1]!.trim()) : "";
}

function parseBool(value: string): boolean {
  const text = value.trim().toLowerCase();
  return text === "1" || text === "true" || text === "yes";
}

function parsePort(value: string, fallback: number): number {
  const port = Number(value.trim());
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : fallback;
}

/** Parses the public RemoteHams XML feed into addressable stations. */
export function parseDirectory(xml: string): Station[] {
  const entries: Station[] = [];
  const blocks = xml.split(/<Radio>/i).slice(1);
  for (const raw of blocks) {
    const end = raw.search(/<\/Radio>/i);
    const block = end >= 0 ? raw.slice(0, end) : raw;
    const domain = field(block, "Domain");
    if (!domain) continue;
    const controlPort = parsePort(field(block, "Port"), 4525);
    if (!Number.isInteger(controlPort) || controlPort < 1) continue;
    const audioPort = parsePort(field(block, "VoipPort"), 0);
    const message = field(block, "Message").replace(/\s+/g, " ").trim();
    entries.push({
      orbId: field(block, "OrbId"),
      serverName: field(block, "ServerName") || domain,
      radioName: field(block, "RadioName"),
      domain,
      controlPort,
      audioPort,
      transport: audioPort > 0 ? "v0.7" : "v0.9",
      listenPolicy: field(block, "CanListen"),
      canTransmit: parseBool(field(block, "CanTransmit")),
      online: parseBool(field(block, "Online")),
      version: field(block, "Version"),
      country: tidyPlace(field(block, "Country")),
      city: tidyPlace(field(block, "City")),
      grid: field(block, "Grid"),
      blurb: message.slice(0, 220),
    });
  }

  entries.sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return a.serverName.localeCompare(b.serverName, undefined, { sensitivity: "base" })
      || a.radioName.localeCompare(b.radioName, undefined, { sensitivity: "base" });
  });
  return entries;
}
