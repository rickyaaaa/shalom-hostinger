// Static marketing copy transcribed from staging Elementor, 19 October 2026.
// Tour cards, prices and reviews are absent: those belong to WordPress APIs.
export const areas = {
  ubud: {name:"Ubud",label:"DISCOVER UBUD",heading:"Private Ubud Tour with Driver",image:"/images/ubud.webp",alt:"Green rice terraces in Ubud",description:"Explore Ubud with your own private driver on a flexible 10-hour day tour. Discover rice terraces, temples, waterfalls, traditional arts, and family-friendly destinations through our selected itineraries."},
  "south-kuta": {name:"South Kuta",label:"EXPLORE SOUTH KUTA",heading:"Ready for Your South Kuta Adventure?",image:"/images/south-kuta.webp",alt:"The coastal landscape of South Kuta",description:"Discover Uluwatu, beautiful beaches, watersports, ATV experiences, and sunset moments in Jimbaran. Choose one of our South Kuta itineraries or customize your own to suit your travel plans."},
  "west-bali": {name:"West Bali",label:"EXPLORE WEST BALI",heading:"Are You Ready To Explore West Bali ?",image:"/images/west-bali.jpeg",alt:"A Balinese temple beside the water",description:"Choose one of our West Bali itineraries or tell us the places you want to visit. We’ll help arrange a flexible, personalized itinerary with a comfortable private driver."},
};
export type AreaSlug = keyof typeof areas;
/**
 * Area page guide (approved Ubud SEO brief, 27 October 2026): search title and description, the itinerary
 * section heading, How It Works in the real order flow, and links to the other tour areas. Prices, itineraries
 * and the included / not-included terms are never copied here: they come from WordPress.
 */
export type AreaGuide = {
  title: string; metaDescription: string; heroCta: string;
  toursHeading: string; toursIntro: string; termsHeading: string; termsIntro: string;
  stepsHeading: string; steps: { title: string; text: string }[]; stepsNote: string; stepsCta: string;
  moreHeading: string; more: { title: string; text: string; href: string }[];
};
export const areaGuides: Partial<Record<AreaSlug, AreaGuide>> = {
  ubud: {
    title: "Private Ubud Tour with Driver",
    metaDescription: "Private Ubud day tours with your own driver: rice terraces, temples, waterfalls, art workshops and family days out. 10 hours, fuel and parking included.",
    heroCta: "See Ubud Tour Itineraries",
    toursHeading: "Choose Your Ubud Tour Itinerary",
    toursIntro: "Each Ubud tour is a 10-hour private day with your own driver. Choose the route that suits you, then pick your travel date and pickup time when you order.",
    termsHeading: "What’s Included in Your Private Ubud Tour",
    termsIntro: "Every Ubud itinerary uses the same tour terms:",
    stepsHeading: "How Your Ubud Day Tour Works",
    // The real order flow: Order Now → sign in when needed → travel details → order and WhatsApp. The date rule is the
    // order form's own TRAVEL_DATE_NOTE, added where the steps render.
    steps: [
      { title: "Choose an Ubud itinerary", text: "Pick one of the Ubud tours above and select Order Now." },
      { title: "Sign in or create an account", text: "If you are not signed in yet, log in or create an account to continue your order." },
      { title: "Enter your travel details", text: "Choose your travel date and pickup time, and tell us your hotel or pickup place." },
      { title: "Submit and reconfirm on WhatsApp", text: "Send your order, then reconfirm your itinerary and pickup details with our team on WhatsApp." },
    ],
    stepsNote: "Your tour lasts 10 hours from the agreed pickup time. Extra time is charged as listed in the tour terms.",
    stepsCta: "Choose Your Ubud Itinerary",
    moreHeading: "Plan Another Day in Bali",
    more: [
      { title: "Uluwatu & South Kuta", text: "Clifftop temple views, beaches and Jimbaran sunsets.", href: "/south-kuta" },
      { title: "West Bali", text: "Temples, trekking and relaxing routes beyond Bali’s busiest areas.", href: "/west-bali" },
      { title: "Customized Itinerary", text: "Tell us the places you would like to visit and we will help arrange your route.", href: "/#customizedtour" },
    ],
  },
};
/** The official TikTok profile (client-confirmed). An external link, never a site route. */
export const tiktokProfile = "https://www.tiktok.com/@shalombalitour";
export const benefits = [
  {title:"Private Driver",text:"Travel comfortably with a dedicated driver throughout your Bali itinerary.",image:"7-24-1-AQVLJK4TH3.png"},
  {title:"Flexible Itinerary",text:"Follow one of our recommended routes or adjust your journey based on your travel plans.",image:"7-19-1-AQVLJK4TH3.png"},
  {title:"Comfortable Journey",text:"Enjoy private transportation with fuel and parking included during your itinerary.",image:"7-18-1-AQVLJK4TH3.png"},
  {title:"Local Bali Experience",text:"Explore Bali's beaches, temples, waterfalls, rice terraces, cultural attractions, and local destinations at your own pace.",image:"7-20-1-AQVLJK4TH3.png"},
];
/** The three ordering steps on Home; the list numbers them. */
export const howItWorks = [
  {title:"Choose Your Itinerary",text:"Explore our Ubud, Uluwatu & South Kuta, West Bali, or Customized Itinerary options."},
  {title:"Select Your Travel Details",text:"Choose your travel date, pickup time, and provide the name of your hotel or resort."},
  {title:"Confirm With Shalom Bali Tour",text:"Submit your order and continue to WhatsApp to reconfirm your itinerary and pickup details directly with our team."},
];
/**
 * Client-approved FAQ copy. Paragraphs are separated by a blank line. The included / not included answer has no
 * copy here: it renders WordPress's canonical NB terms (the same list the WhatsApp reconfirmation uses).
 */
export type Faq = { question: string; answer: string } | { question: string; terms: true };
export const faqs: Faq[] = [
  { question: "How do I order a Bali tour?", answer: "You can sign up, then select your preferred itinerary, specify the pickup date and time, and provide the name of the hotel or resort where you are staying." },
  { question: "The itinerary I wanted isn't here", answer: "No need to worry, we provide option for this, you can choose the Customized Itinerary section." },
  { question: "What is included and not included in the itinerary?", terms: true },
  { question: "How long is the tour and can I take a short tour?", answer: "The trip duration is 10 hours, calculated from the agreed-upon pickup time. If the duration exceeds 10 hours, an additional charge will apply. We exclusively offer 10-hour daily tour services, as we specialize in private, 10-hour day tours." },
  { question: "What happens if I need to cancel?", answer: "If you wish to cancel, please provide notification as soon as possible.\n\nOnce an agreement has been reached, cancellations are no longer permitted, and you remain obligated to pay the full, agreed-upon amount.\n\nThis policy includes full payment for any booked activities, and the timeframe for the engagement is calculated from the moment the agreement is made.\n\nThank you." },
];
