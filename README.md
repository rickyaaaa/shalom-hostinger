# Shalom Next — full customer frontend

Full Home, Ubud, South Kuta, West Bali and phone-based customer screens, backed by staging WordPress and Shalom plugin **1.13.2**. Next.js is the canonical customer presentation layer; Elementor and SCF stay installed only as rollback/fallback. See [MIGRATION-REPORT.md](MIGRATION-REPORT.md) for migration results, screenshots, content caveats and cutover steps; [POC-REPORT.md](POC-REPORT.md) preserves the earlier vertical acceptance history.

Current pre-production readiness, the 17-Tour content inventory, HTTPS preparation and exact future cutover/rollback gates are in [PRE-PRODUCTION-REPORT.md](PRE-PRODUCTION-REPORT.md). Production traffic and DNS remain unchanged. `deploy/preview.env.example` and `deploy/production.env.example` are templates, not deployed configuration.

## Run

Requires Node >=20.9 (verified24.13.0).

1. Copy .env.example to .env.local if configuration is not already present. Do not overwrite an existing private key.
2. Set SESSION_ENCRYPTION_KEY to 32 cryptographically random bytes encoded as 64 hex characters. Keep it secret and stable across instances. Set APP_URL to the exact browser origin (local default http://127.0.0.1:3000).
3. Run npm ci, npm run check:backend, npm run build, then npm start.
4. Open http://127.0.0.1:3000 . Use the APP_URL hostname consistently when submitting forms.

The current workspace already has private local configuration. It is ignored by version control. For development use npm run dev. Rebuild/redeploy after changing backend origins and keep build/runtime configuration consistent with image-host restrictions.

## Environment

| Variable | Meaning |
| --- | --- |
| WORDPRESS_SITE_URL | Server-only WordPress backend origin; HTTPS, or loopback HTTP for disposable QA |
| WORDPRESS_API_URL | Same WordPress origin, ending /wp-json/shalom/v1 |
| APP_URL | Exact Next frontend origin used to verify POSTs; HTTPS outside localhost |
| SESSION_ENCRYPTION_KEY | Private 64-character hex AES-256-GCM key; rotation signs Next customers out |
| PUBLIC_SITE_URL | Final canonical frontend origin; defaults to APP_URL |
| ALLOW_INDEXING | Defaults false for staging; true enables public-page indexing after an approved cutover and rebuild |

No NEXT_PUBLIC credentials, WordPress admin credentials, application passwords or customer database are required. Original presentation assets/fonts are local; API Featured Images must belong to configured WordPress uploads. See ASSETS.md and VISUAL-REFERENCE.md.

## Routes

/ Home; /ubud; /south-kuta; /west-bali; /login; /register; /request-help; /account. Transactional /book/{native-id} and /book/custom preserve native inquiry flows; no customer Tour-detail pages exist. /forgot-password redirects to Request Help while preserving intent. /api/customer/{action} is a fixed BFF for config/login/register/forgot-password/me/logout/booking-ticket/inquiries/reviews. Public Reviews uses /api/tours/{id}/reviews. Invalid booking targets render the noindex not-found UI; streamed responses can retain HTTP200 under Next's documented behavior.

WordPress owns identities, prices, metadata, completed Tours, inquiry relationships, eligibility, moderation and scores. Next stores only a sealed native session cookie. No Elementor HTML is parsed at runtime and no production fixture fallback exists.

## Checks

npm test; npm run typecheck; npm run build; npm run check:backend. With the staging-backed preview running: `npx tsx scripts/check-migration.ts` performs read-only SSR/SEO/public-data checks. The earlier check:poc script remains historical vertical-only verification.

`npm run check:env` validates explicit configuration without network access or printing secrets. `npm run check:env -- --https` additionally enforces HTTPS-preview origins and disabled indexing. The future `--production` mode requires HTTPS, production runtime and enabled public indexing; run it only for a separately approved cutover configuration. Neither mode deploys or changes configuration. `npm run check:preproduction` audits the current 17-Tour staging mapping, page metadata and public media read-only; set AUDIT_FRONTEND_URL to the assigned HTTPS preview origin to retest that deployment. This does not log in or send notifications. The audit's reviewed manifest belongs to staging; it is not a production data import/mapping.

Use `npm run start:hosted` only when the deployment platform requires binding on all interfaces; keep the port behind its ingress/firewall. The existing npm start remains loopback-only for a local reverse proxy. Both require a Node Next runtime, not a static export.

Disposable-only helpers are under tests/. The PHP router invokes the actual local WordPress REST server. scripts/check-customer-local.ts is restricted to fixed loopback test services and synthetic accounts. It does not test or modify staging. See POC-REPORT.md and ../shalom-customer-portal/HEADLESS-1.11.0.md for details.

All 17 canonical Tour cards have been populated/verified in staging; all existing prices were preserved. Only empty image/destinations/duration/note fields were backfilled from verified legacy card mappings, with an admin preview and backup. No runtime Elementor parsing or fixture fallback exists. Phone authentication, native registration/customer type/consent and support-only Request Help remain authoritative. LiteSpeed excludes ^/wp-json/shalom/v1/ from cache. Next has an isolated HTTPS Preview connected to real staging (newer local source changes require a separate Preview deployment); production hosting/traffic and SCF/Elementor removal have not been changed.

## Architecture decision — 20 October 2026

Next.js owns all customer-facing layouts and future visual revisions. Do not synchronize them to Elementor. WordPress remains the canonical CMS/business backend and wp-admin; retain Elementor and SCF intact as fallback. Browser interactions call same-origin Next Route Handlers; public Server Components also fetch structured REST on the server. No runtime Elementor scraping or duplicate business database.

Read [ARCHITECTURE-AND-BACKEND-AUDIT.md](ARCHITECTURE-AND-BACKEND-AUDIT.md) for the exact hostname configuration, remaining legal-page presentation gap, migration prerequisites and verification scope. Backend origin and keys must never use NEXT_PUBLIC_ or next.config.env. Current development/QA settings continue to use staging; no live configuration, domain, DNS or production deployment has changed.
