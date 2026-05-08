import { createPublicSupabase } from "@/lib/supabase/server";
import type { Banner, BannerPlacement, BannerAudience } from "@/types/domain";

/**
 * Vraća prvi aktivan banner za datu lokaciju.
 * Filter: approved=true, datum važi, audience odgovara ulozi.
 * Sortirano po priority desc, pa created_at desc.
 *
 * Ovo se zove iz server komponenti (npr. layout, page) — koristi public supabase klijent.
 */
export async function getActiveBanner(
  placement: BannerPlacement,
  audience: BannerAudience = "all"
): Promise<Banner | null> {
  const db = createPublicSupabase();
  const now = new Date().toISOString();

  let query = db
    .from("banners")
    .select("*")
    .eq("placement", placement)
    .eq("approved", true)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1);

  if (audience !== "all") {
    query = query.in("target_audience", ["all", audience]);
  }

  // Datum filteri (start_date <= now AND (end_date IS NULL OR end_date >= now))
  query = query.or(`start_date.is.null,start_date.lte.${now}`);
  query = query.or(`end_date.is.null,end_date.gte.${now}`);

  const { data, error } = await query.maybeSingle();
  if (error && error.code !== "PGRST116") {
    console.error("[getActiveBanner]", error.message);
    return null;
  }
  return data as Banner | null;
}

/** Admin: čita SVE banere. */
export async function getAllBannersAdmin(): Promise<Banner[]> {
  const db = createPublicSupabase();
  const { data, error } = await db
    .from("banners")
    .select("*")
    .order("placement")
    .order("priority", { ascending: false });
  if (error) {
    console.error("[getAllBannersAdmin]", error.message);
    return [];
  }
  return (data || []) as Banner[];
}
