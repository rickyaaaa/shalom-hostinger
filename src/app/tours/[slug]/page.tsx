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

  const highlights = page?.highlights ?? tour.destinations;
  const areaPath = `/${tour.area!.slug}`;
  const crumbs = [{ name: "Home", path: "/" }, { name: area.name, path: areaPath }, { name: title, path: `/tours/${slug}` }];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, name: crumb.name, item: `${site}${crumb.path}` })),
  };

  return <>
    {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
    {/* Every tour in an area shares that area page's hero photo. */}
    <div className="tour-detail-banner">
      <Image src={area.image} alt={area.alt} fill preload fetchPriority="high" quality={60} sizes="100vw" />
    </div>
    <div className="tour-detail-layout">
      <header className="tour-detail-header">
        <nav className="tour-breadcrumbs" aria-label="Breadcrumb"><ol>
          {crumbs.slice(0, -1).map(crumb => <li key={crumb.path}><Link href={crumb.path}>{crumb.name}</Link></li>)}
          <li aria-current="page">{title}</li>
        </ol></nav>
        <h1 id="tour-detail-title">{heading}</h1>
        <p className="tour-detail-text">{lead}</p>
      </header>
      <aside className="tour-detail-info" aria-labelledby="tour-info-title">
        <h2 id="tour-info-title">Travel Information</h2>
        <a className="tour-detail-rating" href="#tour-reviews"><ReviewScore rating={tour.rating} /></a>
        <TourPrice tour={tour} />
        <dl className="tour-detail-facts">
          <div><dt>Area</dt><dd>{area.name}</dd></div>
          {tour.duration && <div><dt>Duration</dt><dd>{tour.duration}</dd></div>}
          <div><dt>Pickup Time</dt><dd>Your choice</dd></div>
          <div><dt>Type</dt><dd>Private, with driver</dd></div>
        </dl>
        {notes.map(note => <p key={note} className="price-note">{note}</p>)}
        <div className="tour-detail-info-actions"><BookingButton tourId={tour.id} title={title} /></div>
        <Link className="tour-detail-more" href={areaPath}>More {area.name} Itineraries</Link>
      </aside>
      <div className="tour-detail-body">
        {highlights.length > 0 && <section aria-labelledby="tour-highlights-title">
          <h2 id="tour-highlights-title">Destination Highlights</h2>
          <ul className="tour-detail-highlights">{highlights.map((item, i) => <li key={`${i}-${item}`}>{item}</li>)}</ul>
          {!page && flexibleOrder}
        </section>}
        <section aria-labelledby="tour-terms-title">
          <h2 id="tour-terms-title">Included Facilities</h2>
          {termGroups.length ? termGroups.map(([label, items]) => <div key={label} className="tour-detail-terms"><h3>{label}</h3><ul className="tour-detail-highlights">{items.map(item => <li key={item}>{item}</li>)}</ul></div>) : <p className="status-message">These details are temporarily unavailable. Please try again shortly.</p>}
        </section>
        {page && <>
          {overview.length > 0 && <section aria-labelledby="tour-why-title">
            <h2 id="tour-why-title">Why This Tour?</h2>
            {overview.map(text => <p key={text} className="tour-detail-text">{text}</p>)}
          </section>}
          <section aria-labelledby="tour-itinerary-title">
            <h2 id="tour-itinerary-title">How Your Day Flows</h2>
            <ol className="how-steps">{page.itinerary.map(stop => <li key={stop.title}>{stop.time && <p className="tour-detail-time"><time>{stop.time}</time></p>}<h3>{stop.title}</h3><p>{stop.text}</p></li>)}</ol>
            {flexibleOrder}
          </section>
          <section aria-labelledby="tour-faq-title">
            <h2 id="tour-faq-title">Frequently Asked Questions</h2>
            <div className="faq-list">{page.faq.map(item => <details key={item.question} name="tour-faq"><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
          </section>
        </>}
      </div>
    </div>
    <section id="tour-reviews" className="area-guide tour-detail-reviews" aria-labelledby="tour-reviews-title"><div className="information-inner">
      <p className="section-label">REVIEWS</p><h2 id="tour-reviews-title">Guest Reviews</h2>
      <TourReviews tourId={tour.id} initial={reviews} />
    </div></section>
  </>;
}
