import { AreaPage } from "@/components/AreaPage";
import { notFound } from "next/navigation";
import { areaGuides, islandPackagesLive } from "@/lib/marketing";
import { privateRobots, publicMetadata } from "@/lib/seo";
export const dynamic="force-dynamic";
// The layout template adds "| Shalom Bali Tour".
// Hidden while islandPackagesLive is false: 404 and never indexed.
export const metadata=!islandPackagesLive?{robots:privateRobots}:publicMetadata(areaGuides["nusa-penida-lembongan"]!.title,areaGuides["nusa-penida-lembongan"]!.metaDescription,"/nusa-penida-lembongan");
export default async function IslandDayTripsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){if(!islandPackagesLive)notFound();const params=await searchParams;const date=typeof params.requested_travel_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.requested_travel_date) ? params.requested_travel_date : undefined;return <AreaPage area="nusa-penida-lembongan" requestedTravelDate={date}/>;}
