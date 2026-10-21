export function BookingButton({ tourId, title, requestedTravelDate }: { tourId: number; title: string; requestedTravelDate?: string }) {
  const query = requestedTravelDate ? `?requested_travel_date=${encodeURIComponent(requestedTravelDate)}` : "";
  return <a className="button" href={`/book/${tourId}${query}`} aria-label={`Order Now — ${title}`}>Order Now</a>;
}
