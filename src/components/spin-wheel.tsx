"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type WheelPrize = {
  id: string;
  label: string; // value shown on the segment
  name: string; // full name for the result screen
  weight: number;
  kind: "lose" | "fs" | "match" | "cash";
  hero?: boolean; // the one glowing gold jackpot segment
  win: boolean;
};

export type SpinWheelHandle = { spin: () => void };

const TURNS = 6;
export const SPIN_MS = 7000;
const SIZE = 400;
const C = SIZE / 2;
const R = 182;
const ICON_R = 144;
const LABEL_R = 98;
const POINTER_DEG = 90; // pointer sits at 3 o'clock

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

// small coin-style icon disc per prize kind
const ICON = {
  lose: { fill: "#1a1440", glyph: "×", glyphFill: "#8a8a8a" },
  fs: { fill: "#a750ff", glyph: "FS", glyphFill: "#ffffff" },
  match: { fill: "#1fc98e", glyph: "%", glyphFill: "#03130d" },
  cash: { fill: "#ffc42e", glyph: "$", glyphFill: "#402c00" },
} as const;

export const SpinWheel = forwardRef<
  SpinWheelHandle,
  {
    prizes: WheelPrize[];
    disabled?: boolean;
    onSpinStart?: () => void;
    onDone: (prize: WheelPrize) => void;
  }
>(function SpinWheel({ prizes, disabled, onSpinStart, onDone }, ref) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const seg = 360 / prizes.length;

  function spin() {
    if (spinning || disabled) return;
    const i = pickWeighted(prizes);
    const prize = prizes[i];
    // land the pointer inside segment i, with some jitter off dead-center
    const center = i * seg + seg / 2;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const landing = (POINTER_DEG - center + jitter + 720) % 360;
    const delta = (landing - (rotation % 360) + 360) % 360;
    setSpinning(true);
    onSpinStart?.();
    setRotation(rotation + TURNS * 360 + delta);
    // resolve on timers, not transitionend — throttled tabs can swallow the event
    timers.current.push(
      setTimeout(() => setBlurred(true), 400),
      setTimeout(() => setBlurred(false), SPIN_MS - 1800),
      setTimeout(() => {
        setSpinning(false);
        onDone(prize);
      }, SPIN_MS + 200),
    );
  }

  useImperativeHandle(ref, () => ({ spin }));

  return (
    <div className="relative aspect-square w-full max-w-[420px]">
      <div
        className="h-full w-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.13, 1), filter 300ms`,
          filter: blurred ? "blur(2.5px)" : "none",
        }}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
          <defs>
            <linearGradient id="fs-brand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff3d8b" />
              <stop offset="100%" stopColor="#a750ff" />
            </linearGradient>
            <linearGradient id="hero-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd86b" />
              <stop offset="55%" stopColor="#f5a623" />
              <stop offset="100%" stopColor="#c47a12" />
            </linearGradient>
            <radialGradient id="sheen" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="72%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.14)" />
            </radialGradient>
          </defs>

          {/* single clean outline */}
          <circle cx={C} cy={C} r={187} fill="none" stroke="rgba(167, 80, 255, 0.45)" strokeWidth={2.5} />

          {prizes.map((p, i) => {
            const a0 = i * seg;
            const a1 = a0 + seg;
            const mid = a0 + seg / 2;
            const iconPos = polar(mid, ICON_R);
            const labelPos = polar(mid, LABEL_R);
            // radial labels, flipped on the left half so they stay readable
            const rot = round(mid > 180 ? mid + 90 : mid - 90);
            const icon = ICON[p.kind];
            const fill = p.hero ? "url(#hero-gold)" : i % 2 ? "#2b2166" : "#221a52";
            return (
              <g key={p.id}>
                <path
                  d={segmentPath(a0, a1)}
                  fill={fill}
                  stroke={p.hero ? "#ffd86b" : "rgba(109, 91, 208, 0.35)"}
                  strokeWidth={p.hero ? 2 : 1.5}
                />
                {p.kind === "fs" ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    transform={`rotate(${rot} ${iconPos.x} ${iconPos.y})`}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="url(#fs-brand)"
                    fontSize={17}
                    fontWeight={800}
                    fontStyle="italic"
                  >
                    FS
                  </text>
                ) : (
                  <>
                    <circle cx={iconPos.x} cy={iconPos.y} r={14} fill={icon.fill} stroke="rgba(0,0,23,0.45)" strokeWidth={2} />
                    <text
                      x={iconPos.x}
                      y={iconPos.y}
                      transform={`rotate(${rot} ${iconPos.x} ${iconPos.y})`}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={icon.glyphFill}
                      fontSize={14}
                      fontWeight={800}
                    >
                      {icon.glyph}
                    </text>
                  </>
                )}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  transform={`rotate(${rot} ${labelPos.x} ${labelPos.y})`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={p.hero ? "#402c00" : p.kind === "lose" ? "#8a8a8a" : "#ffffff"}
                  fontSize={p.label.length > 4 ? 13 : 16}
                  fontWeight={800}
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* subtle radial sheen over the face */}
          <circle cx={C} cy={C} r={R} fill="url(#sheen)" pointerEvents="none" />

        </svg>
      </div>

      {/* pointer, 3 o'clock */}
      <svg
        viewBox="0 0 30 36"
        className="absolute right-[-7px] top-1/2 w-7 -translate-y-1/2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
      >
        <path d="M 28 2 L 28 34 L 3 18 Z" fill="#ff3d8b" stroke="#14102e" strokeWidth={2} />
      </svg>

      {/* gold ring hub: yellow-to-orange ring, inverted gradient disc inside */}
      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="absolute left-1/2 top-1/2 h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,#ffd53e_0%,#f07222_100%)] p-2.5 shadow-[0_0_28px_rgba(245,166,35,0.45)] transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-50"
      >
        <span className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[linear-gradient(180deg,#e85d2e_0%,#ffd53e_100%)] leading-tight text-[#402c00]">
          <span className="text-base font-extrabold tracking-wider">SPIN</span>
          <span className="whitespace-nowrap text-[10px] font-bold tracking-widest">&amp; WIN</span>
        </span>
      </button>
    </div>
  );
});
