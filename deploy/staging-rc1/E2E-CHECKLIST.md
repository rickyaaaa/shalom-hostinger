# E2E checklist — multi-currency v1.29.0-rc1 staging

Status legend: **LOCAL-PASS** = already proven on this workstation against the approved artifact
(disposable harness, real REST dispatch or `php -S` HTTP). **PENDING** = requires the isolated staging
environment and/or a browser.

| # | Check | Method | Expected | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Currency selector IDR/USD/EUR | Browser | Native select with 3 options, no flags, visible in header + mobile menu | PENDING (API supports all 3 — LOCAL-PASS) | screenshot `01-selector-*.png` |
| 2 | Guest selection persists; signed-in preference authoritative | Browser | Guest choice survives reload; account choice wins and is never written to the guest bucket | PENDING (logic tested) | `02-guest.png`, `02-account.png` |
| 3 | Admin area-level defaults | Browser + API | Settings shows South Kuta/Ubud = 900000; API `prices.base.regular = 900000` | LOCAL-PASS (API) | `03-settings.png`, `03-currencies.json` |
| 4 | Admin per-tour override | Browser + API | Override 1,000,000 → card/quote IDR 1,000,000 (USD 62) | LOCAL-PASS (23 checks) | `04-tour-edit.png`, `04-quote.json` |
| 5 | Clear override restores area default | Browser + API | Empty field → price back to 900,000 (USD 56) | LOCAL-PASS | `05-after-clear.json` |
| 6 | Real-time quote + confirmation | Browser + API | "Review price" → quote card → confirm → WhatsApp URL | LOCAL-PASS (REST) | `06-quote.png`, `06-inquiries.json` |
| 7 | `409 quote_changed` | API | Price/rate change invalidates the quote; new quote shown; no inquiry | LOCAL-PASS | `07-409.json` |
| 8 | `410 quote_expired` | API | Expired quote → back to edit; no inquiry | LOCAL-PASS | `08-410.json` |
| 9 | Stale rate `503` | API | 5–7 day rate → `503 rate_unavailable`, no quote, no order; IDR still books | LOCAL-PASS (incl. HTTP `status:stale`) | `09-503.json` |
| 10 | Rate provider unavailable | API | >7 days / missing → `503 rate_unavailable`; USD/EUR prices `null`, never 0 | LOCAL-PASS | `10-unavailable.json` |
| 11 | Immutable confirmed snapshot | API + admin | Stored quote unchanged after price/rate change; retry returns same URL | LOCAL-PASS | `11-snapshot.json` |
| 12 | Existing order history | Browser | New order shows stored quote; pre-1.29 order unchanged | LOCAL-PASS (API) | `12-history.png` |
| 13 | West Bali USD legacy | Browser + API | USD 65/50, no per-car claim, EUR/IDR unavailable, no IDR field | LOCAL-PASS | `13-west-bali.json` |
| 14 | Login / registration / password reset | Browser + API | Unchanged flows; reset mail blocked and logged | LOCAL-PASS (backend) | `14-*.png`, `mail.log` |
| 15 | Review eligibility + submission | Browser + API | Completed currency order grants exactly one entitlement; review submits | LOCAL-PASS (backend) | `15-review.png` |
| 16 | Referral preservation | API | `/<slug>` cookie attached to inquiries, not in body; attribution stored | LOCAL-PASS (101+56 checks) | `16-referral.json` |
| 17 | WhatsApp test-only routing | Browser | Marketing vs Customer Service numbers are the staging test numbers; message text unchanged | LOCAL-PASS (routing) | `17-wa-link.txt` |
| 18 | Mobile + desktop rendering | Browser | 360/390/768/1280 px: selector reachable, quote card buttons full width, no horizontal scroll | PENDING | `18-*.png` |
| 19 | Flag OFF backward compatibility | API | Exact 1.28.1 payload/response when disabled | LOCAL-PASS | `19-off.json` |
| 20 | ECB refresh | API + admin | Refresh fetches live ECB XML, caches, status `ok`, cron scheduled | PENDING (needs outbound) | `20-refresh.json` |

## Evidence rules

- Store artefacts under `tests/results/staging-rc1/<date>/` (gitignored), never in source.
- Capture the deployment URL, plugin hash, commit `d011f3c`, and the exact rate document per run.
- A failed check is recorded as FAIL with the response body and the WordPress error log line.
- No production host, customer or number may appear in any screenshot or log.
