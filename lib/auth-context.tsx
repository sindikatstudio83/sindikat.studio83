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
  /** true only after role is fully resolved (DB confirmed or definitively failed) */
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

    /**
     * FIX: Previously, ready:true was set twice — first with metadata role,
     * then updated with DB role. This caused CompanyClient to redirect to /profil
     * before the correct "company" role was loaded from the DB.
     *
     * New behaviour: ready:true is only set AFTER the DB role check is complete
     * (or definitively failed). This ensures all guards/redirects fire with the
     * correct, authoritative role.
     */
    async function loadFromSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        if (mounted) setState({ role: "guest", userId: null, email: null, ready: true });
        return;
      }

      const user = session.user;

      // Step 1: Try DB role first — this is authoritative
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (!error && data?.role) {
          const dbRole = normalizeRole(data.role);
          if (mounted) {
            setState({
              role: dbRole !== "guest" ? dbRole : "candidate",
              userId: user.id,
              email: user.email || null,
              ready: true,
            });
          }
          return;
        }

        // Profile row missing — upsert with metadata role as fallback
        if (!error && !data) {
          const metaRole = normalizeRole(user.user_metadata?.role);
          const fallbackRole: UserRole = metaRole !== "guest" ? metaRole : "candidate";
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            role: fallbackRole,
          }, { onConflict: "id" });
          if (mounted) {
            setState({ role: fallbackRole, userId: user.id, email: user.email || null, ready: true });
          }
          return;
        }
      } catch {
        // Network or RLS error — fall through to metadata
      }

      // Step 2: Fallback to metadata role if DB failed
      const metaRole = normalizeRole(user.user_metadata?.role);
      const safeRole: UserRole = metaRole !== "guest" ? metaRole : "candidate";
      if (mounted) {
        setState({ role: safeRole, userId: user.id, email: user.email || null, ready: true });
      }
    }

    loadFromSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      if (event === "SIGNED_OUT" || !session) {
        if (mounted) setState({ role: "guest", userId: null, email: null, ready: true });
      } else if (event === "SIGNED_IN") {
        // Only reload if this is actually a different user session
        setState(prev => {
          if (prev.userId !== session.user.id) {
            // Reset to not-ready while we fetch the new user's role
            if (mounted) {
              setState({ role: "guest", userId: null, email: null, ready: false });
              loadFromSession();
            }
          }
          return prev;
        });
      }
      // TOKEN_REFRESHED: silently keep current state
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
