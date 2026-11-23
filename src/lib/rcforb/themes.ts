export const THEMES = [
  { id: "amber", label: "Amber night", swatch: "#f0a202" },
  { id: "phosphor", label: "Phosphor", swatch: "#3dff8a" },
  { id: "arctic", label: "Arctic", swatch: "#7ec8ff" },
  { id: "ember", label: "Ember", swatch: "#ff6b3d" },
  { id: "violet", label: "Violet", swatch: "#c9a6ff" },
  { id: "paper", label: "Day paper", swatch: "#9a6200" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}
