// Node-only protocol primitives. Imported by the server adapter, never a client component.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { serverEnv } from "./server-env";

export function signingKey() {
  const value = serverEnv("SHALOM_HEADLESS_SIGNING_KEY");
  if (!/^[a-f0-9]{64}$/i.test(value) || new Set(value.toLowerCase()).size < 4) throw new Error("Configure a private random headless signing key.");
  return Buffer.from(value, "hex");
}
function mac(value: string) { return createHmac("sha256", signingKey()).update(value).digest("hex"); }
function matches(a: string, b: string) {
  return /^[a-f0-9]{64}$/.test(a) && /^[a-f0-9]{64}$/.test(b) && timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}
export function newClientToken(now = Math.floor(Date.now() / 1000)) {
  const payload = `${randomBytes(32).toString("hex")}.${now + 86400}`;
  return `${payload}.${mac("shalom-rate-client-v1\n" + payload)}`;
}
export function readClientToken(token: string, now = Math.floor(Date.now() / 1000)): string | null {
  if (token.length > 160) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || !/^[a-f0-9]{64}$/.test(parts[0]) || !/^\d{10}$/.test(parts[1])) return null;
  const expires = Number(parts[1]);
  if (expires <= now || expires > now + 86400) return null;
  return matches(parts[2], mac(`shalom-rate-client-v1\n${parts[0]}.${parts[1]}`)) ? parts[0] : null;
}
export function signedRequestHeaders(audience: string, route: string, body: string, client: string, now = Math.floor(Date.now() / 1000), nonce = randomBytes(16).toString("hex")) {
  if (!/^[a-f0-9]{64}$/.test(client) || !/^[a-f0-9]{32}$/.test(nonce) || !/^\/shalom\/v1\/customer\/[a-z-]+$/.test(route)) throw new Error("Invalid internal signing input.");
  const digest = createHash("sha256").update(body).digest("hex");
  const message = ["shalom-headless-v1", "POST", audience.replace(/\/$/, ""), route, String(now), nonce, client, digest].join("\n");
  return { "X-Shalom-Time": String(now), "X-Shalom-Nonce": nonce, "X-Shalom-Client": client, "X-Shalom-Signature": mac(message) };
}
