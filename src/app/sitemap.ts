import type { MetadataRoute } from "next";
import { indexableTourPaths } from "@/lib/tour-pages";
export default function sitemap():MetadataRoute.Sitemap {const site=(process.env.PUBLIC_SITE_URL||process.env.APP_URL||"http://127.0.0.1:3000").replace(/\/$/,"");return [...["/","/ubud","/south-kuta","/west-bali","/nusa-penida-lembongan"],...indexableTourPaths()].map(path=>({url:`${site}${path}`,changeFrequency:"weekly",priority:path==="/"?1:0.8}));}
