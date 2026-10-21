export function BookingButton({ tourId, title }: { tourId: number; title: string }) {
  return <a className="button" href={`/book/${tourId}`} aria-label={`Book Now — ${title}`}>Book Now</a>;
}
