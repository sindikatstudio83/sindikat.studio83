"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { logError } from "@/lib/errors";
import { desktopNavItems } from "@/lib/navigation";
import { initials } from "@/lib/format";

type AuditRow = {
  id: number;
  admin_email: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  note: string | null;
  created_at: string;
};

const ACTION_LABELS: Record<string, { label: string; badge: string }> = {
  role_change:           { label: "Promjena role",    badge: "badge pink"   },
  company_approved:      { label: "Firma odobrena",   badge: "badge green"  },
  company_hidden:        { label: "Firma sakrivena",  badge: "badge orange" },
  job_status_change:     { label: "Status oglasa",    badge: "badge blue"   },
  payment_confirmed:     { label: "Uplata potvrdena", badge: "badge green"  },
  payment_rejected:      { label: "Uplata odbijena",  badge: "badge red"    },
  payment_status_change: { label: "Status uplate",    badge: "badge gray"   },
};

function SideNav({ email }: { email: string }) {
  const pathname = usePathname();
  const nav = desktopNavItems["admin"];
  const name = email.split("@")[0];
  return (
    <aside className="side">
      <div className="side-head">
        <div className="side-avatar" style={{ background: "var(--pink)" }}>{initials(name)}</div>
        <strong>{name}</strong>
        <small>ADMIN</small>
      </div>
      <nav className="side-nav">
        {nav.map(item => (
          <Link href={item.href} key={item.href} className={pathname === item.href ? "active" : ""}>
            {item.label}
          </Link>
        ))}
        <Link href="/admin/audit-log" className={pathname === "/admin/audit-log" ? "active" : ""}>
          Audit log
        </Link>
      </nav>
      <Link href="/logout" className="side-logout">Odjava</Link>
    </aside>
  );
}

function formatValue(val: Record<string, unknown> | null): string {
  if (!val) return "—";
  return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(", ");
}

export function AdminAuditLogClient() {
  const { role, email, ready } = useAuth();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [page, setPage] = useState(0);
  const LIMIT = 30;

  useEffect(() => {
    if (!ready) return;
    if (role !== "admin") { window.location.href = "/"; return; }
    const supabase = createBrowserSupabase();
    setLoading(true);
    supabase.rpc("admin_read_audit_log", {
      p_limit: LIMIT,
      p_offset: page * LIMIT,
      p_action: filterAction || null,
      p_table: null,
    }).then(({ data, error }: { data: AuditRow[] | null; error: { message: string } | null }) => {
      if (error) logError("AuditLog.load", error);
      else setRows((data || []) as AuditRow[]);
      setLoading(false);
    });
  }, [ready, role, filterAction, page]);

  return (
    <div className="app-shell">
      <SideNav email={email || ""} />
      <main className="app-main">
        <div className="section-head">
          <div>
            <span className="page-label">Upravljanje</span>
            <h1>Audit log</h1>
            <p className="sub">Istorija kriticnih admin akcija.</p>
          </div>
        </div>

        <div className="admin-filters">
          <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(0); }}>
            <option value="">Sve akcije</option>
            {Object.entries(ACTION_LABELS).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          {filterAction && (
            <button className="btn ghost xs" onClick={() => { setFilterAction(""); setPage(0); }}>
              Reset
            </button>
          )}
        </div>

        <div className="table-card">
          {loading && <p className="muted" style={{ padding: "20px 0" }}>Ucitavanje...</p>}
          {!loading && !rows.length && (
            <div className="empty">
              <strong>Nema zabiljezenih akcija</strong>
              <p>Audit log se puni automatski pri admin akcijama.</p>
            </div>
          )}
          {!loading && rows.map(row => {
            const cfg = ACTION_LABELS[row.action] ?? { label: row.action, badge: "badge gray" };
            return (
              <div key={row.id} className="admin-card" style={{ gridTemplateColumns: "1fr" }}>
                <div className="admin-card-head">
                  <div className="admin-card-info">
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span className={cfg.badge}>{cfg.label}</span>
                      {row.target_table && (
                        <span className="badge gray" style={{ fontSize: 11 }}>
                          {row.target_table} #{row.target_id}
                        </span>
                      )}
                    </div>
                    <strong style={{ marginTop: 4, display: "block", fontSize: 13 }}>
                      Admin: {row.admin_email || "—"}
                    </strong>
                    {(row.old_value || row.new_value) && (
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.8 }}>
                        {row.old_value && <div>Prije: {formatValue(row.old_value)}</div>}
                        {row.new_value && <div>Nakon: {formatValue(row.new_value)}</div>}
                      </div>
                    )}
                  </div>
                  <small style={{ flexShrink: 0, marginLeft: 8, color: "var(--muted)" }}>
                    {new Date(row.created_at).toLocaleString("sr-ME")}
                  </small>
                </div>
              </div>
            );
          })}
        </div>

        {(rows.length === LIMIT || page > 0) && (
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {page > 0 && (
              <button className="btn ghost sm" onClick={() => setPage(p => p - 1)}>Prethodna</button>
            )}
            {rows.length === LIMIT && (
              <button className="btn ghost sm" onClick={() => setPage(p => p + 1)}>Sljedeca</button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
