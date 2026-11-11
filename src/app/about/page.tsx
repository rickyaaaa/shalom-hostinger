import Image from "next/image";
import Link from "next/link";
import { GuestGallery } from "@/components/GuestGallery";
import { WhyChooseUs } from "@/components/HomeInformation";
import { Icon } from "@/components/Icon";
import { aboutGuestPhotos, guestPhotos } from "@/lib/guest-photos";
import { aboutStory } from "@/lib/marketing";
import { publicMetadata } from "@/lib/seo";
import { serverEnv } from "@/lib/server-env";
import { siteLinks } from "@/lib/site";

// The photo slider in "Why Choose" reads the itineraries from WordPress at request time, as on Home.
export const dynamic = "force-dynamic";
export const metadata = publicMetadata("About Us", "Since 2016, Shalom Bali Tour has helped travelers explore Bali through private transportation and flexible itineraries. Read our story and see our guests in Bali.", "/about");

/** Only facts the site already states: founded 2016, three tour areas, 10 hours with the driver. */
const aboutFacts = [["2016", "Serving Bali travelers since"], ["3", "Main tour areas"], ["10 Hours", "With your private driver"]] as const;

/**
 * About Us, laid out after the Monks template the site used before the headless move (client, 2026-11-11):
 * photo banner with breadcrumb, story beside a photo with key facts, Why Choose, then the guest photos where the
 * template shows its team, and a closing call to action.
 */
export default function AboutPage() {
  const links = siteLinks();
  const site = (serverEnv("PUBLIC_SITE_URL") || serverEnv("APP_URL") || "http://127.0.0.1:3000").replace(/\/$/, "");
  const hero = guestPhotos["group-watersport-boat-trip"];
  const story = guestPhotos["guests-bali-airport-driver"];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site}/` },
      { "@type": "ListItem", position: 2, name: "About Us", item: `${site}/about` },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
    <section className="about-hero" aria-labelledby="about-title">
      <Image src={hero.src} alt="" fill preload fetchPriority="high" quality={60} sizes="100vw" />
      <div className="about-hero-inner">
        <h1 id="about-title">About Us</h1>
        <nav aria-label="Breadcrumb" className="about-breadcrumb"><ol><li><Link href="/">Home</Link></li><li aria-hidden="true"><Icon name="arrow" /></li><li aria-current="page">About Us</li></ol></nav>
      </div>
    </section>
    <section className="about-story" aria-labelledby="about-story-title">
      <div className="about-story-inner">
        <div className="about-story-photo"><Image src={story.src} alt={story.alt} width={story.width} height={story.height} quality={60} sizes="(max-width: 767px) 100vw, 40vw" /></div>
        <div className="about-story-copy">
          <p className="section-label">ABOUT US</p>
          <h2 id="about-story-title">Bali Tour Service Since 2016</h2>
          {aboutStory.map(paragraph => <p key={paragraph} className="about-copy">{paragraph}</p>)}
          <div className="about-story-actions"><Link href="/#itineraries" className="button">Explore Itineraries</Link><Link href={links.customBooking} className="button button-outline">Customize Your Itinerary</Link></div>
          <dl className="about-stats">{aboutFacts.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>
      </div>
    </section>
    <WhyChooseUs />
    <section className="about-guests" aria-labelledby="about-guests-title">
      <div className="information-inner">
        <div className="about-guests-heading"><p className="section-label">OUR GUESTS</p><h2 id="about-guests-title">Moments with Our Guests</h2><p>Photos from days out in Bali with our guests and drivers.</p></div>
        <GuestGallery photos={aboutGuestPhotos} label="Photos of our guests in Bali" sizes="(max-width: 767px) 46vw, (max-width: 1024px) 30vw, 300px" />
      </div>
    </section>
    <section className="about-cta" aria-labelledby="about-cta-title">
      <div className="about-cta-inner">
        <div><p className="section-label">START PLANNING</p><h2 id="about-cta-title">Plan Your Private Bali Tour</h2><p>Choose one of our recommended itineraries or tell us the destinations you want to visit.</p></div>
        <div className="about-cta-actions"><Link href="/#itineraries" className="button button-gold">Explore Itineraries</Link><Link href="/#review" className="button button-white">Read Guest Reviews</Link></div>
      </div>
    </section>
  </>;
}
