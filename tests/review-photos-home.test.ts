import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { reviewSchema } from "../src/lib/types";
import { ReviewEntry } from "../src/components/ReviewEntry";
import { ReviewSlider } from "../src/components/ReviewSlider";
import { ReviewPhotos } from "../src/components/ReviewPhotos";
import { MAX_REVIEW_PHOTOS } from "../src/components/ReviewPhotoPicker";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const photo = (id: number) => ({ id, url: `https://cms.shalombalitour.com/wp-content/uploads/2026/11/review-photo-${id}-1024x768.jpg`, thumb: `https://cms.shalombalitour.com/wp-content/uploads/2026/11/review-photo-${id}-300x225.jpg`, width: 1024, height: 768 });
const review = {
  tour_id: 7, tour_title: "A. Ubud Tour", area: "Ubud", name: "A***** Z******", country: "France",
  experience: "Harry made our stay in Bali memorable.", score: 10, ratings: { driving_skill: 10, service: 10, car: 10 },
  price: "worth_it", recommend: "yes", booking_date: null, published_at: "2026-10-28T09:12:00+08:00",
};

test("Review photos: WordPress 1.36 sends up to five; older plugins send none", () => {
  assert.equal(reviewSchema.parse(review).photos, undefined);
  assert.equal(reviewSchema.parse({ ...review, photos: [photo(1), photo(2)] }).photos?.length, 2);
  assert.throws(() => reviewSchema.parse({ ...review, photos: [1, 2, 3, 4, 5, 6].map(photo) }), "no more than five");
  assert.throws(() => reviewSchema.parse({ ...review, photos: [{ ...photo(1), url: "javascript:alert(1)" }] }), "only real URLs");
  assert.equal(MAX_REVIEW_PHOTOS, 5);
});

test("Review photos show as thumbnails that open a viewer, on Home's band, tour review cards and My Reviews", () => {
  const html = renderToStaticMarkup(createElement(ReviewPhotos, { photos: [photo(1), photo(2)], label: "Photos from A's review" }));
  assert.match(html, /<ul class="review-photos" aria-label="Photos from A&#x27;s review">/);
  assert.match(html, /<button type="button" aria-label="Open photo 1 of 2"><img src="https:\/\/cms\.shalombalitour\.com\/wp-content\/uploads\/2026\/11\/review-photo-1-300x225\.jpg" alt="" width="72" height="72" loading="lazy" decoding="async"\/><\/button>/);
  assert.match(html, /<dialog class="review-photo-viewer"/);
  assert.equal(renderToStaticMarkup(createElement(ReviewPhotos, { photos: [], label: "x" })), "", "no photos, no markup");
  const band = renderToStaticMarkup(createElement(ReviewSlider, { reviews: [reviewSchema.parse({ ...review, photos: [photo(3)] })] }));
  assert.match(band, /<\/blockquote><ul class="review-photos review-photos-band"/, "on the band, right under the quote");
  const card = renderToStaticMarkup(createElement(ReviewEntry, { review: reviewSchema.parse({ ...review, photos: [photo(4)] }) }));
  assert.match(card, /<\/blockquote><ul class="review-photos"/, "on review cards, right under the experience");
  assert.match(src("components/CustomerAccount.tsx"), /<ReviewPhotos photos=\{item\.photos\} label="Your photos" \/>/);
  assert.match(src("lib/customer-types.ts"), /title: z\.string\(\), experience: z\.string\(\), photos: z\.array\(reviewPhotoSchema\)\.max\(5\)\.optional\(\),/);
});

test("The review form adds up to five photos, resized in the browser, and sends them as multipart only when there are photos", () => {
  const form = src("components/CustomerAccount.tsx");
  assert.match(form, /<ReviewPhotoPicker photos=\{photos\} onChange=\{setPhotos\} disabled=\{busy\} \/>/);
  assert.match(form, /if \(photos\.length\) \{[\s\S]*form\.append\("photos", photo\.file\)[\s\S]*customerUpload\("reviews", form\)[\s\S]*\} else result = await customerFetch\("reviews", fields\);/);
  const picker = src("components/ReviewPhotoPicker.tsx");
  assert.match(picker, /const MAX_EDGE = 1600;/);
  assert.match(picker, /canvas\.toBlob\(resolve, "image\/jpeg", 0\.85\)/, "re-encoded as JPEG, so camera data never leaves the device");
  assert.match(picker, /imageOrientation: "from-image"/, "phone photos stay upright");
});

test("The BFF validates review photos before WordPress: count, type, size, and PHP's photos[] field", () => {
  const route = src("app/api/customer/[action]/route.ts");
  assert.match(route, /const REVIEW_PHOTO_MAX = 5;\r?\nconst REVIEW_PHOTO_BYTES = 5 \* 1024 \* 1024;\r?\nconst REVIEW_PHOTO_TYPES = \["image\/jpeg", "image\/png", "image\/webp"\];/);
  const block = route.slice(route.indexOf('action === "reviews" && request.headers.get("content-type")?.startsWith("multipart/form-data")'));
  assert.match(block, /request\.headers\.get\("origin"\) !== appOrigin\(\)/, "same-origin only");
  assert.match(block, /const session = await readSession\(\);\s*if \(!session\)/, "signed-in customers only");
  assert.match(block, /reviewInput\.parse\(/, "the same field rules as a JSON review");
  assert.match(block, /photos\.length > REVIEW_PHOTO_MAX/);
  assert.match(block, /!REVIEW_PHOTO_TYPES\.includes\(photo\.type\)/);
  assert.match(block, /photo\.size > REVIEW_PHOTO_BYTES/);
  assert.match(block, /upstream\.append\("photos\[\]", photo,/);
  assert.match(block, /customerMultipartRequest\("reviews", upstream, session, \{ timeout: 60_000,/);
});

test("Home order (client 2026-11-14): hero, itineraries, customized, why, reviews, about, how it works, private driver, FAQ, guides", () => {
  const page = src("app/page.tsx");
  const order = ['className="home-hero"', 'className="home-itineraries"', 'className="customized-section"', "<WhyChooseUs/>", 'className="home-reviews"', "<AboutSection/>", "<HowItWorks/>", "<DriverSection/>", "<FAQ/>", "<RecentGuides/>"].map(marker => page.indexOf(marker));
  assert.ok(order.every(index => index > 0), "every section is on Home");
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("Home About: a guest photo on the left, the owner's story, button and facts on the right", () => {
  const about = src("components/HomeInformation.tsx").match(/export function AboutSection[\s\S]*?\n/)![0];
  assert.match(about, /guestPhotos\["guests-hotel-evening-farewell"\]/);
  assert.match(about, /<div className="information-inner about-split"><div className="about-split-photo"><Image src=\{photo\.src\} alt=\{photo\.alt\}[\s\S]*<\/div><div className="about-split-copy">/, "photo first, so it sits on the left");
  assert.match(about, /aboutStory\.map[\s\S]*More About Us<\/Link><div className="about-facts">/);
  assert.match(src("app/globals.css"), /\.about-split \{ display: grid; grid-template-columns: minmax\(0, \.9fr\) minmax\(0, 1fr\);/);
});
