import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { areas } from "../src/lib/marketing";
import { indexableTourPaths, tourDetailPath, tourPageBySlug, tourPages, type TourPageContent } from "../src/lib/tour-pages";
import sitemap from "../src/app/sitemap";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const pages = Object.entries(tourPages) as [string, TourPageContent][];
const copy = (page: TourPageContent) => JSON.stringify([page.title, page.metaDescription, page.heading, page.intro, page.highlights, page.itinerary, page.faq]);
const pilot = tourPages["uluwatu-beach-jimbaran-tour"];

test("Tour page slugs are kebab-case without the CMS order prefix, one page per tour, in a real area", () => {
  assert.ok(pages.length > 0);
  for (const [slug, page] of pages) {
    assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, slug);
    assert.doesNotMatch(slug, /^[a-z]-/, `${slug}: no A./B. order prefix from WordPress`);
    assert.ok(Object.hasOwn(areas, page.area), `${slug}: ${page.area}`);
    assert.ok(Number.isSafeInteger(page.tourId) && page.tourId > 0);
  }
  assert.equal(new Set(pages.map(([, page]) => page.tourId)).size, pages.length, "one detail page per tour");
});

test("Tour page metadata: branded title within 60 characters, description within snippet length, H1 differs", () => {
  for (const [slug, page] of pages) {
    assert.ok(`${page.title} | Shalom Bali Tour`.length <= 60, `${slug}: ${page.title}`);
    assert.doesNotMatch(page.title, /Shalom/, "the layout template appends the brand");
    assert.ok(page.metaDescription.length >= 120 && page.metaDescription.length <= 160, `${slug}: ${page.metaDescription.length}`);
    assert.notEqual(page.title, page.heading);
  }
});

test("Tour page copy has no prices, currencies or unverified claims; prices stay WordPress data", () => {
  for (const [slug, page] of pages) {
    const text = copy(page);
    assert.doesNotMatch(text, /\$|\b(USD|IDR|EUR|AUD|Rp)\b|per (person|car|vehicle|group)|\d+\s?k\b/i, `${slug}: no price or currency`);
    assert.doesNotMatch(text, /dinner included|tickets? included|\bbest\b|guarantee/i, `${slug}: no inclusion or quality claims`);
  }
});

test("Uluwatu pilot (tour 599) keeps the owner-confirmed facts and invents no other times", () => {
  assert.equal(pilot.tourId, 599);
  assert.equal(pilot.area, "south-kuta");
  assert.equal(pilot.heading, "Uluwatu, Beach & Jimbaran Sunset Private Tour");
  const text = copy(pilot);
  assert.match(text, /17:30/);
  assert.match(text, /paid separately/);
  assert.match(text, /Pandawa, Tanah Barak or Melasti/);
  assert.match(text, /Kecak performance and the Jimbaran sunset dinner cannot both fit into the same evening/);
  assert.match(text, /depends on the weather/);
  assert.deepEqual([...new Set(text.match(/\b\d{1,2}[:.]\d{2}\b/g))], ["17:30"], "17:30 is the only fixed time");
  assert.doesNotMatch(text, /\b\d{1,2}\s?(am|pm)\b|o’clock|o'clock/i);
  assert.deepEqual(pilot.itinerary.filter(stop => "time" in stop).map(stop => stop.title), ["Jimbaran sunset dinner"]);
});

test("Every card links to a detail page; pages stay out of the sitemap and noindex until approved", () => {
  assert.equal(pilot.indexable, false);
  assert.equal(tourDetailPath(599), "/tours/uluwatu-beach-jimbaran-tour");
  assert.equal(tourDetailPath(523), "/tours/523", "a tour without written copy gets the WordPress-only page");
  assert.deepEqual(indexableTourPaths(), []);
  assert.ok(sitemap().every(row => !row.url.includes("/tours/")));
  assert.equal(sitemap().length, 4);
  assert.match(src("app/sitemap.ts"), /\[\.\.\.\["\/","\/ubud","\/south-kuta","\/west-bali"\],\.\.\.indexableTourPaths\(\)\]/);
  const card = src("components/TourCard.tsx");
  assert.match(card, /<BookingButton [^>]*\/><Link className="button button-outline" href=\{tourDetailPath\(tour\.id\)\}>Details<span className="visually-hidden">: \{title\}<\/span><\/Link><\/div>/, "cards: Order Now + Details");
  assert.doesNotMatch(card, /Review(Modal|s<)/, "cards no longer open reviews");
  const route = src("app/tours/[slug]/page.tsx");
  assert.match(route, /const noindex = \{ robots: \{ index: false, follow: false \} \};/);
  assert.match(route, /\.\.\.\(page\.indexable \? \{\} : noindex\)/);
  assert.match(route, /return \{ \.\.\.publicMetadata\([^;]*\), \.\.\.noindex \};/, "WordPress-only pages are always noindex");
  assert.match(route, /if \(!area \|\| \(page && tour\.area\?\.slug !== page\.area\)\) notFound\(\);/);
  assert.match(route, /if \(tourPageSlug\(tourId\)\) permanentRedirect\(tourDetailPath\(tourId\)\);/, "a tour ID with written copy redirects to its slug");
});

test("Slug lookup resolves own entries only: no CMS slug, no prototype keys", () => {
  assert.equal(tourPageBySlug("uluwatu-beach-jimbaran-tour")?.tourId, 599);
  for (const slug of ["a-uluwatu-beach-jimbaran-tour", "ngasal", "constructor", "__proto__", "toString", "hasOwnProperty", ""]) assert.equal(tourPageBySlug(slug), null, slug);
});

test("Detail route reads WordPress live and reuses the existing booking and review components", () => {
  const route = src("app/tours/[slug]/page.tsx");
  assert.match(route, /export const dynamic = "force-dynamic"/);
  assert.match(route, /await getTour\(tourId\)/);
  assert.match(route, /error instanceof WordPressApiError && error\.status === 404\) notFound\(\); return <ServiceUnavailable/);
  assert.match(route, /tour\.booking_terms \?\? await getBookingTerms\(\)/);
  assert.match(route, /<BookingButton tourId=\{tour\.id\}/);
  assert.doesNotMatch(route, /ReviewModal/, "reviews are a section on the page, not a dialog");
  assert.match(route, /getTourReviews\(tour\.id, 1\)\.catch\(\(\) => null\)/, "the first review page is server-rendered");
  assert.match(route, /href="#tour-reviews">Reviews<\/a>/);
  assert.match(route, /<section id="tour-reviews"[^>]*>[\s\S]*<TourReviews tourId=\{tour\.id\} initial=\{reviews\} \/>\s*<\/div><\/section>\s*<\/>;/, "reviews are the last section");
  assert.match(route, /money\(current, currency\)/);
  assert.match(route, /JSON\.stringify\(jsonLd\)\.replace\(\/<\/g, "\\\\u003c"\)/);
  assert.match(route, /const jsonLd = page && \{/, "structured data only on written pages");
  assert.match(route, /"@type": "TouristTrip"/);
  assert.doesNotMatch(route, /tour\.slug/, "WordPress slugs are not used for the URL");
});
