import Image from "next/image";
import Link from "next/link";
import type { Tour } from "@/lib/types";
import { itineraryTitle, money } from "@/lib/format";
import { tourDetailPath } from "@/lib/tour-pages";
import { ReviewScore } from "./ReviewScore";
import { BookingButton } from "./BookingButton";

type CardPresentation = {title:string;priceNote:string;additionalNote?:string;image?:Tour["card_image"]};
// Portrait uploads whose subject sits near the top; the default centred cover crop cuts the rider's head.
const imageFocus: Readonly<Record<string,string>> = {
  "/wp-content/uploads/2026/10/Ubud-D.webp": "center top",
};

// `heading`: h3 when the page already has a section heading above the cards (an area guide), h2 otherwise.
export function TourCard({ tour, presentation, requestedTravelDate, heading: Heading = "h2" }: { tour: Tour; presentation?:CardPresentation; requestedTravelDate?: string; heading?: "h2" | "h3" }) {
  const { regular, sale, currency } = tour.pricing;
  const current = sale ?? regular;
  const discounted = sale !== null && regular !== null && sale < regular;
  const image = presentation?.image ?? tour.card_image;
  const focus = image ? imageFocus[new URL(image.url).pathname] : undefined;
  const title = itineraryTitle(presentation?.title ?? tour.title);
  // 1.33 island package: priced per person in IDR, optional per-car hotel shuttle, its own Included / Not Included lists.
  const island = tour.package ?? null;
  const terms = island && tour.booking_terms ? ([["Included", tour.booking_terms.included], ["Not included", tour.booking_terms.not_included]] as const).filter(([, items]) => items.length) : [];
  return <article className="tour-card" aria-labelledby={`tour-${tour.id}-title`}>
    <div className="tour-image">{image ? <Image src={image.url} alt={image.alt || title} fill sizes="(max-width: 767px) calc(100vw - 72px), (max-width: 1024px) 44vw, 400px" style={focus ? { objectPosition: focus } : undefined} /> : <span>Itinerary image unavailable</span>}</div>
    <div className="tour-card-body">
      <div className="tour-card-heading"><Heading id={`tour-${tour.id}-title`}>{title}</Heading><ReviewScore rating={tour.rating} /></div>
      {tour.destinations.length > 0 && <ul className="destinations">{tour.destinations.map((destination, i) => <li key={`${i}-${destination}`}>{destination}</li>)}</ul>}
      {island ? <div className="tour-pricing">
        <p><strong>{island.person_price === null ? "Price coming soon" : money(island.person_price, "IDR")}</strong>{island.person_price !== null && <span className="tour-duration">/ person</span>}</p>
        {island.shuttle && <p className="package-shuttle">Optional hotel shuttle: {money(island.shuttle.price, "IDR")} per car, round trip (up to {island.shuttle.capacity} people per car)</p>}
      </div> : <div className="tour-pricing">
        {discounted && <del>{money(regular, currency)}</del>}
        <p><strong>{current === null ? "Contact for price" : money(current, currency)}</strong>{current !== null && !currency && <span className="currency-missing">Currency not specified</span>}{tour.duration && <span className="tour-duration">/ {tour.duration}</span>}</p>
      </div>}
      {terms.map(([label, items]) => <p className="package-terms" key={label}><strong>{label}:</strong> {items.join(", ")}</p>)}
      {presentation && <>
        {presentation.additionalNote && <p className="price-note price-note-extra">{presentation.additionalNote}</p>}
        <p className="price-note">{presentation.priceNote}</p>
      </>}
      {island ? <div className="tour-actions">{island.bookable ? <BookingButton tourId={tour.id} title={title} requestedTravelDate={requestedTravelDate} /> : <Link className="button button-outline" href="/#contact">Ask Us on WhatsApp<span className="visually-hidden">: {title}</span></Link>}</div>
      : <div className="tour-actions"><BookingButton tourId={tour.id} title={title} requestedTravelDate={requestedTravelDate} /><Link className="button button-outline" href={tourDetailPath(tour.id)}>Details<span className="visually-hidden">: {title}</span></Link></div>}
      {!presentation && tour.price_note && <p className="price-note">{tour.price_note}</p>}
    </div>
  </article>;
}
