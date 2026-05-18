"use client";

import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function LogoutClient() {
  useEffect(() => {
    createBrowserSupabase().auth.signOut().then(() => {
      window.location.replace("/login");
    });
  }, []);

  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <p style={{ color: "var(--muted)", fontWeight: 700 }}>Odjava...</p>
    </div>
  );
}
