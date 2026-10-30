import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { tourSchema } from "../src/lib/types";
import { bookingInput, inquiryInput } from "../src/lib/customer-types";
import { areaGuides, areas } from "../src/lib/marketing";
import { islandTotal } from "../src/components/BookingForm";
import sitemap from "../src/app/sitemap";

const src = (file: string) => fs.readFileSync(path.join(import.meta.dirname, "../src", file), "utf8");
const tour = {
  id: 701, title: "Lembongan Day Trip", slug: "lembongan-day-trip", area: { slug: "nusa-penida-lembongan", name: "Nusa Penida & Lembongan" }, card_image: null,
  destinations: ["Dream Beach", "Lunch", "Devil’s Tear", "Yellow Bridge"], pricing: { regular: 1350000, sale: null, currency: "IDR" }, duration: "Full day", price_note: "",
  rating: { score: null, review_count: 0 }, booking_terms: { not_included: [], included: ["Boat ticket (round trip)", "Island tour", "Retribution at the island", "Lunch"] },
};
const lembongan = { pricing: "per_person", currency: "IDR", person_price: 1350000, shuttle: { price: 700000, capacity: 6, round_trip: true }, max_persons: 30, bookable: true };

test("Island package data from WordPress 1.33 is read; car tours and older plugins still parse", () => {
  assert.deepEqual(tourSchema.parse({ ...tour, package: lembongan }).package, lembongan);
  assert.equal(tourSchema.parse({ ...tour, package: null }).package, null);
  assert.equal(tourSchema.parse(tour).package, undefined, "a plugin before 1.33 sends no package");
  assert.equal(tourSchema.parse({ ...tour, package: { ...lembongan, person_price: null, bookable: false } }).package?.person_price, null, "not priced yet: null, never 0");
  for (const bad of [{ person_price: 0 }, { person_price: -5 }, { shuttle: { price: 0, capacity: 6, round_trip: true } }, { currency: "USD" }, { pricing: "per_car" }, { max_persons: 0 }]) {
    assert.equal(tourSchema.safeParse({ ...tour, package: { ...lembongan, ...bad } }).success, false, JSON.stringify(bad));
  }
});

test("The order form shows WordPress's arithmetic: people × price, plus the shuttle per car of 6", () => {
  const island = { personPrice: 1350000, shuttle: { price: 700000, capacity: 6 }, maxPersons: 30 };
  assert.deepEqual(islandTotal(island, 2, true), { people: 2700000, cars: 1, carsTotal: 700000, total: 3400000 }, "the client's example: IDR 3,400,000");
  assert.deepEqual(islandTotal(island, 7, true), { people: 9450000, cars: 2, carsTotal: 1400000, total: 10850000 }, "7 people need 2 cars");
  assert.deepEqual(islandTotal(island, 1, false), { people: 1350000, cars: 0, carsTotal: 0, total: 1350000 }, "no shuttle");
  assert.equal(islandTotal({ ...island, shuttle: null }, 3, true).total, 4050000, "no shuttle offered: never charged");
});

test("Orders send the number of people and the shuttle choice, never an amount", () => {
  const order = { kind: "tour", tour_id: 701, requested_travel_date: "2026-11-20", pickup_place: "Puri Sebali Resort", pickup_time: "06:45" };
  assert.equal(bookingInput.safeParse({ ...order, persons: 2, shuttle: true }).success, true);
  assert.equal(inquiryInput.safeParse({ ...order, persons: 2, shuttle: false, ticket: "a".repeat(48) }).success, true);
  assert.equal(bookingInput.safeParse(order).success, true, "car tours send neither");
  for (const bad of [{ persons: 0 }, { persons: 101 }, { persons: 1.5 }, { persons: "2" }, { shuttle: "yes" }, { total: 3400000 }, { person_price: 1 }]) {
    assert.equal(bookingInput.safeParse({ ...order, ...bad }).success, false, JSON.stringify(bad));
  }
  assert.equal(bookingInput.safeParse({ kind: "custom", tour_id: 0, requested_travel_date: "2026-11-20", persons: 2 }).success, false, "Customized Itinerary takes no number of people");
});

test("Island day trips page: SEO copy within limits, no stock photo, in the sitemap and the Itineraries menu", () => {
  const guide = areaGuides["nusa-penida-lembongan"]!;
  assert.ok(`${guide.title} | Shalom Bali Tour`.length <= 60, guide.title);
  assert.ok(guide.metaDescription.length >= 120 && guide.metaDescription.length <= 160, String(guide.metaDescription.length));
  assert.match(guide.metaDescription, /Nusa Penida tour/);
  assert.match(guide.metaDescription, /Nusa Lembongan day trip/);
  assert.equal(guide.perTourTerms, true, "car-tour terms are never shown for island trips");
  assert.doesNotMatch(JSON.stringify(guide) + areas["nusa-penida-lembongan"].description, /\b10[- ]hours?\b|private driver|fuel|IDR [0-9]|\$[0-9]/i, "no car-tour promises and no invented prices");
  assert.equal(areas["nusa-penida-lembongan"].image, null);
  assert.ok(sitemap().some(row => row.url.endsWith("/nusa-penida-lembongan")));
  assert.match(src("components/MobileMenu.tsx"), /\["Nusa Penida & Lembongan","\/nusa-penida-lembongan"\]/);
  assert.match(src("app/api/tours/route.ts"), /"nusa-penida-lembongan"/);
  assert.match(src("lib/wordpress.ts"), /"nusa-penida-lembongan"/);
  assert.match(src("app/nusa-penida-lembongan/page.tsx"), /area="nusa-penida-lembongan"/);
});

test("Cards: per-person price, shuttle note, the package's own terms; no detail page for packages", () => {
  const card = src("components/TourCard.tsx");
  assert.match(card, /\/ person/);
  assert.match(card, /Optional hotel shuttle: \{money\(island\.shuttle\.price, "IDR"\)\} per car, round trip/);
  assert.match(card, /island\.bookable \? <BookingButton/, "Order Now only once WordPress has a price");
  assert.match(card, /Price coming soon/);
  assert.match(src("app/tours/[slug]/page.tsx"), /if \(tour\.package\) redirect\(/, "packages have no written detail page");
  assert.match(src("components/AreaPage.tsx"), /!guide\.perTourTerms && <Suspense/);
});
