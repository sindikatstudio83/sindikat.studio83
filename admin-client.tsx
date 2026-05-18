"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { desktopNavItems } from "@/lib/navigation";
import { initials } from "@/lib/format";

type AdminView = "dashboard" | "jobs" | "users" | "payments" | "companies";
type Row = Record<string, any>;
type Notice = { text: string; type: "info" | "error" | "success" };

function SideNav({ email }: { email: string }) {
  const pathname = usePathname();
  const nav = desktopNavItems["admin"];
  const name = email.split("@")[0];
  return (
    <aside className="side">
      <div className="side-head">
        <div className="side-avatar" style={{ background: "var(--pink)" }}>{initials(name)}</div>
        <strong>{name}</strong>
        <small>ADMIN · {email}</small>
      </div>
      <nav className="side-nav">
        {nav.map(item => <Link href={item.href} key={item.href} className={pathname === item.href ? "active" : ""}>{item.label}</Link>)}
      </nav>
      <Link href="/logout" className="side-logout">Odjava</Link>
    </aside>
  );
}

export function AdminClient({ view }: { view: AdminView }) {
  const { role, userId, email: authEmail, ready } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState({ jobs: 0, companies: 0, payments: 0, users: 0, revenue: 0 });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [supabase] = useState(() => createBrowserSupabase());

  function setMsg(text: string, type: Notice["type"] = "info") { setNotice({ text, type }); }

  async function guard(): Promise<boolean> {
    if (!ready) return false;
    if (!userId || role === "guest") { window.location.href = "/login?next=/admin"; return false; }
    if (role !== "admin") { window.location.href = "/"; return false; }
    setEmail(authEmail || "");
    return true;
  }

  async function load() {
    setLoading(true); setNotice(null);
    if (!await guard()) return;

    const [pendingJobs, pendingCos, pendingPay, users, paidOrders] = await Promise.all([
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      supabase.from("companies").select("id", { count: "exact", head: true }).eq("approved", false),
      supabase.from("payment_proofs").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("amount_eur").eq("status", "paid")
    ]);
    const revenue = (paidOrders.data || []).reduce((s: number, o: any) => s + (o.amount_eur || 0), 0);
    setStats({ jobs: pendingJobs.count || 0, companies: pendingCos.count || 0, payments: pendingPay.count || 0, users: users.count || 0, revenue });

    let result: any;
    if (view === "dashboard") {
      result = await supabase.from("payment_proofs").select("*,orders(id,payment_reference,amount_eur,status,plans(name)),companies(name)").eq("status", "pending").order("created_at", { ascending: false }).limit(8);
    } else if (view === "users") {
      result = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    } else if (view === "payments") {
      result = await supabase.from("payment_proofs").select("*,orders(id,payment_reference,amount_eur,status,plans(name)),companies(name)").order("created_at", { ascending: false });
    } else if (view === "companies") {
      result = await supabase.from("companies").select("*").order("created_at", { ascending: false });
    } else {
      result = await supabase.from("jobs").select("*,companies(name)").order("created_at", { ascending: false });
    }

    setRows(result?.data || []);
    if (result?.error) { console.error("[AdminClient]", result.error.message); setMsg(result.error.message, "error"); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateJob(id: number, patch: Record<string, unknown>) {
    setActing(id);
    const { error } = await supabase.from("jobs").update(patch).eq("id", id);
    if (error) { setMsg(error.message, "error"); } else { setMsg("Oglas ažuriran.", "success"); }
    setActing(null); await load();
  }

  async function updateCompany(id: number, approved: boolean) {
    setActing(id);
    const { error } = await supabase.from("companies").update({ approved }).eq("id", id);
    if (error) { setMsg(error.message, "error"); } else { setMsg(approved ? "Firma odobrena." : "Firma sakrivena.", "success"); }
    setActing(null); await load();
  }

  async function confirmProof(row: Row) {
    if (row.status !== "pending") { setMsg("Dokaz je već obrađen.", "error"); return; }
    setActing(row.id);
    const { data, error } = await supabase.rpc("confirm_payment_proof", { proof_id: row.id });
    if (error) { setMsg(error.message, "error"); } else {
      const code = Array.isArray(data) ? data[0]?.activation_code : data?.activation_code;
      setMsg(`Uplata potvrđena! Kod: ${code || "kreiran"}`, "success");
    }
    setActing(null); await load();
  }

  async function rejectProof(id: number) {
    setActing(id);
    const { error } = await supabase.from("payment_proofs").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id).eq("status", "pending");
    if (error) { setMsg(error.message, "error"); } else { setMsg("Dokaz odbijen.", "info"); }
    setActing(null); await load();
  }

  async function openProof(filePath: string) {
    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(filePath, 300);
    if (error || !data?.signedUrl) { setMsg(error?.message || "Dokaz nije dostupan.", "error"); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  const viewTitles: Record<AdminView, string> = { dashboard: "Pregled", jobs: "Oglasi", users: "Korisnici", payments: "Uplate", companies: "Firme" };
  const noticeEl = notice ? <p className={`notice ${notice.type}`} style={{ marginTop: 16 }}>{notice.text}</p> : null;

  return (
    <div className="app-shell">
      <SideNav email={email} />
      <main className="app-main">
        <div className="section-head">
          <div><span className="page-label">Upravljanje</span><h1>{viewTitles[view]}</h1><p className="sub">Pregled stavki koje traže provjeru i odluku.</p></div>
        </div>

        {view === "dashboard" && (
          <>
            <div className="dash-grid">
              <div className="metric"><strong>{stats.jobs}</strong><span>Oglasa čeka pregled</span></div>
              <div className="metric" style={stats.payments > 0 ? { background: "var(--orange)" } : {}}><strong>{stats.payments}</strong><span>Uplata čeka potvrdu</span></div>
              <div className="metric"><strong>{stats.companies}</strong><span>Firmi čeka odobrenje</span></div>
              <div className="metric"><strong>{stats.revenue}€</strong><span>Prihod ukupno</span></div>
            </div>
            <div className="grid four" style={{ marginBottom: 20 }}>
              <Link className="quick-link" href="/admin/oglasi"><strong>Oglasi ({stats.jobs})</strong><span>Pregled i moderacija</span></Link>
              <Link className="quick-link" href="/admin/uplate"><strong>Uplate ({stats.payments})</strong><span>Potvrdi plaćanja</span></Link>
              <Link className="quick-link" href="/admin/firme"><strong>Firme ({stats.companies})</strong><span>Odobri poslodavce</span></Link>
              <Link className="quick-link" href="/admin/korisnici"><strong>Korisnici ({stats.users})</strong><span>Pregled svih korisnika</span></Link>
            </div>
            <div className="section-head compact-head"><div><h2>Uplate koje čekaju potvrdu</h2></div></div>
          </>
        )}

        <div className="table-card">
          {loading && <div className="empty"><strong>Učitavanje...</strong></div>}
          {!loading && rows.map(row => (
            <div className="table-row" key={row.id}>
              <div>
                <strong>{row.title || row.email || row.full_name || row.payment_reference || row.name || row.orders?.payment_reference || row.id}</strong>
                <small>{row.description?.slice(0, 60) || row.companies?.name || row.orders?.plans?.name || row.role || row.industry || ""}</small>
              </div>
              <div>
                {row.role && <span className={`badge ${row.role === "admin" ? "pink" : row.role === "company" ? "blue" : "gray"}`}>{row.role}</span>}
                {row.approved === false && <span className="badge orange">Čeka odobrenje</span>}
                {row.approved === true && <span className="badge green">Odobrena</span>}
                {row.status && !row.approved && !row.role && <span className={`badge ${row.status === "active" ? "green" : row.status === "pending_review" ? "orange" : "gray"}`}>{row.status}</span>}
              </div>
              <div>
                {(row.amount_eur || row.orders?.amount_eur) ? <strong>{row.amount_eur || row.orders?.amount_eur} EUR</strong> : null}
                {row.created_at ? <span className="muted">{new Date(row.created_at).toLocaleDateString("sr-ME")}</span> : null}
              </div>
              <div className="actions">
                {view === "jobs" && <>
                  <button className="btn blue xs" disabled={acting === row.id} onClick={() => updateJob(row.id, { status: "active" })}>Odobri</button>
                  <button className="btn red xs" disabled={acting === row.id} onClick={() => updateJob(row.id, { status: "paused" })}>Pauziraj</button>
                  <button className="btn lime xs" disabled={acting === row.id} onClick={() => updateJob(row.id, { featured: true })}>★ Istakni</button>
                </>}
                {view === "companies" && <>
                  <button className="btn blue xs" disabled={acting === row.id} onClick={() => updateCompany(row.id, true)}>Odobri</button>
                  <button className="btn red xs" disabled={acting === row.id} onClick={() => updateCompany(row.id, false)}>Sakrij</button>
                </>}
                {(view === "payments" || view === "dashboard") && <>
                  <button className="btn ghost xs" onClick={() => openProof(row.file_path || row.proof_path)}>Otvori dokaz</button>
                  {row.status === "pending" && <>
                    <button className="btn blue xs" disabled={acting === row.id} onClick={() => confirmProof(row)}>Potvrdi</button>
                    <button className="btn red xs" disabled={acting === row.id} onClick={() => rejectProof(row.id)}>Odbij</button>
                  </>}
                  {row.status === "approved" && <span className="badge green">Potvrđeno</span>}
                </>}
              </div>
            </div>
          ))}
          {!loading && !rows.length && <div className="empty"><strong>Nema podataka</strong><p>Podaci će se prikazati kada postoje u bazi.</p></div>}
        </div>
        {noticeEl}
      </main>
    </div>
  );
}
