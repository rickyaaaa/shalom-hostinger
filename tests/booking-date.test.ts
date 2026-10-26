import test from "node:test";
import assert from "node:assert/strict";
import { earliestTravelDate, isOrderableTravelDate, latestTravelDate, TRAVEL_DATE_NOTE } from "../src/lib/booking-date";
import { bookingInput, inquiryInput } from "../src/lib/customer-types";

// Bali (WITA) is UTC+8: 19:59 WITA on 26 Oct 2026 is 11:59 UTC.
const at1959 = new Date("2026-10-26T11:59:00Z");
const at2000 = new Date("2026-10-26T12:00:00Z");

test("Before 20:00 Bali time: tomorrow and later are orderable; today and the past are not", () => {
  assert.equal(earliestTravelDate(at1959), "2026-10-27");
  assert.equal(earliestTravelDate(new Date("2026-10-26T11:59:59Z")), "2026-10-27");
  for (const [date, ok] of [["2026-10-25", false], ["2026-10-26", false], ["2026-10-27", true], ["2026-11-30", true]] as const) assert.equal(isOrderableTravelDate(date, at1959), ok, date);
});

test("At and after 20:00 Bali time: tomorrow closes; the day after tomorrow is the earliest", () => {
  assert.equal(earliestTravelDate(at2000), "2026-10-28");
  assert.equal(earliestTravelDate(new Date("2026-10-26T15:59:59Z")), "2026-10-28");
  for (const [date, ok] of [["2026-10-26", false], ["2026-10-27", false], ["2026-10-28", true]] as const) assert.equal(isOrderableTravelDate(date, at2000), ok, date);
});

test("The Bali calendar is used, not UTC: just after Bali midnight", () => {
  // 00:30 WITA on 27 Oct is still 26 Oct in UTC.
  assert.equal(earliestTravelDate(new Date("2026-10-26T16:30:00Z")), "2026-10-28");
  assert.equal(earliestTravelDate(new Date("2026-12-31T11:00:00Z")), "2027-01-01");
  assert.equal(earliestTravelDate(new Date("2026-12-31T12:00:00Z")), "2027-01-02");
});

test("The device time zone never changes the result", () => {
  const original = process.env.TZ;
  try {
    for (const zone of ["UTC", "America/Los_Angeles", "Europe/London", "Asia/Jakarta", "Pacific/Kiritimati", "Pacific/Pago_Pago"]) {
      process.env.TZ = zone;
      assert.equal(earliestTravelDate(at1959), "2026-10-27", zone);
      assert.equal(earliestTravelDate(at2000), "2026-10-28", zone);
    }
  } finally { if (original === undefined) delete process.env.TZ; else process.env.TZ = original; }
});

test("Two-year window matches WordPress", () => {
  assert.equal(latestTravelDate(at1959), "2028-10-27");
  assert.equal(isOrderableTravelDate("2028-10-27", at1959), true);
  assert.equal(isOrderableTravelDate("2028-10-28", at1959), false);
  assert.equal(isOrderableTravelDate("27-10-2026", at1959), false);
});

test("Customer-facing cutoff note is the client's wording", () => {
  assert.equal(TRAVEL_DATE_NOTE, "Orders must be placed at least one day in advance. Orders for the next day close at 20:00 Bali time.");
  assert.equal(/17[:.]00/.test(TRAVEL_DATE_NOTE), false);
});

test("Customized Itinerary orders carry pickup details but never a fixed itinerary", () => {
  const custom = { kind: "custom", tour_id: 0, requested_travel_date: "2026-11-02", pickup_place: "Komaneka Ubud", pickup_time: "08:30" };
  assert.equal(bookingInput.safeParse(custom).success, true);
  assert.equal(inquiryInput.safeParse({ ...custom, ticket: "a".repeat(48) }).success, true);
  assert.equal(bookingInput.safeParse({ ...custom, tour_id: 599 }).success, false);
  assert.equal(bookingInput.safeParse({ ...custom, pickup_time: "8.30" }).success, false);
});
