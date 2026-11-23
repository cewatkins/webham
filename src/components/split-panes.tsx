import { useEffect, useRef, useState, type ReactNode } from "react";

type Pane = { id: string; content: ReactNode };

const MOBILE_KEY = "rcforb-split-mobile";
const DESKTOP_KEY = "rcforb-split-desktop";
const MOBILE_DEFAULT = [0.7, 0.18, 0.12];
const DESKTOP_DEFAULT = [0.3, 0.42, 0.28];

function loadFractions(key: string, fallback: number[]): number[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== fallback.length) return fallback;
    if (parsed.some((value) => typeof value !== "number" || !Number.isFinite(value) || value <= 0)) return fallback;
    const sum = parsed.reduce((total, value) => total + value, 0);
    return parsed.map((value) => value / sum);
  } catch {
    return fallback;
  }
}

export function SplitPanes({
  panes,
  layout,
}: {
  panes: Pane[];
  layout: { index: number; nonce: number } | null;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ index: number; start: number; sizes: number[] } | null>(null);
  const [wide, setWide] = useState(false);
  const [fractions, setFractions] = useState<number[]>(MOBILE_DEFAULT);
  const wideRef = useRef(false);
  const fractionsRef = useRef(fractions);
  fractionsRef.current = fractions;

  function persist(nextWide: boolean, next: number[]) {
    localStorage.setItem(nextWide ? DESKTOP_KEY : MOBILE_KEY, JSON.stringify(next));
  }

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      const nextWide = media.matches;
      wideRef.current = nextWide;
      setWide(nextWide);
      setFractions(loadFractions(nextWide ? DESKTOP_KEY : MOBILE_KEY, nextWide ? DESKTOP_DEFAULT : MOBILE_DEFAULT));
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!layout) return;
    const next = fractionsRef.current.map((_, index) => (index === layout.index ? 0.76 : 0.12));
    setFractions(next);
    persist(wideRef.current, next);
  }, [layout]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>, index: number) {
    if (!boxRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      index,
      start: wide ? event.clientX : event.clientY,
      sizes: fractions.slice(),
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    const box = boxRef.current;
    if (!state || !box) return;
    const span = wide ? box.clientWidth : box.clientHeight;
    if (span <= 0) return;
    const delta = ((wide ? event.clientX : event.clientY) - state.start) / span;
    const next = state.sizes.slice();
    const min = 0.12;
    let left = (state.sizes[state.index] ?? 0) + delta;
    let right = (state.sizes[state.index + 1] ?? 0) - delta;
    if (left < min) {
      right -= min - left;
      left = min;
    }
    if (right < min) {
      left -= min - right;
      right = min;
    }
    if (left < min || right < min) return;
    next[state.index] = left;
    next[state.index + 1] = right;
    const sum = next.reduce((total, value) => total + value, 0);
    setFractions(next.map((value) => value / sum));
  }

  function onPointerUp() {
    if (!drag.current) return;
    drag.current = null;
    persist(wide, fractionsRef.current);
  }

  function nudge(index: number, key: string) {
    const grow = wide ? key === "ArrowRight" : key === "ArrowDown";
    const shrink = wide ? key === "ArrowLeft" : key === "ArrowUp";
    if (!grow && !shrink) return;
    const next = fractions.slice();
    const step = grow ? 0.03 : -0.03;
    const min = 0.12;
    const left = (next[index] ?? 0) + step;
    const right = (next[index + 1] ?? 0) - step;
    if (left < min || right < min) return;
    next[index] = left;
    next[index + 1] = right;
    const sum = next.reduce((total, value) => total + value, 0);
    const normalized = next.map((value) => value / sum);
    setFractions(normalized);
    persist(wide, normalized);
  }

  function reset() {
    const next = wide ? DESKTOP_DEFAULT : MOBILE_DEFAULT;
    setFractions(next);
    persist(wide, next);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {wide ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-muted">Drag a bar to resize the panels.</p>
          <button
            type="button"
            onClick={reset}
            className="h-9 rounded-lg border border-line px-3 text-xs text-muted hover:border-amber hover:text-fg"
          >
            Reset panes
          </button>
        </div>
      ) : null}
      {wide ? (
      <div ref={boxRef} className="flex min-h-0 flex-1 flex-row">
        {panes.flatMap((pane, index) => {
          const items = [
            <div
              key={pane.id}
              style={{ flex: `${fractions[index] ?? 1} 1 0px` }}
              className="min-h-0 min-w-0 overflow-hidden"
            >
              {pane.content}
            </div>,
          ];
          if (index < panes.length - 1) {
            items.push(
              <div
                key={`${pane.id}-bar`}
                role="separator"
                aria-orientation="vertical"
                aria-label="Drag sideways to resize panels"
                tabIndex={0}
                onPointerDown={(event) => onPointerDown(event, index)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={(event) => nudge(index, event.key)}
                className="flex w-4 shrink-0 touch-none cursor-col-resize items-center justify-center bg-bg"
              >
                <span className="h-16 w-1.5 rounded-full bg-amber/70" />
              </div>,
            );
          }
          return items;
        })}
      </div>
      ) : (
        <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">{panes[layout?.index ?? 0]?.content}</div>
      )}
    </div>
  );
}
