daj mi cijeli ovaj kod prradjen 
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

    // Role iz session metapodataka — bez dodatnog DB poziva
    const metaRole = data.user.user_metadata?.role;
    let dest = "/profil";
    if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
      dest = nextPath;
    } else if (metaRole === "company") {
      dest = "/firma";
    } else if (metaRole === "admin") {
      dest = "/admin";
    } else {
      // Provjeri DB samo ako metadata nema rolu
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (prof?.role === "company") dest = "/firma";
      else if (prof?.role === "admin") dest = "/admin";
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
      {error && <p className="notice error" style={{ marginTop: 4 }}>{error}</p>}
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
      {message && <p className="notice" style={{ marginTop: 4 }}>{message}</p>}
    </form>
  );
}
