import Link from "next/link";
import { companyUrl, initials } from "@/lib/format";
import type { Company } from "@/types/domain";

export function CompanyCard({ company }: { company: Company }) {
  const url = companyUrl(company);
  return (
    <article className="company-card">
      <div className="logo" style={{ flexShrink: 0 }}>{initials(company.name)}</div>
      <div>
        <h3><Link href={url}>{company.name}</Link></h3>
        <div className="meta" style={{ margin: "4px 0 6px" }}>
          {company.city && <span>{company.city}</span>}
          {company.industry && <span>· {company.industry}</span>}
        </div>
        <p>{company.description || "Profil poslodavca."}</p>
        <div style={{ marginTop: 10 }}>
          <Link className="btn ghost sm" href={url}>Profil firme →</Link>
        </div>
      </div>
    </article>
  );
}
