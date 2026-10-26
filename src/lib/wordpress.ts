import "server-only";
import { cache } from "react";
import type { z } from "zod";
import { wordpressConfig } from "./config";
import { bookingTermsSchema, latestReviewsSchema, reviewPageSchema, tourSchema, tourCollectionSchema, type Tour } from "./types";

export class WordPressApiError extends Error {
  constructor(public readonly kind: "network" | "http" | "contract", public readonly status?: number) {
    super("The Shalom service could not load this information.");
    this.name = "WordPressApiError";
  }
}

async function get<T>(path: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
  const { api } = wordpressConfig();
  let response: Response;
  try {
    response = await fetch(`${api}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: signal ?? AbortSignal.timeout(12_000),
    });
  } catch { throw new WordPressApiError("network"); }
  if (!response.ok) throw new WordPressApiError("http", response.status);
  let value: unknown;
  try { value = await response.json(); } catch { throw new WordPressApiError("contract"); }
  const result = schema.safeParse(value);
  if (!result.success) throw new WordPressApiError("contract");
  return result.data;
}

// React deduplicates repeated reads within the server render, without persisting stale data.
function validateImage(tour: Tour) {
  if (tour.card_image) {
    const image = new URL(tour.card_image.url);
    const site = new URL(wordpressConfig().site);
    if (image.origin !== site.origin || !image.pathname.startsWith("/wp-content/uploads/") || image.search || image.hash) throw new WordPressApiError("contract");
  }
  return tour;
}
export const getTour = cache(async (id: number) => {
  if (!Number.isSafeInteger(id) || id < 1) throw new WordPressApiError("http", 404);
  const tour = await get(`/tours/${id}`, tourSchema);
  if (tour.id !== id) throw new WordPressApiError("contract");
  return validateImage(tour);
});
export const getPocTour = () => getTour(523);
export const getAreaTours = cache(async (area: string) => {
  if (!["ubud", "south-kuta", "west-bali"].includes(area)) throw new WordPressApiError("http", 404);
  const first = await get(`/tours?area=${area}&per_page=50&page=1`, tourCollectionSchema);
  const rest = await Promise.all(Array.from({length: Math.max(0, first.total_pages - 1)}, (_, i) => get(`/tours?area=${area}&per_page=50&page=${i + 2}`, tourCollectionSchema)));
  const items = [first, ...rest].flatMap(page => page.items);
  if (items.some(tour => tour.area?.slug !== area)) throw new WordPressApiError("contract");
  return items.map(validateImage);
});

export const getLatestReviews = cache(() => get("/latest-reviews?limit=3", latestReviewsSchema));

/** All itineraries in one request (Home photo slider); images are validated like everywhere else. */
export const getItineraries = cache(async () => (await get("/tours?per_page=50&page=1", tourCollectionSchema)).items.map(validateImage));

/** Site-wide NB terms in the client's wording (WordPress 1.27): the same source as the WhatsApp reconfirmation. */
export const getBookingTerms = cache(() => get("/booking-terms", bookingTermsSchema));

export async function getTourReviews(tourId: number, page: number, signal?: AbortSignal) {
  if (!Number.isSafeInteger(tourId) || tourId < 1 || !Number.isSafeInteger(page) || page < 1 || page > 10_000) throw new WordPressApiError("http", 400);
  return get(`/tours/${tourId}/reviews?page=${page}`, reviewPageSchema, signal);
}
