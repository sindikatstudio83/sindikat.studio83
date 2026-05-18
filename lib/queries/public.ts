import { createPublicSupabase } from "@/lib/supabase/server";
import type { Company, Job, Plan, HomepageData, JobWithPromotion, CompanyWithExtras } from "@/types/domain";

const jobSelect = "id,title,slug,description,contract_type,salary_text,deadline,status,featured,company_id,companies(id,name,slug,logo_path),categories(id,name,slug),cities(id,name,slug)";
const jobSelectQuick = "id,title,slug,description,contract_type,salary_text,deadline,status,featured,company_id,quick_job,urgent,daily_rate,companies(id,name,slug,logo_path),categories(id,name,slug),cities(id,name,slug)";

function escapeIlike(value: string) {
  return value.replace(/[%_,]/g, " ").trim();
}

export type JobFilters = {
  q?: string;
  city?: string;
  category?: string;
  featured?: boolean;
  quick?: boolean;
  limit?: number;
};

export async function getPublicJobs(filters?: JobFilters): Promise<Job[]> {
  const db = createPublicSupabase();
  let query = db.from("jobs").select(jobSelect).eq("status", "active");

  if (filters?.city) {
    const { data: cityData } = await db.from("cities").select("id").ilike("name", filters.city).maybeSingle();
    if (cityData?.id) query = query.eq("city_id", cityData.id);
    else return [];
  }

  if (filters?.category) {
    const { data: catData } = await db.from("categories").select("id").ilike("name", filters.category).maybeSingle();
    if (catData?.id) query = query.eq("category_id", catData.id);
    else return [];
  }

  if (filters?.q) {
    const searchTerm = filters.q.replace(/['"\\/]/g, " ").trim();
    query = query.textSearch("fts", searchTerm, { type: "plain", config: "simple" });
  }

  if (filters?.featured === true) query = query.eq("featured", true);
  if (filters?.quick === true) query = query.eq("quick_job", true);

  query = query
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(filters?.limit || 100);

  const { data, error } = await query;
  if (error) {
    if (error.code === "42703" || error.message?.includes("fts")) {
      let fallbackQuery = db.from("jobs").select(jobSelect).eq("status", "active");
      if (filters?.q) {
        const likeTerm = escapeIlike(filters.q);
        if (likeTerm) fallbackQuery = fallbackQuery.or(`title.ilike.%${likeTerm}%,description.ilike.%${likeTerm}%`);
      }
      const { data: fallback } = await fallbackQuery
        .order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(filters?.limit || 100);
      return (fallback || []) as any as Job[];
    }
    console.error("[getPublicJobs]", error.message);
  }
  return (data || []) as any as Job[];
}

export async function getHomepageData(): Promise<HomepageData> {
  const db = createPublicSupabase();
  const now = new Date().toISOString();

  const [paidRes, featuredRes, regularRes, quickRes, companiesRes] = await Promise.all([
    db.from("job_promotions")
      .select(`priority, ends_at, jobs!inner(${jobSelectQuick})`)
      .eq("type", "paid_top").eq("status", "active")
      .lte("starts_at", now).or(`ends_at.is.null,ends_at.gt.${now}`)
      .eq("jobs.status", "active")
      .order("priority", { ascending: false }).limit(3),

    db.from("job_promotions")
      .select(`priority, ends_at, jobs!inner(${jobSelectQuick})`)
      .eq("type", "featured").eq("status", "active")
      .lte("starts_at", now).or(`ends_at.is.null,ends_at.gt.${now}`)
      .eq("jobs.status", "active")
      .order("priority", { ascending: false }).limit(6),

    db.from("jobs").select(jobSelect)
      .eq("status", "active").eq("featured", false)
      .order("created_at", { ascending: false }).limit(8),

    db.from("jobs").select(jobSelectQuick)
      .eq("status", "active").eq("quick_job", true)
      .order("created_at", { ascending: false }).limit(6),

    db.from("companies")
      .select("id,name,slug,city,industry,logo_path,approved,recommended,recommended_priority,instagram_url")
      .eq("approved", true)
      .order("recommended", { ascending: false })
      .order("recommended_priority", { ascending: false })
      .order("created_at", { ascending: false }).limit(12),
  ]);

  const mapPromo = (row: any, type: "paid_top" | "featured"): JobWithPromotion => ({
    ...(row.jobs as any),
    promotion_type: type,
    promotion_priority: row.priority as number,
    promotion_ends_at: row.ends_at as string | null,
  });

  const paidTopJobs: JobWithPromotion[] = paidRes.error
    ? [] : (paidRes.data || []).map((r: any) => mapPromo(r, "paid_top"));

  const featuredFromPromo: JobWithPromotion[] = featuredRes.error
    ? [] : (featuredRes.data || []).map((r: any) => mapPromo(r, "featured"));

  // Fallback: se job_promotions tabela ne postoji ili nema podataka, uzmi stare jobs.featured
  const featuredJobs: JobWithPromotion[] =
    featuredFromPromo.length === 0 && !featuredRes.error
      ? ((regularRes.data || []) as any[])
          .filter((j: any) => j.featured)
          .slice(0, 6)
          .map((j: any) => ({ ...j, promotion_type: "featured" } as JobWithPromotion))
      : featuredFromPromo;

  return {
    paidTopJobs,
    featuredJobs,
    regularJobs: (regularRes.data || []) as any as Job[],
    quickJobs: (quickRes.data || []) as any as Job[],
    recommendedCompanies: (companiesRes.data || []) as any as CompanyWithExtras[],
  };
}

export async function getPublicJobsByCity(cityIdentifier: string): Promise<Job[]> {
  const db = createPublicSupabase();
  const { data: cityData } = await db.from("cities").select("id")
    .or(`slug.eq.${cityIdentifier.toLowerCase()},name.ilike.${cityIdentifier}`).maybeSingle();
  if (!cityData?.id) return [];
  const { data, error } = await db.from("jobs").select(jobSelect)
    .eq("status", "active").eq("city_id", cityData.id).order("created_at", { ascending: false });
  if (error) console.error("[getPublicJobsByCity]", error.message);
  return (data || []) as any as Job[];
}

export async function getPublicJobsByCategory(categoryIdentifier: string): Promise<Job[]> {
  const db = createPublicSupabase();
  const { data: categoryData } = await db.from("categories").select("id")
    .or(`slug.eq.${categoryIdentifier.toLowerCase()},name.ilike.${categoryIdentifier}`).maybeSingle();
  if (!categoryData?.id) return [];
  const { data, error } = await db.from("jobs").select(jobSelect)
    .eq("status", "active").eq("category_id", categoryData.id).order("created_at", { ascending: false });
  if (error) console.error("[getPublicJobsByCategory]", error.message);
  return (data || []) as any as Job[];
}

export async function getPublicJobsByCompany(companyId: number): Promise<Job[]> {
  const db = createPublicSupabase();
  const { data, error } = await db.from("jobs").select(jobSelect)
    .eq("status", "active").eq("company_id", companyId).order("created_at", { ascending: false });
  if (error) console.error("[getPublicJobsByCompany]", error.message);
  return (data || []) as any as Job[];
}

export async function getJobById(id: number): Promise<Job | null> {
  const db = createPublicSupabase();
  const { data, error } = await db.from("jobs").select(jobSelect)
    .eq("id", id).eq("status", "active").maybeSingle();
  if (error) console.error("[getJobById]", error.message);
  return data as any as Job | null;
}

export async function getCompanies(limit?: number): Promise<Company[]> {
  const db = createPublicSupabase();
  let query = db.from("companies").select("*").eq("approved", true)
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) console.error("[getCompanies]", error.message);
  return (data || []) as Company[];
}

export async function getCompanyById(id: number): Promise<Company | null> {
  const db = createPublicSupabase();
  const { data, error } = await db.from("companies").select("*")
    .eq("id", id).eq("approved", true).maybeSingle();
  if (error) console.error("[getCompanyById]", error.message);
  return data as Company | null;
}

export async function getLookups() {
  const db = createPublicSupabase();
  const [cities, categories] = await Promise.all([
    db.from("cities").select("id,name,slug").order("name"),
    db.from("categories").select("id,name,slug").order("name")
  ]);
  if (cities.error) console.error("[getLookups:cities]", cities.error.message);
  if (categories.error) console.error("[getLookups:categories]", categories.error.message);
  return { cities: cities.data || [], categories: categories.data || [] };
}

export async function getPlans(): Promise<Plan[]> {
  const db = createPublicSupabase();
  const { data, error } = await db.from("plans").select("*").eq("is_active", true).order("price_eur");
  if (error) console.error("[getPlans]", error.message);
  return (data || []) as Plan[];
}
