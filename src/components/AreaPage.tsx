import Image from "next/image";
import { areas, type AreaSlug } from "@/lib/marketing";
import { getAreaTours } from "@/lib/wordpress";
import { TourCard } from "./TourCard";
import { ServiceUnavailable } from "./ServiceUnavailable";
import { WestBaliNotice, westBaliCardPresentation } from "./WestBaliNotice";
import westBaliStyles from "./WestBali.module.css";

export async function AreaPage({area, requestedTravelDate}:{area:AreaSlug; requestedTravelDate?: string}) {
  const content=areas[area];
  const tours=await getAreaTours(area).catch(()=>null);
  const isWestBali=area==="west-bali";
  const body=<>
    <section className={isWestBali ? `ubud-hero ${westBaliStyles.hero}` : "ubud-hero"} aria-labelledby="area-title">
      <Image src={content.image} alt={content.alt} fill priority sizes="100vw"/>
      <div className="ubud-hero-copy">
        {!isWestBali && <p className="section-label">{content.label}</p>}
        <h1 id="area-title">{content.heading}</h1><p>{content.description}</p>
      </div>
    </section>
    {isWestBali && <WestBaliNotice/>}
    <section id="tour-packages" className={isWestBali ? `tour-section ${westBaliStyles.tours}` : "tour-section"} aria-label={`${content.name} tour packages`}>
      {tours===null ? <ServiceUnavailable subject="tour" retryHref={`/${area}`}/> : tours.length ?
        <div className="tour-grid">{tours.map(tour=><TourCard tour={tour} key={tour.id} requestedTravelDate={requestedTravelDate} presentation={isWestBali ? westBaliCardPresentation(tour) : undefined}/>)}</div> :
        <p className="status-message">Tour packages are being updated. Please contact Shalom Bali Tour.</p>}
    </section>
  </>;
  return isWestBali ? <div className={westBaliStyles.page}>{body}</div> : body;
}
