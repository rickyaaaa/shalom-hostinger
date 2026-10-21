import Image from "next/image";
import type { Tour } from "@/lib/types";
import { money } from "@/lib/format";
import { ReviewScore } from "./ReviewScore";
import { ReviewModal } from "./ReviewModal";
import { BookingButton } from "./BookingButton";

type CardPresentation = {title:string;priceNote:string;additionalNote?:string};

export function TourCard({ tour, presentation, requestedTravelDate }: { tour: Tour; presentation?:CardPresentation; requestedTravelDate?: string }) {
  const { regular, sale, currency } = tour.pricing;
  const current = sale ?? regular;
  const discounted = sale !== null && regular !== null && sale < regular;
  return <article className="tour-card" aria-labelledby={`tour-${tour.id}-title`}>
    <div className="tour-image">{tour.card_image ? <Image src={tour.card_image.url} alt={tour.card_image.alt || tour.title} fill sizes="(max-width: 767px) calc(100vw - 72px), (max-width: 1024px) 44vw, 400px" /> : <span>Tour image unavailable</span>}</div>
    <div className="tour-card-body">
      <div className="tour-card-heading"><h2 id={`tour-${tour.id}-title`}>{presentation?.title ?? tour.title}</h2><ReviewScore rating={tour.rating} /></div>
      {tour.destinations.length > 0 && <ul className="destinations">{tour.destinations.map((destination, i) => <li key={`${i}-${destination}`}>{destination}</li>)}</ul>}
      <div className="tour-pricing">
        {discounted && <del>{money(regular, currency)}</del>}
        <p><strong>{current === null ? "Contact for price" : money(current, currency)}</strong>{current !== null && !currency && <span className="currency-missing">Currency not specified</span>}{tour.duration && <span className="tour-duration">/ {tour.duration}</span>}</p>
      </div>
      {presentation && <>
        {presentation.additionalNote && <p className="price-note price-note-extra">{presentation.additionalNote}</p>}
        <p className="price-note">{presentation.priceNote}</p>
      </>}
      <div className="tour-actions"><BookingButton tourId={tour.id} title={tour.title} requestedTravelDate={requestedTravelDate} /><ReviewModal tourId={tour.id} title={tour.title} /></div>
      {!presentation && tour.price_note && <p className="price-note">{tour.price_note}</p>}
    </div>
  </article>;
}
