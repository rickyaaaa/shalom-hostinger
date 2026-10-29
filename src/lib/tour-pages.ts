import type { AreaSlug } from "./marketing";

/**
 * Public tour detail pages (/tours/<slug>): the URL, search copy and on-page story live here, in code, like the area
 * guides in marketing.ts. Title, prices, duration, photo, rating, reviews and the included / not-included terms come
 * live from WordPress (getTour), and Order Now is the existing /book/<id> flow. WordPress slugs are not used.
 * A page with indexable: false is a pilot: it is linked from its card, but noindex and not in the sitemap.
 * A tour without an entry still has a noindex detail page at /tours/<tour id>, built from WordPress data only.
 */
export type TourPageContent = {
  tourId: number; area: AreaSlug; indexable: boolean;
  title: string; metaDescription: string; heading: string;
  intro: readonly string[]; highlights: readonly string[];
  itinerary: readonly { time?: string; title: string; text: string }[];
  faq: readonly { question: string; answer: string }[];
};

// Copy approved from the owner's answers. Times: only the 17:30 Jimbaran arrival is fixed; add no other times or prices.
export const tourPages = {
  "uluwatu-beach-jimbaran-tour": {
    tourId: 599,
    area: "south-kuta",
    indexable: false,
    title: "Uluwatu, Beach & Jimbaran Sunset Tour",
    metaDescription: "Private day tour from your hotel: Uluwatu Temple, a south Bali beach of your choice and a sunset seafood dinner in Jimbaran, with your own driver.",
    heading: "Uluwatu, Beach & Jimbaran Sunset Private Tour",
    intro: [
      "Spend a full day on Bali’s southern coast with your own private driver. Visit Uluwatu Temple on its clifftop above the Indian Ocean, relax at a beach of your choice, and finish the day with a seafood dinner on the sand in Jimbaran as the sun goes down.",
      "There is no fixed timetable. Choose the beach and lunch stop that suit you and our team plans the rest of the day around one fixed point: arriving in Jimbaran by 17:30 for the sunset dinner.",
    ],
    highlights: [
      "Uluwatu Temple, set on a clifftop above the ocean",
      "Your choice of Pandawa, Tanah Barak or Melasti Beach",
      "Lunch at a local restaurant, guided by our team or chosen by you",
      "Sunset seafood dinner on Jimbaran Beach",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "Beach time", text: "Pandawa, Tanah Barak or Melasti Beach. Tell our team which one you prefer when you reconfirm on WhatsApp, or ask for a suggestion on the day." },
      { title: "Lunch", text: "Enjoy local food for lunch. Our team can recommend a place, or you can choose where you would like to eat." },
      { title: "Uluwatu Temple", text: "Explore the temple grounds and the cliffs above the ocean. Wear clothing that covers your shoulders and knees, and keep sunglasses and loose items secure because of the monkeys." },
      { time: "17:30", title: "Jimbaran sunset dinner", text: "Arrive in Jimbaran by 17:30 for a seafood dinner on the beach as the sun sets. Dinner is paid separately." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel after dinner." },
    ],
    faq: [
      { question: "Which beach will we visit?", answer: "You choose between Pandawa, Tanah Barak and Melasti Beach. Let our team know your preference when you reconfirm your order on WhatsApp, or ask for a recommendation." },
      { question: "Is the seafood dinner in Jimbaran included?", answer: "No. The dinner is paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "Can I watch the Kecak dance at Uluwatu Temple?", answer: "Yes, but the Kecak performance and the Jimbaran sunset dinner cannot both fit into the same evening. Tell our team which one you prefer when you reconfirm your order." },
      { question: "Will we definitely see the sunset?", answer: "The sunset depends on the weather. On rainy or cloudy evenings the sky may not clear, but your dinner on Jimbaran Beach goes ahead as planned." },
      { question: "What time does the tour start?", answer: "You choose your pickup time when you order. The only fixed time is arriving in Jimbaran by 17:30, so our team plans the day around it." },
    ],
  },
  // Drafts awaiting owner review: written from the WordPress destinations and terms (activities, tickets and meals are
  // paid separately) and public facts about each place. No times, prices, age limits or activity details.
  "atv-uluwatu-jimbaran-sunset-tour": {
    tourId: 611,
    area: "south-kuta",
    indexable: false,
    title: "ATV, Uluwatu & Jimbaran Sunset Tour",
    metaDescription: "Private Bali day tour with your own driver: an ATV ride, a coffee plantation, Uluwatu Temple on the cliffs and a seafood dinner on Jimbaran Beach at sunset.",
    heading: "Bali ATV Ride, Uluwatu Temple & Jimbaran Sunset Private Tour",
    intro: [
      "Mix adventure and culture in one private day. Ride an ATV along off-road trails, stop at a coffee plantation, visit Uluwatu Temple on its clifftop above the Indian Ocean, and end the day with a seafood dinner on Jimbaran Beach as the sun goes down.",
      "Your own driver takes you between every stop, so there is no group to wait for. Choose your pickup time when you order, and agree the plan for the day with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "An ATV ride on off-road trails",
      "A coffee plantation visit, with a look at how Bali coffee and Luwak coffee are made",
      "Uluwatu Temple, set on a clifftop above the ocean",
      "Sunset seafood dinner on Jimbaran Beach",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "ATV ride", text: "Ride a quad bike along off-road trails. The ATV ride is paid separately and is not part of the tour price; tell our team you want it when you reconfirm on WhatsApp." },
      { title: "Coffee plantation", text: "See how Bali coffee is grown and roasted, including the island’s well-known Luwak coffee." },
      { title: "Uluwatu Temple", text: "Explore the temple grounds and the cliffs above the ocean. Wear clothing that covers your shoulders and knees, and keep sunglasses and loose items secure because of the monkeys." },
      { title: "Jimbaran sunset dinner", text: "Finish with a seafood dinner on the beach in Jimbaran as the sun sets. Dinner is paid separately." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel after dinner." },
    ],
    faq: [
      { question: "Is the ATV ride part of the tour price?", answer: "No. The ATV ride, entrance tickets and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "What should I wear?", answer: "Wear clothes and shoes you do not mind getting dirty on the ATV, and bring a change of clothes. At Uluwatu Temple, your shoulders and knees need to be covered." },
      { question: "Can I watch the Kecak dance at Uluwatu Temple?", answer: "Yes, but the Kecak performance and the Jimbaran sunset dinner cannot both fit into the same evening. Tell our team which one you prefer when you reconfirm your order." },
      { question: "Will we definitely see the sunset?", answer: "The sunset depends on the weather. On rainy or cloudy evenings the sky may not clear, but your dinner on Jimbaran Beach goes ahead as planned." },
    ],
  },
  "family-watersport-uluwatu-tour": {
    tourId: 616,
    area: "south-kuta",
    indexable: false,
    title: "Family Watersport & Uluwatu Day Tour",
    metaDescription: "Private family day in south Bali: watersports at Tanjung Benoa, a boat trip to Turtle Island, Uluwatu Temple and a sunset seafood dinner in Jimbaran.",
    heading: "Family Watersport, Turtle Island & Uluwatu Private Tour",
    intro: [
      "A full private day on Bali’s south coast, planned for families. Start with watersports at Tanjung Benoa and a boat trip to Turtle Island, stop for lunch, visit Uluwatu Temple above the Indian Ocean, and finish with a seafood dinner on Jimbaran Beach at sunset.",
      "Your own driver stays with your family for the whole day, so you can travel at your children’s pace. Choose your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "Watersport activities at Tanjung Benoa",
      "A boat trip to Turtle Island to see sea turtles up close",
      "Lunch at a local restaurant",
      "Uluwatu Temple, set on a clifftop above the ocean",
      "Sunset seafood dinner on Jimbaran Beach",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects your family at your hotel at the pickup time you choose when you order." },
      { title: "Watersports and Turtle Island", text: "Choose your water activities at Tanjung Benoa and take a boat across to Turtle Island to meet the sea turtles. Activities are paid separately to the operator." },
      { title: "Lunch", text: "Stop for lunch at a local restaurant. Our team can recommend a place, or you can choose where you would like to eat." },
      { title: "Uluwatu Temple", text: "Walk the temple grounds and the cliffs above the ocean. Shoulders and knees need to be covered, and keep sunglasses and loose items secure because of the monkeys." },
      { title: "Jimbaran sunset dinner", text: "End the day with a seafood dinner on the beach in Jimbaran as the sun sets. Dinner is paid separately." },
      { title: "Return to your hotel", text: "Your driver takes your family back to your hotel after dinner." },
    ],
    faq: [
      { question: "Are the watersports and the Turtle Island boat part of the tour price?", answer: "No. Water activities, entrance tickets and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "Which watersports suit young children?", answer: "Each watersport operator sets its own age and safety rules. Tell our team your children’s ages when you reconfirm on WhatsApp so the day can be planned around them." },
      { question: "Can I watch the Kecak dance at Uluwatu Temple?", answer: "Yes, but the Kecak performance and the Jimbaran sunset dinner cannot both fit into the same evening. Tell our team which one you prefer when you reconfirm your order." },
      { question: "Will we definitely see the sunset?", answer: "The sunset depends on the weather. On rainy or cloudy evenings the sky may not clear, but your dinner on Jimbaran Beach goes ahead as planned." },
    ],
  },
  "watersport-atv-jimbaran-tour": {
    tourId: 620,
    area: "south-kuta",
    indexable: false,
    title: "Watersport, ATV & Jimbaran Sunset Tour",
    metaDescription: "Two adventures in one private Bali day: watersports and Turtle Island at Tanjung Benoa, an ATV ride, then a seafood dinner on Jimbaran Beach at sunset.",
    heading: "Bali Watersport, ATV Ride & Jimbaran Sunset Private Tour",
    intro: [
      "Pack two adventures into one private day. Head out on the water at Tanjung Benoa with a boat trip to Turtle Island, ride an ATV along off-road trails, then slow down with a seafood dinner on Jimbaran Beach as the sun goes down.",
      "Your own driver handles every transfer, so you only have to choose your activities. Pick your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "Watersport activities at Tanjung Benoa",
      "A boat trip to Turtle Island to see sea turtles up close",
      "An ATV ride on off-road trails",
      "Sunset seafood dinner on Jimbaran Beach",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "Watersports and Turtle Island", text: "Choose your water activities at Tanjung Benoa and take a boat across to Turtle Island. Activities are paid separately to the operator." },
      { title: "ATV ride", text: "Ride a quad bike along off-road trails. The ATV ride is paid separately; tell our team you want it when you reconfirm on WhatsApp." },
      { title: "Jimbaran sunset dinner", text: "Finish with a seafood dinner on the beach in Jimbaran as the sun sets. Dinner is paid separately." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel after dinner." },
    ],
    faq: [
      { question: "Are the watersports and the ATV ride part of the tour price?", answer: "No. Water activities, the ATV ride, entrance tickets and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "What should I bring?", answer: "Bring swimwear, a towel, sunscreen and a change of clothes. Wear clothes and shoes you do not mind getting dirty on the ATV." },
      { question: "Will we definitely see the sunset?", answer: "The sunset depends on the weather. On rainy or cloudy evenings the sky may not clear, but your dinner on Jimbaran Beach goes ahead as planned." },
    ],
  },
  "watersport-spa-jimbaran-tour": {
    tourId: 624,
    area: "south-kuta",
    indexable: false,
    title: "Watersport, Spa & Jimbaran Sunset Tour",
    metaDescription: "Private Bali day with your own driver: watersports and Turtle Island at Tanjung Benoa, a relaxing spa treatment and a sunset seafood dinner in Jimbaran.",
    heading: "Bali Watersport, Spa & Jimbaran Sunset Private Tour",
    intro: [
      "Balance action and rest in one private day. Start on the water at Tanjung Benoa with a boat trip to Turtle Island, unwind with a spa treatment, and end the day with a seafood dinner on Jimbaran Beach as the sun goes down.",
      "Your own driver takes you from stop to stop, so the day stays relaxed. Choose your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "Watersport activities at Tanjung Benoa",
      "A boat trip to Turtle Island to see sea turtles up close",
      "A spa treatment to unwind after the water",
      "Sunset seafood dinner on Jimbaran Beach",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "Watersports and Turtle Island", text: "Choose your water activities at Tanjung Benoa and take a boat across to Turtle Island. Activities are paid separately to the operator." },
      { title: "Spa", text: "Relax with a spa treatment. The treatment is paid separately; tell our team what you would like when you reconfirm on WhatsApp." },
      { title: "Jimbaran sunset dinner", text: "Finish with a seafood dinner on the beach in Jimbaran as the sun sets. Dinner is paid separately." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel after dinner." },
    ],
    faq: [
      { question: "Are the watersports and the spa part of the tour price?", answer: "No. Water activities, the spa treatment, entrance tickets and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "Can I choose my spa treatment?", answer: "Yes. Tell our team which kind of treatment you would like when you reconfirm on WhatsApp." },
      { question: "Will we definitely see the sunset?", answer: "The sunset depends on the weather. On rainy or cloudy evenings the sky may not clear, but your dinner on Jimbaran Beach goes ahead as planned." },
    ],
  },
  "atv-spa-jimbaran-sunset-tour": {
    tourId: 628,
    area: "south-kuta",
    indexable: false,
    title: "ATV, Spa & Jimbaran Sunset Tour",
    metaDescription: "Private Bali day tour with your own driver: an off-road ATV ride, a spa treatment to relax afterwards and a seafood dinner on Jimbaran Beach at sunset.",
    heading: "Bali ATV Ride, Spa & Jimbaran Seafood Dinner Private Tour",
    intro: [
      "Get muddy, then get pampered. Ride an ATV along off-road trails, wash the day away with a spa treatment, and finish with a seafood dinner on Jimbaran Beach as the sun goes down.",
      "Your own driver takes you between every stop. Choose your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "An ATV ride on off-road trails",
      "A spa treatment to relax after the ride",
      "Sunset seafood dinner on Jimbaran Beach",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "ATV ride", text: "Ride a quad bike along off-road trails. The ATV ride is paid separately; tell our team you want it when you reconfirm on WhatsApp." },
      { title: "Spa", text: "Relax with a spa treatment after the ride. The treatment is paid separately; tell our team what you would like when you reconfirm." },
      { title: "Jimbaran sunset dinner", text: "Finish with a seafood dinner on the beach in Jimbaran as the sun sets. Dinner is paid separately." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel after dinner." },
    ],
    faq: [
      { question: "Are the ATV ride and the spa part of the tour price?", answer: "No. The ATV ride, the spa treatment, entrance tickets and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "What should I bring?", answer: "Wear clothes and shoes you do not mind getting dirty on the ATV, and bring a change of clothes for the spa and dinner." },
      { question: "Will we definitely see the sunset?", answer: "The sunset depends on the weather. On rainy or cloudy evenings the sky may not clear, but your dinner on Jimbaran Beach goes ahead as planned." },
    ],
  },
} as const satisfies Record<string, TourPageContent>;

const entries = Object.entries(tourPages) as [string, TourPageContent][];

/** Own keys only: "constructor", "__proto__" and similar never resolve to a page. */
export function tourPageBySlug(slug: string): TourPageContent | null {
  return Object.hasOwn(tourPages, slug) ? tourPages[slug as keyof typeof tourPages] : null;
}

export function tourPageSlug(tourId: number): string | null {
  return entries.find(([, page]) => page.tourId === tourId)?.[0] ?? null;
}

/** Every tour card links here: the written page when one exists, otherwise the WordPress-only page. */
export function tourDetailPath(tourId: number): string {
  return `/tours/${tourPageSlug(tourId) ?? tourId}`;
}

export function indexableTourPaths(): string[] {
  return entries.filter(([, page]) => page.indexable).map(([slug]) => `/tours/${slug}`);
}
