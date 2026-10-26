"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "./Icon";

export type Slide = { src: string; alt: string };

/**
 * Lightweight photo slider: native scroll-snap does the swiping; this component only adds previous/next buttons and
 * dots. The box (size, ratio, radius) comes from the caller's class, so it can match the image it replaces with no
 * layout shift. Nothing autoplays, and a slide's image is only rendered once the visitor has reached the slide before
 * it, so later photos never load up front.
 */
export function PhotoSlider({ slides, label, sizes, className }: { slides: Slide[]; label: string; sizes: string; className: string }) {
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
  return <div className={`photo-slider ${className}`} role="region" aria-roledescription="carousel" aria-label={label}>
    <ul ref={track} className="photo-slider-track" onScroll={onScroll} tabIndex={0} aria-label={`${label}, scroll sideways for more`}>
      {slides.map((slide, i) => <li key={slide.src} className="photo-slider-slide" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
        {i <= reached + 1 && <Image src={slide.src} alt={slide.alt} fill sizes={sizes} />}
      </li>)}
    </ul>
    <button type="button" className="photo-slider-nav photo-slider-prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous photo"><Icon name="chevron" /></button>
    <button type="button" className="photo-slider-nav photo-slider-next" onClick={() => go(index + 1)} disabled={index === slides.length - 1} aria-label="Next photo"><Icon name="chevron" /></button>
    <div className="photo-slider-dots" aria-hidden="true">{slides.map((slide, i) => <span key={slide.src} className={i === index ? "is-active" : undefined} />)}</div>
  </div>;
}
