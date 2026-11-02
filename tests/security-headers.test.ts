import test from "node:test";
import assert from "node:assert/strict";

test("every response carries the security headers, including HSTS without includeSubDomains", async () => {
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
  assert.equal(headers["Strict-Transport-Security"], "max-age=31536000", "a year of HTTPS-only; subdomains such as cms and mail keep their own policy");
  assert.equal(config.poweredByHeader, false, "no X-Powered-By: Next.js");
});
