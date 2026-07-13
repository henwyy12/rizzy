"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SpinWheel, type WheelPrize } from "@/components/spin-wheel";
import { PRIZES } from "@/lib/wheel-prizes";
import { loadWheelTheme, type SavedWheelTheme } from "@/lib/wheel-theme-store";

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

// headline matches the prize type — "you win" reads like cash, so free spins
// and deposit matches get their own framing
function headlineFor(p: WheelPrize | null) {
  if (!p) return "";
  if (!p.win) return "Better luck next time";
  if (p.kind === "fs") return "Free spins!";
  if (p.kind === "match") return "Deposit boost!";
  return "You win!"; // cash
}

const FAQ = [
  {
    q: "How do I earn spins?",
    a: "Deposit once this week to unlock 2 free spins. Deposit again the next day to earn 1 more spin.",
  },
  {
    q: "What can I win?",
    a: "Free spins, deposit matches and cash prizes — everything you see on the wheel, up to $10,000.",
  },
  {
    q: "Where do my winnings go?",
    a: "Winnings are added to your Bonus Bank automatically after every spin.",
  },
];

export default function WheelPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(2);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelPrize | null>(null);
  // design applied from the theme lab (browser-persisted); null = default look
  const [saved, setSaved] = useState<SavedWheelTheme | null>(null);

  useEffect(() => setSaved(loadWheelTheme()), []);

  const prizes = saved
    ? PRIZES.map((p) => ({
        ...p,
        variant: saved.segments[p.id]?.variant,
        icon: saved.segments[p.id]?.icon,
      }))
    : PRIZES;

  // on spin, the lockup slides up and the bottom chrome slides down so the
  // wheel takes over the frame
  const slideUp = `transition-all duration-500 ${spinning ? "-translate-y-8 opacity-0" : "translate-y-0 opacity-100"}`;
  const slideDown = `transition-all duration-500 ${spinning ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"}`;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-8">
      {/* modal-style panel, like the reference */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-app-light-stroke bg-gradient-to-b from-[#0d0930] to-app-dark-100 px-5 py-8">
        {/* ambient glows */}
        <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-app-purple/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-[#ff3d8b]/10 blur-3xl" />

        <div className="relative flex flex-col items-center">
          {/* logo lockup */}
          <h1 className={`flex items-baseline gap-2 ${slideUp}`}>
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
              rimVariant={saved?.rimVariant}
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
            className={`mt-6 flex items-center gap-2.5 rounded-full border border-app-light-stroke bg-app-dark-100/80 px-6 py-2.5 text-base font-semibold ${slideDown}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${spinsLeft > 0 ? "bg-[#1fc98e] shadow-[0_0_8px_rgba(31,201,142,0.8)]" : "bg-app-secondary-text"}`} />
            {spinsLeft > 0 ? (
              <span className="text-[#1fc98e]">
                {spinsLeft} spin{spinsLeft === 1 ? "" : "s"} available
              </span>
            ) : (
              <span className="text-app-secondary-text">No spins left — come back tomorrow</span>
            )}
          </div>

          {/* prize legend, like the reference's bottom strip */}
          <div className={`mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-app-secondary-text ${slideDown}`}>
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

      {/* how-it-works accordion, styled like the vip-club FAQ */}
      <div className={`mt-6 w-full space-y-3 ${slideDown}`}>
        {FAQ.map((item, i) => (
          <div key={item.q} className="rounded-xl border border-app-light-stroke bg-app-dark-100">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold"
            >
              {item.q}
              <svg
                viewBox="0 0 16 16"
                className={`h-4 w-4 shrink-0 text-app-secondary-text transition-transform duration-300 ${openFaq === i ? "rotate-90" : ""}`}
              >
                <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300"
              style={{ gridTemplateRows: openFaq === i ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="mx-5 border-t border-app-light-stroke py-4">
                  <p className="text-sm text-app-secondary-text">{item.a}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setSpinsLeft(2)}
        className={`mt-5 text-xs text-app-secondary-text underline-offset-2 transition-colors hover:text-app-main-text hover:underline ${slideDown}`}
      >
        demo: reset spins
      </button>

      <Link
        href="/wheel/themes"
        className={`mt-2 text-xs text-app-purple underline-offset-2 transition-colors hover:text-app-main-text hover:underline ${slideDown}`}
      >
        open the theme design lab &rarr;
      </Link>

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

          <div className="relative flex w-full max-w-md flex-col items-center text-center">
            <p
              className={`font-extrabold uppercase italic tracking-tight text-white [text-shadow:0_0_40px_rgba(167,80,255,0.9),0_0_12px_rgba(255,255,255,0.4)] ${
                result.win ? "text-7xl sm:text-8xl" : "text-5xl sm:text-6xl"
              }`}
            >
              {headlineFor(result)}
            </p>
            {/* wins get the prize chip + bonus-bank note; a loss is headline only */}
            {result.win && (
              <>
                <div className="mt-8 rounded-2xl bg-gradient-to-b from-[#c88bff] via-[#a855ff] to-[#6a1fc4] p-[2px] shadow-[0_0_44px_rgba(167,80,255,0.55)]">
                  <div className="rounded-[14px] bg-gradient-to-b from-[#1c1140] to-[#120a2e] px-9 py-4">
                    <span className="bg-gradient-to-b from-white to-[#dcc6ff] bg-clip-text text-2xl font-extrabold text-transparent">
                      {result.name}
                    </span>
                  </div>
                </div>
                <p className="mt-6 text-sm text-app-secondary-text">
                  Added to your account — ready to use.
                </p>
              </>
            )}
            <button
              onClick={() => setResult(null)}
              className="mt-8 w-full max-w-[240px] rounded-xl bg-[#7f0ff0] px-4 py-3 font-bold text-white transition-colors hover:bg-[#8f22ff] active:scale-[0.98]"
            >
              {result.win ? "Awesome" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
