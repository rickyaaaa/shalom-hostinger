import "server-only";
import { z } from "zod";
import { CustomerError, customerRequest } from "./customer-server";
import { isReferralSlug } from "./referral";

const resolved = z.object({ valid: z.literal(true), slug: z.string(), token: z.string(), expires_in: z.number().int().positive().max(366 * 86400), replace_existing: z.boolean() });
export type ResolvedReferral = z.infer<typeof resolved>;

/**
 * WordPress's answer for a public slug: an enabled partner's click token and policy; "inactive" when no
 * enabled partner owns it; "unavailable" when WordPress could not answer (unreachable or rate limited).
 */
export async function resolveReferral(slug: string): Promise<ResolvedReferral | "inactive" | "unavailable"> {
  if (!isReferralSlug(slug)) return "inactive";
  try { return resolved.parse((await customerRequest("referral", "POST", { slug })).value); }
  catch (error) { return error instanceof CustomerError && error.status === 404 ? "inactive" : "unavailable"; }
}
