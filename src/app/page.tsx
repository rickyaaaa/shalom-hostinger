import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getLatestReviews } from "@/lib/wordpress";
import { siteLinks } from "@/lib/site";
import { ReviewEntry } from "@/components/ReviewEntry";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";
import { Icon } from "@/components/Icon";
import { WhyChooseUs, FAQ, AboutSection } from "@/components/HomeInformation";
import { publicMetadata } from "@/lib/seo";
import { BookingSearch } from "@/components/BookingSearch";

export const dynamic = "force-dynamic";
export const metadata = publicMetadata("Private Bali Tours", "Explore Bali your way. Choose a flexible private tour in South Kuta, Ubud or West Bali, or customize your own itinerary with Shalom Bali Tour.", "/");

// Only the reviews wait for WordPress, so the hero and area images ship in the first HTML chunk.
async function LatestReviews() {
  const latest = await getLatestReviews().catch(() => null);
  if (!latest) return <ServiceUnavailable subject="reviews" />;
  if (latest.reviews.length === 0) return <p className="status-message">No guest reviews yet.</p>;
  return <div className="latest-reviews-grid">{latest.reviews.map((review, index) => <ReviewEntry key={`${review.published_at}-${index}`} review={review} showTour />)}</div>;
}

export default function HomePage() {
  const links = siteLinks();
  const areas = [
    { title: "South Kuta", image: "/images/south-kuta.webp", href: links.southKuta, text: '"Chased by the waves of Uluwatu, warmed by the sands of Jimbaran, and enchanted by the magic of South Kuta."' },
    { title: "Ubud", image: "/images/ubud.webp", href: "/ubud", text: "Meets the quiet rhythm of nature, every smile is a blessing, and every moment is art, that’s the magic of Ubud." },
    { title: "West Bali", image: "/images/west-bali.jpeg", href: links.westBali, text: "West Bali remains a sanctuary of forgotten time, nature speaks in a softer language, Absolute magic in West Bali." },
  ];
  return <>
    <section className="home-itineraries" aria-labelledby="home-title">
      <div className="home-intro"><h1 id="home-title">Explore Bali Your Way</h1><p>Choose your preferred Bali experience from South Kuta, Ubud, or West Bali. Every itinerary is flexible and can be adjusted to match your travel plans.</p></div>
      <BookingSearch />
      <div className="area-grid">{areas.map((area, index) => <Link key={area.title} className="area-panel" href={area.href}>
        <Image src={area.image} alt="" fill quality={60} {...(index === 0 ? { preload: true, fetchPriority: "high" } : { fetchPriority: "low" })} sizes={index === 0 ? "(max-width: 767px) 100vw, 48vw" : "(max-width: 767px) 100vw, 24vw"} />
        <div className="area-panel-copy"><h2>{area.title}</h2><p>{area.text}</p></div>
      </Link>)}</div>
    </section>
    <section className="customized-section" id="customizedtour" aria-labelledby="custom-title">
      <div className="customized-inner"><div className="customized-copy"><h2 id="custom-title">Can&apos;t Find Your Perfect Itinerary?</h2>
        <ul>{["Choose Your Destinations", "Flexible Itinerary", "Private Driver"].map(item => <li key={item}><Icon name="check" />{item}</li>)}</ul>
        <p className="custom-note">NB: For special itinerary requests, there will be a price calculation, depending on the location and destination, so you will be directly connected to customer service for the price.</p>
        <a href={links.customBooking} className="button button-white">Customized Tour</a>
      </div><Image src="/images/custom-itinerary.webp" alt="Choosing your own itinerary" width={640} height={498} sizes="(max-width: 767px) 80vw, 320px" /></div>
    </section>
    <section className="home-reviews" id="review" aria-labelledby="home-reviews-title">
      <div className="home-reviews-heading"><p className="section-label">GUEST EXPERIENCES</p><h2 id="home-reviews-title">What Our Guests Say</h2><p>Real experiences from travelers who explored Bali with Shalom Bali Tour.</p></div>
      <Suspense fallback={<p className="status-message reviews-loading" role="status">Loading guest reviews…</p>}><LatestReviews /></Suspense>
    </section>
    <WhyChooseUs/>
    <FAQ/>
    <AboutSection/>
  </>;
}
