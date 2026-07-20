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
  collapsed,
}: {
  item: Item;
  active?: boolean;
  onSelect?: () => void;
  trailing?: ReactNode;
  collapsed?: boolean;
}) {
  return (
    <div className="relative flex h-12 items-center px-3">
      {active && (
        <span className="absolute left-0 top-1/2 h-[30px] w-1 -translate-y-1/2 rounded-r-[12px] bg-app-primary" />
      )}
      <button
        onClick={onSelect}
        title={collapsed ? item.label : undefined}
        className={`flex h-full w-full items-center gap-2.5 overflow-hidden rounded-md pl-3 pr-2 text-left transition-colors ${
          active
            ? "font-bold text-app-purple"
            : "font-semibold text-app-main-text hover:text-app-purple"
        }`}
      >
        <Icon name={item.icon} className="size-4 shrink-0" />
        <span
          className={`whitespace-nowrap text-sm tracking-[-0.28px] transition-opacity duration-200 ${
            collapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          {item.label}
        </span>
        {!collapsed && trailing}
      </button>
    </div>
  );
}

export function SideMenu() {
  const [active, setActive] = useState("Lobby");
  const [promoOpen, setPromoOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-app-light-stroke bg-app-dark-100 text-app-main-text transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* header: purple gradient band + the site's sidebar toggle */}
      <div className="relative h-16 shrink-0 overflow-hidden border-b border-app-light-stroke bg-[linear-gradient(115deg,#3b1170_0%,#2b0d4d_45%,#170735_100%)]">
        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((c) => !c)}
          className="flex h-full items-center px-4 text-white transition-colors hover:text-app-purple"
        >
          {/* hamburger from rizzy.com, dot in brand purple per the Figma */}
          <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden>
            <path fillRule="evenodd" clipRule="evenodd" d="M0.966127 0H22.5979C23.1315 0 23.5641 0.43255 23.5641 0.966127V0.98971C23.5641 1.53168 23.1635 1.96762 22.6804 1.96762H0.883653C0.400589 1.96762 0 1.53168 0 0.98971V0.966146C0 0.966146 0.00419395 0.945176 0.0100796 0.91825L0.011782 0.913127C0.017673 0.895454 0.023564 0.87778 0.023564 0.860107C0.0188115 0.879118 0.0140589 0.900045 0.0100796 0.91825C0.00480754 0.934215 0 0.950181 0 0.966146C0 0.432569 0.43255 0 0.966127 0ZM23.5405 0.871889C23.5405 0.871889 23.5462 0.889118 23.5521 0.910818C23.5485 0.894736 23.5445 0.879904 23.5405 0.871889ZM23.5641 0.977928C23.5641 0.977928 23.5589 0.942018 23.5521 0.910818C23.558 0.933074 23.5641 0.960031 23.5641 0.977928Z" fill="currentColor" />
            <path d="M0.966127 16C0.43255 16 0 15.5674 0 15.0339C0 14.4919 0.400589 14.056 0.883653 14.056H22.6804C23.1635 14.056 23.5641 14.4919 23.5641 15.0339C23.5641 15.0339 23.5599 15.0549 23.554 15.0818L23.5523 15.0869C23.5464 15.1046 23.5405 15.1223 23.5405 15.1399C23.5452 15.1209 23.55 15.1 23.554 15.0818C23.5593 15.0658 23.5641 15.0499 23.5641 15.0339C23.5641 15.5674 23.1315 16 22.5979 16H0.966127Z" fill="currentColor" />
            <path d="M22.6804 6.98676C23.1635 6.98676 23.5641 7.4227 23.5641 7.96467C23.5641 8.50665 23.1635 8.94258 22.6804 8.94258H15.0221C14.539 8.94258 14.1384 8.50665 14.1384 7.96467C14.1384 7.4227 14.539 6.98676 15.0221 6.98676H22.6804Z" fill="currentColor" />
            <path d="M0.883653 6.98676C0.400589 6.98676 0 7.4227 0 7.96467C0 8.50665 0.400589 8.94258 0.883653 8.94258H8.54197C9.02504 8.94258 9.42563 8.50665 9.42563 7.96467C9.42563 7.4227 9.02504 6.98676 8.54197 6.98676H0.883653Z" fill="currentColor" />
            <path d="M11.782 9.13107C12.4327 9.13107 12.9602 8.60357 12.9602 7.95287C12.9602 7.30217 12.4327 6.77467 11.782 6.77467C11.1313 6.77467 10.6038 7.30217 10.6038 7.95287C10.6038 8.60357 11.1313 9.13107 11.782 9.13107Z" fill="#7f0ff0" />
          </svg>
        </button>
      </div>

      {/* search */}
      <div className="shrink-0 border-b border-app-light-stroke px-3 py-4">
        <button
          title={collapsed ? "Search" : undefined}
          className="flex h-[38px] w-full items-center gap-1.5 overflow-hidden rounded-md border border-app-light-stroke bg-app-dark-700 px-2.5 text-app-secondary-text transition-colors hover:text-app-main-text"
        >
          <Icon name="search" className="size-4 shrink-0" />
          <span
            className={`whitespace-nowrap text-xs font-semibold tracking-[-0.24px] transition-opacity duration-200 ${
              collapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Search
          </span>
        </button>
      </div>

      {/* scrolls; footer stays put */}
      <div className="hairline-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="py-2.5">
          {QUICK.map((item) => (
            <MenuItem
              key={item.label}
              collapsed={collapsed}
              item={item}
              active={active === item.label}
              onSelect={() => setActive(item.label)}
            />
          ))}
        </div>

        {/* promotions — no active state; in prod this navigates to /promotions */}
        <div className="border-t border-app-light-stroke">
          <MenuItem
            item={{ label: "Promotions", icon: "promotions" }}
            collapsed={collapsed}
            onSelect={() => setPromoOpen((o) => !o)}
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
              collapsed={collapsed}
              item={item}
              active={active === item.label}
              onSelect={() => setActive(item.label)}
            />
          ))}
        </div>

        {/* scrolls with the rest — only the logo + search stay fixed */}
        <div className="border-t border-app-light-stroke pt-2.5">
          {FOOTER.map((item) => (
            <MenuItem
              key={item.label}
              collapsed={collapsed}
              item={item}
              active={active === item.label}
              onSelect={() => setActive(item.label)}
            />
          ))}
          <div className="px-3 py-3">
            <button
              title={collapsed ? "Language" : undefined}
              className="flex h-[42px] w-full items-center justify-between overflow-hidden rounded-md border border-app-light-stroke bg-app-dark-200 px-2.5"
            >
              <span className="flex items-center gap-2">
                <Icon name="globe" className="size-3 shrink-0" />
                <span
                  className={`whitespace-nowrap text-sm font-semibold tracking-[-0.28px] transition-opacity duration-200 ${
                    collapsed ? "opacity-0" : "opacity-100"
                  }`}
                >
                  English
                </span>
              </span>
              {!collapsed && (
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
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
