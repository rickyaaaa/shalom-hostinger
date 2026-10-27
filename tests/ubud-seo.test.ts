import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { areaGuides, areas } from "../src/lib/marketing";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const guide = areaGuides.ubud!;

test("Ubud metadata: approved title once branded by the layout, description within search-snippet length", () => {
  assert.equal(guide.title, "Private Ubud Tour with Driver");
  assert.doesNotMatch(guide.title, /Shalom/, "the layout template appends the brand; the page title must not repeat it");
  assert.match(src("app/layout.tsx"), /template: "%s \| Shalom Bali Tour"/);
  assert.match(src("app/ubud/page.tsx"), /publicMetadata\(areaGuides\.ubud!\.title,areaGuides\.ubud!\.metaDescription,"\/ubud"\)/);
  assert.ok(guide.metaDescription.length >= 120 && guide.metaDescription.length <= 160, String(guide.metaDescription.length));
  assert.match(guide.metaDescription, /Ubud/);
});

test("Ubud hero: approved H1 and introduction, unchanged image", () => {
  assert.equal(areas.ubud.heading, "Private Ubud Tour with Driver");
  assert.equal(areas.ubud.description, "Explore Ubud with your own private driver on a flexible 10-hour day tour. Discover rice terraces, temples, waterfalls, traditional arts, and family-friendly destinations through our selected itineraries.");
  assert.equal(areas.ubud.image, "/images/ubud.webp");
  assert.equal(areas.ubud.alt, "Green rice terraces in Ubud");
});

test("How It Works follows the real order flow: itinerary, sign in, travel details, order and WhatsApp", () => {
  assert.deepEqual(guide.steps.map(step => step.title), ["Choose an Ubud itinerary", "Sign in or create an account", "Enter your travel details", "Submit and reconfirm on WhatsApp"]);
  const page = src("components/AreaPage.tsx");
  assert.match(page, /\{i===2 && <> \{TRAVEL_DATE_NOTE\}<\/>\}/, "the date rule is the order form's own note, added to the travel-details step");
});

test("No price summary or unverified business claims; prices and terms stay WordPress data", () => {
  const copy = JSON.stringify(guide) + areas.ubud.description;
  assert.doesNotMatch(copy, /US\$|\$\s?\d|IDR|\bfrom\s+\$|per (person|car|vehicle|group)/i, "no hard-coded price or price basis");
  assert.doesNotMatch(copy, /english|free pickup|all of bali|anywhere in bali|best|#1|award|rated/i, "no unverified claims");
  const page = src("components/AreaPage.tsx");
  assert.match(page, /await getBookingTerms\(\)/, "included / not included come from WordPress, as in the Home FAQ");
  assert.doesNotMatch(copy + page, /ATV|rafting|animal park/i, "no hard-coded note beside the WordPress terms");
  assert.doesNotMatch(page, /From US|pricing\.|Math\.min/, "no From price summary");
  assert.match(page, /<TourCard tour=\{tour\}/, "the WordPress tour cards still render prices, reviews and Order Now");
});

test("Heading hierarchy: one H1, section H2s, itinerary titles as H3 under the itinerary heading", () => {
  assert.deepEqual([guide.toursHeading, guide.termsHeading, guide.stepsHeading, guide.moreHeading], ["Choose Your Ubud Tour Itinerary", "What’s Included in Your Private Ubud Tour", "How Your Ubud Day Tour Works", "Plan Another Day in Bali"]);
  const page = src("components/AreaPage.tsx");
  assert.match(page, /cardHeading=\{guide \? "h3" : "h2"\}/);
  assert.match(src("components/TourCard.tsx"), /heading: Heading = "h2"/, "other areas keep H2 card titles");
  assert.match(page, /<h2 id="area-tours-title">/);
});

test("Internal links: other tour areas and the customized itinerary, with descriptive, varied anchors", () => {
  assert.deepEqual(guide.more.map(link => link.href), ["/south-kuta", "/west-bali", "/#customizedtour"]);
  const titles = guide.more.map(link => link.title);
  assert.equal(new Set(titles).size, titles.length);
  assert.ok(guide.more.every(link => link.text.length > 30));
  assert.equal(guide.heroCta, "See Ubud Tour Itineraries");
  assert.match(src("components/AreaPage.tsx"), /href="#tour-packages" className="button button-gold area-hero-cta"/);
});

test("South Kuta and West Bali are unchanged: no guide, original headings and descriptions", () => {
  assert.equal(areaGuides["south-kuta"], undefined);
  assert.equal(areaGuides["west-bali"], undefined);
  assert.equal(areas["south-kuta"].heading, "Ready for Your South Kuta Adventure?");
  assert.equal(areas["west-bali"].heading, "Are You Ready To Explore West Bali ?");
  assert.match(src("app/south-kuta/page.tsx"), /publicMetadata\("South Kuta Itineraries"/);
  assert.match(src("app/west-bali/page.tsx"), /publicMetadata\("West Bali Itineraries"/);
});
