# imaposla.me — Analiza performansi, uvezivanja i izgleda (fokus: mobilni)

Datum analize: na osnovu uploadovanog ZIP-a (`sindikat.studio83-main`).
Status nakon ispravki: **typecheck ✓ · lint ✓ · build ✓ Compiled successfully**.

---

## 1. Glavni nalaz — zašto je izgled bio neujednačen

Sajt je imao **TRI različite kartice za oglase**, svaka drugačijeg stila, korištene na različitim stranicama:

| Kartica | Gdje se koristila | Stil |
|---------|-------------------|------|
| `JobCardClean` | **Početna** | Čista, 2 reda, jedno dugme „Detalji i prijava" + sačuvaj. Ispravan stil. |
| `JobRow` (`jl-row`) | **Lista /oglasi** | Kompaktan red, logo + naslov + meta + badge desno. OK. |
| `JobCard` (stara) | **Detalji oglasa, /kategorije, /gradovi, /firme** | Ogromna, 3 dugmeta (Prijavi se / Detalji / Sačuvaj) **poredana vertikalno u sredini kartice**. Glavni izvor ružnog izgleda. |

Pošto su „Slični oglasi" na stranici detalja koristili STARU `JobCard`, dobio si tačno ono što se vidi na screenshotu: ogromni blokovi sa dugmadima koja lebde centrirana usred bjeline.

### Uzrok preklapanja (CSS konflikt)
Klasa `.job-card` bila je definisana na **4 mjesta** u `globals.css` sa međusobno konfliktnim pravilima:

- **Linija 360:** `grid-template-columns: 50px 1fr auto` + `.job-actions { flex-direction: column; align-items: flex-end; min-width: 140px }` → tri kolone, dugmad u uskoj desnoj koloni, vertikalno.
- **Linija ~3171:** `grid-template-columns: 60px 1fr` + `.job-actions { flex-direction: row; ... }` → dvije kolone, dugmad u redu.

Browser je miješao oba (kaskada + specifičnost), pa su se na užim ekranima dugmad i tekst **preklapali**, a razmaci bili nejednaki.

---

## 2. Šta je popravljeno

1. **Ujednačen stil kartica.** Sve stranice (`/oglasi/[slug]`, `/kategorije`, `/gradovi`, `/firme/[slug]`) sada koriste `JobCardClean` — istu karticu kao početna. Jedan stil na cijelom sajtu.

2. **Uklonjen CSS konflikt.** Legacy `.job-card` blok (3 kolone + vertikalna dugmad) je uklonjen; ostao je jedan kanonski blok kao jedini izvor istine. Time nestaju preklapanja na mobilnom.

3. **Mobilni redovi akcija** ostaju horizontalni i pružaju se na punu širinu (`flex:1`), bez lebdenja u sredini.

4. **Plata se ne razliva** — `detail-facts` grid (Poslodavac/Lokacija/Plata/Rok) već je bio uveden i zadržan; svaka stavka u svom polju, `overflow-wrap:anywhere`.

---

## 3. Performanse uvezivanja (data fetching)

Pregledao sam `lib/queries/*` i način dohvata.

**Dobro:**
- Server Components dohvataju podatke na serveru (App Router), bez client-side waterfalla na javnim stranicama.
- `Promise.all` se koristi gdje treba (npr. detalj oglasa dohvata oglas + slične paralelno).
- Postoji `revalidate` na javnim listama (ISR), sitemap revalidate 12h.
- Graceful error handling: query funkcije vraćaju `[]` umjesto da ruše stranicu.

**Za poboljšati (preporuke, nisu blocker):**
- `getJobById` + `getPublicJobs({limit:10})` na detalju — slični oglasi se filtriraju u memoriji nakon dohvata 10 komada. Bolje bi bilo filtrirati po `category_id`/`city_id` na DB nivou sa `limit 2` (manje prenosa).
- Razmotri `next/image` za logotipe firmi (trenutno `<img>` preko `Avatar`) radi automatskog resize/lazy + manje CLS.
- Profession/brzi-poslovi query već koristi DB-level filter (dobro).

---

## 4. Mobilni izgled — detaljna provjera

| Stavka | Prije | Poslije |
|--------|-------|---------|
| Kartice „slični oglasi" | Ogromne, dugmad centrirana/preklapanje | Kompaktne, jedan red akcija |
| Stil kartica kroz sajt | 3 različita | 1 ujednačen (`JobCardClean`) |
| Plata na detalju | Rizik razlivanja | `detail-facts` grid, bez prelivanja |
| Naslov oglasa | clamp + anywhere | zadržano (OK) |
| Footer razmak iznad floating nav | OK (safe-area) | zadržano |
| Touch targeti (44px) | uglavnom OK | zadržano |

**Preostale sitne preporuke za mobilni (kozmetika, opciono):**
- Na karticama firmi (`company-card`) provjeri da meta linija ne prelama logo na 320px.
- `bp-professions` chip scroll na vrlo uskim ekranima (<340px) — radi, ali dodaj `scroll-snap` za ljepši osjećaj (nice-to-have).

---

## 5. Konzistentnost stila (tokeni)

Stil je vezan za CSS varijable (`--paper`, `--ink`, `--line`, `--brand-red`, `--blue`, `--green`, `--orange`, `--muted`, `--soft`, `--display`). To je dobro — boje i dark mode su centralizovani. Kartice sada koriste iste tokene kao početna, pa je vizuelni jezik ujednačen.

---

## 6. Zaključak

Glavni problem nije bio „loš dizajn kartice" nego **tri konkurentske kartice + CSS konflikt** koji je pravio preklapanja. Rješenje je konsolidacija na jednu karticu (onu sa početne) i uklanjanje duplog `.job-card` bloka. Build prolazi, ništa postojeće nije slomljeno.

Vidi priložene fajlove: `FLOW.html` (infografik toka kroz sajt) i `SITEMAP.html` (detaljna mapa sajta sa rolama i zaštitom ruta).
