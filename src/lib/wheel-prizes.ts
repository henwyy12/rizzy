import type { WheelPrize } from "@/components/spin-wheel";

// Real weights from the admin table, interleaved so prize kinds distribute
// around the wheel. Shared by the product wheel and the theme playground.
export const PRIZES: WheelPrize[] = [
  { id: "lose", label: "NO WIN", name: "Better luck next time", kind: "lose", win: false, weight: 300000 },
  { id: "fs10", label: "10", name: "10 Free Spins", kind: "fs", win: true, weight: 250000 },
  { id: "m10", label: "+10%", name: "10% Deposit Match", kind: "match", win: true, weight: 120000 },
  { id: "c100", label: "$100", name: "$100 Cash", kind: "cash", win: true, weight: 2400 },
  { id: "fs100", label: "100", name: "100 Free Spins", kind: "fs", win: true, weight: 180000 },
  { id: "m20", label: "+20%", name: "20% Deposit Match", kind: "match", win: true, weight: 50000 },
  { id: "c500", label: "$500", name: "$500 Cash", kind: "cash", win: true, weight: 500 },
  { id: "fs500", label: "500", name: "500 Free Spins", kind: "fs", win: true, weight: 60000 },
  { id: "m50", label: "+50%", name: "50% Deposit Match", kind: "match", win: true, weight: 12000 },
  { id: "c1000", label: "$1,000", name: "$1,000 Cash", kind: "cash", win: true, weight: 99 },
  { id: "fs1000", label: "1,000", name: "1,000 Free Spins", kind: "fs", win: true, weight: 20000 },
  { id: "m100", label: "+100%", name: "100% Deposit Match", kind: "match", win: true, weight: 5000 },
  { id: "c10k", label: "$10,000", name: "$10,000 Cash", kind: "cash", win: true, weight: 1, hero: true },
];
