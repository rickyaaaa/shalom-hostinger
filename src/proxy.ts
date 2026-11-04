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

/**
 * Strict CSP: only scripts carrying this request's nonce run (Next.js adds it to its own tags), and scripts they load
 * are trusted through 'strict-dynamic'. Every page is dynamically rendered, so each response gets a fresh nonce.
 * Development adds what React's debugging and hot reload need. Trusted Types ("require-trusted-types-for") is left
 * out on purpose: React and Next.js assign innerHTML and script URLs while hydrating, so enforcing it breaks every page.
 */
export function contentSecurityPolicy(nonce: string, dev = process.env.NODE_ENV === "development") {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // React style={} attributes and the inlined stylesheet need inline styles; styles cannot run code.
    "style-src 'self' 'unsafe-inline'",
    // Photos come through /_next/image; avatars may come straight from WordPress or Gravatar.
    `img-src 'self' data: blob: https:${dev ? " http:" : ""}`,
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  // Use the direct Host header only. Never trust x-forwarded-host for canonicalization.
  if (directHostname(request) === WWW_HOST) {
    const target = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, CANONICAL_ORIGIN);
    return NextResponse.redirect(target, 308);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce);
  // Next.js reads the nonce from the request's CSP header while rendering.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: "/:path*",
};
