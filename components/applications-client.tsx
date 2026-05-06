"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { stageLabels, stageOrder } from "@/lib/labels";
import { normalizeRole } from "@/lib/auth-role";
import type { JobApplication } from "@/types/domain";

export function ApplicationsClient() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createBrowserSupabase());

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { window.location.href = "/login"; return; }

      const { data: profileData } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (normalizeRole(profileData?.role) !== "candidate") { window.location.href = "/profil"; return; }

      const { data: appData } = await supabase
        .from("job_applications")
        .select("*,jobs(id,title,slug,company_id,companies(name,slug))")
        .eq("candidate_id", data.user.id)
        .order("created_at", { ascending: false });

      setApplications((appData || []) as JobApplication[]);
      setLoading(false);
    }
    load();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="panel"><p>Učitavanje prijava...</p></div>;

  const filtered = filter === "all" ? applications : applications.filter((a) => a.stage === filter);

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="page-label">Kandidat</span>
          <h1>Moje prijave</h1>
          <p className="sub">{applications.length} prijava ukupno</p>
        </div>
        <Link className="btn blue" href="/oglasi">Traži novi posao</Link>
      </div>

      {/* Filter by stage */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Sve ({applications.length})
        </button>
        {stageOrder.map((stage) => {
          const count = applications.filter((a) => a.stage === stage).length;
          if (!count) return null;
          return (
            <button
              key={stage}
              className={`tab ${filter === stage ? "active" : ""}`}
              onClick={() => setFilter(stage)}
            >
              {stageLabels[stage]} ({count})
            </button>
          );
        })}
      </div>

      <div className="table-card">
        {filtered.map((app) => (
          <div className="table-row" key={app.id}>
            <div>
              <strong>{(app.jobs as any)?.title || "Oglas"}</strong>
              <small>{(app.jobs as any)?.companies?.name || ""}</small>
            </div>
            <div>
              <span className={`status-badge stage-${app.stage}`}>{stageLabels[app.stage]}</span>
            </div>
            <div className="muted">{app.reference_code}</div>
            <div className="muted">{new Date(app.created_at).toLocaleDateString("sr-ME")}</div>
          </div>
        ))}
        {!filtered.length && (
          <div className="empty">
            <strong>Nema prijava u ovoj kategoriji</strong>
            {filter !== "all"
              ? <button className="btn ghost sm" onClick={() => setFilter("all")}>Prikaži sve</button>
              : <Link className="btn blue" href="/oglasi">Pronađi oglas</Link>
            }
          </div>
        )}
      </div>
    </section>
  );
}
