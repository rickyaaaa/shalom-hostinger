import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { publicMetadata } from "../src/lib/seo";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const page = src("app/bali-driver-hire/page.tsx");

test("Hire a Driver page: indexable metadata sized for search results, one H1 on the driver-hire phrase", () => {
  const meta = page.match(/export const metadata = publicMetadata\("([^"]+)", "([^"]+)", "\/bali-driver-hire"\);/);
  assert.ok(meta, "a single publicMetadata call, like the area pages");
  const [, title, description] = meta;
  assert.ok(`${title} | Shalom Bali Tour`.length <= 60, title);
  assert.match(title, /Hire a Driver in Bali/);
  assert.ok(description.length >= 120 && description.length <= 160, `${description.length}`);
  assert.equal(page.match(/<h1 /g)?.length, 1);
  assert.match(page, /<h1 id="driver-hire-title">Hire a Private Driver in Bali<\/h1>/);
  const saved = process.env.ALLOW_INDEXING;
  try {
    process.env.ALLOW_INDEXING = "true";
    const og = publicMetadata(title, description, "/bali-driver-hire").openGraph as { images?: { url: string }[] };
    assert.equal(og.images?.[0].url, "/images/west-bali.jpeg", "link previews show a real photo");
  } finally { if (saved === undefined) delete process.env.ALLOW_INDEXING; else process.env.ALLOW_INDEXING = saved; }
});

test("Hire a Driver page states only approved facts; prices and terms stay WordPress data", () => {
  const copy = page.slice(page.indexOf("const facts"), page.indexOf("async function DriverTerms"));
  for (const phrase of ["10 hours", "Fuel and parking included", "group only", "extra charge applies", "Entrance tickets, activities and lunch are paid separately"]) assert.ok(copy.includes(phrase), phrase);
  assert.doesNotMatch(page, /\$\d|\b(USD|IDR|AUD|Rp)\b|English-speaking|licensed|insured|air-?con|Toyota|Avanza|\bbest\b|cheapest|guarantee/i, "no prices, vehicle or quality claims the owner has not confirmed");
  assert.match(page, /getBookingTerms\(\)\.catch\(\(\) => null\)/, "included / not included comes live from WordPress");
  assert.match(page, /\{i === 2 && <> \{TRAVEL_DATE_NOTE\}<\/>\}/, "the order form's own date rule");
});

test("Hire a Driver page sends visitors into the real order flows and is linked from Home and the itinerary guide", () => {
  assert.match(page, /<Link href="\/#itineraries" className="button button-gold">Choose an Itinerary<\/Link>/);
  assert.match(page, /<Link href=\{links\.customBooking\} className="button button-white">Plan Your Own Route<\/Link>/);
  for (const href of ["/ubud", "/south-kuta", "/west-bali", "/blog/bali-itinerary"]) assert.ok(page.includes(`"${href}"`), href);
  assert.match(page, /"@type": "Service"/);
  assert.equal(page.match(/\.replace\(\/<\/g, "\\\\u003c"\)/g)?.length, 2, "both JSON-LD blocks escape <");
  assert.match(page, /<RecentGuides \/>/);
  assert.match(src("components/HomeInformation.tsx"), /Looking to <Link href="\/bali-driver-hire">hire a driver in Bali<\/Link> for the day\?/);
  assert.match(src("lib/blog.ts"), /\[hire a driver for a route you plan yourself\]\(\/bali-driver-hire\)/);
});
