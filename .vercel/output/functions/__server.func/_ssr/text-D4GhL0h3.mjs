//#region node_modules/.nitro/vite/services/ssr/assets/text-D4GhL0h3.js
/** Percent-decoding for chat and dialog text. Malformed escapes are left intact. */
function decodeProtocolText(encoded) {
	if (!encoded) return "";
	let decoded = encoded;
	try {
		decoded = decodeURIComponent(encoded);
	} catch {
		decoded = encoded;
	}
	return decoded.replace(/\r\n/g, " ").replace(/[\r\n]/g, " ").trim();
}
function tidyPlace(value) {
	return value.replace(/^[\s-]+|[\s-]+$/g, "").replace(/\s+/g, " ").trim();
}
//#endregion
export { tidyPlace as n, decodeProtocolText as t };
