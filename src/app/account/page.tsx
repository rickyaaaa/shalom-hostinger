import { CustomerAccount, type OrderPreselect } from "@/components/CustomerAccount";
import { parseIntent } from "@/lib/booking-intent";
import { getTour } from "@/lib/wordpress";
export const metadata = {title:"My Account",robots:{index:false,follow:false}};
export const dynamic = "force-dynamic";

// Only the canonical Tour ID is read from the URL; WordPress confirms it is a fixed itinerary in one of the three areas.
async function preselectFor(tourId: number, requested_travel_date?: string): Promise<OrderPreselect | null> {
  try {
    const tour = await getTour(tourId);
    const area = tour.area?.slug;
    return area && ["south-kuta", "ubud", "west-bali"].includes(area) ? { tour_id: tour.id, ...(requested_travel_date ? { requested_travel_date } : {}) } : null;
  } catch { return null; }
}

export default async function AccountPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const parsed = parseIntent(await searchParams);
  const intent = parsed?.kind === "tour" ? parsed : null;
  return <CustomerAccount intent={intent} preselect={intent ? await preselectFor(intent.tour_id, intent.requested_travel_date) : null} />;
}
