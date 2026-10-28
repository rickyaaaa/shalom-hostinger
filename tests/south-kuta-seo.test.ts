import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { areaGuides, areas } from "../src/lib/marketing";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const guide = areaGuides["south-kuta"]!;
const copy = JSON.stringify(guide) + areas["south-kuta"].description;

test("South Kuta uses the client-approved H1 and itinerary H2 exactly; Ubud's itinerary H2 is the approved wording", () => {
  assert.equal(areas["south-kuta"].heading, "Explore South Kuta Private Tours");
  assert.equal(guide.toursHeading, "Explore Our South Kuta Tour Itineraries");
  assert.equal(areaGuides.ubud!.toursHeading, "Explore Our Ubud Tour Itineraries");
  assert.equal(areas.ubud.heading, "Private Ubud Tour with Driver");
});

test("South Kuta metadata: approved title, “uluwatu tour” used naturally, existing URL, brand not repeated", () => {
  assert.equal(guide.title, "South Kuta Private Tours");
  assert.match(guide.metaDescription, /^Private South Kuta tours/);
  assert.match(guide.metaDescription, /Uluwatu tour/);
  assert.match(guide.toursIntro, /Uluwatu tour/);
  assert.doesNotMatch(guide.title, /Shalom/, "the layout template appends the brand");
  assert.ok(`${guide.title} | Shalom Bali Tour`.length <= 60, "the rendered title fits a search result");
  assert.ok(guide.metaDescription.length >= 120 && guide.metaDescription.length <= 160, String(guide.metaDescription.length));
  assert.match(src("app/south-kuta/page.tsx"), /publicMetadata\(areaGuides\["south-kuta"\]!\.title,areaGuides\["south-kuta"\]!\.metaDescription,"\/south-kuta"\)/);
  assert.ok((copy.match(/uluwatu tour/gi) ?? []).length <= 3, "used naturally, not stuffed");
});

test("No duplicate metadata or headings across the optimized pages", () => {
  const titles = ["Private Bali Tour with Driver", areaGuides.ubud!.title, guide.title];
  assert.equal(new Set(titles).size, titles.length);
  assert.notEqual(guide.metaDescription, areaGuides.ubud!.metaDescription);
  assert.notEqual(guide.title, areas["south-kuta"].heading, "title and H1 are written separately");
});

test("Claims stay within what WordPress and the client confirmed", () => {
  assert.match(copy, /Uluwatu Temple/, "client-confirmed destination");
  assert.equal(areas["south-kuta"].description, "Explore Bali's southern coast with a private driver on a 10-hour day tour. Choose from itineraries featuring Uluwatu Temple, scenic beaches, watersports, ATV adventures, spa experiences, and sunset dining in Jimbaran.", "approved hero: a summary of itinerary options, not a promise for every route");
  assert.match(areaGuides.ubud!.more[0].text, /^Itineraries featuring Uluwatu Temple/, "the Ubud link names the temple without claiming every South Kuta tour visits it");
  assert.match(guide.toursIntro, /or a route built around/, "routes without Uluwatu are described too");
  assert.doesNotMatch(copy, /kecak|fire dance|uluwatu sunset|sunset at uluwatu|every (tour|itinerary|route) (visits|includes) uluwatu/i);
  assert.doesNotMatch(copy, /US\$|\$\s?\d|IDR|per (person|car|vehicle|group)|english|free pickup|dinner included|best|award|rated/i);
});

test("South Kuta reuses the Ubud layout: shared order steps, WordPress terms and links to the other areas", () => {
  assert.deepEqual(guide.steps.map(step => step.title), ["Choose a South Kuta itinerary", "Sign in or create an account", "Enter your travel details", "Submit and reconfirm on WhatsApp"]);
  assert.deepEqual(guide.steps.slice(1), areaGuides.ubud!.steps.slice(1), "the approved order flow wording is shared");
  assert.equal(guide.stepsNote, areaGuides.ubud!.stepsNote);
  assert.deepEqual(guide.more.map(link => link.href), ["/ubud", "/west-bali", "/#customizedtour"]);
  assert.equal(guide.heroCta, "See South Kuta Tour Itineraries");
  assert.match(src("app/south-kuta/page.tsx"), /<AreaPage area="south-kuta"/);
  assert.match(src("components/AreaPage.tsx"), /await getBookingTerms\(\)/);
});
