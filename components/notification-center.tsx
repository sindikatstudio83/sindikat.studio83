"use client";

import { useEffect, useRef, useState } from "react";
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

  const unreadCount = items.filter(n => !n.read).length;

  async function load() {
    if (!userId) return;
    setLoading(true);
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      logError("NotificationCenter.load", error);
      setLoading(false);
      return;
    }
    setItems((data || []) as Notification[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!ready || !userId) return;
    load();
    // Poll svakih 60s
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, userId]);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  async function markRead(id: number) {
    setItems(it => it.map(n => n.id === id ? { ...n, read: true } : n));
    const supabase = createBrowserSupabase();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  async function markAllRead() {
    if (!userId) return;
    setItems(it => it.map(n => ({ ...n, read: true })));
    const supabase = createBrowserSupabase();
    await supabase.from("notifications").update({ read: true })
      .eq("recipient_id", userId).eq("read", false);
  }

  if (!ready || !userId) return null;

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn notif-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={`Obavještenja${unreadCount ? ` (${unreadCount} novih)` : ""}`}
      >
        <span aria-hidden>🔔</span>
        {unreadCount > 0 && <span className="notif-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel" role="menu">
          <div className="notif-head">
            <strong>Obavještenja</strong>
            {unreadCount > 0 && (
              <button type="button" className="mini-link" onClick={markAllRead}>
                Označi sve kao pročitano
              </button>
            )}
          </div>

          {loading && items.length === 0 && (
            <div className="notif-empty"><p>Učitavanje...</p></div>
          )}

          {!loading && items.length === 0 && (
            <div className="notif-empty">
              <strong>Nema obavještenja</strong>
              <p>Tvoja obavještenja će se pojavljivati ovdje.</p>
            </div>
          )}

          {items.map(n => {
            const inner = (
              <div className={`notif-item${n.read ? "" : " unread"}`} onClick={() => markRead(n.id)}>
                <div className="notif-item-head">
                  <strong>{n.title}</strong>
                  <span>{relativeTime(n.created_at)}</span>
                </div>
                <p>{n.message}</p>
              </div>
            );
            return n.link ? (
              <Link href={n.link} key={n.id} onClick={() => { markRead(n.id); setOpen(false); }} className="notif-link">{inner}</Link>
            ) : <div key={n.id}>{inner}</div>;
          })}
        </div>
      )}
    </div>
  );
}
