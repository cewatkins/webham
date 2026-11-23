import { useEffect, useRef, useState } from "react";
import { Headphones, Square } from "lucide-react";
import { DirectoryRail } from "@/components/directory-rail";
import { LogPanel } from "@/components/log-panel";
import { RadioFace } from "@/components/radio-face";
import { PcmPlayer, readListenStream } from "@/lib/rcforb/playback";
import { stationKey, type ChatLine, type ListenStats, type RadioSnapshot, type Station } from "@/lib/rcforb/types";

type LinkStatus = "idle" | "connecting" | "live" | "unverified" | "linklost";

type Notice = { kind: string; text: string; at: number };

const EMPTY_STATS: ListenStats = {
  packets: 0,
  decodedSeconds: 0,
  frames: 0,
  decodeErrors: 0,
  controlLines: 0,
};

const PREFS_KEY = "rcforb-listen-prefs";

type Target = Station;

export function ListenApp() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<Target | null>(null);
  const [link, setLink] = useState<LinkStatus>("idle");
  const [detail, setDetail] = useState("");
  const [snapshot, setSnapshot] = useState<RadioSnapshot | null>(null);
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState<ListenStats>(EMPTY_STATS);
  const [bufferSeconds, setBufferSeconds] = useState(0);
  const [underruns, setUnderruns] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [prefsReady, setPrefsReady] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [bufferMs, setBufferMs] = useState(300);
  const [reconnect, setReconnect] = useState(false);

  const waveRef = useRef<Float32Array>(new Float32Array(240));
  const playerRef = useRef<PcmPlayer | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const genRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const volumeRef = useRef(volume);
  const bufferRef = useRef(bufferMs);
  const reconnectRef = useRef(reconnect);
  volumeRef.current = volume;
  bufferRef.current = bufferMs;
  reconnectRef.current = reconnect;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const prefs = JSON.parse(raw) as { volume?: number; bufferMs?: number; reconnect?: boolean };
        if (typeof prefs.volume === "number") setVolume(prefs.volume);
        if (typeof prefs.bufferMs === "number") setBufferMs(prefs.bufferMs);
        if (typeof prefs.reconnect === "boolean") setReconnect(prefs.reconnect);
      }
      setPrefsReady(true);
    } catch {
      setPrefsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!prefsReady) return;
    localStorage.setItem(PREFS_KEY, JSON.stringify({ volume, bufferMs, reconnect }));
  }, [prefsReady, volume, bufferMs, reconnect]);

  useEffect(() => {
    playerRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    playerRef.current?.setTarget(bufferMs / 1000);
  }, [bufferMs]);

  async function refreshDirectory() {
    setLoading(true);
    setDirectoryError(null);
    try {
      const response = await fetch("/api/directory");
      const body = (await response.json()) as { entries?: Station[]; error?: string };
      if (!response.ok || !body.entries) {
        setDirectoryError(body.error ?? "The station list did not load. You can still enter a host.");
        return;
      }
      setStations(body.entries);
    } catch {
      setDirectoryError("The station list did not load. You can still enter a host.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshDirectory();
  }, []);

  useEffect(() => {
    if (link === "idle") return;
    const timer = setInterval(() => {
      if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      const player = playerRef.current;
      if (!player) return;
      setBufferSeconds(player.depth());
      setUnderruns(player.underruns);
    }, 250);
    return () => clearInterval(timer);
  }, [link]);

  function stop() {
    genRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    playerRef.current?.stop();
    playerRef.current = null;
    setLink("idle");
    setDetail("");
  }

  async function listen() {
    if (!target) return;
    if (target.transport !== "v0.7" || target.audioPort < 1) {
      setDetail("This station uses the single-socket path, which this listener does not speak.");
      return;
    }

    stop();
    const generation = ++genRef.current;
    const alive = () => genRef.current === generation;
    setSnapshot(null);
    setChat([]);
    setNotices([]);
    setStats(EMPTY_STATS);
    setBufferSeconds(0);
    setUnderruns(0);
    setDetail("");
    startedAt.current = Date.now();
    setElapsed(0);

    const context = new AudioContext();
    const player = new PcmPlayer(context, waveRef.current);
    player.setVolume(volumeRef.current);
    player.setTarget(bufferRef.current / 1000);
    playerRef.current = player;
    void context.resume();

    let reason: "stop" | "link" | "time-limit" = "link";
    while (alive()) {
      const abort = new AbortController();
      abortRef.current = abort;
      if (alive()) setLink("connecting");
      try {
        reason = await pullStation(target, abort.signal, player, alive, {
          status: (status, nextDetail) => {
            if (!alive()) return;
            setLink(status);
            if (nextDetail) setDetail(nextDetail);
          },
          state: (next) => alive() && setSnapshot(next),
          chat: (line) => alive() && setChat((current) => [...current.slice(-199), line]),
          notice: (notice) =>
            alive() && setNotices((current) => [...current.slice(-79), { ...notice, at: Date.now() }]),
          stats: (next) => alive() && setStats(next),
          failure: (message) => alive() && setDetail(message),
        });
      } catch (error) {
        if (!alive()) break;
        reason = "link";
        setDetail(error instanceof Error ? error.message : "The link failed.");
      }
      if (!alive()) break;
      if (reason === "stop" || reason === "time-limit" || !reconnectRef.current) break;
      setLink("connecting");
      setDetail("The station dropped the guest link. Reconnecting.");
      await delay(1000, generation, genRef);
    }

    if (playerRef.current === player) {
      player.stop();
      playerRef.current = null;
    }
    if (!alive()) return;
    if (reason === "link") {
      setLink("linklost");
      setDetail((current) => current || "The station closed the link.");
    } else {
      setLink("idle");
    }
    if (reason === "time-limit") {
      setDetail("Paused after 20 minutes. Press Listen if you want to continue.");
    }
  }

  const listening = link === "connecting" || link === "live" || link === "unverified";
  const selectedKey = target ? stationKey(target) : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-3 px-3 py-3 lg:h-dvh">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-amber">RCFORB</p>
          <h1 className="text-2xl font-semibold tracking-tight">Listen</h1>
        </div>
        <p className="max-w-xl text-sm text-muted">
          A guest receiver for public RemoteHams stations. You hear the radio, the meter, and the chat.
          Tuning, typing, and transmit are not in this app.
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="order-1 min-h-0 lg:col-span-3">
          <DirectoryRail
            stations={stations}
            loading={loading}
            error={directoryError}
            query={query}
            onQuery={setQuery}
            onRefresh={() => void refreshDirectory()}
            selectedKey={selectedKey}
            onSelect={setTarget}
            onManual={(host, controlPort, audioPort) =>
              setTarget({
                orbId: "manual",
                serverName: host,
                radioName: "Manual",
                domain: host,
                controlPort,
                audioPort,
                transport: "v0.7",
                listenPolicy: "manual",
                canTransmit: false,
                online: true,
                version: "",
                country: "",
                city: "",
                grid: "",
                blurb: "Entered by hand. Listen only if you have the owner’s OK.",
              })
            }
          />
        </div>

        <div className="order-2 flex min-h-0 flex-col gap-3 lg:col-span-6">
          <RadioFace
            station={target}
            snapshot={snapshot}
            link={link}
            detail={detail}
            elapsed={elapsed}
            waveRef={waveRef}
            playerRef={playerRef}
          />
          <section className="sticky bottom-2 z-20 rounded-lg border border-line bg-surface p-3 lg:static">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void listen()}
                disabled={!target || listening}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-amber px-4 font-semibold text-ink disabled:opacity-40"
              >
                <Headphones className="size-4" />
                Listen
              </button>
              <button
                type="button"
                onClick={stop}
                disabled={!listening}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-line px-4 font-medium disabled:opacity-40"
              >
                <Square className="size-4" />
                Stop
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                Buffer {bufferMs} ms
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={50}
                  value={bufferMs}
                  onChange={(event) => setBufferMs(Number(event.target.value))}
                  className="mt-2 h-11 w-full accent-amber"
                />
              </label>
              <label className="block text-xs text-muted">
                Volume {Math.round(volume * 100)}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="mt-2 h-11 w-full accent-amber"
                />
              </label>
            </div>
            <label className="mt-1 flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={reconnect}
                onChange={(event) => setReconnect(event.target.checked)}
                className="size-4 accent-amber"
              />
              Reconnect if the station drops the guest link
            </label>
          </section>
          <dl className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-surface p-3 text-center sm:grid-cols-6">
            <Stat label="Packets" value={String(stats.packets)} />
            <Stat label="Audio" value={`${stats.decodedSeconds.toFixed(1)}s`} />
            <Stat label="Frames" value={stats.frames ? stats.frames.toFixed(1) : "0"} />
            <Stat label="Buffer" value={`${bufferSeconds.toFixed(2)}s`} />
            <Stat label="Gaps" value={String(underruns)} />
            <Stat label="Errors" value={String(stats.decodeErrors)} />
          </dl>
        </div>

        <div className="order-3 min-h-0 lg:col-span-3">
          <LogPanel chat={chat} notices={notices} snapshot={snapshot} chatEndRef={chatEndRef} />
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs text-muted">
        <p>Guest path only. A session pauses itself after 20 minutes.</p>
        <p className="font-mono">{target ? `${target.domain}:${target.controlPort} / ${target.audioPort}` : "no endpoint"}</p>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-muted">{label}</dt>
      <dd className="font-mono text-sm text-fg">{value}</dd>
    </div>
  );
}

async function pullStation(
  target: Station,
  signal: AbortSignal,
  player: PcmPlayer,
  alive: () => boolean,
  handlers: {
    status: (status: LinkStatus, detail?: string) => void;
    state: (snapshot: RadioSnapshot) => void;
    chat: (line: ChatLine) => void;
    notice: (notice: { kind: string; text: string }) => void;
    stats: (stats: ListenStats) => void;
    failure: (message: string) => void;
  },
): Promise<"stop" | "link" | "time-limit"> {
  const response = await fetch("/api/listen", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      host: target.domain,
      controlPort: target.controlPort,
      audioPort: target.audioPort,
    }),
    signal,
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || contentType.includes("application/json")) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `The station link was refused (${response.status}).`);
  }

  let reason: "stop" | "link" | "time-limit" = "link";
  await readListenStream(response, {
    event: (event) => {
      if (!alive()) return;
      if (event.type === "status") handlers.status(event.status, event.detail);
      else if (event.type === "state") handlers.state(event.snapshot);
      else if (event.type === "chat") handlers.chat(event.chat);
      else if (event.type === "notice") handlers.notice(event.notice);
      else if (event.type === "stats") handlers.stats(event.stats);
      else if (event.type === "end") {
        reason = event.reason;
        if (event.failure) handlers.failure(event.failure);
      }
    },
    pcm: (samples) => {
      if (alive()) player.push(samples);
    },
  });
  return reason;
}

function delay(ms: number, generation: number, genRef: { current: number }): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    const watch = setInterval(() => {
      if (genRef.current !== generation) {
        clearTimeout(timer);
        clearInterval(watch);
        resolve();
      }
    }, 100);
    setTimeout(() => clearInterval(watch), ms + 50);
  });
}
