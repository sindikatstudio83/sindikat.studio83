"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { roleHomes } from "@/lib/labels";

/**
 * Redirects already-logged-in users away from /login and /registracija.
 * Skips redirect if LoginForm is already handling it (ip_login_redirecting flag).
 */
export function RedirectIfAuthed() {
  const { role, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (role === "guest") return;

    try {
      if (sessionStorage.getItem("ip_login_redirecting") === "1") return;
    } catch {
      // sessionStorage unavailable in private mode — continue normally
    }

    router.replace(roleHomes[role as Exclude<typeof role, "guest">]);
  }, [ready, role, router]);

  return null;
}
