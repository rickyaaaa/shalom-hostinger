import test from "node:test";
import assert from "node:assert/strict";
import { accountSchema, customerSchema, profileNameInput } from "../src/lib/customer-types";
import { orderStatus, tourDateLabel } from "../src/lib/account-display";

const base = { customer:{id:3,name:"QA",country:"",avatar_url:null,email:"qa@example.test",referral_enabled:false}, completed_tours:[], reviews:[], inquiries:{items:[],page:1,has_more:false} };
const row = { id:900, title:"A. Tour", status:"inquiry", submitted_at:"2026-10-20T00:05:00Z" };

test("1.18 order rows keep their order details; 1.17 rows still parse", () => {
  const parsed = accountSchema.parse({...base, inquiries:{...base.inquiries, items:[{...row, kind:"tour", travel_date:"2026-11-02", booking_date:null, pickup_place:"Svara by Mazari, Uluwatu", pickup_time:"08:30", user_id:7}, row]}});
  assert.deepEqual(parsed.inquiries.items[0], {...row, kind:"tour", travel_date:"2026-11-02", booking_date:null, pickup_place:"Svara by Mazari, Uluwatu", pickup_time:"08:30"});
  assert.deepEqual(Object.keys(parsed.inquiries.items[1]), ["id","title","submitted_at","status"]);
  for (const bad of [{travel_date:"2026-02-31"}, {pickup_time:"25:00"}, {kind:"admin"}, {booking_date:"soon"}]) {
    assert.equal(accountSchema.safeParse({...base, inquiries:{...base.inquiries, items:[{...row, ...bad}]}}).success, false, JSON.stringify(bad));
  }
});

test("Completed comes only from the WordPress status, never from a past travel date", () => {
  assert.equal(orderStatus.completed.label, "Completed");
  for (const status of ["inquiry","confirmed"] as const) assert.equal(orderStatus[status].label, "Not completed");
  assert.equal(orderStatus.cancelled.label, "Cancelled");
  assert.equal(tourDateLabel({travel_date:"2020-01-01", booking_date:null}), "1 Jan 2020 (requested)");
  assert.equal(tourDateLabel({travel_date:"2026-12-01", booking_date:"2026-12-02"}), "2 Dec 2026 (confirmed)");
  assert.equal(tourDateLabel({}), "Not set yet");
});

test("Customer Service link is accepted only as a wa.me URL", () => {
  assert.equal(accountSchema.parse({...base, support_whatsapp_url:"https://wa.me/6282188757700?text=Hi"}).support_whatsapp_url, "https://wa.me/6282188757700?text=Hi");
  for (const bad of ["https://evil.example/wa.me/1", "javascript:alert(1)", "http://wa.me/1"]) assert.equal(accountSchema.safeParse({...base, support_whatsapp_url:bad}).success, false, bad);
  assert.equal(accountSchema.parse(base).support_whatsapp_url, undefined);
});

test("Entitlements name their source booking; legacy grants have none", () => {
  const parsed = accountSchema.parse({...base, review_entitlements:[{id:41,tour_id:523,title:"A",inquiry_id:900},{id:42,tour_id:523,title:"A",inquiry_id:null},{id:"legacy-5",tour_id:5,title:"B"}]});
  assert.deepEqual(parsed.review_entitlements?.map(item => item.inquiry_id), [900, null, undefined]);
});

test("Name update input is trimmed, bounded and carries no account selector", () => {
  assert.deepEqual(profileNameInput.parse({display_name:"  Ana Maria "}), {display_name:"Ana Maria"});
  for (const bad of [{display_name:"A"}, {display_name:"n".repeat(101)}, {display_name:"Ana", user_id:7}, {name:"Ana"}]) assert.equal(profileNameInput.safeParse(bad).success, false, JSON.stringify(bad));
  assert.equal("user_login" in customerSchema.parse({...base.customer, user_login:"internal"}), false);
});
