"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createBrowserSupabase } from "@/lib/supabase/client";

type State = "loading" | "guest" | "wrong-role" | "duplicate" | "no-cv" | "ready" | "submitting" | "done" | "error";

export function ApplyForm({ jobId }: { jobId: number }) {
  const { role, userId, ready } = useAuth();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const supabase = createBrowserSupabase();

  useEffect(() => {
    if (!ready) return;
    if (!userId) { setState("guest"); return; }
    if (role !== "candidate") { setState("wrong-role"); return; }

    async function check() {
      // Paralelne provjere
      const [existingRes, profileRes] = await Promise.all([
        supabase.from("job_applications").select("id").eq("job_id", jobId).eq("candidate_id", userId!).maybeSingle(),
        supabase.from("profiles").select("full_name,phone,city,cv_data").eq("id", userId!).maybeSingle()
      ]);

      if (existingRes.data?.id) { setState("duplicate"); return; }

      const p = profileRes.data;
      const cv = p?.cv_data || {};
      const hasCv = Boolean((cv as any).summary || (cv as any).experience || (cv as any).skills || p?.full_name || p?.phone || p?.city);
      if (!hasCv) { setState("no-cv"); return; }

      setState("ready");
    }
    check();
  }, [ready, role, userId, jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    const fd = new FormData(e.currentTarget);
    const coverLetter = String(fd.get("cover_letter") || "").trim();
    if (!coverLetter) { setMessage("Upiši propratni tekst."); return; }
    setState("submitting");
    const { error } = await supabase.from("job_applications").insert({
      job_id: jobId, candidate_id: userId, cover_letter: coverLetter,
      cv_path: null, reference_code: `IP-${Date.now()}`
    });
    if (error) { setMessage(error.message); setState("error"); return; }
    setState("done");
    setTimeout(() => { window.location.href = "/profil/prijave"; }, 1200);
  }

  if (!ready || state === "loading") return <p className="notice">Provjeravamo...</p>;
  if (state === "guest") return <div className="empty"><strong>Prijava zahtijeva nalog</strong><p>Prijavi se kao kandidat.</p><Link className="btn blue sm" href="/login">Prijava →</Link></div>;
  if (state === "wrong-role") return <div className="empty"><strong>Samo kandidat može aplicirati</strong></div>;
  if (state === "duplicate") return <p className="notice success">✓ Već si aplicirao/la. <Link href="/profil/prijave" style={{ fontWeight: 900 }}>Prati status →</Link></p>;
  if (state === "no-cv") return <div className="empty"><strong>Biografija nije popunjena</strong><p>Dopuni biografiju pa se vrati i apliciraj.</p><Link className="btn blue sm" href="/profil/biografija">Dopuni →</Link></div>;
  if (state === "done") return <p className="notice success">✓ Prijava poslata! Preusmjeravamo...</p>;

  return (
    <form onSubmit={submit} className="form-card">
      <label>
        <span className="label">Propratni tekst *</span>
        <textarea className="textarea" name="cover_letter" maxLength={1200}
          placeholder="Kratko se predstavi — ko si, šta znaš i zašto si dobar/a izbor..."
          onChange={e => setCharCount(e.target.value.length)} style={{ minHeight: 130 }} />
        <div className="counter">{charCount}/1200</div>
      </label>
      <p className="notice">Prijava koristi biografiju iz profila. CV fajlovi se ne šalju.</p>
      {state === "error" && message && <p className="notice error">{message}</p>}
      <button className="btn blue" style={{ width: "100%" }} disabled={state === "submitting"}>
        {state === "submitting" ? "Slanje..." : "Pošalji prijavu →"}
      </button>
    </form>
  );
}
