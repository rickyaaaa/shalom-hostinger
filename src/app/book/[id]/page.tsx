import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/CustomerAccount";
import { getTour,WordPressApiError } from "@/lib/wordpress";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";
export const dynamic="force-dynamic";
export const metadata={title:"Book Your Bali Tour",robots:{index:false,follow:false}};
export default async function BookingPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const {id}=await params;
  const query=await searchParams;
  const requested_travel_date=typeof query.requested_travel_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(query.requested_travel_date) ? query.requested_travel_date : undefined;
  if(id==="custom")return <BookingFlow title="Your Customized Tour" intent={{kind:"custom",tour_id:0,requested_travel_date}} backHref={requested_travel_date ? `/?requested_travel_date=${requested_travel_date}#customizedtour` : "/#customizedtour"}/>;
  if(!/^[1-9]\d{0,9}$/.test(id))notFound();
  try{const tour=await getTour(Number(id));return <BookingFlow title={tour.title} intent={{kind:"tour",tour_id:tour.id,requested_travel_date}} backHref={tour.area&&["ubud","south-kuta","west-bali"].includes(tour.area.slug)?`/${tour.area.slug}${requested_travel_date ? `?requested_travel_date=${requested_travel_date}#tour-packages` : ""}`:"/"}/>;}
  catch(error){if(error instanceof WordPressApiError&&error.status===404)notFound();return <ServiceUnavailable subject="tour" retryHref={`/book/${id}`}/>;}
}
