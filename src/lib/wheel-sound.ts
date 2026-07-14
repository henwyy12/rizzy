// Web Audio wheel sounds — generated, no audio files. A ticking blip per
// segment as the wheel passes it, plus win/lose stingers.

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

// call on a user gesture (the spin click) so the browser lets audio play
export function unlockSound() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
}

export function setMuted(m: boolean) {
  muted = m;
}

function blip(
  freq: number,
  dur: number,
  type: OscillatorType = "square",
  gain = 0.08,
) {
  const c = getCtx();
  if (!c || muted) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export function playTick() {
  blip(1150, 0.03, "square", 0.06);
}

export function playWin() {
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => blip(f, 0.18, "triangle", 0.12), i * 90),
  );
}

export function playLose() {
  [392, 294].forEach((f, i) =>
    setTimeout(() => blip(f, 0.24, "sine", 0.1), i * 140),
  );
}
