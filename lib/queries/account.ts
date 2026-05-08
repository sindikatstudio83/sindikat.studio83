"use client";

import { createBrowserSupabase } from "@/lib/supabase/client";
import { logError } from "@/lib/errors";
import type { SavedJob, JobAlert, Notification, Job, CompanyActivePlan } from "@/types/domain";

const jobSelect = "id,title,slug,description,contract_type,salary_text,deadline,status,featured,company_id,companies(id,name,slug,logo_path),categories(id,name,slug),cities(id,name,slug)";

// ── SAVED JOBS ───────────────────────────────────────────────────────

export async function getSavedJobs(userId: string): Promise<SavedJob[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("saved_jobs")
    .select(`id,user_id,job_id,created_at,jobs(${jobSelect})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { logError("getSavedJobs", error); return []; }
  return (data || []) as unknown as SavedJob[];
}

export async function saveJob(userId: string, jobId: number) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("saved_jobs").insert({ user_id: userId, job_id: jobId });
  if (error && error.code !== "23505") logError("saveJob", error);
  return !error;
}

export async function unsaveJob(userId: string, jobId: number) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("saved_jobs").delete().eq("user_id", userId).eq("job_id", jobId);
  if (error) logError("unsaveJob", error);
  return !error;
}

export async function isSaved(userId: string, jobId: number): Promise<boolean> {
  const supabase = createBrowserSupabase();
  const { data } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();
  return Boolean(data);
}

// ── JOB ALERTS ───────────────────────────────────────────────────────

export async function getJobAlerts(userId: string): Promise<JobAlert[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { logError("getJobAlerts", error); return []; }
  return (data || []) as JobAlert[];
}

export async function createJobAlert(userId: string, alert: Partial<JobAlert>) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("job_alerts").insert({
    user_id: userId,
    city_id: alert.city_id || null,
    category_id: alert.category_id || null,
    contract_type: alert.contract_type || null,
    keywords: alert.keywords || null,
    active: alert.active ?? true
  });
  if (error) logError("createJobAlert", error);
  return !error;
}

export async function deleteJobAlert(alertId: number) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("job_alerts").delete().eq("id", alertId);
  if (error) logError("deleteJobAlert", error);
  return !error;
}

// ── NOTIFICATIONS ────────────────────────────────────────────────────

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { logError("getNotifications", error); return []; }
  return (data || []) as Notification[];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createBrowserSupabase();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("read", false);
  if (error) { logError("getUnreadCount", error); return 0; }
  return count || 0;
}

export async function markNotificationsRead(userId: string, ids?: number[]) {
  const supabase = createBrowserSupabase();
  let query = supabase.from("notifications").update({ read: true }).eq("recipient_id", userId).eq("read", false);
  if (ids?.length) query = query.in("id", ids);
  const { error } = await query;
  if (error) logError("markNotificationsRead", error);
  return !error;
}

// ── COMPANY PLAN STATUS ──────────────────────────────────────────────

export async function getCompanyActivePlan(companyId: number): Promise<CompanyActivePlan | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.rpc("company_active_plan", { p_company_id: companyId });
  if (error) { logError("getCompanyActivePlan", error); return null; }
  if (!data || (Array.isArray(data) && !data.length)) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row as CompanyActivePlan;
}

// ── JOB VIEW TRACKING ────────────────────────────────────────────────

export async function trackJobView(jobId: number, userId: string | null) {
  const supabase = createBrowserSupabase();
  const sessionId = (() => {
    try {
      let id = window.sessionStorage.getItem("ip_session");
      if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        window.sessionStorage.setItem("ip_session", id);
      }
      return id;
    } catch { return null; }
  })();

  await supabase.from("job_views").insert({
    job_id: jobId,
    viewer_id: userId,
    session_id: sessionId
  });
  // ne logujemo error — view tracking je best-effort
}

export async function getJobViewCount(jobId: number): Promise<number> {
  const supabase = createBrowserSupabase();
  const { count } = await supabase
    .from("job_views")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId);
  return count || 0;
}
