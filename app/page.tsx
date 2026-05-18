import type { Metadata } from "next";
import Link from "next/link";
import { JobCard } from "@/components/job-card";
import { JobCardCompact } from "@/components/job-card-compact";
import { CompanyCard } from "@/components/company-card";
import { RecommendedCompanies } from "@/components/recommended-companies";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { Button, EmptyState, PageLabel } from "@/components/ui";
import { BannerSlot } from "@/components/banner-slot";
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

  const { paidTopJobs, featuredJobs, regularJobs, quickJobs, recommendedCompanies } = homepageData;

  // Fallback za firme ako nema preporučenih
  const fallbackCompanies = recommendedCompanies.length === 0 ? await getCompanies(4) : [];

  return (
    <section className="live-home">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="live-hero">
        <PageLabel>imaposla.me</PageLabel>
        <h1>Posao u Crnoj Gori, jasno od prvog klika.</h1>
        <p>
          Kandidat pretražuje oglase, pravi biografiju i šalje prijavu.
          Firma objavljuje oglas, prati prijave i vodi selekciju.
        </p>

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
          <button type="submit">Traži</button>
        </form>

        <div className="quick-tags">
          <span className="quick-tags__label">Popularno:</span>
          {POPULAR.map(p => (
            <Link key={p.q} href={`/oglasi?q=${encodeURIComponent(p.q)}`} className="quick-tag">
              {p.label}
            </Link>
          ))}
        </div>

        <div className="live-actions">
          <Button href="/oglasi" tone="lime">Pronađi posao</Button>
          <Button href="/registracija?role=company" tone="blue">Objavi oglas</Button>
          <Button href="/profil/biografija" tone="ghost">Napravi CV</Button>
        </div>
      </div>

      {/* ── HERO CAROUSEL ─────────────────────────────────── */}
      {heroBanners.length > 0 && (
        <HeroBannerCarousel banners={heroBanners} autoPlayMs={6000} />
      )}

      <BannerSlot placement="homepage_top" />

      {/* ── PREPORUČENI POSLODAVCI ──────────────────────── */}
      {recommendedCompanies.length > 0 && (
        <div>
          <div className="live-section-head">
            <div>
              <span className="kicker">Poslodavci</span>
              <h2>Preporučeni poslodavci</h2>
              <p>Firme koje aktivno zapošljavaju.</p>
            </div>
            <Button href="/firme" size="sm">Sve firme</Button>
          </div>
          <RecommendedCompanies companies={recommendedCompanies} />
        </div>
      )}

      {/* ── TOP POZICIJE ───────────────────────────────── */}
      {paidTopJobs.length > 0 && (
        <div>
          <div className="live-section-head">
            <div>
              <span className="kicker">★ Top pozicije</span>
              <h2>Plaćene pozicije</h2>
              <p>Istaknuti oglasi koji se promoviraju na platformi.</p>
            </div>
          </div>
          <div className="job-list two-col">
            {paidTopJobs.map((job: JobWithPromotion) => (
              <JobCardCompact key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* ── ISTAKNUTI OGLASI ───────────────────────────── */}
      {featuredJobs.length > 0 && (
        <div>
          <div className="live-section-head">
            <div>
              <span className="kicker">★ Istaknuto</span>
              <h2>Istaknuti poslovi</h2>
              <p>Oglasi koje firme posebno ističu.</p>
            </div>
            <Button href="/oglasi" size="sm" tone="ghost">Svi oglasi</Button>
          </div>
          <div className="job-list two-col">
            {featuredJobs.map((job: JobWithPromotion) => (
              <JobCardCompact key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      <BannerSlot placement="homepage_middle" />

      {/* ── BRZI POSLOVI ──────────────────────────────── */}
      {quickJobs.length > 0 && (
        <div>
          <div className="live-section-head">
            <div>
              <span className="kicker">Brzo</span>
              <h2>Brzi poslovi</h2>
              <p>Kratkoročni angažmani, eventi, sezonski rad.</p>
            </div>
            <Button href="/oglasi?quick=true" size="sm">Svi brzi</Button>
          </div>
          <div className="job-list two-col">
            {quickJobs.map(job => (
              <JobCardCompact key={job.id} job={job as JobWithPromotion} />
            ))}
          </div>
        </div>
      )}

      {/* ── PATHS ─────────────────────────────────────── */}
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

      {/* ── NAJNOVIJI OGLASI ──────────────────────────── */}
      <div>
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
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button href="/oglasi" tone="blue">Pogledaj sve oglase</Button>
          </div>
        )}
      </div>

      {/* ── ODOBRENI POSLODAVCI (ako nema preporučenih) ── */}
      {recommendedCompanies.length === 0 && fallbackCompanies.length > 0 && (
        <div>
          <div className="live-section-head">
            <div>
              <span className="kicker">Firme</span>
              <h2>Odobreni poslodavci</h2>
              <p>Firme koje imaju javni profil na platformi.</p>
            </div>
            <Button href="/firme" size="sm">Sve firme</Button>
          </div>
          <div className="grid two">
            {fallbackCompanies.map(c => <CompanyCard company={c} key={c.id} />)}
          </div>
        </div>
      )}

      <BannerSlot placement="homepage_bottom" />
    </section>
  );
}
