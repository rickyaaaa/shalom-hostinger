import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";

function request(url: string, host: string, forwardedHost?: string) {
  const headers = new Headers({ host });
  if (forwardedHost) headers.set("x-forwarded-host", forwardedHost);
  return new NextRequest(url, { headers });
}

test("www redirects permanently while preserving pathname and query", () => {
  const response = proxy(request("https://www.shalombalitour.com/register?ref=abc%20123&next=%2Faccount", "www.shalombalitour.com"));
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://shalombalitour.com/register?ref=abc%20123&next=%2Faccount");
});

test("non-www requests continue without a redirect", () => {
  const response = proxy(request("https://shalombalitour.com/account?tab=orders", "shalombalitour.com"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
});

test("canonicalization ignores forwarded-host headers", () => {
  const canonical = proxy(request("https://shalombalitour.com/account", "shalombalitour.com", "www.shalombalitour.com"));
  assert.equal(canonical.status, 200);

  const www = proxy(request("https://www.shalombalitour.com/account", "www.shalombalitour.com", "shalombalitour.com"));
  assert.equal(www.status, 308);
  assert.equal(www.headers.get("location"), "https://shalombalitour.com/account");
});

test("redirect target is fixed, preventing loops and open redirects", () => {
  const response = proxy(request("https://www.shalombalitour.com/path?return=https%3A%2F%2Fevil.example", "www.shalombalitour.com"));
  assert.equal(response.headers.get("location"), "https://shalombalitour.com/path?return=https%3A%2F%2Fevil.example");
  assert.equal(new URL(response.headers.get("location")!).hostname, "shalombalitour.com");
});
