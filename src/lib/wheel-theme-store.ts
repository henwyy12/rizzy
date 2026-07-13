import type { IconName, VariantName } from "@/components/spin-wheel";

// The design the theme lab applies to the home wheel. Persisted in the browser
// (no backend yet) — good enough to demo the flow end to end.
export type SavedWheelTheme = {
  rimVariant: VariantName;
  segments: Record<string, { variant: VariantName; icon: IconName }>;
};

const KEY = "rizzy-wheel-theme";

export function saveWheelTheme(theme: SavedWheelTheme) {
  try {
    localStorage.setItem(KEY, JSON.stringify(theme));
  } catch {
    // storage unavailable — nothing to do
  }
}

export function loadWheelTheme(): SavedWheelTheme | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedWheelTheme) : null;
  } catch {
    return null;
  }
}
