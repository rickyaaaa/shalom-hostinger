import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogImages, blogLive, blogPostBySlug, inlineParts, plainText, type BlogBlock, type BlogImage, type BlogImageKey, type BlogSection } from "@/lib/blog";
import { displayDate } from "@/lib/format";
import { areas } from "@/lib/marketing";
import { publicMetadata } from "@/lib/seo";
import { serverEnv } from "@/lib/server-env";
import { tourPages } from "@/lib/tour-pages";
import { Icon } from "@/components/Icon";
import { RecentGuides } from "@/components/RecentGuides";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPostBySlug(slug);
  if (!post) notFound();
  // The layout template adds "| Shalom Bali Tour".
  const base = publicMetadata(post.title, post.metaDescription, `/blog/${slug}`);
  const images = [{ url: post.image.src, width: post.image.width, height: post.image.height, alt: post.image.alt }];
  return {
    ...base,
    ...(post.published ? {} : { robots: { index: false, follow: false } }),
    openGraph: { ...base.openGraph, type: "article", publishedTime: post.date, modifiedTime: post.updated ?? post.date, images },
    twitter: { ...base.twitter, card: "summary_large_image", images },
  };
}

function Paragraph({ text }: { text: string }) {
  return <p className="tour-detail-text">{inlineParts(text).map((part, i) => "href" in part ? <Link key={i} href={part.href}>{part.text}</Link> : part.text)}</p>;
}

/** A guide photo; Commons photos carry the author, licence and source their licence asks for. */
function Figure({ image, caption }: { image: BlogImageKey; caption?: string }) {
  const photo: BlogImage = blogImages[image];
  return <figure className="blog-figure">
    <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} quality={75} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), 760px" />
    <figcaption>
      {caption && <span>{caption} </span>}
      <span className="blog-credit">{photo.credit
        ? <>Photo: <a href={photo.credit.source} target="_blank" rel="noopener nofollow">{photo.credit.author}</a>, <a href={photo.credit.licenseUrl} target="_blank" rel="license noopener nofollow">{photo.credit.license}</a>, via Wikimedia Commons</>
        : "Photo: Shalom Bali Tour"}</span>
    </figcaption>
  </figure>;
}

function Block({ block }: { block: BlogBlock }) {
  if (typeof block === "string") return <Paragraph text={block} />;
  if ("list" in block) return <ul className="tour-detail-highlights blog-list">{block.list.map(item => <li key={item}>{item}</li>)}</ul>;
  if ("image" in block) return <Figure image={block.image} caption={block.caption} />;
  return <ul className="blog-tours">{block.tours.map(slug => {
    const tour = tourPages[slug];
    return <li key={slug}><Link href={`/tours/${slug}`}><span className="blog-tour-area">{areas[tour.area].name}</span><span className="blog-tour-title">{tour.title}</span><span className="blog-tour-cta" aria-hidden="true">View tour<Icon name="arrow" /></span></Link></li>;
  })}</ul>;
}

/** Each H2 section, with the H3 sections that follow it (the days of the itinerary). */
function groups(sections: readonly BlogSection[]) {
  const result: { section: BlogSection; subs: BlogSection[] }[] = [];
  for (const section of sections) {
    if (section.sub && result.length) result[result.length - 1].subs.push(section);
    else result.push({ section, subs: [] });
  }
  return result;
}

const areaLinks = [
  { title: "Ubud", text: "Rice terraces, temples, waterfalls, art and family days out.", href: "/ubud" },
  { title: "South Kuta", text: "Uluwatu Temple, beaches, watersports and sunset dinners in Jimbaran.", href: "/south-kuta" },
  { title: "West Bali & North Bali", text: "Ulun Danu Beratan, Jatiluwih, Taman Ayun and Tanah Lot.", href: "/west-bali" },
];

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPostBySlug(slug);
  if (!post) notFound();

  const site = (serverEnv("PUBLIC_SITE_URL") || serverEnv("APP_URL") || "http://127.0.0.1:3000").replace(/\/$/, "");
  const url = `${site}/blog/${slug}`;
  const sectionGroups = groups(post.sections);
  const updated = post.updated ?? post.date;
  // The guides list only exists once an article is published, so a draft's breadcrumb skips it.
  const crumbs = [{ name: "Home", path: "/" }, ...(blogLive() ? [{ name: "Travel Guides", path: "/blog" }] : []), { name: post.title, path: `/blog/${slug}` }];
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.heading,
    description: post.metaDescription,
    url,
    mainEntityOfPage: url,
    image: [post.image.src, ...post.sections.flatMap(s => s.blocks.flatMap(b => typeof b === "object" && "image" in b ? [blogImages[b.image].src] : []))].map(src => `${site}${src}`),
    datePublished: post.date,
    dateModified: updated,
    inLanguage: "en",
    author: { "@type": "Organization", name: "Shalom Bali Tour", url: site },
    publisher: { "@type": "Organization", name: "Shalom Bali Tour", url: site, logo: { "@type": "ImageObject", url: `${site}/images/shalom-logo.webp` } },
    articleSection: "Bali travel guide",
    wordCount: [...post.intro, ...post.sections.flatMap(s => s.blocks.flatMap(b => typeof b === "string" ? [b] : "list" in b ? b.list : []))].map(plainText).join(" ").split(/\s+/).length,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, name: crumb.name, item: `${site}${crumb.path}` })),
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
    <div className="tour-detail-banner">
      <Image src={post.image.src} alt={post.image.alt} fill preload fetchPriority="high" quality={60} sizes="100vw" />
    </div>
    <article className="blog-layout" aria-labelledby="blog-title">
      <header className="blog-header">
        <nav className="tour-breadcrumbs" aria-label="Breadcrumb"><ol>
          {crumbs.slice(0, -1).map(crumb => <li key={crumb.path}><Link href={crumb.path}>{crumb.name}</Link></li>)}
          <li aria-current="page">{post.title}</li>
        </ol></nav>
        <h1 id="blog-title">{post.heading}</h1>
        <p className="blog-byline">By Shalom Bali Tour · {post.updated ? "Updated " : ""}<time dateTime={updated}>{displayDate(updated)}</time></p>
        {post.intro.map(text => <Paragraph key={text} text={text} />)}
      </header>
      <aside className="blog-aside">
        <nav className="blog-toc" aria-labelledby="blog-toc-title">
          <h2 id="blog-toc-title">In This Guide</h2>
          <ol>
            {sectionGroups.map(({ section }) => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}
            <li><a href="#blog-faq">Frequently Asked Questions</a></li>
          </ol>
        </nav>
        <div className="blog-aside-cta">
          <p>Plan your Bali days with a private driver.</p>
          <Link href="/#itineraries" className="button">Choose an Itinerary</Link>
          <Link href="/#customizedtour" className="button button-outline">Customize Your Itinerary</Link>
        </div>
      </aside>
      <div className="blog-body tour-detail-body">
        {sectionGroups.map(({ section, subs }) => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`}>{section.heading}</h2>
          {section.blocks.map((block, i) => <Block key={i} block={block} />)}
          {subs.map(sub => <div key={sub.id} id={sub.id} className="blog-sub">
            <h3>{sub.heading}</h3>
            {sub.blocks.map((block, i) => <Block key={i} block={block} />)}
          </div>)}
        </section>)}
        <section id="blog-faq" aria-labelledby="blog-faq-title">
          <h2 id="blog-faq-title">Frequently Asked Questions</h2>
          <div className="faq-list">{post.faq.map(item => <details key={item.question} name="blog-faq"><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
        </section>
      </div>
    </article>
    <section className="area-guide area-more" aria-labelledby="blog-areas-title"><div className="information-inner">
      <p className="section-label">PRIVATE DAY TOURS</p><h2 id="blog-areas-title">Plan Your Days by Area</h2>
      <ul className="area-more-list">{areaLinks.map(item => <li key={item.href}><Link href={item.href}><h3>{item.title}</h3><p>{item.text}</p><span className="area-panel-cta" aria-hidden="true">Explore<Icon name="arrow" /></span></Link></li>)}</ul>
    </div></section>
    <RecentGuides exclude={slug} heading="More Travel Guides" />
  </>;
}
