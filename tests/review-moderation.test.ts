import test from "node:test";
import assert from "node:assert/strict";
import { accountSchema } from "../src/lib/customer-types";

const base = { customer: { id: 8, name: "Synthetic", country: "AU" }, completed_tours: [], inquiries: { page: 1, has_more: false, items: [] } };
const review = { id: 41, tour_id: 599, title: "A. Uluwatu, Beach & Jimbaran Tour", experience: "Great day.", status: "pending" };

test("My Reviews shows each review's moderation state from WordPress (1.26): pending, published or rejected", () => {
  for (const status of ["pending", "approved", "rejected"]) {
    assert.equal(accountSchema.parse({ ...base, reviews: [{ ...review, status }] }).reviews[0].status, status);
  }
  for (const status of ["spam", "trash", "published", ""]) {
    assert.equal(accountSchema.safeParse({ ...base, reviews: [{ ...review, status }] }).success, false, status);
  }
});

test("Review data carries no moderation internals or review source", () => {
  const parsed = accountSchema.parse({ ...base, reviews: [{ ...review, source: "booking", shalom_review_moderation: "rejected", entitlement_id: 77 }] });
  assert.deepEqual(Object.keys(parsed.reviews[0]).sort(), ["experience", "id", "status", "title", "tour_id"]);
});
