"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import type { CvData } from "@/types/domain";

const empty: CvData = { fullName: "", title: "", city: "", phone: "", email: "", summary: "", skills: "", languages: "", experience: "", education: "", certificates: "", availability: "" };

export function CvBuilder() {
  const [cv, setCv] = useState<CvData>(empty);
  const [loadMsg, setLoadMsg] = useState("Učitavanje biografije...");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [supabase] = useState(() => createBrowserSupabase());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { setLoadMsg("Prijavi se da sačuvaš biografiju."); return; }
      const { data: prof } = await supabase.from("profiles").select("cv_data,full_name,phone,city,email").eq("id", data.user.id).maybeSingle();
      setCv({
        ...empty, ...(prof?.cv_data || {}),
        fullName: prof?.cv_data?.fullName || prof?.full_name || "",
        phone: prof?.cv_data?.phone || prof?.phone || "",
        city: prof?.cv_data?.city || prof?.city || "",
        email: prof?.cv_data?.email || prof?.email || data.user.email || ""
      });
      setLoadMsg("Biografija učitana.");
    }
    load();
  }, [supabase]);

  const skills = useMemo(() => (cv.skills || "").split(",").map(s => s.trim()).filter(Boolean), [cv.skills]);

  function update(name: keyof CvData, value: string) {
    setCv(c => ({ ...c, [name]: value.slice(0, 6000) }));
    setSaveStatus("idle");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, 2000);
  }

  async function save() {
    if (timer.current) clearTimeout(timer.current);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) { setSaveStatus("error"); return; }
    setSaveStatus("saving");
    const { error: saveErr } = await supabase.from("profiles").update({
      cv_data: cv, full_name: cv.fullName || null, phone: cv.phone || null,
      city: cv.city || null, cv_updated_at: new Date().toISOString()
    }).eq("id", data.user.id);
    setSaveStatus(saveErr ? "error" : "saved");
    if (saveErr) console.error("[CvBuilder:save]", saveErr.message);
  }

  const saveLabel = saveStatus === "saving" ? "Čuvanje..." : saveStatus === "saved" ? "Sačuvano ✓" : "Sačuvaj";

  const field = (name: keyof CvData, label: string, placeholder: string, ta = false) => (
    <label key={name}>
      <span className="label">{label}</span>
      {ta ? <textarea className="textarea" value={cv[name] || ""} placeholder={placeholder} onChange={e => update(name, e.target.value)} />
           : <input className="field" value={cv[name] || ""} placeholder={placeholder} onChange={e => update(name, e.target.value)} />}
    </label>
  );

  return (
    <div className="cv-builder-page">
      <div className="cv-builder-head">
        <div>
          <span className="kicker">CV Builder</span>
          <h1>Napravi biografiju bez upload fajlova.</h1>
          <p>Popuni podatke, pregledaj kako izgleda i štampaj PDF direktno iz sajta.</p>
          <p className="notice" style={{ marginTop: 10, maxWidth: 600 }}>{loadMsg}</p>
        </div>
        <div className="cv-head-actions">
          <button className="btn blue" onClick={() => window.print()} type="button">Štampaj PDF</button>
          <button className="btn lime" onClick={save} type="button" disabled={saveStatus === "saving"}>{saveLabel}</button>
        </div>
      </div>

      <div className="cv-builder-grid">
        <form className="cv-builder-form" onSubmit={e => { e.preventDefault(); save(); }}>
          <div className="form-grid">
            {field("fullName", "Ime i prezime", "npr. Marko Marković")}
            {field("title", "Zanimanje / titula", "npr. Konobar, Marketing asistent")}
          </div>
          <div className="form-grid">
            {field("city", "Grad", "npr. Podgorica")}
            {field("phone", "Telefon", "+382 67 000 000")}
          </div>
          {field("email", "E-pošta", "ime@email.com")}
          {field("summary", "Kratak opis", "Ko si, šta znaš i kakav posao tražiš...", true)}
          {field("skills", "Vještine (odvoji zarezom)", "Meta Ads, Canva, rad sa gostima, engleski...", true)}
          {field("experience", "Radno iskustvo", "Firma, pozicija, period i odgovornosti...", true)}
          {field("education", "Obrazovanje", "Škola, kurs ili fakultet...", true)}
          {field("languages", "Jezici", "npr. crnogorski C2, engleski B2...", true)}
          {field("certificates", "Sertifikati i obuke", "Kursevi, licence, obuke...", true)}
          {field("availability", "Dostupnost", "Od kada možeš početi, smjene...", true)}
          <button className="btn lime" type="submit" disabled={saveStatus === "saving"}>{saveLabel}</button>
        </form>

        <article className="cv-preview">
          <header>
            <div>
              <span>Biografija</span>
              <h2>{cv.fullName || "Ime i prezime"}</h2>
              <p>{cv.title || "Pozicija / zanimanje"}</p>
            </div>
            <aside>
              {cv.city || "Grad"}<br />
              {cv.phone || "Telefon"}<br />
              {cv.email || "E-pošta"}
            </aside>
          </header>
          {cv.summary && <section><h3>Kratak opis</h3><p>{cv.summary}</p></section>}
          {skills.length > 0 && <section><h3>Vještine</h3><div className="cv-skill-list">{skills.map(s => <span key={s}>{s}</span>)}</div></section>}
          {cv.experience && <section><h3>Iskustvo</h3><p>{cv.experience}</p></section>}
          {cv.education && <section><h3>Obrazovanje</h3><p>{cv.education}</p></section>}
          {cv.languages && <section><h3>Jezici</h3><p>{cv.languages}</p></section>}
          {cv.certificates && <section><h3>Sertifikati</h3><p>{cv.certificates}</p></section>}
          {cv.availability && <section><h3>Dostupnost</h3><p>{cv.availability}</p></section>}
        </article>
      </div>
    </div>
  );
}
