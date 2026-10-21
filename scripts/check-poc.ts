import assert from "node:assert/strict";

const base = process.env.SHALOM_POC_URL ?? "http://127.0.0.1:3000";
const origin = new URL(base);
if (!["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)) throw new Error("This development check is restricted to a local Next.js instance.");
const checks: { path: string; status: number; pass: boolean }[] = [];
for (const [path, expected] of [["/", 200], ["/ubud", 200], ["/api/tours/566/reviews", 400], ["/api/tours/523/reviews?page=-1", 400], ["/book/566", 404], ["/book/523", 200], ["/login?tour=523", 200], ["/register?tour=523", 200], ["/account", 200], ["/api/customer/me", 401], ["/api/customer/unknown",404]] as const) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, expected, path);
  assert.equal(response.headers.get("location"),null,"Customer routes must remain in Next.js");
  checks.push({ path, status: response.status, pass: true });
}
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), base, checks }, null, 2));
