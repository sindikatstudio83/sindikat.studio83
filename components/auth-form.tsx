"use client";

import Link from "next/link";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { safeMessage, logError } from "@/lib/errors";

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

    if (!email || !password) {
      setError("Upiši e-poštu i lozinku.");
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.session) {
      logError("auth.signIn", authError);
      setError(safeMessage(authError, "auth"));
      setLoading(false);
      return;
    }

    // Postavimo flag ODMAH — sprječava RedirectIfAuthed da pravi race condition redirect
    try { sessionStorage.setItem("ip_login_redirecting", "1"); } catch { /* ignore */ }

    // UVIJEK provjeravamo DB role — ne oslanjamo se na user_metadata
    // (metadata može biti zastarjela ili ne-postavljena za starije korisnike)
    let dest = "/profil";
    const safeNext = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null;

    if (safeNext) {
      dest = safeNext;
    } else {
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (prof?.role === "company") dest = "/firma";
        else if (prof?.role === "admin") dest = "/admin";
        else dest = "/profil"; // candidate ili fallback
      } catch {
        // Fallback na metadata ako DB nije dostupan
        const metaRole = data.user.user_metadata?.role;
        if (metaRole === "company") dest = "/firma";
        else if (metaRole === "admin") dest = "/admin";
      }
    }

    // Jedan, pouzdan redirect — replace() ne dodaje u history
    window.location.replace(dest);
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        <span className="label">E-pošta</span>
        <input
          className="field"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ime@email.com"
          required
        />
      </label>
      <label>
        <span className="label">Lozinka</span>
        <input
          className="field"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <button className="btn blue" type="submit" disabled={loading}>
        {loading ? "Prijava..." : "Prijavi se"}
      </button>
      {error && <p className="notice error" role="alert">{error}</p>}
      <Link className="mini-link" href="/zaboravljena-lozinka">
        Zaboravljena lozinka?
      </Link>
    </form>
  );
}

export function RegisterForm({ selectedRole }: { selectedRole: "candidate" | "company" }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    if (password.length < 8) {
      setMessage("Lozinka mora imati najmanje 8 znakova.");
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: selectedRole } }
    });

    if (error) {
      logError("auth.signUp", error);
      setMessage(safeMessage(error, "auth"));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setMessage("Nalog je kreiran. Provjeri e-poštu i potvrdi nalog, pa se prijavi.");
    setLoading(false);
  }

  if (success) {
    return (
      <div className="auth-form">
        <p className="notice success" role="status">{message}</p>
        <Link className="btn blue" href="/login">Idi na prijavu →</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <input type="hidden" name="role" value={selectedRole} />
      <label>
        <span className="label">E-pošta</span>
        <input
          className="field"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ime@email.com"
          required
        />
      </label>
      <label>
        <span className="label">Lozinka (min. 8 znakova)</span>
        <input
          className="field"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <button className="btn blue" type="submit" disabled={loading}>
        {loading ? "Kreiranje..." : selectedRole === "company" ? "Kreiraj nalog firme" : "Kreiraj nalog kandidata"}
      </button>
      {message && !success && <p className="notice error" role="alert">{message}</p>}
      <p className="hint">
        Klikom na dugme prihvataš{" "}
        <Link href="/uslovi-koriscenja" style={{ textDecoration: "underline" }}>uslove korišćenja</Link>
        {" "}i{" "}
        <Link href="/privatnost" style={{ textDecoration: "underline" }}>politiku privatnosti</Link>.
      </p>
    </form>
  );
}
