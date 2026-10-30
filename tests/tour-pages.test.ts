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

test("Owner-review pages: every card has written copy, no times, tickets and activities paid separately", () => {
  const drafts = pages.filter(([, page]) => page.tourId !== 599);
  const byArea = (area: string) => drafts.filter(([, page]) => page.area === area).map(([, page]) => page.tourId).sort((a, b) => a - b);
  assert.deepEqual(byArea("south-kuta"), [611, 616, 620, 624, 628]);
  assert.deepEqual(byArea("ubud"), [523, 566, 571, 580, 586, 591, 592]);
  assert.deepEqual(byArea("west-bali"), [633, 644, 651, 655]);
  for (const [slug, page] of drafts) {
    const text = copy(page);
    assert.equal(tourDetailPath(page.tourId), `/tours/${slug}`);
    assert.doesNotMatch(text, /\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s?(am|pm)\b/i, `${slug}: no times`);
    assert.ok(page.itinerary.every(stop => !("time" in stop)), slug);
    assert.match(text, /paid separately\. See the included and not-included list/, `${slug}: tickets and activities follow the WordPress terms`);
    if (page.area === "south-kuta") assert.match(text, /Dinner is paid separately/, slug);
    else assert.match(text, /Lunch is paid separately/, slug);
    if (page.area === "west-bali") assert.doesNotMatch(text, /Menjangan|West Bali National Park|sunset is guaranteed|medical|healing benefits|guided trekking|lunch included/i, `${slug}: same limits as the West Bali guide`);
  }
});

test("Every card links to an indexable detail page in the sitemap; WordPress-only pages stay noindex", () => {
  assert.ok(pages.every(([, page]) => page.indexable), "all written pages are live for search");
  assert.equal(tourDetailPath(599), "/tours/uluwatu-beach-jimbaran-tour");
  assert.equal(tourDetailPath(99999), "/tours/99999", "a tour without written copy gets the WordPress-only page");
  assert.deepEqual(indexableTourPaths(), pages.map(([slug]) => `/tours/${slug}`));
  assert.equal(indexableTourPaths().length, 17);
  const urls = sitemap().map(row => new URL(row.url).pathname);
  assert.deepEqual(urls, ["/", "/ubud", "/south-kuta", "/west-bali", ...indexableTourPaths()]);
  assert.match(src("app/sitemap.ts"), /\[\.\.\.\["\/","\/ubud","\/south-kuta","\/west-bali"\],\.\.\.\(islandPackagesLive\?\["\/nusa-penida-lembongan"\]:\[\]\),\.\.\.indexableTourPaths\(\)\]/);
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
  assert.match(route, /<a className="tour-detail-rating" href="#tour-reviews"><ReviewScore rating=\{tour\.rating\} \/><\/a>/, "the sidebar rating jumps to the reviews");
  assert.match(route, /<aside className="tour-detail-info"[^>]*>\s*<h2 id="tour-info-title">Travel Information<\/h2>/);
  assert.match(route, /<div className="tour-detail-info-actions"><BookingButton tourId=\{tour\.id\} title=\{title\} \/><\/div>/, "one full-width Order Now with the card's sign-in flow");
  assert.doesNotMatch(route, /Customize Your/);
  assert.match(route, /<Image src=\{area\.image\} alt=\{area\.alt\}/, "the banner is the area page's hero photo");
  assert.match(route, /const crumbs = \[\{ name: "Home", path: "\/" \}, \{ name: area\.name, path: areaPath \}, \{ name: title, path: `\/tours\/\$\{slug\}` \}\];/);
  assert.match(route, /<nav className="tour-breadcrumbs" aria-label="Breadcrumb">[\s\S]*<li aria-current="page">\{title\}<\/li>/);
  assert.match(route, /"@type": "BreadcrumbList"/);
  assert.match(route, /JSON\.stringify\(breadcrumbLd\)\.replace\(\/<\/g, "\\\\u003c"\)/);
  for (const heading of ["Destination Highlights", "Included Facilities", "Why This Tour?", "How Your Day Flows", "Frequently Asked Questions"]) assert.ok(route.includes(`>${heading}</h2>`), heading);
  assert.match(route, /<section id="tour-reviews"[^>]*>[\s\S]*<TourReviews tourId=\{tour\.id\} initial=\{reviews\} \/>\s*<\/div><\/section>\s*<\/>;/, "reviews are the last section");
  assert.match(route, /money\(current, currency\)/);
  assert.match(route, /JSON\.stringify\(jsonLd\)\.replace\(\/<\/g, "\\\\u003c"\)/);
  assert.match(route, /const jsonLd = page && \{/, "structured data only on written pages");
  assert.match(route, /const startTime = tour\.price_note\?\.match\(/, "a fixed start time from WordPress replaces “Your choice”");
  assert.match(route, /<dd>\{startTime \? `Starts at \$\{startTime\}` : "Your choice"\}<\/dd>/);
  assert.match(route, /"@type": "TouristTrip"/);
  assert.doesNotMatch(route, /tour\.slug/, "WordPress slugs are not used for the URL");
});
