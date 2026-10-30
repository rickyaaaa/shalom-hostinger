import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { areaGuides, areas } from "../src/lib/marketing";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const guide = areaGuides["west-bali"]!;

test("West Bali & North Bali metadata and hero use the approved SEO copy", () => {
  assert.equal(guide.title, "West Bali & North Bali Tours | Bedugul & Tanah Lot");
  assert.equal(guide.metaDescription, "Explore private West Bali & North Bali tours with your own driver. Choose itineraries to Bedugul, Jatiluwih Rice Terraces, Taman Ayun, and Tanah Lot.");
  assert.equal(`${guide.title} | Shalom Bali Tour`, "West Bali & North Bali Tours | Bedugul & Tanah Lot | Shalom Bali Tour");
  assert.equal(areas["west-bali"].heading, "Explore West Bali & North Bali Tours with a Private Driver");
  assert.equal(areas["west-bali"].description, "Discover Bali’s temples and countryside on a private 10-hour day tour. Choose from itineraries featuring Ulun Danu Beratan, Jatiluwih Rice Terraces, Taman Ayun and Tanah Lot, or a Beji purification experience on selected routes.");
  assert.equal(areas["west-bali"].image, "/images/west-bali.jpeg");
  assert.match(src("app/west-bali/page.tsx"), /publicMetadata\(areaGuides\["west-bali"\]!\.title,areaGuides\["west-bali"\]!\.metaDescription,"\/west-bali"\)/);
});

test("West Bali & North Bali keeps one H1, an H2 itinerary section, and H3 tour cards", () => {
  assert.equal(guide.toursHeading, "Explore Our West Bali & North Bali Tour Itineraries");
  assert.equal(guide.termsHeading, "What’s Included in Your West Bali & North Bali Tour");
  assert.equal(guide.stepsHeading, "How Your West Bali & North Bali Day Tour Works");
  assert.equal(guide.moreHeading, "Plan Another Day in Bali");
  assert.deepEqual(guide.steps.map(step => step.title), ["Choose a West Bali & North Bali itinerary", "Sign in or create an account", "Enter your travel details", "Submit and reconfirm on WhatsApp"]);
  assert.equal(guide.stepsNote, "Your tour lasts 10 hours from the agreed pickup time. Extra time is charged as listed in the tour terms.");
  const page = src("components/AreaPage.tsx");
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.match(page, /<h2 id="area-tours-title">\{guide\.toursHeading\}<\/h2>/);
  assert.match(page, /cardHeading=\{guide \? "h3" : "h2"\}/);
  assert.match(src("components/TourCard.tsx"), /heading: Heading = "h2"/);
});

test("West Bali & North Bali preserves dynamic tours, terms, actions, and internal links", () => {
  assert.match(src("components/AreaPage.tsx"), /await getAreaTours\(area\)/);
  assert.match(src("components/AreaPage.tsx"), /await getBookingTerms\(\)/);
  assert.match(src("components/TourCard.tsx"), /<BookingButton tourId=\{tour\.id\}/);
  assert.match(src("components/TourCard.tsx"), /href=\{tourDetailPath\(tour\.id\)\}>Details</);
  assert.deepEqual(guide.more.map(link => link.href), ["/ubud", "/south-kuta", "/#customizedtour"]);
  assert.deepEqual(guide.more.map(link => link.title), ["Ubud", "South Kuta", "Customized Itinerary"]);
  assert.equal(guide.termsIntro, "Before booking your West Bali & North Bali tour, review the services included in your itinerary and any additional expenses. The information below follows our current tour terms so you can plan your trip with confidence.");
  assert.doesNotMatch(JSON.stringify(guide) + areas["west-bali"].description, /Menjangan|West Bali National Park|sunset is guaranteed|medical|healing benefits|guided trekking|lunch included|IDR|EUR|exchange rate/i);
});

test("West Bali & North Bali keeps its own design: CSS module, card presentation, two-column grid, route and image", () => {
  const page = src("components/AreaPage.tsx");
  assert.match(page, /isWestBali \? `ubud-hero \$\{westBaliStyles\.hero\}`/);
  assert.match(page, /presentation=\{isWestBali \? westBaliCardPresentation\(tour\) : undefined\}/, "client-approved West Bali & North Bali card titles, photos and notes");
  const css = src("components/WestBali.module.css");
  assert.match(css, /\.page \.hero :global\(\.ubud-hero-copy\) > p:last-of-type \{/, "the intro keeps its West Bali & North Bali style with the hero button after it");
  assert.doesNotMatch(css, /p:last-child/);
  assert.match(css, /\.tours :global\(\.tour-grid\) \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
  assert.match(src("app/west-bali/page.tsx"), /<AreaPage area="west-bali"/);
  assert.equal(areas["west-bali"].name, "West Bali & North Bali");
  assert.match(src("app/sitemap.ts"), /\["\/","\/ubud","\/south-kuta","\/west-bali"/, "same URL in the sitemap");
});

test("Copy stays within what WordPress confirms and leaves the other areas unchanged", () => {
  const copy = JSON.stringify(guide) + areas["west-bali"].description;
  assert.match(areas["west-bali"].description, /on selected routes/, "Beji is on selected routes only");
  assert.doesNotMatch(copy, /US\$|\$\s?\d|per (person|car|vehicle|group)|english|free pickup|rated|review count/i, "no prices, currencies or unverified claims");
  assert.equal(areas.ubud.heading, "Private Ubud Tour with Driver");
  assert.equal(areaGuides.ubud!.title, "Private Ubud Tour with Driver");
  assert.equal(areas["south-kuta"].heading, "Explore South Kuta Private Tours");
  assert.equal(areaGuides["south-kuta"]!.title, "South Kuta Private Tours");
  const titles = [areaGuides.ubud!.title, areaGuides["south-kuta"]!.title, guide.title, "Private Bali Tour with Driver"];
  assert.equal(new Set(titles).size, titles.length, "no duplicate titles");
  assert.equal(new Set([areaGuides.ubud!.metaDescription, areaGuides["south-kuta"]!.metaDescription, guide.metaDescription]).size, 3, "no duplicate descriptions");
});
