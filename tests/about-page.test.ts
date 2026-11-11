import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { reviewSchema } from "../src/lib/types";
import { aboutStory } from "../src/lib/marketing";
import { ReviewSlider, quoteSize } from "../src/components/ReviewSlider";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const review = {
  tour_id: 7, tour_title: "A. Ubud Tour", area: "Ubud", name: "A***** Z******", country: "France",
  experience: "Harry made our stay in Bali memorable.", score: 10, ratings: { driving_skill: 10, service: 10, car: 10 },
  price: "worth_it", recommend: "yes", booking_date: "2025-10-06", published_at: "2026-10-28T09:12:00+08:00",
};
const slider = (items: object[]) => renderToStaticMarkup(createElement(ReviewSlider, { reviews: items.map(item => reviewSchema.parse({ ...review, ...item })) }));

test("About text is the owner's own words, word for word, on Home and About Us", () => {
  assert.deepEqual([...aboutStory], [
    "Since 2016, Shalom Bali Tour has helped travelers explore Bali through private transportation and flexible itineraries.",
    "This year, I decided to create this website, which was launched on 1 November 2026.",
    "We focus on providing a comfortable and personal travel experience, whether you choose one of our recommended itineraries or create a customized Bali tour based on the destinations you want to visit.",
  ]);
  const home = src("components/HomeInformation.tsx").match(/export function AboutSection[\s\S]*?\n/)![0];
  assert.match(home, /aboutStory\.map/);
  assert.match(home, /<Link href="\/about" className="button about-more">More About Us<\/Link>/, "Home's About links to the full page");
  assert.match(src("app/about/page.tsx"), /aboutStory\.map/);
});

test("About Us follows the Monks template order: banner and breadcrumb, story with facts, Why Choose, guest photos, call to action", () => {
  const page = src("app/about/page.tsx");
  const order = ['className="about-hero"', 'aria-label="Breadcrumb"', 'className="about-story"', 'className="about-stats"', "<WhyChooseUs />", 'className="about-guests"', 'className="about-cta"'].map(marker => page.indexOf(marker));
  assert.ok(order.every(index => index > 0), "every section is present");
  assert.deepEqual([...order].sort((a, b) => a - b), order, "in the template's order");
  assert.match(page, /<h1 id="about-title">About Us<\/h1>/);
  assert.match(page, /publicMetadata\("About Us", "[^"]+", "\/about"\)/);
  assert.match(page, /"@type": "BreadcrumbList"/);
  assert.match(page, /\["2016", "Serving Bali travelers since"\], \["3", "Main tour areas"\], \["10 Hours", "With your private driver"\]/, "only facts the site already states");
  assert.doesNotMatch(page, /\d+%|\d+\+|satisf|\bbest\b|licensed|English-speaking|guarantee|award|team of/i, "no invented numbers or claims");
});

test("About Us is in the menu, the site links and the sitemap", () => {
  assert.match(src("components/MobileMenu.tsx"), /<Link href="\/about" aria-current=\{pathname==="\/about"\?"page":undefined\} onClick=\{close\}>About<\/Link>/);
  assert.doesNotMatch(src("components/MobileMenu.tsx"), /\["About","about"\]/, "no longer a Home anchor");
  assert.match(src("lib/site.ts"), /about: "\/about"/);
  assert.match(src("app/sitemap.ts"), /"\/about"/);
});

test("Home reviews: one large quote at a time on the dark band, guest below, arrows only when there is more than one", () => {
  assert.match(src("app/page.tsx"), /return <ReviewSlider reviews=\{latest\.reviews\} \/>;/);
  const two = slider([{}, { name: "D*****", country: "Singapore", experience: "Second review.", booking_date: null }]);
  assert.match(two, /<blockquote class="review-slider-quote">“Harry made our stay in Bali memorable\.”<\/blockquote>/);
  assert.doesNotMatch(two, /Second review/, "only the current review is shown");
  assert.match(two, /aria-roledescription="carousel"/);
  assert.match(two, /aria-label="1 of 2"/);
  assert.match(two, /aria-label="Overall rating 10\.0 out of 10"/);
  assert.match(two, /<span class="review-slider-avatar" aria-hidden="true">A<\/span><p class="review-slider-name">A\*{5} Z\*{6}<\/p><p class="review-slider-meta">France · Ubud<\/p>/);
  assert.match(two, /Booking date: <time dateTime="2025-10-06">6 October 2025<\/time>/);
  assert.match(two, /aria-label="Previous review" disabled=""/, "the first slide cannot go back");
  assert.match(two, /aria-label="Next review"(?! disabled)/);
  const one = slider([{ booking_date: null }]);
  assert.doesNotMatch(one, /review-slider-arrow|Booking date/, "a single review has no arrows; no date line without a date");
  assert.equal(slider([]), "");
});

test("Long reviews get a smaller quote", () => {
  assert.equal(quoteSize("x".repeat(280)), "");
  assert.equal(quoteSize("x".repeat(281)), "is-long");
  assert.equal(quoteSize("x".repeat(601)), "is-very-long");
});
