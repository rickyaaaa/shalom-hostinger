import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getBookingTerms, getTour, getTourReviews, WordPressApiError } from "@/lib/wordpress";
import { itineraryTitle, money } from "@/lib/format";
import { areas, type AreaSlug } from "@/lib/marketing";
import { publicMetadata } from "@/lib/seo";
import { serverEnv } from "@/lib/server-env";
import { tourDetailPath, tourPageBySlug, tourPageSlug, type TourPageContent } from "@/lib/tour-pages";
import type { Tour } from "@/lib/types";
import { BookingButton } from "@/components/BookingButton";
import { ReviewScore } from "@/components/ReviewScore";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";
import { TourReviews } from "@/components/TourReviews";
import { westBaliCardPresentation } from "@/components/westBaliPresentation";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
const noindex = { robots: { index: false, follow: false } };

/** A written page by its slug, or a tour ID for the WordPress-only page; a tour ID that has a written page redirects to it. */
function resolve(slug: string): { page: TourPageContent; tourId: number } | { page: null; tourId: number } {
  const page = tourPageBySlug(slug);
  if (page) return { page, tourId: page.tourId };
  if (!/^[1-9]\d{0,9}$/.test(slug)) notFound();
  const tourId = Number(slug);
  if (tourPageSlug(tourId)) permanentRedirect(tourDetailPath(tourId));
  return { page: null, tourId };
}

function areaOf(tour: Tour) {
  const slug = tour.area?.slug;
  return slug && Object.hasOwn(areas, slug) ? areas[slug as AreaSlug] : null;
}

// The same title, photo and notes as the tour's card (West Bali cards use client-approved presentation).
function cardView(tour: Tour) {
  const west = tour.area?.slug === "west-bali" ? westBaliCardPresentation(tour) : null;
  return {
    title: itineraryTitle(west?.title ?? tour.title),
    image: west?.image ?? tour.card_image,
    notes: west ? [west.additionalNote, west.priceNote].filter(Boolean) : [tour.price_note].filter(Boolean) as string[],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { page, tourId } = resolve(slug);
  if (page) {
    // From the code only (no WordPress request); the layout template adds "| Shalom Bali Tour".
    const area = areas[page.area];
    const base = publicMetadata(page.title, page.metaDescription, `/tours/${slug}`);
    const images = [{ url: area.image, alt: area.alt }];
    return {
      ...base,
      ...(page.indexable ? {} : noindex),
      openGraph: { ...base.openGraph, images },
      twitter: { ...base.twitter, card: "summary_large_image", images },
    };
  }
  const tour = await getTour(tourId).catch(() => null);
  const area = tour && areaOf(tour);
  if (!tour || !area) return { title: "Itinerary Details", ...noindex };
  const { title } = cardView(tour);
  const stops = tour.destinations.length ? `: ${tour.destinations.join(", ")}` : "";
  return { ...publicMetadata(title, `Private ${area.name} itinerary with your own driver${stops}.`, `/tours/${tourId}`), ...noindex };
}

function TourPrice({ tour }: { tour: Tour }) {
  const { regular, sale, currency } = tour.pricing;
  const current = sale ?? regular;
  const discounted = sale !== null && regular !== null && sale < regular;
  return <div className="tour-pricing">
    {discounted && <del>{money(regular, currency)}</del>}
    <p><strong>{current === null ? "Contact for price" : money(current, currency)}</strong>{current !== null && !currency && <span className="currency-missing">Currency not specified</span>}{tour.duration && <span className="tour-duration">/ {tour.duration}</span>}</p>
  </div>;
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;
  const { page, tourId } = resolve(slug);
  let tour: Tour;
  try { tour = await getTour(tourId); }
  catch (error) { if (error instanceof WordPressApiError && error.status === 404) notFound(); return <ServiceUnavailable subject="tour" retryHref={`/tours/${slug}`} />; }
  const area = areaOf(tour);
  // A tour moved to another area in WordPress no longer matches its written page.
  if (!area || (page && tour.area?.slug !== page.area)) notFound();

  const { title, image, notes } = cardView(tour);
  const heading = page?.heading ?? title;
  const reviewsRequest = getTourReviews(tour.id, 1).catch(() => null);
  const terms = tour.booking_terms ?? await getBookingTerms().catch(() => null);
  const reviews = await reviewsRequest;
  const termGroups = terms ? ([["Included", terms.included], ["Not included", terms.not_included]] as const).filter(([, items]) => items.length) : [];
  const [lead, ...overview] = page?.intro ?? [`A private ${area.name} itinerary with your own driver.`];
  const flexibleOrder = <p className="area-guide-note">The order of the stops is flexible and agreed with our team when you reconfirm on WhatsApp.</p>;

  const site = (serverEnv("PUBLIC_SITE_URL") || serverEnv("APP_URL") || "http://127.0.0.1:3000").replace(/\/$/, "");
  const price = tour.pricing.sale ?? tour.pricing.regular;
  const jsonLd = page && {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: page.heading,
    description: page.metaDescription,
    url: `${site}/tours/${slug}`,
    image: image?.url ?? `${site}${area.image}`,
    itinerary: { "@type": "ItemList", itemListElement: page.itinerary.map((stop, i) => ({ "@type": "ListItem", position: i + 1, name: stop.title, description: stop.text })) },
    provider: { "@type": "Organization", name: "Shalom Bali Tour", url: site },
    ...(price !== null && tour.pricing.currency ? { offers: { "@type": "Offer", price, priceCurrency: tour.pricing.currency, url: `${site}/book/${tour.id}` } } : {}),
  };

  return <>
    {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
    <section className="ubud-hero tour-detail-hero" aria-labelledby="tour-detail-title">
      <Image src={image?.url ?? area.image} alt={image?.alt || area.alt} fill preload fetchPriority="high" quality={60} sizes="100vw" />
      <div className="ubud-hero-copy">
        <p className="section-label">{page ? title : area.name}</p>
        <h1 id="tour-detail-title">{heading}</h1><p>{lead}</p>
      </div>
    </section>
    <section className="tour-detail-booking" aria-label="Price and booking"><div className="tour-detail-booking-inner">
      <ReviewScore rating={tour.rating} />
      <TourPrice tour={tour} />
      {notes.map(note => <p key={note} className="price-note">{note}</p>)}
      <div className="tour-actions"><BookingButton tourId={tour.id} title={title} /><a className="button button-outline" href="#tour-reviews">Reviews</a></div>
    </div></section>
    {page ? <>
      <section className="area-guide" aria-labelledby="tour-overview-title"><div className="information-inner">
        <p className="section-label">OVERVIEW</p><h2 id="tour-overview-title">Tour Overview</h2>
        {overview.map(text => <p key={text} className="tour-detail-text">{text}</p>)}
        <ul className="tour-detail-highlights">{page.highlights.map(item => <li key={item}>{item}</li>)}</ul>
      </div></section>
      <section className="how-section area-guide-steps" aria-labelledby="tour-itinerary-title"><div className="information-inner">
        <p className="section-label">ITINERARY</p><h2 id="tour-itinerary-title">How Your Day Flows</h2>
        <ol className="how-steps">{page.itinerary.map(stop => <li key={stop.title}>{stop.time && <p className="tour-detail-time"><time>{stop.time}</time></p>}<h3>{stop.title}</h3><p>{stop.text}</p></li>)}</ol>
        {flexibleOrder}
      </div></section>
    </> : tour.destinations.length > 0 && <section className="area-guide" aria-labelledby="tour-visit-title"><div className="information-inner">
      <p className="section-label">DESTINATIONS</p><h2 id="tour-visit-title">What You’ll Visit</h2>
      <ul className="tour-detail-highlights">{tour.destinations.map((stop, i) => <li key={`${i}-${stop}`}>{stop}</li>)}</ul>
      {flexibleOrder}
    </div></section>}
    <section className="area-guide" aria-labelledby="tour-terms-title"><div className="information-inner">
      <p className="section-label">WHAT’S INCLUDED</p><h2 id="tour-terms-title">What’s Included in This Tour</h2>
      {termGroups.length ? <div className="area-terms">{termGroups.map(([label, items]) => <div key={label} className="area-terms-group"><h3>{label}</h3><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div> : <p className="status-message">These details are temporarily unavailable. Please try again shortly.</p>}
    </div></section>
    {page && <section className="faq-section" aria-labelledby="tour-faq-title"><div className="information-inner">
      <p className="section-label">FAQ</p><h2 id="tour-faq-title">Questions About This Tour</h2>
      <div className="faq-list">{page.faq.map(item => <details key={item.question} name="tour-faq"><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
    </div></section>}
    <section className="area-guide area-more tour-detail-cta" aria-labelledby="tour-cta-title"><div className="information-inner">
      <h2 id="tour-cta-title">Book {heading}</h2>
      <TourPrice tour={tour} />
      <div className="tour-actions"><BookingButton tourId={tour.id} title={title} /><Link className="button button-outline" href={`/${tour.area!.slug}`}>More {area.name} Itineraries</Link></div>
    </div></section>
    <section id="tour-reviews" className="area-guide tour-detail-reviews" aria-labelledby="tour-reviews-title"><div className="information-inner">
      <p className="section-label">REVIEWS</p><h2 id="tour-reviews-title">Guest Reviews</h2>
      <TourReviews tourId={tour.id} initial={reviews} />
    </div></section>
  </>;
}
