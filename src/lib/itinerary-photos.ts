import { itineraryTitle } from "./format";
import type { Tour } from "./types";
import type { Slide } from "@/components/PhotoSlider";

/**
 * Photos for the "Why Choose" slider, from the itineraries' own card images in WordPress. Areas take turns
 * (West Bali, Ubud, South Kuta, …) so one area never fills the slider; itineraries without a photo are skipped.
 */
export function pickItineraryPhotos(tours: Tour[], count = 8): Slide[] {
  const queues = ["west-bali", "ubud", "south-kuta"].map(area => tours.filter(tour => tour.area?.slug === area && tour.card_image));
  const picked: Tour[] = [];
  for (let round = 0; picked.length < count && queues.some(queue => queue.length > round); round++) {
    for (const queue of queues) if (queue[round] && picked.length < count) picked.push(queue[round]);
  }
  return picked.map(tour => ({ src: tour.card_image!.url, alt: tour.card_image!.alt.trim() || `Photo from the ${itineraryTitle(tour.title)}` }));
}
