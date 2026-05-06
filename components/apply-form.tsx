"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { normalizeRole } from "@/lib/auth-role";

type State = "loading" | "guest" | "wrong-role" | "duplicate" | "no-cv" | "ready" | "submitting" | "done" | "error";

export function ApplyForm({ jobId }: { jobId: number }) {
  const [state, setState] = useState<State>("loading");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [supabase] = useState(() => createBrowserSupabase());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { setState("guest"); return; }
      const user = data.user;
      setUserId(user.id);
      const { data: prof } = await supabase.from("profiles").select("role,full_name,phone,city,cv_data").eq("id", user.id).maybeSingle();
      const role = normalizeRole(prof?.role);
      if (role !== "candidate") { setState("wrong-role"); return; }
      const { data: existing } = await supabase.from("job_applications").select("id").eq("job_id", jobId).eq("candidate_id", user.id).maybeSingle();
      if (existing?.id) { setState("duplicate"); return; }
      const cv = prof?.cv_data || {};
      const hasCv = Boolean((cv as any).summary || (cv as any).experience || (cv as any).skills || prof?.full_name || prof?.phone || prof?.city);
      if (!hasCv) { setState("no-cv"); return; }
      setState("ready");
    }
    load();
  }, [jobId, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!userId) return;
    const fd = new FormData(e.currentTarget);
    const coverLetter = String(fd.get("cover_letter") || "").trim();
    if (!coverLetter) { setMessage("Upiši propratni tekst."); setState("error"); return; }
    setState("submitting"); setMessage("");
    const { error } = await supabase.from("job_applications").insert({
      job_id: jobId, candidate_id: userId, cover_letter: coverLetter, cv_path: null,
      reference_code: `IP-${Date.now()}`
    });
    if (error) { console.error("[ApplyForm]", error.message); setMessage(error.message); setState("error"); return; }
    setState("done");
    setTimeout(() => { window.location.href = "/profil/prijave"; }, 1500);
  }

  if (state === "loading") return <p className="notice">Provjeravamo nalog...</p>;
  if (state === "guest") return (
    <div className="empty">
      <span style={{ fontSize: 32 }}>🔐</span>
      <strong>Prijava zahtijeva nalog</strong>
      <p>Prijavi se kao kandidat i dopuni biografiju.</p>
      <Link className="btn blue" href="/login">Prijava →</Link>
    </div>
  );
  if (state === "wrong-role") return (
    <div className="empty">
      <span style={{ fontSize: 32 }}>🏢</span>
      <strong>Samo kandidat može aplicirati</strong>
      <p>Firma nalog ne može slati prijave.</p>
    </div>
  );
  if (state === "duplicate") return (
    <div className="notice success">
      ✓ Već si aplicirao/la na ovaj oglas. <Link href="/profil/prijave" style={{ fontWeight: 900, color: "var(--green)" }}>Prati status →</Link>
    </div>
  );
  if (state === "no-cv") return (
    <div className="empty">
      <span style={{ fontSize: 32 }}>📝</span>
      <strong>Biografija nije popunjena</strong>
      <p>Dopuni biografiju, a onda se vrati i apliciraj.</p>
      <Link className="btn blue" href="/profil/biografija">Dopuni biografiju →</Link>
    </div>
  );
  if (state === "done") return (
    <div className="notice success">✓ Prijava je poslata! Preusmjeravamo te na tvoje prijave...</div>
  );

  return (
    <form ref={formRef} onSubmit={submit} className="form-card">
      <label>
        <span className="label">Propratni tekst / motivaciono pismo *</span>
        <textarea className="textarea" name="cover_letter" maxLength={1200} placeholder="Kratko se predstavi — ko si, šta znaš i zašto si dobar/a izbor za ovu poziciju..." onChange={e => setCharCount(e.target.value.length)} style={{ minHeight: 140 }} />
        <div className="counter">{charCount}/1200</div>
      </label>
      <div className="notice">📋 Prijava koristi biografiju iz profila. CV fajlovi se ne šalju.</div>
      {state === "error" && message && <p className="notice error">{message}</p>}
      <button className="btn blue" type="submit" disabled={state === "submitting"} style={{ width: "100%" }}>
        {state === "submitting" ? "Slanje..." : "Pošalji prijavu →"}
      </button>
    </form>
  );
}
