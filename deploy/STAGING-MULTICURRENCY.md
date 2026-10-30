# Multi-currency staging runbook (frontend v1.29.0)

Scope: isolate the completed multi-currency frontend on a private preview and prove it against the
corrected WordPress 1.29.0 plugin. Nothing in this document authorizes a production change.

Branch: `feature/shalom-multicurrency` (branch tip at release time). Production `main` is untouched and the
WordPress flag stays OFF.

---

## 1. Which plugin ZIP is the valid one

The candidate was rebuilt after the per-Tour regular/sale price and stale-rate changes, so the earlier
`54ddfde5…` and `99c30840…` archives are obsolete.

| Build | Path | SHA-256 | Verdict |
| --- | --- | --- | --- |
| **Valid candidate** | `custom plugin/login arena shalom tour/portal-1.29/dist/shalom-customer-portal-1.29.0-rc2-f1f95b00.zip` | `f1f95b004d40a2eec867c3dd83a5db73b03cf4d9cf21265523e954a3e57858ce` | **Use this for staging** |
| Obsolete (rc1) | `…/portal-1.29/dist/obsolete/shalom-customer-portal-1.29.0-rc1-99c30840.zip` | `99c30840d01a482fb0c61e8990fa85b9144b79dc950dc685e83bd8b0658a59fc` | Superseded; no sale-price support |
| Obsolete (pre-rc1) | `…/portal-1.29/dist/obsolete/shalom-customer-portal-1.29.0-pre-rc1.zip` | `54ddfde5426114e2f7f36096e2483f5c3d451d7c871275de506304aa5ea787bd` | Superseded; no per-Tour price |
| Stale/wrong lineage | `Wordpress/headless shalom/dist/_quarantine/DO-NOT-INSTALL-shalom-customer-portal-1.29.0-26651a49.zip` | `26651a49be2400f55ce83893223aa64626c74b796ceabe75f901333d308dfd36` | Quarantined; never install |

Why the quarantined ZIP must not be installed: it is not a v1.28.1 descendant. It removes
`class-password-reset.php`, `class-referrals.php`, `class-review-entitlements.php`, `class-avatar.php`,
`class-brevo-mailer.php`, `class-order-codes.php` and `class-phone-login-diagnostics.php`, and exposes a
different REST table (`preferences`, `/quote`, `/customer/orders`) that does not match the frontend.

Verify before installing:

```powershell
Get-FileHash "<path>\shalom-customer-portal-1.29.0-rc2-f1f95b00.zip" -Algorithm SHA256
```

Expected: `F1F95B004D40A2EEC867C3DD83A5DB73B03CF4D9CF21265523E954A3E57858CE`.

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
2. Install the **valid candidate**; activate.
3. **Leave the flag OFF.** Visit Shalom → Settings → confirm the multi-currency option exists and
   `enabled` is unset.
4. Smoke-test the legacy flow with the flag OFF: tour listing, booking, WhatsApp hand-off, login,
   account, reviews. This is the rollback baseline.
5. Refresh the daily rate (Settings → "Refresh exchange rates", or wait for
   `shalom_refresh_exchange_rates`). USD/EUR booking requires status **`ok`**; a `stale` rate still
   renders but refuses new quotes.
6. Check the public endpoint before enabling:
   `GET /wp-json/shalom/v1/currencies` → `{"enabled":false,"default":"USD","supported":["USD"]}`.
7. Enable the flag on **staging only**. Re-check:
   - `enabled: true`, `default: "USD"`, `supported: ["USD","EUR","IDR"]`
   - each rate row has `idr_per_unit`, `effective_date`, `source`, `status`
   - Tour payload carries `price_status` and `prices.amounts` for USD/EUR/IDR
8. Optional per-Tour override: **Tours → edit a South Kuta/Ubud tour → Shalom Tour Data →
   "Tour override (IDR)"**. Only an Administrator sees the input; leave it empty to use the area price.
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
| 18 | Stale rate (5–7 days) | Tour shows "Estimated price · rate <date>", but "Review price" returns **503 `rate_unavailable`**; no quote, no order |
| 19 | Rate unavailable (>7 days / provider down) | "Price unavailable in USD/EUR"; quote blocked with 503 `rate_unavailable`; IDR still books |
| 19a | Per-Tour IDR override | Admin sets a South Kuta/Ubud tour to 1,000,000 → card/quote show the new price; clearing it restores the area price; West Bali has no field |
| 19b | Per-Tour IDR sale | Sale 800,000 → card strikes 56 and shows 50; quote and WhatsApp use 50; clearing removes the discount |
| 19c | Sale validation | Equal/greater than regular rejected; invalid input rejected; lowering an area price below a stored sale is refused with an admin notice |
| 19d | Rounding collision | Sale 899,000 on a 900,000 base both convert to USD 56 → no strikethrough anywhere |
| 19e | Editor role | Sees regular and sale read-only; cannot change or clear either, but can still edit other Tour fields |

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

**Does the backend allow booking with a stale rate? No (since 1.29.0-rc2).** `Currency::quote()` now
requires `status: "ok"` for any USD/EUR quote converted from the IDR base; a `stale`, `unavailable` or
missing rate returns **HTTP 503 with code `rate_unavailable`** and creates no quote and no Inquiry. The
same check runs again in `validate_quote()`, so a quote issued while the rate was current cannot be
confirmed after the rate goes stale. Confirmed orders keep their stored snapshot and retries keep
returning it. IDR and legacy West Bali USD booking never depend on the rate.

Consequences to test and to decide with the client:

- A stale rate still renders labelled prices ("Estimated price") for transparency, but booking is
  blocked until the next successful refresh.
- The fingerprint includes `idr_per_unit` and `rate_date`, so **any** daily refresh still invalidates
  open quotes with `409 quote_changed`, even when the rounded amount is identical.
- Quote TTL is 30 minutes by default (`quote_ttl`, clamped 300–3600 s); `410` only applies before an
  order exists — retries of an existing order return the stored snapshot.
- If the feed is down for more than 7 days, USD/EUR booking stops entirely until it recovers.

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

- Version ambiguity: the intermediate `1.29.0` builds differ; always check the hash. The valid
  candidate is `…-rc2-f1f95b00.zip` (`99c30840…a59fc`); older builds are in `obsolete/` or
  `_quarantine/` and must not be installed.
- The XML ECB feed is parsed by the corrected plugin; an ECB format change or outage degrades to
  `stale` and then `unavailable`.
- Only South Kuta and Ubud have approved IDR bases; Customized Itinerary stays legacy and never shows
  a quoted price.
- `cars` is sent as `1` by the UI; the contract allows 1–10 but there is no UI to choose more.
- Booking tickets are bound to customer + tour + kind, not to date/pickup; the form still requests a
  new ticket whenever a bound detail changes, so behaviour is only as strict as the UI.
- Local verification used Node 24.13.0; CI pins Node 20. Re-run CI on the branch before any merge.
