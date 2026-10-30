import { NextResponse } from "next/server";
import { getAreaTours } from "@/lib/wordpress";
import { westBaliCardTitle } from "@/components/westBaliPresentation";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
// Public package options for the order forms: canonical Tour ID and the title shown on its card.
export async function GET(request: Request) {
  const area = new URL(request.url).searchParams.get("area") ?? "";
  if (!["south-kuta", "ubud", "west-bali", "nusa-penida-lembongan"].includes(area)) return NextResponse.json({ error: "Invalid area." }, { status: 400, headers });
  try {
    const tours = await getAreaTours(area);
    return NextResponse.json({ items: tours.map(tour => ({ id: tour.id, title: area === "west-bali" ? westBaliCardTitle(tour) : tour.title })) }, { headers });
  } catch {
    return NextResponse.json({ error: "Tour packages are temporarily unavailable." }, { status: 502, headers });
  }
}
