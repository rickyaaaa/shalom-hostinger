import type { Metadata } from "next";
export const indexingEnabled = () => process.env.ALLOW_INDEXING === "true";
export function publicMetadata(title: string, description: string, path: string): Metadata {
  return {title, description, alternates:{canonical:path}, robots:{index:indexingEnabled(),follow:indexingEnabled()}, openGraph:{title,description,url:path,type:"website",siteName:"Shalom Bali Tour"}};
}
export const privateRobots = {index:false,follow:false};
