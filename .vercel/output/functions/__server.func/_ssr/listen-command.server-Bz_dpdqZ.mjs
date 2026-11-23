import { a as validateMd5, i as validateChatText, n as getSession, o as validateUser } from "./live-sessions.server-D4mjRL8z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listen-command.server-Bz_dpdqZ.js
async function handleListenCommand(request) {
	let body;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Missing command." }, { status: 400 });
	}
	if (!body || typeof body !== "object") return Response.json({ error: "Missing command." }, { status: 400 });
	const record = body;
	const sessionId = typeof record.sessionId === "string" ? record.sessionId : "";
	const session = getSession(sessionId);
	if (!session) return Response.json({ error: "That listen session has ended." }, { status: 404 });
	try {
		if (record.kind === "login") {
			const user = typeof record.user === "string" ? record.user.trim() : "";
			const passwordMd5 = typeof record.passwordMd5 === "string" ? record.passwordMd5.trim().toLowerCase() : "";
			const userError = validateUser(user);
			if (userError) return Response.json({ error: userError }, { status: 400 });
			if (!validateMd5(passwordMd5)) return Response.json({ error: "The password did not hash." }, { status: 400 });
			await session.login(user, passwordMd5);
			return Response.json({ ok: true });
		}
		if (record.kind === "chat") {
			const text = typeof record.text === "string" ? record.text.trim() : "";
			const chatError = validateChatText(text);
			if (chatError) return Response.json({ error: chatError }, { status: 400 });
			await session.sendChat(text);
			return Response.json({ ok: true });
		}
		return Response.json({ error: "Unknown command." }, { status: 400 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "The station did not take that.";
		return Response.json({ error: message }, { status: 409 });
	}
}
//#endregion
export { handleListenCommand };
