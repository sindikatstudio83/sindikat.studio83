# imaposla.me — Production Checklist

## Pre-deploy

### Env varijable (Vercel → Settings → Environment Variables)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

### Supabase setup
- [ ] SQL migracije pokrenute u redosljed iz MIGRATIONS.md
- [ ] RLS enabled na svim tabelama
- [ ] Storage buckets: avatars (public), company-logos (public), banners (public), payment-proofs (private)
- [ ] Auth redirect URLs: https://imaposla.me/** i http://localhost:3000/**
- [ ] Email templates postavljeni
- [ ] Admin nalog: UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@...'

### Build checks
- npm run typecheck → 0 grešaka
- npm run lint      → 0 upozorenja
- npm run build     → uspješan build

### Ručni QA — Gost
- [ ] Homepage se učitava
- [ ] Pretraga i filteri rade
- [ ] Detalj oglasa se otvara
- [ ] /admin i /firma redirectuju na /login (SERVER-SIDE — testirati direktan URL)

### Ručni QA — Kandidat
- [ ] Registracija → email potvrda → login → /profil
- [ ] CV builder + auto-save
- [ ] Avatar upload (ne SVG!)
- [ ] Prijava na oglas
- [ ] Duplikat prijava blokirana
- [ ] Sačuvani oglasi
- [ ] Job alerts

### Ručni QA — Firma
- [ ] Registracija → login → /firma
- [ ] Kreiranje profila + logo upload
- [ ] Novi oglas → pending_review
- [ ] ATS kanban + komentari + labeli
- [ ] CV unlock (sa aktivnom pretplatom)
- [ ] Banner request sa slikom
- [ ] Narudžba + upload dokaza uplate

### Ručni QA — Admin
- [ ] Login → /admin
- [ ] Potvrda uplate
- [ ] Odobravanje firme
- [ ] Odobravanje oglasa
- [ ] Promocija oglasa
- [ ] Baner CRUD
- [ ] Promjena role korisnika
- [ ] Reset lozinke za korisnika

### Security provjere
- [ ] SVG upload odbijen
- [ ] Mock baneri se NE prikazuju
- [ ] Middleware radi server-side (testiraj direktan URL /admin bez logina)

## Poznata ograničenja v1
- Email job alerts: in-app only (Edge Function u planu)
- Worker ratings: DB spreman, UI u Fazi 2
- Real-time notifikacije: polling 60s (Supabase Realtime u planu)
- Account deletion: nije implementirano (GDPR Faza 2)
