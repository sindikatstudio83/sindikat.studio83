"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { roleHomes, roleLabels } from "@/lib/labels";
import { loadCurrentRole } from "@/lib/auth-role";
import { desktopNavItems } from "@/lib/navigation";
import type { UserRole } from "@/types/domain";

export function Header() {
  const [role, setRole] = useState<UserRole>("guest");
  const [theme, setTheme] = useState("light");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supabase] = useState(() => createBrowserSupabase());
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("imaposlaTheme") || "light";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;

    async function loadRole() { setRole(await loadCurrentRole(supabase)); }
    loadRole();
    const { data } = supabase.auth.onAuthStateChange(() => loadRole());
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("imaposlaTheme", next);
  }

  const isLoggedIn = role !== "guest";
  const dashboardHref = isLoggedIn ? roleHomes[role as Exclude<UserRole, "guest">] : "/login";
  const navItems = desktopNavItems[role];

  return (
    <header className="top">
      <div className="top-in">
        <button className="icon-btn hamb" onClick={() => setMobileOpen(o => !o)} aria-label="Meni">☰</button>
        <Link className="brand" href="/">
          <span className="mark">ip</span>
          <span>imaposla.me</span>
        </Link>
        <nav className="nav desktop-nav" aria-label="Glavna navigacija">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="top-actions">
          {isLoggedIn && <span className="role-pill">{roleLabels[role]}</span>}
          <button className="icon-btn" type="button" onClick={toggleTheme} aria-label="Promijeni temu" style={{ fontSize: 17 }}>
            {theme === "dark" ? "☀" : "🌙"}
          </button>
          {!isLoggedIn ? (
            <>
              <Link className="btn ghost" href="/login">Prijava</Link>
              <Link className="btn blue" href="/registracija">Registracija</Link>
            </>
          ) : (
            <>
              <Link className="btn ghost" href={dashboardHref}>{roleLabels[role]}</Link>
              <Link className="btn red" href="/logout">Odjava</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mobile-nav open" ref={mobileRef}>
          {navItems.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>
          ))}
          {!isLoggedIn
            ? <><Link href="/login" onClick={() => setMobileOpen(false)}>Prijava</Link><Link href="/registracija" onClick={() => setMobileOpen(false)}>Registracija</Link></>
            : <Link href="/logout" onClick={() => setMobileOpen(false)}>Odjava</Link>
          }
        </div>
      )}
    </header>
  );
}
