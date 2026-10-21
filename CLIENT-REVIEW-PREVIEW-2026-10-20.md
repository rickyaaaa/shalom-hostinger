# Client-review HTTPS Preview — 20 October 2026

**URL:** https://shalom-nextjs-preview-m9on8cbq6-rickyaaaas-projects.vercel.app

**Deployment:** dpl_7STBJh7sZKjyRb2Zse9bRPAHA7Xp — **READY / Preview** in **shalom-nextjs-preview** (prj_itkVxGhG7b69Zh3qMQUJh7juh5D1), team rickyaaaas-projects. Next.js 16.4.2, Node 24.x.

This release is for client review / QA only. No production cutover, promotion, custom domain or DNS change. Vercel Authentication remains enabled: reviewers need existing authorized access. No access-control change or public bypass link was created.

## Source and pre-deployment verification

- Fresh snapshot of all current application source: **94 files**. Includes current West Bali AreaPage/TourCard presentation, WestBaliNotice, WestBali.module.css, card notes, all other current src/public files and the latest shared server-only backend configuration cleanup.
- Snapshot/upload file inventories and hashes matched; source remained identical after deployment. Private environment files, WordPress config, customer data, recovery files and local session jars were excluded.
- Source manifest SHA-256: f88ebb3025f13c60f7fb2206daada6360f32f604f942ce09e3bb964b99b22258. This is a local working-state release; no Git commit was created.
- Required local sequence: npm test **27/27 passed** -> npm run typecheck **passed** -> npm run build **passed**.
- Vercel remote build repeated HTTPS Preview environment preflight, **27/27 tests**, Next build and TypeScript successfully; deployment reached Ready. Dashboard build duration: 34 seconds.
- WORDPRESS_SITE_URL still https://slategray-goshawk-210407.hostingersite.com; WORDPRESS_API_URL still that staging origin + /wp-json/shalom/v1. Verified both local and existing hosted Preview configuration.
- Zero temporary Hostinger hostname literals in runtime src/ or next.config.ts. Current staging environment values and public API-provided image URLs intentionally still contain the staging hostname.
- Configuration and WordPress/customer adapters retain server-only boundaries. No private WordPress/key settings in Next env; no NEXT_PUBLIC backend/secret variables. Both existing Preview key values were absent from uploaded source and **11 observed deployed application JS bundles**. No secret was printed or rotated.

## Deployment target and environment safety

- Deploy command explicitly used --target preview, existing project ID and existing team scope. No --prod, promote, domain or DNS mutation was used.
- Vercel dashboard explicitly showed **Environment: Preview** and **Ready**. Legacy deployment API target is null for this Preview; it is not production. Inspector: https://vercel.com/rickyaaaas-projects/shalom-nextjs-preview/7STBJh7sZKjyRb2Zse9bRPAHA7Xp.
- All seven existing environment variables remain Preview-only. Environment IDs/types/scopes/createdAt/updatedAt are unchanged, including sensitive session/signing keys.
- ALLOW_INDEXING=false, HEADLESS_RATE_LIMIT_MODE=signed and staging backend values were confirmed. Actual HTTPS response includes X-Robots-Tag noindex; meta robots is noindex, nofollow; robots.txt returns HTTP 200 and Disallow: /.
- Project domain inventory and Production deployment IDs are unchanged. Custom-domain assignment was skipped by Vercel. The previously approved empty bootstrap remains untouched.

## Browser / visual smoke results

Chromium in-app browser with viewport emulation; **not physical-device acceptance**.

| Surface | Result / scope |
| --- | --- |
| Home | Passed desktop and 375px; hero/area links, content and review section render. |
| South Kuta | Passed desktop and 375px; six canonical cards, current prices/notes/buttons; no horizontal overflow. |
| Ubud | Passed desktop and 375px; seven canonical cards; no horizontal overflow. |
| West Bali | Passed 375, 390, 430, 768 and 1280px; four cards, no horizontal overflow and one-line CTAs. |
| Tour detail | **N/A: no standalone Tour detail route exists in the current frontend.** Canonical Tour cards and /book/633 were tested. No new route was invented for this deployment. |
| Header/navigation | Desktop itinerary dropdown and 375px hamburger/itinerary open-close behavior passed. |
| Login | Existing synthetic staging QA account signed in successfully and retained Tour 633 booking intent. |
| Register | Form, phone, customer-type and consent controls render; **not submitted**, to preserve customer records. |
| Phone | Initial + is visible; typing digits without + produced +628123456789 and Indonesia. No test registration submitted. |
| Account / My Inquiries | Existing QA account rendered completed Tour, review state and two owned inquiry rows at 375px without overflow or alerts. |
| Book Now | Guest redirected to /login?tour=633; successful login returned to /book/633 and showed Request Availability. **Final availability submission not clicked**, so no inquiry/WhatsApp continuation was created. |
| Reviews modal | Tour 633 valid empty state and Tour 523 populated two-review summary rendered; focus remained inside on Tab; Escape/close worked. No review submitted. |
| WordPress-hosted images | All four West Bali card images loaded through Next image optimization from the configured staging uploads; existing canonical images preserved. |
| Browser errors | No errors reported by captured browser error logs during this smoke test. |

## West Bali acceptance details

Final hero heading and supporting paragraph are visible on the existing West Bali photo with a dark overlay. The blush announcement displays the approved NOT INCLUDING / INCLUDE lists before the grid and booking controls. Notice content and price-note display overrides remain hardcoded to West Bali only; WordPress canonical notes are unchanged. Trekking's existing Start at 10.00 wording remains as supplied.

| Card | Canonical Tour ID | Current / crossed-out price | Duration |
| --- | --- | --- | --- |
| A. Temple Tour | 633 | $75 / $90 | 10 Hours |
| B. Trekking Tour | 644 | $75 / $90 | 10 Hours |
| C. Healing Tour | 651 | $65 / $80 | 10 Hours |
| D. Relaxing Tour | 655 | $50 / $65 | 10 Hours |

All four cards retain destinations, images, prices/durations and correct booking IDs. Each approved price note sits between pricing and actions, uses 14px text, and stays inside the card at all five tested widths. Desktop/tablet use two columns and mobile one; buttons stay on one line.

## Regressions and limits

**No application regression found in the tested scope.** No frontend source fix was needed during deployment QA.

- Standalone Tour detail is absent from the existing application; it is not a newly introduced deployment failure.
- Terms/privacy links still open WordPress legal pages, an existing presentation gap documented in ARCHITECTURE-AND-BACKEND-AUDIT.md.
- Physical Android Chrome, iOS Safari, Firefox and desktop Safari were not tested. Viewport emulation does not replace the pending real-device/browser gate.
- Register submission, inquiry creation, review creation and WhatsApp/mail delivery were not replayed. Only the existing QA session was created/revoked through normal login/logout; no canonical customer/Tour/inquiry/review content was changed.
- Existing labelled staging fixtures remain visible and unchanged. The four unresolved owner content items and existing final-cutover gates remain pending; this release does not approve production readiness.
- Elementor, SCF, staging mail capture and fixture inventory remain intact. Credentials and WordPress canonical records were preserved. The QA browser session was logged out and transient plaintext credential file removed.

## Evidence

Workspace https-preview-work contains client-review-source-manifest.json, client-review-upload-dry-run.json, client-review-before.json, client-review-safety-after.json, client-review-browser-qa.json, client-review-http.json and client-review-bundle-check.json. None contains secret values or authentication cookies.

Screenshots in the task visualization directory: client-review-west-bali-final-desktop-2026-10-20.jpg, client-review-west-bali-mobile-hero-2026-10-20.jpg, client-review-west-bali-mobile-notice-2026-10-20.jpg, client-review-west-bali-mobile-card-2026-10-20.jpg, client-review-mobile-menu-2026-10-20.jpg and client-review-vercel-ready-preview-2026-10-20.jpg. Additional area/account/register/modal captures are local QA evidence.
