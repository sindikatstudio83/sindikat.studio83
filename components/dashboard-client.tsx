"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { roleHomes, roleLabels, stageLabels } from "@/lib/labels";
import { desktopNavItems } from "@/lib/navigation";
import { initials } from "@/lib/format";
import type { JobApplication, Profile, UserRole } from "@/types/domain";

function SideNav({ role, email }: { role: UserRole; email: string }) {
  const pathname = usePathname();
  const nav = role !== "guest" ? desktopNavItems[role] : [];
  return (
    <aside className="side">
      <div className="side-head">
        <div className="side-avatar">{initials(email.split("@")[0])}</div>
        <strong>{email.split("@")[0]}</strong>
        <small>{roleLabels[role].toUpperCase()} · {email}</small>
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

export function DashboardClient({ expectedRole, title }: { expectedRole: Exclude<UserRole, "guest">; title: string }) {
  const { role, userId, email, ready } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    if (role === "guest" || !userId) {
      window.location.href = "/login";
      return;
    }
    if (role !== expectedRole && role !== "admin") {
      window.location.href = roleHomes[role as Exclude<UserRole, "guest">] || "/";
      return;
    }

    const supabase = createBrowserSupabase();

    async function load() {
      // Paralelni pozivi — ne sekvencijalni
      const promises: Promise<any>[] = [
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle()
      ];
      if (expectedRole === "candidate") {
        promises.push(
          supabase.from("job_applications")
            .select("*,jobs(id,title,company_id,companies(name))")
            .eq("candidate_id", userId!)
            .order("created_at", { ascending: false })
            .limit(20)
        );
      }

      const [profResult, appResult] = await Promise.all(promises);
      setProfile((profResult.data || { id: userId, role, full_name: null, email, phone: null, city: null }) as Profile);
      if (appResult) setApplications((appResult.data || []) as JobApplication[]);
      setLoading(false);
    }

    load();
  }, [ready, role, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready || loading) return (
    <div className="app-shell">
      <div style={{ gridColumn: "1/-1", padding: "60px 20px", textAlign: "center", color: "var(--muted)" }}>
        <p>Učitavanje...</p>
      </div>
    </div>
  );

  const cv = profile?.cv_data;
  const cvFields = ["fullName", "title", "city", "phone", "email", "summary", "skills", "experience", "education"] as const;
  const cvFilled = cvFields.filter(f => Boolean((cv as Record<string, unknown> | undefined)?.[f])).length;
  const cvPct = Math.round((cvFilled / cvFields.length) * 100);
  const pending = applications.filter(a => a.stage === "applied").length;
  const active = applications.filter(a => ["interview", "shortlist", "offer"].includes(a.stage)).length;

  return (
    <div className="app-shell">
      <SideNav role={role} email={email || ""} />
      <main className="app-main">
        <div className="section-head">
          <div>
            <span className="page-label">{title}</span>
            <h1>{profile?.full_name || email?.split("@")[0]}</h1>
            <p className="sub">{email}</p>
          </div>
          <div className="head-actions">
            <Link className="btn blue" href="/oglasi">Pretraži oglase</Link>
            <Link className="btn ghost" href="/profil/biografija">Uredi biografiju</Link>
          </div>
        </div>

        {cvPct < 60 && (
          <div className="notice-card warn" style={{ marginBottom: 16 }}>
            <strong>Biografija nije kompletna — {cvPct}%</strong>
            <p>Dopuni biografiju da bi mogao aplicirati na oglase.</p>
            <Link className="btn blue sm" href="/profil/biografija">Dopuni odmah →</Link>
          </div>
        )}

        <div className="dash-grid">
          <div className="metric"><strong>{applications.length}</strong><span>Prijava ukupno</span></div>
          <div className="metric"><strong>{pending}</strong><span>Na čekanju</span></div>
          <div className="metric"><strong>{active}</strong><span>U toku</span></div>
          <div className="metric"><strong>{cvPct}%</strong><span>Biografija</span></div>
        </div>

        <div className="quick-links">
          <Link className="quick-link" href="/oglasi"><strong>Pretraži oglase</strong><span>Pronađi novi posao</span></Link>
          <Link className="quick-link" href="/profil/biografija"><strong>Uredi biografiju</strong><span>{cvPct}% popunjeno</span></Link>
          <Link className="quick-link" href="/profil/prijave"><strong>Sve prijave</strong><span>{applications.length} prijava</span></Link>
        </div>

        <div className="section-head compact-head">
          <div><h2>Nedavne prijave</h2></div>
          {applications.length > 5 && <Link className="btn ghost sm" href="/profil/prijave">Sve →</Link>}
        </div>

        <div className="table-card">
          {applications.slice(0, 5).map(app => (
            <div className="table-row" key={app.id}>
              <div>
                <strong>{(app.jobs as any)?.title || "Oglas"}</strong>
                <small>{(app.jobs as any)?.companies?.name || ""}</small>
              </div>
              <div><span className={`status-badge stage-${app.stage}`}>{stageLabels[app.stage]}</span></div>
              <div className="muted">{app.reference_code}</div>
              <div className="muted">{new Date(app.created_at).toLocaleDateString("sr-ME")}</div>
            </div>
          ))}
          {!applications.length && (
            <div className="empty">
              <strong>Nema prijava još</strong>
              <p>Pronađi oglas i pošalji prvu prijavu.</p>
              <Link className="btn blue sm" href="/oglasi">Otvori oglase →</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
