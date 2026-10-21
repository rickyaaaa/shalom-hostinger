# Isolated Shalom HTTPS Preview — current operations

Updated 20 October 2026. The application is Ready in **Preview**:
https://shalom-nextjs-preview-aye930kn4-rickyaaaas-projects.vercel.app

Project `shalom-nextjs-preview` / `prj_itkVxGhG7b69Zh3qMQUJh7juh5D1`, scope `rickyaaaas-projects`.
Release `dpl_D2u6fftg6ctiE4d96EKWA8tsrmCT`.
Read the adjacent project's `PRE-PRODUCTION-REPORT.md` for actual acceptance and outstanding requirements. Classification remains **NOT READY FOR PRODUCTION CUTOVER**.

## Existing bootstrap exception

The owner authorized exactly one empty Production-labelled bootstrap because Vercel treats a project's first deployment as Production. It has already succeeded: `dpl_5mK3bjj3dHqRSmxhPmAcDT1SKKdw`. Only three empty/static bootstrap files were uploaded, with no application, API, key or customer data. Noindex/no-store and `--skip-domain` were used. The generated bootstrap alias was removed; final active alias inventory is empty.

**Do not repeat the bootstrap, deploy any application with `--prod`, promote, attach production/custom domains, modify DNS or reuse another project.** That limited exception is exhausted. The only Ready Production deployment is the empty bootstrap. No actual Shalom production deployment is authorized.

## Preview-only build and environment

1. Keep the existing dedicated project, Vercel Authentication and fork protection. Do not import the WordPress workspace or private audit data.
2. Application deployments must explicitly target Preview with `deploy/vercel.preview.json`, exact project ID/scope. `--skip-domain` is a Production-only CLI option and applies solely to the already completed empty bootstrap exception; do not change target to use it. If provider metadata says `production` for an application, stop and report before further deployment work. Do not deploy again merely to update this report.
3. Install with `npm ci --include=dev`: the environment sets `NODE_ENV=production`, but tsx/TypeScript are build dependencies. Guarded wrapper runs environment preflight, tests, `next build`, then TypeScript. Node Route Handlers and native image optimization are required; no static export.
4. `scripts/vercel-preview-origin.ts` requires the exact Preview project/platform hostname. Both public origins derive from platform `VERCEL_URL`; no incoming Host/X-Forwarded-For trust. `next.config.ts` embeds only APP_URL/PUBLIC_SITE_URL, never secrets.
5. Seven application variables are scoped only to Preview: NODE_ENV=production, ALLOW_INDEXING=false, HEADLESS_RATE_LIMIT_MODE=signed, staging WORDPRESS_SITE_URL/WORDPRESS_API_URL and two independent sensitive Secrets SESSION_ENCRYPTION_KEY/SHALOM_HEADLESS_SIGNING_KEY. Keep secret values stable and out of client/public namespaces, source, arguments and logs.
6. Staging WordPress remains `https://slategray-goshawk-210407.hostingersite.com`, API `/wp-json/shalom/v1`. Installed plugin is 1.13.2. Matching SHALOM_HEADLESS_SIGNING_KEY and exact SHALOM_HEADLESS_AUDIENCE are already in staging-only `/public_html/wp-config.php`; do not install keys into plugin source or rewrite unrelated configuration.

## Validation and safety state

Use the authenticated browser or authorized `vercel curl` with the full deployment URL for protected reads; do not disable protection. Scoped connector reads currently return 403 while explicitly scoped CLI reads succeed. Do not change account authorization just to bypass this discrepancy.

Build/tests, TLS, noindex/robots/sitemap, private cookie attributes, native single-account identity, guest booking return, inquiry logging, Pending→same-review approval/public summary, duplicate prevention, session revocation and two-client signed rate limits passed on the actual HTTPS deployment. See the report for exact evidence and limitations.

The staging-only MU mail capture remains active, intercepting all native wp_mail before PHPMailer and retaining metadata outside public_html. It is not a direct-SMTP egress firewall. Exactly one synthetic account ID 8 and review ID 7 were created; keep them and historical synthetic review 6 out of any production data/testimonials. WhatsApp was never opened/sent. Final test sessions were logged out and temporary customer cookie jars removed.

Customer Account now displays session-owned paginated inquiry history; native Chromium modal keyboard traversal and bounded staging capacity acceptance passed on the closure release. Real mobile/standalone-browser/zoom coverage, all four owner content approvals and production data/mail/traffic sign-off remain outstanding. See deploy/readiness-closure plans and PRE-PRODUCTION-REPORT.md; do not convert historical or unavailable device evidence into a pass.

## Recovery

The prior 1.13.0 artifact and encrypted pre-change staging wp-config backup are retained. Coordinate server signing configuration with signed Preview rollback; removing keys alone makes signed requests fail closed. Do not restore a whole database, production environment or domain as part of preview recovery. No production traffic switch is part of this runbook.
