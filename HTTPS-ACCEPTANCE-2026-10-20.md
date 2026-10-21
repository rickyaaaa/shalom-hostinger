# Shalom HTTPS Preview acceptance — 20 October 2026 (Asia/Jakarta)

**Classification: NOT READY FOR PRODUCTION CUTOVER.**

The isolated Next.js HTTPS Preview is Ready and its authenticated staging flow has been exercised. The application runs in Vercel **Preview**, with the existing staging WordPress backend. Production traffic, Shalom production domains, DNS, Elementor and SCF were not changed. No application was promoted to Production.

Remaining acceptance gaps are customer-visible inquiry history, complete keyboard/mobile/browser QA, owner content decisions and an agreed capacity/abuse policy. No production cutover is authorized by this report. Previous local/browser checks in `PRE-PRODUCTION-BASELINE-2026-10-19.md` remain historical evidence rather than fresh hosted acceptance.

## 1. Live environment and release identity

| Item | Verified result |
| --- | --- |
| Application URL | https://shalom-nextjs-preview-h94ftje87-rickyaaaas-projects.vercel.app |
| Vercel inspector | https://vercel.com/rickyaaaas-projects/shalom-nextjs-preview/EEArU9YQQrDEwaCFDgLwPueTMaPt |
| Application deployment | `dpl_EEArU9YQQrDEwaCFDgLwPueTMaPt`; Ready; dashboard environment **Preview**; API legacy target is `null`, not `production` |
| Isolated project | `shalom-nextjs-preview`, `prj_itkVxGhG7b69Zh3qMQUJh7juh5D1` |
| Team | `rickyaaaas-projects` / rickyaaaa's projects; only available team; initially zero projects, so no unrelated project was reused |
| WordPress staging | https://slategray-goshawk-210407.hostingersite.com |
| Staging API / signing audience | https://slategray-goshawk-210407.hostingersite.com/wp-json/shalom/v1 |
| Hosted runtime/build | Node 24.21.0; Next 16.4.2; React 19.3.1; production Next build, Node Route Handlers and native image optimizer; no static export |
| Hosted build checks | Environment preflight, **21/21 tests**, `next build`, TypeScript passed |
| Deployment protection | Vercel Authentication retained; authenticated browser and `vercel curl` used; protection not disabled |
| WordPress release | 1.13.1 installed and active on staging |

The Vercel deployment ID identifies the actual hosted release. Historical local build ID `N2yxV3WdjvIefgl47jiYS` is not represented as the hosted build ID.

## 2. Six owner-required isolation checks

| Requirement | Evidence / result |
| --- | --- |
| One empty bootstrap, Production label, isolated project only | **PASS.** `dpl_5mK3bjj3dHqRSmxhPmAcDT1SKKdw`, Ready, target `production`, exact project ID above; only one Ready Production deployment |
| Bootstrap has no custom/Shalom production domain | **PASS.** Exactly `public/index.html`, `public/robots.txt`, `vercel.json`, 792 bytes; deployed with `--prod --skip-domain`. Live HTTP 200, noindex and no-store; no app/API/key/customer data. Current active alias inventory is empty |
| Actual application is Preview | **PASS.** Dashboard Preview, guarded build requires `VERCEL_ENV=preview` and the dedicated project ID; actual app Ready. No subsequent application deployment was Production |
| Application variables only in Preview | **PASS.** Seven variable records, each target exactly `[preview]`; no Production variable records |
| `ALLOW_INDEXING=false` | **PASS.** Specific non-secret variable readback is false; build preflight passed; live noindex headers and robots disallow verified |
| No production DNS/domain changes | **PASS within performed operations.** No DNS/custom-domain/production-domain mutations were issued. Isolated project domain inventory is unchanged before/after bootstrap; only reserved `shalom-nextjs-preview.vercel.app` exists. No Shalom production domain was attached |

Bootstrap URL: https://shalom-nextjs-preview-j78wrc6nm-rickyaaaas-projects.vercel.app . Vercel created a generated bootstrap alias despite `--skip-domain`; only that newly created alias was removed. Current `/v4/aliases` inventory is authoritative: zero active aliases. The bootstrap deployment's historical alias array may retain the deleted entry. The provider-reserved default project domain is not a Shalom production/custom domain and was not newly attached to customer application traffic.

Audit history is retained: first application request explicitly targeted Preview, but Vercel classified the new project's first deployment Production. Its guard failed before the Next application build (`dpl_AXSAP3dbM6KEj1bo5FagmjqxxhAA`, Error, no assigned alias). The owner then authorized exactly one empty bootstrap exception. A subsequent Preview build failed because `NODE_ENV=production` omitted dev build dependencies; `npm ci --include=dev` fixed this. Final application deployment is the Ready Preview listed above. There is no additional bootstrap or Ready Production application.

Final connector reads returned a scoped 403. The same authorized, explicitly scoped Vercel CLI credentials completed read-only checks; no reconnection, protection relaxation or credential change was needed. `vercel-final-safety-evidence.json` contains filtered metadata only. An initial assertion compared encrypted ciphertext with `false`; this test error was corrected by reading only the decrypted, non-secret indexing variable. No environment value was changed by that correction.

## 3. Environment and safe staging signing configuration

| Variable | Placement / value |
| --- | --- |
| `NODE_ENV` | Preview only: `production` |
| `ALLOW_INDEXING` | Preview only: `false` |
| `HEADLESS_RATE_LIMIT_MODE` | Preview only: `signed` |
| `WORDPRESS_SITE_URL` / `WORDPRESS_API_URL` | Preview only: staging URLs in section 1 |
| `SESSION_ENCRYPTION_KEY` | Preview-only sensitive Secret; independent random 32-byte hex; value omitted |
| `SHALOM_HEADLESS_SIGNING_KEY` | Separate Preview-only sensitive Secret; matches staging server constant; value omitted |
| `APP_URL` / `PUBLIC_SITE_URL` | Both derive from guarded platform `VERCEL_URL` and equal the actual application HTTPS origin; only these public origins are embedded by Next config |

Staging signing was installed through the existing authenticated hPanel File Manager after identifying/reporting the exact method. Only two constants were inserted into:

`/home/u433850416/domains/slategray-goshawk-210407.hostingersite.com/public_html/wp-config.php`

- `SHALOM_HEADLESS_SIGNING_KEY`: matching Preview signing key, never printed.
- `SHALOM_HEADLESS_AUDIENCE`: exact staging API URL in section 1.

Original file bytes were preserved apart from this insertion; PHP lint passed. No database password, WordPress salts, production configuration or unrelated credential was changed. The original config and recovery keys are Windows DPAPI encrypted outside the repository/deployment source. Plaintext download/prepared config copies were removed after verification. HTTPS GET of staging `/wp-config.php` returned zero bytes, without source/key disclosure.

Secrets were supplied through stdin, not CLI arguments, source, plugin ZIPs, browser JSON or logs. The upload excludes `.env.local`, local databases, admin credentials and customer evidence. Eleven actual hosted JS/CSS assets were scanned against both real Preview secrets: **zero matches**. This is a targeted client exposure check, not an exhaustive independent security audit.

## 4. Live HTTPS acceptance matrix

| Boundary / user action | Actual result |
| --- | --- |
| HTTPS routes, metadata and images | Home, login, Request Help, robots and sitemap HTTP 200; global noindex headers; robots disallows `/`; sitemap uses actual Preview origin with no localhost; native `/_next/image` HTTP 200 image/jpeg |
| Guest Account protection | Account intentionally serves a 200 client shell; guest UI shows Log In/Create Account only; `/api/customer/me` returns 401 and no-store. An initial redirect expectation was corrected; a 200 shell is not exposure of private data |
| Login Origin checks | Foreign Origin 403; same-origin invalid form 400; auth/origin rules unchanged |
| Controlled registration | Exactly **one** native synthetic customer created: **ID 8**, `HTTPS Preview QA 20261020`, subscriber/existing_customer; terms recorded; country United Kingdom |
| Phone validation and duplicates | First invalid reserved fixture phone rejected before user creation; library validation was not weakened. Valid fixture then created ID 8. Formatted duplicate rejected 400; native matching account count remains exactly one |
| Native phone/password login | Login and registration both resolve the same ID 8; no email login requirement or duplicate identity created |
| Private session | Secure, HttpOnly, SameSite=Lax, host-only, Path=/; native session material absent from browser JSON; private API no-store |
| Guest Book Now | Tour **523** redirects to login with intended Tour preserved; successful login returns to `/book/523` |
| Availability/inquiry | One synthetic Tour 523 inquiry recorded and verified in native admin customer history; WhatsApp continuation rendered but **never opened or sent** |
| Account completed Tours / own reviews | Tour 523 assigned completed only to ID 8 using existing admin flow; Account displays completed Tour and own review status |
| Account inquiry history | **GAP.** Native admin inquiry exists, but current customer Account UI/DTO has no inquiry-history section. Do not call this requirement passed |
| Eligible review submission | Exactly one review **ID 7**, Tour 523, clearly labelled staging synthetic; ratings 9/9/9; first status Pending |
| Pending exclusion / duplicates | Private Pending visible, `can_review=false`; public score remains 8.0/count 1 and new marker excluded; second submission rejected 400; no duplicate created |
| Admin approval / public refresh | Same original ID 7 approved through native admin. Account Approved, `can_review=false`; Next and WordPress summaries become **8.5/count 2**; card/modal show same result and staging-only marker |
| Request Help | Existing support-only behavior retained; no password reset/SMS claim and no recovery message sent |
| Logout / native revocation | Logout 200, customer cookie cleared; guest me 401; replay of old native session rejected 403. Final CLI session also logged out and UI returned to login; private test cookie files removed |

Digit-only input detected United Kingdom in the live login form without manually entering `+`. The browser redacts the literal phone textbox value, so a DOM string comparison cannot prove the visual plus prefix; that check remains inconclusive rather than a confirmed input bug. No extra login/registration was submitted for this observation.

## 5. Mail capture and staging-only fixtures

Before registration, the staging-only MU helper was uploaded to:

`/home/u433850416/domains/slategray-goshawk-210407.hostingersite.com/public_html/wp-content/mu-plugins/shalom-preview-mail-capture.php`

It runs only on the exact staging host and intercepts native `wp_mail` at `pre_wp_mail` before PHPMailer, including To/CC/BCC and admin notifications. A self-test captured one each To/CC/BCC with **PHPMailer initialization count zero**, before creating the account. The native synthetic registration admin notification was then captured. Final capture count is two (probe + notification), matching native synthetic account count one / ID 8.

The metadata sink is outside `public_html`, permissions 0600:
`/home/u433850416/domains/slategray-goshawk-210407.hostingersite.com/.shalom-preview-mail-capture.jsonl`.
It stores counts and subject/body hashes, not recipient addresses, bodies, passwords or reset keys. The admin-only Tools page is capability/nonce protected.

**The capture remains active on staging and blocks all native WordPress outgoing mail there.** It is not an operating-system egress firewall for arbitrary direct SMTP/mail code; real inbox/provider delivery was not tested. Production mail settings were not changed.

Customer ID 8, its completed Tour/inquiry and review ID 7 remain labelled synthetic in staging for reproducible review. Historical synthetic review ID 6 also remains staging-only. Neither may become a real production testimonial; exclude all synthetic accounts/inquiries/reviews in any future migration. No real customer identity, password or entitlement was changed.

## 6. Signed rate limiting and its limits

Next signs POSTs using protocol/method/configured audience/REST route/timestamp/nonce/client pseudonym/exact-body digest. WordPress validates HMAC in constant time, ±60-second freshness and single-use nonces before using the pseudonym. Arbitrary forwarded IP headers are not trusted.

Live staging verification: valid proof reached input validation (400), replay and invalid HMAC rejected (403); ten accepted client attempts followed by 429, while another signed client remained allowed. Direct `/wp-config.php` remained empty. Through the **actual Next HTTPS Route Handler → staging WordPress** path, browser-client A received ten 200 support-only responses then 429; new client B received 200 afterward. Synthetic invalid probe input prevented native customer/recovery contact.

Anonymous limits are 10/action/900 seconds per verified client (or direct-IP fallback), plus an independent normalized target/native account bucket across phone aliases. Authenticated writes use 40/native user/action/window. Atomic conditional DB updates and `INSERT IGNORE` avoid counter/nonce overwrite races. Local 16-worker concurrency yielded ten accepted/six denied.

Prior local suites: 34 PHP signature/rate checks, 28 adapter checks, 23 phone/auth checks and 34 migration checks passed; these are local evidence, separate from hosted acceptance. Current hosted Next suite: 21/21.

Residual limits: cookie deletion creates another pseudonym; the target bucket still applies. Fixed windows allow boundary bursts; deliberate target exhaustion can affect account availability; distributed requests across many targets require platform ingress controls. Two hosted clients and a local concurrency test do not constitute production capacity acceptance or DDoS protection. Agree traffic volume/thresholds before cutover.

Scoped source-backed threat model:
`C:/Users/USER/.codex/state/plugins/codex-security/scans/headless-shalom/artifacts-35834721f960674fc7066a5bae50b25e9b631a225fd2f9bf4067de1bc9879d30/hardening/https-preview-rate-limit-threatmodel.md`

SHA-256: `7979c06264ed902271fed580bb30567da10b3aa4b6b6c69557ccf5fcc2ee12a9`. This was a sequential scoped review, not a full independent security scan.

## 7. Browser/accessibility/responsive scope

The actual desktop in-app browser viewport was 1280×720. Desktop had no horizontal overflow; Book Now stayed on one line. Reviews opened in the native modal dialog, initially focused Close; Shift+Tab stayed inside; Escape closed and restored focus to Reviews.

Forward Tab returned active BODY outside the dialog while the modal remained open. The available DOM API could not distinguish browser-chrome focus from an in-page escape, so **complete modal keyboard containment is unresolved**, not passed. Recheck keyboard-only behavior in real browsers before deciding whether code needs a fix.

The viewport capability request for 390×844 did not change actual `innerWidth`/`innerHeight` (still 1280×720); it was reset and the temporary tab closed. This does **not** count as valid mobile emulation. Physical iOS Safari, Android Chrome, other desktop browser coverage, 200% zoom, mobile menu/input zoom and narrow-width CTA QA remain unverified in this session. Prior baseline captures are not substitutes.

## 8. Changed files and release artifacts

WordPress 1.13.1: plugin version/bootstrap, new `includes/class-headless-rate-limit.php`, and the customer REST dispatch rate-limit integration. Native phone/password identity, review ownership/moderation and booking rules remain authoritative.

Next server rate transport/preflight/tests plus Preview deployment files were added/updated. Final Preview-specific changes:

- `scripts/vercel-preview-origin.ts`: exact project/Preview/hostname guards and matching public origins.
- `scripts/vercel-preview-build.ts`: noindex guard → environment preflight → tests → production build → TypeScript.
- `tests/vercel-preview-origin.test.ts`: correct origin plus wrong project/production/host rejection.
- `next.config.ts`: embeds only the two guarded public origins.
- `deploy/vercel.preview.json`: Next preset, region sin1, noindex header and `npm ci --include=dev`.
- `deploy/HTTPS-PREVIEW.md` and this report: updated operational status and remaining acceptance work.

The staging `wp-config.php` insertion and temporary mail-capture helper are server operations outside the versioned customer plugin. No frontend redesign, Tour price/content change, SCF/Elementor modification or unrelated project overwrite was performed.

| Artifact | Integrity |
| --- | --- |
| `../dist/shalom-next-https-preview-2026-10-20.zip` | 84 files; 746,442 bytes; SHA-256 `152664f7400a93644a675219b94fd7831d6dc3305f1d7295d219cd07386f7a9b` |
| `../dist/shalom-customer-portal-1.13.1.zip` | 1,627 files; 3,999,993 bytes; SHA-256 `e12bb7ad6ad4ee0c7b42e57d791227461780f69e82077ad4a2716ff18747f3d2` |
| Historical 19 October Next snapshot | 81 files; 744,268 bytes; SHA-256 `b09b8609143f1a6ac8550fd259ff77871df527e7f057e23ac2c56bc2859c7a31`; superseded source snapshot, not the final deployed revision |

The 20 October ZIP was verified entry-by-entry against the final 84-file upload workspace. It preserves the runbook bytes as originally deployed; use this report and the current repository runbook for current status. It contains no live environment file, session jar, WordPress config, admin credential or customer evidence. `deployed-source-manifest-2026-10-20.json` records each file SHA-256. Current documentation updates do not require redeploying the unchanged runtime.

## 9. Evidence and outstanding decisions

Filtered JSON evidence is under:
`D:/Ricksite Studio/custom plugin/login arena shalom tour/https-preview-work/`

- `vercel-final-safety-evidence.json`, `bootstrap-https-safety.json`, `bootstrap-dry-run.json`.
- `hosted-preview-https-checks.json` (initial pre-auth pass; its pending-auth note is historical), `hosted-client-secret-scan.json`.
- `staging-signing-installed-checks.json`, `staging-mail-capture-probe.json`, `staging-mail-final-state.json`.
- `https-auth-registration-results.json`, `https-booking-ui-evidence.json`, `https-review-pending.json`, `https-review-approved.json`.
- `https-rate-clients-results.json`, `https-final-logout.json`, `https-modal-keyboard.json`, `https-phone-plus-ui.json`.
- `final-source-artifact.json`, `deployed-source-manifest-2026-10-20.json`.

Screenshots in `C:/Users/USER/.codex/visualizations/2026/10/09/01a12032-c31a-79d2-9249-25ee00e33ecd/`:
`shalom-vercel-preview-ready-2026-10-20.jpg`, `shalom-https-pending-review7-2026-10-20.jpg`, `shalom-https-approved-review7-2026-10-20.jpg`, `shalom-https-logged-out-2026-10-20.jpg`, `shalom-staging-1.13.1-update.jpg`.

Before production readiness:

1. Resolve the missing customer Account inquiry-history requirement; confirm UI/API behavior and rerun that slice of acceptance.
2. Complete physical/mobile/cross-browser, zoom and keyboard dialog validation; fix confirmed failures and retest them.
3. Obtain owner decisions for incomplete price notes on Tours **633/655**, unmatched parenthesis on **580**, and time/timezone wording on **644**. No prices were invented or edited.
4. Agree expected volume/abuse thresholds and run bounded capacity acceptance. Retain signed transport and native authorization.
5. Define exclusion/cleanup of synthetic staging records and deliberate mail transport configuration for any future real release. Staging capture is currently active.
6. Review production configuration/migration/rollback separately and obtain explicit cutover approval. Current bootstrap exception is exhausted and authorizes no further Production deployment, domain, DNS, production secret or traffic change.

Rollback artifacts and encrypted pre-change staging config are retained. Do not restore the whole database or remove the signing config while signed Preview remains active without coordinated rollback. Preview can remain protected and unpromoted for review.

**Final classification: NOT READY FOR PRODUCTION CUTOVER. HTTPS Preview is available for review; no cutover performed.**
