import type { AreaSlug } from "./marketing";

/**
 * Public tour detail pages (/tours/<slug>): the URL, search copy and on-page story live here, in code, like the area
 * guides in marketing.ts. Title, prices, duration, photo, rating, reviews and the included / not-included terms come
 * live from WordPress (getTour), and Order Now is the existing /book/<id> flow. WordPress slugs are not used.
 * indexable: true puts a page in the sitemap and lets search engines index it; false keeps it linked from its card
 * but noindex and out of the sitemap.
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
    indexable: true,
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
  // Live, owner review pending (all tours below): written from the WordPress destinations and terms (activities, tickets
  // and meals are paid separately) and public facts about each place. No times, prices, age limits or activity details.
  "atv-uluwatu-jimbaran-sunset-tour": {
    tourId: 611,
    area: "south-kuta",
    indexable: true,
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
    indexable: true,
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
    indexable: true,
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
    indexable: true,
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
    indexable: true,
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
  "ubud-rice-terrace-waterfall-tour": {
    tourId: 523,
    area: "ubud",
    indexable: true,
    title: "Ubud Rice Terraces & Waterfall Tour",
    metaDescription: "Private Ubud day tour with your own driver: rice terraces, a Luwak coffee plantation, Tirta Empul holy spring temple and Kanto Lampo Waterfall.",
    heading: "Ubud Rice Terrace, Tirta Empul & Kanto Lampo Waterfall Private Tour",
    intro: [
      "See the Ubud highlights in one private day. Walk among green rice terraces, visit a coffee plantation, step into the holy spring water temple of Tirta Empul, and cool off at Kanto Lampo Waterfall, where the water cascades over stepped rocks.",
      "Your own driver takes you between every stop, so you set the pace. Choose your pickup time when you order, and agree the plan for the day with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "Ubud rice terraces, with time to walk the paths and take photos",
      "A coffee plantation visit, with a look at how Bali coffee and Luwak coffee are made",
      "Tirta Empul, the holy spring water temple",
      "Kanto Lampo Waterfall",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "Rice terraces", text: "Walk the paths between the green terraces and take in the views over the valley." },
      { title: "Coffee plantation", text: "See how Bali coffee is grown and roasted, including the island’s well-known Luwak coffee." },
      { title: "Tirta Empul", text: "Walk through the temple courtyards to the spring-fed pools where Balinese come to purify themselves. Shoulders and knees need to be covered." },
      { title: "Kanto Lampo Waterfall", text: "Cool off at the waterfall as it tumbles over stepped rocks. The path can be slippery, so wear shoes with grip." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Are entrance tickets part of the tour price?", answer: "No. Entrance tickets, activities and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "What should I wear at Tirta Empul?", answer: "Shoulders and knees need to be covered at the temple. If you would like to join the water purification, bring a change of clothes and a towel." },
      { question: "Is lunch included?", answer: "No. Lunch is paid separately. Our team can recommend a place to eat, or you can choose where you would like to stop." },
      { question: "Can we change the order of the stops?", answer: "Yes. The order of the stops is flexible and agreed with our team when you reconfirm on WhatsApp." },
    ],
  },
  "ubud-monkey-forest-tirta-empul-tour": {
    tourId: 566,
    area: "ubud",
    indexable: true,
    title: "Ubud Monkey Forest & Tirta Empul Tour",
    metaDescription: "Private Ubud day tour with your own driver: the Sacred Monkey Forest, a Luwak coffee plantation, Tirta Empul holy spring temple and Ubud rice terraces.",
    heading: "Ubud Monkey Forest, Tirta Empul & Rice Terrace Private Tour",
    intro: [
      "A classic Ubud day at your own pace. Meet the long-tailed macaques in Ubud’s Sacred Monkey Forest, visit a coffee plantation, step into the holy spring pools of Tirta Empul, and finish among the green rice terraces.",
      "Your own driver takes you between every stop, so there is no group to keep up with. Choose your pickup time when you order, and agree the plan for the day with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "The Sacred Monkey Forest in Ubud",
      "A coffee plantation visit, with a look at how Bali coffee and Luwak coffee are made",
      "Tirta Empul, the holy spring water temple",
      "Ubud rice terraces",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "Sacred Monkey Forest", text: "Walk the forest paths and old temples among the resident monkeys. Keep food, sunglasses and loose items in your bag." },
      { title: "Coffee plantation", text: "See how Bali coffee is grown and roasted, including the island’s well-known Luwak coffee." },
      { title: "Tirta Empul", text: "Walk through the temple courtyards to the spring-fed pools where Balinese come to purify themselves. Shoulders and knees need to be covered." },
      { title: "Rice terraces", text: "End among the green terraces, with time to walk the paths and take photos." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Are entrance tickets part of the tour price?", answer: "No. Entrance tickets, activities and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "Are the monkeys safe to be around?", answer: "They are wild animals. Keep food and loose items out of sight, do not touch or feed them, and follow the instructions of the forest staff." },
      { question: "What should I wear at Tirta Empul?", answer: "Shoulders and knees need to be covered at the temple. If you would like to join the water purification, bring a change of clothes and a towel." },
      { question: "Is lunch included?", answer: "No. Lunch is paid separately. Our team can recommend a place to eat, or you can choose where you would like to stop." },
    ],
  },
  "ubud-art-batik-silver-class-tour": {
    tourId: 571,
    area: "ubud",
    indexable: true,
    title: "Ubud Art Tour: Batik, Silver & Painting",
    metaDescription: "Private Ubud art day with your own driver: see how batik is made, try silversmithing in a silver class and browse Balinese paintings at an art gallery.",
    heading: "Ubud Art Tour with Batik, Silver Class & Painting Gallery",
    intro: [
      "Spend a creative day in Ubud, the home of Balinese arts. Learn how batik cloth is made, try your hand at silversmithing in a silver class, and browse Balinese paintings at an art gallery.",
      "Your own driver takes you between the workshops, so you can stay as long as you like at each one. Choose your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "Batik: see how the wax-and-dye cloth is made",
      "A silver class to try silversmithing yourself",
      "A painting art gallery with Balinese works",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "Batik", text: "Watch how patterns are drawn in wax and dyed into the cloth, layer by layer." },
      { title: "Silver class", text: "Try silversmithing in a hands-on class. The class is paid separately; tell our team you want it when you reconfirm on WhatsApp." },
      { title: "Painting art gallery", text: "Browse Balinese paintings and see the styles Ubud is known for." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Are the batik and silver classes part of the tour price?", answer: "No. Classes, entrance tickets and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "Is lunch included?", answer: "No. Lunch is paid separately. Our team can recommend a place to eat, or you can choose where you would like to stop." },
      { question: "Can we change the order of the stops?", answer: "Yes. The order of the stops is flexible and agreed with our team when you reconfirm on WhatsApp." },
    ],
  },
  "ubud-atv-rice-terrace-waterfall-tour": {
    tourId: 580,
    area: "ubud",
    indexable: true,
    title: "Ubud ATV, Rice Terrace & Waterfall Tour",
    metaDescription: "Private Ubud day with your own driver: an ATV quad bike ride through the countryside, Ubud rice terraces and a waterfall stop to cool off afterwards.",
    heading: "Ubud ATV Ride, Rice Terrace & Waterfall Private Tour",
    intro: [
      "Adventure and scenery in one private day. Ride an ATV quad bike through the countryside around Ubud, then slow down among green rice terraces and cool off at a waterfall.",
      "Your own driver takes you between every stop. Choose your pickup time when you order, and agree the plan for the day with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "An ATV quad bike ride through the countryside",
      "Ubud rice terraces",
      "A waterfall stop to cool off",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "ATV ride", text: "Ride a quad bike along countryside trails. The ATV ride is paid separately; tell our team you want it when you reconfirm on WhatsApp." },
      { title: "Rice terraces", text: "Walk the paths between the green terraces and take in the views." },
      { title: "Waterfall", text: "Cool off at the waterfall. The path can be slippery, so wear shoes with grip." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Is the ATV ride part of the tour price?", answer: "No. The ATV ride, entrance tickets and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "What should I bring?", answer: "Wear clothes and shoes you do not mind getting dirty on the ATV, and bring a change of clothes and a towel." },
      { question: "Is lunch included?", answer: "No. Lunch is paid separately. Our team can recommend a place to eat, or you can choose where you would like to stop." },
    ],
  },
  "ubud-atv-rafting-tour": {
    tourId: 586,
    area: "ubud",
    indexable: true,
    title: "Ubud ATV & Rafting Day Tour",
    metaDescription: "Private Ubud adventure day with your own driver: an ATV quad bike ride, a river rafting trip near Ubud and time among the green Ubud rice terraces.",
    heading: "Ubud ATV Ride, River Rafting & Rice Terrace Private Tour",
    intro: [
      "Two of Ubud’s favourite adventures in one private day. Ride an ATV quad bike through the countryside, paddle down the river on a rafting trip, and take a break among the green rice terraces.",
      "Your own driver handles every transfer, so you only have to choose your activities. Pick your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "An ATV quad bike ride through the countryside",
      "A river rafting trip",
      "Ubud rice terraces",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "ATV ride", text: "Ride a quad bike along countryside trails. The ATV ride is paid separately; tell our team you want it when you reconfirm on WhatsApp." },
      { title: "River rafting", text: "Paddle down the river through the green valley. Rafting is paid separately to the operator." },
      { title: "Rice terraces", text: "Slow down among the green terraces and take in the views." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Are the ATV ride and rafting part of the tour price?", answer: "No. The ATV ride, rafting, entrance tickets and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "What should I bring?", answer: "Bring swimwear, a towel, a change of clothes and shoes that can get wet. Wear clothes you do not mind getting dirty on the ATV." },
      { question: "Is there an age limit for ATV and rafting?", answer: "Each ATV and rafting operator sets its own age and safety rules. Tell our team who is travelling when you reconfirm on WhatsApp." },
      { question: "Is lunch included?", answer: "No. Lunch is paid separately. Our team can recommend a place to eat, or you can choose where you would like to stop." },
    ],
  },
  "bali-safari-marine-park-tour": {
    tourId: 591,
    area: "ubud",
    indexable: true,
    title: "Bali Safari & Marine Park Private Tour",
    metaDescription: "Private family day trip from your hotel to Bali Safari & Marine Park with your own driver. Park tickets and activities are paid separately to the park.",
    heading: "Bali Safari & Marine Park Day Trip for Families",
    intro: [
      "A day out for the whole family at Bali Safari & Marine Park. See animals from Indonesia, India and Africa, then explore the rest of the park at your children’s pace.",
      "Your own driver takes your family to the park and back to your hotel, so there are no transfers to arrange. Choose your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "A day at Bali Safari & Marine Park",
      "Animals from Indonesia, India and Africa",
      "Time to explore at your children’s pace",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects your family at your hotel at the pickup time you choose when you order." },
      { title: "Bali Safari & Marine Park", text: "Spend the day at the park. Tickets and extra activities are paid separately; tell our team what your family would like to do when you reconfirm on WhatsApp." },
      { title: "Return to your hotel", text: "Your driver takes your family back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Are park tickets part of the tour price?", answer: "No. Park tickets, activities and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "Is the park suitable for young children?", answer: "Bali Safari & Marine Park is a popular family day out. Tell our team your children’s ages when you reconfirm on WhatsApp so the day can be planned around them." },
      { question: "Is lunch included?", answer: "No. Lunch is paid separately." },
    ],
  },
  "bali-bird-park-reptile-park-kids-tour": {
    tourId: 592,
    area: "ubud",
    indexable: true,
    title: "Bali Bird Park & Reptile Park Kids Tour",
    metaDescription: "Private family day with your own driver: Bali Bird Park, Bali Reptile Park and Bali Mini Zoo, at a relaxed pace that suits children. Tickets are extra.",
    heading: "Bali Bird Park, Reptile Park & Mini Zoo Family Day Tour",
    intro: [
      "An easy, animal-filled day out for families. See colourful tropical birds at Bali Bird Park, meet lizards, snakes and other reptiles at Bali Reptile Park, and visit the animals at Bali Mini Zoo.",
      "Your own driver takes your family between the parks, so the children can rest in the car. Choose your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "Bali Bird Park and its tropical birds",
      "Bali Reptile Park",
      "Bali Mini Zoo",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects your family at your hotel at the pickup time you choose when you order." },
      { title: "Bali Bird Park", text: "Walk among tropical birds from Bali, Indonesia and beyond." },
      { title: "Bali Reptile Park", text: "Meet lizards, snakes and other reptiles up close." },
      { title: "Bali Mini Zoo", text: "Finish with the animals at Bali Mini Zoo." },
      { title: "Return to your hotel", text: "Your driver takes your family back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Are park tickets part of the tour price?", answer: "No. Park tickets, activities and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "Is this tour suitable for young children?", answer: "It is planned as a family day. Tell our team your children’s ages when you reconfirm on WhatsApp so the day can be planned around them." },
      { question: "Is lunch included?", answer: "No. Lunch is paid separately." },
    ],
  },
  "ulun-danu-taman-ayun-tanah-lot-tour": {
    tourId: 633,
    area: "west-bali",
    indexable: true,
    title: "Ulun Danu, Taman Ayun & Tanah Lot Tour",
    metaDescription: "Private West Bali & North Bali temple tour with your own driver: Ulun Danu Beratan on the lake in Bedugul, Taman Ayun royal temple and Tanah Lot sea temple.",
    heading: "West Bali & North Bali Temple Tour: Ulun Danu Beratan, Taman Ayun & Tanah Lot",
    intro: [
      "Visit three landmark temples of West Bali and North Bali in one private day. Start in the cool highlands of Bedugul at Ulun Danu Beratan, on the edge of Lake Beratan, continue to the royal temple gardens of Taman Ayun, and end at Tanah Lot, the sea temple on a rock offshore.",
      "Your own driver handles the long drive between the highlands and the coast, with a lunch stop for pork ribs on the way. Choose your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "Ulun Danu Beratan Temple on Lake Beratan, Bedugul",
      "Taman Ayun, the royal temple of Mengwi",
      "A lunch stop for pork ribs",
      "Tanah Lot, the sea temple on a rock",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "Ulun Danu Beratan", text: "Walk the lakeside temple grounds in the cool mountain air of Bedugul. Bring a light jacket, as the highlands are cooler than the coast." },
      { title: "Taman Ayun", text: "Stroll the gardens and moat of the royal family temple of the old Mengwi kingdom, part of Bali’s UNESCO-listed subak landscape." },
      { title: "Lunch stop", text: "Stop for pork ribs. Lunch is paid separately." },
      { title: "Tanah Lot", text: "See the temple on its rock in the sea, one of Bali’s most recognisable sights." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Are entrance tickets part of the tour price?", answer: "No. Entrance tickets, activities and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "What should I wear?", answer: "Shoulders and knees need to be covered at the temples, and a light jacket helps in the Bedugul highlands." },
      { question: "Will we be at Tanah Lot for the sunset?", answer: "Tanah Lot is popular at sunset, but the timing depends on your pickup time and the weather. Agree the plan with our team when you reconfirm on WhatsApp." },
    ],
  },
  "jatiluwih-taman-ayun-tanah-lot-tour": {
    tourId: 644,
    area: "west-bali",
    indexable: true,
    title: "Jatiluwih, Taman Ayun & Tanah Lot Tour",
    metaDescription: "Private West Bali & North Bali day with your own driver: walk the Jatiluwih rice terraces, visit Taman Ayun royal temple and see Tanah Lot sea temple.",
    heading: "West Bali & North Bali Trekking Tour: Jatiluwih Rice Terraces & Tanah Lot",
    intro: [
      "Swap the beach for wide green views. Walk among the Jatiluwih rice terraces, part of Bali’s UNESCO World Heritage subak landscape, visit the royal temple gardens of Taman Ayun, and end at Tanah Lot, the sea temple on a rock offshore.",
      "Your own driver handles the drive between the hills and the coast, with a lunch stop for pork ribs on the way. Agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "A walk through the Jatiluwih rice terraces",
      "Taman Ayun, the royal temple of Mengwi",
      "A lunch stop for pork ribs",
      "Tanah Lot, the sea temple on a rock",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel. Check the start time shown on this page and confirm your pickup with our team when you reconfirm on WhatsApp." },
      { title: "Jatiluwih rice terraces", text: "Walk the paths through the terraces at your own pace and see the subak water channels that feed them." },
      { title: "Taman Ayun", text: "Stroll the gardens and moat of the royal family temple of the old Mengwi kingdom." },
      { title: "Lunch stop", text: "Stop for pork ribs. Lunch is paid separately." },
      { title: "Tanah Lot", text: "See the temple on its rock in the sea, one of Bali’s most recognisable sights." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Are entrance tickets part of the tour price?", answer: "No. Entrance tickets, activities and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "How much walking is there at Jatiluwih?", answer: "You choose how far to walk along the paths through the rice terraces. Wear comfortable shoes and bring sun protection." },
      { question: "Will we be at Tanah Lot for the sunset?", answer: "Tanah Lot is popular at sunset, but the timing depends on the day’s plan and the weather. Agree the plan with our team when you reconfirm on WhatsApp." },
    ],
  },
  "beji-purification-tanah-lot-tour": {
    tourId: 651,
    area: "west-bali",
    indexable: true,
    title: "Beji Purification & Tanah Lot Tour",
    metaDescription: "Private West Bali day with your own driver: a water purification ritual at Beji Purification Temple, Taman Ayun royal temple and Tanah Lot sea temple.",
    heading: "West Bali Healing Tour: Beji Purification Temple & Tanah Lot",
    intro: [
      "A calmer, more spiritual day in West Bali. Take part in melukat, the traditional Balinese water purification ritual, at Beji Purification Temple, then visit the royal temple gardens of Taman Ayun and end at Tanah Lot, the sea temple on a rock offshore.",
      "Your own driver takes you between every stop, with a lunch stop for pork ribs on the way. Choose your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "Melukat, the Balinese water purification ritual, at Beji Purification Temple",
      "Taman Ayun, the royal temple of Mengwi",
      "A lunch stop for pork ribs",
      "Tanah Lot, the sea temple on a rock",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "Beji Purification Temple", text: "Join the melukat ritual, in which you pray and bathe under the temple’s spring water spouts as a symbol of cleansing." },
      { title: "Taman Ayun", text: "Stroll the gardens and moat of the royal family temple of the old Mengwi kingdom." },
      { title: "Lunch stop", text: "Stop for pork ribs. Lunch is paid separately." },
      { title: "Tanah Lot", text: "See the temple on its rock in the sea, one of Bali’s most recognisable sights." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Is the purification ritual part of the tour price?", answer: "No. Temple and ritual fees, entrance tickets and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "What should I bring for the purification?", answer: "Bring a change of clothes and a towel, as you will get wet. Shoulders and knees need to be covered at the temples." },
      { question: "Will we be at Tanah Lot for the sunset?", answer: "Tanah Lot is popular at sunset, but the timing depends on your pickup time and the weather. Agree the plan with our team when you reconfirm on WhatsApp." },
    ],
  },
  "taman-ayun-tanah-lot-tour": {
    tourId: 655,
    area: "west-bali",
    indexable: true,
    title: "Taman Ayun & Tanah Lot Relaxing Tour",
    metaDescription: "A relaxed private West Bali day with your own driver: Taman Ayun royal temple gardens, a pork ribs lunch stop and Tanah Lot sea temple on the coast.",
    heading: "West Bali Relaxing Tour: Taman Ayun Temple & Tanah Lot",
    intro: [
      "The easy-going way to see West Bali. With two temple stops and lunch, there is time to stroll the royal gardens of Taman Ayun and to linger at Tanah Lot, the sea temple on a rock offshore.",
      "Your own driver takes you between every stop. Choose your pickup time when you order, and agree the plan with our team when you reconfirm on WhatsApp.",
    ],
    highlights: [
      "Taman Ayun, the royal temple of Mengwi",
      "A lunch stop for pork ribs",
      "Tanah Lot, the sea temple on a rock",
      "A slower pace with fewer stops",
      "A private car and driver for the whole day",
    ],
    itinerary: [
      { title: "Hotel pickup", text: "Your driver collects you at your hotel at the pickup time you choose when you order." },
      { title: "Taman Ayun", text: "Stroll the gardens and moat of the royal family temple of the old Mengwi kingdom, part of Bali’s UNESCO-listed subak landscape." },
      { title: "Lunch stop", text: "Stop for pork ribs. Lunch is paid separately." },
      { title: "Tanah Lot", text: "Take your time at the temple on its rock in the sea, one of Bali’s most recognisable sights." },
      { title: "Return to your hotel", text: "Your driver takes you back to your hotel at the end of the day." },
    ],
    faq: [
      { question: "Are entrance tickets part of the tour price?", answer: "No. Entrance tickets, activities and meals are paid separately. See the included and not-included list on this page for the full tour terms." },
      { question: "Who is this tour for?", answer: "Travellers who want an unhurried day with fewer stops, such as families with young children or anyone who would rather not spend long in the car." },
      { question: "Will we be at Tanah Lot for the sunset?", answer: "Tanah Lot is popular at sunset, but the timing depends on your pickup time and the weather. Agree the plan with our team when you reconfirm on WhatsApp." },
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
