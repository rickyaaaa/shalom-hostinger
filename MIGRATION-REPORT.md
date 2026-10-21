# Full frontend migration — 19 October 2026

Status: implementation, functional checks and documentation verification complete; the visual reviewer scored all five requested corrections resolved (`ship`, verdict-pass scope). Next runs at `http://127.0.0.1:3000` against the real staging WordPress backend. This is not a production deployment or a publicly hosted Next staging deployment.

## 1. Pages migrated

`/`, `/ubud`, `/south-kuta`, `/west-bali`, `/login`, `/register`, `/request-help`, `/account`. Transactional `/book/[id]` supports every published canonical Tour and `/book/custom`. `/forgot-password` preserves old links with an intent-preserving redirect to Request Help. There is no customer `/tour/[slug]` route.

Home starts with Explore Bali Your Way and original area imagery, without a large hero. All approved Home sections/anchors are present. Canonical API collections render 7 Ubud, 6 South Kuta and 4 West Bali cards. No runtime Tour data comes from Elementor or a hardcoded frontend dataset.

## 2. Architecture and components

Server-rendered public Home/AreaPage/TourCard/HomeInformation use structured, validated WordPress DTOs. AreaPage and TourCard serve all three areas. Header uses reusable MobileMenu and AccountHeaderAction; CustomerSession shares one fresh private account read per route rather than independent Header/Account/Booking requests. ReviewEntry/ReviewScore/ReviewModal are reused across public review surfaces; AuthForm, PhoneInput, Request Help and CustomerAccount retain the established flows. ReviewForm and ReviewStatus now work per native Tour. Booking intent helpers allow only a positive Tour ID or custom intent, never arbitrary redirect URLs.

Public reads use React request memoization and no-store fetches, so approval/rating changes are fresh. Marketing composition stays server-side. Native forms/menu/modal/session state are the client boundaries. Images use Next optimized rendering, original WordPress assets, reserved aspect ratios and local Raleway fonts. No performance-score claim is made; no Lighthouse run was performed.

New implementation files include AreaPage, HomeInformation, MobileMenu, AccountHeaderAction, CustomerSession, `lib/marketing.ts`, `lib/booking-intent.ts`, `lib/seo.ts`, South Kuta/West Bali/Request Help/dynamic-booking routes, robots/sitemap and the read-only migration checker. Existing Home/Ubud/AuthForm/CustomerAccount/TourCard/ReviewEntry/Header/public and private adapters were extended. Backend changes are limited to `includes/rest-customer.php`, version/bootstrap and new admin-only `includes/class-tour-backfill.php`; native business handlers are unchanged. Offline extraction/manifests, the new real-WP migration test and this documentation are separate from runtime/frontend content.

## 3. WordPress endpoints consumed

| Endpoint | Purpose |
| --- | --- |
| GET `/shalom/v1/tours?area=…&per_page=50&page=…` | Canonical area collections, pagination and ratings |
| GET `/shalom/v1/tours/{id}` | Validate transactional booking target/title |
| GET `/shalom/v1/tours/{id}/reviews?page=…` | Approved-only structured modal reviews |
| GET `/shalom/v1/latest-reviews?limit=3` | Newest approved reviews across all Tours |
| GET `/shalom/v1/customer/config` | Existing registration availability/legal URLs |
| POST `/shalom/v1/customer/login`, `/register`, `/forgot-password` | Existing phone handlers; support-only recovery |
| GET `/shalom/v1/customer/me` | Private native identity/completions/own submitted reviews |
| POST `/shalom/v1/customer/logout` | Native session revocation |
| POST `/shalom/v1/customer/booking-ticket`, `/inquiries` | Native Tour/custom ticket and inquiry continuation |
| POST `/shalom/v1/customer/reviews` | Native eligibility, one-review rule and Pending moderation |

Browser calls stay on the same-origin Next BFF. WordPress cookies/nonce are sealed server-side in encrypted HttpOnly SameSite cookies; browser JSON receives no native credential. Every private response is no-store. Existing LiteSpeed Shalom REST exclusions remain in effect.

## 4. Content still hardcoded

Faithfully transcribed static Home/area introductory copy, area descriptions, Customized Tour prose/benefits, Why Choose Us copy, seven FAQ questions/answers, About prose, source imagery choices, navigation and footer labels/contact numbers. Main sources: `src/lib/marketing.ts`, `src/app/page.tsx`, `src/components/HomeInformation.tsx`, Footer. These are candidates for later WordPress marketing fields, not Tour data substitutes. Legal documents remain linked to their existing WordPress URLs supplied by customer config.

## 5. Authentication verification

Primary customer UI is phone + password with international normalization/detected country hint, password visibility, native phone registration/customer type/consent and Request Help. No email-first form/selector was introduced. The native Auth, Registration, Booking, Reviews and helper files are byte-identical to the approved 1.12.2 ZIP.

**Real staging:** phone login returned WordPress customer ID **7**, matching the existing native Ricky customer record. Completed Tour 523 and the two older inquiries dated 18 October remained attached. Guest Account exposes no private data. Logout revoked access; `/api/customer/me` returned “Please sign in.” Invalid phone credentials produced a clean error. Tour 523 and custom booking intents survived the guest gate and registration links. Request Help returned the approved support notice without SMS/email/reset-key behavior.

The first preview attempt failed the origin check because APP_URL still named localhost while the browser used 127.0.0.1. Correcting APP_URL restored login; origin validation remained enabled. Credentials were resubmitted from the user-filled form without reading the password.

**Local actual WordPress + Next HTTP:** native phone registration creates one subscriber customer with the expected metadata; normalized duplicate registration is rejected. All local outbound mail is intercepted. Real staging registration was deliberately not submitted because its unchanged handler sends an admin email and automated real email is prohibited. Outbound email/SMS delivery is unverified.

## 6. Booking verification

**Real staging:** customer 7 submitted one deliberate Tour 523 inquiry at **2026-10-19 06:50:35 UTC**, plus one custom inquiry at **06:53:20 UTC**. Both appear alongside the original inquiries on the same native customer record. The native configured wa.me continuation was displayed but never opened/sent. Guest Book Now returned to `/login?tour=523`; custom gate retained `?booking=custom` through registration.

**Local:** Tour/custom tickets bind customer/kind/Tour, invalid or unavailable IDs and unsigned contact intents are rejected, forged tickets fail, and retries reuse the existing inquiry. Non-523 booking uses the unchanged native handler.

## 7. Review verification

**Real staging:** prior synthetic review **5** was moved to recoverable WordPress Trash; no customer testimonial was deleted. Customer 7 retained completed Tour 523 and became eligible. A new clearly labelled synthetic review **6** was submitted through Next and became Pending. Immediate private account reload included that same review with `can_review=false`. A previously eligible stale Next form attempted a duplicate and received the server error “You have already reviewed this Tour.”

While Pending, review 6 was absent from the ordinary public Tour, Reviews and latest-reviews endpoints; public Tour 523 count was 0. WordPress approval changed the same review 6 to Approved; private eligibility stayed false. Public score became **8.0 / 10, 1 review**, and it became the first Home latest review. The actual Next modal displayed the approved comment, masked name/country, dimensions/verdicts and real published date. Booking date remains unavailable rather than invented. The unrelated legacy Uluwatu review/customer remained unchanged.

## 8. Responsive testing

Measured Home and all three areas at **375, 390, 430, 768, 1270, 1440** pixels: 24 route/viewport checks, actual window width asserted. No horizontal overflow, logo/account-action overlap or non-nowrap Tour action was found. Desktop content width is 10px less where the native scrollbar occupies space. The mobile modal fits 390px, locks body scrolling, closes with Escape and restores scrolling/focus. Nested mobile itinerary order is South Kuta, Ubud, West Bali. Full-page captures start at document top and confirm every image is loaded.

## 9. SEO

Public pages have distinct titles/descriptions, frontend canonical URLs, OpenGraph metadata, semantic headings and image alternatives. Sitemap contains only Home/three areas. Auth/account/booking are noindex. Staging defaults to noindex/disallow-all; setting final PUBLIC_SITE_URL and ALLOW_INDEXING=true, followed by rebuild, makes public area pages indexable at approved cutover. Next's streamed invalid-booking not-found page may retain HTTP 200 but renders the not-found UI and noindex, as documented by the installed Next version.

## 10. Build/lint/test results

| Check | Result / scope |
| --- | --- |
| Production Next build and TypeScript | Pass |
| Frontend unit/contract tests | 10 pass |
| Existing backend regression suite | 322 pass, disposable local WordPress |
| First-party PHP syntax lint | 27 files pass |
| Customer adapter regression | 28 pass, local |
| Phone correction regression | 23 pass, local |
| New full-migration transport/backfill regression | 34 pass, real local WordPress |
| Next → WordPress HTTP regression | 30 pass, local; mail intercepted |
| SSR/SEO/public integration checks | 60 pass; local Next reading real staging public APIs |
| Unavailable-API recovery | 4 routes pass against a local production build with an intentionally unreachable API; retry preserves Ubud/South Kuta/West Bali/booking intent |
| Live staging browser flow | Phone ID7, booking/custom, Pending/duplicate/Approved/public, logout, Request Help pass |

No ESLint configuration exists in this POC; TypeScript and PHP lint are reported accurately instead of claiming an unrun JavaScript linter. Impeccable detector ran once; remaining findings are advisory token/documentation mismatches passed to independent review.

## 11. Screenshots and comparison evidence

Required captures are in `.impeccable/review/`: `migration-home-desktop.jpg`, `migration-home-mobile.jpg`, `migration-ubud-desktop.jpg`, `migration-ubud-mobile.jpg`, `migration-south-kuta-mobile.jpg`, `migration-west-bali-mobile.jpg`, `migration-login-mobile.jpg`, `migration-account-mobile.jpg`. Additional modal, menu, registration, 1270px, native Pending/admin/backfill/install and failure/recovery captures are present. Public/form/menu/modal captures were refreshed after the correction batch, with content readiness and image decoding checked; the unchanged Account retains its real authenticated staging capture taken before logout. JSON evidence separates private staging account state, approved-only public responses, native customer relationships, responsive measurements and read-only SSR checks. Source-reference captures remain under `../.reference/frontend/screenshots/` and `../.reference/migration/`.

## 12. Remaining limitations

- Next is a local production-build preview connected to staging; public HTTPS frontend hosting, production domain/cookies, CDN behavior and production traffic are untested and untouched.
- The source West Bali notes “NB: NOT INCLUDING” and “NB: NOT” are incomplete. They were preserved verbatim, without inventing inclusions. The source Ubud D destination has an unmatched parenthesis. These need owner editorial review before cutover.
- Native canonical titles/prices differ from manually typed Elementor card titles/prices. Canonical WordPress values deliberately win; all 17 stored price objects were unchanged by backfill.
- Marketing prose/images/contact labels are initially static; the fast source slideshow is represented by one original frame. About uses the source's verified Since 2016 statement rather than its ambiguous counter.
- Synthetic approved review 6 remains clearly labelled on staging. Remove/review staging fixtures before any production content import; do not treat it as a customer testimonial.
- Real outbound delivery is unverified. Registration was exercised against actual local WordPress/Next with mail interception, not submitted to staging.
- Existing backend IP throttles share the Next server egress-IP bucket. Production capacity/concurrency/load acceptance remains a deployment check; this migration does not replace those business/security rules.

## 13. Parity decision

Functional scope is implemented and the real staging journey passes, subject to the explicit staging-registration/outbound-delivery and hosting limits above. The independent full visual review identified five material corrections: centered About composition, centered icon-over-copy mobile Why units, the gold expanded FAQ, compact/custom mobile composition, and area-preserving API failure retries. All five were applied in one correction batch; the same reviewer reopened all 13 required captures and scored each **resolved**, with disposition **ship** at that verdict-pass scope. This is not a claim of a new exhaustive whole-surface audit or production approval. See [MIGRATION-FINISH-REVIEW.md](MIGRATION-FINISH-REVIEW.md).

The FAQ uses the source gold (`#c89b3c`) with readable navy text; this preserves the active field while improving its foreground contrast. No replacement imagery, redesign or second detector run was introduced. The original WordPress site remains available as fallback. Full frontend staging parity is ready for owner review; production cutover waits for explicit confirmation.

The independent documenter inspected the same 13 captures and compared the finished implementation with the incumbent design system. DESIGN.md and its token sidecar were preserved byte-for-byte; inherited scope/mobile-score documentation drift and 46 advisory differences were reported without an unsolicited system rewrite. See [MIGRATION-DOCUMENTATION.md](MIGRATION-DOCUMENTATION.md) for evidence, hashes and the distinction between source-approved adaptations and inherited documentation.

## 14. Before production cutover — no action taken

1. Obtain final owner approval of screenshots, canonical titles/prices and incomplete legacy copy.
2. Back up production database/uploads/plugins and retain a tested WordPress fallback. Verify production IDs/schema/relationships before considering any reviewed data import; do not blindly reuse staging IDs.
3. Approve and deploy the reviewed backend release to production separately; preserve SCF, Elementor and REST/private-cache exclusions.
4. Provision the agreed Next hosting/HTTPS frontend origin. Configure WORDPRESS_SITE_URL/API, exact APP_URL/PUBLIC_SITE_URL and a private stable random SESSION_ENCRYPTION_KEY; never put it in client env or source control.
5. Deploy first to a private/staging HTTPS URL with indexing disabled. Repeat cookie/origin, protected-account, booking/review and responsive checks against the intended backend. Decide on an explicitly authorized outbound notification/delivery test.
6. After final cutover approval, set the public canonical domain and ALLOW_INDEXING=true, rebuild, verify sitemap/robots/SEO, then switch traffic with rollback available. Cache only public assets/data as appropriate; never cache private customer responses.
7. Monitor the agreed launch checks and retain legacy fallback. SCF/Elementor cleanup is a separately approved phase.

## Deployment / canonical backfill record

Staging active plugin **1.13.0**, package SHA-256 `3f23c5eae1c93679766d3d8547b8fc7afa6a3585e7d8f0ba2cc93efb21d3ae2c`, explicitly approved before installation. Preview reviewed 17 cards, left 523 untouched, filled only empty canonical values on the other 16. Existing prices, taxonomy/IDs, users and Elementor were preserved. Backup option: `shalom_backfill_20261019064526_pz9pHK`; before/after API snapshots and applied plan are in `../.reference/migration/`. Original content is never a runtime parser dependency.
