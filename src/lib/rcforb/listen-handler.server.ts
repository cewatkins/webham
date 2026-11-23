import { assertPublicHost, GuardError } from "./guard.server";
import { validateMd5, validateUser } from "./live-sessions.server";
import { runGuestSession, type Outbound } from "./session.server";
import type { ListenEvent } from "./types";

const MAX_SESSIONS = 8;
let activeSessions = 0;

const HOST_RE = /^[A-Za-z0-9.\-:[\]]{1,253}$/;

export type ListenRequest = {
  host: string;
  controlPort: number;
  audioPort: number;
  credentials: { user: string; passwordMd5: string } | null;
};

export function parseListenBody(body: unknown): ListenRequest | string {
  if (!body || typeof body !== "object") return "Missing station.";
  const record = body as Record<string, unknown>;
  const host = typeof record.host === "string" ? record.host.trim() : "";
  const controlPort = typeof record.controlPort === "number" ? record.controlPort : Number(record.controlPort);
  const audioPort = typeof record.audioPort === "number" ? record.audioPort : Number(record.audioPort);
  if (!HOST_RE.test(host)) return "That host name is not usable.";
  if (!Number.isInteger(controlPort) || controlPort < 1 || controlPort > 65535) return "Control port is invalid.";
  if (!Number.isInteger(audioPort) || audioPort < 1 || audioPort > 65535) return "Audio port is invalid.";
  if (audioPort === controlPort) return "Audio and control ports have to be different.";

  const user = typeof record.user === "string" ? record.user.trim() : "";
  const passwordMd5 = typeof record.passwordMd5 === "string" ? record.passwordMd5.trim().toLowerCase() : "";
  if (!user && !passwordMd5) return { host, controlPort, audioPort, credentials: null };
  const userError = validateUser(user);
  if (userError) return userError;
  if (!validateMd5(passwordMd5)) return "The password did not hash.";
  return { host, controlPort, audioPort, credentials: { user, passwordMd5 } };
}

function frame(type: number, payload: Uint8Array): Uint8Array {
  const packet = new Uint8Array(5 + payload.length);
  packet[0] = type;
  new DataView(packet.buffer).setUint32(1, payload.length);
  packet.set(payload, 5);
  return packet;
}

function encodeOutbound(outbound: Outbound): Uint8Array {
  if (outbound.kind === "pcm") {
    const bytes = new Uint8Array(outbound.pcm.length * 2);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < outbound.pcm.length; i++) view.setInt16(i * 2, outbound.pcm[i]!, true);
    return frame(2, bytes);
  }
  return frame(1, Buffer.from(JSON.stringify(outbound.event), "utf8"));
}

export async function handleListen(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Missing station." }, { status: 400 });
  }
  const parsed = parseListenBody(body);
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });

  if (activeSessions >= MAX_SESSIONS) {
    return Response.json({ error: "Too many people are listening right now. Try again in a moment." }, { status: 429 });
  }

  let address: string;
  try {
    address = await assertPublicHost(parsed.host);
  } catch (error) {
    const message = error instanceof GuardError ? error.message : "Could not resolve that host.";
    return Response.json({ error: message }, { status: 400 });
  }

  activeSessions += 1;
  const sessionAbort = new AbortController();
  const onRequestAbort = () => sessionAbort.abort();
  request.signal.addEventListener("abort", onRequestAbort, { once: true });

  let closed = false;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (outbound: Outbound) => {
        if (closed) return;
        try {
          controller.enqueue(encodeOutbound(outbound));
        } catch {
          closed = true;
          sessionAbort.abort();
        }
      };
      try {
        await runGuestSession({
          host: address,
          controlPort: parsed.controlPort,
          audioPort: parsed.audioPort,
          credentials: parsed.credentials,
          signal: sessionAbort.signal,
          emit,
        });
      } catch (error) {
        const failure = error instanceof Error ? error.message : "The station link failed.";
        const event: ListenEvent = { type: "end", reason: "link", failure };
        emit({ kind: "json", event });
      } finally {
        closed = true;
        activeSessions = Math.max(0, activeSessions - 1);
        request.signal.removeEventListener("abort", onRequestAbort);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      closed = true;
      sessionAbort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/octet-stream",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
