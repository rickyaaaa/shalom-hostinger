import test from "node:test";
import assert from "node:assert/strict";

test("every response carries the security headers, including HSTS and COOP", async () => {
  // next.config reads the WordPress origin at load time.
  process.env.WORDPRESS_SITE_URL ||= "https://cms.example.test";
  process.env.WORDPRESS_API_URL ||= "https://cms.example.test/wp-json/shalom/v1";
  const { default: config } = await import("../next.config");
  const rules = await config.headers!();
  const all = rules.find(rule => rule.source === "/:path*");
  assert.ok(all, "one rule covers every path");
  const headers = Object.fromEntries(all.headers.map(header => [header.key, header.value]));
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.equal(headers["Strict-Transport-Security"], "max-age=63072000; includeSubDomains; preload", "two years of HTTPS-only, subdomains included, eligible for the preload list");
  assert.equal(headers["Cross-Origin-Opener-Policy"], "same-origin");
  assert.equal(config.poweredByHeader, false, "no X-Powered-By: Next.js");
});

test("pages get a strict nonce-based CSP: no inline or third-party scripts, no plugins, no framing", async () => {
  const { NextRequest } = await import("next/server");
  const { proxy, contentSecurityPolicy } = await import("../src/proxy");
  const first = proxy(new NextRequest("https://shalombalitour.com/", { headers: { host: "shalombalitour.com" } })).headers.get("Content-Security-Policy")!;
  const second = proxy(new NextRequest("https://shalombalitour.com/", { headers: { host: "shalombalitour.com" } })).headers.get("Content-Security-Policy")!;
  const nonce = first.match(/'nonce-([A-Za-z0-9+/=]+)'/)?.[1];
  assert.ok(nonce && nonce.length >= 24, "a random nonce");
  assert.notEqual(first, second, "a fresh nonce per request");
  const prod = contentSecurityPolicy("abc", false);
  assert.match(prod, /script-src 'self' 'nonce-abc' 'strict-dynamic';/);
  assert.doesNotMatch(prod, /unsafe-eval|script-src[^;]*unsafe-inline/, "no eval or inline scripts in production");
  for (const directive of ["object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "upgrade-insecure-requests"]) assert.ok(prod.includes(directive), directive);
  assert.match(contentSecurityPolicy("abc", true), /'unsafe-eval'/, "development only: React debugging needs eval");
  assert.doesNotMatch(prod, /require-trusted-types-for/, "enforcing Trusted Types blocks React and Next.js hydration");
});
