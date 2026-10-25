import type { Tour } from "@/lib/types";

// Client-approved West Bali presentation only. Canonical WordPress values are not rewritten.
export const westBaliPriceNote = "Note : The price listed will remain the same at the time you place your order, but it may change in the future, depending on the circumstances and conditions at that time.";
const cardTitles: Readonly<Record<number,string>> = {
  633: "A. Temple Tour", 644: "B. Trekking Tour", 651: "C. Healing Tour", 655: "D. Relaxing Tour",
};
// Card photos as on the original West Bali page (A Ulun Danu, B Jatiluwih, C Tanah Lot, D Taman Ayun gate).
const cardImages: Readonly<Record<number,string>> = {
  633: "/wp-content/uploads/2026/09/temple-tour.webp", 644: "/wp-content/uploads/2026/09/trekking-tour.webp",
  651: "/wp-content/uploads/2026/10/tur.webp", 655: "/wp-content/uploads/2026/10/relaxing-tour-1.webp",
};
/** The client-approved card title, so the order form names a West Bali itinerary the same way its card does. */
export function westBaliCardTitle(tour: Pick<Tour, "id" | "title">) { return cardTitles[tour.id] || tour.title; }
const supersededFragments = new Set(["NB:“NOT INCLUDING”", "NB:\nNOT"]);

export function westBaliCardPresentation(tour: Tour) {
  const originalNote = tour.price_note?.trim() || "";
  // Replace only the two known incomplete NB fragments in this page's display.
  // Preserve other supplied text, including the unchanged Trekking start-time wording.
  const additionalNote = supersededFragments.has(originalNote) ? "" : originalNote.replace(westBaliPriceNote, "").trim();
  const imagePath = cardImages[tour.id];
  const image = tour.card_image && imagePath ? { ...tour.card_image, url: new URL(imagePath, tour.card_image.url).href } : tour.card_image;
  return { title: westBaliCardTitle(tour), priceNote: westBaliPriceNote, additionalNote, image };
}
