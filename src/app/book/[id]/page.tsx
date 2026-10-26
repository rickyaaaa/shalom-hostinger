import { notFound, redirect } from "next/navigation";
import { getTour,WordPressApiError } from "@/lib/wordpress";
import { bookingPath } from "@/lib/booking-intent";
export const dynamic="force-dynamic";
export const metadata={title:"Order Your Bali Itinerary",robots:{index:false,follow:false}};
// No intermediate booking pages: old /book/<id> and /book/custom links open Order Your Bali Itinerary on
// My Account with the itinerary (or Customized Itinerary) already selected.
export default async function BookingPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const {id}=await params;
  const query=await searchParams;
  const requested_travel_date=typeof query.requested_travel_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(query.requested_travel_date) ? query.requested_travel_date : undefined;
  const date=requested_travel_date ? {requested_travel_date} : {};
  if(id==="custom")redirect(bookingPath({kind:"custom",tour_id:0,...date}));
  if(!/^[1-9]\d{0,9}$/.test(id))notFound();
  try{await getTour(Number(id));}catch(error){if(error instanceof WordPressApiError&&error.status===404)notFound();}
  redirect(bookingPath({kind:"tour",tour_id:Number(id),...date}));
}
