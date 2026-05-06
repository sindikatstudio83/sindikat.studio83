"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath?: string | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    const supabase = createBrowserSupabase();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.session) {
      setError("E-posta ili lozinka nijesu tačni.");
      setLoading(false);
      return;
    }

    // Get role from profile to redirect correctly
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    const role = prof?.role;

    let dest = "/profil";
    if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
      dest = nextPath;
    } else if (role === "company") {
      dest = "/firma";
    } else if (role === "admin") {
      dest = "/admin";
    }

    window.location.href = dest;
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        <span className="label">E-pošta</span>
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span className="label">Lozinka</span>
        <input className="field" name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="btn blue" type="submit" disabled={loading}>
        {loading ? "Prijava..." : "Prijavi se"}
      </button>
      {error && <p className="notice error">{error}</p>}
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

    setMessage("Nalog kreiran! Preusmjeravamo...");
    setTimeout(() => { window.location.href = "/login"; }, 1200);
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
      {message && <p className="notice">{message}</p>}
    </form>
  );
}
