import { PhotoSlider } from "./PhotoSlider";

// Existing Shalom Bali Tour images from the client's WordPress uploads (see the .json notes beside each file).
const slides = [
  { src: "/images/custom-itinerary.webp", alt: "Choosing your own itinerary" },
  { src: "/images/south-kuta.webp", alt: "Uluwatu Temple on the clifftop above the Indian Ocean in South Kuta" },
  { src: "/images/ubud.webp", alt: "A traveler on a jungle swing above green rice terraces in Ubud" },
  { src: "/images/west-bali.jpeg", alt: "Pura Ulun Danu Beratan temple on Lake Beratan" },
];

/** Customized Itinerary photos, in the box of the image this replaced (640:498, 320px; 280px on phones). */
export function CustomGallery() {
  return <PhotoSlider slides={slides} label="Itinerary photos" sizes="(max-width: 767px) 80vw, 320px" className="custom-gallery" />;
}
