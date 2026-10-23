import { z } from "zod";
import { accountSchema, customerConfigSchema, customerSchema, profileNameInput, changePasswordInput, forgotInput, loginInput, registerInput, resetInput, reviewInput, bookingInput, inquiryInput } from "@/lib/customer-types";
import { appOrigin, clearSession, CustomerError, customerMultipartRequest, customerRequest, readSession, writeSession } from "@/lib/customer-server";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie", "X-Content-Type-Options": "nosniff" };
const reply = (value: unknown, status = 200) => Response.json(value, {status, headers});
type Context = { params: Promise<{action:string}> };
// Operational trace only: never log request bodies, cookies, nonces or key material.
function logFailure(action: string, stage: string, status: number, error: unknown) {
  const name = error instanceof Error ? error.constructor.name : typeof error;
  const reason = (error instanceof Error ? error.message : "").replace(/[A-Za-z0-9+/_=%-]{20,}/g, run => /^[A-Z_]+$/.test(run) ? run : "[redacted]").slice(0, 160);
  console.error("[customer-bff]", JSON.stringify({action: /^[a-z-]{1,32}$/.test(action) ? action : "invalid", stage, status, error: name, reason}));
}

async function handle(request: Request, context: Context) {
  const {action} = await context.params;
  let stage = "request";
  try {
    if (request.method === "POST" && action === "profile") {
      if (request.headers.get("origin") !== appOrigin()) return reply({message:"This request could not be verified."},403);
      const session = await readSession();
      if (!session) return reply({message:"Please sign in to continue."},401);
      if (request.headers.get("content-type")?.startsWith("application/json")) {
        // Own-name update. WordPress resolves the owner from the session; no user ID is forwarded.
        const bodyText = await request.text();
        if (bodyText.length > 2000) return reply({message:"This form is too large."},413);
        const input = profileNameInput.safeParse(JSON.parse(bodyText));
        if (!input.success) return reply({message:"Please enter a full name between 2 and 100 characters."},400);
        const {value} = await customerRequest("profile", "POST", input.data, session);
        return reply(z.object({customer:customerSchema,message:z.string().optional()}).parse(value));
      }
      const contentLength = Number(request.headers.get("content-length") || 0);
      if (contentLength > 5 * 1024 * 1024) return reply({message:"Profile photos must be 5 MB or smaller."},413);
      const form = await request.formData();
      const file = form.get("avatar");
      if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return reply({message:"Please choose a JPEG, PNG or WebP image."},400);
      if (file.size > 5 * 1024 * 1024) return reply({message:"Profile photos must be 5 MB or smaller."},413);
      const value = await customerMultipartRequest("profile", form, session);
      return reply(z.object({avatar_url:z.url().nullable().optional(),message:z.string().optional()}).parse(value));
    }
    if (request.method === "DELETE" && action === "profile") {
      if (request.headers.get("origin") !== appOrigin()) return reply({message:"This request could not be verified."},403);
      const session = await readSession();
      if (!session) return reply({message:"Please sign in to continue."},401);
      const {value} = await customerRequest("profile", "POST", {remove_avatar:true}, session);
      return reply(z.object({avatar_url:z.url().nullable().optional(),message:z.string().optional()}).parse(value));
    }
    if (request.method === "GET") {
      if (action === "config") return reply(customerConfigSchema.parse((await customerRequest("config", "GET")).value));
      if (action !== "me") return reply({message:"Not found."},404);
      const session = await readSession();
      if (!session) return reply({message:"Please sign in."},401);
      const inquiryPage = z.coerce.number().int().min(1).max(9999).parse(new URL(request.url).searchParams.get("inquiry_page") ?? 1);
      const {value} = await customerRequest("me", "GET", undefined, session, {inquiry_page:String(inquiryPage)});
      const nonce = z.string().min(1).max(100).parse(value.nonce);
      await writeSession({...session, nonce});
      return reply(accountSchema.parse(value));
    }
    if (request.headers.get("origin") !== appOrigin() || !request.headers.get("content-type")?.startsWith("application/json")) return reply({message:"This request could not be verified."},403);
    const bodyText = await request.text();
    if (bodyText.length > 16000) return reply({message:"This form is too large."},413);
    const body: unknown = JSON.parse(bodyText);
    if (action === "forgot-password") {
      const {value} = await customerRequest(action,"POST",forgotInput.parse(body));
      return reply(z.object({message:z.string()}).parse(value));
    }
    if (action === "reset-password") {
      const {value} = await customerRequest(action,"POST",resetInput.parse(body));
      return reply(z.object({reset:z.literal(true),message:z.string()}).parse(value));
    }
    if (action === "login" || action === "register") {
      const input = (action === "login" ? loginInput : registerInput).parse(body);
      stage = "upstream";
      const {value, response} = await customerRequest(action, "POST", input);
      stage = "contract";
      const result = z.object({signed_in:z.boolean(), nonce:z.string().optional(), account_created:z.boolean().optional()}).parse(value);
      if (result.signed_in) {
        stage = "set-cookie";
        const cookie = response.headers.getSetCookie().map(line => line.split(";")[0]).find(line => /^wordpress_logged_in_[a-f0-9]+=/.test(line));
        if (!cookie || !result.nonce) throw new CustomerError(502, "Your session could not be started. Please sign in again.");
        stage = "session-write";
        await writeSession({cookie, nonce:result.nonce, expires:Date.now() + 12 * 60 * 60 * 1000});
      } else await clearSession();
      return reply({signed_in:result.signed_in, account_created:!!result.account_created});
    }
    if (action === "change-password") {
      const session = await readSession();
      if (!session) return reply({message:"Please sign in to continue."},401);
      const input = changePasswordInput.parse(body);
      stage = "upstream";
      const {value, response} = await customerRequest(action, "POST", input, session);
      stage = "contract";
      const result = z.object({changed:z.literal(true), signed_in:z.boolean(), nonce:z.string().min(1).max(100).optional(), message:z.string()}).parse(value);
      // WordPress clears the old cookie, then re-issues it; the last non-empty one is the live session.
      const cookie = response.headers.getSetCookie().map(line => line.split(";")[0]).filter(line => /^wordpress_logged_in_[a-f0-9]+=[^+\s]/.test(line)).at(-1);
      stage = "session-write";
      const signedIn = result.signed_in && !!cookie && !!result.nonce;
      if (signedIn) await writeSession({...session, cookie: cookie!, nonce: result.nonce!}); else await clearSession();
      return reply({changed:true, signed_in:signedIn, message:result.message});
    }
    if (!["logout","booking-ticket","inquiries","reviews"].includes(action)) return reply({message:"Not found."},404);
    const session = await readSession();
    if (!session) return reply({message:"Please sign in to continue."},401);
    if (action === "logout") {
      // Revoke the native WordPress session before discarding the local envelope.
      await customerRequest("logout", "POST", {}, session);
      await clearSession();
      return reply({signed_in:false});
    }
    const input = action === "reviews" ? reviewInput.parse(body) : action === "booking-ticket" ? bookingInput.parse(body) : inquiryInput.parse(body);
    const {value} = await customerRequest(action, "POST", input, session);
    if (action === "booking-ticket") return reply(z.object({ticket:z.string().regex(/^[a-zA-Z0-9]{48}$/)}).parse(value));
    if (action === "reviews") return reply(z.object({status:z.literal("pending"),message:z.string()}).parse(value),201);
    const result = z.object({whatsapp_url:z.url()}).parse(value);
    const url = new URL(result.whatsapp_url);
    if (url.origin !== "https://wa.me" || !/^\/[1-9][0-9]{6,14}$/.test(url.pathname) || url.username || url.password) throw new CustomerError(502,"The booking continuation could not be verified.");
    return reply(result);
  } catch (error) {
    if (error instanceof CustomerError) {
      if (error.status >= 500) logFailure(action, stage, error.status, error);
      if ([401,403].includes(error.status)) await clearSession();
      return reply({message:error.message},error.status === 404 ? 503 : error.status);
    }
    if (error instanceof z.ZodError || error instanceof SyntaxError) return reply({message:"Please check the form details and try again."},400);
    logFailure(action, stage, 503, error);
    return reply({message:"The customer service is unavailable. Please try again later."},503);
  }
}
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
