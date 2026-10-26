import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { tiktokProfile } from "../src/lib/marketing";

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

test("Customized Itinerary gallery stays lightweight: native scroll-snap, no autoplay, no carousel library, lazy later slides", () => {
  const gallery = src("components/CustomGallery.tsx");
  const css = src("app/globals.css");
  const pkg = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../package.json"), "utf8"));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).join(" ");
  assert.doesNotMatch(deps, /swiper|slick|embla|keen-slider|splide|glide|flickity|carousel/i);
  assert.match(css, /\.custom-gallery-track \{[^}]*scroll-snap-type: x mandatory/);
  assert.match(css, /\.custom-gallery \{[^}]*aspect-ratio: 640 \/ 498/);
  assert.doesNotMatch(gallery, /setInterval|setTimeout|\bautoplay\b|\bpriority\b|\bpreload\b|loading="eager"/i);
  assert.match(gallery, /i <= reached \+ 1 &&/, "a slide's image renders only once the slide before it is reached");
  const alts = [...gallery.matchAll(/alt: "([^"]+)"/g)].map(m => m[1]);
  assert.ok(alts.length >= 3 && alts.every(alt => alt.length > 10), "every photo has meaningful alt text");
});
