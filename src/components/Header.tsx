"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SiteLinks } from "@/lib/types";
import { Icon } from "./Icon";
import { AccountHeaderAction } from "./AccountHeaderAction";
import { MobileMenu } from "./MobileMenu";

export function Header({ links: _links }: { links: SiteLinks }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [itinerary, setItinerary] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const itineraryToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) { setOpen(false); setItinerary(false); }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (open || itinerary)) {
        event.preventDefault();
        if (itinerary) { setItinerary(false); itineraryToggle.current?.focus(); }
        else { setOpen(false); toggle.current?.focus(); }
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open, itinerary]);

  const close = () => { setOpen(false); setItinerary(false); };

  return <header className="site-header" ref={header}>
    <div className="header-inner">
      <Link href="/" className="brand" aria-label="Shalom Bali Tour home" onClick={close}>
        <Image src="/images/shalom-logo.webp" alt="Shalom Bali Tour" width={768} height={256} priority sizes="(max-width: 390px) 210px, (max-width: 1024px) 260px, 226px" />
      </Link>
      <MobileMenu open={open} itinerary={itinerary} setItinerary={setItinerary} pathname={pathname} close={close} toggleRef={itineraryToggle}/>
      <div className="header-actions">
        <AccountHeaderAction/>
        <Link href="/#contact" className="button button-white header-contact">Contact Us</Link>
        <button ref={toggle} className="menu-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => { setOpen(!open); setItinerary(false); }}><Icon name={open ? "close" : "menu"} /></button>
      </div>
    </div>
  </header>;
}
