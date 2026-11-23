export function formatFrequency(text: string | null | undefined): { digits: string; unit: string } {
  if (!text) return { digits: "—.——————", unit: "" };
  if (!/^\d+$/.test(text)) return { digits: text, unit: "" };
  const hz = Number(text);
  if (!Number.isFinite(hz)) return { digits: text, unit: "" };
  return { digits: (hz / 1_000_000).toFixed(6), unit: "MHz" };
}

export function parseMeter(raw: string): { label: string; value: number; max: number } | null {
  const parts = raw.split(",");
  if (parts.length < 3) return null;
  const value = Number(parts[1]);
  const max = Number(parts[2]);
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return null;
  return { label: parts[0] || "S", value: Math.max(0, value), max };
}

export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}
