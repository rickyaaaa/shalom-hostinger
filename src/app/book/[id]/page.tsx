import { notFound } from "next/navigation";
import { getTour,WordPressApiError } from "@/lib/wordpress";
import { itineraryTitle } from "@/lib/format";
import { westBaliCardTitle } from "@/components/westBaliPresentation";
import { BookingPage } from "@/components/BookingPage";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";
import { areas } from "@/lib/marketing";
export const dynamic="force-dynamic";
export const metadata={title:"Order Your Bali Itinerary",robots:{index:false,follow:false}};
// The booking form itself: /book/<id> for one fixed itinerary, /book/custom for a Customized Itinerary request.
// The itinerary comes only from this route and WordPress; the form shows it read-only.
export default async function BookingRoute({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const {id}=await params;
  const query=await searchParams;
  const requested_travel_date=typeof query.requested_travel_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(query.requested_travel_date) ? query.requested_travel_date : undefined;
  const date=requested_travel_date ? {requested_travel_date} : {};
  if(id==="custom")return <BookingPage selection={{kind:"custom"}} intent={{kind:"custom",tour_id:0,...date}}/>;
  if(!/^[1-9]\d{0,9}$/.test(id))notFound();
  let tour;
  try{tour=await getTour(Number(id));}
  catch(error){if(error instanceof WordPressApiError&&error.status===404)notFound();return <ServiceUnavailable subject="tour" retryHref={`/book/${id}`}/>;}
  // Only the three fixed areas are bookable here; their display names come from the site, not the term label.
  const slug=tour.area?.slug;
  if(!slug||!Object.hasOwn(areas,slug))notFound();
  const area={slug,name:areas[slug as keyof typeof areas].name};
  // Same name the customer clicked on the card (West Bali cards use the client-approved titles).
  const title=itineraryTitle(slug==="west-bali"?westBaliCardTitle(tour):tour.title);
  return <BookingPage selection={{kind:"tour",tourId:tour.id,title,area}} intent={{kind:"tour",tour_id:tour.id,...date}}/>;
}
