"use client";

import Link from "next/link";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { safeMessage, logError } from "@/lib/errors";
import { PageLabel } from "@/components/ui";

export default function ResetLozinkaPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");

    if (password !== confirm) {
      setError("Lozinke se ne poklapaju.");
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();
    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      logError("auth.reset", err);
      setError(safeMessage(err, "auth"));
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setTimeout(() => { window.location.href = "/login"; }, 2000);
  }

  return (
    <section className="auth-shell auth-two">
      <div>
        <PageLabel>Pristup nalogu</PageLabel>
        <h1>Nova lozinka</h1>
        <p>Upiši novu lozinku za tvoj nalog. Mora imati najmanje 8 znakova.</p>
      </div>

      {done ? (
        <div className="form-card">
          <p style={{ fontSize: 16, fontWeight: 700 }}>✓ Lozinka je promijenjena</p>
          <p className="sub">Preusmjeravamo te na prijavu...</p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label>
            <span className="label">Nova lozinka</span>
            <input
              className="field"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label>
            <span className="label">Potvrdi lozinku</span>
            <input
              className="field"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <button className="btn blue" type="submit" disabled={loading}>
            {loading ? "Čuvanje..." : "Postavi novu lozinku"}
          </button>
          {error && <p className="notice error">{error}</p>}
          <Link className="btn ghost" href="/login">Nazad na prijavu</Link>
        </form>
      )}
    </section>
  );
}
