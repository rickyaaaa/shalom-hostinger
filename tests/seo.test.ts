import assert from "node:assert/strict";
import test from "node:test";
import { publicMetadata, privateRobots } from "../src/lib/seo";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";

test("preview remains noindex; approved indexing exposes only public pages",()=>{
 const saved={indexing:process.env.ALLOW_INDEXING,public:process.env.PUBLIC_SITE_URL};
 try{
  process.env.PUBLIC_SITE_URL="https://shalombalitour.com";
  process.env.ALLOW_INDEXING="false";
  assert.deepEqual(publicMetadata("Title","Description","/ubud").robots,{index:false,follow:false});
  assert.deepEqual(robots().rules,{userAgent:"*",disallow:"/"});
  process.env.ALLOW_INDEXING="true";
  for(const path of ["/","/ubud","/south-kuta","/west-bali"]){const meta=publicMetadata("Title","Description",path);assert.deepEqual(meta.robots,{index:true,follow:true});assert.equal(meta.alternates?.canonical,path);}
  assert.deepEqual(privateRobots,{index:false,follow:false});
  const rules=robots().rules as {disallow:string[]};
  for(const path of ["/account","/login","/register","/request-help","/book/","/api/"])assert.ok(rules.disallow.includes(path));
  assert.deepEqual(sitemap().map(row=>row.url),["https://shalombalitour.com/","https://shalombalitour.com/ubud","https://shalombalitour.com/south-kuta","https://shalombalitour.com/west-bali"]);
 }finally{
  if(saved.indexing===undefined)delete process.env.ALLOW_INDEXING;else process.env.ALLOW_INDEXING=saved.indexing;
  if(saved.public===undefined)delete process.env.PUBLIC_SITE_URL;else process.env.PUBLIC_SITE_URL=saved.public;
 }
});
