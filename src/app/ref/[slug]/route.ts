import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { appOrigin, customerRequest } from "@/lib/customer-server";
import { REFERRAL_COOKIE, isReferralSlug, isReferralToken } from "@/lib/referral";

export const dynamic = "force-dynamic";
const resolved = z.object({ valid: z.literal(true), slug: z.string(), token: z.string(), expires_in: z.number().int().positive().max(366 * 86400), replace_existing: z.boolean() });

// Attribution entry point only, never a separate site: WordPress validates the slug, a valid click is
// remembered in a first-party cookie, and every visitor continues to the normal Home page. Unknown,
// disabled or unreachable referrals change nothing. The destination is fixed, so there is no open redirect.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug.trim().toLowerCase();
  const home = NextResponse.redirect(new URL("/", appOrigin()), 303);
  home.headers.set("Cache-Control", "private, no-store");
  home.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (!isReferralSlug(slug)) return home;
  try {
    const result = resolved.parse((await customerRequest("referral", "POST", { slug })).value);
    // The policy comes from WordPress: lifetime, and whether a newer valid click replaces an older one.
    const existing = (await cookies()).get(REFERRAL_COOKIE)?.value;
    if (isReferralToken(result.token) && (result.replace_existing || !isReferralToken(existing))) {
      home.cookies.set(REFERRAL_COOKIE, result.token, { httpOnly: true, secure: appOrigin().startsWith("https:"), sameSite: "lax", path: "/", maxAge: result.expires_in });
    }
  } catch {
    // No attribution; the visitor still lands on Home.
  }
  return home;
}
