import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { tourSchema, type Tour } from "../src/lib/types";
import { availableCurrencies, priceView, rateDateLabel, resolveCurrency } from "../src/lib/currency";
import { money } from "../src/lib/format";
import { accountSchema, bookingInput, inquiryInput, quoteSchema, type Quote } from "../src/lib/customer-types";
import { CurrencySelectorView } from "../src/components/CurrencySelector";
import { QuoteCard } from "../src/components/QuoteCard";
import { TourPriceView } from "../src/components/TourPrice";

const legacyTour: Tour = {
  id: 599, title: "A. Uluwatu, Beach & Jimbaran Tour", slug: "a", area: { slug: "south-kuta", name: "South Kuta" },
  card_image: null, destinations: ["Uluwatu"], pricing: { regular: 75, sale: 45, currency: "USD" },
  duration: "10 Hours", price_note: "", rating: { score: null, review_count: 0 },
};

const convertedTour: Tour = {
  ...legacyTour,
  price_status: "converted",
  prices: {
    base: { currency: "IDR", regular: 900000, sale: null },
    rate_date: "2026-10-27",
    amounts: {
      USD: { regular: 56, sale: null, status: "ok" },
      EUR: { regular: 52, sale: null, status: "ok" },
      IDR: { regular: 900000, sale: null, status: "ok" },
    },
  },
};

const westBaliTour: Tour = {
  ...legacyTour,
  area: { slug: "west-bali", name: "West Bali" },
  pricing: { regular: 65, sale: 50, currency: "USD" },
  price_status: "legacy",
  prices: {
    base: null,
    rate_date: null,
    amounts: {
      USD: { regular: 65, sale: 50, status: "ok" },
      EUR: { regular: null, sale: null, status: "unavailable" },
      IDR: { regular: null, sale: null, status: "unavailable" },
    },
  },
};

const quote: Quote = {
  id: "shq_9f1c2b3a4d5e6f708192a3b4c5d6e7f8",
  fingerprint: "6d0c0e8a5a9c1d2e3f405162738495a6b7c8d9e0f1a2b3c4d5e6f708192a3b",
  currency: "EUR", amount: 52, regular_amount: 52, sale_amount: null,
  base_idr: 900000, sale_base_idr: null, idr_per_unit: 17610.20,
  rate_date: "2026-10-27", rate_source: "ECB", status: "ok",
  per_car: true, cars: 1, version: 1,
  quoted_at: "2026-10-28T09:12:44+00:00", expires_at: "2026-10-28T09:42:44+00:00",
};

test("v1.29 Tour prices parse additively and v1.28.1 tours still parse", () => {
  assert.equal(tourSchema.parse(convertedTour).price_status, "converted");
  assert.equal(tourSchema.parse(convertedTour).prices?.base?.regular, 900000);
  assert.equal(tourSchema.parse(legacyTour).prices, undefined);
  assert.equal(tourSchema.safeParse({ ...convertedTour, prices: { ...convertedTour.prices, rate_date: "27.10.2026" } }).success, false);
});

test("price selection uses only backend amounts and never treats a stale legacy sale as a discount", () => {
  const usd = priceView(convertedTour, "USD");
  assert.equal(usd.kind, "available");
  if (usd.kind !== "available") return;
  assert.equal(usd.current, 56);
  assert.equal(usd.sale, null);
  assert.equal(usd.discounted, false, "converted sale:null is not a discount even though legacy pricing.sale is 45");
  assert.equal(usd.perCar, true);
  const eur = priceView(convertedTour, "EUR");
  assert.equal(eur.kind === "available" && eur.current, 52);
  const idr = priceView(convertedTour, "IDR");
  assert.equal(idr.kind === "available" && idr.current, 900000);
});

test("legacy West Bali keeps USD only; EUR/IDR are an honest unavailable state, never zero", () => {
  const usd = priceView(westBaliTour, "USD");
  assert.equal(usd.kind === "available" && usd.current, 50);
  assert.equal(usd.kind === "available" && usd.perCar, false);
  assert.deepEqual(availableCurrencies(westBaliTour), ["USD"]);
  assert.deepEqual(priceView(westBaliTour, "EUR"), { kind: "unavailable", currency: "EUR" });
  assert.deepEqual(priceView(westBaliTour, "IDR"), { kind: "unavailable", currency: "IDR" });
});

test("old v1.28.1 Tour without prices still uses its existing legacy display", () => {
  const view = priceView(legacyTour, "USD");
  assert.equal(view.kind === "available" && view.current, 45);
  assert.equal(view.kind === "available" && view.perCar, false);
  assert.deepEqual(availableCurrencies(legacyTour), ["USD"]);
});

test("currency formatting preserves the backend amount and IDR thousands separators", () => {
  assert.match(money(900000, "IDR"), /^IDR[\s\u00a0]900,000$/);
  assert.equal(money(52, "EUR"), "\u20ac52");
  assert.equal(rateDateLabel("2026-10-27"), "27 Oct 2026");
});

test("signed-in preference never inherits another account's guest currency", () => {
  assert.equal(resolveCurrency({ source: "explicit", currency: "IDR", recommended: "USD" }, "EUR"), "IDR");
  assert.equal(resolveCurrency({ source: "recommended", currency: "EUR", recommended: "USD" }, "EUR"), "USD");
  assert.equal(resolveCurrency({ source: "default", currency: "USD", recommended: "USD" }, "EUR"), "USD");
  assert.equal(resolveCurrency(null, "EUR"), "EUR", "guest keeps their own browser choice");
  assert.equal(resolveCurrency(null, null), "USD");
});

test("quote, currency preference and order-history quote schemas are strict and optional", () => {
  assert.equal(quoteSchema.parse(quote).per_car, true);
  assert.equal(quoteSchema.safeParse({ ...quote, currency: "GBP" }).success, false);
  assert.equal(quoteSchema.safeParse({ ...quote, id: "not-a-quote" }).success, false);
  const base = { customer: { name: "QA", country: "ID" }, completed_tours: [], reviews: [], inquiries: { items: [], page: 1, has_more: false } };
  assert.equal(accountSchema.parse(base).currency_preference, undefined);
  const parsed = accountSchema.parse({
    ...base,
    currency_preference: { currency: "EUR", source: "explicit", updated_at: "2026-10-28T09:12:44+00:00", recommended: "EUR", options: ["USD", "EUR", "IDR"] },
    inquiries: { ...base.inquiries, items: [{ id: 1, title: "Tour", status: "completed", submitted_at: null, quote }] },
  });
  assert.equal(parsed.currency_preference?.source, "explicit");
  assert.equal(parsed.inquiries.items[0].quote?.amount, 52);
});

test("booking and inquiry schemas accept optional currency/cars/quote_id only where supported", () => {
  assert.equal(bookingInput.safeParse({ kind: "tour", tour_id: 599, currency: "EUR", cars: 1 }).success, true);
  assert.equal(bookingInput.safeParse({ kind: "tour", tour_id: 599, currency: "GBP" }).success, false);
  assert.equal(bookingInput.safeParse({ kind: "tour", tour_id: 599, cars: 11 }).success, false);
  assert.equal(inquiryInput.safeParse({ kind: "tour", tour_id: 599, ticket: "a".repeat(48), currency: "EUR", cars: 1, quote_id: quote.id }).success, true);
  assert.equal(inquiryInput.safeParse({ kind: "tour", tour_id: 599, ticket: "a".repeat(48), quote_id: "bad" }).success, false);
  assert.equal(bookingInput.safeParse({ kind: "custom", tour_id: 0, currency: "EUR" }).success, false);
});

test("currency selector is a labelled native select with no flag emoji and live status", () => {
  const html = renderToStaticMarkup(createElement(CurrencySelectorView, {
    id: "currency-test", variant: "inline", label: "Currency", currency: "EUR",
    supported: ["USD", "EUR", "IDR"], saving: false, error: "", onChange: () => {},
  }));
  assert.match(html, /<label[^>]*for="currency-test"[^>]*>Currency<\/label>/);
  assert.match(html, /<select[^>]*id="currency-test"/);
  assert.match(html, /aria-label="Currency for displayed prices"/);
  assert.match(html, /EUR .* Euro/);
  assert.match(html, /role="status"/);
  assert.doesNotMatch(html, /[\u{1F1E6}-\u{1F1FF}]/u, "no flag emoji");
});

test("quote card presents the backend amount, per-car basis, rate and confirmation actions", () => {
  const html = renderToStaticMarkup(createElement(QuoteCard, {
    quote: { ...quote, status: "ok" }, title: "A. Ubud Tour", travelDate: "2026-11-02",
    pickupPlace: "Svara by Mazari", pickupTime: "10:00", busy: false, onConfirm: () => {}, onChange: () => {},
  }));
  assert.match(html, /Confirm before WhatsApp/);
  assert.match(html, /\u20ac52/);
  assert.match(html, /per car/);
  assert.match(html, /Indicative price/);
  assert.match(html, /1 EUR = IDR 17,610.2/);
  assert.match(html, /Confirm price &amp; continue/);
  assert.match(html, /Change details/);
});


const saleTour: Tour = {
  ...convertedTour,
  prices: {
    ...convertedTour.prices!,
    amounts: {
      USD: { regular: 56, sale: 50, status: "ok" },
      EUR: { regular: 52, sale: 47, status: "ok" },
      IDR: { regular: 900000, sale: 800000, status: "ok" },
    },
  },
};

test("a per-Tour sale is selected in every currency and both amounts follow the switch", () => {
  const usd = priceView(saleTour, "USD");
  assert.equal(usd.kind === "available" && usd.current, 50);
  assert.equal(usd.kind === "available" && usd.regular, 56);
  assert.equal(usd.kind === "available" && usd.discounted, true);
  const eur = priceView(saleTour, "EUR");
  assert.equal(eur.kind === "available" && eur.current, 47);
  assert.equal(eur.kind === "available" && eur.regular, 52);
  const idr = priceView(saleTour, "IDR");
  assert.equal(idr.kind === "available" && idr.current, 800000);
  assert.equal(idr.kind === "available" && idr.regular, 900000);
});

test("rounding that makes regular and sale equal never renders a strikethrough", () => {
  const collision: Tour = {
    ...saleTour,
    prices: { ...saleTour.prices!, amounts: { ...saleTour.prices!.amounts, USD: { regular: 56, sale: 56, status: "ok" } } },
  };
  const view = priceView(collision, "USD");
  assert.equal(view.kind === "available" && view.discounted, false);
  const html = renderToStaticMarkup(createElement(TourPriceView, { tour: collision, currency: "USD" }));
  assert.doesNotMatch(html, /<del>/);
  assert.match(html, /US\$56|56/);
});

test("the tour card strikes the regular price only when the backend sale is lower", () => {
  const discounted = renderToStaticMarkup(createElement(TourPriceView, { tour: saleTour, currency: "USD" }));
  assert.match(discounted, /<del>/);
  assert.match(discounted, /per car/);
  const plain = renderToStaticMarkup(createElement(TourPriceView, { tour: convertedTour, currency: "USD" }));
  assert.doesNotMatch(plain, /<del>/);
});

test("the quote card shows the struck regular amount only for a real discount", () => {
  const props = { title: "A. Ubud Tour", travelDate: "2026-11-02", pickupPlace: "Svara by Mazari", pickupTime: "10:00", busy: false, onConfirm: () => {}, onChange: () => {} };
  const discounted = renderToStaticMarkup(createElement(QuoteCard, { ...props, quote: { ...quote, regular_amount: 56, amount: 50, currency: "USD" } }));
  assert.match(discounted, /<del>\$56<\/del>/);
  assert.match(discounted, /\$50/);
  const plain = renderToStaticMarkup(createElement(QuoteCard, { ...props, quote: { ...quote, regular_amount: 50, amount: 50, currency: "USD" } }));
  assert.doesNotMatch(plain, /<del>/);
});
