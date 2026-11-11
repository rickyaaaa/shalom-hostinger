"use client";
import { useRef, useState } from "react";
import type { Review } from "@/lib/types";
import { Icon } from "./Icon";
import { ReviewStars, bookingDateLabel } from "./ReviewEntry";

/** Longer reviews get a smaller quote so every slide stays readable on one screen. */
export function quoteSize(text: string) {
  return text.length > 600 ? "is-very-long" : text.length > 280 ? "is-long" : "";
}

/**
 * Home, "What Our Guests Say" (client: the Monks template's testimonial band). One review at a time as a large quote
 * on a dark band, with the guest below and arrows either side. Reviews carry no photo, so the circle shows an initial.
 */
export function ReviewSlider({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);
  const touch = useRef<number | null>(null);
  const count = reviews.length;
  const review = reviews[Math.min(index, count - 1)];
  if (!review) return null;
  const go = (step: number) => setIndex(current => Math.max(0, Math.min(count - 1, current + step)));
  const bookingDate = bookingDateLabel(review.booking_date);
  const meta = [review.country, review.area].filter(Boolean).join(" · ");
  return <div className="review-slider" role="region" aria-roledescription="carousel" aria-label="Guest reviews"
    onTouchStart={event => { touch.current = event.touches[0]?.clientX ?? null; }}
    onTouchEnd={event => { const start = touch.current; touch.current = null; const end = event.changedTouches[0]?.clientX; if (start !== null && end !== undefined && Math.abs(end - start) > 48) go(end < start ? 1 : -1); }}>
    <div className="review-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`} aria-live="polite" key={index}>
      <div className="review-slider-score" aria-label={`Overall rating ${review.score.toFixed(1)} out of 10`}><ReviewStars score={review.score} /><strong>{review.score.toFixed(1)}</strong></div>
      <blockquote className={`review-slider-quote ${quoteSize(review.experience)}`.trim()}>&ldquo;{review.experience}&rdquo;</blockquote>
      <div className="review-slider-guest">
        <span className="review-slider-avatar" aria-hidden="true">{review.name.trim().charAt(0).toUpperCase() || "G"}</span>
        <p className="review-slider-name">{review.name}</p>
        {meta && <p className="review-slider-meta">{meta}</p>}
        {bookingDate && <p className="review-slider-date">Booking date: <time dateTime={review.booking_date!}>{bookingDate}</time></p>}
      </div>
    </div>
    {count > 1 && <>
      <button type="button" className="review-slider-arrow review-slider-prev" aria-label="Previous review" disabled={index === 0} onClick={() => go(-1)}><Icon name="arrow" /></button>
      <button type="button" className="review-slider-arrow review-slider-next" aria-label="Next review" disabled={index === count - 1} onClick={() => go(1)}><Icon name="arrow" /></button>
      <p className="review-slider-count" aria-hidden="true">{index + 1} / {count}</p>
    </>}
  </div>;
}
