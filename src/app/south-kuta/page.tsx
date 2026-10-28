import { AreaPage } from "@/components/AreaPage";
import { areaGuides } from "@/lib/marketing";
import { publicMetadata } from "@/lib/seo";
export const dynamic="force-dynamic";
// The layout template adds "| Shalom Bali Tour".
export const metadata=publicMetadata(areaGuides["south-kuta"]!.title,areaGuides["south-kuta"]!.metaDescription,"/south-kuta");
export default async function SouthKutaPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=await searchParams;const date=typeof params.requested_travel_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.requested_travel_date) ? params.requested_travel_date : undefined;return <AreaPage area="south-kuta" requestedTravelDate={date}/>;}
