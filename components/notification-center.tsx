"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { logError } from "@/lib/errors";
import type { Notification } from "@/types/domain";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "sad";
  if (min < 60) return `prije ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `prije ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `prije ${d} dana`;
  return new Date(iso).toLocaleDateString("sr-ME");
}

export function NotificationCenter() {
  const { userId, ready } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  const unreadCount = items.filter(n => !n.read).length;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        logError("NotificationCenter.load", error);
      } else {
        setItems((data || []) as Notification[]);
        loaded.current = true;
      }
    } catch {
      // Fail silently — notification panel should not break app
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!ready || !userId) return;
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [ready, userId, load]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function markRead(id: number) {
    // Optimistic update
    setItems(it => it.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) logError("NotificationCenter.markRead", error);
    } catch {
      // Fail silently
    }
  }

  async function markAllRead() {
    if (!userId) return;
    // Optimistic update
    setItems(it => it.map(n => ({ ...n, read: true })));
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("recipient_id", userId)
        .eq("read", false);
      if (error) logError("NotificationCenter.markAllRead", error);
    } catch {
      // Fail silently
    }
  }

  function handleOpen() {
    const next = !open;
    setOpen(next);
    // Load on first open if not loaded yet
    if (next && !loaded.current && userId) load();
  }

  if (!ready || !userId) return null;

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn notif-btn"
        onClick={handleOpen}
        aria-label={`Obavještenja${unreadCount ? ` (${unreadCount} novih)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span aria-hidden>🔔</span>
        {unreadCount > 0 && (
          <span className="notif-dot" aria-hidden>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Obavještenja">
          <div className="notif-head">
            <strong>Obavještenja</strong>
            {unreadCount > 0 && (
              <button type="button" className="mini-link" onClick={markAllRead}>
                Označi sve kao pročitano
              </button>
            )}
          </div>

          <div style={{ maxHeight: "min(420px, 70vh)", overflowY: "auto" }}>
            {loading && items.length === 0 && (
              <div className="notif-empty">
                <p style={{ color: "var(--muted)", fontSize: 13 }}>Učitavanje...</p>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="notif-empty">
                <strong>Nema obavještenja</strong>
                <p>Tvoja obavještenja će se pojavljivati ovdje.</p>
              </div>
            )}

            {items.map(n => {
              const inner = (
                <div
                  className={`notif-item${n.read ? "" : " unread"}`}
                  onClick={() => !n.link && markRead(n.id)}
                >
                  <div className="notif-item-head">
                    <strong>{n.title}</strong>
                    <span>{relativeTime(n.created_at)}</span>
                  </div>
                  {n.message && <p>{n.message}</p>}
                </div>
              );

              return n.link ? (
                <Link
                  href={n.link}
                  key={n.id}
                  className="notif-link"
                  onClick={() => { markRead(n.id); setOpen(false); }}
                >
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
