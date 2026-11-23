import { useEffect, useRef, useState, type RefObject } from "react";
import { formatFrequency, parseMeter } from "@/lib/rcforb/format";
import type { PcmPlayer } from "@/lib/rcforb/playback";
import { scopePoints } from "@/lib/rcforb/playback";
import type { RadioSnapshot, Station } from "@/lib/rcforb/types";

type RadioFaceProps = {
  station: Station | null;
  snapshot: RadioSnapshot | null;
  link: "idle" | "connecting" | "live" | "unverified" | "linklost";
  detail: string;
  elapsed: number;
  waveRef: RefObject<Float32Array>;
  playerRef: RefObject<PcmPlayer | null>;
};

const LINK_LABEL = {
  idle: "Idle",
  connecting: "Connecting",
  live: "Live",
  unverified: "Unverified",
  linklost: "Link lost",
} as const;

export function RadioFace({ station, snapshot, link, detail, elapsed, waveRef, playerRef }: RadioFaceProps) {
  const scopeRef = useRef<SVGPolylineElement>(null);
  const [level, setLevel] = useState(0);
  const frequency = formatFrequency(snapshot?.frequencyText);
  const vfoB = snapshot?.frequencyBText ? formatFrequency(snapshot.frequencyBText) : null;
  const meter = parseMeter(snapshot?.sMeter ?? "");
  const meterPct = meter ? Math.max(0, Math.min(100, (meter.value / meter.max) * 100)) : 0;
  const radioName = snapshot?.radioName || station?.radioName || "No radio";
  const place = [station?.city, station?.country].filter(Boolean).join(", ");

  useEffect(() => {
    let frame = 0;
    let tickCount = 0;
    const tick = () => {
      const scope = scopeRef.current;
      const wave = waveRef.current;
      if (scope && wave) scope.setAttribute("points", scopePoints(wave, playerRef.current?.cursor ?? 0));
      tickCount += 1;
      if (tickCount % 4 === 0) {
        const next = playerRef.current?.level ?? 0;
        setLevel((prev) => (Math.abs(prev - next) > 0.015 ? next : prev));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playerRef, waveRef]);

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="rounded-full border border-amber px-2.5 py-1 text-xs font-semibold tracking-widest text-amber">
          LISTEN ONLY
        </p>
        <p className="font-mono text-sm text-muted">
          <span className={link === "live" ? "text-amber" : "text-fg"}>{LINK_LABEL[link]}</span>
          {link !== "idle" ? <span> · {formatElapsed(elapsed)}</span> : null}
        </p>
      </div>

      <div className="mt-4">
        <h2 className="truncate text-xl font-semibold">{station?.serverName ?? "Choose a station"}</h2>
        <p className="mt-1 truncate text-sm text-muted">
          {radioName}
          {snapshot?.driver ? ` · ${snapshot.driver}` : ""}
          {place ? ` · ${place}` : ""}
          {station?.grid ? ` · ${station.grid}` : ""}
        </p>
        {station?.blurb ? <p className="mt-2 line-clamp-3 text-sm text-muted">{station.blurb}</p> : null}
      </div>

      <div className="mt-4 rounded-lg border border-line bg-bg px-4 py-4">
        <p className="font-mono text-4xl tracking-tight text-amber tabular-nums sm:text-5xl">{frequency.digits}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {frequency.unit ? <span className="text-muted">{frequency.unit}</span> : null}
          {snapshot?.mode ? <Readout label={snapshot.mode} /> : null}
          {snapshot?.filter ? <Readout label={snapshot.filter} /> : null}
          {snapshot?.band ? <Readout label={`${snapshot.band} m`} /> : null}
        </div>
        {vfoB ? (
          <p className="mt-3 font-mono text-sm text-muted">
            VFO B <span className="text-fg">{vfoB.digits}</span> {vfoB.unit}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium tracking-widest text-muted">S-METER</p>
          <p className="font-mono text-lg text-amber">{meter?.label || snapshot?.sMeter || "—"}</p>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-bg" aria-hidden="true">
          <div className="h-full bg-amber" style={{ width: `${meterPct}%` }} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-xs text-muted">
          <span>S0</span>
          <span>S3</span>
          <span>S5</span>
          <span>S7</span>
          <span>S9</span>
          <span>+20</span>
          <span>+40</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium tracking-widest text-muted">AUDIO</p>
          <p className="font-mono text-xs text-muted">{Math.round(level * 100)}%</p>
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="mt-2 h-16 w-full rounded-lg bg-bg text-amber"
          aria-hidden="true"
        >
          <polyline
            ref={scopeRef}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg" aria-hidden="true">
          <div className="h-full bg-amber" style={{ width: `${Math.min(100, level * 140)}%` }} />
        </div>
      </div>

      {detail ? <p className="mt-3 text-sm text-amber">{detail}</p> : null}
    </section>
  );
}

function Readout({ label }: { label: string }) {
  return <span className="rounded-md border border-line px-2 py-0.5 font-mono text-fg">{label}</span>;
}

function formatElapsed(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
}
