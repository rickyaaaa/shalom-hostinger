import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appOrigin } from "@/lib/customer-server";
import { REFERRAL_COOKIE, isReferralToken } from "@/lib/referral";
import { resolveReferral } from "@/lib/referral-server";

export const dynamic = "force-dynamic";

// Attribution only, never a separate site: WordPress validates the slug again, a valid click is
// remembered in a first-party cookie, and every visitor continues to the normal Home page. Unknown,
// disabled or unreachable referrals change nothing. The destination is fixed, so there is no open redirect.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const home = NextResponse.redirect(new URL("/", appOrigin()), 303);
  home.headers.set("Cache-Control", "private, no-store");
  home.headers.set("X-Robots-Tag", "noindex, nofollow");
  const result = await resolveReferral((await params).slug.trim().toLowerCase());
  // The policy comes from WordPress: lifetime, and whether a newer valid click replaces an older one.
  const existing = (await cookies()).get(REFERRAL_COOKIE)?.value;
  if (typeof result === "object" && isReferralToken(result.token) && (result.replace_existing || !isReferralToken(existing))) {
    home.cookies.set(REFERRAL_COOKIE, result.token, { httpOnly: true, secure: appOrigin().startsWith("https:"), sameSite: "lax", path: "/", maxAge: result.expires_in });
  }
  return home;
}
