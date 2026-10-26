import test from "node:test";
import assert from "node:assert/strict";
import {accountSchema,inquiryHistorySchema} from "../src/lib/customer-types";
import {orderNumber} from "../src/lib/account-display";
test("inquiry DTO strips private metadata and accepts only known status/date fields",()=>{
 const parsed=accountSchema.parse({customer:{id:8,name:"Synthetic",country:"GB"},completed_tours:[],reviews:[],inquiries:{page:1,has_more:false,items:[{id:900,title:"A. Tour",status:"inquiry",submitted_at:"2026-10-20T00:05:00Z",user_id:7,admin_url:"https://example.test/wp-admin/",meta:{secret:true}}]},nonce:"private"});
 assert.deepEqual(Object.keys(parsed.inquiries.items[0]),["id","title","submitted_at","status"]);
 assert.equal("nonce" in parsed,false);
 assert.equal(inquiryHistorySchema.safeParse({...parsed.inquiries,items:[{...parsed.inquiries.items[0],status:"internal_status"}]}).success,false);
 assert.equal(inquiryHistorySchema.safeParse({...parsed.inquiries,items:[{...parsed.inquiries.items[0],submitted_at:"yesterday"}]}).success,false);
 assert.equal(inquiryHistorySchema.safeParse({...parsed.inquiries,page:0}).success,false);
 assert.equal(inquiryHistorySchema.safeParse({...parsed.inquiries,items:[{...parsed.inquiries.items[0],submitted_at:null}]}).success,true);
});
test("order history carries the public order code (1.25) and never referral attribution",()=>{
 const base={page:1,has_more:false};
 const item={id:901,title:"A. Uluwatu, Beach & Jimbaran Tour",status:"inquiry",submitted_at:"2026-10-26T01:00:00Z",kind:"tour",travel_date:"2026-10-27"};
 const parsed=inquiryHistorySchema.parse({...base,items:[{...item,order_code:"AU-10001",referral_partner:"Ricky",shalom_inquiry_referral_slug:"ricky"}]});
 assert.equal(parsed.items[0].order_code,"AU-10001");
 assert.equal(JSON.stringify(parsed).toLowerCase().includes("ricky"),false);
 for(const ok of [null,undefined,"ID-10002","XX-10005","SG-123456"])assert.equal(inquiryHistorySchema.safeParse({...base,items:[{...item,order_code:ok}]}).success,true,String(ok));
 for(const bad of ["au-10001","AU10001","AU-RICKY-10001","AUS-10001","AU-0001","AU-01234","<b>AU-10001</b>"])assert.equal(inquiryHistorySchema.safeParse({...base,items:[{...item,order_code:bad}]}).success,false,bad);
});
test("customers see only the order number (#10001); the stored code keeps its country part for admin",()=>{
 assert.equal(orderNumber("AU-10001"),"#10001");
 assert.equal(orderNumber("XX-10005"),"#10005");
 assert.equal(orderNumber("ID-123456"),"#123456");
});
