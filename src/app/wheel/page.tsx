"use client";

import { useState } from "react";
import Link from "next/link";
import { SpinWheel, type WheelPrize } from "@/components/spin-wheel";

// Real weights from the admin table, interleaved so colors distribute around the wheel.
// Color system: no-win = neutral dark, free spins = purple ramp, deposit match = green ramp, cash = gold ramp.
const PRIZES: WheelPrize[] = [
  { id: "lose", label: "NO WIN", name: "Better luck next time", weight: 300000, color: "#16162e", win: false },
  { id: "fs10", label: "10 FS", name: "10 Free Spins", weight: 250000, color: "#3b2a63", win: true },
  { id: "m10", label: "+10%", name: "10% Deposit Match", weight: 120000, color: "#0e5c4a", win: true },
  { id: "c100", label: "$100", name: "$100 Cash", weight: 2400, color: "#8a5a12", win: true },
  { id: "fs100", label: "100 FS", name: "100 Free Spins", weight: 180000, color: "#5b34a6", win: true },
  { id: "m20", label: "+20%", name: "20% Deposit Match", weight: 50000, color: "#12805f", win: true },
  { id: "c500", label: "$500", name: "$500 Cash", weight: 500, color: "#b87a16", win: true },
  { id: "fs500", label: "500 FS", name: "500 Free Spins", weight: 60000, color: "#7a3fe0", win: true },
  { id: "m50", label: "+50%", name: "50% Deposit Match", weight: 12000, color: "#17a374", win: true },
  { id: "c1000", label: "$1,000", name: "$1,000 Cash", weight: 99, color: "#e09a1b", darkText: true, win: true },
  { id: "fs1000", label: "1000 FS", name: "1,000 Free Spins", weight: 20000, color: "#a750ff", win: true },
  { id: "m100", label: "+100%", name: "100% Deposit Match", weight: 5000, color: "#1fc98e", win: true },
  { id: "c10000", label: "$10K", name: "$10,000 Cash", weight: 1, color: "#ffc42e", darkText: true, win: true },
];

export default function WheelPage() {
  const [spinsLeft, setSpinsLeft] = useState(2);
  const [result, setResult] = useState<WheelPrize | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 py-10">
      <Link
        href="/"
        className="self-start text-sm text-app-secondary-text transition-colors hover:text-app-main-text"
      >
        &larr; prototypes
      </Link>

      <h1 className="mt-6 text-center text-3xl font-extrabold">Daily Spin Wheel</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-app-secondary-text">
        Spin every day for a chance at free spins, deposit boosts and cash prizes.
      </p>

      <div className="mt-8 w-full max-w-[420px]">
        <SpinWheel
          prizes={PRIZES}
          disabled={spinsLeft === 0}
          onSpinStart={() => setSpinsLeft((s) => s - 1)}
          onDone={setResult}
        />
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-app-light-stroke bg-app-dark-100 px-4 py-1.5 text-sm">
        <span className={`h-2 w-2 rounded-full ${spinsLeft > 0 ? "bg-[#1fc98e]" : "bg-app-secondary-text"}`} />
        {spinsLeft > 0 ? `${spinsLeft} spin${spinsLeft === 1 ? "" : "s"} available` : "No spins left — come back tomorrow"}
      </div>

      <div className="mt-10 w-full rounded-xl border border-app-light-stroke bg-app-dark-100 p-5 text-sm">
        <h2 className="font-semibold">How it works</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-app-secondary-text">
          <li>Deposit once this week to unlock 2 free spins.</li>
          <li>Deposit again the next day for 1 more spin.</li>
          <li>Winnings are added to your Bonus Bank.</li>
        </ul>
      </div>

      <button
        onClick={() => setSpinsLeft(2)}
        className="mt-6 text-xs text-app-secondary-text underline-offset-2 transition-colors hover:text-app-main-text hover:underline"
      >
        demo: reset spins
      </button>

      {result && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-app-light-stroke bg-app-dark-100 p-8 text-center">
            {result.win ? (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-app-purple">You won</p>
                <p className="mt-3 text-3xl font-extrabold">{result.name}</p>
                <p className="mt-3 text-sm text-app-secondary-text">Added to your Bonus Bank.</p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-app-secondary-text">So close</p>
                <p className="mt-3 text-3xl font-extrabold">{result.name}</p>
                <p className="mt-3 text-sm text-app-secondary-text">Come back tomorrow for another spin.</p>
              </>
            )}
            <button
              onClick={() => setResult(null)}
              className="mt-6 w-full rounded-lg bg-gradient-to-b from-[#a750ff] to-[#7226c4] py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
            >
              {result.win ? "Awesome" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
