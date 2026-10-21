# Full frontend migration — inspection, 19 October 2026

The explicit full-migration approval supersedes the POC scope. Staging remains the visual reference and fallback. Production traffic, legacy Elementor content, SCF and Elementor are outside this change.

## Observed visual specification

Raleway 400–700; navy #0D315B, dark navy #092542, gold #D9A01B, pale blue page surfaces and blue footer. Desktop uses the horizontal logo, wrapping navigation, account and Contact Us actions. At tablet/mobile the white sticky header has horizontal logo, account icon/label and nested hamburger navigation. Original photos are retained. Home starts with Explore Bali Your Way, not a hero. Original area tiles use a wide South Kuta column and narrower Ubud/West Bali columns, stacked on mobile. Custom itinerary is a navy rounded panel. Reviews use warm white bordered cards. Why Choose Us is a two-column image/content composition; FAQ uses disclosures; About is white with text and facts. Element entrance animations hide content until scroll: this is not missing content.

Area pages use a darkened landscape introduction, then white three-column Tour cards on desktop, two at tablet, one on mobile. Cards have inset photos, title and upper-right score, destinations, divider/pricing, pill actions. The approved full-migration specification moves the yellow note below actions. Original card prices differ from canonical SCF prices: canonical prices win.

Home source order currently places About before Why/FAQ and its About anchor points at the footer. The approved request explicitly orders Why → FAQ → About → Contact; Next follows that order and repairs the anchor destinations. The source's ambiguous “6 Serving Bali Travelers” counter is rendered as the verified “Since 2016” statement already present in its heading, without inventing a years-served claim.

## Runtime data and transport

Saved source HTML and offline extraction: `../.reference/migration/`. These files are inspection/backfill evidence only, never frontend imports or runtime sources. Structured `/tours?per_page=50` returned 17 published Tours: 7 Ubud, 6 South Kuta, 4 West Bali. Only 523 had complete canonical image/destinations/duration/note. Sixteen need empty-field backfill from exact legacy cards. Existing regular_price/sale_price values must not change. Native Featured Image and existing `_shalom_destinations`, `_shalom_price_note`, `duration` are sufficient; no replacement schema is required.

Native 1.12.2 customer adapters are still restricted to 523 even though public listing/reviews support all Tours. The minimal 1.13.0 extension removes that transport restriction and passes validated Tour/custom intents into unchanged Booking and Reviews business handlers. Phone Auth, Registration, recovery, normalization, cache policy and moderation remain intact. Existing 523 clients that omit kind remain supported by WordPress.

## Resolved mapping

West Bali's first card and last card both link to Tour 655; Tour 633 is absent from links. First card: Ulun Danu Temple Bedugul, Taman Ayun, Lunch stop – Pork Ribs, Tanah Lot, image 1937. Last card: Taman Ayun, Lunch stop – Pork Ribs, Tanah Lot, image 444. On 19 October the owner explicitly confirmed first → 633 and last → 655. This correction is recorded in offline provenance; Elementor pages remain unchanged. Some West Bali notes are incomplete (“NB: NOT INCLUDING”, “NB: NOT”); preserve sourced text rather than inventing inclusions, and flag for editorial completion before cutover.

## Content ownership

WordPress owns all Tours, prices, durations, destinations, notes, images, ratings, reviews, identities, eligibility and inquiries. Next owns composition, styles and responsive interactions. Static Home/area introductory prose, FAQ, benefits, About, area imagery and brand/contact labels are transcribed from Elementor into `src/lib/marketing.ts`, Home components and Footer. No fabricated testimonials. Home reviews are the newest approved structured records across Tours.

## Validation boundary

Local disposable WordPress intercepts mail, so registration and full destructive fixture transitions are tested locally without outbound email/SMS/WhatsApp. Staging existing-customer checks use the authorized account and retain customer/inquiry/completion identities. Real inbox delivery remains unverified. New custom ZIP deployment requires the specific artifact approval before installation. Full migration is not complete until canonical backfill, adapter deployment, browser parity and regression evidence are recorded.
