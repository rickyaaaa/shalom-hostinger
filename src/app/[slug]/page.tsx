import { notFound, redirect } from "next/navigation";
import { referralAttributionPath } from "@/lib/referral";
import { resolveReferral } from "@/lib/referral-server";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

// Root-level referral link, e.g. /ricky. Next.js matches every explicit route (/login, /ubud, /book/…) first,
// so only otherwise-unknown single-segment paths reach here. WordPress decides: an enabled partner's slug
// continues to the attribution endpoint and then Home; anything else is the normal Not Found page.
// Nothing is stored on this request, and the browser can never create a partner or attribution by visiting a path.
// If WordPress cannot answer, the visitor still reaches Home, without attribution.
export default async function ReferralEntry({ params }: { params: Promise<{ slug: string }> }) {
  const referral = await resolveReferral((await params).slug.toLowerCase());
  if (referral === "inactive") notFound();
  redirect(referral === "unavailable" ? "/" : referralAttributionPath(referral.slug));
}
