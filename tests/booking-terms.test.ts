import test from "node:test";
import assert from "node:assert/strict";
import { tourSchema } from "../src/lib/types";

const tour = { id: 599, title: "A. Uluwatu, Beach & Jimbaran Tour", slug: "a", area: { slug: "south-kuta", name: "South Kuta" }, card_image: null, destinations: ["Uluwatu"], pricing: { regular: 65, sale: 55, currency: "USD" }, duration: "10 Hours", price_note: "", rating: { score: null, review_count: 0 } };
const terms = { not_included: ["Ticket entrance", "Activities booking", "Lunch"], included: ["Driver", "Fuel", "Parking ticket", "More than 10 hours will incur an extra charge of IDR 100,000/hour"] };

test("Booking terms come from WordPress with the itinerary (1.23) and stay optional for older plugins", () => {
  assert.deepEqual(tourSchema.parse({ ...tour, booking_terms: terms }).booking_terms, terms);
  assert.equal(tourSchema.parse(tour).booking_terms, undefined);
});

test("Booking terms are bounded plain-text lists", () => {
  for (const bad of [{ not_included: "lunch", included: [] }, { not_included: [], included: ["x".repeat(301)] }, { not_included: Array(31).fill("x"), included: [] }, { included: [] }]) {
    assert.equal(tourSchema.safeParse({ ...tour, booking_terms: bad }).success, false, JSON.stringify(bad).slice(0, 60));
  }
});
