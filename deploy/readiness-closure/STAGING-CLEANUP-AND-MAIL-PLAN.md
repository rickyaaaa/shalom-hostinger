# Staging fixture cleanup and mail transition — PLAN ONLY

No staging records have been deleted, trashed, anonymized or unapproved in this closure phase. No production data import, mail change or cutover is authorized. Obtain explicit approval against this exact inventory before cleanup.

## Verified fixture inventory

| Entity | Identification / provenance | Later action only after approval |
| --- | --- | --- |
| Native customer | ID **8**, HTTPS Preview QA 20261020, one synthetic phone match | Revoke remaining sessions; remove customer only after its dependent QA data is handled. No password reset or customer contact |
| Current HTTPS inquiries | **2043** original acceptance and **2045** closure retry test; customer 8, Tour 523 | Review then trash only these records; same-ticket retries created only 2045 once |
| Historical staging inquiries | **1999**, Tour 523 at 2026-10-19 06:50:35 UTC; **2000**, custom at 06:53:20 UTC | Matched exactly to MIGRATION-REPORT.md's deliberate staging test timestamps; exclude/trash only these approved QA records |
| Completed Tour assignment | customer **8** → Tour **523** | Remove only 523 from customer 8's existing completion array; do not clear all completions globally |
| Synthetic review | **7**, customer 8, Tour 523; clearly marked STAGING HTTPS QA ONLY | Trash/unapprove by explicit approval; preserve moderation audit/export first; recalculate native summary |
| Historical synthetic review | **6**, existing customer 7, Tour 523; STAGING VALIDATION ONLY | Handle only review 6; do not delete its existing customer or original records |
| Preserved original data | customer **7**, inquiries **1993/1997** dated 18 October and its existing Tour 523 completion | **DO NOT DELETE/RESET.** Baseline report explicitly identifies these as pre-existing data |
| Local-only QA | tests/runtime SQLite databases, seeded local users, closure_local_owner/closure_local_other | Never upload/import; newly created local history test posts were cleaned locally in test finally; no staging deletion occurred |
| Operational QA | mail-capture helper/sink/options, signed test rate/nonce/ticket rows, plugin upload packages, local encrypted recovery/evidence, empty bootstrap | Keep while QA depends on them; no wholesale cache/limiter reset and no bootstrap/project removal in this phase |

The source of truth for exclusions is `PRODUCTION-DATA-EXCLUSIONS.json`. Inquiries 2043 and 2045 are both legitimate *separate QA flows*; three POSTs with the new flow's same ticket created only one new record. Do not implement global per-Tour deduplication or alter native booking rules.

## Safe approval-dependent sequence

1. Stop QA writes and take a protected, minimal before-state export of only the listed fixture entities/links; record statuses and IDs. Keep it outside deployment/public folders, encrypted with restricted access.
2. Confirm every target's native owner/type and QA marker/timestamp matches this inventory. Abort on mismatch. Preserve customer 7, inquiries 1993/1997, all unrelated reviews/Tours and genuine customer records.
3. Prefer native reversible Trash/moderation for reviews 6/7 and inquiries 1999/2000/2043/2045. Do not purge Trash or permanently delete without separate explicit permission.
4. Remove only the synthetic customer 8 completion relationship and revoke its sessions. Customer-account deletion/reassignment is a later explicit decision, not a consequence of removing its review.
5. Verify customer/history ownership, native approved review summary, homepage/modal, no orphaned review eligibility, mail capture and remaining original customer 7 data. Review counts will drop naturally when test reviews are excluded; do not invent replacements.
6. Update the fixture manifest and retain an audit. No full database restore or global query deleting names/phones/IDs by a vague QA pattern.

## Prevent synthetic data entering production

There is **no approved production export**. Never clone the whole staging database/customer/review tables into production. Exclude the listed entity IDs, owner 8's dependent records, its completed-Tour link, synthetic text markers, local databases/test directories and private operational artifacts. Require an explicit genuine-record allowlist reviewed by the owner.

`node check-production-fixtures.cjs <candidate-export.json>` is a read-only pre-import gate for an explicit `{customers,inquiries,reviews,completed_tours}` JSON envelope. It fails on listed IDs, customer 8 ownership, synthetic relationships/markers or unspecified collections. Its self-test passes safe/unsafe examples. It is not connected to an import pipeline (none is authorized) and cannot certify unlisted historical data: provenance/allowlist review remains mandatory. A passing guard does not authorize import/cutover.

## Staging mail capture: ACTIVE — do not remove yet

Exact file to remove/disable **later with approval**:
`/home/u433850416/domains/slategray-goshawk-210407.hostingersite.com/public_html/wp-content/mu-plugins/shalom-preview-mail-capture.php`

Metadata sink (outside public_html, 0600):
`/home/u433850416/domains/slategray-goshawk-210407.hostingersite.com/.shalom-preview-mail-capture.jsonl`

Helper options: `shalom_preview_test_user_id`, `shalom_preview_mail_probe_result`. They are test operational metadata, not customer records. Archive/remove only after retention approval.

The helper currently blocks all native `wp_mail` before PHPMailer, including admin registration notifications and To/CC/BCC. Final readback remains active, two captures (probe + synthetic registration notification), PHPMailer count zero. It does not block arbitrary direct SMTP/OS mail outside native wp_mail.

Before removal: finish registration/mail-dependent QA; disable unapproved test submissions or establish a transport-level recipient allowlist/test sink covering To/CC/BCC/admin/cron/plugin messages. Removing the helper alone could resume real staging mail; it is not authorized now.

After an approved removal:

1. Verify the exact MU helper is absent from the staging must-use plugin list/path and its admin Tools page/hook no longer runs; keep a restricted rollback copy outside public_html.
2. With a recipient allowlist/sink already active, send one synthetic native message solely to an owner-approved controlled inbox. Check transport logs, To/CC/BCC rewriting, sender identity and delivery/bounce behavior without exposing credentials/reset content.
3. Exercise intended registration/admin notification categories within that allowlist; verify production data/customer recipients cannot be selected accidentally. Test Request Help stays support-only; do not claim automated password recovery/SMS.
4. Check scheduled/plugin mail pathways and retain audit. If delivery or allowlisting fails, reinstate capture before further QA writes.

Future production mail requires a separately approved provider/sender/domain, server-only credentials distinct from staging, authorized recipients, bounce/error handling, retention and monitored delivery. Domain authentication/DNS changes require separate permission. No production email/DNS setting was changed; actual provider/inbox delivery remains unverified.
