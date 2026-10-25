import { bookingPath } from "@/lib/booking-intent";

export function BookingButton({ tourId, title, requestedTravelDate }: { tourId: number; title: string; requestedTravelDate?: string }) {
  return <a className="button" href={bookingPath({ kind: "tour", tour_id: tourId, ...(requestedTravelDate ? { requested_travel_date: requestedTravelDate } : {}) })} aria-label={`Order Now — ${title}`}>Order Now</a>;
}
