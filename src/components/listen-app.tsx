import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Download, Headphones, Square, Volume2, VolumeX } from "lucide-react";
import { DirectoryRail } from "@/components/directory-rail";
import { LogPanel } from "@/components/log-panel";
import { RadioFace } from "@/components/radio-face";
import { SplitPanes } from "@/components/split-panes";
import { md5Hex } from "@/lib/rcforb/md5";
import { PcmPlayer, readListenStream } from "@/lib/rcforb/playback";
import { isThemeId, THEMES, type ThemeId } from "@/lib/rcforb/themes";
import { stationKey, type ChatLine, type ListenStats, type RadioSnapshot, type Station } from "@/lib/rcforb/types";
import { encodeWav } from "@/lib/rcforb/wav";

type LinkStatus = "idle" | "connecting" | "live" | "unverified" | "linklost";
type AuthState = "guest" | "authenticating" | "authorised" | "refused";
type Notice = { kind: string; text: string; at: number };

const EMPTY_STATS: ListenStats = {
  packets: 0,
  decodedSeconds: 0,
  frames: 0,
  decodeErrors: 0,
  controlLines: 0,
};

const PREFS_KEY = "rcforb-listen-prefs";
const RECORD_CAP = 8000 * 60 * 30;

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
  const [theme, setTheme] = useState<ThemeId>("amber");
  const [favoriteKeys, setFavoriteKeys] = useState<string[]>([]);
  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedSamples, setRecordedSamples] = useState(0);
  const [accountUser, setAccountUser] = useState("");
  const [password, setPassword] = useState("");
  const [authState, setAuthState] = useState<AuthState>("guest");
  const [authMessage, setAuthMessage] = useState("");
  const [chatError, setChatError] = useState("");
  const [utc, setUtc] = useState("");
  const [layout, setLayout] = useState<{ index: number; nonce: number } | null>(null);

  const waveRef = useRef<Float32Array>(new Float32Array(240));
  const playerRef = useRef<PcmPlayer | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const genRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const volumeRef = useRef(volume);
  const bufferRef = useRef(bufferMs);
  const reconnectRef = useRef(reconnect);
  const recordRef = useRef(false);
  const chunksRef = useRef<Int16Array[]>([]);
  const recordedCount = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const accountUserRef = useRef(accountUser);
  const passwordRef = useRef(password);
  volumeRef.current = volume;
  bufferRef.current = bufferMs;
  reconnectRef.current = reconnect;
  accountUserRef.current = accountUser;
  passwordRef.current = password;

  const recent = useMemo(() => {
    const byKey = new Map(stations.map((station) => [stationKey(station), station]));
    return recentKeys.map((key) => byKey.get(key)).filter((station): station is Station => Boolean(station));
  }, [recentKeys, stations]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme === "amber" ? "" : theme;
  }, [theme]);

  useEffect(() => {
    const tick = () => setUtc(`${new Date().toISOString().slice(11, 19)} UTC`);
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const prefs = JSON.parse(raw) as {
          volume?: number;
          bufferMs?: number;
          reconnect?: boolean;
          theme?: string;
          favoriteKeys?: unknown[];
          recentKeys?: unknown[];
          accountUser?: string;
          muted?: boolean;
        };
        if (typeof prefs.volume === "number") setVolume(prefs.volume);
        if (typeof prefs.bufferMs === "number") setBufferMs(prefs.bufferMs);
        if (typeof prefs.reconnect === "boolean") setReconnect(prefs.reconnect);
        if (typeof prefs.theme === "string" && isThemeId(prefs.theme)) setTheme(prefs.theme);
        if (Array.isArray(prefs.favoriteKeys)) setFavoriteKeys(prefs.favoriteKeys.filter((key) => typeof key === "string"));
        if (Array.isArray(prefs.recentKeys)) {
          setRecentKeys(prefs.recentKeys.filter((key) => typeof key === "string").slice(0, 8));
        }
        if (typeof prefs.accountUser === "string") setAccountUser(prefs.accountUser);
        if (typeof prefs.muted === "boolean") setMuted(prefs.muted);
      }
      setPrefsReady(true);
    } catch {
      setPrefsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!prefsReady) return;
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ volume, bufferMs, reconnect, theme, favoriteKeys, recentKeys, accountUser, muted }),
    );
  }, [prefsReady, volume, bufferMs, reconnect, theme, favoriteKeys, recentKeys, accountUser, muted]);

  useEffect(() => {
    playerRef.current?.setVolume(muted ? 0 : volume);
  }, [volume, muted]);

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
      setRecordedSamples(recordedCount.current);
      const player = playerRef.current;
      if (!player) return;
      setBufferSeconds(player.depth());
      setUnderruns(player.underruns);
    }, 250);
    return () => clearInterval(timer);
  }, [link]);

  function choose(station: Station) {
    setTarget(station);
    const key = stationKey(station);
    setRecentKeys((current) => [key, ...current.filter((item) => item !== key)].slice(0, 8));
    if (window.matchMedia("(max-width: 1023px)").matches) setLayout({ index: 1, nonce: Date.now() });
  }

  function toggleFavorite(station: Station) {
    const key = stationKey(station);
    setFavoriteKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [key, ...current]));
  }

  function toggleRecord() {
    if (recordRef.current) {
      recordRef.current = false;
      setRecording(false);
      setRecordedSamples(recordedCount.current);
      return;
    }
    chunksRef.current = [];
    recordedCount.current = 0;
    setRecordedSamples(0);
    recordRef.current = true;
    setRecording(true);
  }

  function saveRecording() {
    if (chunksRef.current.length === 0) return;
    const url = URL.createObjectURL(encodeWav(chunksRef.current));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rcforb-listen-${Date.now()}.wav`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function stop() {
    genRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    playerRef.current?.stop();
    playerRef.current = null;
    sessionIdRef.current = null;
    setLink("idle");
    setDetail("");
    setAuthState("guest");
  }

  async function signIn() {
    setChatError("");
    const user = accountUserRef.current.trim();
    const secret = passwordRef.current;
    if (!user || !secret) {
      setChatError("Enter the RemoteHams name and password.");
      return;
    }
    const sessionId = sessionIdRef.current;
    if (!sessionId) {
      setAuthMessage("Saved for the next Listen. The password stays in this tab only.");
      return;
    }
    setAuthState("authenticating");
    const response = await fetch("/api/listen-command", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "login", sessionId, user, passwordMd5: md5Hex(secret) }),
    });
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setAuthState("refused");
      setChatError(body?.error ?? "Sign-in did not go out.");
    }
  }

  async function sendChat(text: string) {
    setChatError("");
    const sessionId = sessionIdRef.current;
    if (!sessionId) {
      setChatError("Listen first.");
      return;
    }
    const response = await fetch("/api/listen-command", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "chat", sessionId, text }),
    });
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) setChatError(body?.error ?? "The station did not take that line.");
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
    setChatError("");
    setAuthMessage("");
    setAuthState(accountUserRef.current.trim() && passwordRef.current ? "authenticating" : "guest");
    startedAt.current = Date.now();
    setElapsed(0);

    const context = new AudioContext();
    const player = new PcmPlayer(context, waveRef.current);
    player.setVolume(muted ? 0 : volumeRef.current);
    player.setTarget(bufferRef.current / 1000);
    playerRef.current = player;
    void context.resume();

    let reason: "stop" | "link" | "time-limit" = "link";
    while (alive()) {
      const abort = new AbortController();
      abortRef.current = abort;
      if (alive()) setLink("connecting");
      try {
        reason = await pullStation(
          target,
          abort.signal,
          player,
          alive,
          { user: accountUserRef.current.trim(), password: passwordRef.current },
          {
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
          hello: (sessionId) => {
            if (alive()) sessionIdRef.current = sessionId;
          },
          auth: (state, message) => {
            if (!alive()) return;
            setAuthState(state);
            if (message) setAuthMessage(message);
          },
          pcm: (samples) => {
            if (!recordRef.current || recordedCount.current >= RECORD_CAP) return;
            chunksRef.current.push(new Int16Array(samples));
            recordedCount.current += samples.length;
          },
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
      setAuthState(accountUserRef.current.trim() && passwordRef.current ? "authenticating" : "guest");
      await delay(1000, generation, genRef);
    }

    if (playerRef.current === player) {
      player.stop();
      playerRef.current = null;
    }
    if (!alive()) return;
    sessionIdRef.current = null;
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
    <main className="mx-auto flex h-dvh max-w-7xl flex-col gap-2 px-3 py-3">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-amber">RCFORB</p>
          <h1 className="text-2xl font-semibold tracking-tight">Listen</h1>
          <p className="font-mono text-xs text-muted">{utc}</p>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Color theme">
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={theme === item.id}
              onClick={() => setTheme(item.id)}
              className={`size-9 rounded-full border-2 ${theme === item.id ? "border-fg" : "border-line"}`}
              style={{ background: item.swatch }}
            />
          ))}
        </div>
      </header>
      <p className="line-clamp-2 max-w-3xl text-sm text-muted lg:line-clamp-none">
        Hear the radio, the meter, and the chat. On a phone, switch Stations, Radio, and Log. On a wide screen, drag the bars.
        A RemoteHams account can type in chat. Tuning and transmit stay off.
      </p>
      <div className="grid grid-cols-3 gap-2 lg:hidden">
        {["Stations", "Radio", "Log"].map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setLayout({ index, nonce: Date.now() })}
            className={`h-11 rounded-lg border text-sm font-medium ${
              (layout?.index ?? 0) === index ? "border-amber bg-amber text-ink" : "border-line bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <SplitPanes
        layout={layout}
        panes={[
          {
            id: "stations",
            content: (
              <DirectoryRail
                stations={stations}
                loading={loading}
                error={directoryError}
                query={query}
                onQuery={setQuery}
                onRefresh={() => void refreshDirectory()}
                selectedKey={selectedKey}
                onSelect={choose}
                favoriteKeys={favoriteKeys}
                onToggleFavorite={toggleFavorite}
                recent={recent}
                onManual={(host, controlPort, audioPort) =>
                  choose({
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
            ),
          },
          {
            id: "radio",
            content: (
              <div className="panel-scroll flex h-full min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                <RadioFace
                  station={target}
                  snapshot={snapshot}
                  link={link}
                  detail={detail}
                  elapsed={elapsed}
                  waveRef={waveRef}
                  playerRef={playerRef}
                />
                <section className="sticky bottom-0 z-20 rounded-lg border border-line bg-surface p-3">
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setMuted((value) => !value)}
                      className="inline-flex h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm"
                    >
                      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                      {muted ? "Muted" : "Mute"}
                    </button>
                    <button
                      type="button"
                      onClick={toggleRecord}
                      className={`inline-flex h-11 items-center rounded-lg border px-3 text-sm ${
                        recording ? "border-amber text-amber" : "border-line"
                      }`}
                    >
                      {recording ? "Stop recording" : "Record"}
                    </button>
                    <button
                      type="button"
                      onClick={saveRecording}
                      disabled={recordedSamples === 0}
                      className="inline-flex h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm disabled:opacity-40"
                    >
                      <Download className="size-4" />
                      Save WAV
                    </button>
                    <span className="self-center font-mono text-xs text-muted">{(recordedSamples / 8000).toFixed(1)}s</span>
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
                      Volume {Math.round((muted ? 0 : volume) * 100)}
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
            ),
          },
          {
            id: "log",
            content: (
              <LogPanel
                chat={chat}
                notices={notices}
                snapshot={snapshot}
                chatEndRef={chatEndRef}
                authState={authState}
                authMessage={authMessage}
                accountUser={accountUser}
                password={password}
                onAccountUser={setAccountUser}
                onPassword={setPassword}
                onSignIn={() => void signIn()}
                onSendChat={(text) => void sendChat(text)}
                chatError={chatError}
                listening={listening}
              />
            ),
          },
        ]}
      />

      <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <p>A session pauses itself after 20 minutes. Password is not saved.</p>
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
  account: { user: string; password: string },
  handlers: {
    status: (status: LinkStatus, detail?: string) => void;
    state: (snapshot: RadioSnapshot) => void;
    chat: (line: ChatLine) => void;
    notice: (notice: { kind: string; text: string }) => void;
    stats: (stats: ListenStats) => void;
    failure: (message: string) => void;
    hello: (sessionId: string) => void;
    auth: (state: Exclude<AuthState, "guest">, message: string) => void;
    pcm: (samples: Int16Array) => void;
  },
): Promise<"stop" | "link" | "time-limit"> {
  const body: Record<string, unknown> = {
    host: target.domain,
    controlPort: target.controlPort,
    audioPort: target.audioPort,
  };
  if (account.user && account.password) {
    body.user = account.user;
    body.passwordMd5 = md5Hex(account.password);
  }
  const response = await fetch("/api/listen", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
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
      else if (event.type === "hello") handlers.hello(event.sessionId);
      else if (event.type === "auth") handlers.auth(event.state, event.message ?? "");
      else if (event.type === "end") {
        reason = event.reason;
        if (event.failure) handlers.failure(event.failure);
      }
    },
    pcm: (samples) => {
      if (!alive()) return;
      player.push(samples);
      handlers.pcm(samples);
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
