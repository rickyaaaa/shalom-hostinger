import type { Review } from "@/lib/types";
import { displayDate } from "@/lib/format";
import { Icon } from "./Icon";

export function ReviewEntry({ review, showTour = false }: { review: Review; showTour?: boolean }) {
  const bookingDate = displayDate(review.booking_date);
  return <article className="review-entry">
    <div className="individual-rating" aria-label={`Overall rating ${review.score.toFixed(1)} out of 10`}>
      <span className="review-stars" aria-hidden="true"><span className="review-stars-base">{[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" />)}</span><span className="review-stars-fill" style={{ width: `${Math.max(0, Math.min(100, review.score * 10))}%` }}><span>{[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" />)}</span></span></span>
      <strong>{review.score.toFixed(1)}</strong>
    </div>
    <blockquote className="review-experience">{review.experience}</blockquote>
    <div className="review-guest"><h3>{review.name}</h3>{review.country && <p>{review.country}</p>}</div>
    <p className="review-booking-date">{bookingDate ? `Booking date: ${bookingDate}` : "Booking date unavailable"}</p>
    {displayDate(review.published_at) && <p className="review-booking-date">Reviewed <time dateTime={review.published_at}>{displayDate(review.published_at)}</time></p>}
    {showTour && review.area && <p className="review-area">{review.area}</p>}
    <dl className="review-dimensions">
      <div><dt>Driving Skill</dt><dd>{review.ratings.driving_skill}/10</dd></div>
      <div><dt>Service</dt><dd>{review.ratings.service}/10</dd></div>
      <div><dt>Car</dt><dd>{review.ratings.car}/10</dd></div>
    </dl>
    {(review.price !== null || review.recommend !== null) && <div className="review-verdicts">{review.price !== null && <span>{review.price === "worth_it" ? "Worth It" : "Not Worth It"}</span>}{review.recommend !== null && <span className={review.recommend === "yes" ? "is-recommended" : "is-not-recommended"}>{review.recommend === "yes" ? <>Recommended <Icon name="check" /></> : "Not Recommended"}</span>}</div>}
  </article>;
}
