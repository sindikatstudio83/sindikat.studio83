import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { jobUrl } from "@/lib/format";
import type { JobWithPromotion } from "@/types/domain";

interface Props {
  job: JobWithPromotion;
}

const PROMO_LABELS: Record<string, { label: string; cls: string }> = {
  paid_top:     { label: "Top",   cls: "badge orange" },
  featured:     { label: "★",     cls: "badge orange" },
  urgent:       { label: "Hitno", cls: "badge red"    },
  homepage_top: { label: "HP",    cls: "badge blue"   },
};

/**
 * Kompaktna kartica za 2-kolone prikaz na početnoj i /oglasi.
 * Koegzistira sa starim JobCard — ne briše ga.
 */
export function JobCardCompact({ job }: Props) {
  const co = job.companies;
  const url = jobUrl(job);
  const promo = job.promotion_type ? PROMO_LABELS[job.promotion_type] : null;
  // Ova polja dolaze iz baze ali nisu u osnovnom Job tipu — koristimo type assertion
  const jobExt = job as JobWithPromotion & {
    quick_job?: boolean;
    daily_rate?: number | null;
    cities?: { name: string } | null;
  };

  return (
    <Link href={url} className={`job-compact${promo ? " job-compact--promo" : ""}${jobExt.quick_job ? " job-compact--quick" : ""}`}>
      <div className="job-compact__logo">
        <Avatar bucket="company-logos" path={co?.logo_path ?? null} fallback={co?.name ?? ""} size={34} shape="rounded" />
      </div>
      <div className="job-compact__body">
        <span className="job-compact__title">{job.title}</span>
        <span className="job-compact__company">{co?.name}</span>
        {jobExt.cities?.name && (
          <span className="job-compact__city">{jobExt.cities.name}</span>
        )}
        {jobExt.quick_job && jobExt.daily_rate && (
          <span className="job-compact__rate">{jobExt.daily_rate} € / dan</span>
        )}
      </div>
      {(promo || jobExt.quick_job) && (
        <div className="job-compact__badge">
          {promo
            ? <span className={promo.cls}>{promo.label}</span>
            : <span className="badge lime">Brzo</span>
          }
        </div>
      )}
    </Link>
  );
}
