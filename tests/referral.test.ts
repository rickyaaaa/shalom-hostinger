import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isReferralSlug, isReferralToken, referralAttributionPath, referralPath, referralUrl, REFERRAL_COOKIE } from "../src/lib/referral";
import { accountSchema, inquiryInput } from "../src/lib/customer-types";

const base = { customer:{id:3,name:"QA",country:"",avatar_url:null,email:"qa@example.test",referral_enabled:true}, completed_tours:[], reviews:[], inquiries:{items:[],page:1,has_more:false} };
const token = `eyJwIjoxNywicyI6InJpY2t5IiwidCI6MTc2MTQwMDAwMH0.${"a1".repeat(32)}`;

test("Referral slugs follow the WordPress rules; anything else never reaches WordPress", () => {
  for (const slug of ["ricky", "ricky-adryan", "r2", "partner-17"]) assert.equal(isReferralSlug(slug), true, slug);
  for (const slug of ["", "r", "Ricky", "ricky adryan", "-ricky", "ricky-", "ricky--a", "ricky_a", "../admin", "a".repeat(41), "rícky"]) assert.equal(isReferralSlug(slug), false, slug);
});

test("Only a signed-token shape is ever stored or forwarded", () => {
  assert.equal(isReferralToken(token), true);
  for (const bad of [undefined, "", "ricky", "17", `${token}x`, `payload.${"z".repeat(64)}`, `a.${"a".repeat(63)}`, "x".repeat(600)]) assert.equal(isReferralToken(bad), false, String(bad));
  assert.equal(REFERRAL_COOKIE, "shalom_referral");
});

test("Referral link is the root-level /<slug> on the site origin", () => {
  assert.equal(referralUrl("https://shalombalitour.com", "ricky"), "https://shalombalitour.com/ricky");
  assert.equal(referralUrl("https://shalombalitour.com/", "ricky"), "https://shalombalitour.com/ricky");
  assert.equal(referralUrl("shalombalitour.com", "john-doe"), "shalombalitour.com/john-doe");
  assert.equal(referralUrl("", "ricky"), "/ricky");
});

test("Old /ref/<slug> links continue to /<slug>; anything else goes Home, never off-site", () => {
  assert.equal(referralPath("ricky"), "/ricky");
  assert.equal(referralPath("Ricky"), "/ricky");
  for (const bad of ["", "//evil.example", "/evil", "https://evil.example", "https:evil.example", "..", "../login", "%2F%2Fevil", "ricky/../../x", "ricky?x=1", "a".repeat(41)]) assert.equal(referralPath(bad), "/", bad);
  assert.equal(referralAttributionPath("ricky"), "/api/referral/ricky");
});

test("The root referral entry cannot shadow site routes: every top-level page is an explicit route", () => {
  const app = path.join(import.meta.dirname, "../src/app");
  const dynamic = fs.readdirSync(app, { withFileTypes: true }).filter(entry => entry.isDirectory() && entry.name.startsWith("["));
  assert.deepEqual(dynamic.map(entry => entry.name), ["[slug]"], "only one dynamic root segment");
  const page = fs.readFileSync(path.join(app, "[slug]/page.tsx"), "utf8");
  assert.match(page, /notFound\(\)/, "unknown slugs use the normal Not Found page");
  assert.match(page, /robots: \{ index: false, follow: false \}/, "never an indexable copy of Home");
  for (const route of ["login", "register", "account", "book", "ubud", "south-kuta", "west-bali", "request-help", "reset-password", "forgot-password", "ref", "api"]) assert.ok(fs.existsSync(path.join(app, route)), route);
});

test("Account referral data is optional and strictly shaped", () => {
  assert.equal(accountSchema.parse(base).referral, undefined);
  assert.equal(accountSchema.parse({...base, referral:null}).referral, null);
  assert.deepEqual(accountSchema.parse({...base, referral:{slug:"ricky"}}).referral, {slug:"ricky"});
  for (const bad of [{slug:"Ricky"}, {slug:"x"}, {slug:"../x"}, {}]) assert.equal(accountSchema.safeParse({...base, referral:bad}).success, false, JSON.stringify(bad));
});

test("The browser cannot send referral or partner data with an order", () => {
  const order = {kind:"tour", tour_id:599, requested_travel_date:"2026-12-24", pickup_place:"Svara", pickup_time:"09:00", ticket:"a".repeat(48)};
  assert.equal(inquiryInput.safeParse(order).success, true);
  for (const extra of [{referral:token}, {referral_partner_id:17}, {shalom_referral_token:token}]) assert.equal(inquiryInput.safeParse({...order, ...extra}).success, false, JSON.stringify(extra));
});
