import type { Metadata } from "next";
import Link from "next/link";
import { JobCardCompact } from "@/components/job-card-compact";
import { RecommendedCompanies } from "@/components/recommended-companies";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { Button, EmptyState, PageLabel } from "@/components/ui";
import { BannerSlot } from "@/components/banner-slot";
import { TickerStripFromDB } from "@/components/ticker-strip";
import { getLookups, getHomepageData, getCompanies } from "@/lib/queries/public";
import { getActiveBanners } from "@/lib/queries/banners";
import type { JobWithPromotion } from "@/types/domain";

export const metadata: Metadata = {
  title: "imaposla.me — Poslovi u Crnoj Gori",
  description: "Pronađi posao ili objavi oglas u Crnoj Gori. Kandidati, firme i oglasi na jednom mjestu.",
};

export const revalidate = 300;

const POPULAR: { label: string; q: string }[] = [
  { label: "Konobar",        q: "konobar" },
  { label: "Moler",          q: "moler" },
  { label: "Prodavac",       q: "prodavac" },
  { label: "Sezonski rad",   q: "sezonski" },
  { label: "Rad od kuće",    q: "rad od kuce" },
  { label: "Pomoćni radnik", q: "pomocni radnik" },
];

export default async function HomePage() {
  const [homepageData, heroBanners, lookups] = await Promise.all([
    getHomepageData(),
    getActiveBanners("homepage_hero", "all", 5),
    getLookups(),
  ]);

  const { paidTopJobs, featuredJobs, regularJobs, recommendedCompanies } = homepageData;
  const fallbackCompaniesRaw = recommendedCompanies.length === 0 ? await getCompanies(8) : [];
  const fallbackCompanies = fallbackCompaniesRaw as unknown as import("@/types/domain").CompanyWithExtras[];
  const allJobs: JobWithPromotion[] = [...paidTopJobs, ...featuredJobs, ...regularJobs];

  return (
    <section className="live-home">

      {/* HERO */}
      <div className="live-hero">
        <PageLabel>Pravi ljudi. Prave prilike.</PageLabel>
        <h1>Pronađi posao ili zaposli prave ljude.</h1>
        <p>
          Kandidati brzo dolaze do relevantnih oglasa. Poslodavci objavljuju posao,
          dobijaju prijave i vode selekciju na jednom mjestu.
        </p>

        <div className="hero-intent-cards">
          <Link href="/registracija?role=company" className="hero-intent-card">
            <span className="hero-intent-label">Nudim posao</span>
            <strong>Objavi oglas i pronađi kandidate</strong>
          </Link>
          <Link href="/oglasi" className="hero-intent-card">
            <span className="hero-intent-label">Tražim posao</span>
            <strong>Pretraži oglase i pošalji prijavu</strong>
          </Link>
        </div>

        <form className="live-search" action="/oglasi">
          <input name="q" placeholder="Naziv posla, firma ili vještina" />
          <select name="city">
            <option value="">Svi gradovi</option>
            {lookups.cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select name="category">
            <option value="">Sve kategorije</option>
            {lookups.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button type="submit">Pretraži</button>
        </form>

        <div className="quick-tags">
          <span className="quick-tags__label">Popularno:</span>
          {POPULAR.map(p => (
            <Link key={p.q} href={`/oglasi?q=${encodeURIComponent(p.q)}`} className="quick-tag">
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* TICKER */}
      <TickerStripFromDB
        jobs={allJobs.slice(0, 16)}
        companies={recommendedCompanies.slice(0, 12)}
      />

      {/* BANNERS */}
      {heroBanners.length > 0 && (
        <HeroBannerCarousel banners={heroBanners} autoPlayMs={6000} />
      )}
      <BannerSlot placement="homepage_top" />

      {/* ISTAKNUTI POSLODAVCI */}
      {(recommendedCompanies.length > 0 || fallbackCompanies.length > 0) && (
        <div>
          <div className="live-section-head">
            <div>
              <span className="kicker">Premium sekcija</span>
              <h2>Istaknuti poslodavci</h2>
              <p>Firme koje aktivno traže ljude i imaju javne profile na platformi.</p>
            </div>
            <Button href="/firme" size="sm">Svi poslodavci</Button>
          </div>
          <RecommendedCompanies
            companies={recommendedCompanies.length > 0 ? recommendedCompanies : fallbackCompanies}
          />
        </div>
      )}

      <BannerSlot placement="homepage_middle" />

      {/* NAJNOVIJI OGLASI */}
      <div>
        <div className="live-section-head">
          <div>
            <span className="kicker">Aktivno</span>
            <h2>Najnoviji oglasi</h2>
            <p>Prikazuju se samo oglasi koji su odobreni i aktivni.</p>
          </div>
          <Button href="/oglasi" size="sm">Svi oglasi</Button>
        </div>
        {allJobs.length > 0 ? (
          <>
            <div className="job-list two-col">
              {allJobs.slice(0, 8).map((j: JobWithPromotion) => (
                <JobCardCompact key={j.id} job={j} />
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Button href="/oglasi" tone="blue">Pogledaj sve oglase</Button>
            </div>
          </>
        ) : (
          <EmptyState
            title="Još nema aktivnih oglasa"
            text="Kada firma pošalje oglas i bude odobren, pojaviće se ovdje."
            action={<Button href="/oglasi" tone="blue">Pretraga oglasa</Button>}
          />
        )}
      </div>

      {/* CTA PATHS */}
      <div className="live-paths">
        <Link className="live-path" href="/oglasi">
          <span>Kandidat</span>
          <h2>Tražim posao</h2>
          <p>Otvori oglas, pročitaj uslove, dopuni biografiju i pošalji prijavu bez komplikacija.</p>
          <strong>Otvori oglase →</strong>
        </Link>
        <Link className="live-path" href="/registracija?role=company">
          <span>Firma</span>
          <h2>Nudim posao</h2>
          <p>Napravi profil firme, pošalji oglas na pregled i vodi kandidate kroz selekciju.</p>
          <strong>Kreni kao firma →</strong>
        </Link>
      </div>

      <BannerSlot placement="homepage_bottom" />
    </section>
  );
}
