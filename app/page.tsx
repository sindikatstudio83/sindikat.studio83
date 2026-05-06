import type { Metadata } from "next";
import Link from "next/link";
import { JobCard } from "@/components/job-card";
import { CompanyCard } from "@/components/company-card";
import { getCompanies, getLookups, getPublicJobs } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "imaposla.me — Poslovi u Crnoj Gori",
  description: "Pronađi posao ili objavi oglas u Crnoj Gori. Kandidati, firme i oglasi na jednom mjestu."
};

export default async function HomePage() {
  const [jobs, companies, lookups] = await Promise.all([getPublicJobs(6), getCompanies(4), getLookups()]);
  const featuredJobs = jobs.filter(j => j.featured);
  const regularJobs = jobs.filter(j => !j.featured);

  return (
    <div className="live-home">
      {/* HERO */}
      <div className="live-hero">
        <span className="kicker">⚡ Oglasi · Kandidati · Firme</span>
        <h1>Poslovi koji ne izgledaju kao <span className="grad-text">dosadan oglasnik.</span></h1>
        <p>Kandidati pretražuju bez logovanja. Firme dobijaju prijave sa CV-om i motivacionim pismom. Admin kontroliše uplate i oglase.</p>
        <form className="live-search" action="/oglasi">
          <input name="q" placeholder="Pozicija, firma ili vještina..." />
          <select name="city">
            <option value="">Svi gradovi</option>
            {lookups.cities.map(c => <option key={c.id}>{c.name}</option>)}
          </select>
          <select name="category">
            <option value="">Sve kategorije</option>
            {lookups.categories.map(c => <option key={c.id}>{c.name}</option>)}
          </select>
          <button type="submit">Traži →</button>
        </form>
        <div className="live-actions">
          <Link className="btn lime" href="/oglasi">Tražim posao</Link>
          <Link className="btn blue" href="/registracija?role=company">Zapošljavam</Link>
          <Link className="btn ghost" href="/login">Prijava</Link>
        </div>
      </div>

      {/* STATS */}
      <div className="stat-mosaic">
        <div className="stat"><strong>{jobs.length}</strong><span>Aktivnih oglasa</span></div>
        <div className="stat"><strong>{companies.length}</strong><span>Poslodavaca</span></div>
        <div className="stat"><strong>{lookups.cities.length}</strong><span>Gradova</span></div>
        <div className="stat"><strong>{lookups.categories.length}</strong><span>Kategorija</span></div>
      </div>

      {/* PATHS */}
      <div className="live-paths">
        <Link className="live-path" href="/oglasi">
          <span>Kandidat</span>
          <h2>Pronađi posao</h2>
          <p>Otvori oglas, pročitaj uslove, dopuni biografiju i pošalji prijavu bez upload fajlova.</p>
          <strong>Otvori oglase →</strong>
        </Link>
        <Link className="live-path" href="/registracija?role=company">
          <span>Firma</span>
          <h2>Objavi oglas</h2>
          <p>Napravi profil firme, pošalji oglas na pregled i vodi kandidate kroz selekciju.</p>
          <strong>Kreni kao firma →</strong>
        </Link>
      </div>

      {/* FEATURED JOBS */}
      {featuredJobs.length > 0 && (
        <div>
          <div className="live-section-head">
            <div><span className="kicker">★ Istaknuto</span><h2>Istaknuti oglasi</h2></div>
            <Link className="btn ghost sm" href="/oglasi">Svi oglasi →</Link>
          </div>
          <div className="job-list">{featuredJobs.map(j => <JobCard job={j} key={j.id} />)}</div>
        </div>
      )}

      {/* LATEST JOBS */}
      <div>
        <div className="live-section-head">
          <div><span className="kicker">Aktivno</span><h2>Najnoviji oglasi</h2><p>Prikazuju se samo odobreni i aktivni oglasi.</p></div>
          <Link className="btn ghost sm" href="/oglasi">Svi oglasi →</Link>
        </div>
        <div className="job-list">
          {regularJobs.length
            ? regularJobs.map(j => <JobCard job={j} key={j.id} />)
            : (
              <div className="empty">
                <strong>Još nema aktivnih oglasa</strong>
                <p>Kad firma pošalje oglas i bude odobren, pojaviće se ovdje.</p>
                <Link className="btn blue sm" href="/registracija?role=company">Objavi oglas →</Link>
              </div>
            )
          }
        </div>
      </div>

      {/* COMPANIES */}
      <div>
        <div className="live-section-head">
          <div><span className="kicker">Firme</span><h2>Odobreni poslodavci</h2></div>
          <Link className="btn ghost sm" href="/firme">Sve firme →</Link>
        </div>
        <div className="grid two">
          {companies.map(c => <CompanyCard company={c} key={c.id} />)}
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="grid three">
        <div className="card">
          <div className="kicker" style={{ marginBottom: 12 }}>Za kandidate</div>
          <h3>CV + prijava</h3>
          <p>Telefon, grad, motivaciono pismo, status tracking — bez upload fajlova.</p>
        </div>
        <div className="card">
          <div className="kicker" style={{ marginBottom: 12 }}>Za firme</div>
          <h3>ATS + baza</h3>
          <p>Kanban, komentari, oznake — vodi kandidate kroz selekciju iz jednog mjesta.</p>
        </div>
        <div className="card">
          <div className="kicker" style={{ marginBottom: 12 }}>Za admina</div>
          <h3>Kontrola</h3>
          <p>Uplate, kodovi, moderacija oglasa i upravljanje korisnicima platforme.</p>
        </div>
      </div>
    </div>
  );
}
