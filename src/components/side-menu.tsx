"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ICONS } from "./side-menu-icons";


/**
 * Sidemenu — built to the Figma spec (240px, 48px rows, app-* tokens).
 * Icons are exported straight from the same Figma; see side-menu-icons.tsx.
 */

function Icon({ name, className = "size-4" }: { name: string; className?: string }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg viewBox={icon.vb} className={className} aria-hidden>
      {icon.body}
    </svg>
  );
}


type Item = { label: string; icon: string };

const QUICK: Item[] = [
  { label: "Lobby", icon: "lobby" },
  { label: "Favourites", icon: "favourites" },
  { label: "Recently Played", icon: "recent" },
];

const GAMES: Item[] = [
  { label: "Originals", icon: "originals" },
  { label: "Slots", icon: "slots" },
  { label: "Live Casino", icon: "liveCasino" },
  { label: "Table Games", icon: "tableGames" },
  { label: "Baccarat", icon: "baccarat" },
  { label: "Game Shows", icon: "gameShows" },
  { label: "Roulette", icon: "roulette" },
  { label: "Blackjack", icon: "blackjack" },
  { label: "Lottery", icon: "lottery" },
  { label: "Arcade", icon: "arcade" },
  { label: "Bonus Buy", icon: "bonusBuy" },
  { label: "Fishing", icon: "fishing" },
  { label: "Providers", icon: "providers" },
];

const FOOTER: Item[] = [
  { label: "VIP Club", icon: "vip" },
  { label: "Affiliate", icon: "affiliate" },
  { label: "Live Support", icon: "support" },
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
            item={{ label: "Promotions", icon: "promotions" }}
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
