"use client";

import { useState } from "react";
import Link from "next/link";
import { SpinWheel, type WheelPrize } from "@/components/spin-wheel";

// Real weights from the admin table (normal + juiced), interleaved so prize
// kinds distribute around the wheel.
type Prize = WheelPrize & { juiced: number };

const PRIZES: Prize[] = [
  { id: "lose", label: "NO WIN", name: "Better luck next time", kind: "lose", win: false, weight: 300000, juiced: 100000 },
  { id: "fs10", label: "10", name: "10 Free Spins", kind: "fs", win: true, weight: 250000, juiced: 300000 },
  { id: "m10", label: "+10%", name: "10% Deposit Match", kind: "match", win: true, weight: 120000, juiced: 130000 },
  { id: "c100", label: "$100", name: "$100 Cash", kind: "cash", win: true, weight: 2400, juiced: 3000 },
  { id: "fs100", label: "100", name: "100 Free Spins", kind: "fs", win: true, weight: 180000, juiced: 250000 },
  { id: "m20", label: "+20%", name: "20% Deposit Match", kind: "match", win: true, weight: 50000, juiced: 60000 },
  { id: "c500", label: "$500", name: "$500 Cash", kind: "cash", win: true, weight: 500, juiced: 700 },
  { id: "fs500", label: "500", name: "500 Free Spins", kind: "fs", win: true, weight: 60000, juiced: 100000 },
  { id: "m50", label: "+50%", name: "50% Deposit Match", kind: "match", win: true, weight: 12000, juiced: 18000 },
  { id: "c1000", label: "$1,000", name: "$1,000 Cash", kind: "cash", win: true, weight: 99, juiced: 200 },
  { id: "fs1000", label: "1,000", name: "1,000 Free Spins", kind: "fs", win: true, weight: 20000, juiced: 30000 },
  { id: "m100", label: "+100%", name: "100% Deposit Match", kind: "match", win: true, weight: 5000, juiced: 8000 },
  { id: "c10k", label: "$10,000", name: "$10,000 Cash", kind: "cash", win: true, weight: 1, juiced: 1, hero: true },
];

// deterministic burst pattern for the result screen (SSR-safe)
const COINS = [
  { dx: -150, dy: -190, size: 26, delay: 0, gold: true },
  { dx: 130, dy: -230, size: 34, delay: 90, gold: false },
  { dx: 210, dy: -90, size: 24, delay: 40, gold: true },
  { dx: -230, dy: -60, size: 30, delay: 140, gold: false },
  { dx: -180, dy: 130, size: 22, delay: 60, gold: true },
  { dx: 190, dy: 150, size: 28, delay: 120, gold: true },
  { dx: 60, dy: 230, size: 24, delay: 30, gold: false },
  { dx: -70, dy: -250, size: 22, delay: 170, gold: true },
  { dx: 250, dy: 30, size: 20, delay: 10, gold: false },
  { dx: -110, dy: 220, size: 26, delay: 100, gold: true },
];

export default function WheelPage() {
  const [mode, setMode] = useState<"normal" | "juiced">("normal");
  const [spinsLeft, setSpinsLeft] = useState(2);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelPrize | null>(null);

  const prizes = PRIZES.map((p) => ({
    ...p,
    weight: mode === "juiced" ? p.juiced : p.weight,
  }));

  const chrome = `transition-opacity duration-500 ${spinning ? "opacity-0" : "opacity-100"}`;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-8">
      <Link
        href="/"
        className="self-start text-sm text-app-secondary-text transition-colors hover:text-app-main-text"
      >
        &larr; prototypes
      </Link>

      {/* modal-style panel, like the reference */}
      <div className="relative mt-4 w-full overflow-hidden rounded-3xl border border-app-light-stroke bg-gradient-to-b from-[#0d0930] to-app-dark-100 px-5 py-8">
        {/* ambient glows */}
        <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-app-purple/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-[#ff3d8b]/10 blur-3xl" />

        <div className="relative flex flex-col items-center">
          {/* normal / juiced tabs, standing in for the reference's tier tabs */}
          <div className={`flex rounded-xl bg-app-dark-200/70 p-1 ${chrome}`}>
            {(["normal", "juiced"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={spinning}
                className={`rounded-lg px-5 py-1.5 text-sm font-semibold capitalize transition-colors ${
                  mode === m
                    ? "bg-gradient-to-b from-[#a750ff] to-[#7226c4] text-white"
                    : "text-app-secondary-text hover:text-app-main-text"
                }`}
              >
                {m}
                {m === "juiced" && (
                  <span className="ml-1.5 rounded bg-[#ffc42e] px-1 py-px text-[9px] font-extrabold text-[#402c00] align-middle">
                    VIP
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* logo lockup */}
          <h1 className="mt-5 flex items-baseline gap-2">
            <span className="bg-gradient-to-r from-[#ff3d8b] to-[#a750ff] bg-clip-text text-4xl font-extrabold italic tracking-tight text-transparent sm:text-6xl">
              DAILY
            </span>
            <span className="font-script text-4xl text-white [text-shadow:0_0_24px_rgba(167,80,255,0.8)] sm:text-6xl">
              Wheel
            </span>
          </h1>

          <div className="mt-1 w-full max-w-[540px]">
            <SpinWheel
              prizes={prizes}
              disabled={spinsLeft === 0}
              onSpinStart={() => {
                setSpinning(true);
                setSpinsLeft((s) => s - 1);
              }}
              onDone={(p) => {
                setSpinning(false);
                setResult(p);
              }}
            />
          </div>

          <div
            className={`mt-6 flex items-center gap-2.5 rounded-full border border-app-light-stroke bg-app-dark-100/80 px-6 py-2.5 text-base font-semibold ${chrome}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${spinsLeft > 0 ? "bg-[#1fc98e] shadow-[0_0_8px_rgba(31,201,142,0.8)]" : "bg-app-secondary-text"}`} />
            {spinsLeft > 0 ? (
              <span>
                <span className="text-app-main-text">{spinsLeft}</span>{" "}
                <span className="text-app-secondary-text">spin{spinsLeft === 1 ? "" : "s"} available</span>
              </span>
            ) : (
              <span className="text-app-secondary-text">No spins left — come back tomorrow</span>
            )}
          </div>

          {/* prize legend, like the reference's bottom strip */}
          <div className={`mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-app-secondary-text ${chrome}`}>
            <span className="flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-[#ff3d8b] to-[#a750ff] bg-clip-text text-sm font-extrabold italic text-transparent">
                FS
              </span>
              up to <span className="font-bold text-app-main-text">1,000 free spins</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-[#1fc98e] text-[10px] font-extrabold text-[#03130d]">
                %
              </span>
              up to <span className="font-bold text-app-main-text">100% deposit match</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg width={18} height={18} viewBox="0 0 16 16">
                <use href="#usd-coin" />
              </svg>
              up to <span className="font-bold text-app-main-text">$10,000 cash</span>
            </span>
          </div>
        </div>
      </div>

      <div className={`mt-6 w-full rounded-xl border border-app-light-stroke bg-app-dark-100 p-5 text-sm ${chrome}`}>
        <h2 className="font-semibold">How it works</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-app-secondary-text">
          <li>Deposit once this week to unlock 2 free spins.</li>
          <li>Deposit again the next day for 1 more spin.</li>
          <li>Winnings are added to your Bonus Bank.</li>
        </ul>
      </div>

      <button
        onClick={() => setSpinsLeft(2)}
        className={`mt-5 text-xs text-app-secondary-text underline-offset-2 transition-colors hover:text-app-main-text hover:underline ${chrome}`}
      >
        demo: reset spins
      </button>

      {/* result takeover */}
      {result && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#1b1145_0%,#000017_75%)] p-6">
          {result.win &&
            COINS.map((c, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 rounded-full border-2"
                style={{
                  width: c.size,
                  height: c.size,
                  background: c.gold
                    ? "radial-gradient(circle at 35% 30%, #ffe9a8, #ffc42e 50%, #b87a16)"
                    : "radial-gradient(circle at 35% 30%, #d9b3ff, #a750ff 50%, #6d28d9)",
                  borderColor: c.gold ? "#8a5a12" : "#4c1d95",
                  animation: `coin-burst 1.6s cubic-bezier(0.2, 0.7, 0.3, 1) ${c.delay}ms forwards`,
                  ["--dx" as string]: `${c.dx}px`,
                  ["--dy" as string]: `${c.dy}px`,
                }}
              />
            ))}

          <div className="relative flex w-full max-w-sm flex-col items-center text-center">
            <p className="font-script -rotate-6 text-7xl text-white [text-shadow:0_0_40px_rgba(167,80,255,0.9),0_0_12px_rgba(255,255,255,0.4)]">
              {result.win ? "You Win" : "So Close"}
            </p>
            <div
              className="mt-8 bg-gradient-to-r from-[#7226c4] via-[#a750ff] to-[#7226c4] px-10 py-2.5 text-xl font-extrabold text-white"
              style={{ clipPath: "polygon(7% 0, 93% 0, 100% 50%, 93% 100%, 7% 100%, 0 50%)" }}
            >
              {result.name}
            </div>
            <p className="mt-6 text-sm text-app-secondary-text">
              {result.win
                ? "Added to your Bonus Bank — use it on any game."
                : "Come back tomorrow for another spin."}
            </p>
            <button
              onClick={() => setResult(null)}
              className="mt-8 w-full max-w-[240px] rounded-full bg-gradient-to-b from-[#a750ff] to-[#7226c4] py-3 font-bold text-white shadow-[0_0_28px_rgba(167,80,255,0.35)] transition-transform hover:scale-[1.03] active:scale-95"
            >
              {result.win ? "Awesome" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
