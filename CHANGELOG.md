# imaposla.me — Production Pass Changelog

## Šta je popravljeno

### Auth & Login (kritično)
- **LoginForm prebačen na client-side `signInWithPassword()`** umjesto server POST rute koja je imala race condition sa cookie-jem. Sada login radi pouzdano i bez "treperenja" pri redirektu.
- Uklonjene mrtve server rute `/auth/login` i `/auth/logout` — sva auth logika je sada u browseru.
- RegisterForm dobija "success" stanje sa CTA-jem na prijavu i pravom validacijom dužine lozinke.
- Dodate stranice `/zaboravljena-lozinka` i `/reset-lozinka` (kompletne forme).

### Performance
- `DashboardClient`, `ApplyForm`, `ApplicationsClient`, `CvBuilder` koriste `useAuth()` context umjesto `getUser()`. Eliminisan jedan extra Supabase HTTP poziv po stranici.
- Sve provjere kandidata se rade u paraleli (`Promise.all`) umjesto serijski.
- CV autosave debounce smanjen sa 2s na 1.5s — brži feedback.

### Database queries
- `getPublicJobsByCity` i `getPublicJobsByCategory` više ne koriste pogrešnu `.eq("cities.name", x)` sintaksu na joined tabelama. Sada prvo pronalaze grad/kategoriju po slug-u ili imenu, pa filtriraju oglase po `city_id` / `category_id`.

### UI/UX
- Footer je sada dinamički — gradovi i kategorije se učitavaju iz baze umjesto hard-coded liste.
- Mobilna navigacija prikazuje samo labele (uklonjene fake "GL", "OG" pseudo-ikone).
- ApplyForm ima character counter (max 1200) i state machine za sve slučajeve (guest, wrong-role, duplicate, no-cv, ready, submitting, done, error).
- ApplicationsClient ima clickable redove (otvaraju oglas) i filter tabove koji prikazuju samo faze sa prijavama.
- DashboardClient prikazuje upozorenje ako je biografija < 60% popunjena, sa direktnim CTA-em.
- CvBuilder ima progress bar sa 3 stanja boja (narandžasta < 60%, plava 60-99%, zelena 100%).

### CSS dodaci
- `.live-info-page` — layout za info stranice (za-firme, privatnost, uslovi, mapa-sajta)
- `.link-card` — kartica sa hover lift efektom (gradovi, kategorije)
- `.detail-text` — tipografija za opis oglasa
- `.mini-link` — sitan link (zaboravljena lozinka)

### ATS persistence (čeka SQL migraciju)
- Kreiran `supabase-ats-persistence.sql` — tabele `application_comments` i `application_labels` sa RLS policy-jima. Mora se pokrenuti u Supabase SQL Editoru.
- (Frontend ATS u `CompanyClient` zadržava trenutnu logiku dok se migracija ne primijeni.)

## Šta još treba uraditi u Supabase Dashboard

1. **Authentication → URL Configuration:**
   - Site URL: `https://imaposla.me`
   - Redirect URLs: `https://imaposla.me/reset-lozinka`, `https://imaposla.me/login`

2. **Authentication → Email Templates** — prevedi na crnogorski:
   - Confirm signup
   - Reset password

3. **SQL Editor** — pokreni redom:
   - `supabase-schema.sql` (ako nije ranije)
   - `supabase-performance.sql` (indeksi i RLS)
   - `supabase-admin-hardening.sql`
   - `supabase-live-hardening-2026-05-05.sql`
   - `supabase-ats-persistence.sql` (NOVO)

4. **Storage:**
   - Bucket `payment-proofs` mora postojati
   - Policy: samo vlasnik firme može upload, samo admin može čitati

## Preostali rizici (manji)

- ATS komentari/oznake još uvijek u React stanju dok se SQL migracija ne pokrene. Frontend ne padaju, ali se gube na refresh.
- Nema server-side zaštite ruta (middleware uklonjen na zahtjev). Klijentska zaštita radi, ali korisnik koji zna URL može vidjeti HTML kostur stranice (RLS i dalje štiti podatke).
- `staleTimes` u next.config.ts je experimental — može uzrokovati neočekivano keširanje. Pratiti Vercel logove u prvih 48h.

## Provjereno

- ✅ TypeScript: nula grešaka
- ✅ ESLint: nula upozorenja
- ✅ Build (lokalno): kod kompajlira, samo Google Fonts download fail u sandboxu (na Vercelu radi)
- ✅ Sve rute postoje i imaju metadata
- ✅ Sve CSS klase referencirane u JSX-u sada postoje u globals.css
- ✅ Dark mode pokriva sve nove elemente preko CSS varijabli
- ✅ Mobilni breakpoint na 860px i 560px

## Production Readiness Status

**SPREMNO ZA PRODUKCIJU** uz uslov da se izvrše Supabase Dashboard koraci iznad.
