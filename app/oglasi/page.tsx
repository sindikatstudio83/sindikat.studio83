import type { Metadata } from "next";
import React from "react";
import { JobCard } from "@/components/job-card";
import { BannerSlot } from "@/components/banner-slot";
import { TowerBanner } from "@/components/tower-banner";
import { EmptyState, SectionHead } from "@/components/ui";
import { getLookups, getPublicJobs } from "@/lib/queries/public";
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
  const [jobs, lookups] = await Promise.all([getPublicJobs(), getLookups()]);

  const q = (params.q || "").toLowerCase();
  const isFiltering = Boolean(q || params.city || params.category);

  const filtered = jobs.filter((job: Job) => {
    const haystack =
      `${job.title} ${job.description} ${job.companies?.name || ""} ${job.categories?.name || ""}`.toLowerCase();
    return (
      (!q || haystack.includes(q)) &&
      (!params.city || job.cities?.name === params.city) &&
      (!params.category || job.categories?.name === params.category)
    );
  });

  // Istaknuti oglasi — posebna sekcija iznad, samo bez aktivnih filtera
  const featuredJobs = !isFiltering ? filtered.filter((j: Job) => j.featured) : [];
  const regularJobs = !isFiltering ? filtered.filter((j: Job) => !j.featured) : filtered;

  // Banner ubaci svakih 8 regularnih oglasa
  const BANNER_EVERY = 8;

  return (
    <>
      {/* ── Fiksni tower baneri (samo desktop, position:fixed) ── */}
      <div className="tower-banner-fixed tower-banner-fixed-left">
        <TowerBanner side="left" />
      </div>
      <div className="tower-banner-fixed tower-banner-fixed-right">
        <TowerBanner side="right" />
      </div>

      {/* ── Vrh stranice ── */}
      <BannerSlot placement="jobs_list_top" />

      <SectionHead
        label="Oglasi"
        title="Oglasi za posao"
        text={
          filtered.length === 0
            ? "Nema oglasa za zadatu pretragu."
            : `${filtered.length} ${filtered.length === 1 ? "oglas" : "oglasa"} u Crnoj Gori`
        }
      />

      {/* ── Pretraga i filteri ── */}
      <form className="search-panel">
        <input
          name="q"
          placeholder="Pozicija, firma ili vještina"
          defaultValue={params.q || ""}
        />
        <select name="city" defaultValue={params.city || ""}>
          <option value="">Svi gradovi</option>
          {lookups.cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        <select name="category" defaultValue={params.category || ""}>
          <option value="">Sve kategorije</option>
          {lookups.categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <button type="submit">Traži</button>
      </form>

      {filtered.length === 0 ? (
        <EmptyState title="Nema oglasa" text="Promijeni filtere ili se vrati kasnije." />
      ) : (
        <>
          {/* ── Istaknuti oglasi ── */}
          {featuredJobs.length > 0 && (
            <div className="featured-section">
              <div className="featured-section-head">
                <h2>Istaknuti oglasi</h2>
                <span className="badge-featured">★ ISTAKNUTO</span>
              </div>
              <div className="job-list">
                {featuredJobs.map((job: Job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* ── Divider ako ima i featured i regular ── */}
          {featuredJobs.length > 0 && regularJobs.length > 0 && (
            <div
              style={{
                borderTop: "2px solid var(--line)",
                margin: "20px 0 14px",
                paddingTop: 14,
              }}
            >
              <span
                className="kicker"
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em" }}
              >
                Svi oglasi
              </span>
            </div>
          )}

          {/* ── Regularni oglasi — 2 kolone na desktopu ── */}
          {regularJobs.length > 0 && (
            <div className="job-list two-col">
              {regularJobs.map((job: Job, idx: number) => (
                <React.Fragment key={job.id}>
                  <JobCard job={job} />
                  {/* Banner svaki BANNER_EVERY oglasa, spans oba stupca */}
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
