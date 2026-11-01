import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { reviewSchema } from "../src/lib/types";
import { ReviewEntry, bookingDateLabel } from "../src/components/ReviewEntry";

const review = {
  tour_id: 7, tour_title: "A. Ubud Tour", area: "Ubud", name: "M***** M*** Amanda", country: "Uganda",
  experience: "Harry made our stay in Bali memorable.", score: 9.3, ratings: { driving_skill: 10, service: 10, car: 8 },
  price: "worth_it", recommend: "yes", booking_date: null, published_at: "2026-10-28T09:12:00+08:00",
};
const card = (data: object) => renderToStaticMarkup(createElement(ReviewEntry, { review: reviewSchema.parse({ ...review, ...data }), showTour: true }));

test("A review with a date shows \"Booking date: 9 October 2025\", whatever its source", () => {
  for (const source of ["verified", "previous_tour", "order"] as const) {
    const html = card({ booking_date: "2025-10-09", booking_date_source: source });
    assert.match(html, /Booking date: <time dateTime="2025-10-09">9 October 2025<\/time>/, source);
  }
  assert.equal(bookingDateLabel("2026-09-10"), "10 September 2026");
});

test("No date: no date line at all, never \"Booking date unavailable\"", () => {
  for (const data of [{ booking_date: null, booking_date_source: null }, { booking_date: null }, { booking_date: "2025-02-30" }, { booking_date: "10/09/2025" }]) {
    const html = card(data);
    assert.doesNotMatch(html, /Booking date/, JSON.stringify(data));
    assert.doesNotMatch(html, /unavailable/i, JSON.stringify(data));
  }
});

test("Public cards never show when the review was written", () => {
  const html = card({ booking_date: "2025-10-09", booking_date_source: "previous_tour" });
  assert.doesNotMatch(html, /Reviewed/);
  assert.doesNotMatch(html, /28 Oct|2026-10-28/);
});

test("Older plugins (no booking_date_source) still parse; unknown sources are refused", () => {
  assert.equal(reviewSchema.safeParse(review).success, true);
  assert.equal(reviewSchema.safeParse({ ...review, booking_date_source: "guess" }).success, false);
});
