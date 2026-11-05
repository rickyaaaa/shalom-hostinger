import Image from "next/image";
import Link from "next/link";
import { blogLive } from "@/lib/blog";
import { csWhatsApp, facebookProfile, instagramProfile, tiktokProfile, whatsAppDisplay } from "@/lib/marketing";
import { BackToTop } from "./BackToTop";

export function Footer() {
  return <footer className="site-footer" id="contact">
    <div className="footer-inner">
      <div className="footer-top">
        <Link href="/" className="footer-brand" aria-label="Shalom Bali Tour home"><Image src="/images/shalom-logo.webp" alt="Shalom Bali Tour" width={452} height={151} sizes="(max-width: 767px) calc(100vw - 48px), 452px" /></Link>
        <div className="footer-contact"><p className="footer-label">CALL US</p><a href={csWhatsApp} target="_blank" rel="noopener noreferrer">WhatsApp: {whatsAppDisplay}</a><p className="footer-label footer-follow">FOLLOW US</p><div className="footer-social"><a href={facebookProfile} target="_blank" rel="noopener noreferrer">Facebook</a><a href={instagramProfile} target="_blank" rel="noopener noreferrer">Instagram</a><a href={tiktokProfile} target="_blank" rel="noopener noreferrer">TikTok</a></div></div>
      </div>
      {blogLive() && <nav className="footer-links" aria-label="Travel guides"><Link href="/blog">Bali Travel Guides</Link></nav>}
      <div className="footer-bottom"><p className="copyright">Copyright © 2026</p><BackToTop /></div>
    </div>
  </footer>;
}
