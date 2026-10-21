import { z } from "zod";
import { accountSchema, customerConfigSchema, forgotInput, loginInput, registerInput, reviewInput, bookingInput, inquiryInput } from "@/lib/customer-types";
import { appOrigin, clearSession, CustomerError, customerRequest, readSession, writeSession } from "@/lib/customer-server";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie", "X-Content-Type-Options": "nosniff" };
const reply = (value: unknown, status = 200) => Response.json(value, {status, headers});
type Context = { params: Promise<{action:string}> };

async function handle(request: Request, context: Context) {
  const {action} = await context.params;
  try {
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
    if (action === "login" || action === "register") {
      const input = (action === "login" ? loginInput : registerInput).parse(body);
      const {value, response} = await customerRequest(action, "POST", input);
      const result = z.object({signed_in:z.boolean(), nonce:z.string().optional(), account_created:z.boolean().optional()}).parse(value);
      if (result.signed_in) {
        const cookie = response.headers.getSetCookie().map(line => line.split(";")[0]).find(line => /^wordpress_logged_in_[a-f0-9]+=/.test(line));
        if (!cookie || !result.nonce) throw new CustomerError(502, "Your session could not be started. Please sign in again.");
        await writeSession({cookie, nonce:result.nonce, expires:Date.now() + 12 * 60 * 60 * 1000});
      } else await clearSession();
      return reply({signed_in:result.signed_in, account_created:!!result.account_created});
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
      if ([401,403].includes(error.status)) await clearSession();
      return reply({message:error.message},error.status === 404 ? 503 : error.status);
    }
    if (error instanceof z.ZodError || error instanceof SyntaxError) return reply({message:"Please check the form details and try again."},400);
    return reply({message:"The customer service is unavailable. Please try again later."},503);
  }
}
export const GET = handle;
export const POST = handle;
