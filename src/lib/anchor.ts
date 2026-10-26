// Anchor positioning below the sticky mobile header. CSS (scroll-margin-top on [id]) handles native #links;
// this covers programmatic scrolls, which some mobile Safari versions do not offset with scroll-padding/margin.

/** Height of the header while it is sticky (≤1024px); 0 when it scrolls away with the page. */
export function stickyHeaderHeight() {
  const header = document.querySelector<HTMLElement>(".site-header");
  return header && getComputedStyle(header).position === "sticky" ? header.getBoundingClientRect().height : 0;
}

/** Scroll so `element` starts just below the sticky header. Instant by default: a smooth scroll can be cut short on iOS. */
export function scrollToAnchor(element: Element | null, behavior: "instant" | "smooth" = "instant") {
  if (!element) return;
  const root = document.documentElement;
  const gap = parseFloat(getComputedStyle(root).getPropertyValue("--anchor-gap")) || 16;
  const top = Math.max(0, element.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight() - gap);
  if (behavior === "smooth") { window.scrollTo({ top, behavior: "smooth" }); return; }
  // `scroll-behavior: smooth` on <html> would animate even an "auto" scroll; switch it off for this jump only.
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, top);
  root.style.scrollBehavior = previous;
}
