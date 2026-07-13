"use client";

import { useEffect, useRef, useState } from "react";

export type WheelPrize = {
  id: string;
  label: string; // short label on the wheel segment
  name: string; // full name for the result modal
  weight: number;
  color: string;
  darkText?: boolean;
  win: boolean;
};

const TURNS = 6;
const SPIN_MS = 6000;
const SIZE = 400;
const C = SIZE / 2;
const R = 185;
const LABEL_R = 136;

// rounded to avoid SSR/client float serialization mismatches
const round = (n: number) => Math.round(n * 1000) / 1000;

// θ in degrees, clockwise from 12 o'clock
function polar(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: round(C + r * Math.sin(rad)), y: round(C - r * Math.cos(rad)) };
}

function segmentPath(a0: number, a1: number) {
  const p0 = polar(a0, R);
  const p1 = polar(a1, R);
  return `M ${C} ${C} L ${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y} Z`;
}

function pickWeighted(prizes: WheelPrize[]) {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < prizes.length; i++) {
    roll -= prizes[i].weight;
    if (roll <= 0) return i;
  }
  return prizes.length - 1;
}

export function SpinWheel({
  prizes,
  disabled,
  onSpinStart,
  onDone,
}: {
  prizes: WheelPrize[];
  disabled?: boolean;
  onSpinStart?: () => void;
  onDone: (prize: WheelPrize) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  const seg = 360 / prizes.length;

  function spin() {
    if (spinning || disabled) return;
    const i = pickWeighted(prizes);
    const prize = prizes[i];
    // land the pointer inside segment i, with some jitter off dead-center
    const center = i * seg + seg / 2;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const landing = (360 - center + jitter + 360) % 360;
    const delta = (landing - (rotation % 360) + 360) % 360;
    setSpinning(true);
    onSpinStart?.();
    setRotation(rotation + TURNS * 360 + delta);
    // resolve on a timer, not transitionend — throttled tabs can swallow the event
    timer.current = setTimeout(() => {
      setSpinning(false);
      onDone(prize);
    }, SPIN_MS + 200);
  }

  return (
    <div className="relative aspect-square w-full max-w-[420px]">
      <div
        className="h-full w-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.13, 1)`,
        }}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
          {/* outer rim */}
          <circle cx={C} cy={C} r={196} fill="none" stroke="#14142f" strokeWidth={10} />
          {prizes.map((p, i) => {
            const a0 = i * seg;
            const a1 = a0 + seg;
            const mid = a0 + seg / 2;
            const pos = polar(mid, LABEL_R);
            // radial labels, flipped on the left half so they stay readable
            const rot = round(mid > 180 ? mid + 90 : mid - 90);
            return (
              <g key={p.id}>
                <path d={segmentPath(a0, a1)} fill={p.color} stroke="#000017" strokeWidth={2} />
                <text
                  x={pos.x}
                  y={pos.y}
                  transform={`rotate(${rot} ${pos.x} ${pos.y})`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={p.darkText ? "#000017" : "#ffffff"}
                  fontSize={15}
                  fontWeight={700}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
          {/* rim lights, one per segment boundary */}
          {prizes.map((p, i) => {
            const pos = polar(i * seg, 196);
            return <circle key={p.id} cx={pos.x} cy={pos.y} r={3.5} fill={i % 2 ? "#a750ff" : "#ffc42e"} />;
          })}
          {/* hub */}
          <circle cx={C} cy={C} r={50} fill="#0f0f2a" stroke="rgba(167, 80, 255, 0.4)" strokeWidth={2} />
        </svg>
      </div>

      {/* pointer */}
      <svg
        viewBox="0 0 36 30"
        className="absolute left-1/2 top-[-6px] w-9 -translate-x-1/2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
      >
        <path d="M 2 2 L 34 2 L 18 28 Z" fill="#ffc42e" stroke="#000017" strokeWidth={2} />
      </svg>

      {/* spin button over the hub */}
      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="absolute left-1/2 top-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#a750ff] to-[#7226c4] text-sm font-extrabold tracking-widest text-white shadow-[0_0_24px_rgba(167,80,255,0.45)] transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-40"
      >
        SPIN
      </button>
    </div>
  );
}
