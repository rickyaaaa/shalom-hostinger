"use client";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import Image from "next/image";
import { Icon } from "./Icon";

export type Slide = { src: string; alt: string };

/**
 * Lightweight photo slider: native scroll-snap does the swiping; this component only adds previous/next buttons and
 * dots. The box (size, ratio, radius) comes from the caller's class, so it can match the image it replaces with no
 * layout shift. A slide's image is only rendered once the visitor has reached the slide before it, so later photos
 * never load up front.
 *
 * With `autoplay` (ms) it advances on its own and loops, but only while it is on screen in a visible tab and nobody is
 * hovering, touching or focusing it; never for prefers-reduced-motion; and a Pause/Play button can stop it (WCAG 2.2.2).
 */
export function PhotoSlider({ slides, label, sizes, className, autoplay }: { slides: Slide[]; label: string; sizes: string; className: string; autoplay?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [reached, setReached] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
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
  useEffect(() => {
    if (!autoplay) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const motion = () => setReducedMotion(query.matches);
    query.addEventListener("change", motion);
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.5 });
    if (root.current) observer.observe(root.current);
    return () => { query.removeEventListener("change", motion); observer.disconnect(); };
  }, [autoplay]);
  const playing = !!autoplay && !paused && !held && onScreen && !reducedMotion;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const el = track.current;
      if (!el || document.hidden) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      go(current >= slides.length - 1 ? 0 : current + 1);
    }, autoplay);
    return () => window.clearInterval(timer);
    // go() only reads refs and the slide count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, autoplay, slides.length]);
  const hold = autoplay ? {
    onPointerEnter: () => setHeld(true), onPointerLeave: () => setHeld(false),
    onTouchStart: () => setHeld(true), onTouchEnd: () => setHeld(false),
    onFocus: () => setHeld(true), onBlur: (event: FocusEvent<HTMLDivElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false); },
  } : {};
  return <div ref={root} className={`photo-slider ${className}`} role="region" aria-roledescription="carousel" aria-label={label} {...hold}>
    <ul ref={track} className="photo-slider-track" onScroll={onScroll} tabIndex={0} aria-label={`${label}, scroll sideways for more`} aria-live={playing ? "off" : "polite"}>
      {slides.map((slide, i) => <li key={slide.src} className="photo-slider-slide" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
        {i <= reached + 1 && <Image src={slide.src} alt={slide.alt} fill sizes={sizes} />}
      </li>)}
    </ul>
    <button type="button" className="photo-slider-nav photo-slider-prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous photo"><Icon name="chevron" /></button>
    <button type="button" className="photo-slider-nav photo-slider-next" onClick={() => go(index + 1)} disabled={index === slides.length - 1} aria-label="Next photo"><Icon name="chevron" /></button>
    {autoplay && !reducedMotion && <button type="button" className="photo-slider-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? "Play slideshow" : "Pause slideshow"}>{paused ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>}</button>}
    <div className="photo-slider-dots" aria-hidden="true">{slides.map((slide, i) => <span key={slide.src} className={i === index ? "is-active" : undefined} />)}</div>
  </div>;
}
