# Multi-currency frontend integration (v1.29.0)

Status: implemented and verified locally against the corrected WordPress plugin v1.29.0. No production deployment, WordPress change, or feature-flag activation was performed by this work.

## Data flow

- WordPress is the only authority for pricing. The frontend never fetches exchange rates and never converts amounts.
- `GET /currencies` is fetched by the root server layout. A v1.28.1 404 is treated as feature-off, not as a page failure.
- Tour data carries optional `prices` and `price_status`; legacy `pricing` remains for old backends.
- Guests default to USD. A guest selection is stored in `localStorage` under `shalom_currency`.
- Signed-in customers use `currency_preference` from `GET /customer/me`. Explicit preferences win; otherwise the backend recommendation wins, even over an earlier guest/browser selection. Signed-in choices are never written to the guest `localStorage` bucket, so one account's preference cannot leak into another.
- Changing currency calls `POST /customer/currency` through the existing authenticated BFF. The response is authoritative and is written back to browser state.
- A tour without a price in the selected currency shows "Price unavailable in X", never zero.

## Existing booking flow, extended

1. `POST /customer/booking-ticket` with the existing order fields plus optional `currency` and `cars`.
2. If multi-currency is enabled, the response includes `{ticket, quote}`.
3. The form shows a confirmation card with the backend amount, per-car label, base and rate date/status.
4. `POST /customer/inquiries` repeats the same ticket, currency and optional `quote_id`/`cars`.
5. The returned `whatsapp_url` is used unchanged.
6. `409 quote_changed` replaces the displayed quote and requires a fresh ticket plus explicit confirmation.
7. `410 quote_expired` returns the form to edit and requires a fresh price.
8. Retrying the same completed ticket returns the stored snapshot and identical WhatsApp URL.

No `/customer/orders` route or separate checkout exists.

## WordPress contract consumed

- `GET /currencies` - `{enabled, default, supported, base?, rates?, display?}`.
- `GET /tours`, `GET /tours/{id}` - legacy `pricing` plus optional `price_status` and `prices`.
- `POST /customer/booking-ticket` - existing payload plus optional `currency` and `cars`; response may add `quote`.
- `POST /customer/inquiries` - existing payload plus optional `currency`, `quote_id`, `cars`; response may add `quote`; errors carry `code` and `data.quote`.
- `GET /customer/me` - optional `currency_preference` and per-order `quote`.
- `POST /customer/currency` - `{currency}`; returns the authoritative preference.

## Quotes and rate consistency

Every monetary example generated for this integration uses one deterministic fixture: `1 USD = 16,285.50 IDR`, `1 EUR = 17,610.20 IDR`. The same rate document is used by `/currencies`, Tour `prices`, `booking-ticket` quotes and `inquiries` snapshots; the fixture produces USD 56 and EUR 52 for an IDR 900,000 per-car tour. The higher values quoted in an earlier review message (`18,138.60` / `20,224.54`) came from a separate live ECB sample and are not used by any page, quote or test. The frontend never derives one from another.

## UI behavior

- Selector: native select with code/name options, no flag emoji, visible in the desktop header and mobile menu; an inline copy appears on fixed-itinerary booking forms.
- At <=1024px the header copy is hidden and the mobile disclosure keeps the control accessible.
- Converting tours show `per car`; West Bali legacy tours keep their existing USD display and do not show a per-car claim.
- Non-IDR quotes show an indicative note and the backend rate date/source.
- Order history shows the stored quote amount/currency and never recalculates old orders.

## Release prerequisites

1. Install the corrected WordPress v1.29.0 plugin on staging.
2. Keep the flag OFF, refresh the daily rate, and verify `ok`/`stale`.
3. Enable the flag on staging only.
4. Deploy this frontend against the v1.29.0 API.
5. Re-run the existing backend, frontend, typecheck and build checks.
6. Obtain explicit approval before production activation or any live price action.

Rollback: deploy the frontend with the flag OFF; it tolerates v1.28.1 and hides all currency UI.
