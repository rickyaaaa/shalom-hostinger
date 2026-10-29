"use client";

import { useState } from "react";
import { reviewPageSchema, type ReviewPage } from "@/lib/types";
import { ReviewEntry } from "./ReviewEntry";
import { ReviewScore } from "./ReviewScore";

// `initial` is page 1 rendered on the server, so the reviews are in the page HTML; later pages use the same API as the card dialog.
export function TourReviews({ tourId, initial }: { tourId: number; initial: ReviewPage | null }) {
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initial === null);

  async function load(page: number) {
    setBusy(true); setError(false);
    try {
      const response = await fetch(`/api/tours/${tourId}/reviews?page=${page}`, { cache: "no-store" });
      if (!response.ok) throw new Error("unavailable");
      const next = reviewPageSchema.parse(await response.json());
      setData(previous => page === 1 || !previous ? next : { ...next, reviews: [...previous.reviews, ...next.reviews] });
    } catch { setError(true); }
    finally { setBusy(false); }
  }

  return <>
    {data && <ReviewScore rating={data.summary} large />}
    {data && data.reviews.length === 0 && <p className="status-message">No reviews yet for this itinerary.</p>}
    {data?.reviews.map((review, index) => <ReviewEntry key={`${review.published_at}-${review.name}-${index}`} review={review} />)}
    {error && <div className="review-error" role="alert"><p>Reviews couldn’t be loaded. Please try again.</p><button type="button" className="button button-outline" disabled={busy} onClick={() => load(data?.next_page ?? 1)}>{busy ? "Loading…" : "Try again"}</button></div>}
    {data?.has_more && data.next_page && !error && <button type="button" className="button button-outline load-more" disabled={busy} onClick={() => load(data.next_page!)}>{busy ? "Loading…" : "Load more reviews"}</button>}
  </>;
}
