"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "./Icon";

// Existing Shalom Bali Tour images from the client's WordPress uploads (see the .json notes beside each file).
const slides = [
  { src: "/images/custom-itinerary.webp", alt: "Choosing your own itinerary" },
  { src: "/images/south-kuta.webp", alt: "Uluwatu Temple on the clifftop above the Indian Ocean in South Kuta" },
  { src: "/images/ubud.webp", alt: "A traveler on a jungle swing above green rice terraces in Ubud" },
  { src: "/images/west-bali.jpeg", alt: "Pura Ulun Danu Beratan temple on Lake Beratan" },
];

/**
 * Lightweight photo slider: native scroll-snap does the swiping; this component only adds previous/next buttons and
 * dots. The frame keeps the original image's aspect ratio (no layout shift), nothing autoplays, and a slide's image is
 * only rendered once the visitor has reached the slide before it, so later photos never load up front.
 */
export function CustomGallery() {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [reached, setReached] = useState(0);
  function onScroll() {
    const el = track.current;
    if (!el) return;
    const current = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(current);
    setReached(previous => Math.max(previous, current));
  }
  function go(target: number) {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, target)) * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }
  return <div className="custom-gallery" role="region" aria-roledescription="carousel" aria-label="Itinerary photos">
    <ul ref={track} className="custom-gallery-track" onScroll={onScroll} tabIndex={0} aria-label="Itinerary photos, scroll sideways for more">
      {slides.map((slide, i) => <li key={slide.src} className="custom-gallery-slide" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
        {i <= reached + 1 && <Image src={slide.src} alt={slide.alt} fill sizes="(max-width: 767px) 80vw, 320px" />}
      </li>)}
    </ul>
    <button type="button" className="custom-gallery-nav custom-gallery-prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous photo"><Icon name="chevron" /></button>
    <button type="button" className="custom-gallery-nav custom-gallery-next" onClick={() => go(index + 1)} disabled={index === slides.length - 1} aria-label="Next photo"><Icon name="chevron" /></button>
    <div className="custom-gallery-dots" aria-hidden="true">{slides.map((slide, i) => <span key={slide.src} className={i === index ? "is-active" : undefined} />)}</div>
  </div>;
}
