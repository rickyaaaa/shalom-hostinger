import { NextResponse } from "next/server";
import { appOrigin } from "@/lib/customer-server";
import { referralPath } from "@/lib/referral";

export const dynamic = "force-dynamic";

// Links shared before the root-level format (/ref/ricky) move permanently to /ricky, which validates the
// partner and records attribution exactly like a new link. The target is a same-site path built only from
// a validated slug, so this cannot redirect anywhere else.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const moved = NextResponse.redirect(new URL(referralPath((await params).slug), appOrigin()), 308);
  moved.headers.set("X-Robots-Tag", "noindex, nofollow");
  return moved;
}
