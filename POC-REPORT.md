# Ubud vertical POC — corrected phone authentication

Historical vertical acceptance report, updated 19 October 2026 (Asia/Jakarta). The 1.12.2 scope below was Header, Home prototype, Ubud/Tour 523, reviews, customer account and booking gate. A subsequent explicit user approval authorized full Home/South Kuta/West Bali migration. Current implementation and real 1.13.0 staging results are in [MIGRATION-REPORT.md](MIGRATION-REPORT.md); historical stop/scope statements below belong to that earlier phase.

## Subsequent full migration staging regression — 19 October 2026

Approved 1.13.0 is active. Existing phone login still resolves to native customer7; original inquiries and completed523 remain attached. New Tour523/custom inquiries use the same identity. Synthetic review5 was moved to recoverable Trash for the new exact regression: eligible/no submission → Next submits review6 Pending → own private account includes6/can_review=false → stale Next duplicate form rejected server-side → WordPress approves6 → same account review Approved/can_review=false → public Tour523 score8.0/count1, approved modal and newest Home review update. Pending6 was excluded from all three public endpoints. Logout, protected Account, invalid credentials, Request Help and Tour/custom return intent passed. No WhatsApp message or real outbound email/SMS was sent. Registration remains verified locally with actual WordPress/Next and intercepted mail, not falsely claimed as a real staging submission. See the full migration report/evidence for the complete page, API, responsive and cutover record.

## Current decision and release

The latest user correction makes PHONE NUMBER + PASSWORD the approved customer login. The earlier email-first instruction was withdrawn. That UX and its backend registration/reset-email additions have been rolled back. Following explicit user approval, the exact 1.12.2 artifact was installed on the staging domain only on 18 October 2026. WordPress reported a successful update and cache purge. Production was not accessed. SCF and Elementor remain active.

Deployed staging package: ../dist/shalom-customer-portal-1.12.2.zip

SHA-256: ef2a25f7ea2986b3b9580dd147304e7e6e05e5db42e99e7fed6d56f0748305a7

3,994,194 bytes; 1,624 entries. Packaging checked every entry against source and excluded test/runtime files. Compared with deployed 1.11.1, the ZIP delta is exactly the main version/bootstrap file, includes/rest-customer.php and one new release note; see ../dist/shalom-customer-portal-1.12.2-delta.json. The immutable 1.12.0 and 1.12.1 artifacts are SUPERSEDED / DO NOT DEPLOY; neither was installed. Their draft notes and tests are archived outside the plugin in ../docs/superseded-auth/.

**Local correction/regression: PASS. Real staging 1.12.2 acceptance: PASS, completed 18–19 October 2026. The headless backend and vertical POC are ready for full frontend migration; no full migration has started.**

## Real staging 1.12.2 acceptance — PASS

These are observations from the actual staging WordPress, collected on 18–19 October 2026 (Asia/Jakarta). They are separate from the disposable local WordPress tests below. Next runs locally at http://127.0.0.1:3000 and uses https://slategray-goshawk-210407.hostingersite.com/ through structured Shalom REST adapters. Production was not accessed.

| Required check | Real staging result |
| --- | --- |
| 1. Active plugin | PASS: exact approved 1.12.2 artifact installed; native Plugins shows active Shalom Travel Manager 1.12.2 with Deactivate action. SCF 6.9.6 and Elementor/Elementor Pro remain active |
| 2. Existing phone login / identity | PASS: existing customer Ricky signs in through phone + password in Next; private account returns native WordPress customer ID 7, matching the pre-existing admin customer detail URL. A fresh login on 19 October again resolves to ID 7 and returns to /book/523. No password was read/logged. Customer list remains six records, matching the pre-login baseline; no duplicate customer was created |
| 3. Existing account relationships | PASS: completed Tour 523 stays attached to customer 7. Native customer history retains the original Ubud inquiry dated 2026-10-18 13:54:21 UTC and shows the new inquiry dated 2026-10-18 16:03:48 UTC. Submitted review ID 5 belongs to the same private account |
| 4. Book Now / inquiry | PASS: Ubud Book Now opens authenticated /book/523. Request Availability creates a native inquiry attached to customer 7, presents the validated WhatsApp continuation and leaves status Inquiry. The continuation was never clicked; no WhatsApp message was sent. Fresh phone login also preserves tour=523 and returns to booking |
| 5. Eligible → Pending | PASS: before submission, account ID 7 has completed Tour 523, reviews=[] and can_review=true. One Next submission creates native review ID 5 Pending (8/9/7). Immediate private GET and account reload show that same Pending review and can_review=false; WordPress moderation independently shows Pending |
| 6. Duplicate submission | PASS: a second form opened before the first submission remains usable for a real duplicate POST. Server rejects it and Next displays “You have already reviewed this Tour.” Native account/admin contains exactly one submitted Ubud review, ID 5 |
| 7. Approval / public update | PASS: native WordPress Approve changes review 5 to Approved. Private account returns the same ID, original content/ratings and can_review=false. Normal public Tour/review APIs update to score 8.0/count 1; Next card and public Reviews modal show the exact 1.12.2 test review. Approval updated the ordinary API URL before the later cache-setting change or manual purge |
| 8. Pending stays private | PASS: while review 5 is Pending, anonymous Tour 523, its public reviews and latest-reviews responses contain none of its distinctive test text. Tour/public-review summary is score null/count 0. Guests cannot read customer/me. After approval the review becomes publicly visible with masked name, without private customer identity fields |
| 9. Logout | PASS on 19 October: after a fresh successful phone login and account ID 7 check, Log Out returns to Next Login. Reloading the private account API returns Please sign in; protected /account exposes only the sign-in prompt, not customer data. The expired overnight session was not counted as a logout test |
| 10. Phone recovery | PASS through actual Next UI and BFF: Phone Number / Request Help yields the original support-only notice. No Email or Username / Send Reset Link UI, no wp-login.php redirect, no reset-key/email/SMS flow added. No outbound message was sent |

### Cache finding and approved staging configuration

During test preparation, the native Trash operation on old synthetic review 4 left a cached public response showing that old review: ordinary URLs reported Hostinger HCDN/LiteSpeed HIT while a diagnostic fresh query showed the authoritative zero-review state. Diagnostic query parameters were used only to isolate the cache; they were not introduced as a public frontend data workaround. The later native approval of review 5 updated normal API requests immediately, to 8.0/count 1, before manual cache changes.

The user separately approved adding only ^/wp-json/shalom/v1/ to LiteSpeed Cache → Excludes → Do Not Cache URIs. On 19 October this was saved while preserving the existing /register/, /login/, /my-account/, /forgot-password/ and /review/ entries. One approved Purge All - LSCache action followed. Site page cache was not globally disabled. Plugin code/package/hash did not change.

Two consecutive rounds of ordinary anonymous requests to Tour 523, public reviews and latest-reviews now return 200 with Cache-Control no-cache/no-store, X-LiteSpeed-Cache-Control no-cache and X-HCDN-Cache-Status DYNAMIC. Approved review/score data remains correct; no unique cache-busting query is required by the public frontend. This configuration is a staging hosting requirement to carry into the eventual hosting plan.

Automatic approval review temporarily blocked the first cache-settings navigation because of a usage limit on 18 October; that denied action was not executed or bypassed. Work resumed through the normal browser on 19 October after the user asked to continue. The already approved configuration change then completed successfully.

### Staging test data and evidence

Only historical synthetic review 4 was moved to recoverable WordPress Trash to prepare the eligible/no-submission state. The replacement review 5 is explicitly labelled STAGING VALIDATION ONLY and remains Approved as the completed regression artifact. It yields 8.0/count 1 on staging. Review 3 was already in Trash from the previous test. No real testimonial, customer profile, existing inquiry or completed-Tour assignment was deleted or rewritten in this acceptance run. Customer 4's Uluwatu review/data was not touched. No new registration was performed on staging.

Evidence under .impeccable/review/:

- Deployment/cache: staging-1.12.2-installed.jpg, staging-1.12.2-cache-excludes-saved.jpg, staging-1.12.2-cache-purged.jpg, staging-1.12.2-cache-after.json; earlier failure diagnosis is retained separately in staging-1.12.2-public-cache-diagnosis.json.
- Identity/relationships/booking: staging-1.12.2-account-eligible.json, staging-1.12.2-account-before-logout.json, staging-1.12.2-customer-7-relationships.txt, staging-1.12.2-booking-ready.jpg.
- Moderation/private state: staging-1.12.2-account-pending.json, staging-1.12.2-pending-account.jpg, staging-1.12.2-pending-wordpress.jpg, staging-1.12.2-duplicate-rejected.jpg, staging-1.12.2-account-approved.json, staging-1.12.2-approved-account.jpg.
- Public privacy/approval: staging-1.12.2-pending-public.json, staging-1.12.2-approved-before-cache-fix.json, staging-1.12.2-approved-public-modal.jpg, staging-1.12.2-approved-public-guest.jpg.
- Logout/recovery: staging-1.12.2-after-logout.json, staging-1.12.2-logged-out-protected-account.jpg, staging-1.12.2-request-help-result.jpg.

Headless backend and vertical POC are ready for full frontend migration.

Stop here for confirmation. This readiness statement authorizes no production deployment or additional frontend migration.

## Corrected authentication behavior

Before correction the working WordPress login, registration and recovery PHP/templates were inspected, alongside the staging UI. AUTH-INSPECTION.md records the current comparison. The latest explicit phone specification is authoritative.

Login contains Phone Number, Password, Show password, Log In, Forgot Password and Register. The phone starts with +; country/region detection appears above it. No email/username field, method checkbox or country selector is displayed. The exact libphonenumber JS bundle already used by WordPress is reused for presentation. PHP normalize_phone remains authoritative; it accepts international and supported local number variants. Email/username authentication remains internal compatibility only.

Registration contains Full Name, Phone Number, Password, Confirm Password, Customer Type and terms/privacy consent. The native phone claim/uniqueness check, opaque username, placeholder email, subscriber role, consent metadata and existing customer-type rules are restored without alteration. It is not email-only registration. No existing customer was migrated, merged or re-created.

Forgot Password contains Phone Number and Request Help. A narrow transport calls existing Auth::forgot and returns the existing support notice. No account lookup, reset key, SMS or email is generated. The UI does not claim that a support ticket or message was sent. Automatic recovery remains unavailable. Existing native reset code is untouched for compatibility.

Account stays focused on customer name, completed Tours, eligibility, submitted review status and logout. Hidden legacy phone/country metadata is retained. Native WordPress user/session remains the identity source; there is no new authentication store or architecture.

## Independent review and cache fixes retained

The original private account path used a general comment query that did not reliably include Pending reviews. 1.11.1 uses an owner-scoped prepared query for Pending/Approved submissions, shared by account listing and the server duplicate guard. Invalid owner zero returns nothing. Pending and Approved both set can_review false and reject another submission with duplicate / HTTP 400. Public endpoints continue to query Approved only. No new database concurrency guarantee is claimed.

A second live problem was observed after installing 1.11.1: the stored Pending review existed and duplicate POST was rejected, but the same private GET URL still returned old reviews=[] / can_review=true. Adding unique nonsecret upstream private GET query values and no-cache request headers immediately exposed the correct Pending state before moderation or data edits. This demonstrates stale upstream GET transport/cache; the precise caching component was not independently isolated. The site uses LiteSpeed. The deployed 1.12.2 also retains DONOTCACHEPAGE, LiteSpeed no-cache signals and private/no-store response headers for customer routes. Public review behavior was not broadened.

Private account response retains its old fields and adds authenticated customer ID, own review ID/time/ratings/verdicts. These additions are accepted compatibly by Next and are never added to public Tour/review responses. Pending is visible only to its authenticated owner and authorized native administrators.

## Files changed / restored

| Area | Final change |
| --- | --- |
| Plugin includes/class-auth.php | Byte-identical to deployed 1.11.1; phone login and internal legacy identifier compatibility retained |
| Plugin includes/class-registration.php | Restored byte-identical to 1.11.1; email-only branch removed |
| Plugin includes/class-settings.php | Restored byte-identical to 1.11.1; proposed global email interceptor/audits removed |
| Plugin includes/class-reviews.php | Byte-identical to 1.11.1; owner Pending/Approved query and duplicate protection retained |
| Plugin includes/rest-customer.php | Private cache fixes retained; forgot-password now adapts support-only Auth::forgot; registration allowlist restored to phone fields |
| Plugin shalom-customer-portal.php | Version 1.12.2; early customer REST cache bypass retained |
| Plugin HEADLESS-1.12.2.md | Release notes packaged before deployment; exact artifact subsequently approved and deployed |
| Next src/components/AuthForm.tsx | Phone login and original registration fields; no email-first selector |
| Next src/components/PhoneInput.tsx; public/vendor/libphonenumber-max.js | Shared + phone field and existing WordPress region detection bundle |
| Next src/components/ForgotPasswordForm.tsx; src/app/forgot-password/page.tsx | Native Next Request Help screen |
| Next src/lib/customer-types.ts; src/app/api/customer/[action]/route.ts | Phone registration/recovery contracts, fixed BFF actions; internal legacy login remains |
| Next src/lib/customer-server.ts | Unique private GET requests and no-cache headers retained |
| Next src/components/CustomerAccount.tsx | Useful account information and original review/account logic retained; no metadata-driven country display |
| Tests | phone-auth-check.php; updated customer-adapter-check.php, customer-browser-setup.php, check-customer-local.ts; existing pending-review-check.php retained |
| Reports | This report, AUTH-INSPECTION.md, README.md, release notes and superseded draft notice |

## Correction regression results

These results use the actual corrected plugin in disposable local WordPress/SQLite and actual Next HTTP/browser flows, not mocked identity or hardcoded Tour data. The existing named local customer is created before login; identity checks compare its native ID before and after login. Local pre_wp_mail interception prevents every real outbound email, including native registration admin notifications. No message was sent to WhatsApp or SMS.

| Requested regression | Result / evidence |
| --- | --- |
| 1. Existing phone + password login | PASS locally through native REST, actual Next BFF and browser form. +62/spaced, country-code digits and local 08 variants map to one native customer |
| 2. Same existing WordPress/customer identity | PASS: native ID comparison and unchanged user count; no user insertion during login. Existing internal email/username compatibility also passes 18-check review/identity suite |
| 3. Protected account | PASS: guest 401, native cookie+nonce required, forged/missing nonce rejected; logout blocks replay |
| 4. Book Now → Login → intended Tour | PASS browser: /book/523 guest → /login?tour=523 → phone login → /book/523; Request Availability creates native inquiry and deliberate continuation link. WhatsApp link never opened |
| 5. Inquiry association | PASS: stored shalom_inquiry_user equals original native customer; ticket retries reuse inquiry; relationship survives logout/relogin |
| 6. Completed Tours association | PASS: completed Tour 523 remains attached and visible after phone login/relogin |
| 7. Pending review account | PASS: eligible true before submission; submission Pending; immediate private reload includes same submission with Pending status and can_review false |
| 8. Duplicate rejection | PASS: Pending and Approved duplicate writes rejected server-side; Pending excluded publicly; moderation updates same review and public count |
| 9. Logout | PASS native session revocation, account protection and old-session replay denial; browser logout returns to phone Login |
| Phone registration | PASS: native subscriber/customer metadata, no invented completions, duplicate normalized phone rejected without extra user; email-only registration rejected |
| Request Help | PASS: support response, no reset key mutation and no wp_mail call; Next screen remains phone based |
| UI | Desktop and 390px mobile inspected; +62 detects Indonesia; no email login, selector or horizontal overflow. Show password works; booking intent links preserved |

Automated totals: existing backend suite 322 checks; 26 first-party PHP files lint clean; customer adapter 28 checks; focused Pending/identity 18 checks; phone correction 23 checks; actual Next/WordPress HTTP 26 checks; frontend contracts/session 9 tests. Production Next build and TypeScript pass. Eleven staging-backed read-only route checks pass. Vendor PHP was unchanged. Empty-state fixtures were reset only in the explicitly disposable local database before the legacy suite.

Browser evidence: .impeccable/review/phone-login-desktop.jpg, phone-login-mobile.jpg, phone-register-desktop.jpg, phone-register-mobile.jpg, phone-help-desktop.jpg, phone-help-mobile.jpg, phone-booking-local.jpg and phone-pending-local.jpg. Mobile captures are labelled local QA. Historical staging review evidence is separate below.

## Previously observed staging validation, preserved

1.11.1 was installed with explicit approval before this correction. WordPress reported update/cache-purge success. During that earlier review regression only synthetic review 3 was moved to recoverable Trash, then synthetic review 4 was submitted from Next for native customer 7 / Tour 523. It was Pending in WordPress. A stale second form was rejected server-side as duplicate. After private GET cache bypass, Next Account immediately showed Pending / can_review false; public count stayed zero. Admin approval changed the same review 4 to Approved, account remained can_review false, public rating became 9.0/count 1, and the public Reviews modal showed its exact labelled test text (9/9/9). See patch-1.11.1-pending-account.jpg, patch-1.11.1-duplicate-rejected.jpg and patch-approved-review-4.jpg.

During the earlier local-only correction, the staging account was observed with completed Ubud Tour and Approved synthetic review 4, without staging writes. Those are historical observations from before the subsequently approved 1.12.2 deployment. The current identity, inquiry and review-5 acceptance results are recorded in the real staging section above.

Legacy native customer 4 was previously inspected read-only: Subscriber, completed Uluwatu, inquiry 883 (Inquiry), inquiry 882 (Completed), approved review 2. Separate user-reported email/username sign-ins for that identity were not independently observed and remain inconclusive. The corrected local phone tests do not establish customer 4 has phone metadata or prove its staging phone sign-in. Phone-less legacy accounts retain internal identifier compatibility; there is no automatic phone attachment or duplicate user creation.

## Tour 523 structured API mapping

| Value | WordPress source / verified staging value |
| --- | --- |
| Identity | Existing tour ID 523, A. Ubud Tour, slug a-ubud-tour, tour-area ubud |
| Featured Image | Existing attachment 1750, /wp-content/uploads/2026/10/Ubud-A.webp |
| Destinations | _shalom_destinations: Rice Terrace; Luwak Coffee Plantation; Holy Springs Temple; Kanto Lampo Waterfall |
| Prices | Existing regular_price 75 and sale_price 60, USD; zero remains valid if provided |
| Duration | Existing duration: 10 Hours |
| Price Note | _shalom_price_note: original supplied price-change paragraph |
| Rating/reviews | Approved review summary, now 8.0/count 1 from synthetic review 5; not an organic travel testimonial |

No Elementor-rendered HTML is used as runtime data. Existing Elementor prices 65/55 remain legacy content and were not silently rewritten. Synthetic staging reviews must not be copied into production testimonials.

## Architecture / API / auth

Next 16.4.2 / React 19.3.1 with App Router and reusable Header, TourCard, ReviewScore/ReviewModal and customer forms. Public WordPress adapters validate structured /tours, /tours/523, approved /reviews and latest-reviews; public Reviews stays in Next. Missing content is not fabricated. The original WordPress design/assets remain the visual reference.

Fixed same-origin /api/customer actions adapt native WP config/login/register/me/logout/booking-ticket/inquiries/reviews plus the deployed phone Request Help transport. All POSTs require exact APP_URL Origin and JSON with allowlisted fields; POC writes are scoped to Tour 523. Next seals the native logged-in cookie/REST nonce server-side in an AES-GCM encrypted, HttpOnly, SameSite=Lax cookie, Secure on HTTPS, at most 12 hours. Native WP verifies each private request and revokes its session on logout. No native credentials/nonces reach browser JSON/localStorage. No second customer store exists.

## Remaining gate / limitations

The local staging-backed preview runs at http://127.0.0.1:3000 and remains noindex. The exact 1.12.2 package is deployed on staging. Real staging phone-login identity, booking, review moderation/privacy, recovery and logout acceptance have passed; see the separate staging table above. Full frontend migration has not started and requires the next user confirmation.

Automatic phone recovery, outbound delivery and SMS provider are not implemented/tested by this correction; Request Help is intentionally support-only. No real email delivery was tested or required. Native phone registration retains existing admin-notification behavior; it was exercised only behind the local no-mail test harness, not on staging. Public-facing email-first registration/recovery is removed.

Existing IP throttling shares the Next egress-IP bucket; production abuse-control capacity remains a later deployment concern. Sequential duplicate review/ticket retry rules are tested; no new cross-request concurrency guarantee is claimed. Production hosting and additional page migrations remain out of scope. Do not expand the frontend. The authorized real staging checks are complete; stop for migration confirmation.
