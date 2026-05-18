"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { mobileNavItems } from "@/lib/navigation";
import { useEffect, useState } from "react";

/**
 * Detektuje iOS browsere u standardnom browser modu.
 * Na iPhone-u adresna traka često stoji pri dnu, pa app nav pomjeramo gore.
 * Mora se pokrenuti na klijentskoj strani (useEffect).
 */
function detectIosBrowser(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;

  const isIos = /iP(hone|od|ad)/.test(ua);
  if (!isIos) return false;

  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return false;

  if (window.matchMedia("(display-mode: standalone)").matches) return false;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return false;

  return true;
}

export function MobileNav() {
  const { role } = useAuth();
  const pathname = usePathname();
  const items = mobileNavItems[role];
  const [isIosBrowser, setIsIosBrowser] = useState(false);

  useEffect(() => {
    setIsIosBrowser(detectIosBrowser());
  }, []);

  const navClass = ["mobile-app-nav", isIosBrowser ? "ios-safari-nav" : ""].join(" ").trim();

  return (
    <nav className={navClass} aria-label="Mobilna navigacija">
      {items.map(item => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            href={item.href}
            key={item.href}
            className={isActive ? "active" : ""}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{NAV_ICONS[item.icon] ?? "•"}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Minimalistički set unicode ikona mapiranih na icon stringove iz navigation.ts.
 * Rade na iOS Safari bez ikakvog icon fonta.
 */
const NAV_ICONS: Record<string, string> = {
  home:       "⌂",
  oglasi:     "◈",
  firme:      "⊞",
  "za-firme": "✦",
  login:      "→",
  prijave:    "◉",
  sacuvani:   "♡",
  profil:     "◎",
  upozorenja: "◌",
  pregled:    "▤",
  novi:       "⊕",
  selekcija:  "⊙",
  pretplata:  "◆",
  odjava:     "←",
  uplate:     "◇",
  audit:      "◈",
  korisnici:  "◯",
  baneri:     "▣",
  paketi:     "⬡",
  gradovi:    "◐",
  kategorije: "⊟",
  biografija: "▦",
};
