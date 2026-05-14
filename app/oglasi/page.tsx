import type { Metadata } from "next";
import React from "react";
import { JobCard } from "@/components/job-card";
import { BannerSlot } from "@/components/banner-slot";
import { TowerBanner } from "@/components/tower-banner";
import { EmptyState, SectionHead } from "@/components/ui";
import { getLookups, getPublicJobs } from "@/lib/queries/public";
import { MobileFilterDrawer } from "@/components/mobile-filter-drawer";
import type { Job } from "@/types/domain";

export const metadata: Metadata = {
  title: "Oglasi za posao",
  description: "Pretraži oglase za posao u Crnoj Gori. Filtriraj po gradu i kategoriji.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; category?: string }>;
}) {
  const params = await searchParams;

  const [jobs, lookups] = await Promise.all([
    getPublicJobs({
      q: params.q || undefined,
      city: params.city || undefined,
      category: params.category || undefined,
      limit: 100,
    }),
    getLookups(),
  ]);

  const isFiltering = Boolean(params.q || params.city || params.category);
  const activeFilterCount = [params.q, params.city, params.category].filter(Boolean).length;

  const featuredJobs = !isFiltering ? jobs.filter((j: Job) => j.featured) : [];
  const regularJobs = !isFiltering ? jobs.filter((j: Job) => !j.featured) : jobs;

  const BANNER_EVERY = 8;

  return (
    <>
      {/* Tower baneri — samo desktop */}
      <div className="tower-banner-fixed tower-banner-fixed-left">
        <TowerBanner side="left" />
      </div>
      <div className="tower-banner-fixed tower-banner-fixed-right">
        <TowerBanner side="right" />
      </div>

      <BannerSlot placement="jobs_list_top" />

      <SectionHead
        label="Oglasi"
        title="Oglasi za posao"
        text={jobs.length === 0 ? "Nema oglasa za zadatu pretragu." : `${jobs.length} ${jobs.length === 1 ? "oglas" : "oglasa"} u Crnoj Gori`}
      />

      {/* Desktop search panel */}
      <form className="search-panel desktop-only" method="get">
        <input name="q" placeholder="Pozicija ili firma" defaultValue={params.q || ""} />
        <select name="city" defaultValue={params.city || ""}>
          <option value="">Svi gradovi</option>
          {lookups.cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select name="category" defaultValue={params.category || ""}>
          <option value="">Sve kategorije</option>
          {lookups.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <button type="submit">Traži</button>
      </form>

      {/* Mobile: search + filter drawer */}
      <MobileFilterDrawer
        cities={lookups.cities}
        categories={lookups.categories}
        currentQ={params.q || ""}
        currentCity={params.city || ""}
        currentCategory={params.category || ""}
        activeFilterCount={activeFilterCount}
      />

      {jobs.length === 0 ? (
        <EmptyState title="Nema oglasa" text="Promijeni filtere ili se vrati kasnije." />
      ) : (
        <>
          {/* Featured */}
          {featuredJobs.length > 0 && (
            <div className="featured-section">
              <div className="featured-section-head">
                <h2>Istaknuti oglasi</h2>
                <span className="badge-featured">★ ISTAKNUTO</span>
              </div>
              <div className="job-list">
                {featuredJobs.map((job: Job) => <JobCard key={job.id} job={job} />)}
              </div>
            </div>
          )}

          {/* Divider */}
          {featuredJobs.length > 0 && regularJobs.length > 0 && (
            <div style={{ borderTop: "2px solid var(--line)", margin: "16px 0 14px", paddingTop: 12 }}>
              <span className="kicker" style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em" }}>Svi oglasi</span>
            </div>
          )}

          {/* Regular jobs */}
          {regularJobs.length > 0 && (
            <div className="job-list two-col">
              {regularJobs.map((job: Job, idx: number) => (
                <React.Fragment key={job.id}>
                  <JobCard job={job} />
                  {(idx + 1) % BANNER_EVERY === 0 && idx < regularJobs.length - 1 && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <BannerSlot placement="jobs_list_middle" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      )}

      <BannerSlot placement="jobs_list_bottom" />
    </>
  );
}
