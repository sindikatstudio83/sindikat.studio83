"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { normalizeRole } from "@/lib/auth-role";
import type { UserRole } from "@/types/domain";

type AuthState = {
  role: UserRole;
  userId: string | null;
  email: string | null;
  ready: boolean;
};

const initialState: AuthState = { role: "guest", userId: null, email: null, ready: false };

const AuthContext = createContext<AuthState>(initialState);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    let mounted = true;

    async function loadFromSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        if (mounted) setState({ role: "guest", userId: null, email: null, ready: true });
        return;
      }

      const user = session.user;
      const metaRole = normalizeRole(user.user_metadata?.role);
      // Fallback: ako nema role ni u metadata, default je candidate
      const initialRole: UserRole = metaRole !== "guest" ? metaRole : "candidate";

      if (mounted) {
        setState({
          role: initialRole,
          userId: user.id,
          email: user.email || null,
          ready: true
        });
      }

      // Validacija role kroz DB u pozadini — ne blokira UI
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        // Ako profil ne postoji uopšte (RLS prošlo, ali nema reda), pokušaj ga kreirati
        // (handle_new_user trigger bi trebao ovo automatski uraditi, ali fallback)
        if (!error && !data && mounted) {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            role: initialRole
          }, { onConflict: "id" });
          return;
        }

        if (error) {
          // RLS rekurzija, network, ili sl. — zadržavamo metadata role
          // NE logujemo korisnika out, samo nastavljamo sa metapodatkom
          console.warn("[auth-context] profile fetch failed, using metadata role");
          return;
        }

        const dbRole = normalizeRole(data?.role);
        if (mounted && dbRole !== "guest" && dbRole !== initialRole) {
          setState(s => s.userId === user.id ? { ...s, role: dbRole } : s);
        }
      } catch {
        // Tihi fail — zadržavamo metadata role
      }
    }

    loadFromSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      if (event === "SIGNED_OUT" || !session) {
        if (mounted) setState({ role: "guest", userId: null, email: null, ready: true });
      } else if (event === "SIGNED_IN") {
        // Only reload if userId changed (new login) — avoid loop on token refresh
        setState(prev => {
          if (prev.userId !== session.user.id) {
            loadFromSession();
          }
          return prev;
        });
      } else if (event === "TOKEN_REFRESHED") {
        // Silently keep current state — token refresh doesn't change role
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
