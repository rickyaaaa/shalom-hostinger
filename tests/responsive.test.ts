import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scrollToAnchor, stickyHeaderHeight } from "../src/lib/anchor";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

/** Minimal DOM stand-in: a sticky header of `header` px and a target `top` px below the viewport top. */
function fakeDom({ header = 102, sticky = true, top = 900, scrollY = 0, gap = "16px" } = {}) {
  const calls: { top: number; behavior?: string }[] = [];
  const rootStyle = { scrollBehavior: "smooth" as string, setProperty() {} };
  const headerEl = { getBoundingClientRect: () => ({ height: header }) };
  Object.assign(globalThis, {
    document: { querySelector: () => headerEl, documentElement: { style: rootStyle } },
    window: { scrollY, scrollTo: (a: number | { top: number; behavior: string }, b?: number) => { calls.push(typeof a === "number" ? { top: b ?? 0, behavior: rootStyle.scrollBehavior } : { top: a.top, behavior: a.behavior }); } },
    getComputedStyle: (el: unknown) => el === headerEl ? { position: sticky ? "sticky" : "relative" } : { getPropertyValue: () => gap },
  });
  return { calls, rootStyle, target: { getBoundingClientRect: () => ({ top }) } as unknown as Element };
}

test("Anchors land below the measured sticky header, not a fixed guess", () => {
  for (const header of [102, 119, 150]) {
    const { calls, target } = fakeDom({ header, top: 900, scrollY: 40 });
    scrollToAnchor(target);
    assert.equal(calls[0].top, 900 + 40 - header - 16, `header ${header}px`);
  }
});

test("Programmatic anchor jumps are instant and restore the page's smooth scrolling", () => {
  const { calls, rootStyle, target } = fakeDom();
  scrollToAnchor(target);
  assert.equal(calls[0].behavior, "auto");
  assert.equal(rootStyle.scrollBehavior, "smooth");
});

test("Desktop header is not sticky, so only the gap applies", () => {
  const { calls, target } = fakeDom({ sticky: false, top: 500, gap: "24px" });
  assert.equal(stickyHeaderHeight(), 0);
  scrollToAnchor(target);
  assert.equal(calls[0].top, 476);
});

test("Responsive CSS invariants", () => {
  assert.doesNotMatch(css, /scroll-padding-top:\s*120px/, "no fixed root anchor offset");
  assert.match(css, /\[id\] \{ scroll-margin-top: calc\(var\(--site-header-height\) \+ var\(--anchor-gap\)\); \}/, "every anchor offsets by the measured header");
  assert.match(css, /--control-height: 48px/, "one control height token");
  assert.match(css, /\.booking-search-field select \{ height: var\(--control-height\); min-height: var\(--control-height\); padding: 0 14px; font-size: 16px;/, "controls use the token and 16px text (no iOS focus zoom)");
  assert.match(css, /\.booking-search-field select \{ -webkit-appearance: none; appearance: none; padding-right: 44px;[^}]*text-overflow: ellipsis;/, "selects reserve space for the arrow and truncate long names");
  assert.doesNotMatch(css, /(html|body)\s*\{[^}]*overflow-x:\s*hidden/, "overflow is fixed at the source, not hidden");
  for (const rule of css.match(/[^;{}]*\d+dvh[^;{}]*/g) ?? []) {
    const property = rule.split(":")[0].trim();
    assert.match(css, new RegExp(`${property}:[^;]*\\d+vh[^;]*; ${property}:[^;]*dvh`), `dvh rule has a vh fallback: ${rule.trim()}`);
  }
});
