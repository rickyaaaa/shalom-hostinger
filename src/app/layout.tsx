import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteLinks } from "@/lib/site";
import { wordpressConfig } from "@/lib/config";
import { CustomerSession } from "@/components/CustomerSession";
import { indexingEnabled } from "@/lib/seo";
import "./globals.css";

const raleway = localFont({
  src: [
    { path: "../../public/fonts/raleway-400.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/raleway-500.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/raleway-600.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/raleway-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-raleway", display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Shalom Bali Tour", template: "%s | Shalom Bali Tour" },
  description: "Explore Bali your way with flexible private tours from Shalom Bali Tour.",
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || process.env.APP_URL || "http://127.0.0.1:3000"),
  robots: { index: indexingEnabled(), follow: indexingEnabled() },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const localBackend = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(wordpressConfig().site).hostname);
  return <html lang="en" className={raleway.variable}><body>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <CustomerSession><Header links={siteLinks()} />
    {localBackend && <p className="local-data-notice" role="status">Local WordPress test data — not staging.</p>}
    <main id="main-content">{children}</main>
    <Footer />
    </CustomerSession>
  </body></html>;
}
