# Multi-currency staging runbook (frontend v1.29.0)

Scope: isolate the completed multi-currency frontend on a private preview and prove it against the
corrected WordPress 1.29.0 plugin. Nothing in this document authorizes a production change.

Branch: `feature/shalom-multicurrency` (commit `3ea4a19`). Production `main` is untouched and the
WordPress flag stays OFF.

---

## 1. Which plugin ZIP is the correct one

There are **two different files named `shalom-customer-portal-1.29.0.zip`** in the workspace. Only one
matches the frontend contract.

| Build | Path | SHA-256 | Verdict |
| --- | --- | --- | --- |
| Corrected | `custom plugin/login arena shalom tour/portal-1.29/dist/shalom-customer-portal-1.29.0.zip` | `54ddfde5426114e2f7f36096e2483f5c3d451d7c871275de506304aa5ea787bd` | **Use this for staging** |
| Stale | `Wordpress/headless shalom/dist/shalom-customer-portal-1.29.0.zip` | `26651a49be2400f55ce83893223aa64626c74b796ceabe75f901333d308dfd36` | Do **not** use; incompatible |

Why the stale ZIP must not be installed: it exposes a different API (`base_currency`/`currencies[]`
instead of `default`/`supported`/`rates`, no `prices`/`price_status` on Tours, `booking-ticket` without
`quote`, `preference` without `source`/`recommended`/`options`, and its own `/quote` + `/customer/orders`
flow). With it installed the frontend silently stays feature-OFF and the quote flow can never run.

Verify before installing:

```powershell
Get-FileHash "<path>\shalom-customer-portal-1.29.0.zip" -Algorithm SHA256
```

Expected: `54DDFDE5...A787BD`.

---

## 2. Isolation requirements

| Requirement | Rule |
| --- | --- |
| WordPress install | Separate staging site, **separate database**, its own uploads |
| Never | `cms.shalombalitour.com` — read-only reference at most, never QA writes |
| Frontend host | Private preview domain, not `shalombalitour.com` |
| Secrets | New `SESSION_ENCRYPTION_KEY` and `SHALOM_HEADLESS_SIGNING_KEY` (`openssl rand -hex 32`), never copied from production |
| Indexing | `ALLOW_INDEXING=false` (robots disallow + `noindex`) |
| Customers | Test accounts only (`qa+…@example.test`), not real client accounts |
| WhatsApp | Point the staging plugin's WhatsApp numbers at test recipients; never real customers or staff |
| Payments | No live payment, no live price action |
| Rates | Provider can be the real ECB feed; do not change production rate settings |

Configuration template: `deploy/staging.env.example`. Production template
(`deploy/production.env.example`) is unchanged and keeps the feature disabled.

---

## 3. Staging bring-up order

1. Back up and snapshot the staging DB (empty/staging data only).
2. Install the **corrected** ZIP; activate.
3. **Leave the flag OFF.** Visit Shalom → Settings → confirm the multi-currency option exists and
   `enabled` is unset.
4. Smoke-test the legacy flow with the flag OFF: tour listing, booking, WhatsApp hand-off, login,
   account, reviews. This is the rollback baseline.
5. Refresh the daily rate (Settings → "Refresh exchange rates", or wait for
   `shalom_refresh_exchange_rates`). Confirm `shalom_fx_rates_v1` holds USD and EUR with an
   `effective_date`.
6. Check the public endpoint before enabling:
   `GET /wp-json/shalom/v1/currencies` → `{"enabled":false,"default":"USD","supported":["USD"]}`.
7. Enable the flag on **staging only**. Re-check:
   - `enabled: true`, `default: "USD"`, `supported: ["USD","EUR","IDR"]`
   - each rate row has `idr_per_unit`, `effective_date`, `source`, `status`
   - Tour payload carries `price_status` and `prices.amounts` for USD/EUR/IDR
8. Deploy the branch to the preview host with `deploy/staging.env.example` values. `WORDPRESS_*`
   feeds the image allowlist, so a backend hostname change requires a **rebuild**, not just a restart.
9. Confirm `GET /api/tours` on the preview does not leak secrets and the page renders the selector.

---

## 4. Integration checklist

Record pass/fail per row; attach screenshots/network captures for failures.

### Feature flag

| # | Check | Expected |
| --- | --- | --- |
| 1 | Staging WP flag OFF, reload preview | No selector anywhere, prices exactly as today, `booking-ticket` payload has no `currency`/`cars` |
| 2 | Staging WP flag ON, hard reload | Selector visible in desktop header and mobile menu |
| 3 | Flag ON but `supported` has only USD (simulate) | Selector hidden; no "undefined" text |
| 4 | v1.28.1 simulation: `/currencies` returns 404 | Page still renders; selector hidden; no error banner |

### Currency selection

| # | Check | Expected |
| --- | --- | --- |
| 5 | Guest picks EUR, reloads | EUR persists (`localStorage.shalom_currency`) |
| 6 | Guest picks EUR, signs in as a customer with explicit USD | USD wins immediately |
| 7 | Signed-in customer picks EUR, reloads | EUR restored from `currency_preference`, no `localStorage` write |
| 8 | Customer A sets EUR, signs out, Customer B signs in | B never sees A's EUR; B gets own/default |
| 9 | Recommendation: sign in with country DE and no explicit choice | EUR recommended |
| 10 | Preference save fails (network blocked) | Selector reverts and shows a message, page keeps working |

### Prices

| # | Check | Expected |
| --- | --- | --- |
| 11 | South Kuta / Ubud cards and booking page in IDR | `IDR 900,000 per car`, no decimals |
| 12 | Same tours in USD | Rounded-up whole USD, `per car` label, indicative note with rate date |
| 13 | Same tours in EUR | Same rules, EUR symbol |
| 14 | Discount policy `none` | No struck-through price invented; `sale` only when WP sends one |
| 15 | Tour without a price in EUR | "Price unavailable in EUR", never `0` |
| 16 | Per-car semantics | Label `per car`; `cars` stays 1 in the current UI; a value of `2` must never silently double a price in the UI without the `Cars` row |
| 17 | West Bali tour | Legacy USD display only, **no** per-car claim, no IDR/EUR availability |
| 18 | Stale rate (5–7 days) | "Estimated price · rate <date>"; booking still allowed (see §5) |
| 19 | Rate unavailable (>7 days / provider down) | "Price unavailable in USD/EUR"; IDR still books |

### Booking and quotation

| # | Check | Expected |
| --- | --- | --- |
| 20 | Flag OFF booking | One `booking-ticket` + one `inquiries`, straight to WhatsApp, unchanged message |
| 21 | Flag ON, IDR booking | "Review price" → quote card (amount, per car, no rate row) → confirm → WhatsApp |
| 22 | Flag ON, USD/EUR booking | Quote card shows amount, base IDR, rate + date + source, indicative note |
| 23 | Change date/pickup/currency after a quote | Quote clears, back to edit, fresh price required |
| 24 | Double-click confirm | Exactly one inquiry created (no duplicate) |
| 25 | Retry the same confirmed booking | Stored snapshot returned, same WhatsApp URL, no duplicate inquiry |
| 26 | WhatsApp text | Contains price label with `per car`, cars, total, quote id; routing/number identical to legacy |

### Error paths

| # | Check | Expected |
| --- | --- | --- |
| 27 | `409 quote_changed` (change the rate or base price between quote and confirm) | New quote replaces the card, message shown, **no** inquiry created, explicit confirm required |
| 28 | `410 quote_expired` (delete the quote transient or wait past TTL) | Back to edit, "price expired" message, fresh price required |
| 29 | `currency_unavailable` | Message names the available currencies |
| 30 | `rate_unavailable` (503) | Clear message, no order, no zero price |
| 31 | `currency_disabled` (flag turned OFF mid-session) | Clear message, page still usable |

### Account, reviews, layout

| # | Check | Expected |
| --- | --- | --- |
| 32 | Order history for a quoted order | Stored amount + currency + `per car` + indicative rate date; never recalculated after a rate change |
| 33 | Order history for a legacy order | Unchanged rendering, no empty quote row |
| 34 | Login, register, forgot/reset password, account profile | Unchanged |
| 35 | Reviews (submit, pending, approved) | Unchanged |
| 36 | Referral attribution | `/<slug>` cookie still attached to `inquiries`; no referral fields in the body |
| 37 | Mobile 360px and 390px | Selector reachable in the mobile menu, quote card buttons full width, no horizontal scroll |
| 38 | Keyboard/screen reader | Selector labelled, status announced politely, quote card is a labelled region |

---

## 5. Rate-staleness behavior (verified in plugin source)

`Exchange_Rates::status_for_date()`: `ok` ≤ 4 days, `stale` 5–7 days, `unavailable` after 7 days
(invalid/future date also `unavailable`). A daily cron (`shalom_refresh_exchange_rates`) refreshes the
cached document.

**Does the backend allow booking with a stale rate? Yes.** `Currency::quote()` accepts a `stale`
document, sets `status: "stale"`, and continues; `validate_quote()` only compares the fingerprint. The
customer sees the stale amount and can confirm it. Only `unavailable` blocks booking (`503
rate_unavailable`) and hides USD/EUR tour prices.

Consequences to test and to decide with the client:

- A stale quote is still an accepted order; the only disclosure is the "Estimated price" label.
- The fingerprint includes `idr_per_unit` and `rate_date`, so **any** daily refresh invalidates open
  quotes with `409 quote_changed`, even when the rounded amount is identical.
- Quote TTL is 30 minutes by default (`quote_ttl`, clamped 300–3600 s); `410` only applies before an
  order exists — retries of an existing order return the stored snapshot.

---

## 6. Rollback

1. Turn the WordPress flag OFF. Tours revert to the legacy payload; quote endpoints fail closed; the
   frontend hides all currency UI. No frontend redeploy needed.
2. If needed, redeploy the previous frontend release (the branch commit is additive and
   feature-flagged).
3. Full plugin rollback: restore the previous plugin ZIP; stored snapshots and usermeta are inert and
   can stay.

---

## 7. Production release dependencies

1. Install the **corrected** `1.29.0` plugin (hash above) on production — not yet approved.
2. Confirm the release lineage (plugin doc says the source tree was 1.13.2 and 1.29.0 was assigned by
   instruction) and the version number with the client.
3. Approve outstanding business rules: rate provider (ECB vs. alternative), rounding/buffer, discount
   policy, multi-car bookings, West Bali policy, quote TTL, stale-rate tolerance, and legal
   disclosure of indicative pricing.
4. Only then: enable the flag, refresh the rate, and deploy this frontend.
5. Keep the flag OFF in production until staging sign-off is complete.

---

## 8. Known issues / risks carried into staging

- Version-number ambiguity: the two `1.29.0` ZIPs differ; always check the hash.
- The XML ECB feed is parsed by the corrected plugin; an ECB format change or outage degrades to
  `stale` and then `unavailable`.
- Only South Kuta and Ubud have approved IDR bases; Customized Itinerary stays legacy and never shows
  a quoted price.
- `cars` is sent as `1` by the UI; the contract allows 1–10 but there is no UI to choose more.
- Booking tickets are bound to customer + tour + kind, not to date/pickup; the form still requests a
  new ticket whenever a bound detail changes, so behaviour is only as strict as the UI.
- Local verification used Node 24.13.0; CI pins Node 20. Re-run CI on the branch before any merge.
