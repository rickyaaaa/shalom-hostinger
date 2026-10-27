import Image from "next/image";

/** Customized Itinerary photo, in the box of the image this replaced (640:498, 320px; 280px on phones). One image, no slider. */
export function CustomGallery() {
  return <div className="custom-gallery"><Image src="/images/custom-itinerary.webp" alt="Choosing your own itinerary" fill sizes="(max-width: 767px) 80vw, 320px" /></div>;
}
