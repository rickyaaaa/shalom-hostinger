import { z } from "zod";

const price = z.number().finite().nonnegative().nullable();
const rating = z.object({
  score: z.number().min(0).max(10).nullable(),
  review_count: z.number().int().nonnegative(),
});

export const currencyCodeSchema = z.enum(["USD", "EUR", "IDR"]);
export type CurrencyCode = z.infer<typeof currencyCodeSchema>;
const currencyStatus = z.enum(["ok", "stale", "unavailable"]);
const currencyAmount = z.object({ regular: price, sale: price, status: currencyStatus });
export const tourPricesSchema = z.object({
  base: z.object({ currency: z.literal("IDR"), regular: price, sale: price }).nullable(),
  rate_date: z.iso.date().nullable(),
  amounts: z.record(currencyCodeSchema, currencyAmount),
});
export const priceStatusSchema = z.enum(["converted", "legacy", "none"]);
export const currencyCapabilitySchema = z.object({
  enabled: z.boolean(),
  default: currencyCodeSchema,
  supported: z.array(currencyCodeSchema).min(1),
  base: currencyCodeSchema.optional(),
  rates: z.record(currencyCodeSchema, z.object({
    idr_per_unit: z.number().positive().nullable(),
    effective_date: z.iso.date().nullable(),
    source: z.string(),
    status: currencyStatus,
  })).optional(),
  display: z.record(currencyCodeSchema, z.object({ symbol: z.string(), decimals: z.number().int().min(0).max(2) })).optional(),
});
export type CurrencyCapability = z.infer<typeof currencyCapabilitySchema>;

/** INCLUDE / NOT INCLUDING lists from WordPress: per itinerary (booking page) or site-wide (/booking-terms, FAQ). */
export const bookingTermsSchema = z.object({ not_included: z.array(z.string().max(300)).max(30), included: z.array(z.string().max(300)).max(30) });

export const tourSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().min(1),
  area: z.object({ slug: z.string(), name: z.string() }).nullable(),
  card_image: z.object({ id: z.number().int().positive(), url: z.url(), alt: z.string() }).nullable(),
  destinations: z.array(z.string()).max(50),
  pricing: z.object({ regular: price, sale: price, currency: z.string().regex(/^[A-Z]{3}$/).nullable() }),
  // 1.29 additive multi-currency fields. Absent on v1.28.1 and on the feature-OFF backend.
  price_status: priceStatusSchema.optional(),
  prices: tourPricesSchema.optional(),
  duration: z.string(),
  price_note: z.string(),
  rating,
  // 1.23: effective INCLUDE / NOT INCLUDING terms (the Tour's own lists, else the site-wide terms). Absent on older plugins.
  booking_terms: bookingTermsSchema.optional(),
  // 1.33: an island package priced per person in IDR, with an optional per-car round-trip hotel shuttle. Null or absent for car tours.
  package: z.object({
    pricing: z.literal("per_person"),
    currency: z.literal("IDR"),
    person_price: z.number().int().positive().nullable(),
    shuttle: z.object({ price: z.number().int().positive(), capacity: z.number().int().min(1).max(100), round_trip: z.boolean() }).nullable(),
    max_persons: z.number().int().min(1).max(100),
    bookable: z.boolean(),
  }).nullable().optional(),
});
export type TourPackage = NonNullable<z.infer<typeof tourSchema>["package"]>;

export const reviewSchema = z.object({
  tour_id: z.number().int().positive(),
  tour_title: z.string(),
  area: z.string(),
  name: z.string(),
  country: z.string(),
  experience: z.string(),
  score: z.number().min(0).max(10),
  ratings: z.object({ driving_skill: z.number(), service: z.number(), car: z.number() }),
  price: z.enum(["worth_it", "not_worth_it"]).nullable(),
  recommend: z.enum(["yes", "no"]).nullable(),
  booking_date: z.string().nullable(),
  published_at: z.string(),
});

export const reviewPageSchema = z.object({
  title: z.string(),
  summary: rating,
  reviews: z.array(reviewSchema),
  has_more: z.boolean(),
  next_page: z.number().int().positive().nullable(),
});

export const latestReviewsSchema = z.object({ reviews: z.array(reviewSchema) });
export const tourCollectionSchema = z.object({ items: z.array(tourSchema), page: z.number().int().positive(), per_page: z.number().int().positive(), total: z.number().int().nonnegative(), total_pages: z.number().int().nonnegative() });
export type Tour = z.infer<typeof tourSchema>;
export type Rating = z.infer<typeof rating>;
export type Review = z.infer<typeof reviewSchema>;
export type ReviewPage = z.infer<typeof reviewPageSchema>;

export type SiteLinks = {
  southKuta: string;
  westBali: string;
  concerns: string;
  about: string;
  customBooking: string;
};
