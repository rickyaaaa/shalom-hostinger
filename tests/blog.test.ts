import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { blogImages, blogLive, blogPostBySlug, blogPosts, indexableBlogPaths, inlineParts, plainText, publishedPosts, type BlogPost } from "../src/lib/blog";
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
  const known = new Set(["/", "/#itineraries", "/#customizedtour", "/ubud", "/south-kuta", "/west-bali", "/bali-driver-hire"]);
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


test("The main menu links to /blog once a guide is published, without shipping the articles to the browser", () => {
  const menu = src("components/MobileMenu.tsx");
  assert.match(menu, /\{blog&&<Link href="\/blog" aria-current=\{pathname==="\/blog"\|\|pathname\.startsWith\("\/blog\/"\)\?"page":undefined\} onClick=\{close\}>Blog<\/Link>\}/);
  assert.ok(menu.indexOf(">Blog<") > menu.indexOf("anchors.map") && menu.indexOf(">Blog<") < menu.indexOf("homeAnchors.map"), "Blog sits before About and Contact");
  assert.doesNotMatch(menu + src("components/Header.tsx"), /@\/lib\/blog/, "client components never import the article copy");
  assert.match(src("app/layout.tsx"), /<Header links=\{siteLinks\(\)\} blog=\{blogLive\(\)\} \/>/);
});

test("Recent guides sit at the foot of Home, the area pages, every tour page and every guide; private pages have none", () => {
  const recent = src("components/RecentGuides.tsx");
  assert.match(recent, /publishedPosts\(\)\.filter\(\(\[slug\]\) => slug !== exclude\)\.slice\(0, 3\)/, "the three newest published guides");
  assert.match(recent, /if \(!posts\.length\) return null;/, "nothing renders while none is published");
  assert.match(recent, /<Link href="\/blog" className="button button-outline">View All Guides<\/Link>/);
  assert.match(src("app/page.tsx"), /<FAQ\/>\s*<RecentGuides\/>\s*<AboutSection\/>/, "Home: after the FAQ, before About");
  assert.match(src("components/AreaPage.tsx"), /<AreaGuideSections guide=\{guide\}\/>\}\s*<RecentGuides\/>/);
  assert.match(src("app/tours/[slug]/page.tsx"), /<TourReviews [^>]*\/>\s*<\/div><\/section>\s*<RecentGuides\/>/, "tour pages: after the reviews");
  assert.match(src("app/blog/[slug]/page.tsx"), /<RecentGuides exclude=\{slug\} heading="More Travel Guides" \/>/, "a guide never lists itself");
  for (const page of ["book/[id]/page.tsx", "login/page.tsx", "account/page.tsx", "register/page.tsx", "blog/page.tsx"]) assert.doesNotMatch(src(`app/${page}`), /RecentGuides/, page);
});

test("Uluwatu Temple guide: answers why it is famous first, links the Uluwatu tours, gives no prices or times", () => {
  const post: BlogPost = blogPosts["uluwatu-temple"];
  assert.equal(post.published, true);
  assert.equal(post.sections[0].heading, "Why is Uluwatu Temple famous?");
  assert.ok((post.sections[0].blocks[0] as string).split(/\s+/).length <= 60, "a short, quotable answer under the first H2");
  const text = copy(post);
  for (const path of ["/south-kuta", "/tours/uluwatu-beach-jimbaran-tour", "/blog/bali-itinerary", "/blog/things-to-do-in-ubud"]) assert.ok(text.includes(`(${path})`), path);
  for (const tour of ["uluwatu-beach-jimbaran-tour", "atv-uluwatu-jimbaran-sunset-tour", "family-watersport-uluwatu-tour"]) assert.ok(text.includes(`"${tour}"`), tour);
  for (const topic of ["Kecak", "monkeys", "shoulders and knees", "tickets are not included", "depends on the weather"]) assert.ok(text.includes(topic), topic);
  assert.doesNotMatch(text, /\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s?(am|pm)\b/i, "no performance or opening times");
  assert.match(text, /Kecak takes the place of the Jimbaran sunset dinner/, "the approved Kecak or dinner rule");
  assert.equal(new Set(Object.values(blogPosts).map(p => p.image.src)).size, Object.keys(blogPosts).length, "every guide has its own photo");
});

test("Guide photos: every file is registered and used, and every Commons photo is free-licensed with its credit", () => {
  const images = Object.entries(blogImages) as [string, (typeof blogImages)[keyof typeof blogImages]][];
  const files = readdirSync(new URL("../public/images/blog/", import.meta.url)).filter(file => file.endsWith(".webp"));
  assert.deepEqual(files.map(file => file.replace(/\.webp$/, "")).sort(), images.map(([key]) => key).sort(), "public/images/blog holds exactly the registered photos");
  const used = posts.flatMap(([, post]) => post.sections.flatMap(section => section.blocks.flatMap(block => typeof block === "object" && "image" in block ? [block.image] : [])));
  for (const [key, image] of images) {
    assert.ok(used.includes(key as never), `${key} is used in a guide`);
    assert.equal(image.src, `/images/blog/${key}.webp`);
    assert.ok(image.alt.length >= 20 && !/^(image|photo|picture) of/i.test(image.alt), `${key}: descriptive alt text`);
    const note = JSON.parse(readFileSync(new URL(`../public/images/blog/${key}.webp.json`, import.meta.url), "utf8"));
    assert.equal(note.width, image.width, key); assert.equal(note.height, image.height, key);
    if (image.credit === null) { assert.equal(note.owner, "Shalom Bali Tour", `${key}: only the client's own photos go uncredited`); assert.match(note.source, /^https:\/\/cms\.shalombalitour\.com\/wp-content\/uploads\//); continue; }
    assert.match(image.credit.license, /^(CC0|CC BY(-SA)? [234]\.0)$/, `${key}: a free licence that allows commercial use`);
    assert.match(image.credit.licenseUrl, /^https:\/\/creativecommons\.org\/(licenses\/by(-sa)?\/[234]\.0|publicdomain\/zero\/1\.0)\/$/, key);
    assert.match(image.credit.source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/, key);
    assert.ok(image.credit.author.length > 1, key);
    assert.equal(note.license, image.credit.license, `${key}: the provenance note matches`); assert.equal(note.source, image.credit.source, key);
  }
  const route = src("app/blog/[slug]/page.tsx");
  assert.match(route, /Photo: <a href=\{photo\.credit\.source\} target="_blank" rel="noopener nofollow">\{photo\.credit\.author\}<\/a>, <a href=\{photo\.credit\.licenseUrl\} target="_blank" rel="license noopener nofollow">\{photo\.credit\.license\}<\/a>, via Wikimedia Commons/, "credit: author, licence and source");
  for (const [slug, post] of posts) assert.ok(post.sections.some(section => section.blocks.some(block => typeof block === "object" && "image" in block)), `${slug} has photos`);
});

