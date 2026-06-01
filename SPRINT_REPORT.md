# imaposla.me — UX sprint izvještaj (namjere, ne role)

Status QA: **typecheck ✓ · lint ✓ · build ✓ Compiled successfully** · mojibake provjera: čisto (nema „TraÅ¾", „â†’" itd.).
Nije uvedena nova auth rola. Nije mijenjan Supabase RLS, SQL ni šema. Intent je čuvan samo kao query param + sessionStorage/localStorage (UX redirect), bez DB kolone.

---

## 1. Šta je promijenjeno (po prioritetima)

### P0 — kritično
- **Homepage: tri ravnopravne namjere.** Hero intent-switch i donji CTA blok sada imaju: Tражim posao → `/oglasi`; Nudim brze usluge → `/registracija?role=candidate&intent=worker`; Zapošljavam → `/registracija?role=company`. Tri kolone na desktopu, stack na ≤760px, bez horizontalnog scrolla.
- **Registracija: tri korisnička puta.** „Šta želiš da radiš?" sa tri kartice (Tражim posao / Nudim brze usluge / Zapošljavam). „Posao" i „usluge" oba kreiraju candidate nalog (`role: candidate` u signUp metadata), ali se intent pamti.
- **Intent perzistencija + redirect.** Prije signUp-a intent ide u sessionStorage+localStorage. Poslije prijave: `next` param ima prioritet → company/admin po roli → candidate+worker → `/profil/brzi-profil` → candidate+job_seeker → `/profil/biografija` → fallback `/profil`. Intent se čisti poslije redirecta. Isto i u `RedirectIfAuthed` (za slučaj potvrde e-pošte).
- **Firma dashboard: „Šta želiš da uradiš?"** blok sa tri akcije: Objavi oglas za posao → `/firma/novi-oglas`; Nađi radnika odmah → `/firma/radnici`; Objavi hitan angažman → `/firma/brzi-angazman`. Vidljivo na `/firma`, ne sakriveno u sidebaru.

### P1 — visoko
- **Candidate dashboard grupisan** u dvije sekcije: „Tражim posao" (Pretraži oglase, Moja biografija, Moje prijave, Sačuvani oglasi, Obavještenja za poslove) i „Nudim brze usluge" (Moja ponuda usluga, Upiti za mene, Brzi angažmani).
- **Mobile nav (candidate):** Oglasi · Brzi · Prijave · **Usluge** (`/profil/brzi-profil`) · Profil. „Alertovi" uklonjen iz donje trake (do njega se i dalje dolazi iz dashboarda).
- **Brzi poslovi tabovi preimenovani:** „Tражim radnika" → **Dostupni radnici**, „Tражim brzi posao" → **Brzi angažmani**. Naslov: „Brzi poslovi i radnici" + jasan podnaslov. Dodata traka „Nudiš usluge? Napravi profil" iznad lista.
- **Žargon preimenovan (UI labele, rute iste):** „Brzi profil" → „Moja ponuda usluga", „Brzi kontakti" → „Upiti za mene", „Interesovanja" → „Obavještenja za poslove" (h1 + page title).

### P2 — copy i povjerenje
- **Kontakt radnika (gost):** „Prijavi se da pošalješ upit ovom radniku. Radnik će dobiti tvoju poruku i kontakt koji ostaviš." + „Nalog tражimo da zaštitimo radnike od spama." Labela polja „Kako da te kontaktira" → „Telefon ili email za odgovor". Placeholder: „Opiši posao, lokaciju i kada ti treba radnik."
- **Premium:** objašnjen kao posebna javna stranica + galerija; prikazan link `/radnici/{slug}` i (za premium) dugme „Pogledaj javnu stranicu". CTA „Zatraži —…" po planu.
- **Obavještenja za poslove:** dodat „Šta je ovo?" blok — nedjeljni email, bez spama, isključuješ kad hoćeš.

### P3 — polish
- **Admin nav** razdvojene tri „Brzi…" stavke različitim ikonama/labelama: Brzi profili · Brzi angažmani · Upiti radnicima.
- **/oglasi guest CTA:** nenametljiva traka samo za goste — „Napravi nalog da čuvaš oglase, šalješ prijave i pratiš status." (Registruj se / Prijavi se). Sakrivena za prijavljene.

---

## 2. Fajlovi koji su mijenjani

Stranice:
- `app/page.tsx` — homepage tri namjere (hero + CTA paths)
- `app/registracija/page.tsx` — tri intent puta
- `app/oglasi/page.tsx` — guest CTA
- `app/brzi-poslovi/page.tsx`, `app/brzi-poslovi/radnici/page.tsx`, `app/brzi-poslovi/angazmani/page.tsx` — nazivi tabova
- `app/profil/brzi-profil/page.tsx`, `app/profil/brzi-kontakti/page.tsx`, `app/profil/interesovanja/page.tsx` — page titles

Komponente:
- `components/auth-form.tsx` — intent store + redirect (Login & Register)
- `components/redirect-if-authed.tsx` — intent-aware redirect
- `components/company-dashboard.tsx` — „Šta želiš da uradiš?" blok
- `components/dashboard-client.tsx` — grupisanje po namjeri
- `components/worker-contact.tsx` — copy
- `components/brzi-profil-premium.tsx` — premium objašnjenje + javni link
- `components/brzi-profil-client.tsx`, `components/brzi-kontakti-client.tsx`, `components/interesovanja-client.tsx` — preimenovanja + „Šta je ovo?"
- `components/guest-jobs-cta.tsx` — NOVA (guest CTA)
- `components/mobile-nav.tsx` — ikona `usluge`

Ostalo:
- `lib/navigation.ts` — candidate mobile nav + admin labele/ikone
- `app/globals.css` — `.home-intent-switch--three`, `.live-paths--three`, `.reg-intent`, `.dash-section-label`, `.bp-make-profile`, `.guest-cta`, `.home-intent-card--worker`

---

## 3. Kako sada izgleda flow

### a) Tражim posao
Homepage „Tражim posao" → `/oglasi` (pretraga bez naloga). Kod slanja prijave traži nalog. Registracija „Tражim posao" → candidate + intent job_seeker → poslije prijave `/profil/biografija`. Dashboard sekcija „Tражim posao" drži sve alate.

### b) Nudim brze usluge
Homepage „Nudim brze usluge" → `/registracija?role=candidate&intent=worker` → candidate nalog, intent worker zapamćen → poslije prijave **direktno `/profil/brzi-profil` (Moja ponuda usluga)**. Dashboard sekcija „Nudim brze usluge" + mobilni tab „Usluge" + „Upiti za mene". Radnik = candidate sa brzim profilom, nigdje mu se ne prikazuje „candidate".

### c) Zapošljavam
Homepage „Zapošljavam" → `/registracija?role=company` → company nalog → `/firma`. Dashboard odmah nudi tri namjere firme.

### d) Tражim radnika odmah
Firma na `/firma` vidi „Nађi radnika odmah" → `/firma/radnici` (lista dostupnih radnika sa filterima, direktan kontakt) i „Objavi hitan angažman" → `/firma/brzi-angazman`. Više nije sakriveno u sidebaru.

---

## 4. Rezultati QA
- `npm run typecheck` — ✓ bez grešaka
- `npm run lint` — ✓ bez grešaka
- `npm run build` — ✓ Compiled successfully (fetch-failed poruke su očekivane uz placeholder Supabase)
- Mojibake — ✓ čisto

---

## 5. Šta treba dodatno testirati (ručno, sa pravim Supabase)
1. **Registracija svake od tri opcije** → potvrda e-pošte → prijava → provjeri da worker ide na `/profil/brzi-profil`, job_seeker na `/profil/biografija`, company na `/firma`.
2. **`next` param prioritet** — npr. otvoriti zaštićenu stranicu kao gost, prijaviti se, vratiti na traženu.
3. **Mobilni 360px** — homepage 3 kartice, registracija 3 kartice, firma dashboard, brzi-poslovi: nema horizontalnog scrolla (provjeriti u pravom browseru).
4. **Guest CTA na /oglasi** se sakriva kad se prijaviš.
5. **Kontakt radnika** kao gost (vidi objašnjenje) i kao prijavljen (šalje poruku).
6. **Intent edge case** — registruj se kao worker, ne potvrdi odmah, vrati se i prijavi → i dalje vodi na brzi profil (localStorage backup).

---

## 6. Budući korak (dokumentovano, NIJE rađeno)
Ako se želi 100% pouzdan redirect i kad korisnik obriše storage: dodati nullable kolonu `profiles.signup_intent text` i čitati je pri prvom loginu. Trenutno rješenje (query param + storage) pokriva ogromnu većinu slučajeva bez diranja šeme/RLS.
