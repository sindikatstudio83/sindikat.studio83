"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { logError, safeMessage } from "@/lib/errors";
import { initials } from "@/lib/format";
import { stageLabels } from "@/lib/labels";
import type { ApplicationComment, ApplicationLabel, ApplicationEvent, JobApplication } from "@/types/domain";

const LABEL_OPTS = [
  { key: "top" as const, label: "Top kandidat", color: "#22c55e" },
  { key: "interview" as const, label: "Za intervju", color: "#f59e0b" },
  { key: "rejected" as const, label: "Ne odgovara", color: "#ef4444" },
  { key: "followup" as const, label: "Provjeri kasnije", color: "#a78bfa" },
  { key: "star" as const, label: "Zvjezdica", color: "#3b82f6" },
];

export function AtsDetailPanel({ application, onClose }: { application: JobApplication; onClose: () => void }) {
  const [comments, setComments] = useState<ApplicationComment[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabase();
    const [c, l, e] = await Promise.all([
      supabase.from("application_comments").select("*").eq("application_id", application.id).order("created_at", { ascending: false }),
      supabase.from("application_labels").select("*").eq("application_id", application.id),
      supabase.from("application_events").select("*").eq("application_id", application.id).order("created_at", { ascending: false }).limit(20)
    ]);

    if (c.error) logError("AtsPanel.comments", c.error);
    if (l.error) logError("AtsPanel.labels", l.error);
    if (e.error) logError("AtsPanel.events", e.error);

    setComments((c.data || []) as ApplicationComment[]);
    setLabels(((l.data || []) as ApplicationLabel[]).map(x => x.label));
    setEvents((e.data || []) as ApplicationEvent[]);
    setLoading(false);
  }, [application.id]);

  useEffect(() => { load(); }, [load]);

  async function addComment() {
    const text = newComment.trim();
    if (!text) return;
    setSubmitting(true);
    setError("");

    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const { data, error } = await supabase
      .from("application_comments")
      .insert({ application_id: application.id, author_id: user.id, text })
      .select("*")
      .single();

    if (error) {
      logError("AtsPanel.addComment", error);
      setError(safeMessage(error, "submit"));
      setSubmitting(false);
      return;
    }

    setComments([data as ApplicationComment, ...comments]);
    setNewComment("");
    setSubmitting(false);
  }

  async function toggleLabel(label: typeof LABEL_OPTS[number]["key"]) {
    const supabase = createBrowserSupabase();
    if (labels.includes(label)) {
      const { error } = await supabase.from("application_labels").delete()
        .eq("application_id", application.id).eq("label", label);
      if (!error) setLabels(labels.filter(l => l !== label));
    } else {
      const { error } = await supabase.from("application_labels").insert({
        application_id: application.id, label
      });
      if (!error) setLabels([...labels, label]);
    }
  }

  const prof = (application as { profiles?: { full_name?: string; email?: string; phone?: string; city?: string; cv_data?: { summary?: string } } }).profiles;
  const name = prof?.full_name || prof?.email || "Kandidat";

  return (
    <div className="ats-detail-panel-body">
      <div className="soft-card" style={{ marginBottom: 12, fontSize: 13, lineHeight: 1.8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <div className="cand-av" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--lime)", color: "var(--bg)", fontSize: 15, border: "none", flexShrink: 0 }}>{initials(name)}</div>
          <div>
            <div style={{ fontWeight: 850, fontSize: 15 }}>{name}</div>
            {prof?.city && <div className="sub" style={{ fontSize: 12 }}>{prof.city}</div>}
          </div>
        </div>
        {prof?.email && <div>📧 <a href={`mailto:${prof.email}`}>{prof.email}</a></div>}
        {prof?.phone && <div>📞 <a href={`tel:${prof.phone}`}>{prof.phone}</a></div>}
        {prof?.cv_data?.summary && <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.55, fontSize: 12 }}>{prof.cv_data.summary}</div>}
      </div>

      {application.cover_letter && (
        <div className="soft-card" style={{ marginBottom: 12 }}>
          <div className="label">Propratni tekst</div>
          <p style={{ fontSize: 13, lineHeight: 1.6, margin: "6px 0 0", color: "var(--ink)" }}>{application.cover_letter}</p>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <div className="label">Oznake</div>
        <div className="label-picker">
          {LABEL_OPTS.map(l => (
            <button
              key={l.key}
              type="button"
              className={`label-opt${labels.includes(l.key) ? " active" : ""}`}
              style={{ color: l.color, borderColor: l.color }}
              onClick={() => toggleLabel(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {events.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="label">Istorija</div>
          <div className="ats-timeline">
            {events.slice(0, 5).map(ev => (
              <div className="ats-timeline-item" key={ev.id}>
                <span>{new Date(ev.created_at).toLocaleDateString("sr-ME")}</span>
                <span>
                  {ev.from_stage ? `${stageLabels[ev.from_stage]} → ` : ""}
                  <strong>{ev.to_stage ? stageLabels[ev.to_stage] : "—"}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="comments-section">
        <div className="label">Komentari tima ({comments.length})</div>
        {loading && <p className="hint">Učitavanje...</p>}
        {!loading && comments.length === 0 && <p className="hint">Još nema komentara.</p>}
        {comments.map(c => (
          <div className="comment-item" key={c.id}>
            <div className="comment-meta">{new Date(c.created_at).toLocaleString("sr-ME")}</div>
            {c.text}
          </div>
        ))}

        <div className="comment-form">
          <input
            type="text"
            className="field"
            placeholder="Dodaj komentar (Enter za slanje)"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !submitting) addComment(); }}
          />
          <button className="btn blue sm" type="button" disabled={submitting || !newComment.trim()} onClick={addComment}>
            {submitting ? "..." : "Dodaj"}
          </button>
        </div>
        {error && <p className="notice error" role="alert">{error}</p>}
      </div>
    </div>
  );
}