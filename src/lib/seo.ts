import type { Metadata } from "next";
import { serverEnv } from "./server-env";
export const indexingEnabled = () => serverEnv("ALLOW_INDEXING") === "true";
/** Link-preview photo per public page: the photo the page itself shows (site images, real pixel sizes). */
const socialImages: Record<string, { url: string; width: number; height: number; alt: string }> = {
  "/": { url: "/images/west-bali.jpeg", width: 720, height: 405, alt: "A Balinese temple beside the water" },
  "/ubud": { url: "/images/ubud.webp", width: 720, height: 480, alt: "Green rice terraces in Ubud" },
  "/south-kuta": { url: "/images/south-kuta.webp", width: 550, height: 376, alt: "The coastal landscape of South Kuta" },
  "/west-bali": { url: "/images/west-bali.jpeg", width: 720, height: 405, alt: "A Balinese temple beside the water" },
};
export function publicMetadata(title: string, description: string, path: string): Metadata {
  const images = socialImages[path] ? [socialImages[path]] : undefined;
  return {title, description, alternates:{canonical:path}, robots:{index:indexingEnabled(),follow:indexingEnabled()}, openGraph:{title,description,url:path,type:"website",siteName:"Shalom Bali Tour",images}, twitter:{card:images?"summary_large_image":"summary",title,description,images}};
}
export const privateRobots = {index:false,follow:false};
