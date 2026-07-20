"use client";

import { useState } from "react";
import type { ReactNode } from "react";

/**
 * Sidemenu — built to the Figma spec (240px, 48px rows, app-* tokens).
 * Icons here are simple placeholders; swap them for rizzy's real
 * `sidebar-icons` set when lifting this in.
 */

const ICONS: Record<string, ReactNode> = {
  lobby: <path d="M2.5 6.8 8 2.5l5.5 4.3V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5z" />,
  star: <path d="m8 2.4 1.7 3.5 3.8.6-2.7 2.6.6 3.8L8 11.1 4.6 13l.6-3.8L2.5 6.5l3.8-.6z" />,
  clock: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5.2V8l2 1.2" />
    </>
  ),
  gift: (
    <>
      <rect x="2.5" y="6.5" width="11" height="7" rx="1" />
      <path d="M2.5 9.5h11M8 6.5v7" />
    </>
  ),
  sparkle: <path d="m8 2.5 1.4 3.1 3.1 1.4-3.1 1.4L8 11.5 6.6 8.4 3.5 7l3.1-1.4z" />,
  reels: (
    <>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1" />
      <path d="M6 3.5v9M10 3.5v9" />
    </>
  ),
  cards: (
    <>
      <rect x="2.5" y="4" width="7" height="9" rx="1" />
      <path d="M11 4.6l2.3.8-2 6" />
    </>
  ),
  table: (
    <>
      <rect x="2.5" y="4.5" width="11" height="7" rx="3.5" />
      <path d="M6 11.5v2M10 11.5v2" />
    </>
  ),
  tv: (
    <>
      <rect x="2.5" y="4.5" width="11" height="7.5" rx="1" />
      <path d="M6 2.5 8 4.5l2-2" />
    </>
  ),
  target: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <circle cx="8" cy="8" r="2" />
    </>
  ),
  ticket: (
    <>
      <path d="M2.5 6V4.5h11V6a2 2 0 0 0 0 4v1.5h-11V10a2 2 0 0 0 0-4z" />
      <path d="M8 5.5v5" />
    </>
  ),
  joystick: (
    <>
      <circle cx="8" cy="5" r="2.5" />
      <path d="M8 7.5v3M5 13.5h6" />
    </>
  ),
  bag: (
    <>
      <path d="M3 5.5h10l-.8 8H3.8z" />
      <path d="M5.8 5.5V4a2.2 2.2 0 0 1 4.4 0v1.5" />
    </>
  ),
  fish: (
    <>
      <path d="M2.5 8s2-3 5-3 4.5 3 4.5 3-1.5 3-4.5 3-5-3-5-3z" />
      <path d="M12 5.5 13.5 8 12 10.5" />
    </>
  ),
  layers: <path d="m8 2.5 5.5 3L8 8.5 2.5 5.5zM2.5 8.5 8 11.5l5.5-3" />,
  crown: <path d="M2.5 11.5 3.5 5l3 2.5L8 3.5l1.5 4L12.5 5l1 6.5z" />,
  users: (
    <>
      <circle cx="6" cy="6" r="2.3" />
      <path d="M2.5 13c0-2 1.6-3.2 3.5-3.2S9.5 11 9.5 13M10.5 4.2a2.3 2.3 0 0 1 0 4M11.5 9.9c1.2.4 2 1.5 2 3.1" />
    </>
  ),
  headset: (
    <>
      <path d="M3 10V8a5 5 0 0 1 10 0v2" />
      <rect x="2" y="9.5" width="2.5" height="3.5" rx="1" />
      <rect x="11.5" y="9.5" width="2.5" height="3.5" rx="1" />
    </>
  ),
  globe: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M2.6 8h10.8M8 2.5c1.5 1.7 2.2 3.6 2.2 5.5S9.5 12.3 8 13.5c-1.5-1.2-2.2-3.6-2.2-5.5S6.5 4.2 8 2.5z" />
    </>
  ),
  search: (
    <>
      <circle cx="7.2" cy="7.2" r="4" />
      <path d="m10.2 10.2 3 3" />
    </>
  ),
};

function Icon({ name, className = "size-4" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

type Item = { label: string; icon: string };

const QUICK: Item[] = [
  { label: "Lobby", icon: "lobby" },
  { label: "Favourites", icon: "star" },
  { label: "Recently Played", icon: "clock" },
];

const GAMES: Item[] = [
  { label: "Originals", icon: "sparkle" },
  { label: "Slots", icon: "reels" },
  { label: "Live Casino", icon: "cards" },
  { label: "Table Games", icon: "table" },
  { label: "Baccarat", icon: "cards" },
  { label: "Game Shows", icon: "tv" },
  { label: "Roulette", icon: "target" },
  { label: "Blackjack", icon: "cards" },
  { label: "Lottery", icon: "ticket" },
  { label: "Arcade", icon: "joystick" },
  { label: "Bonus Buy", icon: "bag" },
  { label: "Fishing", icon: "fish" },
  { label: "Providers", icon: "layers" },
];

const FOOTER: Item[] = [
  { label: "VIP Club", icon: "crown" },
  { label: "Affiliate", icon: "users" },
  { label: "Live Support", icon: "headset" },
];

function MenuItem({
  item,
  active,
  onSelect,
  trailing,
}: {
  item: Item;
  active?: boolean;
  onSelect?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="relative flex h-12 items-center px-3">
      {active && (
        <span className="absolute left-0 top-1/2 h-[30px] w-1 -translate-y-1/2 rounded-r-[12px] bg-app-primary" />
      )}
      <button
        onClick={onSelect}
        className={`flex h-full w-full items-center gap-2.5 rounded-md pl-3 pr-2 text-left transition-colors ${
          active
            ? "bg-app-purple-900 font-bold"
            : "font-semibold text-app-main-text hover:bg-app-dark-200/60"
        }`}
      >
        <Icon name={item.icon} />
        <span className="text-sm tracking-[-0.28px]">{item.label}</span>
        {trailing}
      </button>
    </div>
  );
}

export function SideMenu() {
  const [active, setActive] = useState("Lobby");
  const [promoOpen, setPromoOpen] = useState(false);

  return (
    <nav className="flex h-full w-60 shrink-0 flex-col border-r border-app-light-stroke bg-app-dark-100 text-app-main-text">
      {/* logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-app-light-stroke px-4">
        <span className="grid size-8 place-items-center rounded-md bg-app-primary text-sm font-extrabold">
          R
        </span>
        <span className="text-base font-extrabold italic tracking-tight">rizzy</span>
      </div>

      {/* search */}
      <div className="shrink-0 border-b border-app-light-stroke px-3 py-4">
        <button className="flex h-[38px] w-full items-center gap-1.5 rounded-md border border-app-light-stroke bg-app-dark-700 px-2.5 text-app-secondary-text transition-colors hover:text-app-main-text">
          <Icon name="search" className="size-5" />
          <span className="text-xs font-semibold tracking-[-0.24px]">Search</span>
        </button>
      </div>

      {/* scrolls; footer stays put */}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="py-2.5">
          {QUICK.map((item) => (
            <MenuItem
              key={item.label}
              item={item}
              active={active === item.label}
              onSelect={() => setActive(item.label)}
            />
          ))}
        </div>

        {/* promotions — its own section, expandable */}
        <div className="border-t border-app-light-stroke">
          <MenuItem
            item={{ label: "Promotions", icon: "gift" }}
            active={active === "Promotions"}
            onSelect={() => {
              setActive("Promotions");
              setPromoOpen((o) => !o);
            }}
            trailing={
              <span className="ml-auto grid size-7 place-items-center rounded-md bg-app-dark-200">
                <svg
                  viewBox="0 0 16 16"
                  className={`size-4 transition-transform ${promoOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
                </svg>
              </span>
            }
          />
        </div>

        <div className="border-t border-app-light-stroke py-2.5">
          {GAMES.map((item) => (
            <MenuItem
              key={item.label}
              item={item}
              active={active === item.label}
              onSelect={() => setActive(item.label)}
            />
          ))}
        </div>
      </div>

      {/* footer */}
      <div className="shrink-0 border-t border-app-light-stroke pt-2.5">
        {FOOTER.map((item) => (
          <MenuItem
            key={item.label}
            item={item}
            active={active === item.label}
            onSelect={() => setActive(item.label)}
          />
        ))}
        <div className="px-4 py-3">
          <button className="flex h-[42px] w-full items-center justify-between rounded-md border border-app-light-stroke bg-app-dark-200 px-2.5">
            <span className="flex items-center gap-2">
              <Icon name="globe" className="size-3" />
              <span className="text-sm font-semibold tracking-[-0.28px]">English</span>
            </span>
            <svg
              viewBox="0 0 16 16"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
