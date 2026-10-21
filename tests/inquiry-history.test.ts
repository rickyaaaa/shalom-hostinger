import test from "node:test";
import assert from "node:assert/strict";
import {accountSchema,inquiryHistorySchema} from "../src/lib/customer-types";
test("inquiry DTO strips private metadata and accepts only known status/date fields",()=>{
 const parsed=accountSchema.parse({customer:{id:8,name:"Synthetic",country:"GB"},completed_tours:[],reviews:[],inquiries:{page:1,has_more:false,items:[{id:900,title:"A. Tour",status:"inquiry",submitted_at:"2026-10-20T00:05:00Z",user_id:7,admin_url:"https://example.test/wp-admin/",meta:{secret:true}}]},nonce:"private"});
 assert.deepEqual(Object.keys(parsed.inquiries.items[0]),["id","title","submitted_at","status"]);
 assert.equal("nonce" in parsed,false);
 assert.equal(inquiryHistorySchema.safeParse({...parsed.inquiries,items:[{...parsed.inquiries.items[0],status:"internal_status"}]}).success,false);
 assert.equal(inquiryHistorySchema.safeParse({...parsed.inquiries,items:[{...parsed.inquiries.items[0],submitted_at:"yesterday"}]}).success,false);
 assert.equal(inquiryHistorySchema.safeParse({...parsed.inquiries,page:0}).success,false);
 assert.equal(inquiryHistorySchema.safeParse({...parsed.inquiries,items:[{...parsed.inquiries.items[0],submitted_at:null}]}).success,true);
});
