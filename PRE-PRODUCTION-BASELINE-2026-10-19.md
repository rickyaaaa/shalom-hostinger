# Pre-production hardening — 19 October 2026

**Classification: READY FOR HTTPS PREVIEW.**

The application and deployment preparation are ready for an isolated HTTPS preview. This is **not** production-cutover acceptance: no public Next HTTPS preview hostname/hosting, TLS, controlled outbound recipient/transport, or HTTPS authenticated journey has been provisioned or verified in this phase. Production traffic/DNS, WordPress URLs, SCF, Elementor and the approved phone authentication architecture were not changed.

## Evidence and changes in this phase

| Evidence | Result and scope |
| --- | --- |
| Content/SEO audit | **301 checks passed**, current local production Next reading real staging WordPress/public media; 17 Tours and 8 pages |
| Canonical inventory | [PRE-PRODUCTION-CONTENT.md](PRE-PRODUCTION-CONTENT.md): every requested Tour field, exact native ID/area/image and prices |
| Responsive audit | **40 checks**, eight routes at 375/390/430/768/1440px; current guest state, no horizontal overflow/header overlap; Tour actions aligned and nowrap |
| Mobile input hardening | Phone/name/password/select/textarea text becomes 16px at <=767px; final computed styles checked. No field, identity rule or handler changed |
| Build / TypeScript / tests | Production build passed; final TypeScript passed; **16 unit/contract/SEO/environment tests passed** |
| Deployment preflight | Local explicit configuration passes; synthetic future HTTPS two-domain configuration passes without contacting those domains; HTTP/origin/indexing/secret mistakes are rejected |
| Browser secret check | 18 emitted static text assets scanned in memory for the actual configured session secret; **0 matches**; no secret value printed |
| Existing authenticated staging evidence | Earlier real phone customer ID7, inquiry/completions and review6 Pending → duplicate rejected → Approved → public score8.0/count1 remain documented in MIGRATION-REPORT.md. **Not relabelled as a fresh HTTPS test** |

Evidence files: `.impeccable/review/pre-production-audit.json`, `pre-production-legacy-comparison.json`, `pre-production-visual.json`, `pre-production-client-secrets.json` and `pre-production-*.jpg`. The canonical audit is read-only: no customer creation, inquiry, review, approval, SMS, email or WhatsApp operation occurred. Current HTTP preview remains `http://127.0.0.1:3000` against the staging domain.

Files changed/added: the single mobile input CSS rule; package script aliases; explicit safe local canonical/indexing settings; `.env.example`; `deploy/preview.env.example`, `deploy/production.env.example`; `scripts/check-pre-production.ts`, `scripts/check-deployment-env.ts`; `tests/seo.test.ts`, `tests/deployment-env.test.ts`; audit evidence and this report/content inventory. No WordPress plugin runtime file changed. Approved 1.13.0 ZIP remains SHA256 `3f23c5eae1c93679766d3d8547b8fc7afa6a3585e7d8f0ba2cc93efb21d3ae2c`.

## 1. Content audit and decisions still needed

All17 canonical Tours match collection/detail APIs, the reviewed ID/area/Featured Image binding and the rendered Next card. All images return HTTP200 image content. Titles, destinations, regular/sale prices, USD currency, duration, price notes and public rating/count match; no missing image, duplicate native ID/title/image/destination-list or incorrect area mapping was found. All sale prices are <= regular prices. All17 stored pricing objects remain unchanged from the approved backfill snapshot. There are7 Ubud,6 South Kuta and4 West Bali Tours.

`card_image` is verified in backend code as native `get_post_thumbnail_id()` → full attachment URL, not an Elementor thumbnail. The customer image fallback alt is the canonical Tour title. No legacy HTML is a runtime data source.

| Item | Finding / required owner decision | Treatment now |
| --- | --- | --- |
| Tour633, West Bali Temple Tour | Price note is exactly `NB:“NOT INCLUDING”`; exclusions are absent | Preserved; owner must supply the complete approved note before production |
| Tour655, West Bali Relaxing Tour | Price note is `NB:` followed by `NOT`; incomplete | Preserved; owner must confirm wording, not infer inclusions |
| Tour580, Ubud D | Destination `ATV (Four Wheels Motorbike` has an unmatched parenthesis | Preserved; owner should confirm full destination label |
| Tour644 | Note begins `Start at 10.00`; timezone/meaning is not specified | Preserved; confirm intended start time and timezone if this is a booking promise |
| Featured Images, all17 | WordPress alt metadata is empty | Next provides canonical-title alt; owner may supply descriptive asset alt text |
| Review6 / Tour523 | Approved synthetic staging validation text is visible on Home/modal and contributes8.0/count1 | Clearly labelled; exclude from production data/content import. Do not present it as a genuine testimonial |
| Legacy review2 / South Kuta599 | Existing approved review remains associated; not a fabricated migration review | Preserve; public title/area/score come from canonical backend |
| Common price note,14 Tours | Identical future-price-change prose | Shared legitimate note, not duplicate Tour cards; confirm commercial wording once for all affected Tours |
| Home/FAQ inclusions | Source says private driver/fuel/parking included, tickets/meals excluded unless stated; West Bali notes are incomplete | Owner must reconcile package-specific exceptions. No new business promise was invented |
| Static marketing prose | Source grammar such as “Meets the quiet rhythm…”, “Absolute magic…” and mixed title capitalization remains | Editorial confirmation; no silent copy rewrite |
| Legal links | Terms and privacy URLs both return200; no obvious WordPress suggested-text/example markers found | Availability check only, not legal approval; verify correct documents/URLs again on CMS domain |
| Contact / social / Since2016 | Retained source phone numbers, TikTok link and verified source wording | Owner must confirm live business contact details before launch; no call/message sent |

**Legacy prices are different from canonical prices; this is visible data-source drift, not a frontend calculation error.** Ubud and South Kuta Elementor cards display65/55 USD while canonical values are75/60 for most,75/56 for591,75/50 for599. West Bali legacy cards show75; canonical regular/sale are633=90/75,644=90/75,651=80/65,655=65/50. Canonical values deliberately win. The owner must accept current native prices before cutover; this phase changed neither source.

Canonical titles intentionally distinguish the old generic “FOR KIDZ” and “South Kuta Fun…” headings. First West Bali card633 versus last655 follows the explicit prior owner confirmation; the old duplicate655 link is not copied. The South Kuta599 asset has an unintuitive legacy filename but the native attachment/source binding is verified; filename alone is not evidence of a wrong image.

No obvious lorem-ipsum/coming-soon/company-placeholder prose was found on the eight SSR pages. Empty states (“New”, “No reviews yet”, no completed Tours) are honest backend states. Account content is private/dynamic; the current guest view and earlier authenticated ID7 capture are kept separate.

## 2. Visual QA

Compared the current Next preview with the original source captures and the approved corrected migration captures: Raleway, navy/pale-blue/gold, original logo/photos/illustration/icons, section order, flat Tour cards and pill buttons remain. The approved changes—upper-right scores on phones, notes after actions, repaired anchors/dropdown order and Since2016 wording—remain intentional.

Measured five widths on Home, all areas and Login/Register/Request Help/Account. No horizontal overflow or logo/action overlap was found. Every rendered Tour's Book Now/Reviews controls share the same row, stay within their card and remain nowrap. Source photographic cropping is retained through `object-fit: cover`; all17 assets resolve. Readable text input sizing was the only new visual change.

Hamburger and nested itinerary open/close; order is South Kuta → Ubud → West Bali. Desktop dropdown also opens; Escape closes it. Home anchor destinations customizedtour/review/answer/about/contact exist and the selected navigation intent/menu-close behavior is preserved. Public Reviews opens the canonical approved data, fits narrow width, locks scrolling, closes with Escape and returns focus. Footer links remain source telephone links. No telephone/WhatsApp/social message was sent.

Current screenshots cover Home/Ubud desktop and all eight routes at390px, with menu/modal narrow captures. Form viewport captures may show only the first viewport; the unchanged full registration and authenticated Account captures remain in the migration evidence. Guest account labels are freshly tested; authenticated labels and completed/review presentation refer to the earlier real staging capture until HTTPS re-login.

The independent reviewer opened all17 designated captures and returned **disposition: ship** for source preservation and the isolated mobile16px control sizing, with no material visual fixes. See [PRE-PRODUCTION-VISUAL-REVIEW.md](PRE-PRODUCTION-VISUAL-REVIEW.md). The documenter compared the incumbent world and preserved DESIGN.md and its sidecar byte-for-byte; see [PRE-PRODUCTION-DESIGN-NOTES.md](PRE-PRODUCTION-DESIGN-NOTES.md). The inherited46 advisory token/documentation differences were recorded, not silently repaired.

Remaining visual acceptance: physical iOS Safari/Android and desktop Safari/Firefox,200% zoom/assistive technology and real HTTPS session states have not been device-certified. Desktop browser viewport emulation establishes layout dimensions, not physical-device behavior. The visual disposition does not approve those gates or production operations.

## 3. HTTPS preview deployment/runtime requirements

Use a host that runs the **Next Node.js runtime**, its Route Handlers, Node crypto, HttpOnly cookie writes and runtime image optimizer. A static-only `output: export` or uploading an `out/` folder cannot provide these customer flows. Current application does not configure static export. Use the locked dependencies; validated runtime is Node24.13.0. The project's declared minimum is20.9; select a currently supported host Node release and repeat the locked build, rather than assuming any older runtime is accepted.

Deployment sequence for an assigned preview host:

1. Choose an isolated HTTPS origin and valid certificate; keep production DNS/traffic unchanged. Protect the preview with the host's deployment access controls and keep indexing disabled. Set up outbound-mail capture before any registration test.
2. Deploy only the Next application/source/lockfile/public assets. Do not upload this workstation's `.env.local`, private audit DTOs, disposable PHP/DB test harness, WordPress admin credentials or the entire workspace. The repository has no Git history; record a release archive/hash and retain the prior artifact.
3. Set build **and** runtime environment from `deploy/preview.env.example`, replacing the example origin. Use a new stable preview session key from the host secret store. Do not generate a new key on each restart.
4. Run `npm ci`, `npm run check:env -- --https`, `npm test`, `npm run typecheck`, `npm run build`. The HTTPS preflight rejects placeholder domains, HTTP, mismatched canonical/API origins and enabled indexing. A successful synthetic configuration test does not prove DNS/TLS connectivity.
5. On managed Next hosting, use the platform's supported Next runtime integration. On a container or host that requires external binding use `npm run start:hosted`; set the host's PORT. On a single VM behind a local reverse proxy, `npm start` deliberately binds127.0.0.1 and the proxy serves TLS. Keep Node's port private at the firewall. Run under an unprivileged supervised process, with restart/health/log retention and enough disk/memory for Next image cache.
6. Preserve original `Origin`, correct Host/forwarded host and trusted HTTPS scheme through the proxy; do not rewrite Origin to bypass validation. Permit streaming responses (disable proxy buffering where necessary); do not cache customer APIs/pages or override no-store. Only hashed static assets can use long immutable caching. Do not copy a static SPA rewrite over `/api`, image or RSC routes.
7. Run the read-only audit with `AUDIT_FRONTEND_URL` set to the real preview origin and repeat the HTTPS business matrix below. If deployment protection requires credentials, use the host's controlled access method; never embed credentials in audit URLs or store them in reports.

This runtime/proxy choice follows [Next self-hosting guidance](https://nextjs.org/docs/app/guides/self-hosting). Server-only configuration must stay outside `NEXT_PUBLIC_*`; public-prefixed values are bundled at build time per [Next environment guidance](https://nextjs.org/docs/app/guides/environment-variables). This app's WordPress requests and session crypto are already server-only.

## 4. Required environment variables

| Variable | HTTPS preview | Future production | Requirement |
| --- | --- | --- | --- |
| NODE_ENV | production | production | Production runtime/build; do not run next dev publicly |
| APP_URL | Exact assigned preview HTTPS origin | `https://shalombalitour.com` | Exact POST Origin allowlist; no trailing path/query/user credentials |
| PUBLIC_SITE_URL | Same preview origin | `https://shalombalitour.com` | Canonical/OG/sitemap base; keep identical to APP_URL in this topology |
| WORDPRESS_SITE_URL | Existing staging HTTPS origin | `https://cms.shalombalitour.com` | CMS origin and image allowlist; never browser secret |
| WORDPRESS_API_URL | Staging origin + `/wp-json/shalom/v1` | `https://cms.shalombalitour.com/wp-json/shalom/v1` | Same origin as WordPress Site URL; no redirecting alias |
| SESSION_ENCRYPTION_KEY | Private random32bytes,64hex | Separate private production key | Server secret only; stable across instances/releases; rotation signs customers out |
| ALLOW_INDEXING | **false** | false until approved cutover, then **true** + rebuild | Explicit, case-sensitive; preview preflight refuses true |
| PORT | Host-assigned, or3000 | Host-assigned, or3000 | Runtime host setting, not browser configuration |
| AUDIT_FRONTEND_URL | Optional audit-process override | Audit only | Not an app requirement; no credentials/query/hash in audit target |

No WordPress DB credentials, admin login, application password, JWT secret, SMS provider or customer-facing email provider is required in Next. No `NEXT_PUBLIC_*` variable is currently needed. Keep one production release's config consistent across every process. Image remotePatterns and static robots/sitemap are built with environment settings; rebuild when backend image origin, public origin or indexing changes. Do not promote an old staging build and only change runtime env.

Example templates contain no secrets and are not deployed configuration. Current local config now explicitly states localhost canonical/indexing policy rather than relying on defaults. Hosted preview values are still unassigned.

## 5. Preferred production topology — preparation only

`Browser → https://shalombalitour.com (Next) → HTTPS server-to-server → https://cms.shalombalitour.com/wp-json/shalom/v1 (WordPress)`.

WordPress/admin remains at CMS. Before moving it, capture actual production `home`/`siteurl`, uploads settings, salts, database/files, plugins, routing/TLS and cron configuration. The workspace/staging configuration cannot establish existing production values. Retain native IDs, taxonomies, attachment relationships, user IDs, usermeta, inquiry records, comments/review ownership and passwords; do not import staging fixtures or replace production users with staging IDs.

For the preferred separate CMS-host topology, plan WordPress Address and Site Address on the CMS HTTPS origin after a reviewed migration. Do **not** set WP_HOME to the Next root as a shortcut: native portal URLs and same-origin checks derive from home_url. If the installation actually lives in a subdirectory, resolve those exact paths with the host first; the provided templates assume root installation. WordPress documents these URL roles and migration considerations in its [migration handbook](https://developer.wordpress.org/advanced-administration/upgrade/migrating/).

Use a backed-up, serialized-data-aware URL migration with a dry run. Review scope/affected tables; avoid blind SQL replacement, user IDs and GUID rewriting. Verify upload URLs resolve directly on CMS: the Next adapter rejects canonical card images from a different origin. Review custom upload/CDN settings, attachment URLs, static source icon paths, terms/privacy links, native portal/admin URLs, custom rewrite rules and Elementor's supported URL tools. Do not edit Elementor content or remove its plugin as part of this preparation. Re-save permalinks/purge cache only as needed during the separately approved move. If CMS is behind TLS termination, its trusted proxy must make WordPress `is_ssl()` accurate; never trust an arbitrary external forwarded header.

**CORS/trusted origins:** customer browser calls only same-origin Next `/api/customer/*`; Next sends a fixed server-side request to WordPress and does not forward arbitrary browser Origin, Cookie or Authorization headers. No new browser-to-CMS CORS allowlist is required. Keep native WordPress origin/nonce protections; do not add wildcard credentialed CORS or a broad allowedOrigins exception. If a future feature changes this request path, review it separately. Default WP CORS implementation is documented [here](https://developer.wordpress.org/reference/functions/rest_send_cors_headers/); CORS is not server-to-server authentication.

**Cookie/session:** browser receives only host-only `shalom_customer`, HttpOnly, SameSite=Lax, Path=/ and Secure when APP_URL is HTTPS, with a12-hour maximum envelope. No Domain attribute is set; do not share it across `.shalombalitour.com`. The sealed value contains the native logged-in cookie/REST nonce; these never appear in browser JSON. WordPress validates its own session/permissions and every private action. Logout revokes the native session before clearing Next's envelope. Keep the stable encryption key and WordPress salts; moving WordPress URLs may change native cookie names and require re-login. This does not create a new customer.

Keep CMS REST/customer responses out of LiteSpeed/HCDN/CDN caches, including existing `^/wp-json/shalom/v1/` exclusion, and bypass cache on Next customer/private paths. Do not globally disable security or cache as a substitute. Existing anti-frame/nosniff/referrer headers remain; TLS/HSTS/proxy policy must be tested on both real hosts before enabling broad subdomain/preload policies.

## 6. HTTPS authentication/business acceptance matrix — NOT YET RUN

Use the assigned HTTPS preview with the same native staging WordPress. Record timestamp, environment/release, native user/Tour/review/inquiry IDs and redacted screenshots. The earlier successful HTTP-to-staging tests do not pass this matrix automatically.

| Step | Required HTTPS evidence |
| --- | --- |
| Phone login | User enters password directly; native ID matches the existing customer record; no duplicate user. Include international normalization/country hint and clean failure feedback |
| Cookie/origin | Secure/HttpOnly/Lax/host-only cookie; invalid/missing/foreign Origin writes403; no native credentials in browser JSON or logs |
| Book Now | Guest gate retains intended Tour; authenticated inquiry uses that same ID/customer; retry does not duplicate ticket/inquiry. Keep WhatsApp continuation unopened |
| Account | Prior completed Tours and inquiries still belong to the same native ID; own submitted reviews available; private responses no-store |
| Eligible review | A designated disposable eligible completed Tour shows can_review=true with no submission |
| Submit | Label as staging validation; same new review Pending in WP/private Account; can_review=false immediately |
| Pending privacy | Ordinary public Tour, its Reviews endpoint and latest-reviews exclude the Pending review; unauthorized customer cannot read another owner's private review |
| Duplicate | A stale eligible form/second POST is rejected by server; only one native review/customer/Tour |
| Approval | WordPress approves same review ID; Account Approved/can_review=false; ordinary public score/count and modal update, with masked identity |
| Logout | Native session revoked, cookie removed, private API401, protected Account guest; repeat via new tab/back navigation |
| Request Help | Approved phone-based support notice works; no reset key, wp-login redirect, SMS or email flow added |
| Register | Only after outbound capture/control is active: one synthetic phone/customer, consent/type/password-confirmation rules preserved, normalized duplicate rejected, expected eligibility and login intent |
| Cache/load | Test real CDN/proxy behavior and agreed concurrent customer volume without rate-limit bypass or messages |

**Cutover capacity gate:** current native headless login/register/Request Help limits are10 attempts per action per900seconds using WordPress REMOTE_ADDR. Other headless writes use40 per action/window. With a shared Next egress IP this bucket is shared across customers. Production expected volume has not been accepted against that limit. Resolve/approve the capacity policy before cutover; do not simply disable throttling or start trusting arbitrary X-Forwarded-For. Any backend fix requires its own reviewed version/package and staging validation; phone identity architecture stays intact.

## 7. Email/registration status and controlled testing

Actual code: native Registration calls `wp_new_user_notification(id, null, 'admin')` after creating the phone customer. It uses an opaque username and `@customers.invalid` internal placeholder email. There is no required customer welcome email, email-login form or email-based phone recovery. Request Help deliberately creates no reset key and sends no mail/SMS. Booking returns a validated WhatsApp link, without sending a message. Review submission uses native comment insertion and no direct plugin wp_mail call; unrelated core/plugin hooks may still notify, so block/control **all** preview WordPress outbound mail.

The admin notification behavior is supported by [WordPress core documentation](https://developer.wordpress.org/reference/functions/wp_new_user_notification/). Native admin/operations mail remains an operational requirement to decide and test; adding email-first customer identity is outside scope.

Existing local WordPress tests intercept wp_mail before transport. That proves code execution without real delivery; it does not prove inbox delivery. This phase made no staging registration and no SMTP/delivery test, since a controlled preview sink/recipient has not been configured or supplied. No real customer address was requested or contacted.

Before HTTPS registration: configure a staging-only mail sink or approved transport that rewrites/allowlists **all recipients** (To/CC/BCC/admin/cron/plugin mail) to one controlled test inbox. Deny other outbound destinations at transport/egress where possible. Keep credentials in the WordPress host secret configuration, outside Next and source control; use a distinct staging sender. Prove the guard with a synthetic test before enabling registration. Then register once, verify the one admin notification at the controlled sink, one customer identity/no duplicate and successful native phone login. Record delivery/header/bounce results without exposing passwords/reset keys. If using a capture-only sink, mark real delivery unverified. No production mail setting change is authorized by this report.

## 8. SEO status

All eight pages have title/description and exactly one H1. Four public pages have distinct titles/descriptions, exact frontend canonical URLs and Open Graph title/description/url/type/siteName. Home's canonical may serialize without a trailing slash; normalized URL comparison passes. Current auth pages use the generic inherited description and remain noindex; this is not a missing public landing-page description.

Current preview: noindex/nofollow for all pages and robots disallow-all. Login/Register/Request Help/Account/booking remain noindex even after public indexing is enabled. A unit regression verifies true/false public flags, private invariants, robots exclusions and a sitemap containing only Home/Ubud/South Kuta/West Bali at the future canonical origin. This is configuration coverage, not a deployed production crawl.

At approved cutover only: set final APP_URL/PUBLIC_SITE_URL, ALLOW_INDEXING=true and rebuild; verify actual HTML/HTTP headers, robots.txt and sitemap.xml at the root domain. Do not carry a hosting-level preview X-Robots-Tag/noindex rule into public production. Preserve private exclusions. The CMS site's public HTML needs an indexing/duplicate-content policy while keeping wp-admin/REST accessible. Audit old URLs and approve explicit301 mappings (including old portal aliases); avoid a blanket redirect that hides404s or breaks REST.

Missing optional share enhancement: no explicit og:image or social-card image is currently emitted. Owner should select an approved existing image before launch if rich previews are required; none was fabricated. Native attachment alt metadata is empty, with the frontend title fallback as noted. No claim of Search Console, Lighthouse/Core Web Vitals, structured data or production ranking verification is made. Invalid streamed booking targets can return HTTP200 with the not-found UI/noindex under the installed Next behavior; normal absent Tour-detail routes return404.

## 9. Exact production deployment procedure — FUTURE, NOT EXECUTED

1. Obtain owner approval of content/prices/contact/legal pages and the HTTPS acceptance matrix. Resolve the shared-egress throttle/capacity gate. Approve the hosting provider, both hostnames/TLS, release artifact/hash, DNS/traffic window and rollback owner. Keep SCF/Elementor and native fallback.
2. Record actual production baseline: DNS records/TTL, reverse-proxy routes, WordPress home/siteurl/uploads values, salts, plugin/version inventory and DB/files. Make verified recoverable backups and rehearse restore. Use the **existing production DB** as authority. No staging user/review/ID import or blind DB overwrite.
3. Prepare CMS hosting/certificate and a reviewed WordPress URL move independently of root traffic. Test its admin/REST/media/legal routes and existing identity relationships. Deploy the approved backend package only under explicit production approval, with rollback archive; keep caches excluding Shalom/private routes. Do not apply the staging backfill manifest to production without mapping its actual IDs and previewing changes.
4. Prepare immutable Next release on the production runtime with future production env, distinct stable private key and indexing false. Run locked install/env checks/tests/TypeScript/build. Use the approved proxy/managed runtime; private APIs never enter CDN caches. Verify the root Host/TLS routing through the provider's pre-cutover test mechanism; do not weaken origin checks to make it pass.
5. Establish an explicit brief write/content maintenance window if needed for the WordPress move. Preserve the latest customers/inquiries/reviews; verify counts/IDs and backups immediately before traffic changes. Avoid simultaneous writable cloned databases.
6. After explicit final go-ahead, set ALLOW_INDEXING=true in the final release env, run `npm run check:env -- --production` and rebuild with final canonical/media origins. This production configuration gate requires HTTPS, NODE_ENV=production and explicit public indexing; it performs no deployment or setting mutation. Do not use the preview-only `--https` gate, which deliberately requires false. Validate resulting four public index tags, private noindex, sitemap/robots and absence of synthetic fixtures.
7. Change only the approved root routing/DNS to Next; keep CMS routes and certificates intact. Preserve existing MX/mail records. Apply the approved www/root canonical redirect and explicit old-path redirects; do not route `/wp-json` to an empty static frontend. Purge only affected caches if required.
8. Immediately smoke-test root and CMS TLS, public pages/assets/canonicals, real phone login/same ID, protected Account, controlled inquiry/review lifecycle, logout and Request Help under the agreed notification policy. Verify no mixed content, origin failures, public Pending data or cached private responses. Monitor error rates/429s and server resources against agreed launch thresholds.
9. Keep the old WordPress renderer and previous Next release recoverable through the acceptance window. A subsequent Elementor/SCF cleanup, authentication redesign or email feature is a separately approved phase.

## 10. Rollback procedure

Rollback triggers include broken TLS/origin/session flow, identity/inquiry mismatch, public Pending/private-data exposure, widespread5xx/429s, unusable public layouts or owner-rejected content/pricing. Incident owner decides and records the trigger/time.

**Frontend-release rollback:** if the CMS remains correct, route the root to the previous validated Next release using its matching env/build. Preserve the production encryption key if compatible; do not mix old `.next` output with new static assets. Keep authoritative WordPress data, IDs, salts and current transactions. Verify account/book/review/privacy after rollback.

**Root-renderer/WordPress-move rollback:** retain an agreed legacy origin/TLS path in advance. If returning the root to native WordPress requires reversing its home/siteurl or media migration, restore those **recorded configuration values and reviewed URL transformations** together with routing, rather than pointing DNS at an origin that immediately redirects back to CMS. Use the maintenance window and original proxy/DNS values/TTL; re-save rewrites/purge affected cache only if necessary. Confirm native legacy login/pages, same current customer DB and latest inquiries/reviews. Native cookie-name/domain changes may require re-login.

Do not restore an old entire DB snapshot automatically: that would discard post-cutover registrations/inquiries/reviews. If data restoration is truly required, stop writes, preserve a fresh snapshot and reconcile new transactions under explicit approval. Never empty Trash or delete customers/reviews as an automatic rollback. Confirm public masking/Pending exclusion and private-cache protections before reopening. Keep indexing consistent with the renderer/canonical domain and record the next acceptance plan.

## Final gate

**READY FOR HTTPS PREVIEW**, with content decisions and the HTTPS/controlled-email/capacity acceptance work above outstanding. **Not READY FOR PRODUCTION CUTOVER.** No production/DNS/plugin-removal action was performed. Stop here for confirmation before provisioning/deploying the real HTTPS preview or any production change.
