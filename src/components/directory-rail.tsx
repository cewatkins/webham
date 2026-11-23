import { useMemo, useState } from "react";
import { RefreshCw, Search, Star } from "lucide-react";
import { stationKey, type Station } from "@/lib/rcforb/types";

type DirectoryRailProps = {
  stations: Station[];
  loading: boolean;
  error: string | null;
  query: string;
  onQuery: (query: string) => void;
  onRefresh: () => void;
  selectedKey: string | null;
  onSelect: (station: Station) => void;
  onManual: (host: string, controlPort: number, audioPort: number) => void;
  favoriteKeys: string[];
  onToggleFavorite: (station: Station) => void;
  recent: Station[];
};

export function DirectoryRail({
  stations,
  loading,
  error,
  query,
  onQuery,
  onRefresh,
  selectedKey,
  onSelect,
  onManual,
  favoriteKeys,
  onToggleFavorite,
  recent,
}: DirectoryRailProps) {
  const [host, setHost] = useState("");
  const [controlPort, setControlPort] = useState("4525");
  const [audioPort, setAudioPort] = useState("4524");
  const [manualError, setManualError] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);

  const countries = useMemo(() => {
    const names = new Set<string>();
    for (const station of stations) if (station.country) names.add(station.country);
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [stations]);

  const needle = query.trim().toLowerCase();
  const favoriteSet = new Set(favoriteKeys);
  const visible = stations
    .filter((station) => {
      if (country && station.country !== country) return false;
      if (savedOnly && !favoriteSet.has(stationKey(station))) return false;
      if (!needle) return true;
      return [station.serverName, station.radioName, station.country, station.city, station.grid, station.domain, station.blurb]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .sort((a, b) => {
      const fav = Number(favoriteSet.has(stationKey(b))) - Number(favoriteSet.has(stationKey(a)));
      if (fav !== 0) return fav;
      return a.serverName.localeCompare(b.serverName);
    });

  function submitManual() {
    const nextHost = host.trim();
    const control = Number(controlPort);
    const audio = Number(audioPort);
    if (!nextHost) {
      setManualError("Enter a host or address.");
      return;
    }
    if (!Number.isInteger(control) || control < 1 || control > 65535) {
      setManualError("Control port looks wrong.");
      return;
    }
    if (!Number.isInteger(audio) || audio < 1 || audio > 65535) {
      setManualError("Audio port looks wrong.");
      return;
    }
    setManualError(null);
    onManual(nextHost, control, audio);
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-3 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-wide">Stations</h2>
          <p className="text-xs text-muted">{loading ? "Loading the public list" : `${visible.length} shown`}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-fg hover:border-amber hover:text-amber"
          aria-label="Refresh station list"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-2 px-3 pt-3">
        <label className="relative block">
          <span className="sr-only">Filter stations</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Call, radio, country, grid"
            className="h-11 w-full rounded-lg border border-line bg-bg pr-3 pl-10 text-sm text-fg outline-none placeholder:text-muted focus-visible:border-amber"
          />
        </label>
        <div className="flex gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Country</span>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-11 w-full rounded-lg border border-line bg-bg px-2 text-sm text-fg outline-none focus-visible:border-amber"
            >
              <option value="">All countries</option>
              {countries.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setSavedOnly((value) => !value)}
            className={`h-11 shrink-0 rounded-lg border px-3 text-sm ${
              savedOnly ? "border-amber bg-amber text-ink" : "border-line text-muted"
            }`}
          >
            Saved
          </button>
        </div>
        {recent.length > 0 ? (
          <div className="panel-scroll flex gap-2 overflow-x-auto pb-1">
            {recent.map((station) => (
              <button
                key={stationKey(station)}
                type="button"
                onClick={() => onSelect(station)}
                className="h-9 shrink-0 rounded-full border border-line px-3 text-xs text-fg hover:border-amber"
              >
                {station.serverName}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <p className="mx-3 mt-3 text-sm text-amber">{error}</p> : null}

      <ul className="panel-scroll mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        {visible.length === 0 && !loading ? (
          <li className="px-2 py-6 text-sm text-muted">No station matches that filter.</li>
        ) : null}
        {visible.map((station) => {
          const key = stationKey(station);
          const selected = key === selectedKey;
          const saved = favoriteSet.has(key);
          const place = [station.city, station.country].filter(Boolean).join(", ");
          return (
            <li key={key} className="flex items-stretch gap-1">
              <button
                type="button"
                onClick={() => onToggleFavorite(station)}
                aria-label={saved ? `Remove ${station.serverName} from saved` : `Save ${station.serverName}`}
                aria-pressed={saved}
                className={`inline-flex w-11 shrink-0 items-center justify-center rounded-lg ${
                  saved ? "text-amber" : "text-muted hover:text-amber"
                }`}
              >
                <Star className="size-4" fill={saved ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={() => onSelect(station)}
                className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-left ${
                  selected ? "bg-surface-2 ring-1 ring-amber" : "hover:bg-surface-2"
                }`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium">{station.serverName}</span>
                  <span className="shrink-0 font-mono text-xs text-amber">{station.radioName || "radio"}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {place || station.domain}
                  {station.grid ? ` · ${station.grid}` : ""}
                </span>
                {station.transport !== "v0.7" ? (
                  <span className="mt-1 block text-xs text-amber">v0.9 — not supported</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <details className="border-t border-line">
        <summary className="flex h-11 cursor-pointer items-center px-3 text-xs font-medium tracking-wide text-muted">
          Manual endpoint
        </summary>
        <form
          className="space-y-2 px-3 pb-3"
          onSubmit={(event) => {
            event.preventDefault();
            submitManual();
          }}
        >
          <input
            value={host}
            onChange={(event) => setHost(event.target.value)}
            placeholder="host or address"
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs text-muted">
              Control
              <input
                value={controlPort}
                onChange={(event) => setControlPort(event.target.value)}
                inputMode="numeric"
                className="mt-1 h-11 w-full rounded-lg border border-line bg-bg px-3 font-mono text-sm text-fg outline-none focus-visible:border-amber"
              />
            </label>
            <label className="block text-xs text-muted">
              Audio
              <input
                value={audioPort}
                onChange={(event) => setAudioPort(event.target.value)}
                inputMode="numeric"
                className="mt-1 h-11 w-full rounded-lg border border-line bg-bg px-3 font-mono text-sm text-fg outline-none focus-visible:border-amber"
              />
            </label>
          </div>
          {manualError ? <p className="text-xs text-amber">{manualError}</p> : null}
          <button
            type="submit"
            className="h-11 w-full rounded-lg border border-line text-sm font-medium hover:border-amber hover:text-amber"
          >
            Use this endpoint
          </button>
        </form>
      </details>
    </section>
  );
}
