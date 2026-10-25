import test from "node:test";
import assert from "node:assert/strict";
import { accountSchema, previousTourInput, previousTourResult } from "../src/lib/customer-types";

const base = { customer:{id:3,name:"QA",country:"",avatar_url:null,email:"qa@example.test",referral_enabled:false}, completed_tours:[], reviews:[], inquiries:{items:[],page:1,has_more:false} };
const valid = { area:"ubud", tour_id:580, tour_date:"2023-07-14", pickup_place:"  Svara by Mazari, Uluwatu " };
const summary = { eligible:true, limit:3, used:1, remaining:2, items:[{title:"D. UBUD FUN & RELAX A", area:"Ubud", tour_date:"2023-07-14", pickup_place:"Svara by Mazari, Uluwatu", status:"ready"}] };

test("Give Comment input: canonical area, numeric Tour ID, ISO date, pickup place and nothing else", () => {
  assert.deepEqual(previousTourInput.parse(valid), {...valid, pickup_place:"Svara by Mazari, Uluwatu"});
  for (const area of ["south-kuta","ubud","west-bali"]) assert.equal(previousTourInput.safeParse({...valid, area}).success, true, area);
  for (const bad of [{area:"nusa-penida"}, {area:"Ubud"}, {tour_id:"580"}, {tour_id:0}, {tour_id:1.5}, {tour_date:"14/07/2023"}, {tour_date:"2023-02-30"}, {pickup_place:"   "}, {pickup_place:"x".repeat(201)}]) {
    assert.equal(previousTourInput.safeParse({...valid, ...bad}).success, false, JSON.stringify(bad));
  }
});

test("Give Comment input carries no pickup time, owner or allowance fields", () => {
  for (const extra of [{pickup_time:"08:00"}, {user_id:7}, {customer_id:7}, {remaining:3}, {customer_type:"existing_customer"}, {entitlement_id:41}]) {
    assert.equal(previousTourInput.safeParse({...valid, ...extra}).success, false, JSON.stringify(extra));
  }
});

test("Account parses the previous-tour allowance and still renders on a 1.19 backend without it", () => {
  const parsed = accountSchema.parse({...base, previous_tour_reviews:summary, review_entitlements:[{id:41,tour_id:580,title:"D. UBUD FUN & RELAX A",inquiry_id:null,source:"previous_tour",previous_tour:{area:"Ubud",tour_date:"2023-07-14",pickup_place:"Svara"}}, {id:42,tour_id:523,title:"A. Ubud Tour",inquiry_id:900,source:"booking"}]});
  assert.equal(parsed.previous_tour_reviews?.remaining, 2);
  assert.deepEqual(parsed.review_entitlements?.map(row => row.source), ["previous_tour","booking"]);
  assert.equal(parsed.review_entitlements?.[0].previous_tour?.tour_date, "2023-07-14");
  assert.equal(accountSchema.parse(base).previous_tour_reviews, undefined);
  for (const bad of [{...summary, remaining:-1}, {...summary, items:[{...summary.items[0], status:"approved"}]}, {...summary, eligible:"yes"}]) assert.equal(accountSchema.safeParse({...base, previous_tour_reviews:bad}).success, false, JSON.stringify(bad).slice(0, 80));
  assert.equal(accountSchema.safeParse({...base, review_entitlements:[{id:41,tour_id:580,title:"A",source:"free"}]}).success, false);
});

test("Give Comment result returns the bound entitlement and the updated counter", () => {
  const result = previousTourResult.parse({entitlement:{id:41,tour_id:580,title:"D. UBUD FUN & RELAX A",inquiry_id:null,source:"previous_tour",previous_tour:{area:"Ubud",tour_date:"2023-07-14",pickup_place:"Svara"}}, previous_tour_reviews:summary, internal:"dropped"});
  assert.equal(result.entitlement.tour_id, 580);
  assert.equal("internal" in result, false);
  assert.equal(previousTourResult.safeParse({entitlement:{id:41,tour_id:580,title:"A"}}).success, false);
});
