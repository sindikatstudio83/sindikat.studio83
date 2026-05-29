import type { MetadataRoute } from "next";
import { getCompanies, getLookups, getPublicJobs } from "@/lib/queries/public";
import { companyUrl, jobUrl } from "@/lib/format";

// Revalidate sitemap every 12 hours
export const revalidate = 43200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://imaposla.me";

  // Static routes — auth pages intentionally excluded (not useful for search engines)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                        changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/oglasi`,            changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/firme`,             changeFrequency: "daily",   priority: 0.7 },
    { url: `${base}/gradovi`,           changeFrequency: "weekly",  priority: 0.6 },
    { url: `${base}/kategorije`,        changeFrequency: "weekly",  priority: 0.6 },
    { url: `${base}/za-firme`,          changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privatnost`,        changeFrequency: "yearly",  priority: 0.2 },
    { url: `${base}/uslovi-koriscenja`, changeFrequency: "yearly",  priority: 0.2 },
    // /login and /registracija intentionally excluded — not indexable content
  ];

  // Dynamic routes — fetch in parallel, fail gracefully if Supabase unavailable
  const [jobs, companies, lookups] = await Promise.all([
    getPublicJobs({ limit: 500 }).catch(() => []),
    getCompanies(200).catch(() => []),
    getLookups().catch(() => ({ cities: [], categories: [] })),
  ]);

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${base}${jobUrl(job)}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const companyRoutes: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${base}${companyUrl(company)}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Normalize city/category slugs consistently
  const cityRoutes: MetadataRoute.Sitemap = lookups.cities
    .filter((c) => c.slug || c.name)
    .map((city) => ({
      url: `${base}/gradovi/${city.slug || encodeURIComponent(city.name.toLowerCase().replace(/\s+/g, "-"))}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = lookups.categories
    .filter((c) => c.slug || c.name)
    .map((cat) => ({
      url: `${base}/kategorije/${cat.slug || encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g, "-"))}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));

  return [...staticRoutes, ...jobRoutes, ...companyRoutes, ...cityRoutes, ...categoryRoutes];
}
