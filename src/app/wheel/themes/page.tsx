"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SpinWheel,
  VARIANTS,
  type IconName,
  type VariantName,
} from "@/components/spin-wheel";
import { PRIZES } from "@/lib/wheel-prizes";
import { saveWheelTheme, type SavedWheelTheme } from "@/lib/wheel-theme-store";

// A theme sets the whole wheel at once: the two alternating win-segment
// variants, plus the jackpot and no-win backgrounds.
const THEMES: {
  name: string;
  a: VariantName;
  b: VariantName;
  hero: VariantName;
  lose: VariantName;
}[] = [
  { name: "Purple", a: "violet", b: "deep-violet", hero: "gold-hero", lose: "dead" },
  { name: "Royale", a: "deep-violet", b: "blue", hero: "gold-hero", lose: "dead" },
  { name: "Frost", a: "blue", b: "white", hero: "gold-hero", lose: "dead" },
  { name: "Amber", a: "orange", b: "white", hero: "gold-hero", lose: "dead" },
  { name: "Inferno", a: "red", b: "white", hero: "gold-hero", lose: "dead" },
];

const VARIANT_LABELS: Record<VariantName, string> = {
  violet: "Violet",
  "deep-violet": "Deep violet",
  "gold-hero": "Gold hero",
  dead: "Dead grey",
  green: "Green",
  pink: "Pink",
  blue: "Blue",
  sky: "Sky",
  magenta: "Magenta",
  ruby: "Ruby",
  white: "White",
  orange: "Orange",
  red: "Red",
};

const ICON_OPTIONS: { value: IconName; label: string }[] = [
  { value: "fs", label: "FS" },
  { value: "cash", label: "$ coin" },
  { value: "match", label: "% coin" },
  { value: "lose", label: "× no win" },
  { value: "none", label: "none" },
];

const swatch = (name: VariantName) => {
  const v = VARIANTS[name];
  return `radial-gradient(circle at 50% 120%, ${v.rim} 25%, ${v.hub} 100%)`;
};

const selectCls =
  "w-full rounded-lg border border-app-light-stroke bg-app-dark-200 px-2 py-1.5 text-sm text-app-main-text";

export default function ThemesPage() {
  const [themeIdx, setThemeIdx] = useState(0);
  const [bgOverrides, setBgOverrides] = useState<Record<string, VariantName>>({});
  const [iconOverrides, setIconOverrides] = useState<Record<string, IconName>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const theme = THEMES[themeIdx];

  const themeVariant = (
    p: (typeof PRIZES)[number],
    i: number,
  ): VariantName =>
    p.hero ? theme.hero : p.kind === "lose" ? theme.lose : i % 2 ? theme.a : theme.b;

  const prizes = PRIZES.map((p, i) => ({
    ...p,
    variant: bgOverrides[p.id] ?? themeVariant(p, i),
    icon: iconOverrides[p.id] ?? p.kind,
  }));

  function pickTheme(i: number) {
    setThemeIdx(i);
    setBgOverrides({});
    setIconOverrides({});
    setApplied(false);
  }

  function apply() {
    const segments: SavedWheelTheme["segments"] = {};
    prizes.forEach((p) => {
      segments[p.id] = { variant: p.variant, icon: p.icon };
    });
    saveWheelTheme({ rimVariant: theme.a, segments });
    setApplied(true);
  }

  const dirty =
    Object.keys(bgOverrides).length > 0 || Object.keys(iconOverrides).length > 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Wheel theme lab</h1>
        <div className="flex items-center gap-3">
          {applied ? (
            <Link
              href="/wheel"
              className="text-sm font-medium text-[#1fc98e] transition-colors hover:underline"
            >
              Applied &mdash; view the wheel &rarr;
            </Link>
          ) : (
            <Link
              href="/wheel"
              className="text-sm text-app-secondary-text transition-colors hover:text-app-main-text"
            >
              view the wheel &rarr;
            </Link>
          )}
          <button
            onClick={apply}
            className="rounded-lg bg-gradient-to-b from-[#a750ff] to-[#7226c4] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(167,80,255,0.3)] transition-transform hover:scale-[1.03] active:scale-95"
          >
            Apply to the wheel
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-app-secondary-text">
        Pick a theme to recolour the whole wheel, then fine-tune any prize&rsquo;s
        icon and background in the table.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* the wheel, frozen for editing */}
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-app-light-stroke bg-gradient-to-b from-[#0d0930] to-app-dark-100 p-6">
          <div className="w-full max-w-[360px]">
            <SpinWheel
              prizes={prizes}
              rimVariant={theme.a}
              frozen
              selectedId={selectedId}
              onSegmentClick={(p) =>
                setSelectedId((cur) => (cur === p.id ? null : p.id))
              }
              onDone={() => {}}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => pickTheme(i)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  themeIdx === i
                    ? "border-app-purple bg-app-dark-200 text-app-main-text"
                    : "border-app-light-stroke text-app-secondary-text hover:text-app-main-text"
                }`}
              >
                <span className="flex gap-1">
                  <span className="h-3.5 w-3.5 rounded-full" style={{ background: swatch(t.a) }} />
                  <span className="h-3.5 w-3.5 rounded-full" style={{ background: swatch(t.b) }} />
                </span>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* per-prize table */}
        <div>
          <div className="overflow-hidden rounded-xl border border-app-light-stroke">
            <div className="grid grid-cols-[1.4fr_1fr_1.3fr] gap-3 bg-app-dark-100 px-4 py-2.5 text-xs font-semibold text-app-secondary-text">
              <span>Prize</span>
              <span>Icon</span>
              <span>Background</span>
            </div>
            {prizes.map((p) => (
              <div
                key={p.id}
                onMouseEnter={() => setSelectedId(p.id)}
                onMouseLeave={() => setSelectedId((c) => (c === p.id ? null : c))}
                className={`grid grid-cols-[1.4fr_1fr_1.3fr] items-center gap-3 border-t border-app-light-stroke px-4 py-2.5 ${
                  selectedId === p.id ? "bg-app-dark-200/60" : ""
                }`}
              >
                <span className="text-sm">{p.name}</span>
                <select
                  className={selectCls}
                  value={p.icon}
                  onChange={(e) => {
                    setIconOverrides((o) => ({ ...o, [p.id]: e.target.value as IconName }));
                    setApplied(false);
                  }}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 shrink-0 rounded"
                    style={{ background: swatch(p.variant) }}
                  />
                  <select
                    className={selectCls}
                    value={p.variant}
                    onChange={(e) => {
                      setBgOverrides((o) => ({ ...o, [p.id]: e.target.value as VariantName }));
                      setApplied(false);
                    }}
                  >
                    {(Object.keys(VARIANTS) as VariantName[]).map((name) => (
                      <option key={name} value={name}>
                        {VARIANT_LABELS[name]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {dirty && (
            <button
              onClick={() => {
                setBgOverrides({});
                setIconOverrides({});
              }}
              className="mt-3 text-xs text-app-secondary-text underline-offset-2 hover:text-app-main-text hover:underline"
            >
              reset everything to the theme
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
