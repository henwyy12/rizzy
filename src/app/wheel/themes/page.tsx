"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SpinWheel,
  VARIANTS,
  type VariantName,
} from "@/components/spin-wheel";
import { PRIZES } from "@/lib/wheel-prizes";

// A theme sets the whole wheel at once: the two alternating win-segment
// variants. Jackpot stays gold and no-win stays dead across every theme.
const THEMES: { name: string; a: VariantName; b: VariantName }[] = [
  { name: "Purple", a: "violet", b: "deep-violet" },
  { name: "Ocean", a: "blue", b: "sky" },
  { name: "Candy", a: "pink", b: "magenta" },
  { name: "Emerald", a: "green", b: "deep-violet" },
  { name: "Sunset", a: "ruby", b: "pink" },
];

const swatch = (name: VariantName) => {
  const v = VARIANTS[name];
  return `radial-gradient(circle at 50% 120%, ${v.rim} 25%, ${v.hub} 100%)`;
};

export default function ThemesPage() {
  const [themeIdx, setThemeIdx] = useState(0);
  const [overrides, setOverrides] = useState<Record<string, VariantName>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const theme = THEMES[themeIdx];

  // resolve each segment: manual override wins, else the theme's assignment
  const themeVariant = (
    p: (typeof PRIZES)[number],
    i: number,
  ): VariantName =>
    p.hero ? "gold-hero" : p.kind === "lose" ? "dead" : i % 2 ? theme.a : theme.b;

  const prizes = PRIZES.map((p, i) => ({
    ...p,
    variant: overrides[p.id] ?? themeVariant(p, i),
  }));

  const selected = prizes.find((p) => p.id === selectedId) ?? null;

  function pickTheme(i: number) {
    setThemeIdx(i);
    setOverrides({});
    setSelectedId(null);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold">Wheel theme lab</h1>
        <Link
          href="/wheel"
          className="text-sm text-app-secondary-text transition-colors hover:text-app-main-text"
        >
          view the wheel &rarr;
        </Link>
      </div>
      <p className="mt-1 text-sm text-app-secondary-text">
        Pick a theme to recolour the whole wheel, then click any segment to
        override just that one.
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
        {/* the wheel, frozen for editing */}
        <div className="flex items-center justify-center rounded-3xl border border-app-light-stroke bg-gradient-to-b from-[#0d0930] to-app-dark-100 p-6">
          <div className="w-full max-w-[420px]">
            <SpinWheel
              prizes={prizes}
              frozen
              selectedId={selectedId}
              onSegmentClick={(p) =>
                setSelectedId((cur) => (cur === p.id ? null : p.id))
              }
              onDone={() => {}}
            />
          </div>
        </div>

        {/* controls */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold">Theme</h2>
            <div className="mt-2 flex flex-wrap gap-2">
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

          <div>
            <h2 className="text-sm font-semibold">
              {selected ? `Override: ${selected.name}` : "Override a segment"}
            </h2>
            {selected ? (
              <>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {(Object.keys(VARIANTS) as VariantName[]).map((name) => (
                    <button
                      key={name}
                      title={name}
                      onClick={() =>
                        setOverrides((o) => ({ ...o, [selected.id]: name }))
                      }
                      className={`h-10 rounded-lg border-2 transition-transform hover:scale-105 ${
                        prizes.find((p) => p.id === selected.id)?.variant === name
                          ? "border-white"
                          : "border-transparent"
                      }`}
                      style={{ background: swatch(name) }}
                    />
                  ))}
                </div>
                {overrides[selected.id] && (
                  <button
                    onClick={() =>
                      setOverrides((o) => {
                        const next = { ...o };
                        delete next[selected.id];
                        return next;
                      })
                    }
                    className="mt-3 text-xs text-app-secondary-text underline-offset-2 hover:text-app-main-text hover:underline"
                  >
                    reset to theme
                  </button>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-app-secondary-text">
                Click a segment on the wheel to change its background.
              </p>
            )}
          </div>

          {Object.keys(overrides).length > 0 && (
            <button
              onClick={() => setOverrides({})}
              className="text-xs text-app-secondary-text underline-offset-2 hover:text-app-main-text hover:underline"
            >
              clear all overrides
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
