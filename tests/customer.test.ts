import test from "node:test";
import assert from "node:assert/strict";
import { sealSession, openSession } from "../src/lib/session-crypto";
import { accountSchema, loginInput, registerInput, forgotInput, resetInput, reviewInput, bookingInput, inquiryInput } from "../src/lib/customer-types";
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
    assert.equal(bookingPath(intent),`/account?tour=${id}#order-tour`);
    assert.equal(intentQuery(intent),`?tour=${id}`);
    assert.equal(bookingInput.safeParse(intent).success,true);
  }
  assert.equal(bookingPath(parseIntent({booking:"custom"})!),"/account?booking=custom#order-tour");
  for(const tour of ["0","-1","523x","https://evil.test",["523"]])assert.equal(parseIntent({tour}),null);
  assert.equal(bookingInput.safeParse({kind:"custom",tour_id:523}).success,false);
  assert.equal(bookingInput.safeParse({kind:"contact",tour_id:0,phone:"forged"}).success,false);
  assert.equal(inquiryInput.safeParse({kind:"tour",tour_id:599,ticket:"x".repeat(48),user_id:1}).success,false);
});
test("requested travel date stays in the booking intent and entitlement DTO is explicit",()=>{
  const intent=parseIntent({tour:"523",requested_travel_date:"2026-12-24"})!;
  assert.deepEqual(intent,{kind:"tour",tour_id:523,requested_travel_date:"2026-12-24"});
  assert.equal(bookingPath(intent),"/account?tour=523&requested_travel_date=2026-12-24#order-tour");
  assert.equal(bookingPath({kind:"custom",tour_id:0,requested_travel_date:"2026-12-24"}),"/account?booking=custom&requested_travel_date=2026-12-24#order-tour");
  assert.equal(intentQuery(intent),"?tour=523&requested_travel_date=2026-12-24");
  assert.equal(bookingInput.safeParse(intent).success,true);
  assert.equal(bookingInput.safeParse({...intent,requested_travel_date:"24-12-2026"}).success,false);
  const account=accountSchema.parse({customer:{name:"QA",country:"ID",avatar_url:null},completed_tours:[],review_entitlements:[{id:"booking-1",tour_id:523,title:"Temple Tour"}],reviews:[],inquiries:{items:[],page:1,has_more:false}});
  assert.equal(account.review_entitlements?.[0].id,"booking-1");
});
test("account DTO strips private upstream fields and session nonce",()=>{
  // 1.16: WordPress sends only a real customer email (never the internal placeholder); everything else private is stripped.
  const parsed = accountSchema.parse({customer:{name:"QA",country:"QA",email:"customer@example.test",user_login:"shalom_internal",user_pass:"hash",shalom_referral_enabled:1},completed_tours:[],reviews:[],inquiries:{items:[],page:1,has_more:false},nonce:"secret"});
  assert.equal("nonce" in parsed,false); assert.equal(parsed.customer.email,"customer@example.test");
  for (const key of ["user_login","user_pass","shalom_referral_enabled"]) assert.equal(key in parsed.customer,false);
});
test("session key tolerates CR/whitespace from hosting env imports but stays strictly hex",()=>{
  const session = {cookie:"wordpress_logged_in_123abc=private-native-token",nonce:"wpnonce",expires:Date.now()+10000};
  process.env.SESSION_ENCRYPTION_KEY = "d9".repeat(32) + "\r";
  const value = sealSession(session);
  process.env.SESSION_ENCRYPTION_KEY = " " + "d9".repeat(32) + "\n";
  assert.deepEqual(openSession(value),session);
  process.env.SESSION_ENCRYPTION_KEY = "d9".repeat(31) + "zz";
  assert.throws(() => sealSession(session));
  delete process.env.SESSION_ENCRYPTION_KEY;
  assert.throws(() => sealSession(session));
});
test("order details are bounded and passed through the BFF schemas",()=>{
  const order={kind:"tour",tour_id:628,requested_travel_date:"2026-11-17",pickup_place:"Svara by Mazari, Uluwatu",pickup_time:"10:00"};
  assert.equal(bookingInput.safeParse(order).success,true);
  assert.equal(inquiryInput.safeParse({...order,ticket:"x".repeat(48)}).success,true);
  const trimmed=bookingInput.parse({...order,pickup_place:"  Hotel  "});
  assert.equal("pickup_place" in trimmed && trimmed.pickup_place,"Hotel");
  for(const bad of [{pickup_time:"24:00"},{pickup_time:"10:00 AM"},{pickup_place:""},{pickup_place:"x".repeat(201)},{requested_travel_date:"17.11.2026"},{user_id:1}])assert.equal(bookingInput.safeParse({...order,...bad}).success,false);
  // Customized Itinerary orders carry the same pickup details (client revision, WordPress 1.22).
  assert.equal(bookingInput.safeParse({kind:"custom",tour_id:0,requested_travel_date:"2026-11-17",pickup_place:"Hotel",pickup_time:"10:00"}).success,true);
  assert.equal(bookingInput.safeParse({kind:"tour",tour_id:628,requested_travel_date:"2026-11-17"}).success,true);
});
test("1.16 auth contracts: one identifier, registration email, email reset, fragment key",()=>{
  for(const identifier of ["harry@example.com","+62 812 3456 7890","081234567890"])assert.equal(loginInput.safeParse({identifier,phone_region_hint:"ID",password:"x"}).success,true);
  assert.equal(loginInput.safeParse({phone:"+6281234567890",phone_region_hint:"ID",password:"x"}).success,true);
  assert.equal(loginInput.safeParse({identifier:"",phone_region_hint:"ID",password:"x"}).success,false);
  assert.equal(loginInput.safeParse({phone_region_hint:"ID",password:"x"}).success,false);
  const signup={full_name:"Harry",phone:"+6281234567890",phone_region_hint:"ID",password:"LongEnough1",confirm_password:"LongEnough1",customer_type:"new_customer",terms:"1"};
  assert.equal(registerInput.safeParse(signup).success,false);
  const parsed=registerInput.parse({...signup,email:"  Harry@Example.COM "});
  assert.equal(parsed.email,"harry@example.com");
  assert.equal(forgotInput.safeParse({email:"harry@example.com"}).success,true);
  assert.equal(forgotInput.safeParse({phone:"+6281234567890",phone_region_hint:"ID"}).success,true);
  assert.equal(forgotInput.safeParse({email:"harry@example.com",user_id:1}).success,false);
  const reset={login:"shalom_abc",key:"AbC123xyz",password:"NewPassword1",confirm_password:"NewPassword1"};
  assert.equal(resetInput.safeParse(reset).success,true);
  for(const bad of [{key:"bad key"},{key:"a/b"},{password:"short",confirm_password:"short"},{login:""}])assert.equal(resetInput.safeParse({...reset,...bad}).success,false);
  const account=accountSchema.parse({customer:{id:1,name:"QA",country:"",avatar_url:null,email:null,referral_enabled:false},completed_tours:[],review_entitlements:[{id:41,tour_id:523,title:"A"},{id:42,tour_id:523,title:"A"}],reviews:[],inquiries:{items:[],page:1,has_more:false}});
  assert.equal(account.customer.referral_enabled,false); assert.equal(account.review_entitlements?.length,2);
});
