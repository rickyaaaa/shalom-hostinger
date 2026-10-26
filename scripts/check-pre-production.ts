// Read-only audit: no customer writes, login, notification, or moderation calls.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import nextEnv from "@next/env";
import { tourCollectionSchema, tourSchema, reviewPageSchema, type Tour } from "../src/lib/types";
import { money } from "../src/lib/format";
nextEnv.loadEnvConfig(process.cwd());
const base = new URL(process.env.AUDIT_FRONTEND_URL || process.env.APP_URL!);
const api = process.env.WORDPRESS_API_URL!;
const source = JSON.parse(await readFile("../.reference/migration/backfill-reviewed-unambiguous.json", "utf8")) as {id:number;area:string;image_id:number;destinations:string[];duration:string;price_note:string}[];
const before = JSON.parse(await readFile("../.reference/migration/tours-after.json", "utf8"));
const checks:string[] = [], issues:{tour?:number;type:string;detail:string}[] = [];
const check = (ok:unknown,label:string) => { assert.ok(ok,label); checks.push(label); };
const get = async (url:string) => { const r=await fetch(url,{redirect:"error",signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,url);return r; };
const decode=(text:string)=>text.replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
const collection=tourCollectionSchema.parse(await(await get(`${api}/tours?per_page=50`)).json());
check(collection.total===17&&collection.items.length===17&&collection.total_pages===1,"All 17 canonical Tours returned without omitted pagination");
check(new Set(collection.items.map(t=>t.id)).size===17,"No duplicate native Tour IDs");
const htmls=new Map<string,string>();
for(const area of ["ubud","south-kuta","west-bali"])htmls.set(area,await(await get(`${base.origin}/${area}`)).text());
type AuditedTour=Tour & {image_status:number;rendered_fields_match:boolean};
async function inspectTour(tour:Tour):Promise<AuditedTour>{
 const detail=tourSchema.parse(await(await get(`${api}/tours/${tour.id}`)).json());
 check(JSON.stringify(detail)===JSON.stringify(tour),`${tour.id}: collection/detail all canonical fields agree`);
 const legacy=source.find(row=>row.id===tour.id);check(legacy,`${tour.id}: reviewed legacy binding exists`);
 check(tour.area?.slug===legacy!.area,`${tour.id}: native area matches reviewed binding`);
 check(tour.card_image?.id===legacy!.image_id,`${tour.id}: native Featured Image ID matches reviewed binding`);
 check(JSON.stringify(tour.destinations)===JSON.stringify(legacy!.destinations)&&tour.duration===legacy!.duration&&tour.price_note===legacy!.price_note,`${tour.id}: destinations/duration/note match reviewed source`);
 check(JSON.stringify(tour.pricing)===JSON.stringify(before.items.find((item:{id:number})=>item.id===tour.id)?.pricing),`${tour.id}: pricing unchanged since approved backfill`);
 const image=await fetch(tour.card_image!.url,{method:"HEAD",redirect:"error",signal:AbortSignal.timeout(20000)});
 check(image.ok&&image.headers.get("content-type")?.startsWith("image/"),`${tour.id}: Featured Image resolves as an image`);
 if(!tour.card_image!.alt)issues.push({tour:tour.id,type:"editorial",detail:"Featured Image alt metadata is empty; Next uses canonical Tour title as fallback. Owner may provide descriptive alt text."});
 check(tour.pricing.regular!==null&&tour.pricing.sale!==null&&tour.pricing.sale<=tour.pricing.regular,`${tour.id}: regular/sale prices present and sale does not exceed regular`);
 const cards=htmls.get(tour.area!.slug)!.match(/<article class="tour-card"[\s\S]*?<\/article>/g)||[];
 const card=cards.find(c=>c.includes(`tour-${tour.id}-title`));check(card,`${tour.id}: exactly mapped card renders`);
 const text=decode(card!);
 const fields=[tour.title,...tour.destinations,tour.duration,tour.price_note];
 check(fields.every(value=>text.includes(value.replace(/\s+/g," ").trim())),`${tour.id}: title/destinations/duration/note render faithfully`);
 check(card!.includes(encodeURIComponent(tour.card_image!.url))&&card!.includes(`/book/${tour.id}`),`${tour.id}: rendered image and booking target use native ID/asset`);
 check(text.includes(money(tour.pricing.sale!,tour.pricing.currency))&&text.includes(money(tour.pricing.regular!,tour.pricing.currency)),`${tour.id}: canonical regular/sale prices render`);
 const reviews=reviewPageSchema.parse(await(await get(`${api}/tours/${tour.id}/reviews`)).json());
 check(JSON.stringify(reviews.summary)===JSON.stringify(tour.rating),`${tour.id}: public reviews summary matches canonical rating/count`);
 check(tour.rating.review_count?text.includes(`${tour.rating.score!.toFixed(1)}`)&&text.includes(`${tour.rating.review_count} review`):text.includes("New")&&text.includes("No reviews yet"),`${tour.id}: correct rating or honest empty state renders`);
 check(card!.indexOf('class="price-note"')>card!.indexOf('class="tour-actions"'),`${tour.id}: price note follows booking/review actions`);
 for(const destination of tour.destinations)if((destination.match(/\(/g)||[]).length!==(destination.match(/\)/g)||[]).length)issues.push({tour:tour.id,type:"legacy-copy",detail:`Unbalanced parentheses: ${destination}`});
 if(tour.price_note.length<30)issues.push({tour:tour.id,type:"legacy-copy",detail:`Incomplete legacy price note: ${tour.price_note}`});
 const synthetic=reviews.reviews.filter(r=>/STAGING VALIDATION|synthetic/i.test(r.experience));
 if(synthetic.length)issues.push({tour:tour.id,type:"staging-fixture",detail:`${synthetic.length} approved synthetic staging review(s) affect public rating/count; must not be imported as customer testimonials.`});
 return {...tour,image_status:image.status,rendered_fields_match:true};
}
const tours:AuditedTour[]=[];
for(let offset=0;offset<collection.items.length;offset+=4)tours.push(...await Promise.all(collection.items.slice(offset,offset+4).map(inspectTour)));
const pages=[];
for(const path of ["/","/ubud","/south-kuta","/west-bali","/login","/register","/request-help","/account"]){
 const r=await get(new URL(path,base).toString()),html=await r.text();
 const h1=Array.from(html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g),m=>decode(m[1]));
 const title=decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||"");
 const meta=(name:string)=>html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))?.[1]||"";
 const canonical=html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]||null;
 check(h1.length===1,`${path}: one H1`);check(title&&meta("description"),`${path}: title and description present`);
 check(meta("robots").includes("noindex"),`${path}: preview remains noindex`);
 if(["/","/ubud","/south-kuta","/west-bali"].includes(path)){
   check(canonical&&new URL(canonical).toString()===new URL(path,base).toString(),`${path}: exact frontend canonical`);
   check(meta("og:title")&&meta("og:description")&&meta("og:url"),`${path}: basic Open Graph present`);
 }
 const suspicious=decode(html).match(/lorem ipsum|coming soon|todo:|your company|replace me/gi)||[];
 check(!suspicious.length,`${path}: no obvious placeholder prose in SSR`);
 pages.push({path,title,h1,description:meta("description"),canonical,robots:meta("robots"),cache_control:r.headers.get("cache-control"),open_graph_image:meta("og:image")||null});
}
check(new Set(pages.map(p=>p.title)).size===pages.length,"Page title tags are distinct");
const config=await(await get(`${base.origin}/api/customer/config`)).json();
const legal=[];
for(const [kind,url] of Object.entries(config).filter(([key])=>["terms_url","privacy_url"].includes(key))){const r=await fetch(String(url),{signal:AbortSignal.timeout(20000)});const text=decode(await r.text());legal.push({kind,url,status:r.status,contains_template_markers:/suggested text|our website address is|example\.com|lorem ipsum/i.test(text)});}
const guest=await fetch(`${base.origin}/api/customer/me`);check(guest.status===401&&guest.headers.get("cache-control")?.includes("no-store"),"Guest private API denies access and caching");
const robots=await(await get(`${base.origin}/robots.txt`)).text(),sitemap=await(await get(`${base.origin}/sitemap.xml`)).text();
check(robots.includes("Disallow: /"),"Preview robots disallows all crawling");
check((sitemap.match(/<loc>/g)||[]).length===4&&!/\/account|\/login|\/register|\/book\//.test(sitemap),"Sitemap has exactly four public pages");
const grouped=(key:(tour:typeof tours[number])=>string)=>Array.from(new Set(tours.map(key))).map(value=>({value,ids:tours.filter(t=>key(t)===value).map(t=>t.id)})).filter(row=>row.ids.length>1);
const duplicates={titles:grouped(t=>t.title),images:grouped(t=>String(t.card_image?.id)),destination_lists:grouped(t=>JSON.stringify(t.destinations)),price_notes:grouped(t=>t.price_note)};
const report={checked_at:new Date().toISOString(),scope:"Read-only local production Next + real staging canonical WordPress/public media; no private writes or mail",frontend:base.origin,api,passed:checks.length,checks,tours,pages,legal,duplicates,issues};
await writeFile(".impeccable/review/pre-production-audit.json",JSON.stringify(report,null,2));
const cell=(v:unknown)=>String(v??"—").replace(/\|/g,"\\|").replace(/\n/g,"<br>");
const rows=tours.map(t=>`| ${t.id} | ${cell(t.title)} | ${t.area?.slug} | [${t.card_image!.id}](${t.card_image!.url}) | ${cell(t.destinations.join("; "))} | ${t.pricing.regular} / ${t.pricing.sale} ${t.pricing.currency} | ${t.duration} | ${cell(t.price_note)} | ${t.rating.score??"New"} / ${t.rating.review_count} |`);
await writeFile("PRE-PRODUCTION-CONTENT.md",`# Canonical Tour audit\n\nChecked ${report.checked_at}; read-only staging data, not a production import. Every row matched collection/detail APIs, the reviewed native ID/area/image binding, SSR content/pricing/booking target and approved public rating summary. Featured Images returned HTTP 200 image content. Full checks, page metadata, duplicate groups and editorial issues are in .impeccable/review/pre-production-audit.json. No business content was edited.\n\n| ID | Canonical title | Area | Featured Image | Destinations | Regular / sale | Duration | Price note | Score / review count |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`);
console.log(JSON.stringify({passed:checks.length,tours:tours.length,pages:pages.length,duplicates,issues,legal},null,2));
