# Final cutover checklist

20 October 2026 · **Preparation only; approvals pending.**

Preview: https://shalom-nextjs-preview-aye930kn4-rickyaaaas-projects.vercel.app

No cutover, DNS/mail change, Preview promotion, fixture deletion, mail-capture removal or Elementor/SCF removal is authorized by this checklist. Unconfirmed business content stays unchanged. Approval of this document is not execution approval.

## A. Owner content

All four items are **PENDING OWNER CONTENT APPROVAL**. Obtain the owner's exact final text before editing canonical data:

- Tour 633 complete price note
- Tour 655 complete price note
- Tour 580 exact complete ATV destination label
- Tour 644 exact start time and timezone/context

## B. Device QA

Record tester/date, device/browser version, actual viewport/zoom, screenshot and PASS/FAIL. Label **REAL DEVICE**, **REAL BROWSER**, **EMULATION** or **NOT TESTED**; emulation cannot prove physical input behavior.

| Required platform | Evidence required | Current status |
| --- | --- | --- |
| Android Chrome | REAL DEVICE + REAL BROWSER | NOT TESTED |
| iOS Safari, if available | REAL DEVICE + REAL BROWSER | NOT TESTED; unavailable |
| Chrome desktop | REAL BROWSER | NOT TESTED |
| Firefox desktop | REAL BROWSER | NOT TESTED |
| Safari desktop, if available | REAL BROWSER | NOT TESTED; unavailable |

| Required condition | Current status / manual action |
| --- | --- |
| 375px / 390px / 430px | Each NOT TESTED; verify actual viewport separately, label verified emulation EMULATION |
| Tablet | NOT TESTED; record dimensions and test portrait/landscape |
| 200% zoom | NOT TESTED; use verified browser zoom and record reflow |

Existing **REAL BROWSER** evidence: in-app Chromium, 1280×720; Account/inquiries, login/logout, dropdown and modal keyboard passed. This does not establish requested branded-browser/mobile coverage. Earlier viewport/zoom overrides were ineffective; no emulation/200% pass is claimed.

Run this manual checklist on each applicable platform/size:

- **Header, hamburger, dropdown:** fit, expand/collapse, links, keyboard/touch focus and existing non-sticky scroll behavior.
- **Login/Register, phone input:** labels/errors/consent/password visibility; automatic `+` and country feedback. Use existing QA login; no new uncontrolled registration.
- **Account, My Inquiries:** own records only; Tour/date/status/UTC readable; pagination/empty/error states; no admin links/metadata.
- **Book Now:** intended Tour survives login; same-ticket retry does not duplicate inquiry. Do not open/send WhatsApp.
- **Reviews modal:** initial internal focus, Tab/Shift+Tab, background isolation, Escape and trigger-focus restoration; include retry/load-more when present.
- **CTA wrapping, horizontal overflow, image crop, input zoom:** single-line CTAs, no clipping/overflow at narrow widths/200%, correct image framing, physical input focus/keyboard recovery without disruptive zoom.

Log defects and accept any unavailable conditional Safari coverage explicitly. Procedure: [device QA sheet](deploy/readiness-closure/DEVICE-BROWSER-MANUAL-QA.md).

## C. Data cleanup — reversible plan, not executed

Use the existing [fixture inventory](deploy/readiness-closure/PRODUCTION-DATA-EXCLUSIONS.json), scoped to **WordPress staging only**. Before any approved action, verify IDs/owners/QA provenance and save a restricted encrypted before-state export, statuses and exact completion memberships. Abort on mismatch. Never purge records or bulk-match vague QA names.

| Exact target | Later action requiring approval | Reversal |
| --- | --- | --- |
| Customer **8** | Retain the native account unchanged; exclude ID8 and its dependent data from the candidate migration. Do not delete/reassign the account or change its password | Remove exclusion only after a new review/approval; account remains intact |
| Inquiries **1999, 2000** (owner7), **2043, 2045** (owner8) | Exclude all four IDs. If physical cleanup is approved, move only these to native Trash after verifying recoverable Trash and preventing automatic purge during the rollback window; otherwise retain and exclude | Untrash and restore each saved original status; undo exclusion only after approval |
| Completed Tour **customer 8 → Tour 523** | Save `shalom_completed_tours`; remove only customer 8's membership for523, preserving all other memberships | Restore that saved membership without overwriting subsequent unrelated entries |
| Reviews **6** (owner7), **7** (owner8), Tour 523 | Save moderation state; change only these synthetic reviews to Pending/unapproved, retaining comments/metadata, and exclude both IDs from migration | Restore each saved moderation state; verify native public summary/cache afterward |

**Explicitly preserve customer 7, inquiries 1993 and1997, customer 7's original Tour 523 completion, and all unrelated real customer data.** Removing review6 does not authorize changing its owner or original history. No staging fixture action is executed now.

No full staging DB clone. Require a genuine-record allowlist, exclusions/marker scan and the read-only [fixture guard](deploy/readiness-closure/check-production-fixtures.cjs) on a reviewed candidate export. Verify original records, relationships and public review summary; retain audit. A guard pass does not authorize import.

## D. Mail — capture stays active

Exact active helper:
`/home/u433850416/domains/slategray-goshawk-210407.hostingersite.com/public_html/wp-content/mu-plugins/shalom-preview-mail-capture.php`

**Later removal procedure, only after approval:**

1. Finish mail-dependent QA; stop unapproved test submissions. Establish and prove a transport recipient allowlist/test sink covering To/CC/BCC, admin/cron/plugin messages and any direct SMTP path. Native wp_mail interception alone is not an OS egress firewall.
2. Record the helper hash. Move that exact file to a restricted backup outside public_html, for example `/home/u433850416/domains/slategray-goshawk-210407.hostingersite.com/.shalom-preview-backups/shalom-preview-mail-capture.php.disabled`; do not delete it or the capture audit. Verify it no longer loads as an MU plugin.
3. Send one approved synthetic message solely to a controlled inbox, then approved notification-category probes. Verify actual envelope recipients, To/CC/BCC containment, sender, delivery/bounce and provider errors with redacted logs. No customer recipients or new registration are implied.
4. If containment/delivery fails, move the helper back to its exact original path before resuming QA. Verify capture resumes. Retain sink/options until retention approval.

**Production requirements to approve:** transactional provider/transport, server-only credentials distinct from staging, verified owner-approved From/sender domain, Return-Path and Reply-To, provider-specified SPF/DKIM/DMARC/domain authentication, recipient policy, suppression/bounce handling and monitoring. Record ownership of any required DNS work in a separately approved plan; no mail/DNS change occurs now. Request Help remains support-only; no automated SMS/recovery promise.

## E. Traffic / operations

Existing bounded test only; no new load test in this phase:

- **Tested p95: 0.615998s; max: 0.779837s**, 31 HTTP samples excluding CLI startup; zero unexpected 429/5xx. Eighteen private reads passed with at most three parallel processes. Incomplete initial-batch timings are excluded.
- **Limits unchanged:** anonymous 10/action/900 seconds per verified client, plus normalized target/account protection; unsigned direct-IP fallback; authenticated 40/native user/action/window. Signatures/replay validation, ticket idempotency and review uniqueness remain enabled.
- **429 acceptance:** tested ten 200 responses then 429, independent client 200. Show a wait message; stop automatic retry storms and back off within 15 minutes. No exact Retry-After header promised.
- **Assumptions to approve:** aggregate 60 logins/hour, 120 booking writes/hour, 30 review writes/hour. Small bounded acceptance is not sustained production throughput/SLA; revise/test higher expected peaks separately.
- **Abuse limits:** replaceable cookies, target exhaustion, boundary bursts, distributed many-target flooding. Require ingress/WAF controls; throttling is not DDoS protection.
- **Monitoring required:** route volume/429/5xx, login failures, latency, WordPress/DB/resources, duplicate inquiries/moderation errors, mail delivery/bounces and costs. Approve thresholds, retention, on-call and rollback triggers; never log secrets/contact data.

Attach the coordinated frontend/plugin/config rollback plan, verified backups, operator/recovery checks and separate domain/DNS/traffic plan. Preserve Elementor/SCF fallback. Existing [acceptance report](PRE-PRODUCTION-REPORT.md): NOT READY FOR PRODUCTION CUTOVER.

## F. Cutover gate

Every item must be explicitly approved before any production execution. All remain unchecked; completing this list does not itself execute or authorize cutover.

- [ ] Owner content approved
- [ ] Device/browser QA accepted
- [ ] Fixture cleanup/exclusion approved
- [ ] Production mail plan approved
- [ ] Traffic/capacity assumptions approved
- [ ] Rollback plan approved
- [ ] Production domain/DNS plan approved
