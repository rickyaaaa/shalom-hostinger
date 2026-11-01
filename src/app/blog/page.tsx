import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogLive, publishedPosts } from "@/lib/blog";
import { displayDate } from "@/lib/format";
import { publicMetadata } from "@/lib/seo";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

// The guides list only exists once an article is published (blogPosts in src/lib/blog.ts).
export function generateMetadata(): Metadata {
  if (!blogLive()) notFound();
  return publicMetadata("Bali Travel Guides", "Bali travel guides from our local team: itineraries, where to go and practical tips for planning your days in Bali with a private driver.", "/blog");
}

export default function BlogIndexPage() {
  const posts = publishedPosts();
  if (!posts.length) notFound();
  return <section className="area-guide blog-index" aria-labelledby="blog-index-title"><div className="information-inner">
    <p className="section-label">TRAVEL GUIDES</p>
    <h1 id="blog-index-title">Bali Travel Guides</h1>
    <p className="blog-index-intro">Itineraries, places to visit and practical tips for planning your days in Bali.</p>
    <ul className="blog-cards">{posts.map(([slug, post]) => <li key={slug}><Link href={`/blog/${slug}`}>
      <div className="blog-card-image"><Image src={post.image.src} alt="" fill quality={60} sizes="(max-width: 767px) 100vw, 400px" /></div>
      <div className="blog-card-copy">
        <time dateTime={post.updated ?? post.date}>{displayDate(post.updated ?? post.date)}</time>
        <h2>{post.heading}</h2>
        <p>{post.excerpt}</p>
        <span className="area-panel-cta" aria-hidden="true">Read the guide<Icon name="arrow" /></span>
      </div>
    </Link></li>)}</ul>
  </div></section>;
}
