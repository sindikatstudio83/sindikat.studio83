import type { Metadata } from "next";
import Link from "next/link";
import { JobCard } from "@/components/job-card";
import { JobCardCompact } from "@/components/job-card-compact";
import { CompanyCard } from "@/components/company-card";
import { PremiumEmployers } from "@/components/premium-employers";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { Button, EmptyState, PageLabel } from "@/components/ui";
import { BannerSlot } from "@/components/banner-slot";
import { getLookups, getHomepageData, getCompanies } from "@/lib/queries/public";
import { getActiveBanners } from "@/lib/queries/banners";
import type { JobWithPromotion } from "@/types/domain";

export const metadata: Metadata = {
  title: "imaposla.me - Poslovi u Crnoj Gori",
  description: "Pronađi posao ili objavi oglas u Crnoj Gori. Kandidati, firme i oglasi na jednom mjestu.",
};

export const revalidate = 300;

const POPULAR: { label: string; q: string }[] = [
  { label: "Konobar", q: "konobar" },
  { label: "Moler", q: "moler" },
  { label: "Prodavac", q: "prodavac" },
  { label: "Sezonski rad", q: "sezonski" },
  { label: "Rad od kuće", q: "rad od kuce" },
  { label: "Pomoćni radnik", q: "pomocni radnik" },
];

export default async function HomePage() {
  const [homepageData, heroBanners, lookups] = await Promise.all([
    getHomepageData(),
    getActiveBanners("homepage_hero", "all", 5),
    getLookups(),
  ]);

  const { paidTopJobs, featuredJobs, regularJobs, quickJobs, recommendedCompanies } = homepageData;
  const fallbackCompanies = recommendedCompanies.length === 0 ? await getCompanies(8) : [];
  const premiumCompanies = recommendedCompanies.length > 0 ? recommendedCompanies : fallbackCompanies;

  return (
    <section className="live-home home-redesign">
      <div className="live-hero home-hero-redesign">
        <PageLabel>Pravi ljudi. Prave prilike.</PageLabel>
        <h1>Pronađi posao ili zaposli prave ljude.</h1>
        <p>
          Kandidati brzo dolaze do relevantnih oglasa. Poslodavci objavljuju posao,
          dobijaju prijave i vode selekciju na jednom mjestu.
        </p>

        <div className="home-intent-switch" aria-label="Izaberi šta želiš da uradiš">
          <Link href="/registracija?role=company" className="home-intent-card home-intent-card--employer">
            <span>Nudim posao</span>
            <strong>Objavi oglas i pronađi kandidate</strong>
          </Link>
          <Link href="/oglasi" className="home-intent-card home-intent-card--candidate">
            <span>Tražim posao</span>
            <strong>Pretraži oglase i pošalji prijavu</strong>
          </Link>
        </div>

        <form className="live-search home-main-search" action="/oglasi">
          <input name="q" placeholder="Naziv posla, firma ili vještina" aria-label="Naziv posla, firma ili vještina" />
          <select name="city" aria-label="Grad">
            <option value="">Svi gradovi</option>
            {lookups.cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select name="category" aria-label="Kategorija">
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

      {premiumCompanies.length > 0 && (
        <section className="premium-employers-section" aria-labelledby="premium-employers-title">
          <div className="live-section-head">
            <div>
              <span className="kicker">Premium sekcija</span>
              <h2 id="premium-employers-title">Istaknuti poslodavci</h2>
              <p>Firme koje aktivno traže ljude i imaju javne profile na platformi.</p>
            </div>
            <Button href="/firme" size="sm" tone="ghost">Svi poslodavci</Button>
          </div>
          <PremiumEmployers companies={premiumCompanies} />
        </section>
      )}

      {heroBanners.length > 0 && (
        <HeroBannerCarousel banners={heroBanners} autoPlayMs={6000} />
      )}

      <BannerSlot placement="homepage_top" />

      {(paidTopJobs.length > 0 || featuredJobs.length > 0) && (
        <section className="home-jobs-highlight">
          <div className="live-section-head">
            <div>
              <span className="kicker">Preporučeno</span>
              <h2>Poslovi koji se izdvajaju</h2>
              <p>Top i istaknuti oglasi prikazani pregledno odmah ispod poslodavaca.</p>
            </div>
            <Button href="/oglasi" size="sm">Svi oglasi</Button>
          </div>
          <div className="job-list two-col">
            {[...paidTopJobs, ...featuredJobs].map((job: JobWithPromotion) => (
              <JobCardCompact key={`${job.promotion_type || "featured"}-${job.id}`} job={job} />
            ))}
          </div>
        </section>
      )}

      <BannerSlot placement="homepage_middle" />

      {quickJobs.length > 0 && (
        <section>
          <div className="live-section-head">
            <div>
              <span className="kicker">Brzo</span>
              <h2>Brzi poslovi</h2>
              <p>Kratkoročni angažmani, eventi i sezonski rad.</p>
            </div>
            <Button href="/oglasi?quick=true" size="sm">Svi brzi</Button>
          </div>
          <div className="job-list two-col">
            {quickJobs.map(job => (
              <JobCardCompact key={job.id} job={job as JobWithPromotion} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="live-section-head">
          <div>
            <span className="kicker">Aktivno</span>
            <h2>Najnoviji oglasi</h2>
            <p>Prikazuju se samo oglasi koji su odobreni i aktivni.</p>
          </div>
          <Button href="/oglasi" size="sm">Svi oglasi</Button>
        </div>
        <div className="job-list two-col">
          {regularJobs.length
            ? regularJobs.map(j => <JobCard job={j} key={j.id} />)
            : <EmptyState
                title="Još nema aktivnih oglasa"
                text="Kada firma pošalje oglas i bude odobren, pojaviće se ovdje."
                action={<Button href="/oglasi" tone="blue">Pretraga oglasa</Button>}
              />
          }
        </div>
        {regularJobs.length > 0 && (
          <div className="home-more-jobs">
            <Button href="/oglasi" tone="blue">Pogledaj sve oglase</Button>
          </div>
        )}
      </section>

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

      {recommendedCompanies.length === 0 && fallbackCompanies.length > 0 && (
        <section>
          <div className="live-section-head">
            <div>
              <span className="kicker">Firme</span>
              <h2>Odobreni poslodavci</h2>
              <p>Još firmi koje imaju javni profil na platformi.</p>
            </div>
            <Button href="/firme" size="sm">Sve firme</Button>
          </div>
          <div className="grid two">
            {fallbackCompanies.slice(0, 4).map(c => <CompanyCard company={c} key={c.id} />)}
          </div>
        </section>
      )}

      <BannerSlot placement="homepage_bottom" />
    </section>
  );
}
