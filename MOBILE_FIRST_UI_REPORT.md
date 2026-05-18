# Mobile-first UI Optimization Report

Datum: 2026-05-18

## Šta je urađeno

| Oblast | Promjena |
| --- | --- |
| Paleta | Crvena je smirena i prebačena u akcent boju; glavna CTA dugmad sada koriste navy ton. |
| Kontrast | Uklonjen je pretežak tamni hero tretman na javnim stranicama; hero je sada svijetao, prozračan i lakši za čitanje na telefonu. |
| Mobilna navigacija | Na iOS browserima mobilni dock se pomjera ispod headera, suprotno od donje browser adresne trake. Na ostalim mobilnim browserima ostaje donji floating dock. |
| Top header | Na telefonu je header smanjen, tema dugme je sakriveno radi čistoće, a hamburger je jasnije označen kao `Meni`. |
| Search | Pretraga i filteri imaju veći touch target, više razmaka i mekši vizuelni tretman. |
| Oglasi | Kartice oglasa imaju više prostora, mekše ivice, manje agresivan hover i jasnije akcije. |
| Homepage | Intent kartice `Nudim posao` i `Tražim posao` su prebačene u svijetle, preglednije kartice. |
| Safe area | Dodati su razmaci za donji dock i iOS safe-area ponašanje da navigacija ne pokriva CTA i sadržaj. |

## Izmijenjeni fajlovi

| Fajl | Promjena |
| --- | --- |
| `app/globals.css` | Finalni mobile-first polish sloj: smirene boje, novi mobile nav layout, bolji spacing, mekše kartice i search. |
| `components/mobile-nav.tsx` | iOS detekcija proširena na iOS browsere, ne samo Safari, da se nav pozicionira suprotno od donje browser trake. |
| `components/header.tsx` | Mobile hamburger dugme sada piše `Meni`, radi jasnijeg UI-ja. |
| `.gitignore` | Dodati lokalni ZIP patterni da paketi ne uđu u git. |

## Šta testirati ručno

1. iPhone Safari / Chrome iOS: provjeriti da je mobilni nav gore ispod headera i da ne prekriva hero/search.
2. Android Chrome: provjeriti da je mobilni nav donji dock i da ne prekriva CTA dugmad.
3. `/` na 375px, 390px i 430px: hero, intent kartice, search, premium poslodavci i oglasi.
4. `/oglasi` na 375px, 390px i 430px: kartice oglasa, filter drawer, CTA dugmad i save dugme.
5. `/oglasi/[slug]`: detalj oglasa i forma prijave.
6. Kandidat dashboard, firma dashboard i admin panel: provjeriti da finalni globalni polish ne lomi dashboard kontrole.

## Verifikacija

- `npm run typecheck` prošao
- `npm run lint` prošao
- `npm run build` prošao lokalno sa dummy Supabase env vrijednostima

Napomena: lokalni build može prikazati `fetch failed` za Supabase ako se koristi dummy env, ali build i dalje prolazi.
