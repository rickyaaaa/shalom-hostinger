import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { csWhatsApp } from "../src/lib/marketing";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");

test("WhatsApp bubble opens a chat with the footer's CS number and an editable starter message", () => {
  const url = new URL(csWhatsApp);
  assert.equal(url.origin + url.pathname, "https://wa.me/6282188757700");
  assert.match(src("components/Footer.tsx"), /href="tel:\+6282188757700">CS: \+62 821 8875 7700</, "the same number as CS in the footer");
  assert.equal(url.searchParams.get("text"), "Hi Shalom Bali Tour, I would like to ask about a private tour in Bali.");
  const bubble = src("components/WhatsAppBubble.tsx");
  assert.match(bubble, /<a className="wa-bubble" href=\{csWhatsApp\} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"/);
  assert.match(src("app/layout.tsx"), /<Footer \/><WhatsAppBubble \/>/, "on every page, after the footer");
});

test("WhatsApp bubble sits bottom right, stays out of order and sign-in pages, and keeps Back to Top reachable", () => {
  const hidden = new RegExp(src("components/WhatsAppBubble.tsx").match(/const hiddenOn = \/(.+)\/;/)![1]);
  for (const path of ["/book/599", "/book/custom", "/account", "/login", "/register", "/forgot-password", "/reset-password", "/request-help", "/ref/abc"]) assert.ok(hidden.test(path), path);
  for (const path of ["/", "/ubud", "/tours/uluwatu-beach-jimbaran-tour", "/blog", "/blog/bali-itinerary", "/bali-driver-hire", "/booking-guide", "/accounts-tips"]) assert.ok(!hidden.test(path), path);
  const css = src("app/globals.css");
  assert.match(css, /\.wa-bubble \{ position: fixed;[^}]*right: max\(20px, env\(safe-area-inset-right\)\); bottom: max\(20px, env\(safe-area-inset-bottom\)\);/);
  assert.match(css, /body:has\(\.wa-bubble\) \.site-footer \{ padding-bottom: 104px; \}/);
});
