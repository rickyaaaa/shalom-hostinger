import { z } from "zod";

export const customerConfigSchema = z.object({
  registration_enabled: z.boolean(), terms_url: z.url(), privacy_url: z.url(),
  countries: z.record(z.string(), z.object({ name: z.string(), calling_code: z.string() })),
});
export const inquiryHistorySchema = z.object({
  items: z.array(z.object({id:z.number().int().positive(),title:z.string(),submitted_at:z.iso.datetime().nullable(),status:z.enum(["inquiry","confirmed","completed","cancelled","unavailable"])})),
  page:z.number().int().min(1).max(9999), has_more:z.boolean(),
});
export const accountSchema = z.object({
  inquiries: inquiryHistorySchema,
  customer: z.object({ id: z.number().int().positive().optional(), name: z.string(), country: z.string(), avatar_url: z.url().nullable().optional(), email: z.string().max(254).nullable().optional(), referral_enabled: z.boolean().optional() }),
  completed_tours: z.array(z.object({ id: z.number().int(), title: z.string(), can_review: z.boolean() })),
  // New WordPress adapters return one row per currently usable entitlement.
  // Optional keeps the frontend readable while staging is upgraded from the legacy DTO.
  review_entitlements: z.array(z.object({ id: z.union([z.string().min(1), z.number().int().positive()]), tour_id: z.number().int().positive(), title: z.string() })).optional(),
  reviews: z.array(z.object({ id: z.number().int().positive().optional(), tour_id: z.number().int(), title: z.string(), experience: z.string(), status: z.enum(["approved", "pending", "unavailable"]), submitted_at: z.string().optional(), ratings: z.object({driving_skill:z.number().int(),service:z.number().int(),car:z.number().int()}).optional(), price:z.string().optional(), recommend:z.boolean().optional() })),
});
export type CustomerConfig = z.infer<typeof customerConfigSchema>;
export type CustomerAccount = z.infer<typeof accountSchema>;

const text = z.string().max(4096);
// One identifier: a real email address or a phone number. `phone` remains accepted from pre-1.16 pages.
export const loginInput = z.object({ identifier: z.string().trim().min(1).max(254).optional(), phone: text.optional(), phone_region_hint: z.string().max(2), legacy_identifier: text.optional(), password: text.min(1) }).strict().refine(value => !!(value.identifier || value.phone || value.legacy_identifier));
const registrationFields = {full_name:z.string().min(1).max(100),password:z.string().min(8).max(128),confirm_password:z.string().min(8).max(128),terms:z.literal("1")};
export const registerInput = z.object({...registrationFields,phone:text.min(1),phone_region_hint:z.string().max(2),email:z.string().trim().toLowerCase().min(3).max(100),customer_type:z.enum(["new_customer","existing_customer"])}).strict();
export const forgotInput = z.union([z.object({email:z.string().trim().min(3).max(254)}).strict(),z.object({phone:text.min(1),phone_region_hint:z.string().max(2)}).strict()]);
// login/key come from the reset link fragment; WordPress validates the native key.
export const resetInput = z.object({login:z.string().min(1).max(60),key:z.string().regex(/^[A-Za-z0-9]{1,100}$/),password:z.string().min(8).max(128),confirm_password:z.string().min(8).max(128)}).strict();
export const reviewInput = z.object({ tour_id: z.number().int().positive().max(2147483647), entitlement_id: z.union([z.string().min(1).max(128), z.number().int().positive()]).optional(), driving_skill: z.string().regex(/^(?:[1-9]|10)$/), service: z.string().regex(/^(?:[1-9]|10)$/), car: z.string().regex(/^(?:[1-9]|10)$/), price: z.enum(["worth_it", "not_worth_it"]), recommend: z.enum(["yes", "no"]), experience: z.string().trim().min(1).max(1000) }).strict();
const requestedTravelDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();
// Pickup details are Tour-only; WordPress requires date, place and time together when either pickup field is sent.
const pickup = {pickup_place:z.string().trim().min(1).max(200).optional(),pickup_time:z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).optional()};
export const bookingInput = z.discriminatedUnion("kind", [z.object({kind:z.literal("tour"),tour_id:z.number().int().positive().max(2147483647),requested_travel_date:requestedTravelDate,...pickup}).strict(),z.object({kind:z.literal("custom"),tour_id:z.literal(0),requested_travel_date:requestedTravelDate}).strict()]);
export const inquiryInput = z.discriminatedUnion("kind", [z.object({kind:z.literal("tour"),tour_id:z.number().int().positive().max(2147483647),requested_travel_date:requestedTravelDate,...pickup,ticket:z.string().regex(/^[a-zA-Z0-9]{48}$/)}).strict(),z.object({kind:z.literal("custom"),tour_id:z.literal(0),requested_travel_date:requestedTravelDate,ticket:z.string().regex(/^[a-zA-Z0-9]{48}$/)}).strict()]);
