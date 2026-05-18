"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { roleHomes } from "@/lib/labels";

/**
 * Klijent komponenta koja preusmjerava već ulogovanog korisnika sa /login ili /registracija
 * na njegov dashboard. Ne dira gostove — oni vide formu.
 *
 * VAŽNO: Ne smije se aktivirati kada je Login forma upravo završila prijavu i
 * sama vrši redirect. Koristimo sessionStorage flag 'ip_login_redirecting' da
 * razlikujemo ova dva slučaja i spriječimo dvostruki redirect (koji uzrokuje flicker).
 */
export function RedirectIfAuthed() {
  const { role, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (role === "guest") return;

    // Ako LoginForm upravo završava i redirect-uje, ne dodajemo još jedan redirect
    try {
      if (sessionStorage.getItem("ip_login_redirecting") === "1") return;
    } catch {
      // sessionStorage nije dostupan (private mode edge case) — nastavi normalno
    }

    window.location.replace(roleHomes[role as Exclude<typeof role, "guest">]);
  }, [ready, role]);

  return null;
}
