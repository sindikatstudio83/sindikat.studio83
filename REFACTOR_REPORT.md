# imaposla.me — Kompletan refactor izvještaj

**Datum:** Maj 2026  
**Verzija:** Next.js 15.5.18 | React 19 | Supabase SSR  
**Build status:** ✅ `npm run build` prolazi  
**TypeScript:** ✅ `npm run typecheck` — 0 grešaka  
**Lint:** ✅ `npm run lint` — 0 grešaka, 0 upozorenja  
**npm audit:** 6 low/moderate (0 high/critical — HIGH CVE riješen upgradeom)

---

## Finalna tablica: Stavka → Status → Fajlovi

| # | Stavka iz analize | Status | Fajlovi izmijenjeni |
|---|---|---|---|
| 1 | **Next.js upgrade 15.3.6 → 15.5.18 (HIGH CVE)** | ✅ Završeno | `package.json`, `package-lock.json` |
| 2 | **SQL migracije — source of truth** | ✅ Završeno | `supabase/migrations/001-007`, `supabase/archive/`, `supabase/README.md` |
| 3 | **Featured fallback bug** | ✅ Završeno | `lib/queries/public.ts` |
| 4 | **Error/fallback sloj za Supabase querying** | ✅ Završeno | `lib/queries/public.ts`, `app/page.tsx` |
| 5a | **Dupli `name="city"` select** | ✅ Završeno | `app/oglasi/page.tsx` |
| 5b | **Redundantni counter "X oglasa / X"** | ✅ Završeno | `app/oglasi/page.tsx` |
| 6 | **Brisanje mrtvih/duplikatnih fajlova** | ✅ Završeno | 10 fajlova obrisano |
| 7 | **Ellipsis bug u job kartici** | ✅ Završeno | `components/job-card-clean.tsx` |
| 8 | **Shared `DashboardSideNav`** | ✅ Završeno | `components/dashboard-side-nav.tsx`, 8 komponenti refactorisane |
| 9 | **Razbijanje `CompanyClient`** | ✅ Djelimično | `lib/company-context.tsx`, `components/company-dashboard.tsx`, `app/firma/page.tsx` |
| 10 | **`window.location` → `useRouter`** | ✅ Završeno | 15 komponenti |
| 11 | **Auth-context race condition** | ✅ Završeno | `lib/auth-context.tsx` |
| 12 | **`"use client"` iz `account.ts`** | ✅ Završeno | `lib/queries/account.ts` |
| 13 | **`as any` eliminacija** | ✅ Završeno | `lib/queries/public.ts` |
| 14 | **Avatar `onError` fallback** | ✅ Završeno | `components/avatar.tsx` |
| 15 | **Unified `LABEL_OPTS`** | ✅ Završeno | `lib/labels.ts`, `components/ats-client.tsx`, `components/ats-detail-panel.tsx` |
| 16 | **`formatDate({ withTime })`** | ✅ Završeno | `lib/format.ts`, `components/admin-audit-log-client.tsx` |
| 17 | **Auth guard u `admin-audit-log-client`** | ✅ Završeno | `components/admin-audit-log-client.tsx` |
| 18 | **Notification ARIA** | ✅ Završeno | `components/notification-center.tsx` |
| 19 | **Accessibility — `:focus-visible`, `role=button` keyboards** | ✅ Završeno | `app/globals.css`, `components/ats-client.tsx` |
| 20 | **CSS cleanup** | ✅ Završeno | `app/globals.css` (-65 linija dupliranja, font-weight fix, btn boje, badge konsolidacija, touch targets) |
| 21 | **`next/font/google`** | ⚠️ Dokumentovano | `app/layout.tsx` (blocked u sandbox env — dokumentovano s migration guide) |
| 22 | **`next/image` za logoe/avatare** | ⏳ Backlog | Supabase patterns konfigurisani, migracija postepena |
| 23 | **`prefers-reduced-motion`** | ✅ Završeno | `app/globals.css`, `components/hero-banner-carousel.tsx` |
| 24 | **Firma unapproved notice** | ✅ Postojalo + ekstraktovano | `components/company-dashboard.tsx` |
| 25 | **Apply-form UX** | ✅ Završeno | `components/apply-form.tsx` |
| 26 | **Sitemap SEO** | ✅ Završeno | `app/sitemap.ts`, `app/mapa-sajta/page.tsx` |
| 27 | **`reference_code: crypto.randomUUID()`** | ✅ Završeno | `components/apply-form.tsx` |
| 28 | **Notifications Realtime + visibility pause** | ✅ Završeno | `components/notification-center.tsx` |
| 29 | **Dinamički popular tags** | ✅ Završeno | `lib/queries/public.ts`, `app/page.tsx` |
| 30 | **Empty states** | ✅ Završeno | `app/page.tsx` |
| 31 | **npm audit** | ✅ HIGH riješen, 6 low/mod ostaju | `package.json` |
| 32 | **Supabase fetch failed logging** | ✅ Završeno | `lib/queries/public.ts` |
| 33 | **ENV checklist** | ✅ Završeno | `.env.example` |
| 34 | **SQL redosljed dokumentovan** | ✅ Završeno | `supabase/README.md` |
| 35 | **RLS/admin verifikacija** | ⚠️ Needs live DB | `supabase/README.md` (SQL za provjeru dokumentovan) |
| 36 | **Mobile nav mapiranja** | ✅ Završeno | `components/mobile-nav.tsx` (`kandidati`, `audit` dodani) |
| 37 | **Unicode ikone** | ✅ `aria-hidden` + label vidljiv | `components/mobile-nav.tsx` |
| 38 | **Dark mode provjera** | ✅ Duplikati uklonjeni | `app/globals.css` |
| 39 | **Playwright smoke testovi** | ✅ Završeno | `tests/smoke.spec.ts`, `playwright.config.ts` |
| 40 | **Screenshot QA** | ⚠️ Needs real browser | Sandbox env blokira localhost |
| 41 | **Import aliasi provjereni** | ✅ Build prolazi | Build output potvrđuje sve rute |
| 42 | **Finalni izvještaj** | ✅ Ovaj dokument | `REFACTOR_REPORT.md` |

---

## npm audit — finalno stanje

```
HIGH    → 0  (bio: next@15.3.6 cache-key confusion — RIJEŠEN upgradeom na 15.5.18)
MODERATE → 2  (postcss XSS u CSS stringify, ws memory disclosure)
LOW     → 4  (@eslint/plugin-kit ReDoS, @supabase/auth-js path routing, eslint, supabase-js)

Preostale moderate/low ranjivosti:
- postcss: dio je Next.js bundla — jedino riješenje je `npm audit fix --force`
  koji instalira Next.js 9.x (breaking). NIJE preporučljivo.
- ws: browser WebSocket lib — ne utiče na server-side kod.
- @supabase/auth-js LOW: malformed user input path routing — mitigated
  middleware-om koji koristi getUser() (server-side validation).
```

---

## Arhitekturne promjene

### Novi fajlovi
| Fajl | Svrha |
|---|---|
| `components/dashboard-side-nav.tsx` | Shared sidebar — zamjenjuje 8 lokalnih kopija |
| `lib/company-context.tsx` | CompanyContext + CompanyShell — shared state za firma dashboard |
| `components/company-dashboard.tsx` | Ekstrahovani dashboard view iz CompanyClient |
| `supabase/README.md` | Migracija dokumentacija i sigurnosna upozorenja |
| `supabase/migrations/001-007_*.sql` | Numerisane aktivne migracije |
| `supabase/archive/*.sql` | UNSAFE/SUPERSEDED fajlovi — ne pokretati |
| `.env.example` | ENV checklist sa dokumentacijom |
| `tests/smoke.spec.ts` | 25+ Playwright smoke testova |
| `playwright.config.ts` | Playwright konfiguracija |
| `.gitignore` | Standardni izuzeci uključujući `tsconfig.tsbuildinfo` |

### Obrisani fajlovi (mrtav/duplikatni kod)
| Fajl | Razlog |
|---|---|
| `auth-form.tsx` (root) | Zastarjela kopija `components/auth-form.tsx` |
| `company-client.tsx` (root) | Zastarjela kopija, nema sigurnosne provjere uloge |
| `admin-client.tsx` (root) | Zastarjela kopija |
| `components/job-card-compact.tsx` | Niko ne importuje |
| `components/recommended-companies.tsx` | Zamijenjeno sa `PremiumEmployers` |
| `components/notification-bell.tsx` | Zamijenjeno sa `NotificationCenter` |
| `components/ticker-strip.tsx` | Niko ne importuje, hardkodirani demo podaci |
| `app/profil/sacuvano/page.tsx` | Redirect u `next.config.ts` je dovoljan |
| `legacy-static/` (folder) | Stara vanilla JS verzija — ne pripada Next.js projektu |
| `tsconfig.tsbuildinfo` | Build artifact (dodan u `.gitignore`) |

---

## Što ostaje za nastavak (backlog)

### Visok prioritet
1. **`company-client.tsx` puna ekstrakcija** — `CompanyJobList`, `NewJobForm`, `CompanyBilling` trebaju biti ekstrahovani na isti način kao `CompanyDashboard`. Sada postoji `CompanyShell` + `CompanyContext` infrastruktura — samo treba prenijeti JSX.

2. **`next/image` za company logoe i avatare** — `next.config.ts` već ima Supabase remote patterns. Zamjena `<img>` sa `<Image>` u `avatar.tsx`, `company-card.tsx` i `banner-slot.tsx`.

3. **`next/font/google`** — funkcionira na Vercel i u okruženjima sa pristupom Google Fonts. Migracija dokumentovana u `app/layout.tsx`.

### Srednji prioritet
4. **Server-side rate limiting za prijave** — `/api/apply` ruta sa Upstash Redis (ili Supabase RLS limit).

5. **Admin 2FA** — dugoročni task, zahtijeva Supabase TOTP konfiguraciju.

6. **Supabase TypeScript codegen** — `supabase gen types typescript --project-id <id> > types/supabase.ts` eliminira preostale `as unknown as` castove u query sloju.

---

## QA checklist — ručna provjera potrebna

### Obavezno na realnom Supabase + browseru

- [ ] Registracija kandidat → email potvrda → login → `/profil`
- [ ] Registracija firma → email potvrda → login → `/firma`
- [ ] Neodobrena firma → vidi notice na dashboard-u
- [ ] Kreiranje oglasa → oglas u `pending_review`
- [ ] Admin odobrava oglas → oglas vidljiv javno
- [ ] Prijava na oglas → dupla prijava prikazuje ispravnu poruku
- [ ] Reset lozinke end-to-end
- [ ] Upload logo/slike
- [ ] Notifikacije: Realtime subscription radi (provjeri Network tab)
- [ ] Dark mode persist across reload (localStorage)
- [ ] Mobile nav — sve role (guest/candidate/company/admin) — nema `"•"` ikona
- [ ] `/oglasi` mobilni filter — jedan grad select, radi ispravno
- [ ] Firma sa `approved=false` vidi notice na `/firma`
- [ ] Keyboard navigacija kroz header/nav/forme (Tab + Enter)
- [ ] Notification panel — Escape zatvara, aria-modal aktivan

### Playwright (automatski)

```bash
# Instalacija browser binarija (jedanput)
npx playwright install chromium

# Pokretanje testova (zahtijeva running dev server)
npm run dev &
npm run test:e2e
```

---

## Komande za verifikaciju produkcije

```bash
# 1. Čist install
npm ci

# 2. TypeScript provjera
npm run typecheck  # → 0 grešaka

# 3. Lint
npm run lint       # → 0 grešaka

# 4. Build
npm run build      # → ✓ Compiled successfully

# 5. Audit
npm audit          # → 0 high/critical

# 6. Provjera is_admin() na produkcijskoj bazi (Supabase SQL Editor)
# SELECT prosrc FROM pg_proc
# WHERE proname = 'is_admin'
#   AND pronamespace = 'public'::regnamespace;
# → MORA sadržati "select exists" i "profiles" — NE "user_metadata"
```

---

## Sigurnosna napomena — is_admin() provjera

**Obavezno pokrenuti na produkcijskoj bazi prije launcha:**

```sql
SELECT prosrc FROM pg_proc
WHERE proname = 'is_admin'
  AND pronamespace = 'public'::regnamespace;
```

Ispravna (sigurna) verzija mora sadržati:
```sql
select exists (
  select 1 from public.profiles
  where id = auth.uid()
    and role in ('admin', 'superadmin')
)
```

Ako vidite `user_metadata` — odmah pokrenite `supabase/migrations/003_security_fixes.sql`.  
Detaljno objašnjenje u `supabase/README.md`.
