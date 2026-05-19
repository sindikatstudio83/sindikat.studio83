# imaposla.me — Finalni deployment vodič
# Build: ✓ Compiled  |  Typecheck: ✓ 0 errors  |  Lint: ✓ 0 warnings

════════════════════════════════════════════════════════
 KORAK 1 — SUPABASE SQL (OBAVEZNO PRVO)
════════════════════════════════════════════════════════

Otvori: https://supabase.com → tvoj projekat → SQL Editor

Zalijepi i pokreni fajl: supabase-growth-features-2026-05.sql

Šta radi:
  • Dodaje kolone u companies (recommended, recommended_priority, instagram_url, updated_at)
  • Dodaje kolone u jobs (quick_job, shift_date, shift_start, shift_end, daily_rate, urgent, instagram_post_url, social_promo_note)
  • Kreira 6 novih tabela: job_promotions, company_cv_unlocks, credit_transactions, banner_requests, worker_ratings, creative_templates
  • Dodaje kolone u plans (featured_jobs_limit, paid_top_positions_limit, banner_requests_limit, quick_jobs_limit)
  • Dodaje kolone u subscriptions (updated_at ako ne postoji)
  • Dodaje kolone u candidate_profiles (quick_jobs_enabled, worker_type, availability, service_area, hourly_rate, daily_rate, years_experience, public_worker_profile)
  • Kreira 3 RPC funkcije: spend_company_credits, add_company_credits, get_company_credit_balance
  • Kreira funkciju expire_job_promotions()
  • Postavlja RLS politike za sve nove tabele
  • Kreira performance indekse

Sigurno za pokretanje: sve naredbe koriste IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.

════════════════════════════════════════════════════════
 KORAK 2 — FAJLOVI (copy/replace u projektu)
════════════════════════════════════════════════════════

Svaki fajl iz ovog paketa ide TAČNO na ovu putanju u projektu:

── IZMIJENJENI FAJLOVI (zamijeni postojeće) ─────────────

  types/domain.ts
    → Zamijeni. Dodat homepage_hero placement + 9 novih tipova na dno.

  lib/queries/public.ts
    → Zamijeni. Nova getHomepageData(), prošireni getPublicJobs() sa quick/featured filterima.

  lib/queries/banners.ts
    → Zamijeni. Nova getActiveBanners() za višestruke banere (hero carousel).

  lib/banner-constants.ts
    → Zamijeni. Dodan homepage_hero u placementLabels.

  lib/navigation.ts
    → Zamijeni. Dodane rute: firma/kandidati, firma/baneri, admin/banner-zahtjevi, admin/templates.

  app/page.tsx
    → Zamijeni. Kompletno nova početna: hero + search + quick-tags + CTAs + hero carousel
      + preporučeni poslodavci + top pozicije + istaknuti + brzi poslovi + najnoviji + paths.

  app/oglasi/page.tsx
    → Zamijeni. Dodat ?quick=true filter, kompaktne kartice, filter pill za brze poslove,
      middle banner svakih 8 oglasa, featured sekcija iznad regularnih.

  components/admin-client.tsx
    → Zamijeni. Dodat search+filter bar (oglasi/firme/korisnici), toggle "Preporuči firmu",
      quick-links za banner-zahtjevi i templates na dashboard.

  components/admin-promote-modal.tsx
    → Zamijeni. Fix: safeMessage("save") — build error bio prisutan.

── NOVI FAJLOVI (kreiraj na tačnoj putanji) ─────────────

  app/admin/banner-zahtjevi/page.tsx     ← nova admin ruta
  app/admin/templates/page.tsx           ← nova admin ruta
  app/firma/kandidati/page.tsx           ← nova firma ruta
  app/firma/baneri/page.tsx              ← nova firma ruta

  components/hero-banner-carousel.tsx    ← auto-play carousel sa dots i arrows
  components/recommended-companies.tsx   ← grid preporučenih poslodavaca
  components/job-card-compact.tsx        ← kompaktna kartica za 2-kolone layout
  components/admin-banner-requests-client.tsx  ← admin odobrava banner zahtjeve
  components/admin-templates-client.tsx  ← admin CRUD za Canva template linkove
  components/cv-unlock-client.tsx        ← firma pretražuje i otključava CV-e
  components/banner-request-client.tsx   ← firma šalje banner zahtjev

── CSS (dodati na dno globals.css) ──────────────────────

  globals-additions.css
    → Otvori app/globals.css, skrolaj na dno, zalijepi cijeli sadržaj ovog fajla.
    → NE brišeš postojeći CSS — samo dodaješ na kraj.

════════════════════════════════════════════════════════
 KORAK 3 — VERIFIKACIJA NAKON DEPLOYA
════════════════════════════════════════════════════════

□ npm run typecheck   → mora biti 0 grešaka
□ npm run lint        → mora biti 0 upozorenja
□ npm run build       → mora proći

Ako build pukne zbog env varijabli → normalno u dev, na produkciji postavi:
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

════════════════════════════════════════════════════════
 KORAK 4 — TESTIRANJE U SUPABASE (ručno)
════════════════════════════════════════════════════════

A) Provjeri da su kolone kreirane:
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'companies' AND column_name IN ('recommended','instagram_url');

B) Provjeri tabele:
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('job_promotions','company_cv_unlocks','credit_transactions',
                     'banner_requests','worker_ratings','creative_templates');

C) Provjeri RPC funkcije:
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name IN ('spend_company_credits','add_company_credits','get_company_credit_balance');

D) Provjeri RLS:
   SELECT tablename, policyname FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename IN ('job_promotions','banner_requests','credit_transactions');

════════════════════════════════════════════════════════
 KORAK 5 — PRVE AKCIJE U ADMINU NAKON DEPLOYA
════════════════════════════════════════════════════════

1. HERO CAROUSEL — dodaj test baner:
   Supabase → Table Editor → banners → Insert row:
   title: "Test hero baner"
   placement: "homepage_hero"
   approved: true
   priority: 10
   image_path: (URL slike ili Supabase storage path)
   target_url: https://imaposla.me/oglasi

2. PREPORUČENI POSLODAVCI — označi firme:
   Supabase → Table Editor → companies → Edit red
   recommended: true
   recommended_priority: 10 (viši = prikazuje se prva)

3. PROMOCIJE OGLASA — test:
   Admin panel → Oglasi → odaberi oglas → "⬆ Promoviši"
   Odaberi "featured" ili "paid_top", postavi prioritet 10.
   Oglas se treba pojaviti na početnoj u odgovarajućoj sekciji.

4. CANVA TEMPLATES:
   /admin/templates → "Dodaj template"
   Unesi Canva link, format i svrhu.

5. BANNER ZAHTJEVI:
   Kao firma: /firma/baneri → "Novi zahtjev"
   Kao admin: /admin/banner-zahtjevi → vidi zahtjev, Odobri/Odbij

6. CV UNLOCK (zahtijeva aktivnu pretplatu s kreditima):
   Kao firma: /firma/kandidati → pretraži → "🔓 Otključaj CV (1 kredit)"
   Provijeri credit_transactions tabelu da li je zapis kreiran.

════════════════════════════════════════════════════════
 KORAK 6 — OPCIONO: CRON ZA EXPIRE PROMOCIJA
════════════════════════════════════════════════════════

U Supabase → Database → Extensions → pg_cron (enable)

Potom u SQL Editoru:
  SELECT cron.schedule(
    'expire-promotions',
    '0 * * * *',
    'SELECT public.expire_job_promotions()'
  );

Ovo svaki sat automatski postavlja status = 'expired' za promocije kojima je istekao ends_at.

════════════════════════════════════════════════════════
 SAŽETAK NOVIH RUTA
════════════════════════════════════════════════════════

  /firma/kandidati     → baza kandidata + CV unlock
  /firma/baneri        → slanje banner zahtjeva
  /admin/banner-zahtjevi → admin odobrava zahtjeve
  /admin/templates     → Canva template CRUD

════════════════════════════════════════════════════════
 POZNATI RIZICI
════════════════════════════════════════════════════════

1. candidate_profiles tabela — migracija pretpostavlja da postoji i da ima user_id kolonu.
   Ako tabela ima drugačiji primarni ključ, provjeri REFERENCES u SQL-u.

2. spend_company_credits RPC — radi samo ako firma ima AKTIVNU pretplatu
   (subscriptions.status = 'active') sa unlock_credits_remaining >= 1.
   Firma bez pretplate ne može otključati CV.

3. job_promotions — homepage i oglasi page koriste JOIN na ovu tabelu.
   Dok tabela bude prazna, paidTopJobs i featuredJobs će biti prazni.
   Fallback automatski uzima jobs.featured = true ako nema promocija.

4. Hero carousel — prikazuje se samo ako u banners tabeli postoji barem
   jedan red sa placement = 'homepage_hero' i approved = true.
   Dok nema, hero sekcija je normalna bez carousel-a (nije greška).
