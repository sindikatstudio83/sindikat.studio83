"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { roleHomes } from "@/lib/labels";

/**
 * Klijent komponenta koja preusmjerava ulogovanog korisnika sa /login ili /registracija
 * na njegov dashboard. Ne dira gostove — oni vide formu.
 *
 * Koristi se u <body> /login i /registracija stranica.
 */
export function RedirectIfAuthed() {
  const { role, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (role === "guest") return;

    const dest = roleHomes[role];
    // replace umjesto href — da se ne popuni history sa login stranicom
    window.location.replace(dest);
  }, [ready, role]);

  return null;
}
