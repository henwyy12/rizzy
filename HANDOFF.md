# Daily Wheel — handoff notes

For lifting the wheel design into rizzy prod. TL;DR: the wheel is one
self-contained component. The theme lab is a design tool, not production code —
its data is the spec for the admin.

## What to copy (the design)

**`src/components/spin-wheel.tsx`** — the whole wheel. Self-contained React + SVG.
This is the file you want. It exports:

- `SpinWheel` — the component. Props:
  - `prizes: WheelPrize[]` (required)
  - `onDone: (prize) => void` (required — fires when a spin resolves)
  - `onSpinStart?`, `disabled?`
  - `rimVariant?: VariantName` — colour of the outer band
  - design-mode props (ignore for prod): `frozen`, `selectedId`, `onSegmentClick`
- `WheelPrize` — `{ id, label, name, weight, kind, hero?, variant?, icon?, win }`
- `VariantName`, `IconName` — the enums below
- `VARIANTS` — the map of every background variant → `{ hub, rim, text }`

Reference `src/app/wheel/page.tsx` for the surrounding layout (panel, lockup,
legend, result takeover) — copy what you want, it's plain markup.

## The spec for the admin (this is the important part)

The design system is: each segment picks **an icon** + **a background variant**,
and a **theme** is just a preset that assigns variants across all segments.

- **Variants** (`VARIANTS` in the component): each is a depth gradient
  (`hub` → `rim`) plus a `text` colour. Current set: violet, deep-violet,
  gold-hero, dead, green, pink, blue, sky, magenta, ruby, white, orange, red.
- **Icons** (`IconName`): fs, cash, match, lose, none.
- **Themes** (`THEMES` in `src/app/wheel/themes/page.tsx`): `{ a, b, hero, lose }`
  — the two alternating win-segment variants plus the jackpot and no-win ones.

**In the admin, store per wheel:** a theme name + a list of per-prize overrides
`{ prizeId → { icon, background } }`. That's exactly what the theme lab produces.

## What NOT to copy (prototype scaffolding)

- **`src/lib/wheel-theme-store.ts`** — saves the applied design to `localStorage`.
  Replace with the real config from the backend/admin.
- **`src/app/wheel/themes/page.tsx`** — the theme lab is a *design tool* for
  choosing variants/themes. Don't ship it; use its `VARIANTS`/`THEMES` as the spec.
- **`src/lib/wheel-prizes.ts`** — sample prize data. Real prizes come from admin.
- In `wheel/page.tsx`: the hardcoded `spinsLeft = 2`, "demo: reset spins", and
  eligibility copy are placeholders — wire to real spin/eligibility state.

## Dependency notes

- This repo is **Tailwind v4**; prod rizzy is **v3**. The `app-*` utility classes
  are used the same way, but tokens are defined differently — here in
  `globals.css` `@theme`, in prod in `tailwind.config`. Confirm the `app-*` token
  values match (sampled from prod, should be close). Arbitrary-value classes like
  `from-[#a750ff]` work in both.
- **Fonts:** Inter (prod has it) + **Pacifico** for the script "Wheel" word — add
  it, or drop the `font-script` treatment. Needs a `--font-script` token.
- **Keyframes** `tip-in` and `coin-burst` live in `globals.css` — move them over.

## Live demo

https://daily-wheel-sample.vercel.app/wheel — the wheel, with a link to the
theme lab below it.
