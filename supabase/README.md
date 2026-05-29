# Supabase Migrations

## Source of Truth

Za novi Supabase projekat pokreni migrations **redom** iz `migrations/`:

```
001_schema.sql              — bazne tabele, enum tipovi, RLS
002_production.sql          — auth triggeri, cv_data, payment_proofs, SIGURNA is_admin()
003_security_fixes.sql      — is_admin() iz profiles (ne JWT), stezanje notification policy-ja
004_growth_features.sql     — baneri, hero carousel, quick_job, kreativni templati
005_live_hardening.sql      — revoke execute, database indeksi za performanse
006_rpc_ownership.sql       — RPC ownership security patch
007_job_expiry.sql          — job expiry cron / trigger
```

## Seed

```
seed/seed.sql               — demo podaci za development/staging
```

## Email Templati

```
emails/confirm.html         — Supabase email za potvrdu naloga
emails/reset.html           — Supabase email za reset lozinke
```

## ⚠️ Archive — NE POKRETATI

Fajlovi u `archive/` su **zastarjeli ili sigurnosno problematični**.
Posebno **NIKAD ne pokretati**:

- `UNSAFE_auth-complete_has_jwt-metadata-admin.sql`
  → Ova datoteka sadrži `is_admin()` koja čita `auth.jwt()->user_metadata`,
    što je korisnik-editabilno polje. Može se koristiti za privilege escalation.
    Supersedovan od `002_production.sql` i `003_security_fixes.sql`.

- `SUPERSEDED_rls-fix.sql`
  → Sadrži mješanu OR logiku za `is_admin()` — JWT metadata može pobjediti profiles provjeru.

## Provjera aktivne is_admin() na produkcijskoj bazi

Pokrenuti u Supabase SQL Editoru:
```sql
SELECT prosrc FROM pg_proc
WHERE proname = 'is_admin'
  AND pronamespace = 'public'::regnamespace;
```

Ispravna (SIGURNA) verzija treba sadržati:
```sql
select exists (
  select 1 from public.profiles
  where id = auth.uid()
    and role in ('admin', 'superadmin')
)
```

Ako vidite `user_metadata` — odmah pokrenite `003_security_fixes.sql`.
