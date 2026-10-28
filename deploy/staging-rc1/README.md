# Staging kit — multi-currency v1.29.0-rc1

Prepared locally; **nothing here has been applied to any host.**

Approved artifact (verified 2026-10-29):

```
shalom-customer-portal-1.29.0-rc1-99c30840.zip
SHA-256 99c30840d01a482fb0c61e8990fa85b9144b79dc950dc685e83bd8b0658a59fc   (3,911,559 bytes, 1,656 entries)
root folder  shalom-customer-portal/     version 1.29.0     tests/ excluded
```

Files in this folder:

| File | Purpose |
| --- | --- |
| `APPROVAL-REQUEST.md` | Exact actions that need owner approval before execution |
| `staging.env.example` | Next.js staging environment (Preview scope) |
| `wp-config-staging.snippet.php` | Staging-only WordPress constants (no secrets) |
| `htaccess-staging.txt` | Basic auth + `X-Robots-Tag: noindex` + hardening |
| `shalom-staging-mail-guard.php` | MU-plugin that blocks every `wp_mail` on staging |
| `E2E-CHECKLIST.md` | 20 required E2E checks with evidence fields |

## Isolation rules (non-negotiable)

- WordPress staging = **new site, new database, new admin user**. Never `cms.shalombalitour.com`.
- No production customer, order, inquiry, review or media data on staging.
- New `SESSION_ENCRYPTION_KEY` and `SHALOM_HEADLESS_SIGNING_KEY`, generated on the staging host.
- `ALLOW_INDEXING=false` (frontend), `blog_public=0` + `noindex` header + Basic Auth (WordPress).
- All mail blocked; WhatsApp numbers replaced with test recipients before any booking test.
- Vercel target is **preview only**; no `--prod`, no promotion, no alias, no DNS change.

## Known infrastructure constraints (verified from this workstation)

| Item | Finding |
| --- | --- |
| Existing staging WordPress `slategray-goshawk-210407.hostingersite.com` | Runs plugin **1.13.2** (per `deploy/HTTPS-PREVIEW.md`); HTTP/reset on `/` and `/wp-json/*` from here, only `robots.txt` answered. Not usable as-is. |
| Existing Vercel preview project | `shalom-nextjs-preview` (`prj_itkVxGhG7b69Zh3qMQUJh7juh5D1`), still auth-protected (302). No local Vercel CLI/token. |
| Hostinger access | No hPanel session, API token or SFTP credentials available in this workspace. |
| GitHub CLI | Logged in as `rickyaaaa`; **not used** — no push performed. |
| Production | Unchanged: `shalombalitour.com` 200, `cms…/currencies` 404 (v1.28.1 behaviour). |

Because of the first three rows, Phases 2–4 cannot be executed from here without credentials and approval.

## What was verified locally instead

- Artifact hash and internal structure (above).
- Real HTTP contract of the artifact on the disposable harness (`php -S` + `tests/local-router.php`):
  - `GET /currencies` → `200`, `enabled:true`, `default:"USD"`, `supported:["USD","EUR","IDR"]`, USD rate `ok`.
  - `GET /tours` → `200`, `price_status:"converted"`, base IDR 900,000, USD 56, IDR 900,000.
  - No session → `GET /customer/me` `401`, `POST /customer/booking-ticket` `401`.
  - Rate 6 days → `status:"stale"`, Tour amounts still labelled `stale`.
  - Rate 8 days → `status:"unavailable"`, `idr_per_unit:null`, USD amounts `null`, IDR still `900000`.
- Backend regression on rc1: 38 rows, 1,254 checks, 0 failures (`run-all.ps1`).
- Frontend branch tests: 117/117.

## Rollback (staging only)

1. Turn the multi-currency flag OFF in Shalom Travel → Settings (immediate; frontend hides all currency UI).
2. Restore the pre-install database snapshot and uploads backup.
3. Reactivate the previous plugin build (or delete the plugin folder).
4. Delete the Vercel preview deployment/project (no alias, no domain attached).
5. Never restore a staging snapshot into production.
