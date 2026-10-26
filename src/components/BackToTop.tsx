"use client";
import type { MouseEvent } from "react";
import { Icon } from "./Icon";

/** Scrolls the current page back to the very top in place: no navigation or reload. */
export function BackToTop() {
  function toTop(event: MouseEvent<HTMLButtonElement>) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // Keyboard activation (detail 0) also moves focus to the top, so the next Tab continues from there.
    if (event.detail === 0) document.querySelector<HTMLElement>(".skip-link")?.focus({ preventScroll: true });
  }
  return <button type="button" className="back-to-top" onClick={toTop} aria-label="Back to top"><Icon name="chevron" /></button>;
}
