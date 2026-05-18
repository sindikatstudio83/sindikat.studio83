# imaposla.me — Supabase Migrations: Canonical Order

## PRAVILO: Pokretati samo jednom, u ovom redosljed, na čist Supabase projekat

---

## Za novi Supabase projekat (fresh install)

Pokreni SQL fajlove **u ovom tačnom redosljed** u Supabase SQL Editoru:

```
1.  supabase-schema.sql              ← Osnovna šema: tabele, enum-i, sekvence
2.  supabase-storage.sql             ← Storage bucket-i (avatars, company-logos, banners, payment-proofs)
3.  supabase-production.sql          ← RLS politike, indeksi, trigger-i za produkciju
4.  supabase-auth-complete.sql       ← Auth trigger za auto-kreiranje profiles row-a
5.  supabase-security-fixes.sql      ← Sigurnosne zakrpe, Role escalation prevention
6.  supabase-admin-hardening.sql     ← is_admin() funkcija, admin-specific RLS zaštite
7.  supabase-missing-tables.sql      ← saved_jobs, job_alerts, job_views, payment_proofs
8.  supabase-packages-migration.sql  ← plans tabela proširenja, subscriptions
9.  supabase-banners-notifications-fix.sql ← notifications tabela, banner impressions/clicks
10. supabase-ats-persistence.sql     ← application_comments, application_labels, application_events
11. supabase-rls-fix.sql             ← Ispravke RLS politika (candidates see own data)
12. supabase-production-fixes.sql    ← Dodatne produkcijske popravke
13. supabase-storage-images-fix.sql  ← Storage RLS za avatars/company-logos
14. supabase-job-expiry.sql          ← company_pause_job, company_delete_job, company_submit_for_review RPC
15. supabase-performance.sql         ← Performance indeksi, ANALYZE
16. supabase-live-hardening-2026-05-05.sql ← Zadnje sigurnosne zakrpe pre produkcije
17. supabase-growth-features-2026-05.sql   ← Nove funkcionalnosti: job_promotions, cv_unlocks, krediti, baneri
18. supabase-audit-and-setup.sql           ← Audit log, trigeri za praćenje admin akcija, role escalation zaštita
```

**NE pokretati:**
- `supabase-final.sql` — legacy oznaka, sadržaj je pokriven gornjim fajlovima
- `supabase-seed-data.sql` — samo za dev/testing, ne na produkciji

**Za POSTOJEĆU bazu (samo novi features):**
```
Pokreni samo: supabase-growth-features-2026-05.sql
          i: supabase-audit-and-setup.sql
```

---

## Za existeći Supabase projekat (update/patch)

Ako već imaš produkcijsku bazu i samo dodaješ nove funkcionalnosti:

```
Samo pokreni: supabase-growth-features-2026-05.sql
```

Svi ostali su idempotentni i mogu se sigurno pokrenuti ponovo, ali to nije neophodno.

---

## Provjera nakon migracije

U SQL Editoru pokreni:

```sql
-- Provjeri tabele
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Provjeri RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Provjeri ključne funkcije
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Očekivane tabele (minimum):
`application_comments, application_events, application_labels, banner_requests,
banners, candidate_profiles, categories, cities, companies, company_cv_unlocks,
creative_templates, credit_transactions, job_alerts, job_applications, job_promotions,
job_views, jobs, notifications, orders, payment_proofs, plans, profiles,
saved_jobs, subscriptions, worker_ratings`

Očekivane RPC funkcije:
`company_active_plan, company_delete_job, company_pause_job, company_submit_for_review,
confirm_payment_proof, get_company_credit_balance, is_admin, spend_company_credits`

---

## Ručni koraci nakon SQL migracija

1. **Auth Redirect URLs** — Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `https://imaposla.me`
   - Redirect URL: `https://imaposla.me/**`
   - Za dev dodaj: `http://localhost:3000/**`

2. **Storage Buckets** — provjeriti da su kreirani i da su `public`:
   - `avatars` — public
   - `company-logos` — public
   - `banners` — public
   - `payment-proofs` — **private** (signed URLs only)

3. **Admin nalog** — ručno kreiraj admin korisnika:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'tvoj@email.com';
   ```

4. **Email templates** — Supabase Dashboard → Authentication → Email Templates:
   - Confirmation email template iz `supabase-email-confirm-template.html`
   - Reset password template iz `supabase-email-reset-template.html`

---

## Legacy fajlovi (ne pokretati)

| Fajl | Status | Napomena |
|------|--------|---------|
| `supabase-final.sql` | Legacy | Prevaziđen, pokriven gornjim |
| `supabase-seed-data.sql` | Dev-only | Samo za testiranje |

---

## Cron jobovi (opcionalno)

Za automatsko istjecanje promocija oglasa, postavi pg_cron:

```sql
-- Requires pg_cron extension enabled in Supabase
SELECT cron.schedule(
  'expire-job-promotions',
  '0 * * * *',   -- Svaki sat
  'SELECT public.expire_job_promotions()'
);
```
