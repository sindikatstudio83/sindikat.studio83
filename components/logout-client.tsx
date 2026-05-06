"use client";

import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function LogoutClient() {
  const supabase = createBrowserSupabase();

  useEffect(() => {
    async function logout() {
      await supabase.auth.signOut();
      window.location.replace("/login");
    }
    logout();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="auth-shell">
      <div className="panel">
        <span className="page-label">Odjava</span>
        <h1>Odjavljujemo nalog...</h1>
        <p className="lead">Samo trenutak.</p>
      </div>
    </section>
  );
}
