import type { Review } from "@/lib/types";
import { Icon } from "./Icon";

/** "10 September 2026" for a YYYY-MM-DD calendar date; null when there is no usable date. */
export function bookingDateLabel(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value ? null : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

/** Five stars filled to the 0–10 score; decorative, so the caller labels the score. */
export function ReviewStars({ score }: { score: number }) {
  return <span className="review-stars" aria-hidden="true"><span className="review-stars-base">{[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" />)}</span><span className="review-stars-fill" style={{ width: `${Math.max(0, Math.min(100, score * 10))}%` }}><span>{[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" />)}</span></span></span>;
}

export function ReviewEntry({ review, showTour = false }: { review: Review; showTour?: boolean }) {
  const bookingDate = bookingDateLabel(review.booking_date);
  return <article className="review-entry">
    <div className="individual-rating" aria-label={`Overall rating ${review.score.toFixed(1)} out of 10`}>
      <ReviewStars score={review.score} />
      <strong>{review.score.toFixed(1)}</strong>
    </div>
    <blockquote className="review-experience">{review.experience}</blockquote>
    <div className="review-guest"><h3>{review.name}</h3>{review.country && <p>{review.country}</p>}</div>
    {bookingDate && <p className="review-booking-date">Booking date: <time dateTime={review.booking_date!}>{bookingDate}</time></p>}
    {showTour && review.area && <p className="review-area">{review.area}</p>}
    <dl className="review-dimensions">
      <div><dt>Driving Skill</dt><dd>{review.ratings.driving_skill}/10</dd></div>
      <div><dt>Service</dt><dd>{review.ratings.service}/10</dd></div>
      <div><dt>Car</dt><dd>{review.ratings.car}/10</dd></div>
    </dl>
    {(review.price !== null || review.recommend !== null) && <div className="review-verdicts">{review.price !== null && <span>{review.price === "worth_it" ? "Worth It" : "Not Worth It"}</span>}{review.recommend !== null && <span className={review.recommend === "yes" ? "is-recommended" : "is-not-recommended"}>{review.recommend === "yes" ? <>Recommended <Icon name="check" /></> : "Not Recommended"}</span>}</div>}
  </article>;
}
