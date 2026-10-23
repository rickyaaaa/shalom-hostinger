import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return <footer className="site-footer" id="contact">
    <div className="footer-inner">
      <div className="footer-top">
        <Link href="/" className="footer-brand" aria-label="Shalom Bali Tour home"><Image src="/images/shalom-logo.webp" alt="Shalom Bali Tour" width={452} height={151} sizes="(max-width: 767px) calc(100vw - 48px), 452px" /></Link>
        <div className="footer-contact"><p className="footer-label">CALL US</p><a href="tel:+6282188757700">CS: +62 821 8875 7700</a><a href="tel:+6288268181767">Marketing: +62 882 6818 1767</a></div>
      </div>
      <p className="copyright">Copyright © 2026</p>
    </div>
  </footer>;
}
