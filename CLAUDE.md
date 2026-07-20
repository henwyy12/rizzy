@AGENTS.md

# rizzy — Daily Wheel prototype

UI prototype of the Daily Spin Wheel for rizzy. The design lives in one
component; everything else is scaffolding to demo it. Next 16, React 19,
Tailwind v4.

## Two features live here (independent of each other)

**1. Daily Wheel** — `/wheel`
- **The design (ship this):** `src/components/spin-wheel.tsx` — the whole wheel,
  self-contained React + SVG.
- **The product page:** `src/app/wheel/page.tsx` — wheel + legend + FAQ + result
  screen. Layout markup; copy what's useful.
- **The design tool (do NOT ship):** `src/app/wheel/themes/page.tsx` — a "theme
  lab" for choosing colours. Its `THEMES` + the component's `VARIANTS` are the
  **spec for the admin**, not production code.

**2. Sidemenu** — `/sidebar`
- `src/components/side-menu.tsx` — 240px sidebar built to the Figma
  ([node 28639-475767](https://www.figma.com/design/ugQ46NzYO1Q9wVRPuFRxC6/Rizzy-NEW?node-id=28639-475767)).
  `src/app/sidebar/page.tsx` is just a demo shell around it.
- Structure: logo → search → (Lobby / Favourites / Recently Played) → Promotions
  (expandable) → 13 game links → (VIP Club / Affiliate / Live Support / language).
- Spec: 240px wide, 48px rows, 6px radius, Inter 14px semibold (`-0.28px`
  tracking), active row = bold + `bg-app-purple-900` + a 4px `bg-app-primary`
  accent bar on the left edge. Middle section scrolls (`.thin-scroll`), footer is
  pinned.
- **Icons** live in `src/components/side-menu-icons.tsx`, exported straight from
  the same Figma node. Each keeps its own viewBox and fills use `currentColor`,
  so rows inherit their active/hover colour.
- Prod's sidebar is **shadcn/ui `Sidebar`**. Keep that shell (collapse/mobile
  behaviour) and port the styling + structure from here into it, rather than
  replacing the component.

## Where the colours live

All in `src/components/spin-wheel.tsx`:

- **`VARIANTS`** — the source of truth for segment backgrounds. Each variant =
  `{ hub, rim, text }`: `hub` (inner, darker) → `rim` (outer, brighter) form the
  depth gradient; `text` is the label colour that reads on it. Add/edit a colour
  here and everything follows.
- **Per-segment gradients** — one `<radialGradient id="seg-N">` is generated per
  segment from its resolved variant (`resolveVariant`). Segment fill = `url(#seg-N)`.
- **`ICON`** map — the coin/glyph colours per prize kind ($ cash, % match, × lose).
  FS is separate: the `fs-brand` gradient (`#ff3d8b`→`#a750ff`) with a dark
  `paint-order` outline so it reads on any background.
- **Rim** (outer band) — the `rim` linear gradient; colour comes from the
  `rimVariant` prop, defaults to purple.
- **Hub** (SPIN button) — inline Tailwind gradients on the `<button>` near the
  bottom of the file (gold ring + inverted disc).
- **Themes** — `THEMES` in `wheel/themes/page.tsx`: each `{ a, b, hero, lose }`
  assigns variants across the wheel (a/b alternate the win segments).

## Where the animation lives

- **Spin** — `spin()` in `spin-wheel.tsx`. `SPIN_MS` (7000) duration, `TURNS` (6)
  full rotations, easing `cubic-bezier(0.12, 0.8, 0.13, 1)` (fast start, slow
  settle). Resolves on a timer (not `transitionend`) so throttled tabs don't hang.
- **Idle drift** — the `useEffect` with `requestAnimationFrame`; wheel rotates
  ~3°/s (`0.003` deg per ms) while not spinning. `frozen` prop disables it.
- **Motion blur** — `blurred` state; a CSS `filter: blur` toggled ~mid-spin.
- **Chrome fade** — the `chrome` class in `wheel/page.tsx` fades the tabs/CTA/legend
  out during a spin (opacity 500ms).
- **Keyframes** — in `src/app/globals.css`: `coin-burst` (win-screen coins) and
  `tip-in` (hover tooltip). Move these over if you copy those pieces.

## Geometry (all in `spin-wheel.tsx`, top)

`SIZE` 400 viewBox · `R` 180 outer radius · `INNER_R` 56 (segments stop at the
hub) · `GAP` 5 between segments · `CORNER` 5 rounded corners · `ICON_R` / `LABEL_R`
place the icon and value · `POINTER_DEG` 90 (pointer at 3 o'clock).

## The admin spec (what the theme lab is really for)

Each segment = **an icon** (`IconName`: fs/cash/match/lose/none) + **a background
variant** (`VariantName`). A **theme** is a preset that assigns variants to all
segments. So the admin should store, per wheel: **a theme name + per-prize
`{ icon, background }` overrides.** The theme lab produces exactly that shape.

## Scaffolding to replace, not ship

- `src/lib/wheel-theme-store.ts` — applied design saved to `localStorage`. Replace
  with real config from the backend/admin.
- `src/lib/wheel-prizes.ts` — sample prizes. Real ones come from admin.
- In `wheel/page.tsx`: `spinsLeft = 2`, "demo: reset spins", eligibility copy are
  placeholders.

## Dependency notes

- Tailwind **v4** here (tokens in `globals.css` `@theme`); prod rizzy is **v3**
  (tokens in `tailwind.config`). `app-*` classes used the same; confirm token
  values match. Arbitrary classes like `from-[#a750ff]` work in both.
- **Token values were trued up to the sidemenu Figma.** `app-light-stroke` is now
  `rgba(209,164,255,.1)` (was `rgba(167,80,255,.1)`), and two tokens were added:
  `app-primary` `#7f0ff0` and `app-purple-900` `#2e0556`. Class *names* match
  prod; only the values changed.
- Fonts: Inter + **Pacifico** (the script "Wheel" word, via `--font-script`).

## Commands

```bash
npm run dev                    # local dev
npx vercel deploy --prod --yes # deploy to daily-wheel-sample.vercel.app
```
