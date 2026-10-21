# Architecture decision and backend hostname audit

Decision and source audit: 20 October 2026. Local source/configuration preparation only; no deployment, live WordPress edit, domain, DNS or traffic change.

## Ownership and request boundary

- Next.js owns customer presentation, navigation and all future visual/content-layout revisions. Never synchronize visual changes to Elementor.
- WordPress owns canonical Tour content/pricing/media, customers/auth, inquiries, completions, reviews/eligibility/moderation, plugin runtime and wp-admin. Do not create a duplicate business database.
- Elementor and SCF stay installed and intact as rollback/fallback only; no uninstall or legacy-page edits are authorized.
- Browser customer/review requests -> same-origin Next Route Handlers -> server-only WordPress REST adapters -> Shalom plugin / canonical SCF or native metadata / WordPress database.
- Public page Server Components also read structured WordPress REST directly on the server. This is the existing server boundary; public initial rendering does not make a redundant HTTP call to its own Route Handler.
- No runtime scraping/rendering of Elementor markup. Local presentation assets, approved static marketing copy and the approved West Bali display notice are presentation, not a second Tour database. Canonical business values stay in WordPress.

## Config-only hostname switch: source is ready, backend migration still required

For the Next application, changing backend hostname needs server environment changes plus rebuild/redeploy, not a frontend source rewrite:

| Configuration | Current development/QA | Future example only |
| --- | --- | --- |
| WORDPRESS_SITE_URL | https://slategray-goshawk-210407.hostingersite.com | https://cms.your-production-domain.example |
| WORDPRESS_API_URL | Same staging origin + /wp-json/shalom/v1 | Same new backend origin + /wp-json/shalom/v1 |

Both are server-only variables and must agree at build and runtime. The site must be a root origin, API path must remain /wp-json/shalom/v1; HTTPS is required except loopback disposable QA. Subdirectory WordPress installs are not supported by this configuration contract. A missing or invalid value now fails closed, with no temporary-domain fallback.

next.config.ts derives the restricted uploads image allowlist from that validated environment. Rebuild/redeploy after a hostname change; changing only a running process environment is insufficient for build-time image configuration. APP_URL and PUBLIC_SITE_URL describe the Next frontend and do not change merely because the backend moves. Keep ALLOW_INDEXING=false for QA/Preview.

SESSION_ENCRYPTION_KEY and SHALOM_HEADLESS_SIGNING_KEY remain private server secrets, independent by environment. Never put backend configuration or keys in NEXT_PUBLIC_ variables or next.config.env. The existing Preview helper serializes only public Next frontend origins. Public media URLs and terms/privacy destinations are visible to browsers by design; the backend hostname is not itself a secret.

## Runtime findings and repairs

| Location | Finding / result |
| --- | --- |
| next.config.ts | Removed the hardcoded Hostinger fallback. Image host now comes only from shared validated environment. |
| scripts/wordpress-environment.ts; src/lib/config.ts | Shared build/server URL validation; server adapter retains server-only import boundary. Missing/mismatched origins, incorrect API paths, credentials/query/hash and browser WordPress namespace are rejected. |
| src/lib/site.ts; src/lib/types.ts | Removed unused wordpressHome prop so customer navigation props no longer carry a backend-home destination. Actual navigation remains relative Next routes. |
| src/lib/wordpress.ts | Public REST reads and canonical upload image checks use configured site/API; no temporary domain literal. |
| src/lib/customer-server.ts; headless-signing.ts | Customer transport uses configured API; signature audience derives from that API. Native session credential stays server-side in an encrypted HttpOnly Next cookie. |
| customer-client.ts; ReviewModal.tsx; Next API routes | Browser calls use relative /api/customer/... and /api/tours/... paths. No direct browser credentialed WordPress request. |
| HomeInformation.tsx | Four icon upload paths are relative to configured backend. Keep those media paths available after moving the backend; no hostname rewrite in frontend needed. |
| WordPress plugin includes/*.php, templates and assets | No temporary Hostinger hostname literal in runtime source. REST media comes from wp_get_attachment_image_url; terms/privacy from configured native page permalinks. Legacy shortcode/template runtime stays intact for fallback. |

### Presentation gap found: terms/privacy

AuthForm links to terms_url/privacy_url returned by the WordPress customer config endpoint. Those currently open WordPress pages, so the backend-only presentation transition is not yet complete for these two legal links. Do not invent legal copy or silently redirect to an empty Next page. A later scoped change must expose the existing approved legal content as structured API data and render it in Next, preserving consent page IDs and behavior. No auth/consent logic or legal page was changed in this audit.

## Remaining temporary-domain references: intentional / historical

- .env.local and deployed Preview settings: active development/QA configuration; preserved. Change through environment management only when migration is approved. No secret values were copied into this report.
- .env.example and deploy/preview.env.example: explicit current staging examples, not runtime defaults; annotated server-only/rebuild requirements. deploy/production.env.example is a future configuration template, not authorization or a live deployment.
- ASSETS.md, public/images/*.json source metadata, VISUAL-REFERENCE.md, migration/acceptance reports and .impeccable review evidence: source provenance/historical snapshots. They do not configure API fetches or image allowlists and are not imported as a fallback content database. Preserve truthful history.
- Staging-only mail capture helper: its exact-host guard intentionally targets staging. Keep it active now. A future mail/migration approval must determine its placement; do not remove the guard or carry staging capture into production blindly. See FINAL-CUTOVER-CHECKLIST.md and deploy/readiness-closure/STAGING-CLEANUP-AND-MAIL-PLAN.md.

No hardcoded temporary hostname remains in Next runtime src/, next.config.ts or runtime WordPress plugin source after this change. This does not mean stored WordPress content/options or historical documents have been rewritten.

## Future backend migration prerequisites — not executed

1. Approve migration/rollback and backend hostname/TLS plan separately. No DNS/domain operation is authorized by this audit.
2. Move the existing canonical WordPress database/uploads/plugin runtime without duplicating business ownership. Configure home/siteurl and any WP_HOME/WP_SITEURL overrides for the new origin. Inspect stored absolute media/attachment URLs and relevant plugin/page options using a backed-up, serialization-aware, reversible migration plan. Do not blindly replace GUIDs or unrelated customer data.
3. Confirm REST returns canonical card_image URLs on the new origin; current Next image validation intentionally rejects stale old-host images. Preserve upload paths, including HomeInformation icons. Confirm terms/privacy permalink destinations and resolve the Next legal presentation gap separately.
4. Set WordPress SHALOM_HEADLESS_AUDIENCE to exactly the new WORDPRESS_API_URL. Keep the matching signing key private and scoped to the intended environment. Reconfigure server URLs/audience, not plugin source. Never reuse a production key in Preview.
5. Set both Next WORDPRESS_* variables for the intended environment, build/redeploy there, then verify API/media and signed customer operations. WordPress hostname/cookie-hash changes may invalidate sealed native sessions; plan controlled sign-out/re-login rather than promising existing sessions survive.
6. Recheck backend REST cache exclusions/no-store behavior, firewall/network reachability, mail capture/provider configuration and public indexing policy. No custom domain, mail provider or DNS has changed here.
7. Complete all existing final acceptance gates before any production cutover. Retain original fixtures/mail capture and Elementor/SCF until separately approved.

## Verification scope

Configuration tests cover arbitrary future backend hosts and image allowlist derivation without contacting those example hosts, absent/unsafe configuration, REST-origin/path mismatch and browser environment rejection. Existing signing tests cover audience binding. Unit/preflight suite, TypeScript and production build results are recorded after execution below. A future real-host migration and authenticated end-to-end acceptance are still required; config tests alone cannot prove migrated data, TLS, mail or native sessions.

### Results — local source, 20 October 2026

- `npm test`: **27/27 passed**, including five new backend hostname/configuration tests and expanded Preview preflight coverage.
- `npm run typecheck`: passed.
- `npm run build`: passed (production-mode local build, no deployment).
- `npm run check:env`: passed for the unchanged local configuration. This is not the hosted HTTPS preflight and does not claim hosted credentials were inspected.
- `npm run check:backend`: four read-only staging REST contracts returned HTTP 200 and valid schemas (Tour collection, Tour 523, its reviews, latest reviews).
- Local rebuilt server smoke: Home, Ubud, West Bali, Login, Register, customer config, public reviews and a WordPress-origin optimized Tour image all returned HTTP 200. No account creation, booking, review write or mail send.
- Runtime source scan: zero temporary-domain literals in Next src/ and next.config.ts, or WordPress plugin includes/assets/templates/main file. Historical/config/provenance references remain as classified above.
- Seventeen client JS files checked: the configured local SESSION_ENCRYPTION_KEY was absent; compiled Next env contains no WordPress/private configuration keys. The headless signing key is not configured locally; no deployed secret was retrieved or re-audited. Existing server-only/Node transport boundaries and signing tests passed.
- Hosted Preview was not redeployed. Future-host TLS, data migration and authenticated flows on that future host remain untested. Existing final acceptance gates remain open.

## Exact application/project files changed in this task

- next.config.ts
- scripts/wordpress-environment.ts (new)
- src/lib/config.ts
- src/lib/site.ts
- src/lib/types.ts
- scripts/check-deployment-env.ts
- tests/deployment-env.test.ts
- tests/wordpress-environment.test.ts (new)
- .env.example
- deploy/preview.env.example
- deploy/production.env.example
- README.md
- PRODUCT.md
- DESIGN.md
- ARCHITECTURE-AND-BACKEND-AUDIT.md (this report, new)

Only comments were added to the three environment templates; active local/Vercel settings and all secrets were preserved. No plugin source, canonical WordPress record, Elementor layout, SCF setting, DNS/domain or deployment target was changed. Workspace-only patch/verification helpers and original-file backups are in the existing https-preview-work directory, outside the application deployment source.
