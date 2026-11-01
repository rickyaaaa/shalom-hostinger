import Image from "next/image";
import Link from "next/link";
import { publishedPosts } from "@/lib/blog";
import { displayDate } from "@/lib/format";
import { Icon } from "./Icon";

/** The newest published travel guides (up to three), linking into /blog; nothing renders while none is published. */
export function RecentGuides({ exclude, heading = "Bali Travel Guides" }: { exclude?: string; heading?: string }) {
  const posts = publishedPosts().filter(([slug]) => slug !== exclude).slice(0, 3);
  if (!posts.length) return null;
  return <section className="area-guide recent-guides" aria-labelledby="recent-guides-title"><div className="information-inner">
    <div className="recent-guides-heading">
      <div><p className="section-label">TRAVEL GUIDES</p><h2 id="recent-guides-title">{heading}</h2></div>
      <Link href="/blog" className="button button-outline">View All Guides</Link>
    </div>
    <ul className="blog-cards">{posts.map(([slug, post]) => <li key={slug}><Link href={`/blog/${slug}`}>
      <div className="blog-card-image"><Image src={post.image.src} alt="" fill quality={60} sizes="(max-width: 767px) 100vw, 400px" /></div>
      <div className="blog-card-copy">
        <time dateTime={post.updated ?? post.date}>{displayDate(post.updated ?? post.date)}</time>
        <h3>{post.heading}</h3>
        <p>{post.excerpt}</p>
        <span className="area-panel-cta" aria-hidden="true">Read the guide<Icon name="arrow" /></span>
      </div>
    </Link></li>)}</ul>
  </div></section>;
}
