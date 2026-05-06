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

const AuthContext = createContext<AuthState>({ role: "guest", userId: null, email: null, ready: false });

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ role: "guest", userId: null, email: null, ready: false });

  useEffect(() => {
    const supabase = createBrowserSupabase();

    async function loadFromSession() {
      // getSession je lokalan (čita cookie) — NEMA mrežnog poziva
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setState({ role: "guest", userId: null, email: null, ready: true });
        return;
      }

      const user = session.user;

      // Role iz user_metadata kao fallback za brzinu
      // Pravi DB poziv SAMO kad metadata nema validnu rolu
      const metaRole = normalizeRole(user.user_metadata?.role);

      if (metaRole !== "guest") {
        // Postavi odmah iz metapodataka, bez čekanja na DB
        setState({ role: metaRole, userId: user.id, email: user.email || null, ready: true });

        // Provjeri DB u pozadini i ispravi ako treba
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle().then(({ data }: { data: { role: string } | null }) => {
          const dbRole = normalizeRole(data?.role);
          if (dbRole !== "guest" && dbRole !== metaRole) {
            setState(s => ({ ...s, role: dbRole }));
          }
        });
      } else {
        // Nema metapodataka — mora na DB
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        setState({ role: normalizeRole(data?.role), userId: user.id, email: user.email || null, ready: true });
      }
    }

    loadFromSession();

    // Osluškuj promjene auth state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (!session) {
        setState({ role: "guest", userId: null, email: null, ready: true });
      } else {
        loadFromSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
