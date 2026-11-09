/**
 * Guest photos sent by the client on 2026-11-09 (public/images/guests, WebP up to 1200px). Each file has a .json note
 * with its source and size, and its EXIF description matches the alt text here. Alt text describes only what the photo
 * shows: no guest names, nationalities, vehicle models or places the photo does not make clear.
 * `focus` keeps faces in frame where the square gallery tile crops a portrait photo.
 */
export type GuestPhoto = { src: string; width: number; height: number; alt: string; focus?: string };

export const guestPhotos = {
  "family-bali-airport-pickup": { src: "/images/guests/family-bali-airport-pickup.webp", width: 1156, height: 867, alt: "A family with their Shalom Bali Tour driver outside the terminal at Bali airport" },
  "family-lunch-with-driver": { src: "/images/guests/family-lunch-with-driver.webp", width: 1080, height: 810, alt: "A family and their Shalom Bali Tour driver at a restaurant table during a lunch stop" },
  "guests-atv-ride-transfer": { src: "/images/guests/guests-atv-ride-transfer.webp", width: 905, height: 1200, alt: "Guests in helmets and rubber boots riding in a covered truck on the way to an ATV ride" },
  "group-watersport-boat-trip": { src: "/images/guests/group-watersport-boat-trip.webp", width: 1200, height: 935, alt: "A group of guests in life jackets on a speedboat during a watersport trip" },
  "guests-hotel-evening-farewell": { src: "/images/guests/guests-hotel-evening-farewell.webp", width: 900, height: 1200, alt: "Five guests with their Shalom Bali Tour driver in a hotel lobby in the evening", focus: "center 30%" },
  "family-with-driver-thatched-pavilion": { src: "/images/guests/family-with-driver-thatched-pavilion.webp", width: 720, height: 960, alt: "A mother, her son and two men smiling under a thatched-roof pavilion surrounded by banana trees" },
  "guests-car-selfie-with-driver": { src: "/images/guests/guests-car-selfie-with-driver.webp", width: 1080, height: 810, alt: "A smiling driver taking a selfie with two guests inside the car" },
  "guests-atv-base-camp": { src: "/images/guests/guests-atv-base-camp.webp", width: 1200, height: 900, alt: "Guests in rubber boots waiting with their Shalom Bali Tour driver at a base camp before an ATV ride" },
  "guests-bali-airport-driver": { src: "/images/guests/guests-bali-airport-driver.webp", width: 674, height: 1200, alt: "Two guests with their Shalom Bali Tour driver under the glass canopy at Bali airport" },
  "group-break-local-shop": { src: "/images/guests/group-break-local-shop.webp", width: 1200, height: 898, alt: "A group of guests relaxing on carved wooden benches at a local shop during their day out" },
  "guests-villa-sketch-souvenir": { src: "/images/guests/guests-villa-sketch-souvenir.webp", width: 960, height: 720, alt: "Four guests at a villa table, one holding a hand-drawn sketch from their trip" },
  "guests-selfie-cafe": { src: "/images/guests/guests-selfie-cafe.webp", width: 540, height: 960, alt: "Two guests pulling funny faces for a selfie at a cafe" },
} as const satisfies Record<string, GuestPhoto>;

export type GuestPhotoKey = keyof typeof guestPhotos;

/** Home, "What Our Guests Say": every guest photo, strongest first. */
export const homeGuestPhotos = Object.keys(guestPhotos) as GuestPhotoKey[];

/** Hire a Driver: the photos of the car, the pickup and a day out with the driver. */
export const driverHireGuestPhotos: readonly GuestPhotoKey[] = ["family-bali-airport-pickup", "guests-car-selfie-with-driver", "family-lunch-with-driver", "guests-bali-airport-driver"];
