"use client";
import { useState } from "react";
import { Icon } from "./Icon";

export const MAX_REVIEW_PHOTOS = 5;
const MAX_EDGE = 1600;
export type PickedPhoto = { id: string; file: File; url: string };

type Decoded = { image: CanvasImageSource; width: number; height: number; close: () => void };

/** The browser's own decoder, turned upright from the camera orientation. HEIC works only where the browser reads it (iOS converts on upload). */
async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { image: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch { /* older engines: fall back to an <img> element */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("A photo could not be read. Please choose JPEG, PNG or WebP photos.");
  }
}

/**
 * Resize in the browser before upload: at most 1600 px and re-encoded as JPEG, so uploads stay small on a phone
 * connection and camera data such as GPS location never leaves the device. WordPress re-encodes again on arrival.
 */
export async function preparePhoto(file: File, position: number): Promise<File> {
  const source = await decode(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare this photo.");
    context.fillStyle = "#fff"; // a transparent PNG becomes white, not black, as a JPEG
    context.fillRect(0, 0, width, height);
    context.drawImage(source.image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("Your browser could not prepare this photo.");
    return new File([blob], `review-photo-${position}.jpg`, { type: "image/jpeg" });
  } finally {
    source.close();
  }
}

const pickId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

/** "Add photos" for a review: up to five, previewed with a remove button each. */
export function ReviewPhotoPicker({ photos, onChange, disabled = false }: { photos: PickedPhoto[]; onChange: (photos: PickedPhoto[]) => void; disabled?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const room = MAX_REVIEW_PHOTOS - photos.length;
  async function add(chosen: File[]) {
    if (!chosen.length) return;
    setError(chosen.length > room ? `You can add up to ${MAX_REVIEW_PHOTOS} photos.` : "");
    setBusy(true);
    const next = [...photos];
    for (const file of chosen.slice(0, room)) {
      try {
        const prepared = await preparePhoto(file, next.length + 1);
        next.push({ id: pickId(), file: prepared, url: URL.createObjectURL(prepared) });
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "A photo could not be added.");
      }
    }
    onChange(next);
    setBusy(false);
  }
  function remove(id: string) {
    const photo = photos.find(item => item.id === id);
    if (photo) URL.revokeObjectURL(photo.url);
    onChange(photos.filter(item => item.id !== id));
  }
  return <div className="review-photo-picker">
    <p className="review-photo-picker-label">Photos <span className="field-help">(optional, up to {MAX_REVIEW_PHOTOS})</span></p>
    {photos.length > 0 && <ul className="review-photo-previews" aria-label="Photos you are adding">{photos.map((photo, index) => <li key={photo.id}>
      <img src={photo.url} alt={`Photo ${index + 1} you are adding`} width={88} height={88} />
      <button type="button" className="review-photo-remove" aria-label={`Remove photo ${index + 1}`} disabled={disabled} onClick={() => remove(photo.id)}><Icon name="close" /></button>
    </li>)}</ul>}
    {room > 0 && <label className={`button button-outline review-photo-add${busy || disabled ? " is-busy" : ""}`}>
      {busy ? "Preparing photos…" : photos.length ? "Add more photos" : "Add photos"}
      <input type="file" accept="image/*" multiple hidden disabled={busy || disabled} onChange={event => { const files = Array.from(event.currentTarget.files ?? []); event.currentTarget.value = ""; void add(files); }} />
    </label>}
    <p className="field-help">{photos.length}/{MAX_REVIEW_PHOTOS} · Photos are resized before upload; location data is removed.</p>
    {error && <p className="customer-error" role="alert">{error}</p>}
  </div>;
}
