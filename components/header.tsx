"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { roleHomes, roleLabels } from "@/lib/labels";
import { loadCurrentRole } from "@/lib/auth-role";
import { desktopNavItems } from "@/lib/navigation";
import type { UserRole } from "@/types/domain";

export function Header() {
  const [role, setRole] = useState<UserRole>("guest");
  const [theme, setTheme] = useState("light");
  const [supabase] = useState(() => createBrowserSupabase());

  useEffect(() => {
    const saved = window.localStorage.getItem("imaposlaTheme") || "light";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;

    async function loadRole() {
      setRole(await loadCurrentRole(supabase));
    }

    loadRole();
    const { data } = supabase.auth.onAuthStateChange(() => loadRole());
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("imaposlaTheme", next);
  }

  const dashboardHref = role === "guest" ? "/login" : roleHomes[role as Exclude<UserRole, "guest">];
  const isLoggedIn = role !== "guest";

  return (
    <header className="top">
      <div className="top-in">
        <Link className="brand" href="/" aria-label="imaposla.me početna">
          <span className="mark">ip</span>
          <span>imaposla.me</span>
        </Link>

        <nav className="nav desktop-nav" aria-label="Glavna navigacija">
          {desktopNavItems[role].map((item) => (
            <Link href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>

        <div className="top-actions">
          {isLoggedIn && (
            <span className="role-pill">{roleLabels[role]}</span>
          )}
          <button className="icon-btn" type="button" onClick={toggleTheme} aria-label="Promijeni temu">
            {theme === "dark" ? "☀" : "●"}
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
    </header>
  );
}
