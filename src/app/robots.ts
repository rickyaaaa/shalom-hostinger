import type { MetadataRoute } from "next";
import { indexingEnabled } from "@/lib/seo";
export default function robots():MetadataRoute.Robots {const site=process.env.PUBLIC_SITE_URL||process.env.APP_URL||"http://127.0.0.1:3000";return {rules:indexingEnabled()?{userAgent:"*",allow:"/",disallow:["/account","/login","/register","/request-help","/forgot-password","/reset-password","/book/","/ref/","/api/"]}:{userAgent:"*",disallow:"/"},sitemap:`${site}/sitemap.xml`};}
