import { n as tidyPlace } from "./text-D4GhL0h3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/directory.server-Pl5LKuh7.js
var NAMED_ENTITIES = {
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	amp: "&"
};
function decodeOnce(value) {
	return value.replace(/&#(\d+);/g, (_, digits) => safeCode(Number(digits))).replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => safeCode(parseInt(hex, 16))).replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}
/** The feed sometimes double-encodes, so a second pass turns leftover entities into text. */
function decodeXml(value) {
	const once = decodeOnce(value);
	return once === value ? once : decodeOnce(once);
}
function safeCode(code) {
	if (!Number.isFinite(code) || code < 0 || code > 1114111) return "";
	try {
		return String.fromCodePoint(code);
	} catch {
		return "";
	}
}
function field(block, name) {
	const match = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i"));
	return match ? decodeXml(match[1].trim()) : "";
}
function parseBool(value) {
	const text = value.trim().toLowerCase();
	return text === "1" || text === "true" || text === "yes";
}
function parsePort(value, fallback) {
	const port = Number(value.trim());
	return Number.isInteger(port) && port > 0 && port <= 65535 ? port : fallback;
}
/** Parses the public RemoteHams XML feed into addressable stations. */
function parseDirectory(xml) {
	const entries = [];
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
			blurb: message.slice(0, 220)
		});
	}
	entries.sort((a, b) => {
		if (a.online !== b.online) return a.online ? -1 : 1;
		return a.serverName.localeCompare(b.serverName, void 0, { sensitivity: "base" }) || a.radioName.localeCompare(b.radioName, void 0, { sensitivity: "base" });
	});
	return entries;
}
/** Public RemoteHams directory. Cached briefly so the list is not refetched on every keystroke. */
var FEED_URL = "http://online.remotehams.com/xmlfeed.php";
var FRESH_MS = 45e3;
var cache = null;
async function loadDirectory() {
	if (cache && Date.now() - cache.at < FRESH_MS) return cache.entries;
	try {
		const response = await fetch(FEED_URL, {
			signal: AbortSignal.timeout(15e3),
			headers: { accept: "application/xml, text/xml, */*" }
		});
		if (!response.ok) throw new Error(`feed status ${response.status}`);
		const entries = parseDirectory(await response.text());
		if (entries.length === 0) throw new Error("feed was empty");
		cache = {
			at: Date.now(),
			entries
		};
		return entries;
	} catch (error) {
		if (cache) return cache.entries;
		const message = error instanceof Error ? error.message : "directory unavailable";
		throw new Error(message);
	}
}
//#endregion
export { loadDirectory };
