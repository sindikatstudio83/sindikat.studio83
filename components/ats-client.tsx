"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { logError, safeMessage } from "@/lib/errors";
import { initials, formatDate } from "@/lib/format";
import { stageLabels, stageOrder } from "@/lib/labels";
import { desktopNavItems } from "@/lib/navigation";
import { AtsDetailPanel } from "@/components/ats-detail-panel";
import type { Company, JobApplication } from "@/types/domain";

// ── Types ────────────────────────────────────────────────────
type Profile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  cv_data?: { summary?: string } | null;
};

type AppLabel = { label: string };
type AppComment = { id: number };

type RichApp = JobApplication & {
  profiles: Profile | null;
  jobs: { id: number; title: string; company_id: number } | null;
  application_labels: AppLabel[];
  application_comments: AppComment[];
};

type Stage = typeof stageOrder[number];

// ── Stage config ─────────────────────────────────────────────
const STAGE_CONFIG: Record<Stage, { color: string; bg: string; emoji: string }> = {
  applied:   { color: "#2148ff", bg: "rgba(33,72,255,.09)",   emoji: "📥" },
  review:    { color: "#6d665f", bg: "rgba(109,102,95,.09)",  emoji: "🔍" },
  interview: { color: "#ff8a2a", bg: "rgba(255,138,42,.09)", emoji: "💬" },
  shortlist: { color: "#9333ea", bg: "rgba(147,51,234,.09)", emoji: "⭐" },
  offer:     { color: "#ff4fa3", bg: "rgba(255,79,163,.09)", emoji: "📋" },
  hired:     { color: "#13b76d", bg: "rgba(19,183,109,.09)", emoji: "✅" },
  rejected:  { color: "#e5484d", bg: "rgba(229,72,77,.09)",  emoji: "✗"  },
};

const LABEL_OPTS = [
  { key: "top",       label: "Top",        color: "#22c55e" },
  { key: "interview", label: "Intervju",   color: "#f59e0b" },
  { key: "rejected",  label: "Ne odgovara", color: "#ef4444" },
  { key: "followup",  label: "Kasniji",    color: "#a78bfa" },
  { key: "star",      label: "Zvjezdica",  color: "#3b82f6" },
] as const;

// ── Side nav (same as CompanyClient) ─────────────────────────
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

// ── Candidate avatar initials ─────────────────────────────────
function CandAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div
      className="ats-avatar"
      style={{ width: size, height: size, fontSize: size * 0.35, flexShrink: 0 }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

// ── Stage move helper ─────────────────────────────────────────
function stageMoveButtons(
  app: RichApp,
  onMove: (id: number, stage: Stage) => void,
  moving: boolean
) {
  const idx = stageOrder.indexOf(app.stage as Stage);
  return (
    <div className="ats-card-actions" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        className="ats-move-btn"
        disabled={idx === 0 || moving}
        onClick={() => onMove(app.id, stageOrder[idx - 1])}
        title={idx > 0 ? stageLabels[stageOrder[idx - 1]] : undefined}
      >← Nazad</button>
      <button
        type="button"
        className="ats-move-btn fwd"
        disabled={idx >= stageOrder.length - 1 || moving}
        onClick={() => onMove(app.id, stageOrder[idx + 1])}
        title={idx < stageOrder.length - 1 ? stageLabels[stageOrder[idx + 1]] : undefined}
      >Dalje →</button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function AtsClient() {
  const { role, userId, email: authEmail, ready } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [apps, setApps] = useState<RichApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const email = authEmail || "";
  const supabase = createBrowserSupabase();
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const companyResult = await supabase
      .from("companies")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();

    const myCompany = companyResult.data as Company | null;
    setCompany(myCompany);

    if (myCompany) {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          jobs!inner(id,title,company_id),
          profiles(full_name,email,phone,city,cv_data),
          application_labels(label),
          application_comments(id)
        `)
        .eq("jobs.company_id", myCompany.id)
        .order("created_at", { ascending: false });

      if (error) {
        logError("AtsClient.load", error);
      } else {
        setApps((data || []) as unknown as RichApp[]);
      }
    }
    setLoading(false);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready) return;
    if (!userId || role === "guest") {
      window.location.href = "/login?next=/firma/selekcija";
      return;
    }
    if (role !== "company" && role !== "admin") {
      window.location.href = "/profil";
      return;
    }
    load();
  }, [ready, userId, role, load]);

  // Close panel on outside click (mobile)
  useEffect(() => {
    if (!panelOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") { setPanelOpen(false); setSelectedAppId(null); } }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  async function moveStage(appId: number, nextStage: Stage) {
    setMoving(true);
    const { error } = await supabase
      .from("job_applications")
      .update({ stage: nextStage })
      .eq("id", appId);
    if (error) {
      logError("AtsClient.moveStage", error);
      setNotice(safeMessage(error, "save"));
    } else {
      setApps(prev => prev.map(a => a.id === appId ? { ...a, stage: nextStage } : a));
      setNotice(null);
    }
    setMoving(false);
  }

  function openDetail(appId: number) {
    setSelectedAppId(appId);
    setPanelOpen(true);
  }

  function closeDetail() {
    setPanelOpen(false);
    setSelectedAppId(null);
  }

  const selectedApp = apps.find(a => a.id === selectedAppId) || null;

  // Stage counts
  const stageCounts = stageOrder.reduce<Record<string, number>>((acc, s) => {
    acc[s] = apps.filter(a => a.stage === s).length;
    return acc;
  }, {});

  // Filtered list
  const visibleApps = selectedStage ? apps.filter(a => a.stage === selectedStage) : apps;

  // Loading & auth guards
  if (!ready || loading) {
    return (
      <div className="app-shell">
        <main className="app-main">
          <div className="ats-loading">
            <div className="ats-loading-spinner" />
            <p>Učitavanje prijava...</p>
          </div>
        </main>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <SideNav email={email} />
      <main className="app-main ats-page">

        {/* Header */}
        <div className="ats-header">
          <div>
            <span className="kicker">Firma</span>
            <h1 className="ats-title">Selekcija prijava</h1>
            <p className="ats-subtitle">
              {apps.length === 0 ? "Još nema prijava." : `${apps.length} ${apps.length === 1 ? "prijava" : "prijava"} ukupno`}
            </p>
          </div>
          {selectedStage && (
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => setSelectedStage(null)}
            >
              Pokaži sve ×
            </button>
          )}
        </div>

        {notice && (
          <p className="notice error" role="alert" style={{ marginBottom: 12 }}>{notice}</p>
        )}

        {apps.length === 0 ? (
          <div className="ats-empty">
            <div className="ats-empty-icon">📭</div>
            <strong>Nema prijava</strong>
            <p>Kada kandidati apliciraju na tvoje oglase, pojaviće se ovdje.</p>
            <Link className="btn blue" href="/firma/oglasi">Upravljaj oglasima →</Link>
          </div>
        ) : (
          <>
            {/* ── Pipeline summary bar ────────────────────────── */}
            <div className="ats-pipeline" role="tablist" aria-label="Faze selekcije">
              {stageOrder.map(stage => {
                const cfg = STAGE_CONFIG[stage];
                const count = stageCounts[stage];
                const isActive = selectedStage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`ats-pipeline-btn${isActive ? " active" : ""}${stage === "rejected" ? " rejected" : ""}`}
                    style={isActive ? { background: cfg.bg, borderColor: cfg.color, color: cfg.color } : undefined}
                    onClick={() => setSelectedStage(isActive ? null : stage)}
                  >
                    <span className="ats-pipeline-emoji" aria-hidden>{cfg.emoji}</span>
                    <span className="ats-pipeline-label">{stageLabels[stage]}</span>
                    <span
                      className="ats-pipeline-count"
                      style={count > 0 ? { background: cfg.color, color: "#fff" } : undefined}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── Main layout: list + detail panel ───────────── */}
            <div className={`ats-body${panelOpen ? " panel-open" : ""}`}>

              {/* Left: candidate list */}
              <div className="ats-list-col">
                {/* Section heading */}
                <div className="ats-list-heading">
                  {selectedStage ? (
                    <>
                      <span className="ats-list-stage-dot" style={{ background: STAGE_CONFIG[selectedStage].color }} />
                      <strong>{stageLabels[selectedStage]}</strong>
                      <span className="ats-list-count">{visibleApps.length}</span>
                    </>
                  ) : (
                    <>
                      <strong>Sve prijave</strong>
                      <span className="ats-list-count">{apps.length}</span>
                    </>
                  )}
                </div>

                {visibleApps.length === 0 && (
                  <div className="ats-stage-empty">
                    <p>Nema kandidata u ovoj fazi.</p>
                  </div>
                )}

                {/* Grouped display when showing all */}
                {!selectedStage ? (
                  stageOrder.map(stage => {
                    const stageApps = apps.filter(a => a.stage === stage);
                    if (stageApps.length === 0) return null;
                    const cfg = STAGE_CONFIG[stage];
                    return (
                      <div key={stage} className="ats-group">
                        <div className="ats-group-head">
                          <span className="ats-group-dot" style={{ background: cfg.color }} />
                          <span className="ats-group-label">{stageLabels[stage]}</span>
                          <span className="ats-group-count" style={{ background: cfg.bg, color: cfg.color }}>
                            {stageApps.length}
                          </span>
                        </div>
                        {stageApps.map(app => (
                          <CandCard
                            key={app.id}
                            app={app}
                            isSelected={selectedAppId === app.id}
                            onOpen={openDetail}
                            onMove={moveStage}
                            moving={moving}
                          />
                        ))}
                      </div>
                    );
                  })
                ) : (
                  visibleApps.map(app => (
                    <CandCard
                      key={app.id}
                      app={app}
                      isSelected={selectedAppId === app.id}
                      onOpen={openDetail}
                      onMove={moveStage}
                      moving={moving}
                    />
                  ))
                )}
              </div>

              {/* Right: detail panel */}
              <div className={`ats-detail-col${panelOpen && selectedApp ? " visible" : ""}`} ref={panelRef}>
                {panelOpen && selectedApp ? (
                  <div className="ats-detail-inner">
                    <div className="ats-detail-topbar">
                      <div className="ats-detail-stage-pill" style={{
                        background: STAGE_CONFIG[selectedApp.stage as Stage]?.bg,
                        color: STAGE_CONFIG[selectedApp.stage as Stage]?.color,
                      }}>
                        {STAGE_CONFIG[selectedApp.stage as Stage]?.emoji} {stageLabels[selectedApp.stage as Stage]}
                      </div>
                      <div className="ats-detail-nav">
                        {stageMoveButtons(selectedApp, moveStage, moving)}
                      </div>
                      <button type="button" className="ats-close-btn" onClick={closeDetail} aria-label="Zatvori panel">
                        ✕
                      </button>
                    </div>
                    <AtsDetailPanel
                      application={selectedApp as JobApplication}
                      onClose={closeDetail}
                    />
                  </div>
                ) : (
                  <div className="ats-detail-placeholder">
                    <div className="ats-placeholder-icon">👆</div>
                    <strong>Klikni na kandidata</strong>
                    <p>Otvoriće se profil, propratni tekst, oznake i komentari tima.</p>
                  </div>
                )}
              </div>

              {/* Mobile overlay backdrop */}
              {panelOpen && selectedApp && (
                <div
                  className="ats-overlay-backdrop"
                  onClick={closeDetail}
                  aria-hidden
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Candidate card ─────────────────────────────────────────────
function CandCard({
  app,
  isSelected,
  onOpen,
  onMove,
  moving,
}: {
  app: RichApp;
  isSelected: boolean;
  onOpen: (id: number) => void;
  onMove: (id: number, stage: Stage) => void;
  moving: boolean;
}) {
  const prof = app.profiles;
  const name = prof?.full_name || prof?.email || "Kandidat";
  const jobTitle = app.jobs?.title || "";
  const labelList = app.application_labels || [];
  const commentCount = app.application_comments?.length ?? 0;
  const cfg = STAGE_CONFIG[app.stage as Stage];

  return (
    <div
      className={`ats-card${isSelected ? " selected" : ""}`}
      onClick={() => onOpen(app.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onOpen(app.id); }}
    >
      <div className="ats-card-top">
        <CandAvatar name={name} />
        <div className="ats-card-info">
          <span className="ats-card-name">{name}</span>
          {prof?.city && <span className="ats-card-city">{prof.city}</span>}
          {jobTitle && <span className="ats-card-job">{jobTitle}</span>}
        </div>
        <div className="ats-card-right">
          <span className="ats-card-date">{formatDate(app.created_at)}</span>
          {commentCount > 0 && (
            <span className="ats-card-comments" title={`${commentCount} komentara`}>
              💬 {commentCount}
            </span>
          )}
        </div>
      </div>

      {/* Labels row */}
      {labelList.length > 0 && (
        <div className="ats-card-labels">
          {labelList.map(({ label }) => {
            const lo = LABEL_OPTS.find(x => x.key === label);
            return lo ? (
              <span key={label} className="ats-label-dot" style={{ background: lo.color }} title={lo.label} />
            ) : null;
          })}
          <span className="ats-card-labels-text">
            {labelList.map(({ label }) => LABEL_OPTS.find(x => x.key === label)?.label).filter(Boolean).join(", ")}
          </span>
        </div>
      )}

      {/* Stage move buttons */}
      <div className="ats-card-footer">
        <span
          className="ats-card-stage"
          style={{ background: cfg?.bg, color: cfg?.color }}
        >
          {cfg?.emoji} {stageLabels[app.stage as Stage]}
        </span>
        {stageMoveButtons(app, onMove, moving)}
      </div>
    </div>
  );
}
