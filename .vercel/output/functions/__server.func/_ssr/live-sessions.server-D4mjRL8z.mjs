//#region node_modules/.nitro/vite/services/ssr/assets/live-sessions.server-D4mjRL8z.js
var sessions = /* @__PURE__ */ new Map();
function registerSession(session) {
	sessions.set(session.id, session);
}
function dropSession(id) {
	sessions.delete(id);
}
function getSession(id) {
	return sessions.get(id);
}
function validateUser(user) {
	if (user.length < 1 || user.length > 21) return "That name is empty or too long.";
	if (!/^[\x21-\x7e]+$/.test(user) || user.includes(",") || user.includes(":") || /\s/.test(user)) return "Use the RemoteHams name as a single word, with no spaces or commas.";
	return null;
}
function validateMd5(value) {
	return /^[a-f0-9]{32}$/.test(value);
}
function validateChatText(text) {
	if (!text) return "Message is empty.";
	if (text.length > 400) return "Message is too long.";
	if (text.includes("::")) return "Message cannot contain ::.";
	if (text.includes("%")) return "Message cannot contain %.";
	if (text.startsWith("/")) return "Lines starting with / are not chat.";
	if (/[\r\n\0]/.test(text)) return "Message cannot contain a line break.";
	return null;
}
//#endregion
export { validateMd5 as a, validateChatText as i, getSession as n, validateUser as o, registerSession as r, dropSession as t };
