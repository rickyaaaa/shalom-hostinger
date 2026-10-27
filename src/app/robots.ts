import type { MetadataRoute } from "next";
import { indexingEnabled } from "@/lib/seo";
// Private pages (account, login, booking, password, referral links) stay out of search through their own noindex.
// They must stay crawlable for that: a robots.txt block hides the noindex, and a linked blocked URL can still be listed.
export default function robots():MetadataRoute.Robots {const site=process.env.PUBLIC_SITE_URL||process.env.APP_URL||"http://127.0.0.1:3000";return {rules:indexingEnabled()?{userAgent:"*",allow:"/",disallow:["/api/"]}:{userAgent:"*",disallow:"/"},sitemap:`${site}/sitemap.xml`};}
