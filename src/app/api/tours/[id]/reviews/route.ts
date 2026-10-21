import { NextResponse } from "next/server";
import { getTourReviews } from "@/lib/wordpress";

export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const raw = new URL(request.url).searchParams.get("page") ?? "1";
  if (!/^[1-9]\d{0,9}$/.test(id) || !/^[1-9]\d{0,4}$/.test(raw) || Number(raw) > 10000) return NextResponse.json({ error: "Invalid review request." }, { status: 400 });
  try {
    const data = await getTourReviews(Number(id), Number(raw));
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Reviews are temporarily unavailable." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
