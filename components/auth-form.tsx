"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function LoginForm({ nextPath, errorMessage }: { nextPath?: string | null; errorMessage?: string | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorMessage || "");
  const supabase = createBrowserSupabase();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    if (!email || !password) {
      setError("Upiši e-postu i lozinku.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.session) {
      setError("E-posta ili lozinka nijesu tačni.");
      setLoading(false);
      return;
    }

    // Determine redirect based on role from profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const role = profileData?.role;
    const dest = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : role === "company" ? "/firma"
      : role === "admin" ? "/admin"
      : "/profil";

    // Hard reload so cookies and header state sync properly
    window.location.href = dest;
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>
        <span className="label">E-posta</span>
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span className="label">Lozinka</span>
        <input className="field" name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="btn blue" type="submit" disabled={loading}>
        {loading ? "Prijava..." : "Prijavi se"}
      </button>
      <p className="hint">Sistem automatski otvara pregled za tvoju ulogu.</p>
      {error ? <p className="notice error">{error}</p> : null}
    </form>
  );
}

export function RegisterForm({ selectedRole }: { selectedRole: "candidate" | "company" }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserSupabase();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: selectedRole } }
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Nalog je kreiran! Preusmjeravamo na prijavu...");
    setTimeout(() => { window.location.href = "/login"; }, 1500);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input type="hidden" name="role" value={selectedRole} />
      <label>
        <span className="label">E-posta</span>
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span className="label">Lozinka</span>
        <input className="field" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <button className="btn blue" type="submit" disabled={loading}>
        {loading ? "Kreiranje..." : "Kreiraj nalog"}
      </button>
      <p className="hint">Lozinka mora imati najmanje 8 znakova.</p>
      {message ? <p className="notice">{message}</p> : null}
    </form>
  );
}
