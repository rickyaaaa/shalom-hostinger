import { AreaPage } from "@/components/AreaPage";
import { areas } from "@/lib/marketing";
import { publicMetadata } from "@/lib/seo";
export const dynamic="force-dynamic";
export const metadata=publicMetadata("West Bali Itineraries",areas["west-bali"].description,"/west-bali");
export default async function WestBaliPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=await searchParams;const date=typeof params.requested_travel_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.requested_travel_date) ? params.requested_travel_date : undefined;return <AreaPage area="west-bali" requestedTravelDate={date}/>;}
