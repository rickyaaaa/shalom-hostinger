# Shalom production-readiness closure — 20 October 2026

**NOT READY FOR PRODUCTION CUTOVER**

Customer inquiry history and the modal keyboard issue are resolved on an updated isolated HTTPS Preview. A bounded staging capacity test passed. Content approvals, complete device/browser QA and production data/mail sign-off remain open. No production cutover, DNS/custom-domain change, Preview promotion, production credential change, Elementor removal or SCF removal occurred.

The preceding HTTPS acceptance report is archived as `HTTPS-ACCEPTANCE-2026-10-20.md`; the earlier baseline remains `PRE-PRODUCTION-BASELINE-2026-10-19.md`. Their results retain their original release/date/scope and are not relabelled as fresh closure tests.

## 1. Current release and isolation

| Item | Verified result |
| --- | --- |
| Current application Preview | https://shalom-nextjs-preview-aye930kn4-rickyaaaas-projects.vercel.app |
| Inspector | https://vercel.com/rickyaaaas-projects/shalom-nextjs-preview/D2u6fftg6ctiE4d96EKWA8tsrmCT |
| Deployment ID | `dpl_D2u6fftg6ctiE4d96EKWA8tsrmCT`, Ready, dashboard **Preview**, API legacy target `null` |
| Isolated project / team | `shalom-nextjs-preview`, `prj_itkVxGhG7b69Zh3qMQUJh7juh5D1`, `rickyaaaas-projects` |
| Backend | https://slategray-goshawk-210407.hostingersite.com ; API `/wp-json/shalom/v1` |
| Staging plugin | **1.13.2 active**; native uploader verified successful update and active Deactivate action |
| Hosted build | **22/22 tests**, Next production build and TypeScript passed; Node runtime/Route Handlers/native image optimizer retained; no static export |
| Secrets/environment | Seven variable records, all exactly Preview-only; `ALLOW_INDEXING=false`; both independent keys remain sensitive; no key rotation or production variables |
| Origin | Guarded platform `VERCEL_URL` derives both public origins for this actual Preview; no incoming Host/XFF trust |
| Protection | Vercel Authentication retained; CLI and authenticated browser used; not disabled |
| Domains/DNS | Zero active aliases; domain inventory unchanged, reserved `shalom-nextjs-preview.vercel.app` only; no actual Shalom production/custom domain attached and no DNS mutation |
| Production-labelled bootstrap | Exactly one Ready Production deployment, unchanged `dpl_5mK3bjj3dHqRSmxhPmAcDT1SKKdw`, empty three-file bootstrap only. No new bootstrap or Ready Production application |

The new upload dry-run included **85 allowlisted source files**, with zero matches for either real Preview secret. Environment files, WordPress config, private credentials, test cookies, databases and audit/customer evidence were excluded. Prior hosted client-asset secret scanning belongs to the preceding release; this phase added no client secret namespace/configuration.

Deployment explicitly used `--target preview` with the existing exact project/scope. A dry-run rejected `--skip-domain`, which this CLI supports only for Production; no deployment occurred from that rejected dry-run. The flag was removed while preserving Preview, and the runbook corrected. It remains applicable only to the already approved/completed empty bootstrap. Do not change an application target to Production to use that flag. Scoped CLI readback confirms the six original owner isolation requirements remain satisfied; no application was promoted.

## 2. Customer Account inquiry history — CLOSED

WordPress reads existing published `shalom_inquiry` records, with a numeric owner filter derived exclusively from the authenticated native WordPress session. A defensive per-record owner check follows the query. Caller-supplied `user_id`/`customer_id` cannot select an owner. There is no second inquiry model, migration, new table or new booking implementation.

The allowlisted item DTO contains only `id`, `title`, `submitted_at` and known `status`; no raw metadata, contact/message payload, ticket, owner selector, WordPress admin link or session nonce reaches the Next customer DTO. Titles are stripped of markup; unknown dates/statuses are labelled unavailable rather than invented. Native inquiry date is UTC and the UI explicitly states this.

Account displays **My Inquiries — Tour / Date / Status**, newest first, twenty records per page with a Load more/retry state and empty state. The table wraps long text within fixed width; no full-width page overflow was observed at the actual desktop viewport. Stable item IDs prevent repeated visible entries when loading another page. Private responses retain no-store; native booking/status rules remain unchanged.

| Required regression | Actual result |
| --- | --- |
| Authenticated Account | Customer **8** resolves to the same native identity; original inquiry **2043** appears; secure HttpOnly session and private no-store verified |
| Ownership / cross-user selector | Hosted request `me?user_id=7&customer_id=7` still returns customer 8 and only its inquiries. Guest me is 401 |
| Two authenticated owners | Local real WordPress integration created controlled local owners and verified separation in both directions, even with forged selectors; drafts excluded. A second live staging customer was not impersonated or newly registered |
| Pagination / DTO | Local 23-record history yields disjoint pages 20+3, then empty; UTC date/status preserved; metadata/admin fields excluded. Hosted page two is empty for the two-record synthetic account |
| Booking writes | One fresh native ticket used for three sequential identical POSTs: exactly one new inquiry **2045**, alongside existing **2043**. New flows may create a new inquiry; same-ticket retries did not duplicate it |
| Reviews | Three attempts to repeat the approved synthetic review returned 400; review IDs remained `[7]`; no new review created |
| UI | Actual browser showed only the two customer-8 rows with title/date/status and no admin links. Completed Tour and own Approved review remain intact |
| Logout | CLI logout 200 then guest me 401; browser logout returned to login. Temporary CLI cookies and browser credential input file removed |

Local integration: **14/14 inquiry-history checks**. Current Next suite **22/22**, including a DTO contract that strips private fields and rejects unknown status/malformed date/page values. PHP lint and TypeScript passed. The local integration file is `../tests/inquiry-history-check.php`.

No additional staging registration was performed in this phase. The pre-existing synthetic customer count remains one; no WhatsApp continuation was opened/sent, and Request Help remains support-only.

## 3. Reviews modal keyboard — CLOSED for available actual browser

Kept native `<dialog>.showModal()` and existing open/close behavior. Added explicit wrapping of visible, enabled focusable elements at forward/backward Tab boundaries, including the single-close-button case that previously allowed focus to leave the document. Existing Escape cancellation, scroll lock, focus restoration and moderation/review fetching remain unchanged.

Tested with **native keyboard input in the actual in-app Chromium browser**, not DOM-dispatched/emulated events:

| Behavior | Result |
| --- | --- |
| Initial focus inside | PASS, Close reviews focused |
| Forward Tab stays inside | PASS, four consecutive cycles remain on an internal control |
| Shift+Tab stays inside | PASS |
| Escape closes | PASS |
| Focus returns to Reviews | PASS |
| Background not keyboard-interactive | PASS in tested traversal; native `:modal` active, AX tree exposes dialog content and focus never reaches background |

The former forward-Tab uncertainty is resolved on this release/browser. This does not establish Firefox/WebKit coverage or every data-dependent retry/load-more state. Those remain in the manual browser matrix.

## 4. Device / cross-browser coverage — OPEN

Detailed test procedure and completion sheet: `deploy/readiness-closure/DEVICE-BROWSER-MANUAL-QA.md`.

| Environment | Classification | Actual result |
| --- | --- | --- |
| Desktop in-app Chromium, 1280×720 | **REAL BROWSER** | Login/logout, digit-only phone country detection, Account inquiry display, desktop dropdown and native modal keyboard verified; scrollWidth1270 <= innerWidth1280 |
| Android Chrome | **NOT TESTED** | No attached real device/session |
| iOS Safari | **NOT TESTED** | Unavailable |
| Desktop Chrome | **NOT TESTED** | No standalone branded Chrome session; Chromium is not relabelled Chrome |
| Desktop Firefox | **NOT TESTED** | Unavailable |
| Desktop Safari | **NOT TESTED** | Unavailable |
| 375 / 390 / 430px | **NOT TESTED** at actual size | Previous viewport override did not change actual 1280×720; no valid narrow-size emulation accepted |
| Tablet | **NOT TESTED** | Actual tablet/viewport unavailable |
| 200% browser zoom | **NOT TESTED** | Ctrl+plus left actual viewport unchanged; cannot claim 200% reflow |
| REAL DEVICE / accepted EMULATION | None | No fake/DOM-only coverage claimed |

The manual sheet covers header/hamburger, Tour Itinerary, Login/Register, phone input, Account, Book Now, modal, CTA wrapping, overflow, image cropping, physical input zoom and sticky behavior at all requested sizes. Existing header is non-sticky by design; no new sticky promise was introduced. Actual mobile crop/input/menu and narrow CTA results remain pending, not presumed from unchanged CSS or previous baseline screenshots. Register was inspected without submitting another registration.

## 5. Owner content approvals — OPEN, canonical values unchanged

Owner explicitly stated no final wording is available and instructed preservation of all four values. No canonical content was changed, completed or guessed.

| Tour | Required owner confirmation | Status |
| --- | --- | --- |
| **633** | Complete approved price note | **PENDING OWNER CONTENT APPROVAL** |
| **655** | Complete approved price note | **PENDING OWNER CONTENT APPROVAL** |
| **580** | Exact complete destination label currently starting `ATV (Four Wheels Motorbike ...` | **PENDING OWNER CONTENT APPROVAL** |
| **644** | Exact start-time wording with timezone/context | **PENDING OWNER CONTENT APPROVAL** |

Each is a content blocker before production cutover. No invented prices, closing text, time or timezone was applied.

## 6. Synthetic fixtures and migration exclusion — PLAN PREPARED, NO DELETION

Authoritative inventory/denylist: `deploy/readiness-closure/PRODUCTION-DATA-EXCLUSIONS.json`.
Approval-dependent actions: `deploy/readiness-closure/STAGING-CLEANUP-AND-MAIL-PLAN.md`.

| Fixture | Handling boundary |
| --- | --- |
| Synthetic customer **8** | Retain during QA; exclude customer and dependent records from production migration |
| Inquiries **2043/2045** | Synthetic customer 8 / Tour523; retain now; exact IDs listed for later approved reversible cleanup |
| Completed relationship **customer8 → Tour523** | Synthetic manual completion; remove only this link after approval, not all users' completion data |
| Review **7** | Approved synthetic HTTPS review, labelled STAGING HTTPS QA ONLY; never genuine production testimonial |
| Review **6** | Historical approved synthetic review, labelled STAGING VALIDATION ONLY; exclude independently of its existing owner |
| Historical inquiries **1999/2000** | Exact dates/kinds match MIGRATION-REPORT.md's deliberate 19 October Tour/custom QA; identified for later approval |
| Existing customer **7**, inquiries **1993/1997**, original completion | **PRESERVE.** These pre-date the historical deliberate test and must not be swept into customer/review cleanup |
| Other QA-only material | Local SQLite/seeded identities/tests, mail helper/sink/options, test transients, private encrypted recovery/evidence, upload packages and empty bootstrap are inventoried; never import them as production customer/content data |

No staging record was deleted, trashed, unapproved, anonymized or re-assigned during closure. Local integration removes only its newly created disposable local posts, not staging data.

No production export is approved. The plan prohibits a full staging DB clone and requires entity-aware exclusions, synthetic-marker checking, explicit genuine-record allowlisting and owner review. A read-only candidate-export guard `check-production-fixtures.cjs` fails on listed IDs, synthetic owner/relationship/markers, missing collections and ambiguous/string owner IDs. **Eight unsafe samples rejected; empty and preserved-original examples passed.** It is an operational pre-import gate, not an authorized/imported pipeline or proof of unlisted data provenance. Passing it does not authorize migration. An import may not proceed until this review/approval gate is satisfied.

## 7. Staging mail capture — ACTIVE, removal NOT performed

Exact helper:
`/home/u433850416/domains/slategray-goshawk-210407.hostingersite.com/public_html/wp-content/mu-plugins/shalom-preview-mail-capture.php`

Metadata sink:
`/home/u433850416/domains/slategray-goshawk-210407.hostingersite.com/.shalom-preview-mail-capture.jsonl` (outside public_html, 0600).

Live admin readback confirms active capture, two prior captures (transport probe + synthetic registration admin notification), native synthetic customer count one / ID8, and PHPMailer initialization count zero for the proven probe. The helper blocks all native wp_mail To/CC/BCC/admin/cron/plugin paths before transport; it is not an OS/direct-SMTP egress firewall. No actual provider/inbox delivery is claimed.

The cleanup/mail plan specifies the exact file and helper options, approval-dependent rollback/removal, a recipient allowlist/sink before removal, controlled-inbox delivery/bounce verification afterward, and future server-only distinct production provider/sender credentials. Production sender/domain authentication, DNS and customer-recipient tests need separate authorization. Capture remains active while Preview QA depends on it; production email configuration was not changed.

## 8. Bounded capacity acceptance — PASSED WITH STATED SCOPE

Proposed small-business operating envelope for this acceptance, **not an owner-confirmed traffic forecast**: aggregate **60 normal logins/hour**, **120 booking writes/hour**, **30 review writes/hour**, with a bounded peak of three overlapping private reads. Each normal individual uses few attempts; these aggregate assumptions do not override per-customer quotas. Higher simultaneous unique-customer/write volume requires separate measurement and a revised acceptance envelope.

Test safety: existing signed headless design unchanged; valid session/native rules retained; no throttle reset, signature relaxation or arbitrary forwarded-IP identity; no real recipients; no new registration; one new synthetic inquiry; duplicate review attempts only. Planned ceiling 70 requests, maximum concurrency three.

| Measurement / behavior | Result |
| --- | --- |
| Measured normal/functional samples | **31 HTTP timings** including login, Account, ticket/booking retry writes, expected duplicate-review rejections and private read burst |
| Private read burst | **18/18 HTTP200**, six batches with at most three parallel processes; all resolve owner8 |
| p95 / maximum | **0.615998s / 0.779837s**; below thresholds p95<=8s, max<=15s; HTTP time excludes CLI startup |
| Unexpected rate/error responses in normal samples | **Zero unexpected429, zero5xx**; review400s are deliberate duplicate rejections |
| Signed client quota | First ten support-only synthetic attempts200, eleventh429; independent client still200 |
| Count bound | **64 conservative requests including logout**, under70; includes maximum18 possibly issued by an initial incomplete runspace harness, plus18 fully recorded replacement reads |
| End state | CLI native logout200, guest me401; temporary jars removed; UI test sessions also logged out |

The first parallel harness ended without complete metrics; those potential reads are counted conservatively and **not** used as successful latency samples. Replacement reads were independently recorded in six three-process batches. Login/booking/review write phases were not repeated to recover that harness. Separate browser acceptance/navigation and the three early guest-only metrics-format probes are not presented as load samples; all stayed bounded. No failed write was automatically retried with a new ticket.

Acceptable429: intended per-client/normalized-target excess must return a clear wait/support message, not a500 or silent repeated write. Clients should stop automatic retries and back off up to the 15-minute window; no exact Retry-After header is claimed. Existing per-target limits prevent simple rate-cookie resets from clearing an account bucket; authenticated writes retain40/native user/action/window. Native same-ticket idempotency and review uniqueness remain authoritative.

Abuse assumptions/limitations: cookies are replaceable pseudonyms; shared-target exhaustion can affect account availability, fixed windows permit boundary bursts, and distributed many-target flooding still needs platform ingress/WAF controls and monitoring. This is **not DDoS protection**, a sustained multi-user throughput test, a successful-new-review load test, or a production SLA certification. Successful review creation/moderation was covered in the preceding real HTTPS acceptance; closure exercised rejection paths and one inquiry insertion. Owner traffic/SLO acceptance and future ingress policy remain sign-off items.

## 9. Changed files, artifacts and evidence

Runtime changes:

- WordPress `includes/rest-customer.php`: owner-filtered read-only history and paging in existing Account response; bootstrap version1.13.2.
- Next `src/lib/customer-types.ts`: allowlisted paginated history schema; `src/lib/customer-server.ts`: typed internal query parameters; `src/app/api/customer/[action]/route.ts`: bounded page forwarding for authenticated me.
- `src/components/CustomerAccount.tsx`: simple My Inquiries table, empty/paging/error states; `src/app/globals.css`: scoped wrapping/table styles using existing tokens.
- `src/components/ReviewModal.tsx`: explicit keyboard boundary wrapping; no modal/review business change.
- `tests/customer.test.ts`, new `tests/inquiry-history.test.ts`, local WordPress `tests/inquiry-history-check.php` and operational docs/fixture guard.

React/Next review preserved the existing session context (no duplicate initial fetch), server-only secrets, stable list identity, native labels/table semantics and abortable modal fetch. Impeccable detector ran on the correct named UI files after an initial wrong-cwd invocation; its reported color/type advisories refer to pre-existing declarations outside the newly added inquiry rules. No unrelated design-system redesign was made. Skill update was deferred per owner instruction.

| Source artifact | SHA-256 / size |
| --- | --- |
| `../dist/shalom-customer-portal-1.13.2.zip` | `9d339a677029e3aa7171466335db0abaaa36177055d88bddedc79d5f03d22b8f`; 1,627 files; 4,000,660 bytes |
| `../dist/shalom-next-readiness-closure-2026-10-20.zip` | `7cf03a70193a43c280ac2eb19345e6e39e47695cea485e5d79555d2a78dbf253`; 85 files; 748,792 bytes |

Both archives were verified entry-by-entry against the final source/upload bytes. The Next archive preserves the operational runbook bytes present at deployment time; current report/closure plans are separate documentation updates requiring no runtime redeploy. Earlier 1.13.1/source artifacts and encrypted staging wp-config backup remain for coordinated rollback; no whole-database restore is authorized.

Filtered evidence in `D:/Ricksite Studio/custom plugin/login arena shalom tour/https-preview-work/`:
`closure-https-results.json` (12 checks all passed), `closure-read-1.json` through `closure-read-18.json`, `closure-modal-keyboard.json`, `closure-final-safety-evidence.json`, `closure-upload-dry-run.json`, `closure-historical-inquiry-inventory.json`, `closure-source-artifact.json`, `closure-source-manifest-2026-10-20.json`.

Screenshots under `C:/Users/USER/.codex/visualizations/2026/10/09/01a12032-c31a-79d2-9249-25ee00e33ecd/`:
`shalom-closure-inquiry-rows-2026-10-20.jpg`, `shalom-closure-my-inquiries-2026-10-20.jpg`, `shalom-closure-preview-ready-2026-10-20.jpg`, `shalom-staging-1.13.2-closure.jpg`.

## 10. Remaining gates and stop condition

1. **Four content blockers:** Tours633/655 price notes,580 exact destination label,644 exact start-time/timezone remain PENDING OWNER CONTENT APPROVAL and unchanged.
2. **Browser/device evidence:** complete the documented real Android, standalone Chrome/Firefox, narrow widths/tablet/200% and mobile input/menu/crop tests; explicitly accept any unavailable Safari omissions. Do not infer them from Chromium/desktop or an ineffective viewport setting.
3. **Data/migration approval:** review the exact fixture inventory, decide approved reversible cleanup versus verified exclusion and approve a genuine-record candidate allowlist. No staging fixture deletion or production import has been performed.
4. **Operations sign-off:** accept/revise traffic assumptions and bounded capacity scope, ingress monitoring and production mail/provider/delivery plan. Staging capture remains active and production mail unverified.
5. After these gates close, obtain explicit final approval for a separately reviewed production plan. Existing bootstrap permission is exhausted; no production deployment, promotion, domain/DNS/traffic switch is implied by Preview acceptance or this report.

Closure work stops here for review/approval. No production cutover performed.

NOT READY FOR PRODUCTION CUTOVER
