import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_ORIGIN = "https://shalombalitour.com";
const WWW_HOST = "www.shalombalitour.com";

function directHostname(request: NextRequest) {
  const host = request.headers.get("host");
  if (!host) return "";
  try {
    return new URL(`http://${host}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function proxy(request: NextRequest) {
  // Use the direct Host header only. Never trust x-forwarded-host for canonicalization.
  if (directHostname(request) !== WWW_HOST) return NextResponse.next();

  const target = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, CANONICAL_ORIGIN);
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: "/:path*",
};
