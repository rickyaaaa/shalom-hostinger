import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { wordpressConfig } from "./config";
import { openSession, sealSession, type CustomerSession } from "./session-crypto";
import { newClientToken, readClientToken, signedRequestHeaders } from "./headless-signing";
import { serverEnv } from "./server-env";

export const SESSION_COOKIE = "shalom_customer";
export function appOrigin() {
  const url = new URL(process.env.APP_URL || "http://127.0.0.1:3000");
  const local = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash || (url.protocol !== "https:" && !(local && url.protocol === "http:"))) throw new Error("APP_URL must be an HTTPS origin, or local HTTP in development.");
  return url.origin;
}
export async function readSession() { return openSession((await cookies()).get(SESSION_COOKIE)?.value || ""); }
export async function writeSession(session: CustomerSession) {
  (await cookies()).set(SESSION_COOKIE, sealSession(session), { httpOnly: true, secure: appOrigin().startsWith("https:"), sameSite: "lax", path: "/", maxAge: Math.max(0, Math.floor((session.expires - Date.now()) / 1000)) });
}
export async function clearSession() { (await cookies()).delete(SESSION_COOKIE); }

export class CustomerError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function customerRequest(action: string, method: "GET" | "POST", data?: unknown, session?: CustomerSession | null, query?: Record<string,string>) {
  let response: Response;
  try {
    const url = new URL(`${wordpressConfig().api}/customer/${action}`);
    if (query) for (const [key,value] of Object.entries(query)) url.searchParams.set(key,value);
    // Private reads must never reuse an upstream REST-cache entry, even on hosts
    // which previously cached these URLs despite the response no-store policy.
    if (method === "GET") url.searchParams.set("_shalom_request", randomUUID());
    const body = method === "POST" ? JSON.stringify(data || {}) : undefined;
    let signatureHeaders: Record<string, string> = {};
    if (method === "POST" && serverEnv("HEADLESS_RATE_LIMIT_MODE") === "signed") {
      const jar = await cookies();
      let token = jar.get("shalom_rate_client")?.value || "";
      let client = readClientToken(token);
      if (!client) {
        token = newClientToken();
        client = readClientToken(token);
        jar.set("shalom_rate_client", token, { httpOnly: true, secure: appOrigin().startsWith("https:"), sameSite: "lax", path: "/", maxAge: 86400 });
      }
      if (!client) throw new Error("Could not establish a rate identity.");
      signatureHeaders = signedRequestHeaders(wordpressConfig().api, "/shalom/v1/customer/" + action, body!, client);
    }
    response = await fetch(url, {
      method, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { ...signatureHeaders, Accept: "application/json", "Cache-Control":"no-store, no-cache", Pragma:"no-cache", ...(method === "POST" ? { "Content-Type": "application/json" } : {}), ...(session ? { Cookie: session.cookie, "X-WP-Nonce": session.nonce } : {}) },
      ...(method === "POST" ? { body } : {}),
    });
  } catch { throw new CustomerError(503, "We could not reach Shalom. Please try again."); }
  let value;
  try { value = await response.json(); } catch { throw new CustomerError(502, "Shalom returned an unreadable response. Please try again."); }
  if (!response.ok) {
    const messages: Record<string, string> = {
      login: "We could not sign you in. Check your sign-in details or contact Shalom Bali Tour.",
      phone: "Please check your phone number, or sign in with your existing account.",
      email: "Please check your email address, or sign in with your existing account.",
      reset_key: "This password reset link is invalid or has expired. Please request a new link.",
      password: "Use at least 8 characters, up to 128 bytes, for your password.",
      confirmation: "The passwords do not match.",
      // Signed-in profile and password changes (WordPress 1.18/1.19).
      name: "Please enter a full name between 2 and 100 characters.",
      current_password: "Your current password is incorrect.",
      new_password_mismatch: "The new passwords do not match.",
      password_reuse: "Choose a new password that is different from your current password.",
      duplicate: "You have already reviewed this Tour.", ineligible: "This Tour is not eligible for a review on your account.",
      ticket: "Your booking request has expired. Return to Tours and select Book Now again.",
      travel_date: "Please choose a tour date from today onwards.",
      pickup_place: "Please enter your pickup place or hotel (up to 200 characters).",
      pickup_time: "Please choose your pickup time.",
      disabled: "Online registration is currently unavailable. Please contact Shalom Bali Tour.",
      rate_limit: "Too many attempts. Please wait a little while and try again.",
      rest_no_route: "The customer service is awaiting its WordPress adapter update. Please try again later.",
    };
    throw new CustomerError(response.status, messages[value?.code] || ([401,403].includes(response.status) ? "Your session has expired. Please sign in again." : "Please check the form details and try again."));
  }
  return { value, response };
}

export async function customerMultipartRequest(action: string, form: FormData, session: CustomerSession) {
  let response: Response;
  try {
    const url = new URL(`${wordpressConfig().api}/customer/${action}`);
    response = await fetch(url, { method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000), headers: { Accept: "application/json", "Cache-Control": "no-store", Pragma: "no-cache", Cookie: session.cookie, "X-WP-Nonce": session.nonce }, body: form });
  } catch { throw new CustomerError(503, "We could not reach Shalom. Please try again."); }
  let value: any;
  try { value = await response.json(); } catch { throw new CustomerError(502, "Shalom returned an unreadable response. Please try again."); }
  if (!response.ok) throw new CustomerError(response.status, typeof value?.message === "string" ? value.message : "We could not update your profile.");
  if (typeof value?.nonce === "string" && value.nonce) await writeSession({ ...session, nonce: value.nonce });
  return value;
}
