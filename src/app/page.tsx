import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getLatestReviews } from "@/lib/wordpress";
import { siteLinks } from "@/lib/site";
import { ReviewEntry } from "@/components/ReviewEntry";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";
import { Icon } from "@/components/Icon";
import { CustomGallery } from "@/components/CustomGallery";
import { WhyChooseUs, HowItWorks, DriverSection, FAQ, AboutSection } from "@/components/HomeInformation";
import { publicMetadata } from "@/lib/seo";
import { serverEnv } from "@/lib/server-env";
import { tiktokProfile } from "@/lib/marketing";

export const dynamic = "force-dynamic";
// The layout's "%s | Shalom Bali Tour" template does not apply to the root page, so the brand is part of the title here.
export const metadata = publicMetadata("Bali Private Tour & Private Driver | Shalom Bali Tour", "Hire a Bali private driver for a 10-hour private tour. Choose from Ubud, Uluwatu & South Kuta and West Bali & North Bali itineraries, or customize your own.", "/");

// Only the reviews wait for WordPress, so the hero and area images ship in the first HTML chunk.
async function LatestReviews() {
  const latest = await getLatestReviews().catch(() => null);
  if (!latest) return <ServiceUnavailable subject="reviews" />;
  if (latest.reviews.length === 0) return <p className="status-message">No guest reviews yet.</p>;
  return <div className="latest-reviews-grid">{latest.reviews.map((review, index) => <ReviewEntry key={`${review.published_at}-${index}`} review={review} showTour />)}</div>;
}

export default function HomePage() {
  const links = siteLinks();
  const site = (serverEnv("PUBLIC_SITE_URL") || serverEnv("APP_URL") || "http://127.0.0.1:3000").replace(/\/$/, "");
  // The business behind the site, for search engines and AI answers; only facts the page itself states.
  const agencyLd = { "@context": "https://schema.org", "@type": "TravelAgency", name: "Shalom Bali Tour", url: `${site}/`, logo: `${site}/images/shalom-logo.webp`, image: `${site}/images/west-bali.jpeg`, description: "Bali private tours with your own private driver for 10 hours, with Ubud, Uluwatu & South Kuta and West Bali & North Bali itineraries or a customized route.", foundingDate: "2016", areaServed: { "@type": "Place", name: "Bali, Indonesia" }, sameAs: [tiktokProfile] };
  const areas = [
    { title: "South Kuta & Uluwatu", image: "/images/south-kuta.webp", href: links.southKuta, cta: "Explore Uluwatu Tours", text: "Explore the southern coast of Bali with routes featuring Uluwatu, beautiful beaches, cultural attractions, and sunset experiences around Jimbaran." },
    { title: "Ubud", image: "/images/ubud.webp", href: "/ubud", cta: "Explore Ubud Tours", text: "Discover Bali's cultural and natural side through Ubud's temples, waterfalls, rice terraces, traditional villages, and surrounding countryside." },
    { title: "West Bali & North Bali", image: "/images/west-bali.jpeg", href: links.westBali, cta: "Explore West Bali & North Bali Tours", text: "Travel beyond Bali's busiest areas and explore temples, rice terraces, mountain scenery, and cultural destinations across West Bali & North Bali." },
  ];
  // The hero photograph is the LCP element, so it alone is preloaded; the area panels below load at low priority.
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(agencyLd).replace(/</g, "\\u003c") }} />
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-media"><Image src="/images/west-bali.jpeg" alt="" fill preload fetchPriority="high" quality={60} sizes="100vw" /></div>
      <div className="home-hero-inner"><div className="home-hero-content">
        <p className="home-hero-eyebrow">SHALOM BALI TOUR</p>
        <h1 id="home-title">Private Bali Tour with Driver</h1>
        <p className="home-hero-copy">Explore Bali your way with a private driver and a flexible itinerary designed around your travel plans. Choose one of our recommended Bali itineraries or create your own route for a comfortable 10-hour private journey.</p>
        <div className="home-hero-actions"><a href="#itineraries" className="home-hero-primary">Explore Itineraries</a><a href="#customizedtour" className="home-hero-secondary">Customize Your Itinerary<Icon name="arrow" /></a></div>
        <ul className="home-hero-highlights">{["Private Driver", "10-Hour Tour", "Fuel & Parking Included", "Flexible Itinerary"].map(item => <li key={item}><Icon name="check" />{item}</li>)}</ul>
      </div></div>
    </section>
    <section className="home-itineraries" id="itineraries" aria-labelledby="itineraries-title">
      <div className="home-intro"><p className="section-label">CHOOSE YOUR ITINERARY</p><h2 id="itineraries-title">Explore Our Bali Private Tour Itineraries</h2>
        <p>Discover Bali through carefully planned private day tours covering temples, beaches, rice terraces, waterfalls, local culture, and scenic destinations.</p>
        <p>Choose the itinerary that matches your travel style. Every journey includes a private driver and can be adjusted to make your day in Bali more comfortable.</p></div>
      <div className="area-grid">{areas.map((area, index) => <Link key={area.title} className="area-panel" href={area.href}>
        <Image src={area.image} alt="" fill quality={60} fetchPriority="low" sizes={index === 0 ? "(max-width: 767px) 100vw, 48vw" : "(max-width: 767px) 100vw, 24vw"} />
        <div className="area-panel-copy"><h3>{area.title}</h3><p>{area.text}</p><span className="area-panel-cta">{area.cta}<Icon name="arrow" /></span></div>
      </Link>)}</div>
    </section>
    <WhyChooseUs/>
    <section className="customized-section" id="customizedtour" aria-labelledby="custom-title">
      <div className="customized-inner"><div className="customized-copy"><h2 id="custom-title">Can&apos;t Find the Bali Tour You Want?</h2>
        <p className="customized-lead">Create a <strong>custom Bali tour</strong> based on the destinations you want to visit.</p>
        <p className="customized-lead">Choose your preferred places and tell us your travel plans. We will help arrange a suitable route and calculate the price based on the locations and destinations selected.</p>
        <ul>{["Choose Your Destinations", "Flexible Itinerary", "Private Driver"].map(item => <li key={item}><Icon name="check" />{item}</li>)}</ul>
        <p className="custom-note">Note: Special itinerary requests require a separate price calculation depending on the selected locations and destinations.</p>
        <a href={links.customBooking} className="button button-gold">Customize Your Itinerary</a>
      </div><CustomGallery /></div>
    </section>
    <HowItWorks/>
    <DriverSection/>
    <section className="home-reviews" id="review" aria-labelledby="home-reviews-title">
      <div className="home-reviews-heading"><p className="section-label">GUEST EXPERIENCES</p><h2 id="home-reviews-title">What Our Guests Say</h2><p>Read experiences from travelers who have explored Bali with Shalom Bali Tour.</p></div>
      <Suspense fallback={<p className="status-message reviews-loading" role="status">Loading guest reviews…</p>}><LatestReviews /></Suspense>
    </section>
    <FAQ/>
    <AboutSection/>
  </>;
}
