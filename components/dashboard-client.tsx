"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { stageLabels } from "@/lib/labels";
import { normalizeRole } from "@/lib/auth-role";
import type { JobApplication, Profile, UserRole } from "@/types/domain";

type AccountState = {
  role: UserRole;
  profile: Profile | null;
  applications: JobApplication[];
};

export function DashboardClient({ expectedRole, title }: { expectedRole: Exclude<UserRole, "guest">; title: string }) {
  const [account, setAccount] = useState<AccountState>({ role: "guest", profile: null, applications: [] });
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createBrowserSupabase());

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { window.location.href = "/login"; return; }

      const user = data.user;
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      const role = normalizeRole(profileData?.role);

      if (role === "guest") { window.location.href = "/login"; return; }
      if (role !== expectedRole && role !== "admin") {
        const homes: Record<string, string> = { candidate: "/profil", company: "/firma", admin: "/admin" };
        window.location.href = homes[role] || "/";
        return;
      }

      let apps: JobApplication[] = [];
      if (expectedRole === "candidate") {
        const { data: appData } = await supabase
          .from("job_applications")
          .select("*,jobs(id,title,company_id,companies(name))")
          .eq("candidate_id", user.id)
          .order("created_at", { ascending: false });
        apps = (appData || []) as JobApplication[];
      }

      const profile = (profileData || {
        id: user.id, role, full_name: null,
        email: user.email || null, phone: null, city: null
      }) as Profile;

      setAccount({ role, profile, applications: apps });
      setLoading(false);
    }
    load();
  }, [expectedRole, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="panel loading-panel">
      <div className="loading-spinner" />
      <p>Učitavanje profila...</p>
    </div>
  );

  // CV completeness
  const cv = account.profile?.cv_data;
  const cvFields = ["fullName", "title", "city", "phone", "email", "summary", "skills", "experience", "education"] as const;
  const cvFilled = cvFields.filter((f) => Boolean((cv as Record<string, unknown> | undefined)?.[f])).length;
  const cvPct = Math.round((cvFilled / cvFields.length) * 100);

  return (
    <section>
      {/* Profile header */}
      <div className="section-head">
        <div>
          <span className="page-label">{title}</span>
          <h1>{account.profile?.full_name || "Moj profil"}</h1>
          <p className="sub">{account.profile?.email}</p>
        </div>
        <div className="head-actions">
          <Link className="btn blue" href="/profil/biografija">Uredi biografiju</Link>
        </div>
      </div>

      {/* CV completion warning */}
      {cvPct < 60 && (
        <div className="notice-card warn">
          <strong>Biografija nije kompletna — {cvPct}%</strong>
          <p>Dopuni biografiju da bi mogao aplicirati na oglase. Firma vidi tvoj profil pri prijavi.</p>
          <Link className="btn blue sm" href="/profil/biografija">Dopuni odmah</Link>
        </div>
      )}

      {/* Stats */}
      <div className="dash-grid">
        <div className="metric">
          <strong>{account.applications.length}</strong>
          <span>Prijava ukupno</span>
        </div>
        <div className="metric">
          <strong>{account.applications.filter((a) => a.stage === "applied").length}</strong>
          <span>Na čekanju</span>
        </div>
        <div className="metric">
          <strong>{account.applications.filter((a) => ["interview", "shortlist", "offer"].includes(a.stage)).length}</strong>
          <span>U toku</span>
        </div>
        <div className="metric">
          <strong>{cvPct}%</strong>
          <span>Biografija</span>
        </div>
      </div>

      {/* Quick links */}
      <div className="quick-links">
        <Link className="quick-link" href="/oglasi">
          <strong>Pretraži oglase</strong>
          <span>Pronađi novi posao</span>
        </Link>
        <Link className="quick-link" href="/profil/biografija">
          <strong>Uredi biografiju</strong>
          <span>{cvPct}% popunjeno</span>
        </Link>
        <Link className="quick-link" href="/profil/prijave">
          <strong>Sve prijave</strong>
          <span>{account.applications.length} prijava</span>
        </Link>
      </div>

      {/* Recent applications */}
      <div className="section-head compact-head">
        <div><h2>Nedavne prijave</h2></div>
        {account.applications.length > 5 && (
          <Link className="btn ghost sm" href="/profil/prijave">Sve prijave</Link>
        )}
      </div>

      <div className="table-card">
        {account.applications.slice(0, 5).map((app) => (
          <div className="table-row" key={app.id}>
            <div>
              <strong>{(app.jobs as any)?.title || "Oglas"}</strong>
              <small>{(app.jobs as any)?.companies?.name || ""}</small>
            </div>
            <div>
              <span className={`status-badge stage-${app.stage}`}>{stageLabels[app.stage]}</span>
            </div>
            <div className="muted">{new Date(app.created_at).toLocaleDateString("sr-ME")}</div>
          </div>
        ))}
        {!account.applications.length && (
          <div className="empty">
            <strong>Nema prijava još</strong>
            <p>Pronađi oglas koji ti odgovara i pošalji prvu prijavu.</p>
            <Link className="btn blue" href="/oglasi">Otvori oglase</Link>
          </div>
        )}
      </div>
    </section>
  );
}
