import Image from "next/image";
import { guestPhotos, type GuestPhoto, type GuestPhotoKey } from "@/lib/guest-photos";

/** Square tiles of client guest photos, below the fold, so every image loads lazily. */
export function GuestGallery({ photos, label, sizes }: { photos: readonly GuestPhotoKey[]; label: string; sizes: string }) {
  return <ul className="guest-gallery" aria-label={label}>{photos.map(key => {
    const photo: GuestPhoto = guestPhotos[key];
    return <li key={key}><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={sizes} quality={60} style={photo.focus ? { objectPosition: photo.focus } : undefined} /></li>;
  })}</ul>;
}
