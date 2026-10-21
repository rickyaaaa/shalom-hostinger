import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/CustomerAccount";
import { getTour,WordPressApiError } from "@/lib/wordpress";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";
export const dynamic="force-dynamic";
export const metadata={title:"Book Your Bali Tour",robots:{index:false,follow:false}};
export default async function BookingPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(id==="custom")return <BookingFlow title="Your Customized Tour" intent={{kind:"custom",tour_id:0}} backHref="/#customizedtour"/>;
  if(!/^[1-9]\d{0,9}$/.test(id))notFound();
  try{const tour=await getTour(Number(id));return <BookingFlow title={tour.title} intent={{kind:"tour",tour_id:tour.id}} backHref={tour.area&&["ubud","south-kuta","west-bali"].includes(tour.area.slug)?`/${tour.area.slug}`:"/"}/>;}
  catch(error){if(error instanceof WordPressApiError&&error.status===404)notFound();return <ServiceUnavailable subject="tour" retryHref={`/book/${id}`}/>;}
}
