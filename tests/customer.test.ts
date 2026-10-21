import test from "node:test";
import assert from "node:assert/strict";
import { sealSession, openSession } from "../src/lib/session-crypto";
import { accountSchema, loginInput, reviewInput, bookingInput, inquiryInput } from "../src/lib/customer-types";
import { bookingPath,parseIntent,intentQuery } from "../src/lib/booking-intent";
test("sealed session is encrypted, tamper-resistant and expires",()=>{
  process.env.SESSION_ENCRYPTION_KEY = "b7".repeat(32);
  const session = {cookie:"wordpress_logged_in_123abc=private-native-token",nonce:"wpnonce",expires:Date.now()+10000};
  const value = sealSession(session);
  assert.deepEqual(openSession(value),session);
  assert.ok(!Buffer.from(value,"base64url").includes(Buffer.from("private-native-token")));
  const changed = Buffer.from(value,"base64url"); changed[35] ^= 1;
  assert.equal(openSession(changed.toString("base64url")),null);
  assert.equal(openSession(sealSession({...session,expires:Date.now()-1})),null);
  process.env.SESSION_ENCRYPTION_KEY = "c8".repeat(32);
  assert.equal(openSession(value),null);
});
test("customer writes reject forged identity and invalid review values",()=>{
  assert.equal(loginInput.safeParse({phone:"+6281234567890",phone_region_hint:"ID",password:"test",user_id:1}).success,false);
  const review = {tour_id:523,driving_skill:"10",service:"9",car:"8",price:"not_worth_it",recommend:"no",experience:"My experience"};
  assert.equal(reviewInput.safeParse(review).success,true);
  assert.equal(reviewInput.safeParse({...review,tour_id:566}).success,true);
  assert.equal(reviewInput.safeParse({...review,tour_id:-1}).success,false);
  assert.equal(reviewInput.safeParse({...review,service:"11"}).success,false);
});
test("booking return intent permits only canonical Tour IDs or custom requests",()=>{
  for(const id of [523,599,633]){
    const intent=parseIntent({tour:String(id)})!;
    assert.equal(bookingPath(intent),`/book/${id}`);
    assert.equal(intentQuery(intent),`?tour=${id}`);
    assert.equal(bookingInput.safeParse(intent).success,true);
  }
  assert.equal(bookingPath(parseIntent({booking:"custom"})!),"/book/custom");
  for(const tour of ["0","-1","523x","https://evil.test",["523"]])assert.equal(parseIntent({tour}),null);
  assert.equal(bookingInput.safeParse({kind:"custom",tour_id:523}).success,false);
  assert.equal(bookingInput.safeParse({kind:"contact",tour_id:0,phone:"forged"}).success,false);
  assert.equal(inquiryInput.safeParse({kind:"tour",tour_id:599,ticket:"x".repeat(48),user_id:1}).success,false);
});
test("account DTO strips private upstream fields and session nonce",()=>{
  const parsed = accountSchema.parse({customer:{name:"QA",country:"QA",email:"private@example.test"},completed_tours:[],reviews:[],inquiries:{items:[],page:1,has_more:false},nonce:"secret"});
  assert.equal("nonce" in parsed,false); assert.equal("email" in parsed.customer,false);
});
