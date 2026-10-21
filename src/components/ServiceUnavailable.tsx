export function ServiceUnavailable({ subject, retryHref = "/#review" }: { subject: "tour" | "reviews"; retryHref?: string }) {
  return <div className="service-unavailable" role="status">
    <h2>{subject === "tour" ? "Tour information is temporarily unavailable" : "Guest reviews are temporarily unavailable"}</h2>
    <p>Please try again shortly.</p>
    <a className="button button-outline" href={retryHref}>Try again</a>
  </div>;
}
