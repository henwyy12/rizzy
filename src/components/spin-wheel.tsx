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
  variant?: VariantName; // segment background; falls back to the default alternation
  icon?: IconName; // segment icon; falls back to the one implied by kind
  win: boolean;
};

// Icons a segment can show; defaults to the one matching its kind.
export type IconName = "fs" | "cash" | "match" | "lose" | "none";

export type SpinWheelHandle = { spin: () => void };

// A "variant" is a named segment background. Each is a depth gradient — darker
// at the hub, brighter at the rim — so no segment can end up looking flat.
export type VariantName =
  | "violet"
  | "deep-violet"
  | "gold-hero"
  | "dead"
  | "green"
  | "pink"
  | "blue"
  | "sky"
  | "magenta"
  | "ruby"
  | "white"
  | "orange"
  | "red";

// hub/rim are the gradient stops; text is the label colour that reads on it.
export const VARIANTS: Record<VariantName, { hub: string; rim: string; text: string }> = {
  violet: { hub: "#5b2bb8", rim: "#7b46f0", text: "#ffffff" },
  "deep-violet": { hub: "#2a1770", rim: "#4527c9", text: "#ffffff" },
  "gold-hero": { hub: "#c47a12", rim: "#ffd15e", text: "#402c00" },
  dead: { hub: "#1e1b38", rim: "#2a2648", text: "#8a8a8a" },
  green: { hub: "#0c5a41", rim: "#1fc98e", text: "#ffffff" },
  pink: { hub: "#a01e5a", rim: "#ff5aa0", text: "#ffffff" },
  blue: { hub: "#123a8a", rim: "#3a7bff", text: "#ffffff" },
  sky: { hub: "#0e6a8a", rim: "#2fd0e0", text: "#ffffff" },
  magenta: { hub: "#7a1a8a", rim: "#e04ad0", text: "#ffffff" },
  ruby: { hub: "#8a1a2a", rim: "#ff4d6a", text: "#ffffff" },
  white: { hub: "#cfd8ea", rim: "#ffffff", text: "#16204a" },
  orange: { hub: "#b5560a", rim: "#ff9d2e", text: "#ffffff" },
  red: { hub: "#8f1414", rim: "#ff4433", text: "#ffffff" },
};

// Resolve the background variant for a segment: explicit variant wins, else the
// default look (gold jackpot, dead no-win, alternating violets).
function resolveVariant(p: WheelPrize, i: number): VariantName {
  if (p.variant) return p.variant;
  if (p.hero) return "gold-hero";
  if (p.kind === "lose") return "dead";
  return i % 2 ? "violet" : "deep-violet";
}

const TURNS = 6;
export const SPIN_MS = 7000;
const SIZE = 400;
const C = SIZE / 2;
const R = 180; // outer radius of segments
const INNER_R = 56; // segments stop at the hub instead of the center
const CORNER = 5; // segment corner radius (via round stroke)
const GAP = 5; // px gap between segments
const ICON_R = 150;
const LABEL_R = 100;
const POINTER_DEG = 90; // pointer sits at 3 o'clock

// rounded to avoid SSR/client float serialization mismatches
const round = (n: number) => Math.round(n * 1000) / 1000;

// θ in degrees, clockwise from 12 o'clock
function polar(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: round(C + r * Math.sin(rad)), y: round(C - r * Math.cos(rad)) };
}

// annular segment with parallel-edged gaps; drawn inset by CORNER, then a
// round-join stroke of 2*CORNER grows it back out with rounded corners
const R_OUT = R - CORNER;
const R_IN = INNER_R + CORNER;
const insetDeg = (r: number) => (((GAP / 2 + CORNER) / r) * 180) / Math.PI;

function segmentPath(a0: number, a1: number) {
  const o0 = a0 + insetDeg(R_OUT);
  const o1 = a1 - insetDeg(R_OUT);
  const i0 = a0 + insetDeg(R_IN);
  const i1 = a1 - insetDeg(R_IN);
  const A = polar(o0, R_OUT);
  const B = polar(o1, R_OUT);
  const D = polar(i1, R_IN);
  const E = polar(i0, R_IN);
  return `M ${A.x} ${A.y} A ${R_OUT} ${R_OUT} 0 0 1 ${B.x} ${B.y} L ${D.x} ${D.y} A ${R_IN} ${R_IN} 0 0 0 ${E.x} ${E.y} Z`;
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
    // rim (outer band) colour; falls back to the default purple rim
    rimVariant?: VariantName;
    // design mode: freeze drift/spin and let segments be clicked for editing
    frozen?: boolean;
    selectedId?: string | null;
    onSegmentClick?: (prize: WheelPrize) => void;
  }
>(function SpinWheel(
  {
    prizes,
    disabled,
    onSpinStart,
    onDone,
    rimVariant,
    frozen,
    selectedId,
    onSegmentClick,
  },
  ref,
) {
  const [spinning, setSpinning] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [hovered, setHovered] = useState<WheelPrize | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // rotation lives outside React state: the idle drift updates it every frame
  const wheelEl = useRef<HTMLDivElement>(null);
  const rot = useRef(0);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // slow idle drift while not spinning
  useEffect(() => {
    if (spinning || frozen) return;
    const el = wheelEl.current;
    if (!el) return;
    el.style.transition = "none";
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      rot.current += (t - last) * 0.003; // ~3 degrees per second
      last = t;
      el.style.transform = `rotate(${rot.current}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinning, frozen]);

  const seg = 360 / prizes.length;

  function spin() {
    if (spinning || disabled || frozen) return;
    const el = wheelEl.current;
    if (!el) return;
    const i = pickWeighted(prizes);
    const prize = prizes[i];
    // land the pointer inside segment i, with some jitter off dead-center
    const center = i * seg + seg / 2;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const landing = (POINTER_DEG - center + jitter + 720) % 360;
    const delta = (landing - (rot.current % 360) + 360) % 360;
    setSpinning(true);
    setHovered(null);
    onSpinStart?.();
    rot.current += TURNS * 360 + delta;
    el.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.13, 1)`;
    void el.offsetWidth; // flush so the transition starts from the idle angle
    el.style.transform = `rotate(${rot.current}deg)`;
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
    <div
      className="relative aspect-square w-full max-w-[540px]"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      <div ref={wheelEl} className="h-full w-full">
        <div
          className="h-full w-full"
          style={{
            filter: blurred ? "blur(2.5px)" : "none",
            transition: "filter 300ms",
          }}
        >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
          <defs>
            <symbol id="usd-coin" viewBox="0 0 16 16">
              <path d="M0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z" fill="#2A9F2F" />
              <path d="M7.57055 10.6411V8.29905C6.76892 8.09037 6.17996 7.77548 5.80368 7.35439C5.43149 6.92957 5.2454 6.41532 5.2454 5.81163C5.2454 5.20048 5.45603 4.68809 5.8773 4.27446C6.30266 3.85709 6.86708 3.61673 7.57055 3.55338V3H8.46012V3.55338C9.11043 3.62418 9.62781 3.82728 10.0123 4.16266C10.3967 4.49432 10.6421 4.93963 10.7485 5.4986L9.19632 5.68306C9.10225 5.24334 8.85685 4.94522 8.46012 4.78871V6.97429C9.44172 7.21651 10.1104 7.5314 10.4663 7.91895C10.8221 8.30278 11 8.79653 11 9.40022C11 10.0747 10.7751 10.643 10.3252 11.1051C9.87935 11.5672 9.25767 11.8504 8.46012 11.9547V13H7.57055V11.9827C6.86299 11.9044 6.28834 11.6641 5.84663 11.2616C5.40491 10.8591 5.1227 10.2909 5 9.55674L6.60123 9.40022C6.66667 9.69834 6.78937 9.95547 6.96933 10.1716C7.14928 10.3877 7.34969 10.5443 7.57055 10.6411ZM7.57055 4.77194C7.32924 4.84647 7.13701 4.97317 6.99387 5.15204C6.85072 5.33091 6.77914 5.52841 6.77914 5.74455C6.77914 5.94205 6.84458 6.12651 6.97546 6.29793C7.10634 6.46562 7.3047 6.60164 7.57055 6.70598V4.77194ZM8.46012 10.7194C8.76687 10.6672 9.01636 10.5387 9.20859 10.3337C9.40082 10.125 9.49693 9.88094 9.49693 9.60145C9.49693 9.35178 9.41513 9.13751 9.25153 8.95864C9.09202 8.77604 8.82822 8.6363 8.46012 8.53941V10.7194Z" fill="#ffffff" />
            </symbol>
            <linearGradient id="fs-brand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff3d8b" />
              <stop offset="100%" stopColor="#a750ff" />
            </linearGradient>
            {/* one depth gradient per segment, from its resolved variant */}
            {prizes.map((p, i) => {
              const v = VARIANTS[resolveVariant(p, i)];
              return (
                <radialGradient key={p.id} id={`seg-${i}`} gradientUnits="userSpaceOnUse" cx={C} cy={C} r={R}>
                  <stop offset="35%" stopColor={v.hub} />
                  <stop offset="100%" stopColor={v.rim} />
                </radialGradient>
              );
            })}
            <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={rimVariant ? VARIANTS[rimVariant].rim : "#6d5bd0"} />
              <stop offset="100%" stopColor={rimVariant ? VARIANTS[rimVariant].hub : "#2b2166"} />
            </linearGradient>
            <radialGradient id="sheen" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="72%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.14)" />
            </radialGradient>
          </defs>

          {/* rim: thick gradient band around the segments */}
          <circle cx={C} cy={C} r={193} fill="none" stroke="url(#rim)" strokeWidth={10} />

          {prizes.map((p, i) => {
            const a0 = i * seg;
            const a1 = a0 + seg;
            const mid = a0 + seg / 2;
            const iconPos = polar(mid, ICON_R);
            const labelPos = polar(mid, LABEL_R);
            // radial labels, flipped on the left half so they stay readable
            const rot = round(mid > 180 ? mid + 90 : mid - 90);
            const iconName = p.icon ?? p.kind;
            const textColor = VARIANTS[resolveVariant(p, i)].text;
            const fill = `url(#seg-${i})`;
            const selected = selectedId === p.id;
            const dimmed = onSegmentClick
              ? selectedId != null && !selected
              : hovered != null && hovered.id !== p.id;
            return (
              <g
                key={p.id}
                onMouseEnter={() => !spinning && !onSegmentClick && setHovered(p)}
                onMouseLeave={() => setHovered((h) => (h?.id === p.id ? null : h))}
                onClick={() => onSegmentClick?.(p)}
                style={{
                  cursor: onSegmentClick ? "pointer" : "default",
                  filter: hovered?.id === p.id || selected ? "brightness(1.3)" : "none",
                  opacity: dimmed ? 0.55 : 1,
                  transition: "filter 150ms, opacity 150ms",
                }}
              >
                <path
                  d={segmentPath(a0, a1)}
                  fill={fill}
                  stroke={selected ? "#ffffff" : fill}
                  strokeWidth={selected ? CORNER * 2 + 1 : CORNER * 2}
                  strokeLinejoin="round"
                />
                {iconName === "none" ? null : iconName === "fs" ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    transform={`rotate(${rot} ${iconPos.x} ${iconPos.y})`}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="url(#fs-brand)"
                    stroke="#160a24"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    paintOrder="stroke"
                    fontSize={14}
                    fontWeight={800}
                    fontStyle="italic"
                  >
                    FS
                  </text>
                ) : iconName === "lose" ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    transform={`rotate(${rot} ${iconPos.x} ${iconPos.y})`}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ff4d4d"
                    fontSize={18}
                    fontWeight={800}
                  >
                    ×
                  </text>
                ) : iconName === "cash" ? (
                  <use
                    href="#usd-coin"
                    x={iconPos.x - 11}
                    y={iconPos.y - 11}
                    width={22}
                    height={22}
                    transform={`rotate(${rot} ${iconPos.x} ${iconPos.y})`}
                  />
                ) : (
                  <>
                    <circle cx={iconPos.x} cy={iconPos.y} r={11} fill={ICON[iconName].fill} stroke="rgba(0,0,23,0.45)" strokeWidth={2} />
                    <text
                      x={iconPos.x}
                      y={iconPos.y}
                      transform={`rotate(${rot} ${iconPos.x} ${iconPos.y})`}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={ICON[iconName].glyphFill}
                      fontSize={11.5}
                      fontWeight={800}
                    >
                      {ICON[iconName].glyph}
                    </text>
                  </>
                )}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  transform={`rotate(${rot} ${labelPos.x} ${labelPos.y})`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize={p.label.length > 6 ? 12.5 : p.label.length > 4 ? 13.5 : 16}
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
      </div>

      {/* hover tooltip with the full prize name (desktop only — no hover on touch) */}
      {hovered && !spinning && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[140%]"
          style={{ left: mouse.x, top: mouse.y }}
        >
          <div
            className="whitespace-nowrap rounded-lg border border-app-light-stroke bg-app-dark-100/95 px-3 py-1.5 text-sm font-semibold text-app-main-text shadow-[0_4px_16px_rgba(0,0,23,0.6)]"
            style={{ animation: "tip-in 150ms ease-out" }}
          >
            {hovered.name}
          </div>
        </div>
      )}

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
        <span className="flex h-full w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#e85d2e_0%,#ffd53e_100%)] shadow-[inset_0_0_0_2px_rgba(194,65,12,0.4)]">
          <span className="text-lg font-extrabold italic tracking-tight text-white [text-shadow:0_1px_3px_rgba(139,69,10,0.6)]">
            SPIN
          </span>
        </span>
      </button>
    </div>
  );
});
