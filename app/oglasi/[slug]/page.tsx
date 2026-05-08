import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/apply-form";
import { JobViewTracker } from "@/components/job-view-tracker";
import { BannerSlot } from "@/components/banner-slot";
import { formatDate, initials, jobUrl, parseIdFromSlug } from "@/lib/format";
import { getJobById, getPublicJobs } from "@/lib/queries/public";
import { JobCard } from "@/components/job-card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseIdFromSlug(slug);
  if (!id) return { title: "Oglas nije pronađen" };
  const job = await getJobById(id);
  if (!job) return { title: "Oglas nije pronađen" };
  return {
    title: `${job.title}${job.companies?.name ? ` — ${job.companies.name}` : ""}`,
    description: job.description?.slice(0, 160)
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const id = parseIdFromSlug(slug);
  if (!id) return notFound();
  const [job, allJobs] = await Promise.all([getJobById(id), getPublicJobs(10)]);
  if (!job) return notFound();

  const co = job.companies;
  const similar = allJobs.filter(j => j.id !== job.id && (j.categories?.name === job.categories?.name || j.cities?.name === job.cities?.name)).slice(0, 2);

  return (
    <>
      <div style={{ padding: "16px 0 0" }}>
        <Link className="btn ghost sm" href="/oglasi">← Nazad na oglase</Link>
      </div>
      <section className="detail-layout with-top-space">
        <article className="panel">
          <div className="tags" style={{ marginBottom: 14 }}>
            {job.featured && <span className="badge orange">★ Istaknuto</span>}
            {job.categories?.name && <span className="badge blue">{job.categories.name}</span>}
            {job.contract_type && <span className="tag">{job.contract_type}</span>}
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", marginBottom: 10 }}>{job.title}</h1>
          <div className="meta" style={{ marginBottom: 16 }}>
            {co?.name && <strong>{co.name}</strong>}
            {job.cities?.name && <span>· {job.cities.name}</span>}
            <span>· Rok {formatDate(job.deadline)}</span>
          </div>
          {job.description && <p className="detail-text">{job.description}</p>}

          <div style={{ marginTop: 24 }}>
            {job.salary_text && <span className="badge lime" style={{ marginRight: 6 }}>{job.salary_text}</span>}
            {job.contract_type && <span className="badge gray">{job.contract_type}</span>}
          </div>

          {similar.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div className="section-head compact-head"><div><h2 style={{ fontSize: 24 }}>Slični oglasi</h2></div></div>
              <div className="job-list">{similar.map(j => <JobCard job={j} key={j.id} />)}</div>
            </div>
          )}
        </article>

        <aside className="sticky">
          <div className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div className="logo">{initials(co?.name)}</div>
              <div>
                <strong style={{ display: "block", fontSize: 16 }}>{co?.name || "Poslodavac"}</strong>
                <span className="sub">{job.cities?.name || "Crna Gora"}</span>
              </div>
            </div>
            <div className="tags" style={{ marginBottom: 14 }}>
              {job.salary_text && <span className="badge lime">{job.salary_text}</span>}
              <span className="tag">Rok {formatDate(job.deadline)}</span>
              {job.contract_type && <span className="tag">{job.contract_type}</span>}
            </div>
            {co && <Link className="btn ghost sm" href={`/firme/${co.slug || co.id}`} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>Profil firme</Link>}
          </div>
          <div className="card">
            <h2 style={{ fontSize: 22, marginBottom: 14 }}>Prijavi se</h2>
            <JobViewTracker jobId={job.id} />
      <BannerSlot placement="job_detail_top" />
      <ApplyForm jobId={job.id} />
          </div>
        </aside>
      <BannerSlot placement="job_detail_bottom" />
    </section>
    </>
  );
}
