import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { Avatar } from "@/components/avatar";
import { BannerSlot } from "@/components/banner-slot";
import { TowerBanner } from "@/components/tower-banner";
import { Button, EmptyState } from "@/components/ui";
import { MobileFilterDrawer } from "@/components/mobile-filter-drawer";
import { getLookups, getPublicJobs } from "@/lib/queries/public";
import { jobUrl } from "@/lib/format";
import type { Job, JobWithPromotion } from "@/types/domain";

export const metadata: Metadata = {
  title: "Oglasi za posao — imaposla.me",
  description: "Pretraži oglase za posao u Crnoj Gori. Filtriraj po gradu i kategoriji.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; category?: string; quick?: string }>;
}) {
  const params = await searchParams;

  const [jobs, lookups] = await Promise.all([
    getPublicJobs({
      q: params.q || undefined,
      city: params.city || undefined,
      category: params.category || undefined,
      quick: params.quick === "true" || params.quick === "1" ? true : undefined,
      limit: 200,
    }),
    getLookups(),
  ]);

  const isFiltering = Boolean(params.q || params.city || params.category || params.quick);
  const activeFilterCount = [params.q, params.city, params.category].filter(Boolean).length;
  const isQuickFilter = params.quick === "true" || params.quick === "1";

  // Featured odvojeni kad nema filtera
  const featuredJobs = !isFiltering ? jobs.filter((j: Job) => j.featured) : [];
  const regularJobs  = !isFiltering ? jobs.filter((j: Job) => !j.featured) : jobs;

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

      {/* HEADER SEKCIJE */}
      <div className="jobs-page-head">
        <div>
          <span className="kicker">{isQuickFilter ? "Brzi poslovi" : "Oglasi"}</span>
          <h1>{isQuickFilter ? "Brzi i kratkoročni poslovi" : "Oglasi za posao"}</h1>
          <p className="jobs-count">
            {jobs.length === 0
              ? "Nema oglasa za zadatu pretragu."
              : `${jobs.length} ${jobs.length === 1 ? "oglas" : "oglasa"} u Crnoj Gori`}
          </p>
        </div>
        <Link href="/registracija?role=company" className="btn red sm">+ Objavi oglas</Link>
      </div>

      {/* SEARCH PANEL — desktop */}
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
        <button type="submit">Pretraži</button>
      </form>

      {/* FILTER PILLS */}
      <div className="filter-pills desktop-only">
        <Link
          href={isQuickFilter ? "/oglasi" : "/oglasi?quick=true"}
          className={`filter-pill${isQuickFilter ? " active" : ""}`}
        >
          ⚡ Brzi poslovi
        </Link>
        {isFiltering && (
          <Link href="/oglasi" className="filter-pill">
            ✕ Resetuj filtere
          </Link>
        )}
      </div>

      {/* MOBILE FILTER */}
      <MobileFilterDrawer
        cities={lookups.cities}
        categories={lookups.categories}
        currentQ={params.q || ""}
        currentCity={params.city || ""}
        currentCategory={params.category || ""}
        activeFilterCount={activeFilterCount}
      />

      {jobs.length === 0 ? (
        <EmptyState
          title="Nema oglasa"
          text="Promijeni filtere ili se vrati kasnije."
          action={<Button href="/oglasi" tone="blue">Resetuj filtere</Button>}
        />
      ) : (
        <>
          {/* ISTAKNUTI — kompaktni red na vrhu */}
          {featuredJobs.length > 0 && (
            <div className="jobs-featured-row">
              <div className="jobs-featured-label">
                <span className="badge red">★ Istaknuto</span>
              </div>
              <div className="jobs-dense-grid">
                {featuredJobs.map((job: Job) => (
                  <JobTile key={job.id} job={job as JobWithPromotion} />
                ))}
              </div>
              {regularJobs.length > 0 && <div className="jobs-divider" />}
            </div>
          )}

          {/* SVI OGLASI — dense grid kao zaposli.me */}
          {regularJobs.length > 0 && (
            <div className="jobs-dense-grid">
              {regularJobs.map((job: Job, idx: number) => (
                <React.Fragment key={job.id}>
                  <JobTile job={job as JobWithPromotion} />
                  {(idx + 1) % 12 === 0 && idx < regularJobs.length - 1 && (
                    <div className="jobs-dense-banner">
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

/* ── Tile komponenta — logo + naziv + grad (zaposli.me stil) ── */
function JobTile({ job }: { job: JobWithPromotion }) {
  const co = job.companies;
  const url = jobUrl(job);
  const jobExt = job as JobWithPromotion & { cities?: { name: string } | null };
  const isUrgent = job.promotion_type === "urgent";
  const isFeatured = job.featured || job.promotion_type === "paid_top" || job.promotion_type === "featured";

  return (
    <Link
      href={url}
      className={`job-tile${isFeatured ? " job-tile--featured" : ""}${isUrgent ? " job-tile--urgent" : ""}`}
    >
      <div className="job-tile__logo">
        <Avatar
          bucket="company-logos"
          path={co?.logo_path ?? null}
          fallback={co?.name ?? ""}
          size={48}
          shape="rounded"
        />
      </div>
      <div className="job-tile__body">
        <span className="job-tile__title">{job.title}</span>
        <span className="job-tile__company">{co?.name}</span>
        {jobExt.cities?.name && (
          <span className="job-tile__city">{jobExt.cities.name}</span>
        )}
      </div>
      {isUrgent && <span className="job-tile__urgent">Hitno</span>}
    </Link>
  );
}
