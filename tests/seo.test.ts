import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { publicMetadata, privateRobots } from "../src/lib/seo";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import { indexableTourPaths } from "../src/lib/tour-pages";

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
  // Private pages stay crawlable so search engines can read their noindex; only the API is blocked.
  assert.deepEqual(robots().rules,{userAgent:"*",allow:"/",disallow:["/api/"]});
  assert.deepEqual(sitemap().map(row=>row.url),["/","/ubud","/south-kuta","/west-bali",...indexableTourPaths()].map(path=>`https://shalombalitour.com${path}`));
  assert.ok(sitemap().every(row=>!/\/(book|login|account|api)\b/.test(row.url)),"booking, account and API pages never reach the sitemap");
 }finally{
  if(saved.indexing===undefined)delete process.env.ALLOW_INDEXING;else process.env.ALLOW_INDEXING=saved.indexing;
  if(saved.public===undefined)delete process.env.PUBLIC_SITE_URL;else process.env.PUBLIC_SITE_URL=saved.public;
 }
});

const source=(file:string)=>readFileSync(new URL(`../src/${file}`,import.meta.url),"utf8");
test("every private page is noindex on its own, so unblocking it in robots.txt never exposes it",()=>{
 for(const page of ["account/page.tsx","account/password/page.tsx","account/profile/page.tsx","book/[id]/page.tsx","login/page.tsx","register/page.tsx","request-help/page.tsx","reset-password/page.tsx","[slug]/page.tsx"])assert.match(source(`app/${page}`),/robots: ?\{ ?index: ?false, ?follow: ?false ?\}/,page);
 assert.match(source("app/forgot-password/page.tsx"),/redirect\(/,"forgot-password only redirects");
 assert.match(source("app/ref/[slug]/route.ts"),/X-Robots-Tag", "noindex, nofollow"/);
});

test("home title carries the brand and fits search results; the description fits the snippet",()=>{
 const home=source("app/page.tsx").match(/export const metadata = publicMetadata\("([^"]+)", "([^"]+)", "\/"\);/);
 assert.ok(home,"home metadata stays a single publicMetadata call");
 const [,title,description]=home;
 assert.equal(title,"Bali Private Tour & Private Driver | Shalom Bali Tour","the root page gets no layout template, so the brand is written out");
 assert.ok(title.length>=40 && title.length<=60,`${title.length}`);
 assert.ok(description.length>=120 && description.length<=160,`${description.length}`);
 assert.match(description,/Bali private driver/);
 assert.match(source("app/page.tsx"),/<h1 id="home-title">Private Bali Tour with Driver<\/h1>/,"the H1 is unchanged");
});

test("home targets the private driver searches with published facts and describes the business as JSON-LD",()=>{
 const home=source("app/page.tsx"), info=source("components/HomeInformation.tsx");
 assert.match(home,/<HowItWorks\/>\s*<DriverSection\/>/,"the driver section follows How It Works");
 assert.match(info,/<h2 id="driver-title">Your Bali Private Driver for the Day<\/h2>/);
 for(const phrase of ["Bali private tour","driver in Bali","10 hours","fuel and parking included"]) assert.ok(info.toLowerCase().includes(phrase.toLowerCase()),phrase);
 assert.doesNotMatch(info.match(/export function DriverSection[\s\S]*?\n/)![0],/\$|USD|IDR|\bbest\b|guarantee|English-speaking|licensed/i,"no prices or claims the site does not already make");
 assert.match(home,/"@type": "TravelAgency"/);
 assert.match(home,/JSON\.stringify\(agencyLd\)\.replace\(\/<\/g, "\\\\u003c"\)/,"JSON-LD escapes < like the tour pages");
 assert.match(home,/foundingDate: "2016"/);
});

test("public pages share a real photo in link previews",()=>{
 for(const [path,image] of [["/","/images/west-bali.jpeg"],["/ubud","/images/ubud.webp"],["/south-kuta","/images/south-kuta.webp"],["/west-bali","/images/west-bali.jpeg"]] as const){
  const meta=publicMetadata("Title","Description",path);
  const og=meta.openGraph as {images:{url:string;width:number;height:number;alt:string}[]};
  assert.equal(og.images[0].url,image,path);
  assert.ok(og.images[0].width>=550 && og.images[0].alt.length>10,path);
  assert.ok(existsSync(new URL(`../public${image}`,import.meta.url)),image);
  assert.equal((meta.twitter as {card:string}).card,"summary_large_image");
 }
});

