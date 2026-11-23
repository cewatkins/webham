import net from "node:net";

import { ControlLineReader, V07FrameReader, dotnetTicks, imaPacket } from "./framing";
import { SpeexStreamDecoder } from "./speex.server";
import { RadioStateStore } from "./state";
import type { ListenEvent, ListenStats } from "./types";

const CONTROL_DEADLINE_MS = 15_000;
const SYNC_MS = 15_000;
const SESSION_MS = 20 * 60 * 1000;
const SAMPLE_RATE = 8000;

export type Outbound =
  | { kind: "json"; event: ListenEvent }
  | { kind: "pcm"; pcm: Int16Array };

export type GuestSessionOptions = {
  host: string;
  controlPort: number;
  audioPort: number;
  signal: AbortSignal;
  emit: (outbound: Outbound) => void;
};

class AsyncQueue<T> {
  private items: T[] = [];
  private closed = false;
  private waiter: ((value: T | null) => void) | null = null;

  push(item: T): void {
    if (this.closed) return;
    const waiter = this.waiter;
    if (waiter) {
      this.waiter = null;
      waiter(item);
      return;
    }
    this.items.push(item);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.waiter?.(null);
    this.waiter = null;
  }

  next(timeoutMs: number, signal: AbortSignal): Promise<T | null | "timeout"> {
    if (this.items.length > 0) return Promise.resolve(this.items.shift() ?? null);
    if (this.closed) return Promise.resolve(null);
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.waiter = null;
        signal.removeEventListener("abort", onAbort);
        resolve("timeout");
      }, timeoutMs);
      const onAbort = () => {
        clearTimeout(timer);
        this.waiter = null;
        resolve(null);
      };
      signal.addEventListener("abort", onAbort, { once: true });
      this.waiter = (value) => {
        clearTimeout(timer);
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      };
    });
  }
}

function connectSocket(host: string, port: number, signal: AbortSignal): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("cancelled"));
      return;
    }
    const socket = net.connect({ host, port });
    socket.setNoDelay(true);
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Timed out reaching port ${port}`));
    }, 8_000);
    const fail = (error: Error) => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      socket.destroy();
      reject(error);
    };
    const onAbort = () => fail(new Error("cancelled"));
    signal.addEventListener("abort", onAbort, { once: true });
    socket.once("connect", () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      resolve(socket);
    });
    socket.once("error", (error) => fail(error));
  });
}

function writeSocket(socket: net.Socket, bytes: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.write(bytes, (error) => (error ? reject(error) : resolve()));
  });
}

/**
 * Receive-only guest. The only bytes written are `get id`, `set protocol rcs`,
 * the two control keepalives, and the IMA liveness packet.
 */
export async function runGuestSession(options: GuestSessionOptions): Promise<void> {
  const { host, controlPort, audioPort, signal } = options;
  const state = new RadioStateStore();
  const lines = new AsyncQueue<string>();
  const frames = new AsyncQueue<Uint8Array>();
  const decoder = new SpeexStreamDecoder();
  let control: net.Socket | null = null;
  let audio: net.Socket | null = null;
  let fault: string | null = null;
  const ending: { reason: "link" | "time-limit" | "cancelled" } = { reason: "link" };
  let readySent = false;
  let closedNotice: string | null = null;
  let packets = 0;
  let decodedSamples = 0;
  let controlLines = 0;
  let lastFrames = 0;
  let accept = true;
  let sendChain = Promise.resolve();

  const emitJson = (event: ListenEvent) => {
    if (!accept) return;
    options.emit({ kind: "json", event });
  };
  const emitPcm = (pcm: Int16Array) => {
    if (!accept || pcm.length === 0) return;
    options.emit({ kind: "pcm", pcm });
  };

  const stats = (): ListenStats => ({
    packets,
    decodedSeconds: decodedSamples / SAMPLE_RATE,
    frames: lastFrames,
    decodeErrors: decoder.decodeErrors,
    controlLines,
  });

  const onAbort = () => {
    if (ending.reason === "link") ending.reason = "cancelled";
    control?.destroy();
    audio?.destroy();
    lines.close();
    frames.close();
  };
  signal.addEventListener("abort", onAbort, { once: true });

  const limit = setTimeout(() => {
    ending.reason = "time-limit";
    control?.destroy();
    audio?.destroy();
    lines.close();
    frames.close();
  }, SESSION_MS);

  const enqueueWrite = (socket: net.Socket, bytes: Uint8Array) => {
    sendChain = sendChain
      .then(() => writeSocket(socket, bytes))
      .catch((error: unknown) => {
        fault = fault ?? (error instanceof Error ? error.message : "write failed");
        socket.destroy();
      });
  };

  const sendControl = (command: string): Promise<void> => {
    if (!control) return Promise.resolve();
    const bytes = Buffer.from(`${command}\n`, "utf8");
    const pending = sendChain.then(() => writeSocket(control as net.Socket, bytes));
    sendChain = pending.catch((error: unknown) => {
      fault = fault ?? (error instanceof Error ? error.message : "write failed");
      control?.destroy();
    });
    return pending;
  };

  let snapTimer: ReturnType<typeof setTimeout> | null = null;
  const touchState = () => {
    if (snapTimer || !accept) return;
    snapTimer = setTimeout(() => {
      snapTimer = null;
      emitJson({ type: "state", snapshot: state.snapshot() });
      if (state.ready && !readySent) {
        readySent = true;
        emitJson({ type: "status", status: "live" });
      }
    }, 40);
  };

  const statsTimer = setInterval(() => emitJson({ type: "stats", stats: stats() }), 500);
  const syncTimer = setTimeout(() => {
    if (!state.ready) {
      emitJson({
        type: "notice",
        notice: { kind: "sync", text: "No state marker yet. Audio may still be playing." },
      });
      emitJson({ type: "status", status: "unverified" });
    }
  }, SYNC_MS);

  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let alive: ReturnType<typeof setInterval> | null = null;
  let controlPump = Promise.resolve();
  let audioPump = Promise.resolve();

  try {
    emitJson({ type: "status", status: "connecting", detail: `${host}:${controlPort}` });
    await decoder.open();
    control = await connectSocket(host, controlPort, signal);
    await sendControl("get id");
    audio = await connectSocket(host, audioPort, signal);
    await sendControl("set protocol rcs");

    const controlReader = new ControlLineReader();
    control.on("data", (chunk: Buffer) => {
      try {
        controlReader.append(chunk);
        let line = controlReader.tryReadLine();
        while (line !== null) {
          lines.push(line);
          line = controlReader.tryReadLine();
        }
      } catch (error) {
        fault = error instanceof Error ? error.message : "control framing failed";
        lines.close();
        control?.destroy();
      }
    });
    control.on("end", () => lines.close());
    control.on("close", () => lines.close());
    control.on("error", (error) => {
      fault = fault ?? error.message;
      lines.close();
    });

    const frameReader = new V07FrameReader();
    const drainFrames = () => {
      let frame = frameReader.tryRead();
      while (frame) {
        if (frame.kind === "audio") frames.push(frame.payload);
        frame = frameReader.tryRead();
      }
    };
    audio.on("data", (chunk: Buffer) => {
      try {
        drainFrames();
        frameReader.append(chunk);
        drainFrames();
      } catch (error) {
        fault = error instanceof Error ? error.message : "audio framing failed";
        frames.close();
        audio?.destroy();
      }
    });
    audio.on("end", () => frames.close());
    audio.on("close", () => frames.close());
    audio.on("error", (error) => {
      fault = fault ?? error.message;
      frames.close();
    });

    controlPump = (async () => {
      let lastTraffic = Date.now();
      while (ending.reason === "link" && !signal.aborted) {
        const line = await lines.next(CONTROL_DEADLINE_MS, signal);
        if (line === "timeout") {
          fault = "No control traffic for 15 seconds";
          return;
        }
        if (line === null) {
          fault = fault ?? "Control socket closed";
          return;
        }
        if (line.length === 0) {
          if (Date.now() - lastTraffic > CONTROL_DEADLINE_MS) {
            fault = "Control channel went quiet";
            return;
          }
          continue;
        }
        lastTraffic = Date.now();
        controlLines += 1;
        state.apply(line);
        touchState();
        if (line.startsWith("chat::") && state.lastChat) {
          emitJson({ type: "chat", chat: state.lastChat });
        }
        const notice = state.noticeFor(line);
        if (!notice) continue;
        if (notice.kind === "warning" && notice.text.startsWith("The remote closed")) {
          if (notice.text === closedNotice) continue;
          closedNotice = notice.text;
        }
        emitJson({ type: "notice", notice });
      }
    })();

    audioPump = (async () => {
      while (ending.reason === "link" && !signal.aborted) {
        const payload = await frames.next(60_000, signal);
        if (payload === "timeout") continue;
        if (payload === null) {
          fault = fault ?? "Audio socket closed";
          return;
        }
        const pcm = decoder.decode(payload);
        if (pcm.length === 0) continue;
        packets += 1;
        lastFrames = Math.round(pcm.length / 160);
        decodedSamples += pcm.length;
        emitPcm(pcm);
      }
    })();

    heartbeat = setInterval(() => {
      if (!control || signal.aborted) return;
      sendControl(`post::heartbeat::${dotnetTicks()}`);
      sendControl("post::check::cantune");
    }, 4_000);
    alive = setInterval(() => {
      if (!audio || signal.aborted) return;
      enqueueWrite(audio, imaPacket());
    }, 2_000);

    await Promise.race([controlPump, audioPump]);
  } catch (error) {
    if (ending.reason === "link" && !signal.aborted) {
      fault = error instanceof Error ? error.message : "Could not join the station";
    }
  } finally {
    if (heartbeat) clearInterval(heartbeat);
    if (alive) clearInterval(alive);
    clearTimeout(limit);
    clearTimeout(syncTimer);
    clearInterval(statsTimer);
    if (snapTimer) clearTimeout(snapTimer);
    control?.destroy();
    audio?.destroy();
    lines.close();
    frames.close();
    await Promise.allSettled([controlPump, audioPump]);
    decoder.close();
    signal.removeEventListener("abort", onAbort);
    accept = false;

    if (ending.reason === "time-limit") {
      options.emit({
        kind: "json",
        event: {
          type: "end",
          reason: "time-limit",
          failure: "Paused after 20 minutes so the station is not held open.",
        },
      });
    } else if (ending.reason === "cancelled" || signal.aborted) {
      options.emit({ kind: "json", event: { type: "end", reason: "stop" } });
    } else {
      options.emit({
        kind: "json",
        event: { type: "end", reason: "link", failure: fault ?? "Link ended" },
      });
    }
  }
}
