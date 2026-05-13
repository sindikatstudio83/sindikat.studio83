"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { safeMessage, logError } from "@/lib/errors";
import { ImageUpload } from "@/components/image-upload";
import { getCompanyActivePlan } from "@/lib/queries/account";
import { slugify, initials } from "@/lib/format";
import { roleLabels } from "@/lib/labels";
import { desktopNavItems } from "@/lib/navigation";
import type { Company, Job, JobApplication, LookupItem, Order, Plan } from "@/types/domain";




function SideNav({ email }: { email: string }) {
  const pathname = usePathname();
  const nav = desktopNavItems["company"];
  const name = email.split("@")[0];
  return (
    <aside className="side">
      <div className="side-head">
        <div className="side-avatar">{initials(name)}</div>
        <strong>{name}</strong>
        <small>FIRMA · {email}</small>
      </div>
      <nav className="side-nav">
        {nav.map(item => (
          <Link href={item.href} key={item.href} className={pathname === item.href ? "active" : ""}>{item.label}</Link>
        ))}
      </nav>
      <Link href="/logout" className="side-logout">Odjava</Link>
    </aside>
  );
}

export function CompanyClient({ view }: { view: "dashboard" | "jobs" | "new-job" | "billing" }) {
  const { role, userId, email: authEmail, ready } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [cities, setCities] = useState<LookupItem[]>([]);
  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activePlan, setActivePlan] = useState<{ plan_name: string; active_jobs_limit: number; active_until: string | null; is_active: boolean } | null>(null);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<{ text: string; type: "info" | "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supabase] = useState(() => createBrowserSupabase());

  async function load() {
    if (!ready) return;
    if (!userId || role === "guest") {
      // Guard: only redirect if not already on login page
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }
    if (role !== "company" && role !== "admin") {
      if (!window.location.pathname.startsWith("/profil")) {
        window.location.replace("/profil");
      }
      return;
    }
    setEmail(authEmail || "");

    const [cityRows, categoryRows, planRows, companyResult] = await Promise.all([
      supabase.from("cities").select("id,name,slug").order("name"),
      supabase.from("categories").select("id,name,slug").order("name"),
      supabase.from("plans").select("*").order("price_eur"),
      supabase.from("companies").select("*").eq("owner_id", userId).maybeSingle()
    ]);

    const myCompany = companyResult.data as Company | null;
    setCities((cityRows.data || []) as LookupItem[]);
    setCategories((categoryRows.data || []) as LookupItem[]);
    setPlans((planRows.data || []) as Plan[]);
    setCompany(myCompany);

    if (myCompany) {
      const [jobRows, appRows, orderRows, planData] = await Promise.all([
        supabase.from("jobs").select("*,companies(id,name,slug),categories(id,name),cities(id,name)").eq("company_id", myCompany.id).order("created_at", { ascending: false }),
        supabase.from("job_applications").select("*,jobs!inner(id,title,company_id),profiles(full_name,email,phone,city,cv_data,cv_updated_at)").eq("jobs.company_id", myCompany.id).order("created_at", { ascending: false }),
        supabase.from("orders").select("*,plans(name),companies(name)").eq("company_id", myCompany.id).order("created_at", { ascending: false }),
        getCompanyActivePlan(myCompany.id)
      ]);
      setJobs((jobRows.data || []) as Job[]);
      setApplications((appRows.data || []) as JobApplication[]);
      setOrders((orderRows.data || []) as Order[]);
      setActivePlan(planData ? { plan_name: planData.plan_name, active_jobs_limit: planData.active_jobs_limit, active_until: planData.active_until, is_active: planData.is_active } : null);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (ready) load();
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  function setMsg(text: string, type: "info" | "error" | "success" = "info") { setNotice({ text, type }); }

  async function updateLogo(newPath: string) {
    if (!company?.id) {
      throw new Error("Logo se može upload-ovati nakon kreiranja profila firme.");
    }
    const { error } = await supabase
      .from("companies")
      .update({ logo_path: newPath || null })
      .eq("id", company.id);
    if (error) {
      logError("CompanyClient.updateLogo", error);
      throw error;
    }
    setCompany(c => c ? { ...c, logo_path: newPath || null } : c);
  }

  async function saveCompany(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setNotice(null);
    if (!userId) { setSaving(false); return; }
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    if (!name) { setMsg("Upiši naziv firme.", "error"); setSaving(false); return; }
    const row = {
      owner_id: userId,
      name,
      slug: company?.slug || `${slugify(name)}-${userId!.slice(0, 8)}`,
      city: String(fd.get("city") || "").trim(),
      industry: String(fd.get("industry") || "").trim(),
      website: String(fd.get("website") || "").trim() || null,
      description: String(fd.get("description") || "").trim()
    };
    const result = company ? await supabase.from("companies").update(row).eq("id", company.id) : await supabase.from("companies").insert(row);
    if (result.error) { logError("CompanyClient.save", result.error); setMsg(safeMessage(result.error, "save"), "error"); } else { setMsg(company ? "Profil firme je sačuvan." : "Profil firme je kreiran i čeka odobrenje.", "success"); }
    setSaving(false); await load();
  }

  async function createJob(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!company) { setMsg("Prvo kreiraj profil firme.", "error"); return; }
    if (!company.approved) { setMsg("Profil firme mora biti odobren.", "error"); return; }
    setSaving(true); setNotice(null);
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "").trim();
    const categoryId = Number(fd.get("category_id")); const cityId = Number(fd.get("city_id"));
    if (!title) { setMsg("Upiši naziv pozicije.", "error"); setSaving(false); return; }
    if (!categoryId || !cityId) { setMsg("Izaberi grad i kategoriju.", "error"); setSaving(false); return; }
    const row = {
      company_id: company.id, category_id: categoryId, city_id: cityId, title,
      slug: `${slugify(title)}-${Date.now()}`,
      description: String(fd.get("description") || "").trim(),
      contract_type: String(fd.get("contract_type") || "").trim(),
      salary_text: String(fd.get("salary_text") || "").trim(),
      deadline: String(fd.get("deadline") || "") || null,
      status: "pending_review", featured: false
    };
    const { error } = await supabase.from("jobs").insert(row);
    if (error) { logError("CompanyClient.createJob", error); setMsg(safeMessage(error, "submit"), "error"); } else { setMsg("Oglas je poslat na odobrenje.", "success"); (e.target as HTMLFormElement).reset(); }
    setSaving(false); await load();
  }


  async function orderPlan(plan: Plan, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!company) return;
    setSaving(true); setNotice(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get("proof");
    if (!(file instanceof File) || !file.size) { setMsg("Dodaj dokaz uplate.", "error"); setSaving(false); return; }
    if (file.size > 10 * 1024 * 1024) { setMsg("Fajl je prevelik (max 10MB).", "error"); setSaving(false); return; }

    const { data: orderData, error: orderError } = await supabase.from("orders").insert({
      company_id: company.id, plan_id: plan.id, status: "pending", amount_eur: plan.price_eur,
      payment_reference: `IP-${Date.now()}`
    }).select("id,payment_reference").single();
    if (orderError || !orderData) { logError("CompanyClient.order", orderError); setMsg(safeMessage(orderError, "submit"), "error"); setSaving(false); return; }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const filePath = `${company.id}/${orderData.id}-${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(filePath, file, { upsert: false });
    if (uploadError) {
      await supabase.from("orders").delete().eq("id", orderData.id);
      logError("CompanyClient.upload", uploadError); setMsg(safeMessage(uploadError, "submit"), "error"); setSaving(false); return;
    }
    await supabase.from("payment_proofs").insert({
      order_id: orderData.id, company_id: company.id, amount_eur: plan.price_eur,
      file_path: filePath, proof_path: filePath, file_name: file.name,
      note: String(fd.get("note") || "").trim() || null, status: "pending"
    });
    setMsg(`Dokaz poslat! Poziv na broj: ${orderData.payment_reference}`, "success");
    (e.target as HTMLFormElement).reset(); setSaving(false); await load();
  }

  if (loading) return (
    <div className="app-shell">
      <div className="loading-panel" style={{ gridColumn: "1/-1" }}><p>Učitavanje...</p></div>
    </div>
  );

  const noticeEl = notice ? <p className={`notice ${notice.type}`} style={{ marginTop: 12 }}>{notice.text}</p> : null;

  // DASHBOARD
  if (view === "dashboard") return (
    <div className="app-shell">
      <SideNav email={email} />
      <main className="app-main">
        <div className="section-head">
          <div><span className="page-label">Firma</span><h1>{company?.name || "Pregled firme"}</h1><p className="sub">Profil firme, oglasi i prijave.</p></div>
          <div className="head-actions"><Link className="btn blue" href="/firma/novi-oglas">+ Novi oglas</Link></div>
        </div>
        <div className="dash-grid">
          <div className="metric"><strong>{jobs.filter(j => j.status === "active").length}</strong><span>Aktivnih oglasa</span></div>
          <div className="metric"><strong>{applications.length}</strong><span>Ukupno prijava</span></div>
          <div className="metric"><strong>{orders.filter(o => o.status === "pending").length}</strong><span>Pending uplate</span></div>
          <div className="metric">
            <strong>{activePlan ? activePlan.plan_name : "—"}</strong>
            <span>{activePlan?.is_active ? "Aktivan plan" : "Bez plana"}</span>
          </div>
        </div>
        <div className="grid three" style={{ marginBottom: 16 }}>
          <Link className="quick-link" href="/firma/novi-oglas"><strong>✏️ Objavi oglas</strong><span>Pošalji na odobrenje</span></Link>
          <Link className="quick-link" href="/firma/selekcija"><strong>🗂 ATS selekcija</strong><span>{applications.length} prijava</span></Link>
          <Link className="quick-link" href="/firma/pretplata"><strong>💳 Plan i uplate</strong><span>Upravljaj pretplatom</span></Link>
        </div>
        {!company ? (
          <div className="notice-card warn">
            <strong>Profil firme nije kreiran</strong>
            <p>Popuni podatke o firmi da bi mogao objavljivati oglase.</p>
          </div>
        ) : !company.approved ? (
          <div className="notice-card warn">
            <strong>Profil firme čeka odobrenje</strong>
            <p>Admin pregleda profil i aktivira ga. Oglas možeš poslati nakon odobrenja.</p>
          </div>
        ) : null}
        <form className="form-card" onSubmit={saveCompany}>
          <div className="kicker" style={{ marginBottom: 4 }}>Profil firme</div>
          {company?.id && userId && (
            <div style={{ marginBottom: 8 }}>
              <span className="label">Logo firme</span>
              <ImageUpload
                bucket="company-logos"
                ownerUserId={userId}
                currentPath={company.logo_path || null}
                fallbackText={company.name || "Firma"}
                shape="rounded"
                size={88}
                onUploaded={updateLogo}
              />
            </div>
          )}
          <label><span className="label">Naziv firme</span><input className="field" name="name" defaultValue={company?.name || ""} required /></label>
          <div className="form-grid">
            <label><span className="label">Grad</span><input className="field" name="city" defaultValue={company?.city || ""} /></label>
            <label><span className="label">Djelatnost</span><input className="field" name="industry" defaultValue={company?.industry || ""} /></label>
          </div>
          <label><span className="label">Website (opciono)</span><input className="field" name="website" type="url" placeholder="https://" defaultValue={company?.website || ""} /></label>
          <label><span className="label">Opis firme</span><textarea className="textarea" name="description" defaultValue={company?.description || ""} /></label>
          <button className="btn blue" disabled={saving}>{saving ? "Čuvanje..." : "Sačuvaj profil firme"}</button>
          {noticeEl}
        </form>
      </main>
    </div>
  );

  // JOBS
  if (view === "jobs") return (
    <div className="app-shell">
      <SideNav email={email} />
      <main className="app-main">
        <div className="section-head">
          <div><span className="page-label">Firma</span><h1>Moji oglasi</h1></div>
          <Link className="btn blue" href="/firma/novi-oglas">+ Novi oglas</Link>
        </div>
        <div className="job-list">
          {jobs.map(job => (
            <article className="job-card" key={job.id} style={{ position: "relative" }}>
              <div className="logo">{job.companies ? initials(job.companies.name) : "FI"}</div>
              <div>
                <div className="tags" style={{ marginBottom: 7 }}>
                  {job.categories?.name && <span className="badge blue">{job.categories.name}</span>}
                  <span className={`badge ${job.status === "active" ? "green" : job.status === "pending_review" ? "orange" : "gray"}`}>
                    {job.status === "active" ? "Aktivan" : job.status === "pending_review" ? "Na pregledu" : job.status}
                  </span>
                </div>
                <span className="job-title">{job.title}</span>
                <div className="meta">{job.cities?.name && <span>· {job.cities.name}</span>}</div>
              </div>
              <div className="job-actions">
                <Link className="btn lime sm" href="/firma/selekcija">ATS →</Link>
              </div>
            </article>
          ))}
          {!jobs.length && <div className="empty"><strong>Nema oglasa</strong><p>Pošalji prvi oglas na odobrenje.</p><Link className="btn blue sm" href="/firma/novi-oglas">Novi oglas →</Link></div>}
        </div>
      </main>
    </div>
  );

  // NEW JOB
  if (view === "new-job") return (
    <div className="app-shell">
      <SideNav email={email} />
      <main className="app-main">
        <div className="section-head">
          <div><span className="page-label">Firma</span><h1>Novi oglas</h1><p className="sub">Oglas ide na pregled prije javnog prikaza.</p></div>
        </div>
        {!company?.approved && <div className="notice-card warn" style={{ marginBottom: 16 }}><strong>Profil firme čeka odobrenje</strong><p>Oglas možeš poslati tek nakon odobrenja profila.</p></div>}
        <form className="form-card" onSubmit={createJob}>
          <label><span className="label">Naziv pozicije *</span><input className="field" name="title" placeholder="npr. Event Coordinator" required /></label>
          <div className="form-grid">
            <label><span className="label">Grad *</span>
              <select className="select" name="city_id" required>
                <option value="">Izaberi grad</option>
                {cities.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label><span className="label">Kategorija *</span>
              <select className="select" name="category_id" required>
                <option value="">Izaberi kategoriju</option>
                {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label><span className="label">Tip ugovora</span><input className="field" name="contract_type" placeholder="Stalni, sezonski, ugovor..." /></label>
            <label><span className="label">Plata / naknada</span><input className="field" name="salary_text" placeholder="800–1200€ / po dogovoru" /></label>
          </div>
          <label><span className="label">Rok prijave</span><input className="field" type="date" name="deadline" min={new Date().toISOString().split("T")[0]} /></label>
          <label><span className="label">Opis oglasa *</span><textarea className="textarea" name="description" placeholder="Opis uloge, zahtjevi, šta nudite..." required /></label>
          <button className="btn blue" disabled={saving || !company?.approved}>{saving ? "Slanje..." : "Pošalji na odobrenje →"}</button>
          {noticeEl}
        </form>
      </main>
    </div>
  );

  // BILLING
  return (
    <div className="app-shell">
      <SideNav email={email} />
      <main className="app-main">
        <div className="section-head">
          <div><span className="page-label">Pretplata</span><h1>Planovi i uplata</h1><p className="sub">Bankovni transfer → admin potvrđuje → plan aktivan.</p></div>
        </div>
        {company?.id && (
          <div className={`plan-status-banner ${activePlan?.is_active ? "active" : "none"}`} style={{ marginBottom: 18 }}>
            <div>
              <strong>{activePlan?.is_active ? `Aktivan plan: ${activePlan.plan_name}` : "Nemaš aktivan plan"}</strong>
              <p>{activePlan?.is_active
                ? `Limit aktivnih oglasa: ${activePlan.active_jobs_limit}.${activePlan.active_until ? ` Važi do ${new Date(activePlan.active_until).toLocaleDateString("sr-ME")}.` : ""}`
                : "Aktiviraj plan da bi mogao objavljivati oglase. Potvrda uplate je obavezna."
              }</p>
            </div>
          </div>
        )}
        <div className="notice-card" style={{ marginBottom: 20 }}>
          <strong>Podaci za uplatu</strong>
          <div className="bk-box">
            <strong>Primalac:</strong> imaposla.me<br />
            <strong>Svrha:</strong> Aktivacija plana za firmu {company?.name || ""}
          </div>
          <p>Nakon slanja dokaza, admin potvrđuje uplatu i aktivira plan.</p>
        </div>
        <div className="grid three with-top-space">
          {plans.map(plan => (
            <form className="plan-card" key={plan.id} onSubmit={e => orderPlan(plan, e)}>
              <h2 style={{ fontSize: 24 }}>{plan.name}</h2>
              <div className="plan-price">{plan.price_eur}€<span style={{ fontSize: 14, fontWeight: 400 }}>/mjes</span></div>
              <ul className="plan-features">{plan.features?.map(f => <li key={f}>{f}</li>)}</ul>
              <label><span className="label">Dokaz uplate (slika/PDF, max 10MB)</span><input className="field" name="proof" type="file" accept="image/*,.pdf" required /></label>
              <label><span className="label">Napomena</span><input className="field" name="note" placeholder="Broj transakcije ili napomena" /></label>
              <button className="btn blue sm" disabled={saving}>{saving ? "Slanje..." : "Pošalji dokaz →"}</button>
            </form>
          ))}
        </div>
        <div className="section-head compact-head"><div><h2>Moje narudžbine</h2></div></div>
        <div className="table-card">
          {orders.map(o => (
            <div className="table-row" key={o.id}>
              <div><strong>{o.payment_reference}</strong><small className="order-code">{(o.plans as any)?.name || "Plan"}</small></div>
              <div>{o.amount_eur} EUR</div>
              <div><span className={`badge ${o.status === "paid" ? "green" : o.status === "pending" ? "orange" : "gray"}`}>{o.status}</span></div>
              <div>{o.activation_code ? <span className="order-code">{o.activation_code}</span> : <span className="muted">Čeka potvrdu</span>}</div>
            </div>
          ))}
          {!orders.length && <div className="empty"><strong>Nema uplata</strong><p>Prva uplata će se prikazati kada pošalješ dokaz.</p></div>}
        </div>
        {noticeEl}
      </main>
    </div>
  );
}
