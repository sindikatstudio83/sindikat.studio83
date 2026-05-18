# imaposla.me — Redesign / Production Polish Report

Datum: 2026-05-17

## Cilj

Prenijeti preglednost i raspored iz `preview.html` mockup-a na postojeći Next/Supabase sajt, ali bez pravljenja demo-only funkcionalnosti i bez lomljenja postojećih backend tokova.

## Izmijenjeni fajlovi

| Fajl | Šta je urađeno |
|---|---|
| `app/globals.css` | Dodat završni product polish sloj: bolji dashboard/grid sistem, responzivni layout, zaštita od overflow/preklapanja, sređene kartice oglasa, admin kartice, forme, ATS layout, search bar, section head, mobile breakpoints. |
| `components/admin-client.tsx` | Dodata zaštita da admin ne može sebi skinuti `admin` rolu; poruka nakon promjene role jasnije kaže da se korisnik treba ponovo prijaviti. |
| `supabase-storage.sql` | Uklonjen `image/svg+xml` iz dozvoljenih MIME tipova za `company-logos`; usklađeno sa frontend upload validacijom. |
| `supabase-storage-images-fix.sql` | Uklonjen `image/svg+xml` iz dozvoljenih MIME tipova za `company-logos` i `banners`; storage više ne otvara SVG upload mimo UI-ja. |
| `supabase-audit-and-setup.sql` | Novi SQL fajl: admin audit log tabela, RLS, trigger za promjenu role, trigger za odobravanje/sakrivanje firme, trigger za promjenu statusa oglasa, RPC za čitanje audit loga. |
| `MIGRATIONS.md` | Dodat korak 18 za `supabase-audit-and-setup.sql`; update instrukcija za postojeću bazu. |
| `admin-client.tsx` u root-u | Uklonjen legacy duplikat; pravi fajl je `components/admin-client.tsx`. |
| `auth-form.tsx` u root-u | Uklonjen legacy duplikat; pravi fajl je `components/auth-form.tsx`. |
| `company-client.tsx` u root-u | Uklonjen legacy duplikat; pravi fajl je `components/company-client.tsx`. |
| `tsconfig.tsbuildinfo` | Uklonjen build cache iz ZIP-a; ne treba ići u deploy paket. |

## Šta je konkretno popravljeno u UI/UX-u

- Dashboard layout je stabilniji na desktopu i mobilnom.
- `section-head` sada ima jasniji panel izgled i bolje odvaja naslov/akcije.
- Kartice oglasa više ne guraju tekst izvan okvira; desna akcijska kolona se prelama na manjim ekranima.
- Dugmad, filteri i akcije sada imaju sigurnije širine i wrapping.
- Admin kartice imaju stabilniji raspored, bolji filter panel i bolju mobile adaptaciju.
- Firma job kartice i akcije bolje se slažu na manjim širinama.
- ATS panel ima sigurniji sticky/detail layout i mobile fallback.
- Forme koriste grid koji se ruši na jednu kolonu na mobilnom.
- Globalno je dodat `overflow-wrap:anywhere` na elemente koji mogu imati dugačke nazive, emailove, URL-ove ili opise.
- Mobile breakpoints dodatno smanjuju rizik preklapanja elemenata.

## Šta je popravljeno u sigurnosti / produkciji

- SVG upload je usklađeno blokiran na frontend i Supabase Storage nivou.
- Admin ne može slučajno sebi ukloniti admin rolu kroz UI.
- Dodat je audit SQL osnov za praćenje bitnih admin promjena.
- Uklonjeni su root duplikati komponenti koji mogu zbuniti održavanje/deploy.

## Šta nije moglo biti potvrđeno lokalno

- `npm run typecheck` nije mogao da se izvrši jer `node_modules` ne postoji u ZIP-u.
- `npm run lint` nije mogao da se izvrši jer `eslint` nije instaliran lokalno.
- Supabase RLS i migracije ne mogu biti live potvrđene bez Supabase projekta/env varijabli.

## Ručno testirati prije deploya

1. Homepage na desktopu i mobilnom.
2. `/oglasi` filtere i kartice oglasa.
3. `/oglasi/[slug]` detalj oglasa i prijavu kandidata.
4. Login/register/logout.
5. Kandidat dashboard, biografiju, sačuvane oglase i prijave.
6. Firma dashboard, profil firme, novi oglas, moji oglasi, pretplatu.
7. ATS `/firma/selekcija` na desktopu i mobilnom.
8. Admin dashboard, oglase, firme, korisnike, uplate.
9. Upload avatar/logo/banner bez SVG.
10. Supabase migracije, posebno `supabase-audit-and-setup.sql`.

## Preostalo za narednu fazu

- Dodati admin UI za pregled `admin_audit_log`.
- Prebaciti najosjetljivije admin akcije u server-side RPC/server action sloj.
- Završiti stvarne email job alerts.
- Završiti ili sakriti worker ratings.
- Dodati account deletion flow ako je potreban za produkciju.
