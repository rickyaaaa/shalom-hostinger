# Approval request — create the isolated staging environment

Nothing below has been executed. Each block lists the exact action and its blast radius.

## 0. What I cannot do from this workstation

| Blocker | Consequence |
| --- | --- |
| No Hostinger hPanel session / API token / SFTP credentials | Cannot create the staging site, database or install the plugin |
| No Vercel CLI or token | Cannot create the preview project or set Preview env vars |
| `slategray-goshawk-210407.hostingersite.com` runs plugin **1.13.2** and resets HTTP on `/wp-json/*` here | Cannot be reused; it is also far behind the contract |
| No browser automation attached | Browser screenshots must be captured manually or with the existing CDP script once a URL exists |

To proceed I need: (a) hPanel access or a temporary SFTP/SSH account for the new staging site,
(b) Vercel access (login or token) for the staging project, (c) a decision on the hostname.

## A. Hostinger — new isolated WordPress

Proposed resource names (adjust to the account's limits):

1. Website `shalom-multicurrency-staging`, **temporary domain** `<generated>.hostingersite.com`
   — zero DNS changes, no production subdomain.
   *Alternative if you prefer a branded host:* `cms-staging.shalombalitour.com` + one DNS `CNAME`
   record (needs explicit DNS approval; not proposed by default).
2. New database `uXXXXXX_shalom_mc_stg` with a new user and random password (separate from production).
3. WordPress 6.6+ install with a new admin user (no production users), permalinks `/%postname%/`.
4. SSL (Let's Encrypt) + force HTTPS; `blog_public = 0`.
5. `.htaccess`: Basic Auth for `wp-admin`/`wp-login.php` only, `X-Robots-Tag: noindex`, XML-RPC off
   (`deploy/staging-rc1/htaccess-staging.txt`).
6. `wp-config.php`: append the constants from `deploy/staging-rc1/wp-config-staging.snippet.php`
   with a freshly generated `SHALOM_HEADLESS_SIGNING_KEY` (never the production key).
   `SHALOM_HEADLESS_AUDIENCE` must equal the frontend's `WORDPRESS_API_URL` **exactly**
   (`https://<staging-host>/wp-json/shalom/v1`), because the adapter signs that string.
7. MU-plugin `shalom-staging-mail-guard.php` (blocks all mail, logs metadata outside the web root).
8. **Snapshot before install:** DB export + `wp-content` archive stored outside `public_html`.
9. Upload `shalom-customer-portal-1.29.0-rc1-99c30840.zip` (hash verified before upload) and activate.
10. Seed content: 3 test tours (South Kuta, Ubud, West Bali) created manually. **No production data
    import** — no customers, inquiries, reviews or media.
11. Set the plugin's WhatsApp numbers to the test recipients in Shalom Travel → Settings.

Blast radius: new host only; production untouched.

## B. Vercel — preview-only frontend

**Code constraint found:** `scripts/vercel-preview-origin.ts` hard-pins the project
`prj_itkVxGhG7b69Zh3qMQUJh7juh5D1` and the host pattern `shalom-nextjs-preview-*`. A *new* Vercel
project fails the build by design, so there are two options:

- **B1 — recommended (smallest):** reuse the existing `shalom-nextjs-preview` project, replace its
  Preview environment with the new staging WordPress values and fresh secrets, and deploy branch
  `feature/shalom-multicurrency` at `d011f3c` with `--target preview` and `deploy/vercel.preview.json`.
  Existing deployments stay immutable; current env values are recorded first for rollback.
- **B2 — strict project isolation:** extend `vercel-preview-origin.ts` (and its test) to allow a second
  project ID/host, then create a new project. This is a frontend code change and requires re-running
  the 117 tests and the production build before use.

Preview-scoped environment (7 vars, `deploy/staging-rc1/staging.env.example`):
`NODE_ENV=production`, `ALLOW_INDEXING=false`, `HEADLESS_RATE_LIMIT_MODE=signed`,
`WORDPRESS_SITE_URL`, `WORDPRESS_API_URL`, `SESSION_ENCRYPTION_KEY`, `SHALOM_HEADLESS_SIGNING_KEY`.
Secrets generated fresh; the signing key must equal the staging WordPress constant.

Keep Vercel Authentication ON. After deploy confirm: target `preview`, no production alias, `main`
untouched, `X-Robots-Tag: noindex` present (already enforced by `vercel.preview.json`).

Blast radius: a new preview deployment in the existing project (B1) or a new project (B2); no
production URL, DNS or `main` change.

## C. Not proposed / explicitly excluded

- Any change to `cms.shalombalitour.com`, `shalombalitour.com`, DNS, or production data.
- Merging or pushing `main`; promoting a preview; attaching custom domains.
- Importing production customers, inquiries, reviews or media.
- Enabling the feature on production.

## D. Order of execution (after approval)

1. Create host + database, install WordPress, harden, snapshot.
2. Install the verified ZIP; keep the flag OFF; smoke-test login/account/reviews/referral/booking.
3. Create the preview project + env; deploy preview; confirm noindex/auth.
4. Enable the flag on staging; refresh ECB rates; confirm `ok`.
5. Run the 20 E2E checks (`E2E-CHECKLIST.md`) and collect evidence.
6. Produce the release report with GO/NO-GO. Rollback per `README.md`.
