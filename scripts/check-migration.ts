import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const base="http://127.0.0.1:3000";
const api=process.env.WORDPRESS_API_URL!;
const checks:string[]=[];
const check=(ok:unknown,label:string)=>{assert.ok(ok,label);checks.push(label);};
const canonical=await (await fetch(`${api}/tours?per_page=50`)).json();
for(const area of ["ubud","south-kuta","west-bali"]){
  const response=await fetch(`${base}/${area}`);const html=await response.text();
  const expected=canonical.items.filter((tour:{area:{slug:string}})=>tour.area?.slug===area);
  check(response.status===200,`${area}: route renders successfully`);
  for(const tour of expected){check(html.includes(`tour-${tour.id}-title`),`${area}: canonical Tour ${tour.id} renders in SSR`);check(html.includes(`/book/${tour.id}`),`${area}: Tour ${tour.id} keeps native booking target`);}
  check((html.match(/class="tour-card"/g)||[]).length===expected.length,`${area}: no fabricated or cross-area cards`);
  check(html.includes(`rel="canonical" href="${base}/${area}"`),`${area}: canonical metadata uses frontend origin`);
  check(html.includes('name="description"'),`${area}: description metadata present`);
}
const home=await (await fetch(base)).text();
const anchors=["customizedtour","review","answer","about","contact"];
check(anchors.every(id=>home.includes(`id="${id}"`)),"All Home navigation anchors have real destinations");
check(home.indexOf('class="why-section"')<home.indexOf('id="answer"')&&home.indexOf('id="answer"')<home.indexOf('id="about"'),"Approved Why → FAQ → About section order preserved");
check(home.includes("Explore Bali Your Way")&&!home.includes('class="ubud-hero"'),"Home starts with package content and has no large hero");
const latest=await (await fetch(`${api}/latest-reviews?limit=3`)).json();
for(const review of latest.reviews)check(home.includes(review.name),"Home displays backend-approved masked guest identity");
for(const route of ["login","register","request-help","account"]){const html=await(await fetch(`${base}/${route}`)).text();check(html.includes('name="robots" content="noindex, nofollow"'),`${route}: private surface excluded from indexing`);}
check((await fetch(`${base}/tour/a-ubud-tour`)).status===404,"No customer Tour-detail route exists");
const invalidBooking=await(await fetch(`${base}/book/invalid`)).text();
check(invalidBooking.includes("Page not found")&&invalidBooking.includes('name="robots" content="noindex'),"Invalid booking target renders the not-found UI and noindex (Next streaming may retain HTTP 200)");
check((await fetch(`${base}/api/customer/me`)).status===401,"Anonymous account response denies private customer data");
const publicReview=await(await fetch(`${base}/api/tours/599/reviews`)).json();check(publicReview.title&&Array.isArray(publicReview.reviews),"Non-523 public Reviews adapter works");
const robots=await(await fetch(`${base}/robots.txt`)).text();check(robots.includes("Disallow: /"),"Staging indexing remains disabled");
const report={checkedAt:new Date().toISOString(),scope:"Read-only Next SSR/SEO and real staging public APIs",passed:checks.length,checks};
await writeFile(".impeccable/review/migration-ssr-results.json",JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
