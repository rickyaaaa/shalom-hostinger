import { z } from "zod";

const price = z.number().finite().nonnegative().nullable();
const rating = z.object({
  score: z.number().min(0).max(10).nullable(),
  review_count: z.number().int().nonnegative(),
});

export const tourSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().min(1),
  area: z.object({ slug: z.string(), name: z.string() }).nullable(),
  card_image: z.object({ id: z.number().int().positive(), url: z.url(), alt: z.string() }).nullable(),
  destinations: z.array(z.string()).max(50),
  pricing: z.object({ regular: price, sale: price, currency: z.string().regex(/^[A-Z]{3}$/).nullable() }),
  duration: z.string(),
  price_note: z.string(),
  rating,
  // 1.23: effective INCLUDE / NOT INCLUDING terms (the Tour's own lists, else the site-wide terms). Absent on older plugins.
  booking_terms: z.object({ not_included: z.array(z.string().max(300)).max(30), included: z.array(z.string().max(300)).max(30) }).optional(),
});

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
