import { test } from "node:test";
import assert from "node:assert/strict";
import { tourSchema, reviewPageSchema, reviewSchema } from "../src/lib/types";
import { money } from "../src/lib/format";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReviewEntry } from "../src/components/ReviewEntry";

const tour = {
  id: 523, title: "A. Ubud Tour", slug: "a-ubud-tour", area: { slug: "ubud", name: "Ubud" },
  card_image: null, destinations: [], pricing: { regular: 65, sale: 55, currency: "USD" },
  duration: "10 Hours", price_note: "", rating: { score: null, review_count: 0 },
};

test("canonical contract accepts absent optional content without fabricating it", () => {
  assert.equal(tourSchema.parse(tour).card_image, null);
  assert.deepEqual(tourSchema.parse(tour).destinations, []);
  assert.equal(tourSchema.parse(tour).rating.score, null);
});

test("prices are structured numbers, including zero; legacy formatted strings are rejected", () => {
  assert.equal(tourSchema.parse({ ...tour, pricing: { regular: 0, sale: null, currency: null } }).pricing.regular, 0);
  assert.equal(tourSchema.safeParse({ ...tour, pricing: { regular: "$65", sale: 55, currency: "USD" } }).success, false);
  assert.equal(tourSchema.safeParse({ ...tour, pricing: { regular: -65, sale: 55, currency: "USD" } }).success, false);
  assert.equal(money(0, "USD"), "$0");
});

test("old HTML-only reviews response cannot become a runtime data source", () => {
  assert.equal(reviewPageSchema.safeParse({ title: "A. Ubud Tour", summary_html: "<b>9.9</b>", html: "<p>Review</p>", has_more: false, next_page: null }).success, false);
});

test("new reviews response ignores compatibility HTML and preserves backend summary", () => {
  const data = reviewPageSchema.parse({ title: "A. Ubud Tour", summary: { score: 8.7, review_count: 3 }, reviews: [], has_more: false, next_page: null, html: "<script>bad()</script>", summary_html: "unused" });
  assert.equal(data.summary.score, 8.7);
  assert.equal("html" in data, false);
  assert.equal("summary_html" in data, false);
});

test("historical reviews support nullable flags/date and zero missing dimension values", () => {
  const data = reviewSchema.parse({ tour_id: 523, tour_title: "A. Ubud Tour", area: "Ubud", name: "T****", country: "", experience: "Example test-only review", score: 0, ratings: { driving_skill: 0, service: 0, car: 0 }, price: null, recommend: null, booking_date: null, published_at: "2026-10-18T00:00:00+00:00", email: "private@example.test", customer_id: 42 });
  assert.equal(data.booking_date, null);
  assert.equal("email" in data, false);
  assert.equal("customer_id" in data, false);
});

test("negative review verdicts remain visible and the experience leads the masked identity", () => {
  const review = reviewSchema.parse({ tour_id: 523, tour_title: "A. Ubud Tour", area: "Ubud", name: "T****", country: "Local QA", experience: "Test experience", score: 5, ratings: { driving_skill: 5, service: 5, car: 5 }, price: "not_worth_it", recommend: "no", booking_date: null, published_at: "2026-10-18T00:00:00+00:00" });
  const html = renderToStaticMarkup(createElement(ReviewEntry, { review }));
  assert.match(html, />Not Worth It</);
  assert.match(html, />Not Recommended</);
  assert.ok(html.indexOf("Test experience") < html.indexOf("T****"));
});
