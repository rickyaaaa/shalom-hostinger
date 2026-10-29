import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookingTerms, getTour, WordPressApiError } from "@/lib/wordpress";
import { itineraryTitle, money } from "@/lib/format";
import { areas } from "@/lib/marketing";
import { publicMetadata } from "@/lib/seo";
import { serverEnv } from "@/lib/server-env";
import { tourPageBySlug } from "@/lib/tour-pages";
import type { Tour } from "@/lib/types";
import { BookingButton } from "@/components/BookingButton";
import { ReviewModal } from "@/components/ReviewModal";
import { ReviewScore } from "@/components/ReviewScore";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

// Metadata comes from the code only (no WordPress request); the layout template adds "| Shalom Bali Tour".
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = tourPageBySlug(slug);
  if (!page) notFound();
  const area = areas[page.area];
  const base = publicMetadata(page.title, page.metaDescription, `/tours/${slug}`);
  const images = [{ url: area.image, alt: area.alt }];
  return {
    ...base,
    ...(page.indexable ? {} : { robots: { index: false, follow: false } }),
    openGraph: { ...base.openGraph, images },
    twitter: { ...base.twitter, card: "summary_large_image", images },
  };
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
  const page = tourPageBySlug(slug);
  if (!page) notFound();
  let tour: Tour;
  try { tour = await getTour(page.tourId); }
  catch (error) { if (error instanceof WordPressApiError && error.status === 404) notFound(); return <ServiceUnavailable subject="tour" retryHref={`/tours/${slug}`} />; }
  // A tour moved to another area in WordPress no longer matches this page's copy.
  if (tour.area?.slug !== page.area) notFound();

  const area = areas[page.area];
  const title = itineraryTitle(tour.title);
  const terms = tour.booking_terms ?? await getBookingTerms().catch(() => null);
  const termGroups = terms ? ([["Included", terms.included], ["Not included", terms.not_included]] as const).filter(([, items]) => items.length) : [];
  const [lead, ...overview] = page.intro;

  const site = (serverEnv("PUBLIC_SITE_URL") || serverEnv("APP_URL") || "http://127.0.0.1:3000").replace(/\/$/, "");
  const price = tour.pricing.sale ?? tour.pricing.regular;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: page.heading,
    description: page.metaDescription,
    url: `${site}/tours/${slug}`,
    image: tour.card_image?.url ?? `${site}${area.image}`,
    itinerary: { "@type": "ItemList", itemListElement: page.itinerary.map((stop, i) => ({ "@type": "ListItem", position: i + 1, name: stop.title, description: stop.text })) },
    provider: { "@type": "Organization", name: "Shalom Bali Tour", url: site },
    ...(price !== null && tour.pricing.currency ? { offers: { "@type": "Offer", price, priceCurrency: tour.pricing.currency, url: `${site}/book/${tour.id}` } } : {}),
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <section className="ubud-hero tour-detail-hero" aria-labelledby="tour-detail-title">
      <Image src={tour.card_image?.url ?? area.image} alt={tour.card_image?.alt || area.alt} fill preload fetchPriority="high" quality={60} sizes="100vw" />
      <div className="ubud-hero-copy">
        <p className="section-label">{title}</p>
        <h1 id="tour-detail-title">{page.heading}</h1><p>{lead}</p>
      </div>
    </section>
    <section className="tour-detail-booking" aria-label="Price and booking"><div className="tour-detail-booking-inner">
      <ReviewScore rating={tour.rating} />
      <TourPrice tour={tour} />
      {tour.price_note && <p className="price-note">{tour.price_note}</p>}
      <div className="tour-actions"><BookingButton tourId={tour.id} title={title} /><ReviewModal tourId={tour.id} title={title} /></div>
    </div></section>
    <section className="area-guide" aria-labelledby="tour-overview-title"><div className="information-inner">
      <p className="section-label">OVERVIEW</p><h2 id="tour-overview-title">Tour Overview</h2>
      {overview.map(text => <p key={text} className="tour-detail-text">{text}</p>)}
      <ul className="tour-detail-highlights">{page.highlights.map(item => <li key={item}>{item}</li>)}</ul>
    </div></section>
    <section className="how-section area-guide-steps" aria-labelledby="tour-itinerary-title"><div className="information-inner">
      <p className="section-label">ITINERARY</p><h2 id="tour-itinerary-title">How Your Day Flows</h2>
      <ol className="how-steps">{page.itinerary.map(stop => <li key={stop.title}>{stop.time && <p className="tour-detail-time"><time>{stop.time}</time></p>}<h3>{stop.title}</h3><p>{stop.text}</p></li>)}</ol>
      <p className="area-guide-note">The order of the stops is flexible and agreed with our team when you reconfirm on WhatsApp.</p>
    </div></section>
    <section className="area-guide" aria-labelledby="tour-terms-title"><div className="information-inner">
      <p className="section-label">WHAT’S INCLUDED</p><h2 id="tour-terms-title">What’s Included in This Tour</h2>
      {termGroups.length ? <div className="area-terms">{termGroups.map(([label, items]) => <div key={label} className="area-terms-group"><h3>{label}</h3><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div> : <p className="status-message">These details are temporarily unavailable. Please try again shortly.</p>}
    </div></section>
    <section className="faq-section" aria-labelledby="tour-faq-title"><div className="information-inner">
      <p className="section-label">FAQ</p><h2 id="tour-faq-title">Questions About This Tour</h2>
      <div className="faq-list">{page.faq.map(item => <details key={item.question} name="tour-faq"><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
    </div></section>
    <section className="area-guide area-more tour-detail-cta" aria-labelledby="tour-cta-title"><div className="information-inner">
      <h2 id="tour-cta-title">Book {page.heading}</h2>
      <TourPrice tour={tour} />
      <div className="tour-actions"><BookingButton tourId={tour.id} title={title} /><Link className="button button-outline" href={`/${page.area}`}>More {area.name} Itineraries</Link></div>
    </div></section>
  </>;
}
