"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath?: string | null }) {
  return (
    <form className="auth-form" action="/auth/login" method="post">
      <input type="hidden" name="next" value={nextPath || "/profil"} />

      <label>
        <span className="label">E-pošta</span>
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>

      <label>
        <span className="label">Lozinka</span>
        <input className="field" name="password" type="password" autoComplete="current-password" required />
      </label>

      <button className="btn blue" type="submit">
        Prijavi se
      </button>

      <a className="mini-link" href="/zaboravljena-lozinka">
        Zaboravljena lozinka?
      </a>
    </form>
  );
}

export function RegisterForm({ selectedRole }: { selectedRole: "candidate" | "company" }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    const supabase = createBrowserSupabase();

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id,role,email")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      setMessage("Nalog sa ovom e-poštom već postoji. Prijavi se umjesto nove registracije.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: selectedRole } }
    });

    if (error) {
      const msg = error.message.toLowerCase();

      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("user already")
      ) {
        setMessage("Nalog sa ovom e-poštom već postoji. Prijavi se ili koristi zaboravljenu lozinku.");
      } else {
        setMessage(error.message);
      }

      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("Registracija nije završena. Pokušaj ponovo.");
      setLoading(false);
      return;
    }

    setMessage("Nalog je kreiran. Ako dobiješ email potvrdu, potvrdi nalog pa se prijavi.");
    setLoading(false);

    setTimeout(() => {
      window.location.href = "/login";
    }, 1400);
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <input type="hidden" name="role" value={selectedRole} />

      <label>
        <span className="label">E-pošta</span>
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>

      <label>
        <span className="label">Lozinka (min. 8 znakova)</span>
        <input className="field" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </label>

      <button className="btn blue" type="submit" disabled={loading}>
        {loading ? "Kreiranje..." : "Kreiraj nalog"}
      </button>

      {message ? <p className="notice" style={{ marginTop: 4 }}>{message}</p> : null}
    </form>
  );
}
