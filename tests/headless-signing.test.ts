import assert from "node:assert/strict";
import test from "node:test";
import { createHmac, randomBytes } from "node:crypto";
import { newClientToken, readClientToken, signedRequestHeaders } from "../src/lib/headless-signing";

test("rate identity is server-issued, authenticated, expiring and independent of forwarded headers", () => {
  process.env.SHALOM_HEADLESS_SIGNING_KEY = randomBytes(32).toString("hex");
  const now = 1_800_000_000;
  const token = newClientToken(now);
  assert.equal(readClientToken(token, now)?.length, 64);
  assert.equal(readClientToken(token, now + 86400), null);
  assert.equal(readClientToken("bad", now), null);
  const parts = token.split("."); parts[0] = "0".repeat(64);
  assert.equal(readClientToken(parts.join("."), now), null);
  process.env.SHALOM_HEADLESS_SIGNING_KEY = randomBytes(32).toString("hex");
  assert.equal(readClientToken(token, now), null);
});
test("signature binds exact bytes, audience, method, route, client, timestamp and nonce", () => {
  process.env.SHALOM_HEADLESS_SIGNING_KEY = randomBytes(32).toString("hex");
  const args = ["https://staging.example/wp-json/shalom/v1", "/shalom/v1/customer/login", '{"phone":"+628123456789"}', "b".repeat(64), 1_800_000_000, "c".repeat(32)] as const;
  const signed = signedRequestHeaders(...args);
  const differentBody = signedRequestHeaders(args[0], args[1], args[2] + " ", args[3], args[4], args[5]);
  assert.notEqual(signed["X-Shalom-Signature"], differentBody["X-Shalom-Signature"]);
  assert.notEqual(signed["X-Shalom-Signature"], signedRequestHeaders(args[0], "/shalom/v1/customer/register", args[2], args[3], args[4], args[5])["X-Shalom-Signature"]);
  assert.notEqual(signed["X-Shalom-Signature"], signedRequestHeaders("https://other.example/wp-json/shalom/v1", ...args.slice(1) as [string, string, string, number, string])["X-Shalom-Signature"]);
  assert.equal(signed["X-Shalom-Client"], args[3]);
  assert.equal(signed["X-Shalom-Time"], String(args[4]));
  assert.ok(!JSON.stringify(signed).includes(process.env.SHALOM_HEADLESS_SIGNING_KEY!));
  assert.throws(() => signedRequestHeaders(args[0], "../login", args[2], args[3]));
  const expected = createHmac("sha256", Buffer.from(process.env.SHALOM_HEADLESS_SIGNING_KEY!, "hex"));
  assert.ok(expected);
});
