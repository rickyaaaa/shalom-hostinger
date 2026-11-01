import { tourPages } from "./tour-pages";

/**
 * Travel guides (/blog/<slug>): written in code, like the tour pages in tour-pages.ts, so an article never depends on
 * WordPress being up. Prices, times and terms are never copied here; articles link to the tour pages that show them.
 * published: true lists the article on /blog, puts it in the sitemap and lets search engines index it; false keeps it
 * reachable by its URL for review, noindex and unlisted. /blog itself only exists once one article is published.
 *
 * A paragraph is a string; [text](/path) inside it is an internal link. { list } is a bullet list, { tours } a row
 * of tour links built from tour-pages.ts and { image } a photo from blogImages, with an optional caption.
 */
export type TourSlug = keyof typeof tourPages;
export type BlogImageKey = keyof typeof blogImages;
export type BlogBlock = string | { list: readonly string[] } | { tours: readonly TourSlug[] } | { image: BlogImageKey; caption?: string };
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

/**
 * Photos inside the guides (public/images/blog, 1200px WebP; each file has a .json note of where it came from).
 * Wikimedia Commons photos are free-licensed and need their credit shown: author, licence and source, rendered under
 * the photo. credit: null marks the client's own photos.
 */
export type BlogImage = {
  src: string; width: number; height: number; alt: string;
  credit: { author: string; license: string; licenseUrl: string; source: string } | null;
};
export const blogImages = {
  "bali-rice-terrace": { src: "/images/blog/bali-rice-terrace.webp", width: 1134, height: 759, alt: "Rice terraces stepping down a palm-covered hillside in Bali", credit: {"author": "William Cho", "license": "CC BY-SA 2.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/", "source": "https://commons.wikimedia.org/wiki/File:Bali_%E2%80%93_Rice_terrace_(2687339411).jpg"} },
  "campuhan-ridge-walk": { src: "/images/blog/campuhan-ridge-walk.webp", width: 1200, height: 899, alt: "Aerial view of the Campuhan Ridge Walk path along a green ridge in Ubud", credit: {"author": "Artem Beliaikin from Moscow, Russia", "license": "CC0", "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/", "source": "https://commons.wikimedia.org/wiki/File:Aerial_picture_of_Campuhan_Ridge_Walk_,_Scenic_Green_Valley_in_Ubud_Bali._Drone_photo._(46112155712).jpg"} },
  "goa-gajah": { src: "/images/blog/goa-gajah.webp", width: 1200, height: 800, alt: "The carved demon-face entrance of the Goa Gajah cave", credit: {"author": "DerGenaue Allrounder", "license": "CC BY-SA 3.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/", "source": "https://commons.wikimedia.org/wiki/File:Goa_Gajah_Front.JPG"} },
  "jimbaran-sunset-dinner": { src: "/images/blog/jimbaran-sunset-dinner.webp", width: 1200, height: 800, alt: "A dinner table set on the sand of Jimbaran Beach at sunset", credit: {"author": "Guanzhan Chen", "license": "CC BY 3.0", "licenseUrl": "https://creativecommons.org/licenses/by/3.0/", "source": "https://commons.wikimedia.org/wiki/File:Jimbaran_Beach,_Bali-%E5%85%A8%E7%90%83%E5%8D%81%E5%A4%A7%E7%9C%8B%E6%97%A5%E8%90%BD%E6%9C%80%E4%BD%B3%E5%9C%B0_-_panoramio.jpg"} },
  "kecak-fire": { src: "/images/blog/kecak-fire.webp", width: 1200, height: 800, alt: "The fire scene of a Kecak dance performance at dusk", credit: {"author": "Johannnindito Adisuryo (Yohanes Nindito Adisuryo)", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/", "source": "https://commons.wikimedia.org/wiki/File:Burning_fire_in_Ramayana_Kecak_Dance.jpg"} },
  "legong-ramayana-ubud": { src: "/images/blog/legong-ramayana-ubud.webp", width: 1200, height: 688, alt: "Balinese dancers in gold costumes performing on a stage in Ubud", credit: {"author": "Jakub Hałun", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/", "source": "https://commons.wikimedia.org/wiki/File:Balinese_dance_Legong_in_Ubud,_Ramayana_performance,_20220823_1846_0442.jpg"} },
  "saraswati-temple": { src: "/images/blog/saraswati-temple.webp", width: 1200, height: 802, alt: "The lotus pond in front of Saraswati Temple in Ubud", credit: {"author": "Jakub Hałun", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/", "source": "https://commons.wikimedia.org/wiki/File:Pura_Taman_Saraswati,_Ubud,_Bali,_20220823_0848_0265.jpg"} },
  "tanah-lot": { src: "/images/blog/tanah-lot.webp", width: 1200, height: 801, alt: "Tanah Lot temple on its rock in the sea, with waves around it", credit: {"author": "Jakub Hałun", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/", "source": "https://commons.wikimedia.org/wiki/File:Bali_-_Pura_Tanah_Lot,_20220827_1003_1127.jpg"} },
  "tegallalang-rice-terraces": { src: "/images/blog/tegallalang-rice-terraces.webp", width: 1200, height: 900, alt: "Green rice terraces and palm trees in the Tegallalang valley", credit: {"author": "Pinterpandai", "license": "CC BY-SA 3.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/", "source": "https://commons.wikimedia.org/wiki/File:Beautiful_rice_terraces_in_Tagallalang.jpg"} },
  "tegenungan-waterfall": { src: "/images/blog/tegenungan-waterfall.webp", width: 1200, height: 900, alt: "Tegenungan Waterfall falling into a pool surrounded by jungle", credit: {"author": "John Ellis", "license": "CC BY 3.0", "licenseUrl": "https://creativecommons.org/licenses/by/3.0/", "source": "https://commons.wikimedia.org/wiki/File:Tegenungan_Waterfall_(222403843).jpeg"} },
  "tirta-empul-spring": { src: "/images/blog/tirta-empul-spring.webp", width: 1200, height: 900, alt: "The clear spring-fed pool at Tirta Empul temple", credit: {"author": "Chainwit.", "license": "CC BY 4.0", "licenseUrl": "https://creativecommons.org/licenses/by/4.0/", "source": "https://commons.wikimedia.org/wiki/File:Bali_-_Pura_Tirta_Empul_(2025)_-_img_22.jpg"} },
  "ubud-monkey-forest": { src: "/images/blog/ubud-monkey-forest.webp", width: 1200, height: 801, alt: "A long-tailed macaque sitting on a wooden railing in the Ubud Monkey Forest", credit: {"author": "Jakub Hałun", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/", "source": "https://commons.wikimedia.org/wiki/File:Macaca_fascicularis,_Ubud_Monkey_Forest,_Bali,_20220822_1053_0056.jpg"} },
  "ubud-rafting": { src: "/images/blog/ubud-rafting.webp", width: 800, height: 672, alt: "A raft crew paddling through white water on a jungle river near Ubud", credit: null },
  "ubud-silver-class": { src: "/images/blog/ubud-silver-class.webp", width: 800, height: 529, alt: "A visitor shaping a silver piece with a local silversmith in Ubud", credit: null },
  "uluwatu-cliff-path": { src: "/images/blog/uluwatu-cliff-path.webp", width: 1200, height: 797, alt: "A walled clifftop path and viewpoint at Uluwatu Temple above the sea", credit: {"author": "Michelle Maria", "license": "CC BY 3.0", "licenseUrl": "https://creativecommons.org/licenses/by/3.0/", "source": "https://commons.wikimedia.org/wiki/File:Bali,_Indonesia_Uluwatu_Temple_-_panoramio.jpg"} },
  "uluwatu-cliff-sunset": { src: "/images/blog/uluwatu-cliff-sunset.webp", width: 1200, height: 800, alt: "Limestone sea cliffs at Uluwatu in the late afternoon light", credit: {"author": "Emma THERY", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/", "source": "https://commons.wikimedia.org/wiki/File:Cliff_at_Uluwatu_temple,_Bali.jpg"} },
  "uluwatu-sunset-silhouette": { src: "/images/blog/uluwatu-sunset-silhouette.webp", width: 1200, height: 800, alt: "The silhouette of Uluwatu Temple against the sunset over the ocean", credit: {"author": "CEphoto, Uwe Aranas", "license": "CC BY-SA 3.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/", "source": "https://commons.wikimedia.org/wiki/File:Kuta_Bali_Indonesia_Pura-Luhur-Uluwatu-04.jpg"} },
  "uluwatu-temple-headland": { src: "/images/blog/uluwatu-temple-headland.webp", width: 1200, height: 800, alt: "Uluwatu Temple on top of a sheer cliff above the Indian Ocean", credit: {"author": "CEphoto, Uwe Aranas", "license": "CC BY-SA 3.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/", "source": "https://commons.wikimedia.org/wiki/File:Kuta_Bali_Indonesia_Pura-Luhur-Uluwatu-03.jpg"} },
} as const satisfies Record<string, BlogImage>;

// Owner-approved 2026-11-01: Ubud hotel pickup, the 10-day tours are sold, Kecak or Jimbaran dinner (brief:
// seo-reports/brief-bali-itinerary.md). Tour facts come from the approved tour pages
// and the home FAQ; the 17:30 Jimbaran arrival is the only time given. Add no prices.
export const blogPosts = {
  "bali-itinerary": {
    published: true,
    date: "2026-11-01",
    title: "7-Day Bali Itinerary (5 & 10 Day Options)",
    metaDescription: "A 7-day Bali itinerary for first-timers: Uluwatu and Jimbaran, Ubud’s rice terraces and West Bali’s temples, with 5 and 10 day versions and travel tips.",
    heading: "7-Day Bali Itinerary for First-Timers: Uluwatu, Ubud & West Bali",
    excerpt: "Three day trips with a private driver, one in each part of the island, plus easy days in between. With 5 and 10 day versions.",
    image: { src: "/images/west-bali.jpeg", width: 720, height: 405, alt: "A Balinese temple beside the water" },
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
        { image: "uluwatu-cliff-sunset", caption: "The sea cliffs at Uluwatu, at the southern tip of Bali." },
        "End the day on Jimbaran Beach, where seafood restaurants set their tables on the sand as the sun goes down. On our [Uluwatu, Beach & Jimbaran Sunset Tour](/tours/uluwatu-beach-jimbaran-tour) you choose the beach and the lunch stop, and the day is planned around arriving in Jimbaran by 17:30.",
        "Would you rather see the Kecak dance at Uluwatu? It is performed at the temple in the evening, so it takes the place of the Jimbaran dinner rather than adding to it. Tell our team which you prefer when you reconfirm your order.",
        { tours: ["uluwatu-beach-jimbaran-tour", "atv-uluwatu-jimbaran-sunset-tour"] },
      ] },
      { id: "day-3", sub: true, heading: "Day 3: A slow beach day", blocks: [
        "After a long day out, take a day for yourself: the pool, a beach near your hotel or a spa. Travelling with children, or looking for something more active? The [Family Watersport & Uluwatu Day Tour](/tours/family-watersport-uluwatu-tour) combines watersports at Tanjung Benoa, a boat across to Turtle Island and a visit to Uluwatu Temple.",
      ] },
      { id: "day-4", sub: true, heading: "Day 4: Ubud rice terraces, Tirta Empul and a waterfall", blocks: [
        "Head inland for the Bali most visitors picture: green rice terraces, a coffee plantation, the spring-fed purification pools of Tirta Empul and Kanto Lampo Waterfall. Our [Ubud Rice Terraces & Waterfall Tour](/tours/ubud-rice-terrace-waterfall-tour) covers all of them in one day with your own driver.",
        { image: "bali-rice-terrace", caption: "Rice terraces in the hills around Ubud." },
        "Tirta Empul is a working temple, so cover your shoulders and knees. Wear shoes with grip for the waterfall, where the path can be slippery.",
        { tours: ["ubud-rice-terrace-waterfall-tour"] },
      ] },
      { id: "day-5", sub: true, heading: "Day 5: A second Ubud day, or a day off", blocks: [
        "If Ubud becomes your favourite, go back for a different side of it. Walk among the monkeys and old temples of the [Sacred Monkey Forest](/tours/ubud-monkey-forest-tirta-empul-tour), watch batik being made and try a silver class on the [Ubud art tour](/tours/ubud-art-batik-silver-class-tour), or combine an ATV ride with river rafting on the [Ubud ATV & Rafting Day Tour](/tours/ubud-atv-rafting-tour).",
        "If you would rather rest, keep this day free. A week goes quickly when every day is busy.",
      ] },
      { id: "day-6", sub: true, heading: "Day 6: Ulun Danu Beratan, Taman Ayun and Tanah Lot", blocks: [
        "Spend the last full day in West and North Bali. Ulun Danu Beratan is the temple on the lake in the cool Bedugul highlands, Taman Ayun is the royal temple of the old Mengwi kingdom with its moat and gardens, and Tanah Lot stands on a rock in the sea. Our [Ulun Danu, Taman Ayun & Tanah Lot Tour](/tours/ulun-danu-taman-ayun-tanah-lot-tour) visits all three.",
        { image: "tanah-lot", caption: "Tanah Lot, the temple on a rock in the sea." },
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
  // Brief: seo-reports/brief-things-to-do-in-ubud.md. Shalom facts come from the Ubud tour pages (their stops say
  // "Ubud rice terraces", so no tour is said to visit Tegallalang); places are described from public facts only.
  "things-to-do-in-ubud": {
    published: true,
    date: "2026-11-01",
    title: "20 Best Things to Do in Ubud, Bali",
    metaDescription: "20 things to do in Ubud, Bali: the Monkey Forest, Tirta Empul, Tegallalang rice terraces, the Campuhan Ridge Walk, art, rafting and Ubud in one day.",
    heading: "20 Things to Do in Ubud: Temples, Rice Terraces, Art & Adventure",
    excerpt: "Temples, rice terraces, waterfalls, art and adventure in and around Ubud, with a plan for seeing the highlights in one day.",
    image: { src: "/images/ubud.webp", width: 720, height: 480, alt: "Green rice terraces in Ubud" },
    intro: [
      "Ubud is the green, cultural heart of Bali. Rice terraces run down the valleys around town, temples sit beside spring-fed pools, and the evenings belong to dance performances, galleries and long dinners. These are the things most worth your time in and around Ubud, grouped by what you enjoy, with a plan for seeing the highlights in one day.",
      "Many of these places are outside the town centre, so they are easiest to reach with a car and driver. Where one of our [private Ubud tours](/ubud) covers a stop, we link to it.",
    ],
    sections: [
      { id: "what-is-ubud-known-for", heading: "What is Ubud known for?", blocks: [
        "Ubud is known for its rice terraces, temples, traditional arts and the Sacred Monkey Forest. It sits in the hills of central Bali, away from the beaches, and is the island’s centre for painting, dance, crafts, yoga and wellness. Most visitors come for green landscapes and Balinese culture rather than nightlife.",
      ] },
      { id: "temples", heading: "Temples and sacred sites", blocks: [
        "Ubud’s temples are working places of worship. Cover your shoulders and knees, and wear or borrow a sarong where one is required.",
      ] },
      { id: "monkey-forest", sub: true, heading: "1. Walk through the Sacred Monkey Forest", blocks: [
        "On the south side of Ubud town, paths wind through a forest of tall trees, mossy statues and old temples, home to hundreds of long-tailed macaques. Keep food out of sight and sunglasses, hats and loose items in your bag, and do not touch or feed the monkeys. Our [Ubud Monkey Forest & Tirta Empul Tour](/tours/ubud-monkey-forest-tirta-empul-tour) starts the day here.",
        { image: "ubud-monkey-forest" },
      ] },
      { id: "tirta-empul", sub: true, heading: "2. Join the water purification at Tirta Empul", blocks: [
        "North-east of Ubud, Tirta Empul is a temple built around a holy spring. Balinese come to bathe under its row of water spouts to purify themselves, and visitors can join in with respect, wearing a sarong and following the ritual. Bring a change of clothes if you plan to go in the water.",
        { image: "tirta-empul-spring", caption: "The spring that feeds the purification pools at Tirta Empul." },
      ] },
      { id: "gunung-kawi", sub: true, heading: "3. See the cliff shrines of Gunung Kawi", blocks: [
        "Not far from Tirta Empul, a long flight of steps leads down to a river valley where ancient shrines are carved into the rock face. It is quieter than the better-known temples and pairs well with a visit to Tirta Empul.",
      ] },
      { id: "goa-gajah", sub: true, heading: "4. Explore Goa Gajah, the Elephant Cave", blocks: [
        "South-east of the town centre, this centuries-old sanctuary has a cave entrance carved with a demon’s face, old bathing pools and a path down into a green ravine.",
        { image: "goa-gajah" },
      ] },
      { id: "saraswati-temple", sub: true, heading: "5. Visit the lotus pond at Saraswati Temple", blocks: [
        "In the middle of town, a path between lotus ponds leads to a temple dedicated to Saraswati, the goddess of learning and the arts. It is an easy stop on a walk through central Ubud.",
        { image: "saraswati-temple" },
      ] },
      { id: "ubud-palace", sub: true, heading: "6. Step into Ubud Palace", blocks: [
        "Puri Saren Agung, the home of Ubud’s royal family, sits at the main crossroads of town. Its carved gates and courtyards are open to visitors, and in the evenings it is one of the places where traditional dance is performed.",
      ] },
      { id: "nature", heading: "Rice terraces, walks and waterfalls", blocks: [
        "The landscapes around Ubud are at their best early in the morning, before the heat and the crowds.",
      ] },
      { id: "tegallalang", sub: true, heading: "7. Walk the Tegallalang Rice Terraces", blocks: [
        "North of Ubud, Tegallalang is one of the most photographed rice terraces in Bali, with green steps falling into a palm-filled valley, cafés along the top and swings over the edge. Go early for softer light and fewer people. Rice terraces around Ubud are a stop on several of our tours, including the [Ubud Rice Terraces & Waterfall Tour](/tours/ubud-rice-terrace-waterfall-tour).",
        { image: "tegallalang-rice-terraces" },
      ] },
      { id: "campuhan-ridge", sub: true, heading: "8. Take the Campuhan Ridge Walk", blocks: [
        "This paved path follows a grassy ridge between two river valleys, starting near Gunung Lebah Temple on the edge of town. It is free and easy to walk, but there is little shade, so go at sunrise or in the late afternoon.",
        { image: "campuhan-ridge-walk", caption: "The Campuhan Ridge Walk from above." },
      ] },
      { id: "waterfalls", sub: true, heading: "9. Cool off at a waterfall", blocks: [
        "Several waterfalls are a short drive from Ubud, among them Tegenungan, Tibumana and Kanto Lampo, where the water tumbles over stepped rocks. Paths can be steep and slippery, so wear shoes with grip. Kanto Lampo is part of our [Ubud Rice Terraces & Waterfall Tour](/tours/ubud-rice-terrace-waterfall-tour).",
        { image: "tegenungan-waterfall", caption: "Tegenungan Waterfall, south of Ubud." },
      ] },
      { id: "arts", heading: "Art, crafts and culture", blocks: [
        "Ubud has been home to painters, carvers and dancers for generations, and you can watch, learn or take a piece home.",
      ] },
      { id: "art-market", sub: true, heading: "10. Browse the Ubud Art Market", blocks: [
        "Across the road from Ubud Palace, stalls sell sarongs, woven baskets, wood carvings and paintings. Bargaining is expected, so smile, agree on a price you are happy with and enjoy it.",
      ] },
      { id: "batik-silver-painting", sub: true, heading: "11. Try batik, silver and Balinese painting", blocks: [
        "Watch how batik patterns are drawn in wax and dyed into the cloth, try silversmithing in a hands-on class, and see the painting styles Ubud is known for in a gallery. Our [Ubud Art Tour: Batik, Silver & Painting](/tours/ubud-art-batik-silver-class-tour) visits all three; the silver class is paid separately.",
        { image: "ubud-silver-class", caption: "A silver class in Ubud." },
      ] },
      { id: "dance", sub: true, heading: "12. Watch a traditional dance performance", blocks: [
        "Legong, Barong and Kecak dances are performed in the evenings at Ubud Palace and at temples around town, with gamelan music and elaborate costumes. Tickets are usually sold at the door or by sellers on the street during the day.",
        { image: "legong-ramayana-ubud", caption: "A Balinese dance performance in Ubud." },
      ] },
      { id: "cooking-class", sub: true, heading: "13. Learn to cook Balinese food", blocks: [
        "A cooking class is one of the most popular things to do in Ubud. Many begin with a visit to a local market for spices and vegetables, then teach dishes such as satay, curries and sambal.",
      ] },
      { id: "museums", sub: true, heading: "14. Visit an art museum", blocks: [
        "Ubud’s art museums, including Museum Puri Lukisan in the centre of town, show how Balinese painting has changed over the past century, from traditional stories to modern styles. A good choice for a rainy afternoon.",
      ] },
      { id: "adventure", heading: "Adventure around Ubud", blocks: [
        "The rivers and countryside around Ubud make it the base for Bali’s best-known outdoor activities.",
      ] },
      { id: "atv", sub: true, heading: "15. Ride an ATV through the countryside", blocks: [
        "Quad bike rides follow muddy trails through villages, rice fields and jungle. The [Ubud ATV, Rice Terrace & Waterfall Tour](/tours/ubud-atv-rice-terrace-waterfall-tour) combines a ride with rice terraces and a waterfall; the ATV ride is paid separately.",
      ] },
      { id: "rafting", sub: true, heading: "16. Go white water rafting", blocks: [
        "Rafting near Ubud, most often on the Ayung River, takes you down a green river valley past rice terraces and waterfalls. On the [Ubud ATV & Rafting Day Tour](/tours/ubud-atv-rafting-tour) you can do both in one day; rafting is paid separately to the operator.",
        { image: "ubud-rafting" },
      ] },
      { id: "kids", heading: "Things to do in Ubud with kids", blocks: [
        "Ubud is easy with children if you plan around short walks and animal encounters.",
      ] },
      { id: "safari-park", sub: true, heading: "17. Spend a day at Bali Safari & Marine Park", blocks: [
        "South-east of Ubud, this large park has animals from Indonesia, India and Africa. Our [Bali Safari & Marine Park Private Tour](/tours/bali-safari-marine-park-tour) takes your family there with your own driver, so you can explore at your children’s pace.",
      ] },
      { id: "bird-park", sub: true, heading: "18. Meet tropical birds and reptiles", blocks: [
        "Bali Bird Park and Bali Reptile Park are a good outing for younger children, and the [Bali Bird Park & Reptile Park Kids Tour](/tours/bali-bird-park-reptile-park-kids-tour) adds Bali Mini Zoo to the same day.",
      ] },
      { id: "slow-down", heading: "Slow down in Ubud", blocks: [
        "Leave room in your plans for the quieter side of Ubud.",
      ] },
      { id: "coffee", sub: true, heading: "19. Taste coffee at a coffee plantation", blocks: [
        "At the coffee plantations around Ubud you can see how Bali coffee is grown and roasted, including the island’s well-known Luwak coffee, and taste coffees and teas with a view of the jungle. A plantation stop is part of our [Ubud Rice Terraces & Waterfall Tour](/tours/ubud-rice-terrace-waterfall-tour) and [Ubud Monkey Forest & Tirta Empul Tour](/tours/ubud-monkey-forest-tirta-empul-tour).",
      ] },
      { id: "yoga-spa", sub: true, heading: "20. Book a yoga class or a Balinese massage", blocks: [
        "Ubud is known for yoga and wellness, and drop-in classes, spas and Balinese massage are easy to find across town. An evening massage is a good way to end a long day of walking.",
      ] },
      { id: "one-day", heading: "How to see Ubud in one day", blocks: [
        "Short on time? With a private driver you can see Ubud’s highlights in one day. Start early with the rice terraces, stop at a coffee plantation, bathe or watch the ritual at Tirta Empul, and finish at a waterfall. That is the plan of our [Ubud Rice Terraces & Waterfall Tour](/tours/ubud-rice-terrace-waterfall-tour). Prefer the monkeys? The [Ubud Monkey Forest & Tirta Empul Tour](/tours/ubud-monkey-forest-tirta-empul-tour) swaps the waterfall for the Sacred Monkey Forest.",
        "With two days, give one to the landscapes and temples and the other to art, adventure or the kids’ parks. Planning a whole week? Our [7-day Bali itinerary](/blog/bali-itinerary) shows how Ubud fits with Uluwatu and West Bali.",
        { tours: ["ubud-rice-terrace-waterfall-tour", "ubud-monkey-forest-tirta-empul-tour"] },
      ] },
      { id: "getting-around", heading: "How to get to Ubud and get around", blocks: [
        "Ubud is inland, north of the beach areas in the south. The town centre is walkable, though the pavements are narrow and the main roads are busy, while the rice terraces, temples and waterfalls are spread through the surrounding countryside and need a car.",
        "You do not need to stay in Ubud to see it. Every Shalom tour includes a private car and your own driver for 10 hours, with fuel and parking included, and your driver collects you at your hotel wherever you stay. Entrance tickets, activities and lunch are not included. To choose your own stops, [customize your itinerary](/#customizedtour).",
      ] },
      { id: "tips", heading: "Tips for visiting Ubud", blocks: [
        { list: [
          "Start early: the rice terraces, Tirta Empul and the Monkey Forest are calmer in the morning.",
          "Cover your shoulders and knees at temples and carry a sarong.",
          "Keep food, sunglasses and loose items in your bag around monkeys. If a monkey scratches or bites you, see a doctor the same day.",
          "Wear shoes with grip for waterfalls and temple steps.",
          "Carry cash in Indonesian rupiah for entrance tickets, markets and small warungs.",
          "Bring a light rain jacket in the wet season, roughly November to March.",
        ] },
      ] },
    ],
    faq: [
      { question: "Is Ubud worth visiting?", answer: "Yes. Ubud puts rice terraces, temples and traditional arts close together, and it feels very different from the beach areas in the south." },
      { question: "How many days do you need in Ubud?", answer: "One full day covers the main highlights with a driver. Two or three days let you add art, adventure or a slower day of walks, yoga and good food." },
      { question: "Can I visit Ubud as a day trip from the south of Bali?", answer: "Yes. Your driver collects you at your hotel in areas such as Seminyak, Kuta, Jimbaran or Nusa Dua, and our private tours last 10 hours from the agreed pickup time." },
      { question: "Is the Sacred Monkey Forest safe?", answer: "Yes, if you follow the rules: keep food and loose items out of sight, do not touch or feed the monkeys, and stay calm if one comes close. If a monkey scratches or bites you, see a doctor the same day." },
      { question: "What should I wear to temples in Ubud?", answer: "Cover your shoulders and knees, and wear a sarong where one is required. Bring a change of clothes if you want to join the purification at Tirta Empul." },
    ],
  },
  // Brief: seo-reports/brief-uluwatu-temple.md. No ticket prices or opening hours (they change); the Kecak or Jimbaran
  // dinner rule is the approved tour 599 copy. History follows the commonly told temple tradition.
  "uluwatu-temple": {
    published: true,
    date: "2026-11-02",
    title: "Uluwatu Temple Guide: Kecak & Sunset",
    metaDescription: "Visiting Uluwatu Temple in Bali: the clifftop views, the Kecak fire dance at sunset, the monkeys, the dress code, tickets and how to get there.",
    heading: "Uluwatu Temple: Your Guide to the Clifftop Temple, Kecak Dance & Monkeys",
    excerpt: "The clifftop views, the Kecak fire dance at sunset, the monkeys and the dress code, plus how to fit Uluwatu Temple into your day.",
    image: { src: "/images/uluwatu-cliff.webp", width: 900, height: 600, alt: "A monkey on a stone post above the sea cliffs at Uluwatu" },
    intro: [
      "Uluwatu Temple stands on the edge of a sea cliff at the southern tip of Bali, with the Indian Ocean crashing far below. It is one of the island’s most important temples and one of its most memorable sunset spots, with a Kecak fire dance in the evening and a troop of monkeys that is famous for stealing sunglasses.",
      "This guide covers what to see, the Kecak dance, the monkeys, what to wear and how to plan your visit. Uluwatu Temple is a stop on several of our [private South Kuta tours](/south-kuta).",
    ],
    sections: [
      { id: "why-famous", heading: "Why is Uluwatu Temple famous?", blocks: [
        "Uluwatu Temple, or Pura Luhur Uluwatu, is famous for its setting on a clifftop about 70 metres above the Indian Ocean, its sunset views and the Kecak fire dance performed beside it in the evening. It is also one of Bali’s six key temples, believed to protect the island, and is home to hundreds of long-tailed macaques.",
        { image: "uluwatu-temple-headland", caption: "Uluwatu Temple on its headland above the Indian Ocean." },
      ] },
      { id: "history", heading: "A short history of Pura Luhur Uluwatu", blocks: [
        "According to Balinese tradition, a temple has stood here since the 11th century, when the priest Mpu Kuturan is said to have founded it. In the 16th century the temple was expanded by Dang Hyang Nirartha, a priest from Java who shaped much of Balinese Hinduism, and tradition says this is where he reached moksha, the final release of the soul.",
        "Uluwatu is counted among the Sad Kahyangan, the six directional temples that are believed to guard Bali, and it watches over the south-west of the island. It is still a working temple, and you may see ceremonies with offerings, music and Balinese families dressed in white.",
      ] },
      { id: "what-to-see", heading: "What to see at Uluwatu Temple", blocks: [
        "The inner courtyard is reserved for worshippers, so a visit is mostly about the setting: the cliffs, the paths around them and the sea.",
      ] },
      { id: "cliff-walk", sub: true, heading: "The clifftop paths and viewpoints", blocks: [
        "Walled paths run along the cliff edge on both sides of the temple, with viewpoints over the ocean and back towards the temple on its headland. On a clear day the water below is a deep blue, and you can often watch surfers and big waves rolling in.",
        { image: "uluwatu-cliff-path" },
      ] },
      { id: "temple-gates", sub: true, heading: "The temple gates", blocks: [
        "Stone gates carved in the traditional Balinese style lead towards the temple at the top of the headland. Photograph them from the paths, and stay outside the parts of the temple marked for prayer.",
      ] },
      { id: "sunset", sub: true, heading: "Sunset over the Indian Ocean", blocks: [
        "Uluwatu faces west, so the sun sets over the open ocean in front of the cliffs. It is the most popular time to visit, so expect crowds on the paths in the late afternoon. Sunset depends on the weather, and on cloudy days the sky may not clear.",
        { image: "uluwatu-sunset-silhouette" },
      ] },
      { id: "kecak", heading: "The Kecak fire dance at Uluwatu Temple", blocks: [
        "The Kecak is performed in an open-air amphitheatre on the cliff next to the temple as the sun goes down. Instead of a gamelan orchestra, a large circle of men chant the rhythmic “cak-cak-cak” that gives the dance its name, while dancers act out a story from the Ramayana: the kidnapping of Sita and her rescue with the help of Hanuman, the white monkey. The show ends with fire.",
        { image: "kecak-fire", caption: "The fire scene that ends the Kecak dance." },
        "The Kecak has its own ticket, separate from the temple entrance, sold at the temple. Seats on the stone steps fill up, so arrive early if you want a good view, and bring water.",
        "On our [Uluwatu, Beach & Jimbaran Sunset Tour](/tours/uluwatu-beach-jimbaran-tour), the Kecak takes the place of the Jimbaran sunset dinner, because both happen at the same time of day. Tell our team which one you prefer when you reconfirm your order.",
      ] },
      { id: "monkeys", heading: "The Uluwatu Temple monkeys", blocks: [
        "Long-tailed macaques live in the forest around the temple and are known for grabbing sunglasses, hats, phones and even flip-flops, which they often hand back only in exchange for food. They are wild animals, so keep your distance and follow a few simple rules:",
        { list: [
          "Put sunglasses, hats, earrings and loose items in a closed bag before you walk in.",
          "Hold your phone firmly, with a strap if you have one.",
          "Do not feed, touch or tease the monkeys, and do not carry food in your hands.",
          "If a monkey takes something, ask the temple staff for help rather than chasing it.",
          "If a monkey scratches or bites you, see a doctor the same day.",
        ] },
      ] },
      { id: "dress-code", heading: "Uluwatu Temple dress code", blocks: [
        "Like every temple in Bali, Uluwatu asks visitors to cover their shoulders and knees. Sarongs and sashes are provided at the entrance for anyone who needs them. Balinese custom also asks women who are menstruating not to enter temple grounds.",
        "Wear comfortable shoes for the paths and steps, and bring sun protection: there is little shade along the cliffs.",
      ] },
      { id: "tickets", heading: "Uluwatu Temple tickets and opening times", blocks: [
        "You buy your entrance ticket at the temple gate, and the Kecak ticket separately at the temple. Prices and times change, so check them on the day or ask our team when you reconfirm your order. On our tours, entrance tickets are not included in the tour price.",
      ] },
      { id: "best-time", heading: "When is the best time to visit Uluwatu Temple?", blocks: [
        "Come in the late afternoon for the sunset and the Kecak, and expect it to be busy. If you prefer quiet paths and softer heat, visit earlier in the day. The dry season, roughly April to October, usually brings clearer skies for the sunset.",
      ] },
      { id: "getting-there", heading: "How to get to Uluwatu Temple", blocks: [
        "Uluwatu Temple is in Pecatu, at the south-western tip of the Bukit Peninsula in the far south of Bali. The roads towards it get busy in the late afternoon, when everyone heads there for the sunset, so leave plenty of time.",
        "The simplest way is with a driver who waits while you visit and takes you on to dinner or back to your hotel. Every Shalom tour includes a private car and your own driver for 10 hours, with fuel and parking included, and your driver collects you at your hotel.",
        { tours: ["uluwatu-beach-jimbaran-tour", "atv-uluwatu-jimbaran-sunset-tour", "family-watersport-uluwatu-tour"] },
      ] },
      { id: "combine", heading: "What to combine with Uluwatu Temple", blocks: [
        "Most visitors make Uluwatu the last stop of a day in the south. Spend the morning at a beach such as Pandawa, Tanah Barak or Melasti, try an ATV ride or watersports at Tanjung Benoa, and end the day with the sunset at the temple or a seafood dinner on Jimbaran Beach.",
        { image: "jimbaran-sunset-dinner", caption: "Dinner on the sand at Jimbaran Beach." },
        "Planning the rest of your trip? Our [7-day Bali itinerary](/blog/bali-itinerary) shows how a day in Uluwatu fits with Ubud and West Bali, and our guide to [things to do in Ubud](/blog/things-to-do-in-ubud) covers the island’s green centre.",
      ] },
    ],
    faq: [
      { question: "Is Uluwatu Temple worth visiting?", answer: "Yes. The clifftop setting, the sunset over the Indian Ocean and the Kecak dance make it one of the highlights of a trip to Bali, even though the inner temple is closed to visitors." },
      { question: "How long do you need at Uluwatu Temple?", answer: "Allow an hour or two to walk the cliff paths. If you stay for the Kecak dance, plan for most of the late afternoon and evening." },
      { question: "Can you go inside Uluwatu Temple?", answer: "The inner courtyard is reserved for people who come to pray. Visitors walk the grounds, the paths along the cliffs and the viewpoints around the temple." },
      { question: "Are the monkeys at Uluwatu Temple dangerous?", answer: "They are wild and quick to grab loose items, but you can visit safely if you keep belongings in a closed bag and do not feed or touch them. If a monkey scratches or bites you, see a doctor the same day." },
      { question: "Can I watch the Kecak dance and have dinner in Jimbaran on the same evening?", answer: "No. The Kecak performance at Uluwatu and the Jimbaran sunset dinner take place at the same time of day, so choose one when you reconfirm your order." },
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
