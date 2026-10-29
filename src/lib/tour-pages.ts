import type { AreaSlug } from "./marketing";

/**
 * Public tour detail pages (/tours/<slug>): the URL, search copy and on-page story live here, in code, like the area
 * guides in marketing.ts. Title, prices, duration, photo, rating, reviews and the included / not-included terms come
 * live from WordPress (getTour), and Order Now is the existing /book/<id> flow. WordPress slugs are not used.
 * A page with indexable: false is a pilot: it opens, but is noindex, unlinked from the tour cards and not in the sitemap.
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
} as const satisfies Record<string, TourPageContent>;

const entries = Object.entries(tourPages) as [string, TourPageContent][];

/** Own keys only: "constructor", "__proto__" and similar never resolve to a page. */
export function tourPageBySlug(slug: string): TourPageContent | null {
  return Object.hasOwn(tourPages, slug) ? tourPages[slug as keyof typeof tourPages] : null;
}

/** The detail page a tour card links to, only once the page is indexable (a pilot stays unlinked). */
export function tourPagePath(tourId: number): string | null {
  const entry = entries.find(([, page]) => page.tourId === tourId && page.indexable);
  return entry ? `/tours/${entry[0]}` : null;
}

export function indexableTourPaths(): string[] {
  return entries.filter(([, page]) => page.indexable).map(([slug]) => `/tours/${slug}`);
}
