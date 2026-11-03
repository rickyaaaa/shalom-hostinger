import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { TRAVEL_DATE_NOTE } from "@/lib/booking-date";
import { publicMetadata } from "@/lib/seo";
import { serverEnv } from "@/lib/server-env";
import { carCapacity } from "@/lib/marketing";
import { siteLinks } from "@/lib/site";
import { getBookingTerms } from "@/lib/wordpress";
import { Icon } from "@/components/Icon";
import { RecentGuides } from "@/components/RecentGuides";

export const dynamic = "force-dynamic";
// The "hire a driver in Bali" searches (about 1,900 a month in Australia): the same 10-hour private day as every tour,
// sold as driver hire. Facts only from the approved tour terms and Home FAQ; prices stay on the itineraries.
export const metadata = publicMetadata("Hire a Driver in Bali for the Day", "Hire a private driver in Bali for a 10-hour day: your own car and driver, hotel pickup, fuel and parking included. Pick an itinerary or plan your own route.", "/bali-driver-hire");

const facts = ["A private car and driver for your group only", "10 hours from your agreed pickup time", "Fuel and parking included", `One car for ${carCapacity}`, "Pickup at your hotel or pickup place", "A ready itinerary or a route you plan yourself"];
const areaLinks = [
  { title: "Ubud", text: "Rice terraces, Tirta Empul, the Monkey Forest, waterfalls, art and family parks.", href: "/ubud" },
  { title: "Uluwatu & South Kuta", text: "Uluwatu Temple, south coast beaches, watersports, ATV rides and Jimbaran sunset dinners.", href: "/south-kuta" },
  { title: "West Bali & North Bali", text: "Ulun Danu Beratan, Jatiluwih rice terraces, Taman Ayun and Tanah Lot.", href: "/west-bali" },
];
const steps = [
  { title: "Choose your day", text: "Pick one of our itineraries, or plan your own route with a customized itinerary." },
  { title: "Sign in or create an account", text: "If you are not signed in yet, log in or create an account to continue your order." },
  { title: "Enter your travel details", text: "Choose your travel date and pickup time, and tell us your hotel or pickup place." },
  { title: "Submit and reconfirm on WhatsApp", text: "Send your order, then reconfirm the plan and pickup details with our team on WhatsApp." },
];
const faq = [
  { question: "How long can I hire a driver for?", answer: "Our driver hire is a full day of 10 hours, counted from your agreed pickup time. If the day goes over 10 hours, an extra charge applies, as listed in the terms on this page." },
  { question: "Is the car shared with other travellers?", answer: "No. The car and driver are for you and your group only, so you set the pace and nobody else joins." },
  { question: "Can I choose where we go?", answer: "Yes. Choose one of our itineraries, or plan your own route with a customized itinerary. The order of the stops is agreed with our team when you reconfirm on WhatsApp." },
  { question: "How many people fit in the car?", answer: `One car takes ${carCapacity}. If your group is bigger, contact our team on WhatsApp before you order.` },
  { question: "Where will the driver pick me up?", answer: "At your hotel or the pickup place you give when you order, for example in Seminyak, Kuta, Jimbaran, Nusa Dua or Ubud." },
  { question: "How much does it cost to hire a driver?", answer: "Each itinerary shows its price on its card and tour page before you order. For a route you plan yourself, our team confirms the details with you on WhatsApp." },
  { question: "What is not included?", answer: "Entrance tickets, activities and lunch are paid separately. The included and not included list on this page shows the full terms." },
];

/** Included / not included exactly as WordPress words them (the same list as the area pages and the Home FAQ). */
async function DriverTerms() {
  const terms = await getBookingTerms().catch(() => null);
  if (!terms) return <p className="status-message">These details are temporarily unavailable. Please try again shortly.</p>;
  const groups = ([["Included", terms.included], ["Not included", terms.not_included]] as const).filter(([, items]) => items.length);
  return <div className="area-terms">{groups.map(([label, items]) => <div key={label} className="area-terms-group"><h3>{label}</h3><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div>;
}

export default function DriverHirePage() {
  const links = siteLinks();
  const site = (serverEnv("PUBLIC_SITE_URL") || serverEnv("APP_URL") || "http://127.0.0.1:3000").replace(/\/$/, "");
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Private driver hire in Bali",
    serviceType: "Private car and driver hire",
    description: "A private car and driver for 10 hours, with hotel pickup and fuel and parking included, on a ready itinerary or your own route.",
    url: `${site}/bali-driver-hire`,
    areaServed: { "@type": "Place", name: "Bali, Indonesia" },
    provider: { "@type": "TravelAgency", name: "Shalom Bali Tour", url: `${site}/` },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, { name: "Hire a Driver in Bali", path: "/bali-driver-hire" }].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, name: crumb.name, item: `${site}${crumb.path}` })),
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
    <section className="ubud-hero" aria-labelledby="driver-hire-title">
      <Image src="/images/west-bali.jpeg" alt="A Balinese temple beside the water" fill preload fetchPriority="high" quality={60} sizes="100vw" />
      <div className="ubud-hero-copy">
        <p className="section-label">PRIVATE DRIVER HIRE</p>
        <h1 id="driver-hire-title">Hire a Private Driver in Bali</h1>
        <p>Your own car and driver for 10 hours, with pickup at your hotel and fuel and parking included. Follow one of our itineraries or tell us the places you want to see.</p>
        <div className="driver-hire-actions"><Link href="/#itineraries" className="button button-gold">Choose an Itinerary</Link><Link href={links.customBooking} className="button button-white">Plan Your Own Route</Link></div>
      </div>
    </section>

    <section className="driver-section driver-hire-intro" aria-labelledby="driver-hire-what-title"><div className="information-inner driver-grid">
      <div>
        <p className="section-label">WHAT YOU GET</p>
        <h2 id="driver-hire-what-title">What You Get When You Hire a Driver with Shalom</h2>
        <p className="driver-copy">Hiring a driver for the day is the easiest way to see Bali’s temples, rice terraces and beaches without taxis, ride-hailing apps or tour buses. The car waits while you visit each place, and your driver takes you on to the next stop and back to your hotel at the end of the day.</p>
        <p className="driver-copy">Every Shalom day is private: only you and your group travel in the car, and the day runs for 10 hours from the pickup time you choose when you order.</p>
      </div>
      <ul className="driver-facts">{facts.map(item => <li key={item}><Icon name="check" />{item}</li>)}</ul>
    </div></section>

    <section className="area-guide" aria-labelledby="driver-hire-terms-title"><div className="information-inner">
      <p className="section-label">WHAT’S INCLUDED</p><h2 id="driver-hire-terms-title">Included and Not Included</h2>
      <p className="area-guide-intro">These are the terms for our private 10-hour days, the same list shown on every itinerary.</p>
      <Suspense fallback={<p className="status-message" role="status">Loading terms…</p>}><DriverTerms /></Suspense>
    </div></section>

    <section className="area-guide area-more" aria-labelledby="driver-hire-ways-title"><div className="information-inner">
      <p className="section-label">TWO WAYS TO BOOK</p><h2 id="driver-hire-ways-title">Two Ways to Hire Your Driver</h2>
      <ul className="area-more-list driver-hire-ways">
        <li><Link href="/#itineraries"><h3>Choose a ready itinerary</h3><p>Pick one of our private day tours in Ubud, Uluwatu & South Kuta or West Bali & North Bali. Each one shows its price, stops and what is included before you order.</p><span className="area-panel-cta" aria-hidden="true">See the itineraries<Icon name="arrow" /></span></Link></li>
        <li><Link href={links.customBooking}><h3>Plan your own route</h3><p>Tell us the places you would like to visit and our team helps arrange the route and confirms the details with you on WhatsApp.</p><span className="area-panel-cta" aria-hidden="true">Customize your itinerary<Icon name="arrow" /></span></Link></li>
      </ul>
    </div></section>

    <section className="area-guide driver-hire-areas" aria-labelledby="driver-hire-areas-title"><div className="information-inner">
      <p className="section-label">WHERE TO GO</p><h2 id="driver-hire-areas-title">Where Can Your Driver Take You?</h2>
      <ul className="area-more-list">{areaLinks.map(item => <li key={item.href}><Link href={item.href}><h3>{item.title}</h3><p>{item.text}</p><span className="area-panel-cta" aria-hidden="true">Explore<Icon name="arrow" /></span></Link></li>)}</ul>
      <p className="area-guide-note">Planning several days? Our <Link href="/blog/bali-itinerary">7-day Bali itinerary</Link> shows how to split the island into one area per day.</p>
    </div></section>

    <section className="how-section area-guide-steps" aria-labelledby="driver-hire-steps-title"><div className="information-inner">
      <p className="section-label">HOW IT WORKS</p><h2 id="driver-hire-steps-title">How to Hire Your Driver</h2>
      <ol className="how-steps how-steps-four">{steps.map((step, i) => <li key={step.title}><h3>{step.title}</h3><p>{step.text}{i === 2 && <> {TRAVEL_DATE_NOTE}</>}</p></li>)}</ol>
    </div></section>

    <section className="area-guide" aria-labelledby="driver-hire-faq-title"><div className="information-inner">
      <p className="section-label">FAQ</p><h2 id="driver-hire-faq-title">Questions About Hiring a Driver in Bali</h2>
      <div className="faq-list">{faq.map(item => <details key={item.question} name="driver-hire-faq"><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
    </div></section>
    <RecentGuides />
  </>;
}
