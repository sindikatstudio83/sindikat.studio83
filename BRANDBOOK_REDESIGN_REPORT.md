# imaposla.me - Brandbook Redesign Report

Datum: 2026-05-18  
Izvorni ZIP: `imaposla-v3.zip`  
Brandbook: `imaposla.me brendbook.pdf`

## Executive Summary

Urađen je frontend/UX/brand polish postojeće Next.js/Supabase platforme bez mijenjanja auth, role, protected route ili Supabase logike. Primarni cilj je bio da se stari beige/neon/brutalist stil zamijeni identitetom iz brandbook-a: tamno navy, crvena CTA boja, Poppins/Inter tipografija, čiste kartice, jasne forme, profesionalni dashboardi i bolja mobile otpornost.

Sajt je sada znatno bliži 9/10 u oblastima UI, brand consistency, preglednost i frontend produkcijska spremnost. Backend funkcije nisu izmišljane niti proširivane; ono što zavisi od Supabase baze ostaje isto i treba ga testirati na live/staging env varijablama.

## Brandbook primjena

| Oblast | Primjena |
|---|---|
| Primarna boja | `#0D1B2A` tamno navy za brand, sidebar, sekundarne CTA i ozbiljne operativne površine |
| CTA boja | `#FF202B` crvena za primarne akcije, aktivna stanja, naglaske i hero akcent |
| Pozadina | `#F2F4F7`, bijele površine i nježni borderi za čitljivost |
| Sekundarne boje | `#0A5CF6`, `#10B981`, `#F59E0B`, `#7C3AED` za statuse bez šarenila |
| Tipografija | Poppins za naslove/display, Inter za UI tekst i forme |
| Dugmad | Primarno crveno, sekundarno navy, tercijarno bijelo/outline |
| Kartice | Bijele, lagani border, 18px radius, mekane sjene umjesto crnih brutalističkih sjena |
| Ikone/statusi | Line/clean pristup, badge sistem sa konzistentnim status bojama |
| Ton | Jasno, profesionalno, prijateljski; bez demo/neon utiska |
| Mobile | Dodata zaštita od horizontalnog scroll-a, prelamanja dugih riječi, lomljenja dugmadi i sudaranja akcija |

## Izmijenjeni fajlovi

| Fajl | Šta je promijenjeno | Zašto | Rizik | Šta testirati |
|---|---|---|---|---|
| `app/globals.css` | Zamijenjen font import; dodan veliki brandbook override sloj za tokene, dugmad, kartice, forme, homepage, dashboards, admin, ATS i mobile breakpoints | Glavno vizuelno usklađivanje cijelog sajta | Nizak-srednji: globalni CSS utiče na sve stranice | Pregledati homepage, oglase, profil, firmu, admin i ATS na desktop/mobile |
| `components/ats-client.tsx` | ATS stage boje prebačene sa starog plavo/pink sistema na brandbook plavu/crvenu | ATS je ključni ekran i mora biti konzistentan | Nizak | Otvoriti `/firma/selekcija`, provjeriti status badge boje i čitljivost |
| `app/og-image/route.tsx` | OG image boje prebačene na brandbook crvenu/navy sistem | Link preview ne smije nositi stari neon identitet | Nizak | Provjeriti `/og-image` |
| `public/og-default.png.svg` | Default OG SVG boje prebačene na brandbook | Konzistentan share preview | Nizak | Pregledati fallback OG sliku |
| `supabase-email-confirm-template.html` | Email template boje usklađene sa brandbook-om | Potvrda emaila je korisnički touchpoint | Nizak | Poslati test confirmation email iz Supabase-a |
| `supabase-email-reset-template.html` | Reset password template boje usklađene sa brandbook-om | Reset lozinke mora izgledati kao isti proizvod | Nizak | Poslati test reset email iz Supabase-a |
| `legacy-static/styles.css` | Legacy/static preview boje i display font zamijenjeni brandbook sistemom | Ako se koristi legacy preview, ne smije štrčati | Nizak | Otvoriti legacy static preview ako je u upotrebi |

## Stranice koje su sređene globalnim slojem

| Ruta | Šta je poboljšano | Mobile status | Napomena |
|---|---|---|---|
| `/` | Hero, CTA, search panel, kartice, brand boje | Poboljšano | Backend podaci ostaju isti |
| `/oglasi`, `/oglasi/[slug]` | Kartice oglasa, filter/search paneli, CTA, badge sistem | Poboljšano | Detalje testirati sa realnim oglasima |
| `/profil`, `/profil/biografija`, `/profil/prijave`, `/profil/sacuvani`, `/profil/upozorenja` | Dashboard kartice, CV sekcije, forme, preview overflow zaštita | Poboljšano | CV builder ručno testirati sa dugim tekstovima |
| `/firma`, `/firma/oglasi`, `/firma/novi-oglas`, `/firma/pretplata`, `/firma/kandidati`, `/firma/baneri` | Firma dashboard, forme, kartice, action wrapping | Poboljšano | Testirati approved/pending firmu na realnoj bazi |
| `/firma/selekcija` | ATS kartice, paneli, stage boje, mobile stacking | Poboljšano | Ključni ekran za ručni QA |
| `/admin/**` | Operativniji admin stil, tabele, akcije, responsive table wrapper, duge vrijednosti | Poboljšano | Testirati dugačke emailove/nazive i akcije |
| `/login`, `/registracija`, `/zaboravljena-lozinka`, `/reset-lozinka`, `/logout` | Auth kartice, forme, CTA, focus/error states | Poboljšano | Testirati realan login/register/logout |

## Uloge

### Gost
- Vidi javni homepage, oglase, firme, kategorije i gradove.
- Poboljšano: jasniji brand, bolji CTA, preglednije kartice oglasa, bolji search/filter izgled.
- Ručno testirati: pregled oglasa, detalj oglasa, pokušaj prijave/akcije koja traži login.

### Kandidat
- Vidi profil, CV builder, prijave, sačuvane oglase i upozorenja.
- Poboljšano: preglednije forme, statusi, kartice, CV preview i mobile slaganje.
- Ručno testirati: CV unos sa dugim tekstovima, prijava na oglas, sačuvani oglasi, job alerts.

### Firma
- Vidi firma dashboard, oglase, novi oglas, pretplatu, kandidate, banere i selekciju.
- Poboljšano: approval/pending stanja su vizuelno jasnija, akcije se bolje prelamaju, kartice/tabele djeluju profesionalnije.
- Ručno testirati: kreiranje oglasa, pregled prijava, ATS pomjeranje kandidata, banner request.

### Admin
- Vidi admin dashboard i admin sekcije za oglase, firme, korisnike, uplate, pakete, banere, banner zahtjeve, templates i audit log.
- Poboljšano: tabele, akcije, filteri, statusi i dugački tekstovi su stabilniji.
- Ručno testirati: approve/reject, brisanje, promjena statusa, duge liste i mobile admin prikaz.

## Mobile QA

Implementirano:
- globalni `overflow-x:hidden`;
- `min-width:0` i `overflow-wrap:anywhere`;
- mobile stacking za profile/company/CV/ATS layout;
- action button wrapping;
- full-width akcije na vrlo malim ekranima;
- table horizontal wrapper za admin tabele gdje je potrebno;
- zaštita od dugih emailova/naziva koji probijaju kartice.

Ručno provjeriti na:
- 375px;
- 390px;
- 430px;
- tablet;
- desktop.

## Funkcionalnost

Dirano:
- isključivo frontend/visual layer;
- ATS status boje;
- email/OG/legacy boje.

Nije dirano:
- Supabase query-ji;
- auth;
- middleware/protected route logika;
- forme i submit akcije;
- role redirect;
- backend/RLS.

UI-only nije dodavan. Nove lažne funkcije nisu dodate.

## Bugovi popravljeni / mitigirani

| Bug / UX problem | Fajl | Status |
|---|---|---|
| Stari neon/beige vizuelni sistem nije usklađen sa brandbook-om | `app/globals.css` | Popravljeno |
| Dugmad i kartice imaju brutalističke crne sjene koje ne odgovaraju brandbook-u | `app/globals.css` | Popravljeno |
| Mobile rizik: dug tekst/email/naziv izlazi iz kartice | `app/globals.css` | Mitigirano |
| Mobile rizik: akcije u karticama i adminu se sudaraju | `app/globals.css` | Mitigirano |
| ATS statusi koriste stare boje | `components/ats-client.tsx` | Popravljeno |
| Email i OG touchpointi koriste stari vizuelni sistem | email templates, OG files | Popravljeno |

## Provjere

| Provjera | Rezultat |
|---|---|
| `npm install` | Prošlo |
| `npm run typecheck` | Prošlo |
| `npm run lint` | Prošlo |
| `npm run build` bez env | Pao očekivano jer nema Supabase env varijabli |
| `npm run build` sa dummy env | Prošlo; očekivani `fetch failed` logovi jer dummy Supabase URL nije stvarna baza |

Napomena: npm je prijavio da `next@15.3.6` ima security upozorenje i treba ga nadograditi na patched verziju u narednoj fazi.

## Preostali TODO

### HITNO
- Na Vercel/Netlify postaviti prave Supabase env varijable i pustiti production build.
- Ručno testirati login/register/logout sa realnom bazom.
- Ručno testirati admin protected rute i role pristup.
- Ručno testirati `/firma/selekcija` sa realnim kandidatima.

### Ove sedmice
- Nadograditi Next.js sa `15.3.6` na patched verziju.
- Pregledati sve stranice na 375/390/430px i dopolirati specifične komponente ako realni podaci otkriju edge-case.
- Testirati email confirmation/reset template iz Supabase dashboarda.
- Testirati OG preview.

### Naredna faza
- Uvesti komponentni design system za Button/Card/Badge/Form umjesto velikog globalnog override sloja.
- Dodati Playwright visual smoke testove za homepage, oglase, kandidat, firma, ATS i admin.
- Dodati Storybook ili preview katalog UI elemenata ako se dizajn dalje razvija.

## Finalna ocjena

| Oblast | Ocjena |
|---|---:|
| UI | 9/10 |
| UX | 9/10 |
| Mobile | 8.5/10 |
| Brand consistency | 9/10 |
| Funkcionalnost | 8/10 |
| Admin | 8.5/10 |
| Kandidat flow | 8.5/10 |
| Firma flow | 8.5/10 |
| Public flow | 9/10 |
| Production readiness frontend | 8.5/10 |

Oblasti koje ne mogu odgovorno dobiti 9/10 bez live baze: funkcionalnost, admin flow, kandidat/firma flow i production readiness. Razlog: realne role, RLS, Supabase Storage, email redirect i query podaci moraju se potvrditi na stvarnom env-u.
