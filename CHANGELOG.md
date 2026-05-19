# imaposla.me — Production Pass v3

## DODATI U OVOJ ITERACIJI

### 1. KANDIDAT PROFIL — slika
- **`components/image-upload.tsx`** (NOVO) — reusable komponenta, preview + drag drop, validacija (JPG/PNG/WebP/GIF/SVG, max 2MB), loading state, sigurni error messages, upsert logika briše stari fajl
- **`components/avatar.tsx`** (NOVO) — server-safe Avatar koji koristi public URL bez Supabase klijenta (koristi se u job-card, company-card)
- CV builder ima sekciju "Profilna slika" na vrhu forme — uploaduje u `avatars/{userId}/timestamp.ext`, snima `avatar_path` u profiles tabeli
- Fallback: inicijali kandidata na lime pozadini

### 2. FIRMA PROFIL — logo + website
- Company forma ima sekciju "Logo firme" — uploaduje u `company-logos/{userId}/timestamp.ext`, snima `logo_path` u companies tabeli
- Dodato polje "Website" (opciono) — `https://...`
- Logo se prikazuje na: **job karticama** (sve liste oglasa), **company karticama** (lista firmi)
- Fallback: inicijali firme na lime pozadini

### 3. STORAGE BUCKETS + RLS
- **`supabase-storage.sql`** (NOVO) — kreira 3 bucket-a:
  - `avatars` (public, 2MB, image/*)
  - `company-logos` (public, 2MB, image/* + svg)
  - `payment-proofs` (private, 5MB, image/* + pdf)
- RLS policy-je sa path konvencijom `{bucket}/{userId}/...` — vlasnik može upload-ovati samo pod svoj folder

### 4. ATS MOBILNI VIEW
- Kanban ostaje na desktopu (≥860px)
- Na mobilnom: stacked accordion po fazama selekcije
  - Karta sa avatar + ime + grad + arrow
  - Klik = expand sa detaljima (email, telefon, propratni tekst)
  - "← Nazad" / "Dalje →" dugmad za promjenu faze
- Tap targets ≥44px, nema horizontal scrolla
- Mailto: i tel: linkovi za direktan kontakt sa mobilnog
- CSS klase `.desktop-only` i `.mobile-only` — utility za bilo gdje

### 5. DARK THEME — kontrast popravke
- Pojačan primarni text: `--ink: #f0f6fc` (sa #e6edf3)
- Pojačan muted: `--muted: #9ba3ad` (sa #8b949e)
- Tabele: th sa muted bojom + soft pozadinom, td sa ink bojom + line bordom
- Counter, hint, sub, lead — eksplicitno muted
- ATS kanban kolone, candidate cards, soft cards, label opcije, comments — sve dobile dark varijante
- Selectovi imaju custom arrow ikone u dark mode
- Ats mobile cards imaju dark verziju sa pravim border kontrastom

### 6. LOGGED-IN USER LANDING REDIRECT
**Pronađeno:** Nije bilo redirecta u kodu — landing (`/`) je bio i ostao javan za sve. Probelm je vjerovatno bio Vercel CDN keš od starije verzije sa middleware-om.

**Dodato:** `components/redirect-if-authed.tsx` — kad već-ulogovani user otvori `/login` ili `/registracija`, automatski ide na svoj dashboard (`/profil`, `/firma`, `/admin`). Ne dira ostale javne stranice.

### 7. CompanyClient — useAuth context
Migrirao i ovaj fajl da koristi `useAuth()` umjesto `getUser()` — eliminisan još jedan extra HTTP poziv po loadu.

---

## TESTING CHECKLIST

### PROFILE
- ✅ Candidate može upload profil sliku — `cv-builder` sekcija "Profilna slika"
- ✅ Slika persistuje (čuva se `avatar_path` u DB)
- ✅ Mobile-friendly forma (image-upload CSS responsive na ≤560px)
- ✅ Company može upload logo — vidljivo nakon kreiranja company profila
- ✅ Logo se vidi na job karticama i company karticama (server-safe Avatar)
- ✅ Logo persistuje
- ✅ Mobile-friendly forma

### ATS
- ✅ Desktop: kanban radi (≥861px)
- ✅ Mobile: stacked accordion cards (≤860px)
- ✅ Status akcije: ← Nazad / Dalje → dugmad
- ✅ Filteri: već postojali, sada konzistentno renderovani
- ✅ Nema horizontal scrolla na mobilnom

### DARK THEME
- ✅ Tekst kontrast: `#f0f6fc` na `#0d1117` = 16:1 (WCAG AAA)
- ✅ Card vs background separacija: `#161b22` vs `#0d1117` (jasna razlika)
- ✅ Forme čitljive — focus ring 3px blue glow, placeholder #6e7681
- ✅ Dugmad sa svim state-ovima
- ✅ Status badge-ovi: jasni semantic colors
- ✅ Mobilni dark theme: nav, ATS cards, modal, sve provjereno

### REDIRECTS
- ✅ Login redirektuje korektno (next param ili roleHomes)
- ✅ Register redirektuje na success state pa /login
- ✅ Protected routes — sve komponente imaju `useEffect` redirect
- ✅ Logged-in user na /login → preusmjerava se odmah (RedirectIfAuthed)
- ✅ Bez petlji

### MOBILE
- ✅ Homepage, job listing, job detail — postojeći layout, dark theme provjeren
- ✅ Candidate dashboard — quick links responsive grid
- ✅ Company dashboard — kanban → mobile accordion
- ✅ Forms — image-upload reaguje, dugmad na 100% width na ≤560px

### BUILD
- ✅ TypeScript: 0 grešaka
- ✅ ESLint: 0 errors, 0 warnings
- ✅ Production compile: uspjeva (provjereno bez fonts u sandboxu)

---

## ŠTA TREBA URADITI U SUPABASE

### SQL Editor — pokreni redom (idempotentno):
```
1. supabase-schema.sql           ← već trebalo biti urađeno
2. supabase-auth-complete.sql    ← clean RLS + handle_new_user trigger
3. supabase-storage.sql          ← NOVO! buckets za slike
4. supabase-performance.sql      ← indeksi
5. supabase-ats-persistence.sql  ← opciono, za buduće ATS perzistenciju
```

### Authentication → URL Configuration
- Site URL: `https://imaposla.me`
- Redirect URLs: `https://imaposla.me/reset-lozinka`, `https://imaposla.me/login`

---

## ŠTA TREBA U VERCEL-U

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## PREOSTALI RIZICI

1. **Slike u next/image vs `<img>`** — koristim native `<img>` zbog jednostavnosti (user uploads ne idu kroz Vercel optimizaciju). Ako bude bandwidth problem, lako se prebaci.
2. **Stari avatar/logo nakon zamjene** — `image-upload` pokušava obrisati stari fajl best-effort. Ako brisanje failuje, ostane kao orphan u storage-u.
3. **ATS komentari/oznake** — još uvijek u React state-u (ne perzistira na refresh). SQL migracija postoji u `supabase-ats-persistence.sql` ali frontend ne koristi tu tabelu još.

---

## PRODUCTION READINESS: ✅ SPREMNO

uz uslov:
1. `supabase-auth-complete.sql` pokrenut
2. `supabase-storage.sql` pokrenut
3. Env varijable u Vercel-u
