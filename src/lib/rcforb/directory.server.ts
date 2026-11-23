import { parseDirectory } from "./directory";
import type { Station } from "./types";

/** Public RemoteHams directory. Cached briefly so the list is not refetched on every keystroke. */
const FEED_URL = "http://online.remotehams.com/xmlfeed.php";
const FRESH_MS = 45_000;

let cache: { at: number; entries: Station[] } | null = null;

export async function loadDirectory(): Promise<Station[]> {
  if (cache && Date.now() - cache.at < FRESH_MS) return cache.entries;

  try {
    const response = await fetch(FEED_URL, {
      signal: AbortSignal.timeout(15_000),
      headers: { accept: "application/xml, text/xml, */*" },
    });
    if (!response.ok) throw new Error(`feed status ${response.status}`);
    const xml = await response.text();
    const entries = parseDirectory(xml);
    if (entries.length === 0) throw new Error("feed was empty");
    cache = { at: Date.now(), entries };
    return entries;
  } catch (error) {
    if (cache) return cache.entries;
    const message = error instanceof Error ? error.message : "directory unavailable";
    throw new Error(message);
  }
}
