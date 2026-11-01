import { tourPages } from "./tour-pages";

/**
 * Travel guides (/blog/<slug>): written in code, like the tour pages in tour-pages.ts, so an article never depends on
 * WordPress being up. Prices, times and terms are never copied here; articles link to the tour pages that show them.
 * published: true lists the article on /blog, puts it in the sitemap and lets search engines index it; false keeps it
 * reachable by its URL for review, noindex and unlisted. /blog itself only exists once one article is published.
 *
 * A paragraph is a string; [text](/path) inside it is an internal link. { list } is a bullet list and { tours } a row
 * of tour links built from tour-pages.ts.
 */
export type TourSlug = keyof typeof tourPages;
export type BlogBlock = string | { list: readonly string[] } | { tours: readonly TourSlug[] };
export type BlogSection = { id: string; heading: string; sub?: boolean; blocks: readonly BlogBlock[] };
export type BlogPost = {
  published: boolean;
  /** Written, then last reviewed (YYYY-MM-DD). */
  date: string; updated?: string;
  title: string; metaDescription: string; heading: string; excerpt: string;
  image: { src: string; width: number; height: number; alt: string };
  intro: readonly string[];
  sections: readonly BlogSection[];
  faq: readonly { question: string; answer: string }[];
};

// Draft for owner review (brief: seo-reports/brief-bali-itinerary.md). Tour facts come from the approved tour pages
// and the home FAQ; the 17:30 Jimbaran arrival is the only time given. Add no prices.
export const blogPosts = {
  "bali-itinerary": {
    published: false,
    date: "2026-11-01",
    title: "7-Day Bali Itinerary (5 & 10 Day Options)",
    metaDescription: "A 7-day Bali itinerary for first-timers: Uluwatu and Jimbaran, Ubud’s rice terraces and West Bali’s temples, with 5 and 10 day versions and travel tips.",
    heading: "7-Day Bali Itinerary for First-Timers: Uluwatu, Ubud & West Bali",
    excerpt: "Three day trips with a private driver, one in each part of the island, plus easy days in between. With 5 and 10 day versions.",
    image: { src: "/images/ubud.webp", width: 720, height: 480, alt: "Green rice terraces in Ubud" },
    intro: [
      "Seven days is enough to see Bali’s three very different sides without rushing: the clifftop temple and beaches of the south, the rice terraces and temples around Ubud, and the lake and sea temples of West and North Bali. This itinerary puts the long drives into three full day trips with a private driver and leaves the other days for the beach, the pool and the places you find on your own.",
      "Each day trip below is one of our private 10-hour tours, so you can book it as it is, swap it for another route in the same area, or [plan your own day](/#customizedtour).",
    ],
    sections: [
      { id: "how-many-days", heading: "How many days do you need in Bali?", blocks: [
        "Seven days is a good length for a first visit. It gives you three full day trips, one in each part of the island, plus time to rest after the flight and before you leave. With five days, choose two areas instead of three. With ten days or more, you can slow down, stay in two places and add the trips that do not fit into a shorter visit.",
        "Bali looks small on a map, but traffic is slow and the main sights are spread out. Plan one area per day rather than trying to cover the south, Ubud and the west in a single trip.",
      ] },
      { id: "where-to-stay", heading: "Where to stay for a week in Bali", blocks: [
        "Most first-time visitors stay in the south, in areas such as Seminyak, Kuta, Jimbaran or Nusa Dua, close to the airport and the beaches. Ubud, in the green centre of the island, suits travellers who want rice fields, culture and quieter evenings.",
        "For seven days you can stay in one place. Your driver collects you at your hotel for each day trip, so there is no need to change hotels to see Ubud or West Bali. If you would like two bases, spend the first nights in the south and the last nights in Ubud, or the other way round.",
      ] },
      { id: "itinerary", heading: "Your 7-day Bali itinerary at a glance", blocks: [
        { list: [
          "Day 1: Arrive and settle in",
          "Day 2: Uluwatu Temple, a south Bali beach and a Jimbaran sunset dinner",
          "Day 3: A slow beach day",
          "Day 4: Ubud rice terraces, Tirta Empul and a waterfall",
          "Day 5: A second Ubud day, or a day off",
          "Day 6: Ulun Danu Beratan, Taman Ayun and Tanah Lot",
          "Day 7: A last swim and your flight home",
        ] },
      ] },
      { id: "day-1", sub: true, heading: "Day 1: Arrive and settle in", blocks: [
        "Keep the first day easy. After the flight and the drive from the airport, check in, have a swim and find dinner close to your hotel. It is also a good moment to [order your day trips](/#itineraries), so the dates and pickup times are set before you start.",
      ] },
      { id: "day-2", sub: true, heading: "Day 2: Uluwatu Temple, the beach and a Jimbaran sunset", blocks: [
        "Spend your first full day on the southern coast. Uluwatu Temple stands on a clifftop above the Indian Ocean, and below the limestone cliffs nearby are beaches such as Pandawa, Tanah Barak and Melasti.",
        "End the day on Jimbaran Beach, where seafood restaurants set their tables on the sand as the sun goes down. On our [Uluwatu, Beach & Jimbaran Sunset Tour](/tours/uluwatu-beach-jimbaran-tour) you choose the beach and the lunch stop, and the day is planned around arriving in Jimbaran by 17:30.",
        "Would you rather see the Kecak dance at Uluwatu? It is performed at the temple in the evening, so it takes the place of the Jimbaran dinner rather than adding to it. Tell our team which you prefer when you reconfirm your order.",
        { tours: ["uluwatu-beach-jimbaran-tour", "atv-uluwatu-jimbaran-sunset-tour"] },
      ] },
      { id: "day-3", sub: true, heading: "Day 3: A slow beach day", blocks: [
        "After a long day out, take a day for yourself: the pool, a beach near your hotel or a spa. Travelling with children, or looking for something more active? The [Family Watersport & Uluwatu Day Tour](/tours/family-watersport-uluwatu-tour) combines watersports at Tanjung Benoa, a boat across to Turtle Island and a visit to Uluwatu Temple.",
      ] },
      { id: "day-4", sub: true, heading: "Day 4: Ubud rice terraces, Tirta Empul and a waterfall", blocks: [
        "Head inland for the Bali most visitors picture: green rice terraces, a coffee plantation, the spring-fed purification pools of Tirta Empul and Kanto Lampo Waterfall. Our [Ubud Rice Terraces & Waterfall Tour](/tours/ubud-rice-terrace-waterfall-tour) covers all of them in one day with your own driver.",
        "Tirta Empul is a working temple, so cover your shoulders and knees. Wear shoes with grip for the waterfall, where the path can be slippery.",
        { tours: ["ubud-rice-terrace-waterfall-tour"] },
      ] },
      { id: "day-5", sub: true, heading: "Day 5: A second Ubud day, or a day off", blocks: [
        "If Ubud becomes your favourite, go back for a different side of it. Walk among the monkeys and old temples of the [Sacred Monkey Forest](/tours/ubud-monkey-forest-tirta-empul-tour), watch batik being made and try a silver class on the [Ubud art tour](/tours/ubud-art-batik-silver-class-tour), or combine an ATV ride with river rafting on the [Ubud ATV & Rafting Day Tour](/tours/ubud-atv-rafting-tour).",
        "If you would rather rest, keep this day free. A week goes quickly when every day is busy.",
      ] },
      { id: "day-6", sub: true, heading: "Day 6: Ulun Danu Beratan, Taman Ayun and Tanah Lot", blocks: [
        "Spend the last full day in West and North Bali. Ulun Danu Beratan is the temple on the lake in the cool Bedugul highlands, Taman Ayun is the royal temple of the old Mengwi kingdom with its moat and gardens, and Tanah Lot stands on a rock in the sea. Our [Ulun Danu, Taman Ayun & Tanah Lot Tour](/tours/ulun-danu-taman-ayun-tanah-lot-tour) visits all three.",
        "Prefer rice fields to the lake? Swap Ulun Danu for the Jatiluwih rice terraces on the [Jatiluwih, Taman Ayun & Tanah Lot Tour](/tours/jatiluwih-taman-ayun-tanah-lot-tour).",
        { tours: ["ulun-danu-taman-ayun-tanah-lot-tour", "jatiluwih-taman-ayun-tanah-lot-tour"] },
      ] },
      { id: "day-7", sub: true, heading: "Day 7: A last swim and your flight home", blocks: [
        "Keep the last day light. Leave plenty of time for the drive to the airport, because traffic in the south can be slow, especially in the late afternoon.",
      ] },
      { id: "five-days", heading: "If you only have 5 days in Bali", blocks: [
        "Keep the arrival and departure days and choose two of the three day trips. For a first visit, Uluwatu and Ubud show the clearest contrast between the coast and the green interior of the island:",
        { list: [
          "Day 1: Arrive and settle in",
          "Day 2: Uluwatu Temple, the beach and a Jimbaran sunset",
          "Day 3: Ubud rice terraces, Tirta Empul and a waterfall",
          "Day 4: A free day, or the temples of West Bali",
          "Day 5: Your flight home",
        ] },
      ] },
      { id: "ten-days", heading: "If you have 10 days in Bali", blocks: [
        "Follow the 7-day plan and add three days. Stay your last nights in Ubud, add a second Ubud day trip and leave at least one more day completely free.",
        "Travelling with children? A day at [Bali Bird Park & Reptile Park](/tours/bali-bird-park-reptile-park-kids-tour) or [Bali Safari & Marine Park](/tours/bali-safari-marine-park-tour) fits well. For a calmer day in the west, the [Beji Purification & Tanah Lot Tour](/tours/beji-purification-tanah-lot-tour) adds a water purification ritual at Beji Purification Temple.",
      ] },
      { id: "getting-around", heading: "Getting around Bali with a private driver", blocks: [
        "Bali has little public transport that suits visitors, so most people get around by taxi, ride-hailing app, scooter or a car with a driver. For full day trips a private driver is the simplest choice: one car for the whole day, no waiting between stops and no need to find a ride back from a temple in the countryside.",
        "Every Shalom day tour includes a private car and your own driver for 10 hours, with fuel and parking included. You choose your pickup time when you order and reconfirm the plan with our team on WhatsApp. Entrance tickets, activities and lunch are not included; each tour page lists what is and is not included.",
        "None of our routes fit your plans? [Customize your itinerary](/#customizedtour) and tell us the places you would like to visit.",
      ] },
      { id: "when-to-go", heading: "When is the best time to visit Bali?", blocks: [
        "Bali has a dry season, roughly April to October, and a wet season, roughly November to March. The dry months are the busiest, along with school holidays and Christmas. In the wet season rain usually comes in heavy showers rather than all day, and the rice fields are at their greenest.",
        "Check the date of Nyepi, the Balinese Day of Silence, which usually falls in March. For 24 hours the whole island stops: shops close, nobody goes out and the airport shuts, so plan your arrival and day trips around it.",
      ] },
      { id: "tips", heading: "Tips for your first trip to Bali", blocks: [
        { list: [
          "Wear clothes that cover your shoulders and knees when you visit a temple, or bring a sarong.",
          "Keep sunglasses, hats and loose items in your bag at Uluwatu Temple and the Monkey Forest. The monkeys are quick.",
          "Carry some cash in Indonesian rupiah for entrance tickets, small shops and local warungs.",
          "Plan one area per day: the distances are short, but the drives are long.",
          "Drink bottled or filtered water rather than tap water.",
          "Pack sunscreen, insect repellent and, in the wet season, a light rain jacket.",
        ] },
      ] },
    ],
    faq: [
      { question: "Is 7 days in Bali enough?", answer: "Yes, for a first visit. Seven days gives you three full day trips, one each in the south, Ubud and West Bali, plus time to rest. You will not see everything, but you will see the main sides of the island without rushing." },
      { question: "Is it better to stay in Ubud or in the south of Bali?", answer: "Stay in the south for beaches and an easy airport transfer, or in Ubud for rice fields, culture and quiet evenings. With a private driver you can see both from either base." },
      { question: "How long is a day tour with a private driver?", answer: "Our private tours are 10 hours, counted from your agreed pickup time. If the day goes over 10 hours, an extra charge applies." },
      { question: "Can I plan my own day instead of a set tour?", answer: "Yes. Choose a customized itinerary and tell us the places you would like to visit. On our set tours, the order of the stops is agreed with our team when you reconfirm on WhatsApp." },
      { question: "Can I see the Kecak dance and have dinner in Jimbaran on the same evening?", answer: "No. The Kecak performance at Uluwatu and the Jimbaran sunset dinner take place at the same time of day, so choose one when you reconfirm your order." },
    ],
  },
} as const satisfies Record<string, BlogPost>;

export type BlogSlug = keyof typeof blogPosts;
const entries = Object.entries(blogPosts) as [BlogSlug, BlogPost][];

/** Own keys only: "constructor", "__proto__" and similar never resolve to an article. */
export function blogPostBySlug(slug: string): BlogPost | null {
  return Object.hasOwn(blogPosts, slug) ? blogPosts[slug as BlogSlug] : null;
}

/** Published articles, newest first. */
export function publishedPosts(): [BlogSlug, BlogPost][] {
  return entries.filter(([, post]) => post.published).sort(([, a], [, b]) => b.date.localeCompare(a.date));
}

export const blogLive = () => publishedPosts().length > 0;

export function indexableBlogPaths(): string[] {
  const posts = publishedPosts();
  return posts.length ? ["/blog", ...posts.map(([slug]) => `/blog/${slug}`)] : [];
}

/** Splits a paragraph into text and internal links written as [text](/path). */
export function inlineParts(text: string): ({ text: string } | { text: string; href: string })[] {
  const parts: ({ text: string } | { text: string; href: string })[] = [];
  let last = 0;
  for (const match of text.matchAll(/\[([^\]]+)\]\((\/[^)\s]*)\)/g)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ text: match[1], href: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** Plain text of a paragraph, for search snippets and JSON-LD. */
export const plainText = (text: string) => inlineParts(text).map(part => part.text).join("");
