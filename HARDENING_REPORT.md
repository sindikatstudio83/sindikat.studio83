# Brzi poslovi — Izvještaj o sigurnosnom učvršćivanju i dovršetku

Datum: build prolazi (typecheck ✓ · lint ✓ · build ✓ Compiled · npm audit: 0 high/critical, 6 low/moderate — postcss/next dev lanac, neprelamajuće).

---

## 1. Tabela po stavkama iz specifikacije

| # | Stavka | Status | Glavni fajlovi | Napomena |
|---|--------|--------|----------------|----------|
| 1 | Public worker query sigurnost | ✅ Završeno | `lib/queries/brzi-poslovi.ts`, `009_*.sql` | Javni query čita iz `public_worker_profiles` / `public_quick_gigs`. Payload NEMA contact polja. |
| 2 | WorkerContact sigurnost | ✅ Završeno | `components/worker-contact.tsx` | Kontakt preko `get_worker_contact` RPC (login-only, telefon samo ako `show_phone`). Gost → locked CTA. Self-kontakt blokiran. Limit 500 char. Bolji sent state. |
| 3 | Firma vidi prijave | ✅ Završeno | `app/firma/brzi-angazman/[id]/page.tsx`, `components/firma-gig-applications-client.tsx` | Ime/email/telefon kandidata, poruka, datum, mailto/tel dugmad, empty state. Link "Prijave" u listi angažmana. |
| 4 | Kandidat vidi brze prijave | ✅ Završeno | `components/applications-client.tsx` | Nova sekcija "⚡ Prijave na brze angažmane" u `/profil/prijave`: naziv, grad, status, poruka, datum, link. |
| 5 | Admin vidi prijave i poruke | ✅ Završeno | `admin-brzi-angazmani-client.tsx`, `admin-brzi-profili-client.tsx`, `app/admin/brzi-kontakti/` | Admin: broj prijava po angažmanu + link, broj kontakata po radniku, posebna stranica `/admin/brzi-kontakti` sa svim porukama. |
| 6 | Admin-only polja zaštićena | ✅ Završeno | `009_*.sql` (triggeri) | `guard_worker_admin_columns` / `guard_gig_admin_columns` vraćaju OLD vrijednost za status/premium/verified/views/slug i gig status/featured. Bypass samo preko definer RPC-eva. |
| 7 | Admin verifikacija → RPC | ✅ Završeno | `admin-brzi-profili-client.tsx` | `admin_set_worker_verified` umjesto direktnog update-a. |
| 8 | Quick gig apply logika | ✅ Završeno | `components/gig-apply-form.tsx` | Samo candidate (wrong-role state). Re-provjera `active` prije inserta. Duplikat check. Limit 500. |
| 9 | Notifikacije | ✅ Završeno (uz uslov) | `009_*.sql` | Triggeri za poruku radniku, prijavu vlasniku giga, status profila kandidatu, status giga firmi. **Aktivira se samo ako postoji `notifications` tabela** (auto-detekcija). |
| 10 | Weekly email digest | ⚠️ Skeleton + dok. | `supabase/functions/weekly-digest/index.ts`, `.env.example` | Funkcionalan Deno skeleton (Resend REST), idempotentno po ISO sedmici (`weekly_digest_log`). Treba deploy + secrets + cron. Dry-run bez API ključa. |
| 11 | Interesovanja | ✅ Završeno | `components/interesovanja-client.tsx` | Dodate kategorije (iz `categories`), validacija (bar 1 prije emaila), preview "Na osnovu ovoga dobijaćeš…". |
| 12 | Premium profil | ✅ MVP | `components/brzi-profil-premium.tsx`, `009_*.sql` | Admin toggle zadržan. CTA "Zatraži premium" → `premium_requests` (7d/30d/sezona). Jasna poruka "Premium aktivira admin nakon uplate". |
| 13 | Portfolio | ✅ Završeno | `components/brzi-profil-premium.tsx`, `worker-detail-view.tsx` | Premium upload galerije (max 6, `worker-photos` bucket), prikaz na javnoj stranici. |
| 14 | Firma /radnici shell + UX | ✅ Završeno | `components/firma-radnici-client.tsx`, `app/firma/radnici/page.tsx` | App-shell sa `DashboardSideNav`, CTA "Objavi angažman". `saved_workers` tabela kreirana (UI je budući task). |
| 15 | Search/filter performanse | ✅ Završeno | `lib/queries/brzi-poslovi.ts` | Profession filter na DB nivou (slug→id→`eq`). City filter preko `contains`. |
| 16 | SEO | ✅ Završeno | `app/brzi-poslovi/zanimanje/[slug]/`, `app/sitemap.ts`, list metadata | Landing stranice po zanimanju (`generateStaticParams`, canonical, OG). Canonical na filter listama. Sitemap koristi `public_worker_profiles` + dodaje zanimanja. |
| 17 | Security provjere | ✅ Završeno | više fajlova | Vidi sekciju "Sigurnosna provjera" niže. |
| 18 | Build/test | ✅ Završeno | `tests/smoke.spec.ts` | typecheck/lint/build/audit prolaze. 12 Playwright testova (landing, liste, locked kontakt, 7 redirect testova). |
| 19 | Ne lomiti postojeći sajt | ✅ Provjereno | — | Svi postojeći tokovi netaknuti; build svih ruta prolazi. |
| 20 | Finalni izvještaj | ✅ Ovaj dokument | `HARDENING_REPORT.md` | — |

---

## 2. Šta je završeno po rolama

### Gost
- Vidi liste radnika i angažmana, profesije, cijene, dostupnost.
- **Nikad ne vidi kontakt podatke** — javni payload (view) ih ne sadrži, plus locked CTA.
- SEO landing stranice po zanimanju indeksabilne.

### Kandidat
- Pravi/uređuje brzi profil; NE može sebi dati status/premium/verified (DB trigger + RLS).
- Premium portfolio upload (ako premium); zahtjev za premium (`premium_requests`).
- Interesovanja sa kategorijama, validacijom i previewom.
- Vidi svoje prijave na brze angažmane u `/profil/prijave`.
- Inbox upita u `/profil/brzi-kontakti`.
- Prijava na gig samo ako je `active`, bez duplikata, sa limitom poruke.

### Firma
- Objavljuje brze angažmane (idu na `pending_review`, NE može sama aktivirati/istaknuti).
- Vidi prijave po angažmanu sa kontaktom kandidata (`/firma/brzi-angazman/[id]`).
- Pretražuje radnike u app-shellu sa filterima; kontaktira ih (login-only RPC).

### Admin
- Odobrava/sakriva/odbija/verifikuje radnike i dodjeljuje premium — sve preko RPC-eva.
- Odobrava/odbija/zatvara/ističe angažmane preko RPC-eva.
- Vidi broj prijava po angažmanu + otvara prijave.
- Vidi broj kontakata po radniku + sve poruke u `/admin/brzi-kontakti`.

---

## 3. Sigurnosna provjera (item 17)

| Provjera | Rezultat |
|----------|----------|
| Javni payload bez kontakta | ✅ View `public_worker_profiles` ne sadrži contact_* |
| Kandidat ne aktivira sam profil | ✅ Trigger vraća OLD status; RLS update check |
| Firma ne aktivira sama gig | ✅ Trigger vraća OLD status |
| Firma ne ističe sama gig | ✅ Trigger vraća OLD is_featured |
| Apply samo na active gig | ✅ Re-provjera u formi + RLS |
| Korisnik ne kontaktira sebe | ✅ `isSelf` check u worker-contact |
| Limit dužine poruke | ✅ 500 char (kontakt i prijava) |
| Nema raw DB grešaka | ✅ `safeMessage()` svuda |
| RLS greške kroz safeMessage | ✅ |

---

## 4. Ručni koraci u Supabase (OBAVEZNO prije produkcije)

1. Pokreni `008_brzi_poslovi.sql`, pa `009_brzi_poslovi_hardening.sql`.
2. Provjeri: `SELECT * FROM public_worker_profiles LIMIT 1;` — NE smije imati contact polja.
3. Provjeri 6 RPC-eva (vidi `supabase/README.md`).
4. Provjeri bucket `worker-photos` (public).
5. Ako `notifications` tabela ima drugačiju šemu — prilagodi INSERT u 4 notify funkcije.
6. Test zaštite: kao običan korisnik pokušaj `UPDATE worker_profiles SET is_premium=true` — mora ostati `false`.

---

## 5. Email servis (weekly-digest)

```bash
supabase functions deploy weekly-digest --no-verify-jwt
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set DIGEST_FROM_EMAIL="imaposla.me <noreply@imaposla.me>"
supabase secrets set SITE_URL=https://imaposla.me
```
Cron: `0 9 * * 1`. Bez ključa → dry-run.

---

## 6. Šta NIJE produkcijski spremno / budući rad

- **Weekly email** — kod je skeleton; treba Resend nalog + deploy + cron + verifikacija domena. Mapiranje `jobs.category_id` u Edge Function provjeri da odgovara tvojoj šemi.
- **Notifikacije** — zavise od postojanja i šeme `notifications` tabele. Ako se kolone razlikuju, prilagodi 4 INSERT-a.
- **Saved workers UI** — tabela `saved_workers` postoji, dugme "Sačuvaj radnika" nije u UI (lako se dodaje).
- **Premium naplata** — trenutno admin ručno aktivira nakon `premium_requests`. Automatska naplata je budući rad.
- **Email verifikacija domena** za Resend (SPF/DKIM) — van koda.
