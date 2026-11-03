import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { carCapacity, facebookProfile, faqs, instagramProfile, tiktokProfile } from "../src/lib/marketing";
import { pickItineraryPhotos } from "../src/lib/itinerary-photos";

const src = (file: string) => fs.readFileSync(path.join(import.meta.dirname, "../src", file), "utf8");

test("TikTok links to the official external profile, safely, everywhere", () => {
  assert.equal(tiktokProfile, "https://www.tiktok.com/@shalombalitour");
  const home = src("components/HomeInformation.tsx");
  assert.match(home, /<a href=\{tiktokProfile\} target="_blank" rel="noopener noreferrer">TikTok<\/a>/);
  const all = fs.readdirSync(path.join(import.meta.dirname, "../src"), { recursive: true }).filter(f => /\.(tsx?|css)$/.test(String(f))).map(f => src(String(f))).join("\n");
  assert.equal(all.includes("shalombalitrans"), false, "the old handle is gone");
  assert.equal((all.match(/tiktok\.com/g) ?? []).length, 1, "one canonical definition");
  assert.equal(all.includes("tiktok.com/embed.js"), false, "no third-party TikTok embed script");
});

test("Facebook and Instagram: official profiles, one definition each, linked from Home, the footer and the business JSON-LD", () => {
  assert.equal(facebookProfile, "https://www.facebook.com/profile.php?id=61596414411215", "the page ID, not the expiring share link");
  assert.equal(instagramProfile, "https://www.instagram.com/shalombalitour/", "no tracking parameter");
  const all = fs.readdirSync(path.join(import.meta.dirname, "../src"), { recursive: true }).filter(f => /\.(tsx?|css)$/.test(String(f))).map(f => src(String(f))).join("\n");
  assert.equal((all.match(/facebook\.com/g) ?? []).length, 1);
  assert.equal((all.match(/instagram\.com/g) ?? []).length, 1);
  assert.doesNotMatch(all, /facebook\.com\/share|cplk=/);
  const links = /<a href=\{facebookProfile\} target="_blank" rel="noopener noreferrer">Facebook<\/a><a href=\{instagramProfile\} target="_blank" rel="noopener noreferrer">Instagram<\/a><a href=\{tiktokProfile\} target="_blank" rel="noopener noreferrer">TikTok<\/a>/;
  assert.match(src("components/HomeInformation.tsx"), links);
  assert.match(src("components/Footer.tsx"), links);
  assert.match(src("app/page.tsx"), /sameAs: \[facebookProfile, instagramProfile, tiktokProfile\]/);
});

test("Car capacity comes from one owner-confirmed sentence on Home, the driver page and every tour page", () => {
  assert.equal(carCapacity, "2–5 adults, or up to 7 passengers of smaller build, without luggage");
  assert.match(src("components/HomeInformation.tsx"), /"One car for "\+carCapacity,/);
  assert.match(src("app/bali-driver-hire/page.tsx"), /`One car for \$\{carCapacity\}`[\s\S]*question: "How many people fit in the car\?", answer: `One car takes \$\{carCapacity\}\./);
  assert.match(src("app/tours/[slug]/page.tsx"), /<div><dt>Group Size<\/dt><dd>\{carCapacity\}<\/dd><\/div>/);
  assert.doesNotMatch(JSON.stringify(faqs), /smaller build/, "the client-approved Home FAQ is unchanged");
});

test("Customized Itinerary shows one photo, no slider; Why Choose stays a lightweight slideshow", () => {
  const slider = src("components/PhotoSlider.tsx");
  const gallery = src("components/CustomGallery.tsx");
  const css = src("app/globals.css");
  const pkg = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../package.json"), "utf8"));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).join(" ");
  assert.doesNotMatch(deps, /swiper|slick|embla|keen-slider|splide|glide|flickity|carousel/i);
  // Customized Itinerary: the single "choosing your own itinerary" image, in the box of the image it replaced.
  assert.doesNotMatch(gallery, /PhotoSlider/, "no slider, arrows or dots");
  assert.equal((gallery.match(/<Image /g) ?? []).length, 1);
  assert.match(gallery, /src="\/images\/custom-itinerary\.webp" alt="Choosing your own itinerary"/);
  assert.doesNotMatch(gallery, /\bpriority\b|\bpreload\b|loading="eager"/i, "below the fold, so it loads lazily");
  assert.match(css, /\.custom-gallery \{[^}]*aspect-ratio: 640 \/ 498/);
  assert.match(css, /\.custom-gallery img \{ object-fit: cover; \}/);
  // Why Choose autoplays, politely: reduced motion, off screen, hidden tab, hover/touch/focus and a Pause button all stop it.
  assert.match(css, /\.photo-slider-track \{[^}]*scroll-snap-type: x mandatory/);
  assert.doesNotMatch(slider, /\bpriority\b|\bpreload\b|loading="eager"/i);
  assert.match(src("components/HomeInformation.tsx"), /className="why-slider" autoplay=\{4000\} controls=\{false\}/, "Why Choose is a pure photo slideshow: no arrows or dots");
  assert.match(slider, /\{controls && <>/);
  assert.match(slider, /\{autoplay && controls && !reducedMotion && <button/, "with controls={false} there is no Pause button either");
  for (const guard of [/prefers-reduced-motion: reduce/, /IntersectionObserver/, /document\.hidden/, /onPointerEnter/, /onTouchStart/, /onFocus/, /aria-label=\{paused \? "Play slideshow" : "Pause slideshow"\}/]) assert.match(slider, guard, String(guard));
  assert.match(slider, /i <= reached \+ 1 &&/, "a slide's image renders only once the slide before it is reached");
});

test("Why Choose slider: 8 itinerary photos, areas taking turns, from WordPress, in the old photo's box", () => {
  const tour = (id: number, area: string, image: boolean, alt = "") => ({ id, title: `T${id} Tour`, slug: `t${id}`, area: { slug: area, name: area }, card_image: image ? { id, url: `https://wp.example/wp-content/uploads/t${id}.webp`, alt } : null, destinations: [], pricing: { regular: null, sale: null, currency: null }, duration: "", price_note: "", rating: { score: null, review_count: 0 } });
  const tours = [tour(1, "ubud", true), tour(2, "ubud", true), tour(3, "ubud", true), tour(4, "ubud", false), tour(5, "ubud", true), tour(6, "south-kuta", true, "Jeep on the beach"), tour(7, "south-kuta", true), tour(8, "south-kuta", true), tour(9, "west-bali", true), tour(10, "west-bali", true)];
  const picked = pickItineraryPhotos(tours);
  assert.equal(picked.length, 8);
  assert.deepEqual(picked.map(p => p.src.match(/t(\d+)\.webp/)![1]), ["9", "1", "6", "10", "2", "7", "3", "8"], "West Bali, Ubud, South Kuta in turn; itineraries without a photo skipped");
  assert.equal(picked[1].alt, "Photo from the T1 Itinerary", "missing alt text falls back to the itinerary name");
  assert.equal(picked[2].alt, "Jeep on the beach", "WordPress alt text wins when set");
  assert.equal(pickItineraryPhotos([tour(1, "ubud", true)]).length, 1);
  const home = src("components/HomeInformation.tsx");
  assert.match(home, /<Suspense fallback=\{<div className="photo-slider why-slider" aria-hidden="true"\/>\}><WhyPhotos\/><\/Suspense>/, "the slider streams; a same-size box holds its place");
  assert.match(src("app/globals.css"), /\.why-image > img, \.why-slider \{ width: 100%; height: 400px;/);
});
