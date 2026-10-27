import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { areaGuides, areas, type AreaGuide, type AreaSlug } from "@/lib/marketing";
import { TRAVEL_DATE_NOTE } from "@/lib/booking-date";
import { getAreaTours, getBookingTerms } from "@/lib/wordpress";
import { TourCard } from "./TourCard";
import { ServiceUnavailable } from "./ServiceUnavailable";
import { Icon } from "./Icon";
import { westBaliCardPresentation } from "./westBaliPresentation";
import westBaliStyles from "./WestBali.module.css";

// Only the package list waits for WordPress, so the hero image ships in the first HTML chunk.
async function AreaTours({area, requestedTravelDate, cardHeading}:{area:AreaSlug; requestedTravelDate?: string; cardHeading?: "h2"|"h3"}) {
  const tours=await getAreaTours(area).catch(()=>null);
  const isWestBali=area==="west-bali";
  return tours===null ? <ServiceUnavailable subject="tour" retryHref={`/${area}`}/> : tours.length ?
    <div className="tour-grid">{tours.map(tour=><TourCard tour={tour} key={tour.id} requestedTravelDate={requestedTravelDate} heading={cardHeading} presentation={isWestBali ? westBaliCardPresentation(tour) : undefined}/>)}</div> :
    <p className="status-message">Itineraries are being updated. Please contact Shalom Bali Tour.</p>;
}

/** Included / not included exactly as WordPress words them: the same list as the Home FAQ and the WhatsApp NB. */
async function AreaTerms() {
  const terms=await getBookingTerms().catch(()=>null);
  if(!terms)return <p className="status-message">These details are temporarily unavailable. Please try again shortly.</p>;
  const groups=([["Included",terms.included],["Not included",terms.not_included]] as const).filter(([,items])=>items.length);
  return <div className="area-terms">{groups.map(([label,items])=><div key={label} className="area-terms-group"><h3>{label}</h3><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></div>)}</div>;
}

/** The approved SEO sections below an area's itineraries: terms, how ordering works, and the other tour areas. */
function AreaGuideSections({guide}:{guide:AreaGuide}) {
  return <>
    <section className="area-guide" aria-labelledby="area-terms-title"><div className="information-inner">
      <p className="section-label">WHAT’S INCLUDED</p><h2 id="area-terms-title">{guide.termsHeading}</h2>
      <p className="area-guide-intro">{guide.termsIntro}</p>
      <Suspense fallback={<p className="status-message" role="status">Loading tour terms…</p>}><AreaTerms/></Suspense>
    </div></section>
    <section className="how-section area-guide-steps" aria-labelledby="area-steps-title"><div className="information-inner">
      <p className="section-label">HOW IT WORKS</p><h2 id="area-steps-title">{guide.stepsHeading}</h2>
      <ol className="how-steps how-steps-four">{guide.steps.map((step,i)=><li key={step.title}><h3>{step.title}</h3><p>{step.text}{i===2 && <> {TRAVEL_DATE_NOTE}</>}</p></li>)}</ol>
      <p className="area-guide-note">{guide.stepsNote}</p>
      <a href="#tour-packages" className="button area-guide-cta">{guide.stepsCta}</a>
    </div></section>
    <section className="area-guide area-more" aria-labelledby="area-more-title"><div className="information-inner">
      <p className="section-label">MORE BALI TOURS</p><h2 id="area-more-title">{guide.moreHeading}</h2>
      <ul className="area-more-list">{guide.more.map(item=><li key={item.href}><Link href={item.href}><h3>{item.title}</h3><p>{item.text}</p><span className="area-panel-cta" aria-hidden="true">Explore<Icon name="arrow"/></span></Link></li>)}</ul>
    </div></section>
  </>;
}

export function AreaPage({area, requestedTravelDate}:{area:AreaSlug; requestedTravelDate?: string}) {
  const content=areas[area];
  const guide=areaGuides[area];
  const isWestBali=area==="west-bali";
  const body=<>
    <section className={isWestBali ? `ubud-hero ${westBaliStyles.hero}` : "ubud-hero"} aria-labelledby="area-title">
      <Image src={content.image} alt={content.alt} fill preload fetchPriority="high" quality={60} sizes="100vw"/>
      <div className="ubud-hero-copy">
        {!isWestBali && <p className="section-label">{content.label}</p>}
        <h1 id="area-title">{content.heading}</h1><p>{content.description}</p>
        {guide && <a href="#tour-packages" className="button button-gold area-hero-cta">{guide.heroCta}</a>}
      </div>
    </section>
    <section id="tour-packages" className={isWestBali ? `tour-section ${westBaliStyles.tours}` : "tour-section"} {...(guide ? {"aria-labelledby":"area-tours-title"} : {"aria-label":`${content.name} itineraries`})}>
      {guide && <div className="area-tours-intro"><h2 id="area-tours-title">{guide.toursHeading}</h2><p>{guide.toursIntro}</p></div>}
      <Suspense fallback={<p className="status-message reviews-loading" role="status">Loading itineraries…</p>}><AreaTours area={area} requestedTravelDate={requestedTravelDate} cardHeading={guide ? "h3" : "h2"}/></Suspense>
    </section>
    {guide && <AreaGuideSections guide={guide}/>}
  </>;
  return isWestBali ? <div className={westBaliStyles.page}>{body}</div> : body;
}
