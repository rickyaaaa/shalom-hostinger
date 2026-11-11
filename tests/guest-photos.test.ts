import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { aboutGuestPhotos, driverHireGuestPhotos, guestPhotos, type GuestPhoto } from "../src/lib/guest-photos";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const dir = new URL("../public/images/guests/", import.meta.url);
const photos = Object.entries(guestPhotos) as [string, GuestPhoto][];

test("Guest photos: every file is registered, named for what it shows, and carries matching notes and EXIF", () => {
  const files = readdirSync(dir).filter(file => file.endsWith(".webp")).map(file => file.replace(/\.webp$/, ""));
  assert.deepEqual(files.sort(), photos.map(([key]) => key).sort(), "public/images/guests holds exactly the registered photos");
  for (const [key, photo] of photos) {
    assert.match(key, /^[a-z]+(-[a-z]+){2,}$/, `${key}: a descriptive kebab-case name, no numbers or camera file names`);
    assert.doesNotMatch(key, /img|whatsapp|photo|image|\d/i, key);
    assert.equal(photo.src, `/images/guests/${key}.webp`);
    assert.ok(photo.alt.length >= 30 && !/^(image|photo|picture) of/i.test(photo.alt), `${key}: descriptive alt text`);
    const note = JSON.parse(readFileSync(new URL(`${key}.webp.json`, dir), "utf8"));
    assert.equal(note.owner, "Shalom Bali Tour", key);
    assert.match(note.source, /sent by the client/, key);
    assert.equal(note.description, photo.alt, `${key}: the note describes the photo with its alt text`);
    assert.equal(note.width, photo.width, key); assert.equal(note.height, photo.height, key);
    assert.ok(Math.max(photo.width, photo.height) <= 1200, `${key}: at most 1200px`);
    const file = readFileSync(new URL(`${key}.webp`, dir));
    assert.equal(file.subarray(8, 12).toString("latin1"), "WEBP", `${key}: a real WebP`);
    assert.ok(file.includes(Buffer.from(photo.alt, "utf8")), `${key}: EXIF ImageDescription is the alt text`);
    assert.ok(file.includes(Buffer.from("Shalom Bali Tour", "utf8")), `${key}: EXIF artist and copyright`);
  }
});

test("Guest photo alt text describes the scene only: no names, nationalities, vehicle models or claims", () => {
  const text = JSON.stringify(guestPhotos);
  assert.doesNotMatch(text, /Sheeraz|Raider|Toyota|Avanza|air-?con|\bbest\b|licensed|English-speaking/i);
  assert.doesNotMatch(text, /\b(Asian|African|European|Chinese|Japanese|Korean|Australian|American|Indian|Filipino|black|white) (family|guests?|man|woman|men|women|couple)\b/i);
  assert.doesNotMatch(text, /Tirta Empul|Nusa Penida|Lembongan|arrivals/i, "only places the photo makes clear");
});

test("Every guest photo is shown: all on About Us, the driver photos on Hire a Driver, all lazy-loaded", () => {
  assert.deepEqual([...aboutGuestPhotos].sort(), photos.map(([key]) => key).sort());
  assert.equal(driverHireGuestPhotos.length, 4);
  for (const key of driverHireGuestPhotos) assert.ok(Object.hasOwn(guestPhotos, key), key);
  const home = src("app/page.tsx");
  assert.doesNotMatch(home, /GuestGallery/, "client 2026-11-11: the guest photos moved from Home to About Us");
  assert.match(src("app/about/page.tsx"), /<h2 id="about-guests-title">Moments with Our Guests<\/h2>[\s\S]*<GuestGallery photos=\{aboutGuestPhotos\}/);
  const driver = src("app/bali-driver-hire/page.tsx");
  assert.match(driver, /<h2 id="driver-hire-guests-title">On the Road with Our Guests<\/h2>[\s\S]*<GuestGallery photos=\{driverHireGuestPhotos\}/);
  const gallery = src("components/GuestGallery.tsx");
  assert.match(gallery, /<Image src=\{photo\.src\} alt=\{photo\.alt\} width=\{photo\.width\} height=\{photo\.height\}/);
  assert.doesNotMatch(gallery, /\bpriority\b|\bpreload\b|loading="eager"|fetchPriority/, "below the fold, so every photo loads lazily");
  assert.match(src("app/globals.css"), /\.guest-gallery li \{ aspect-ratio: 1 \/ 1;/);
});
