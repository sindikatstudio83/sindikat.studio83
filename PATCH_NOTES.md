# Patch Notes

Applied after QA audit on 2026-05-18.

## Changed

- Protected routes now fail closed when role verification cannot be completed in `middleware.ts`.
- Added `lib/url.ts` with `safeExternalUrl()` for external banner URLs.
- Sanitized banner target URLs before rendering and before saving banner/banner request records.
- Added sitemap fallback so `/sitemap.xml` returns static routes if Supabase data fetch fails.
- Fixed upload helper text so SVG is not advertised as an allowed format.
- Added a visible wrong-role state on job applications instead of rendering nothing.
- Added Escape handling, focus restore, and Tab loop basics to the mobile filter drawer.
- Changed auth role failure behavior so the client fails closed instead of assigning `candidate`.
- Added filtered `ilike` search fallback when full-text search is unavailable.
- Restricted full image URLs to the configured Supabase Storage base.
- Added `JobPosting` structured data to job detail pages.

## Still Recommended Before Production

- Run `npm install`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- Consolidate Supabase SQL migrations into one canonical order.
- Add full focus trap behavior to the mobile filter drawer.
- Add JobPosting structured data on job detail pages.
