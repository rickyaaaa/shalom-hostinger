// Static marketing copy transcribed from staging Elementor, 19 October 2026.
// Tour cards, prices and reviews are absent: those belong to WordPress APIs.
export const areas = {
  ubud: {name:"Ubud",label:"DISCOVER UBUD",heading:"Are You Ready To Explore UBUD ?",image:"/images/ubud.webp",alt:"Green rice terraces in Ubud",description:"Explore rice terraces, temples, waterfalls, local art, and family-friendly attractions with a flexible private itinerary. Choose your favorite Ubud itinerary or create one that matches your travel style."},
  "south-kuta": {name:"South Kuta",label:"EXPLORE SOUTH KUTA",heading:"Ready for Your South Kuta Adventure?",image:"/images/south-kuta.webp",alt:"The coastal landscape of South Kuta",description:"Discover Uluwatu, beautiful beaches, watersports, ATV experiences, and sunset moments in Jimbaran. Choose one of our South Kuta itineraries or customize your own to suit your travel plans."},
  "west-bali": {name:"West Bali",label:"EXPLORE WEST BALI",heading:"Are You Ready To Explore West Bali ?",image:"/images/west-bali.jpeg",alt:"A Balinese temple beside the water",description:"Choose one of our West Bali itineraries or tell us the places you want to visit. We’ll help arrange a flexible, personalized itinerary with a comfortable private driver."},
};
export type AreaSlug = keyof typeof areas;
/** The official TikTok profile (client-confirmed). An external link, never a site route. */
export const tiktokProfile = "https://www.tiktok.com/@shalombalitour";
export const benefits = [
  {title:"Private Driver",text:"Travel comfortably with a dedicated driver throughout your Bali itinerary.",image:"7-24-1-AQVLJK4TH3.png"},
  {title:"Flexible Itinerary",text:"Follow one of our recommended routes or request your own mix of destinations.",image:"7-19-1-AQVLJK4TH3.png"},
  {title:"Comfortable Journey",text:"Enjoy private transportation with fuel and parking included in every itinerary.",image:"7-18-1-AQVLJK4TH3.png"},
  {title:"Local Bali Experience",text:"Explore beaches, temples, waterfalls, rice terraces, and local attractions at your own pace.",image:"7-20-1-AQVLJK4TH3.png"},
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
