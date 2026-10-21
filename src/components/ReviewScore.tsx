import type { Rating } from "@/lib/types";
import { Icon } from "./Icon";

export function ReviewScore({ rating, large = false }: { rating: Rating; large?: boolean }) {
  const populated = rating.review_count > 0 && rating.score !== null;
  return <div className={`review-score${large ? " review-score-large" : ""}`} aria-label={populated ? `${rating.score!.toFixed(1)} out of 10 from ${rating.review_count} ${rating.review_count === 1 ? "review" : "reviews"}` : "No reviews yet"}>
    <span className="score-value">{populated && <Icon name="star" />}{populated ? <>{rating.score!.toFixed(1)}<small>/10</small></> : "New"}</span>
    <span className="score-count">{populated ? `${rating.review_count} ${rating.review_count === 1 ? "review" : "reviews"}` : "No reviews yet"}</span>
  </div>;
}
