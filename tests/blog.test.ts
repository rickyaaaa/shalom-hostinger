import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { blogLive, blogPostBySlug, blogPosts, indexableBlogPaths, inlineParts, plainText, publishedPosts, type BlogPost } from "../src/lib/blog";
import { tourPageBySlug } from "../src/lib/tour-pages";
import sitemap from "../src/app/sitemap";

const src = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const posts = Object.entries(blogPosts) as [string, BlogPost][];
const paragraphs = (post: BlogPost) => [...post.intro, ...post.sections.flatMap(section => section.blocks.filter(block => typeof block === "string"))];
const copy = (post: BlogPost) => JSON.stringify([post.title, post.metaDescription, post.heading, post.excerpt, post.intro, post.sections, post.faq]);
const draft: BlogPost = blogPosts["bali-itinerary"];

test("Blog slugs are kebab-case and every article has a real photo, a date and unique section ids", () => {
  assert.ok(posts.length > 0);
  for (const [slug, post] of posts) {
    assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, slug);
    assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/);
    if (post.updated) assert.ok(post.updated >= post.date, `${slug}: updated after written`);
    assert.ok(existsSync(new URL(`../public${post.image.src}`, import.meta.url)), post.image.src);
    assert.ok(post.image.alt.length > 10);
    const ids = post.sections.map(section => section.id);
    assert.equal(new Set([...ids, "blog-faq"]).size, ids.length + 1, `${slug}: section ids are unique anchors`);
    assert.ok(!post.sections[0].sub, `${slug}: the first section is an H2`);
    assert.ok(post.faq.length > 0);
  }
});

test("Blog metadata: branded title within 60 characters, description within snippet length, H1 differs", () => {
  for (const [slug, post] of posts) {
    assert.ok(`${post.title} | Shalom Bali Tour`.length <= 60, `${slug}: ${post.title}`);
    assert.doesNotMatch(post.title, /Shalom/, "the layout template appends the brand");
    assert.ok(post.metaDescription.length >= 120 && post.metaDescription.length <= 160, `${slug}: ${post.metaDescription.length}`);
    assert.notEqual(post.title, post.heading);
  }
});

test("Blog copy has no prices or unverified claims; prices and terms stay on the tour pages", () => {
  for (const [slug, post] of posts) {
    const text = copy(post);
    assert.doesNotMatch(text, /\$|\b(USD|IDR|EUR|AUD|Rp)\b|per (person|car|vehicle|group)|\d+\s?k\b/i, `${slug}: no price or currency`);
    assert.doesNotMatch(text, /dinner included|tickets? included|guarantee|English-speaking|licensed|cheapest|\bbest (tour|driver|price|value)/i, `${slug}: no inclusion or quality claims`);
  }
});

test("Every link in an article points to a page that exists", () => {
  const known = new Set(["/", "/#itineraries", "/#customizedtour", "/ubud", "/south-kuta", "/west-bali"]);
  for (const [slug, post] of posts) {
    for (const text of paragraphs(post)) {
      assert.doesNotMatch(plainText(text), /\[|\]\(/, `${slug}: every [text](/path) link is well formed`);
      for (const part of inlineParts(text)) if ("href" in part) {
        const tour = part.href.match(/^\/tours\/([^/#?]+)$/)?.[1];
        const article = part.href.match(/^\/blog\/([^/#?]+)$/)?.[1];
        assert.ok(known.has(part.href) || (tour && tourPageBySlug(tour)?.indexable) || (article && blogPostBySlug(article)?.published), `${slug}: ${part.href}`);
      }
    }
    for (const section of post.sections) for (const block of section.blocks) if (typeof block === "object" && "tours" in block) for (const tour of block.tours) assert.ok(tourPageBySlug(tour)?.indexable, `${slug}: ${tour}`);
  }
});

test("Inline links: text and internal paths only", () => {
  assert.deepEqual(inlineParts("See [Ubud](/ubud) or [build a day](/#customizedtour)."), [{ text: "See " }, { text: "Ubud", href: "/ubud" }, { text: " or " }, { text: "build a day", href: "/#customizedtour" }, { text: "." }]);
  assert.deepEqual(inlineParts("[out](https://example.com)"), [{ text: "[out](https://example.com)" }], "external links are never rendered as links");
  assert.equal(plainText("Book the [Uluwatu tour](/tours/uluwatu-beach-jimbaran-tour) today"), "Book the Uluwatu tour today");
});

test("Bali itinerary follows the brief: answers how many days first, links each area's tours, keeps the approved facts", () => {
  assert.equal(draft.published, true, "published after the owner approved it, 1 November 2026");
  assert.equal(draft.sections[0].heading, "How many days do you need in Bali?");
  const firstAnswer = draft.sections[0].blocks[0] as string;
  assert.ok(firstAnswer.split(/\s+/).length <= 70, "a short, quotable answer under the first H2");
  const text = copy(draft);
  for (const phrase of ["5 days", "10 days", "17:30", "10 hours", "fuel and parking included", "Kecak", "Nyepi", "not included"]) assert.ok(text.includes(phrase), phrase);
  for (const day of [1, 2, 3, 4, 5, 6, 7]) assert.ok(draft.sections.some(section => section.sub && section.heading.startsWith(`Day ${day}:`)), `Day ${day}`);
  for (const path of ["/tours/uluwatu-beach-jimbaran-tour", "/tours/ubud-rice-terrace-waterfall-tour", "/tours/ulun-danu-taman-ayun-tanah-lot-tour", "/#customizedtour"]) assert.ok(text.includes(`(${path})`), path);
  assert.doesNotMatch(text, /\b(?!17:30)\d{1,2}[:.]\d{2}\b/, "no other times");
  assert.doesNotMatch(text, /Nusa Penida|Lembongan/, "the paused island trips are not promoted");
  assert.doesNotMatch(text, /Tanah Lot[^.]*sunset/i, "the West Bali sunset timing is not promised");
});

test("Drafts stay out of the sitemap and the guides list; /blog only exists once an article is published", () => {
  const saved = process.env.PUBLIC_SITE_URL;
  try {
    process.env.PUBLIC_SITE_URL = "https://shalombalitour.com";
    const urls = sitemap().map(row => row.url);
    for (const [slug, post] of posts) assert.equal(urls.includes(`https://shalombalitour.com/blog/${slug}`), post.published, slug);
    assert.equal(urls.includes("https://shalombalitour.com/blog"), blogLive());
    assert.deepEqual(indexableBlogPaths(), blogLive() ? ["/blog", ...publishedPosts().map(([slug]) => `/blog/${slug}`)] : []);
  } finally { if (saved === undefined) delete process.env.PUBLIC_SITE_URL; else process.env.PUBLIC_SITE_URL = saved; }
  assert.ok(publishedPosts().every(([, post]) => post.published));
  assert.equal(blogPostBySlug("constructor"), null);
  assert.equal(blogPostBySlug("__proto__"), null);
});

test("Article and guides routes: noindex drafts, 404 unknown slugs, escaped JSON-LD, footer link only when live", () => {
  const route = src("app/blog/[slug]/page.tsx");
  assert.match(route, /post\.published \? \{\} : \{ robots: \{ index: false, follow: false \} \}/);
  assert.match(route, /if \(!post\) notFound\(\);/);
  assert.match(route, /"@type": "BlogPosting"/);
  assert.match(route, /"@type": "BreadcrumbList"/);
  assert.equal(route.match(/\.replace\(\/<\/g, "\\\\u003c"\)/g)?.length, 2, "both JSON-LD blocks escape <");
  assert.match(route, /blogLive\(\) \? \[\{ name: "Travel Guides", path: "\/blog" \}\]/, "a draft's breadcrumb skips the unpublished list");
  const index = src("app/blog/page.tsx");
  assert.match(index, /if \(!blogLive\(\)\) notFound\(\);/);
  assert.match(index, /if \(!posts\.length\) notFound\(\);/);
  assert.match(src("components/Footer.tsx"), /\{blogLive\(\) && <nav className="footer-links"/);
  assert.doesNotMatch(src("lib/blog.ts"), /from "\.\/wordpress"/, "articles never wait on WordPress");
});

test("Things to do in Ubud: numbered list matches the title, links Ubud tours and the itinerary, no tour claims Tegallalang", () => {
  const post: BlogPost = blogPosts["things-to-do-in-ubud"];
  assert.equal(post.published, true);
  assert.equal(post.sections[0].heading, "What is Ubud known for?");
  assert.ok((post.sections[0].blocks[0] as string).split(/\s+/).length <= 60, "a short, quotable answer under the first H2");
  const numbered = post.sections.filter(section => section.sub).map(section => Number(section.heading.match(/^(\d+)\. /)?.[1]));
  assert.deepEqual(numbered, Array.from({ length: numbered.length }, (_, i) => i + 1), "the list is numbered 1, 2, 3 ...");
  assert.ok(post.title.startsWith(`${numbered.length} `), `the title counts ${numbered.length} things`);
  const text = copy(post);
  for (const path of ["/ubud", "/blog/bali-itinerary", "/tours/ubud-rice-terrace-waterfall-tour", "/tours/ubud-monkey-forest-tirta-empul-tour", "/tours/ubud-art-batik-silver-class-tour", "/tours/ubud-atv-rafting-tour", "/#customizedtour"]) assert.ok(text.includes(`(${path})`), path);
  assert.doesNotMatch(text, /\b(tour|our)\b[^.]*\b(visits?|stops? at|includes?) Tegallalang/i, "Shalom tours list \"Ubud rice terraces\", not Tegallalang");
  assert.doesNotMatch(text, /\b\d{1,2}[:.]\d{2}\b/, "no times");
  assert.notEqual(post.image.src, blogPosts["bali-itinerary"].image.src, "each guide card on /blog has its own photo");
});

