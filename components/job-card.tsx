import Link from "next/link";
import { formatDate, jobUrl } from "@/lib/format";
import { Avatar } from "@/components/avatar";
import { SaveJobButton } from "@/components/save-job-button";
import type { Job } from "@/types/domain";

export function JobCard({ job, showStatus = false }: { job: Job; showStatus?: boolean }) {
  const co = job.companies;
  const url = jobUrl(job);
  return (
    <article className={`job-card job-card-clean${job.featured ? " featured featured-card" : ""}`}>
      <div className="job-card-clean__logo">
        <Avatar bucket="company-logos" path={co?.logo_path} fallback={co?.name || ""} size={52} shape="rounded" />
      </div>

      <div className="job-card-clean__main">
        <div className="job-card-clean__top">
          <span className="job-card-clean__company">{co?.name || "Poslodavac"}</span>
          {job.featured && <span className="badge orange">Premium</span>}
          {showStatus && (
            <span className={`badge ${job.status === "active" ? "green" : job.status === "pending_review" ? "orange" : "gray"}`}>
              {job.status === "active" ? "Aktivan" : job.status === "pending_review" ? "Na pregledu" : job.status}
            </span>
          )}
        </div>

        <Link className="job-title" href={url}>{job.title}</Link>

        <div className="job-card-clean__meta">
          {job.cities?.name && <span>{job.cities.name}</span>}
          {job.categories?.name && <span>{job.categories.name}</span>}
          {job.contract_type && <span>{job.contract_type}</span>}
          {job.salary_text && <span>{job.salary_text}</span>}
        </div>

        {job.description && <p className="job-desc">{job.description.slice(0, 180)}{job.description.length > 180 ? "..." : ""}</p>}
      </div>

      <div className="job-actions job-card-clean__actions">
        <div className="deadline">Rok prijave <strong>{formatDate(job.deadline)}</strong></div>
        <Link className="btn blue sm" href={url}>Detalji i prijava</Link>
        <SaveJobButton jobId={job.id} size="sm" />
      </div>
    </article>
  );
}
