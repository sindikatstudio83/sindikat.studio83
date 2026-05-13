import type { Metadata } from "next";
import { JobCard } from "@/components/job-card";
import { SaveJobButton } from "@/components/save-job-button";
import { BannerSlot } from "@/components/banner-slot";
import { EmptyState, SectionHead } from "@/components/ui";
import { getLookups, getPublicJobs } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Oglasi za posao",
  description: "Pretraži oglase za posao u Crnoj Gori. Filtriraj po gradu i kategoriji."
};

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; category?: string }> }) {
  const params = await searchParams;
  const [jobs, lookups] = await Promise.all([getPublicJobs(), getLookups()]);
  const q = (params.q || "").toLowerCase();
  const list = jobs.filter((job) => {
    const haystack = `${job.title} ${job.description} ${job.companies?.name || ""} ${job.categories?.name || ""}`.toLowerCase();
    return (!q || haystack.includes(q)) && (!params.city || job.cities?.name === params.city) && (!params.category || job.categories?.name === params.category);
  });

  // Ubaci banner na sredini liste (svaki 6. element)
  const BANNER_EVERY = 6;

  return (
    <>
      <BannerSlot placement="jobs_list_top" />
      <SectionHead label="Oglasi" title="Oglasi za posao" text="Filtriraj oglase po poziciji, gradu i kategoriji." />
      <form className="search-panel">
        <input name="q" placeholder="Pozicija, firma ili vještina" defaultValue={params.q || ""} />
        <select name="city" defaultValue={params.city || ""}>
          <option value="">Svi gradovi</option>
          {lookups.cities.map((city) => <option key={city.id} value={city.name}>{city.name}</option>)}
        </select>
        <select name="category" defaultValue={params.category || ""}>
          <option value="">Sve kategorije</option>
          {lookups.categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
        </select>
        <button>Traži</button>
      </form>

      {!list.length ? (
        <EmptyState title="Nema oglasa" text="Promijeni filtere ili se vrati kasnije." />
      ) : (
        <div className="job-list">
          {list.map((job, idx) => (
            <>
              <JobCard job={job} key={job.id} />
              {/* Banner na sredini liste — svaki BANNER_EVERY oglas */}
              {(idx + 1) % BANNER_EVERY === 0 && idx < list.length - 1 && (
                <BannerSlot key={`banner-${idx}`} placement="jobs_list_middle" />
              )}
            </>
          ))}
        </div>
      )}

      <BannerSlot placement="jobs_list_bottom" />
    </>
  );
}
