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
  customer: z.object({ id: z.number().int().positive().optional(), name: z.string(), country: z.string() }),
  completed_tours: z.array(z.object({ id: z.number().int(), title: z.string(), can_review: z.boolean() })),
  reviews: z.array(z.object({ id: z.number().int().positive().optional(), tour_id: z.number().int(), title: z.string(), experience: z.string(), status: z.enum(["approved", "pending", "unavailable"]), submitted_at: z.string().optional(), ratings: z.object({driving_skill:z.number().int(),service:z.number().int(),car:z.number().int()}).optional(), price:z.string().optional(), recommend:z.boolean().optional() })),
});
export type CustomerConfig = z.infer<typeof customerConfigSchema>;
export type CustomerAccount = z.infer<typeof accountSchema>;

const text = z.string().max(4096);
export const loginInput = z.object({ phone: text, phone_region_hint: z.string().max(2), legacy_identifier: text.optional(), password: text.min(1) }).strict();
const registrationFields = {full_name:z.string().min(1).max(100),password:z.string().min(8).max(128),confirm_password:z.string().min(8).max(128),terms:z.literal("1")};
export const registerInput = z.object({...registrationFields,phone:text.min(1),phone_region_hint:z.string().max(2),customer_type:z.enum(["new_customer","existing_customer"])}).strict();
export const forgotInput = z.object({phone:text.min(1),phone_region_hint:z.string().max(2)}).strict();
export const reviewInput = z.object({ tour_id: z.number().int().positive().max(2147483647), driving_skill: z.string().regex(/^(?:[1-9]|10)$/), service: z.string().regex(/^(?:[1-9]|10)$/), car: z.string().regex(/^(?:[1-9]|10)$/), price: z.enum(["worth_it", "not_worth_it"]), recommend: z.enum(["yes", "no"]), experience: z.string().trim().min(1).max(1000) }).strict();
export const bookingInput = z.discriminatedUnion("kind", [z.object({kind:z.literal("tour"),tour_id:z.number().int().positive().max(2147483647)}).strict(),z.object({kind:z.literal("custom"),tour_id:z.literal(0)}).strict()]);
export const inquiryInput = z.discriminatedUnion("kind", [z.object({kind:z.literal("tour"),tour_id:z.number().int().positive().max(2147483647),ticket:z.string().regex(/^[a-zA-Z0-9]{48}$/)}).strict(),z.object({kind:z.literal("custom"),tour_id:z.literal(0),ticket:z.string().regex(/^[a-zA-Z0-9]{48}$/)}).strict()]);
