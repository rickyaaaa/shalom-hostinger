"use client";
import { useEffect, useRef, useState } from "react";
import type { ReviewPhoto } from "@/lib/types";
import { Icon } from "./Icon";

/**
 * Guest photos on a review (client 2026-11-14: like product-review photos): square thumbnails that open a full-size
 * viewer with previous/next. Plain <img>: WordPress already serves small thumbnails, and img-src allows its origin.
 */
export function ReviewPhotos({ photos, label, className = "" }: { photos?: ReviewPhoto[]; label: string; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open !== null && !element.open) element.showModal();
    if (open === null && element.open) element.close();
  }, [open]);
  if (!photos?.length) return null;
  const count = photos.length;
  const current = open === null ? null : photos[open];
  const step = (by: number) => setOpen(index => index === null ? index : (index + by + count) % count);
  return <>
    <ul className={`review-photos ${className}`.trim()} aria-label={label}>
      {photos.map((photo, index) => <li key={photo.id}><button type="button" aria-label={`Open photo ${index + 1} of ${count}`} onClick={event => { opener.current = event.currentTarget; setOpen(index); }}><img src={photo.thumb} alt="" width={72} height={72} loading="lazy" decoding="async" /></button></li>)}
    </ul>
    {/* Touches stay inside the viewer, so swiping a photo never changes the review behind it. */}
    <dialog ref={dialog} className="review-photo-viewer" aria-label={label}
      onClose={() => { setOpen(null); opener.current?.focus(); }}
      onKeyDown={event => { if (event.key === "ArrowRight") step(1); if (event.key === "ArrowLeft") step(-1); }}
      onClick={event => { if (event.target === event.currentTarget) setOpen(null); }}
      onTouchStart={event => event.stopPropagation()} onTouchEnd={event => event.stopPropagation()}>
      {current && <figure><img src={current.url} alt={`Photo ${open! + 1} of ${count} from this review`} width={current.width || undefined} height={current.height || undefined} decoding="async" /><figcaption>{open! + 1} / {count}</figcaption></figure>}
      <button type="button" className="review-photo-close" aria-label="Close photo" onClick={() => setOpen(null)}><Icon name="close" /></button>
      {count > 1 && <>
        <button type="button" className="review-photo-prev" aria-label="Previous photo" onClick={() => step(-1)}><Icon name="arrow" /></button>
        <button type="button" className="review-photo-next" aria-label="Next photo" onClick={() => step(1)}><Icon name="arrow" /></button>
      </>}
    </dialog>
  </>;
}
