# Production Fix Plan

## Fixed in this patched version

1. Protected route authorization: protected routes redirect instead of rendering if role verification fails.
2. External banner URLs: banner links are normalized and limited to `http:` / `https:`.
3. Auth role fallback: the client no longer invents a `candidate` role when role lookup fails.
4. Public search fallback: search still filters by title/description if the `fts` column is missing.
5. Storage URL trust boundary: full image URLs must match the configured Supabase Storage base.
6. Sitemap resilience: sitemap returns static public routes if Supabase fetches fail.
7. Mobile filter accessibility: Escape close, focus restore, and Tab loop basics are implemented.
8. Job application wrong-role state: company/admin users see an explanation instead of blank UI.
9. Upload copy: SVG is no longer advertised as allowed.

## Still Required Before Production

1. Run `npm install`, `npm run typecheck`, `npm run lint`, and `npm run build`.
2. Consolidate Supabase SQL files into one timestamped migration chain.
3. Run browser QA for guest, candidate, company, and admin flows.
4. Run Lighthouse on mobile and desktop.
5. Verify Supabase RLS against a real staging database.
