# Audit Fixes Log

Ovaj fajl prati šta je urađeno nakon `FULL_PROJECT_AUDIT.md`.

## Urađeno u ovoj iteraciji

| Stavka | Status | Fajlovi | Napomena |
| --- | --- | --- | --- |
| CSP hardening | Urađeno | `next.config.ts` | Dodat `Content-Security-Policy-Report-Only` da se politika može pratiti bez rizika da odmah polomi produkciju. |
| SEO metadata base | Urađeno | `app/layout.tsx` | `metadataBase` sada koristi `NEXT_PUBLIC_SITE_URL`, uz fallback na `https://imaposla.me`. |
| JobPosting schema | Urađeno | `app/oglasi/[slug]/page.tsx` | Detalj oglasa sada emituje `JobPosting` JSON-LD za bolji SEO. |
| Encoding provjera | Provjereno | više fajlova | Izvorni kod je provjeren preko Node UTF-8 čitanja. Mojibake koji se vidi u PowerShell outputu je prikaz terminala, ne sadržaj fajlova. |
| Privremeni audit inventar | U toku | `AUDIT_INVENTORY.json` | Pomoćni fajl treba izostaviti iz finalnog ZIP-a. |

## Blokirano lokalnim okruženjem

| Stavka | Status | Razlog | Sljedeći korak |
| --- | --- | --- | --- |
| Upgrade `next` na sigurniju 15.x verziju | Blokirano | Lokalni npm nema pristup registry-ju (`EACCES` na `registry.npmjs.org`). | Pokrenuti `npm install next@15.5.7 eslint-config-next@15.5.7 --save-exact` na mašini sa pristupom internetu ili kroz Vercel/GitHub CI. |
| Live RLS potvrda | Blokirano | Potreban Supabase projekat i produkcijski podaci. | Testirati politike kroz Supabase Dashboard/SQL editor sa anon, authenticated, firm i admin korisnikom. |
| Admin server-action refactor | Djelimično | Zahtijeva pažljivo prebacivanje browser-side mutacija u server/RPC sloj i live regresione testove. | Raditi kao posebnu backend sigurnosnu iteraciju. |

## Prioritet za sljedeći commit

1. Upgrade Next dependency čim mreža bude dostupna.
2. Prebaciti najosjetljivije admin update/delete akcije na server actions ili Supabase RPC.
3. Dodati Playwright smoke testove za public, kandidat, firma i admin tok.
4. Konsolidovati SQL migracije u kanonski redosljed i potvrditi ih na čistoj Supabase instanci.
