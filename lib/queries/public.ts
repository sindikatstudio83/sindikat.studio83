import { createPublicSupabase } from "@/lib/supabase/server";
import type { Company, Job, Plan } from "@/types/domain";

const jobSelect = "id,title,slug,description,contract_type,salary_text,deadline,status,featured,company_id,companies(id,name,slug,logo_path),categories(id,name,slug),cities(id,name,slug)";

export type JobFilters = {
  q?: string;
  city?: string;
  category?: string;
  limit?: number;
};

export async function getPublicJobs(filters?: JobFilters): Promise<Job[]> {
  const db = createPublicSupabase();
  let query = db.from("jobs").select(jobSelect).eq("status", "active");

  // DB-side filters — ne filtriramo u browseru!
  if (filters?.city) {
    // Filtriraj po nazivu grada (case insensitive)
    const { data: cityData } = await db.from("cities").select("id").ilike("name", filters.city).maybeSingle();
    if (cityData?.id) query = query.eq("city_id", cityData.id);
    else return []; // Grad ne postoji
  }

  if (filters?.category) {
    const { data: catData } = await db.from("categories").select("id").ilike("name", filters.category).maybeSingle();
    if (catData?.id) query = query.eq("category_id", catData.id);
    else return [];
  }

  if (filters?.q) {
    // Full-text search koristeći GIN index
    const searchTerm = filters.q.replace(/['"\\]/g, " ").trim();
    query = query.textSearch("fts", searchTerm, {
      type: "plain",
      config: "simple",
    });
  }

  query = query
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(filters?.limit || 100);

  const { data, error } = await query;
  if (error) {
    // Fallback: ako FTS padne (npr. nema fts kolone), vrati bez text filtera
    if (error.code === "42703" || error.message?.includes("fts")) {
      const { data: fallback } = await db.from("jobs").select(jobSelect).eq("status", "active")
        .order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(100);
      return (fallback || []) as unknown as Job[];
    }
    console.error("[getPublicJobs]", error.message);
  }
  return (data || []) as unknown as Job[];
}

// Filter po gradu — koristi city_id preko cities lookup tabele
export async function getPublicJobsByCity(cityIdentifier: string): Promise<Job[]> {
  const db = createPublicSupabase();
  // Prvo pronađi grad po slug ili imenu (case insensitive)
  const { data: cityData } = await db
    .from("cities")
    .select("id")
    .or(`slug.eq.${cityIdentifier.toLowerCase()},name.ilike.${cityIdentifier}`)
    .maybeSingle();

  if (!cityData?.id) return [];

  const { data, error } = await db
    .from("jobs")
    .select(jobSelect)
    .eq("status", "active")
    .eq("city_id", cityData.id)
    .order("created_at", { ascending: false });

  if (error) console.error("[getPublicJobsByCity]", error.message);
  return (data || []) as unknown as Job[];
}

export async function getPublicJobsByCategory(categoryIdentifier: string): Promise<Job[]> {
  const db = createPublicSupabase();
  const { data: categoryData } = await db
    .from("categories")
    .select("id")
    .or(`slug.eq.${categoryIdentifier.toLowerCase()},name.ilike.${categoryIdentifier}`)
    .maybeSingle();

  if (!categoryData?.id) return [];

  const { data, error } = await db
    .from("jobs")
    .select(jobSelect)
    .eq("status", "active")
    .eq("category_id", categoryData.id)
    .order("created_at", { ascending: false });

  if (error) console.error("[getPublicJobsByCategory]", error.message);
  return (data || []) as unknown as Job[];
}

export async function getPublicJobsByCompany(companyId: number): Promise<Job[]> {
  const db = createPublicSupabase();
  const { data, error } = await db
    .from("jobs")
    .select(jobSelect)
    .eq("status", "active")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) console.error("[getPublicJobsByCompany]", error.message);
  return (data || []) as unknown as Job[];
}

export async function getJobById(id: number): Promise<Job | null> {
  const db = createPublicSupabase();
  const { data, error } = await db.from("jobs").select(jobSelect).eq("id", id).eq("status", "active").maybeSingle();
  if (error) console.error("[getJobById]", error.message);
  return data as unknown as Job | null;
}

export async function getCompanies(limit?: number): Promise<Company[]> {
  const db = createPublicSupabase();
  let query = db.from("companies").select("*").eq("approved", true).order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) console.error("[getCompanies]", error.message);
  return (data || []) as Company[];
}

export async function getCompanyById(id: number): Promise<Company | null> {
  const db = createPublicSupabase();
  const { data, error } = await db.from("companies").select("*").eq("id", id).eq("approved", true).maybeSingle();
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
  return {
    cities: cities.data || [],
    categories: categories.data || []
  };
}

export async function getPlans(): Promise<Plan[]> {
  const db = createPublicSupabase();
  const { data, error } = await db.from("plans").select("*").eq("is_active", true).order("price_eur");
  if (error) console.error("[getPlans]", error.message);
  return (data || []) as Plan[];
}
