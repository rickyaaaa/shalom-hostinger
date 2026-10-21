---
name: Shalom Bali Tour
description: Faithful reproduction of the existing Shalom Bali Tour visual system.
colors:
  navy: "#0d315b"
  navy-dark: "#092542"
  ink: "#142033"
  muted: "#5c6675"
  blue-light: "#e1ecf0"
  footer-blue: "#a2d0ea"
  border: "#ebebeb"
  gold: "#d9a01b"
  gold-text: "#8a6412"
  review-gold: "#d8952f"
  surface: "#fff"
  reviews-ground: "#faf9f6"
  modal-ground: "#f4f7fa"
  review-border: "#e4ddd2"
  input-border: "#b8c7d5"
  error: "#8c2b24"
  error-ground: "#fff1f0"
  success: "#1c5d36"
  success-ground: "#edf8f1"
typography:
  display:
    fontFamily: "Raleway, sans-serif"
    fontSize: "60px"
    fontWeight: 600
    lineHeight: "70px"
  headline:
    fontFamily: "Raleway, sans-serif"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: "58px"
  area-title:
    fontFamily: "Raleway, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: "50px"
  feature-title:
    fontFamily: "Raleway, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "42px"
  title:
    fontFamily: "Raleway, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: "36px"
  customer-title:
    fontFamily: "Raleway, sans-serif"
    fontSize: "clamp(28px, 4vw, 40px)"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Raleway, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
  button:
    fontFamily: "Raleway, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
  field-label:
    fontFamily: "Raleway, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.625
  eyebrow:
    fontFamily: "Raleway, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "23px"
    letterSpacing: "1.5px"
  price:
    fontFamily: "Raleway, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "36px"
rounded:
  square: "0px"
  control: "8px"
  field: "10px"
  modal-mobile: "12px"
  menu: "14px"
  panel: "16px"
  review: "18px"
  feature-mobile: "20px"
  feature: "24px"
  pill: "999px"
spacing:
  micro: "4px"
  compact: "8px"
  inset: "12px"
  small: "16px"
  form-gap: "20px"
  gutter: "24px"
  grid-gap: "32px"
  panel-space: "48px"
  section-mobile: "72px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "13px 24px"
  button-primary-hover:
    backgroundColor: "{colors.navy-dark}"
    textColor: "{colors.surface}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "13px 24px"
  button-outline-hover:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
  button-white:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "13px 24px"
  button-white-hover:
    backgroundColor: "{colors.navy-dark}"
    textColor: "{colors.surface}"
  tour-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "12px"
  customer-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "clamp(24px, 4vw, 48px)"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 13px"
  review-entry:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.review}"
    padding: "22px"
  verdict-chip:
    backgroundColor: "transparent"
    rounded: "{rounded.pill}"
    padding: "5px 9px"
  reviews-dialog:
    backgroundColor: "{colors.modal-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "0px"
---

# Design System: Shalom Bali Tour

## Overview

**Creative North Star: "Shalom Bali Tour — canonical Next.js presentation"**

Architecture decision, 20 October 2026: Next.js is the canonical presentation layer. Preserve Shalom Raleway typography, original logo, Bali photography, pale blue fields, navy actions and gold details. Legacy staging captures document the original identity; future approved layout and visual revisions belong only in Next.js. Do not synchronize those changes back to Elementor. WordPress remains the canonical content/business backend; Elementor and SCF remain intact for rollback/fallback.

The public pages are spacious and image-led. Customer screens reuse the same palette, header and footer with readable white panels and compact, labelled forms. Their rounded panels and subdued shadows follow the existing customer-portal precedent. The visual distinction between square tour cards, pill actions and gently rounded customer/review surfaces is intentional.

Extraction evidence: `src/app/tokens.css`, `src/app/globals.css`, `src/app/layout.tsx` and shared components; the pinned `.impeccable/ubud-brief.md`; `VISUAL-REFERENCE.md`; `ASSETS.md`; staging and local captures in `.impeccable/review/`; `FINISH-REVIEW.md` and `CUSTOMER-FINISH-REVIEW.md` (18 October 2026). Frontmatter owns primitive values; the sidecar holds motion, depth, responsive metadata and component previews. Implementation styles remain the source for behavior.

**Key Characteristics:**

- Original Shalom logo and source photography.
- Raleway throughout, with generous public headings and restrained form labels.
- Pale blue page/header ground, white content and a distinct brighter blue footer.
- Square bordered tour cards, navy pill actions and small gold accents.
- Existing public composition with accessible, responsive customer interactions.

## Colors

The palette combines deep navy actions, airy blues and small warm gold details. Token names retain the source CSS vocabulary.

### Primary

- **Shalom Navy** (`navy`): filled actions, outlined actions, prices, ratings and customer headings.
- **Deep Navy** (`navy-dark`): filled action hover state.

### Secondary

- **Warm Gold** (`gold`): rating accents, check marks and visible focus outlines.
- **Readable Gold** (`gold-text`): small price notes and review status on white. Preserve this darker text treatment rather than using the brighter accent for small text.
- **Review Gold** (`review-gold`): the individual-review star fill; the compact tour-summary star retains Warm Gold.

### Neutral

- **Heading Ink / Muted Slate** (`ink`, `muted`): primary prose and secondary explanatory text.
- **Pale Blue / Footer Blue** (`blue-light`, `footer-blue`): the broad page/header field and the distinct footer field.
- **White Surface / Light Rule** (`surface`, `border`): content, cards, buttons and subtle dividers.
- **Warm Review Ground / Cool Modal Ground** (`reviews-ground`, `modal-ground`): home review-section canvas and modal canvas.
- **Warm Review Rule / Field Stroke** (`review-border`, `input-border`): review-card/chip edges and form boundaries.
- **Error / Success pairs** (`error`, `error-ground`, `success`, `success-ground`): text and background for customer feedback. Messages also use text and semantic status roles; color is supplemental.

**The Existing Palette Rule.** New screens reuse the incumbent palette and component roles. Synthesized tonal ramps in the sidecar are preview metadata, not permission to introduce new runtime colors.

## Typography

**Display and body font:** self-hosted Raleway, with sans-serif fallback. Normal weights (400, 500, 600, 700) are loaded through `next/font/local`; provenance and license are in `ASSETS.md`. There is no separate serif or monospace identity.

### Hierarchy

The frontmatter records the desktop roles. Body and desktop navigation use the body role; headings are semibold. Header action labels use medium weight (500), while the common action is semibold. Current prices use bold and tabular lining numerals; rating values also use tabular lining numerals.

| Role | Desktop use | Responsive treatment observed in source |
| --- | --- | --- |
| Display | Home introduction | At ≤1024px: 48px/58px; at ≤767px: 28px/38px |
| Headline | Ubud hero and home reviews heading | Ubud: 40px/50px at ≤1024px, 27px/38px at ≤767px; reviews: 32px/42px at ≤767px |
| Area title | Area-photo panels | 32px/42px at ≤1024px, returning to 40px/50px on stacked panels at ≤767px |
| Feature title | Customized-tour panel | 28px/38px at ≤1024px; 27px/37px at ≤767px |
| Title | Tour card and review dialog title | Card stays at its desktop size; mobile dialog title is 22px/32px |
| Customer title | Login, registration and account | Fluid clamp in frontmatter, with a 1.2 line-height |
| Body | Prose, destinations and navigation | Mobile Ubud hero prose is 13px/25px; review experience uses 16px/1.65 |
| Button | Shared pill actions | Mobile tour actions use 13px/1.3 |
| Field label | Forms | Help text is 12px/1.6, regular weight |
| Eyebrow | Public section labels | At ≤767px: 12px with the existing 23px line box |
| Price | Current tour price | Retained on mobile; duration metadata is 12px |

Do not impose an invented mathematical scale: these sizes are extracted roles. The Ubud hero paragraph is constrained to 682px; customer experience text is limited to 70ch.

**The One Family Rule.** Keep Raleway for new customer and public surfaces, including native controls. Preserve the source hierarchy rather than substituting a fashionable display face.

## Layout

The desktop header has a 1280px maximum inner width, 24px side padding and a 168px minimum height. Its logo is 226px wide; centered navigation wraps between the logo and action group. The Home itinerary section has a 1328px maximum width with 24px outer padding. Its desktop top padding is 168px, introduction-to-panels gap is 48px, and area panels use the incumbent broad-first composition (`50% 1fr 1fr`, 24px gap). Do not reinterpret that composition as equal cards.

The Ubud hero is a full-bleed cover photograph with centered copy and a 600px minimum height. A white tour section follows with 96px vertical padding. The tour grid has a 1280px maximum width, three equal columns and 32px gaps. The single in-scope Tour 523 occupies the normal first-column width; empty columns do not justify invented Tours.

The customer section has a 1008px maximum width, 24px gutters and margins of 48px above/96px below. Auth panels have a 560px maximum width; the account panel uses the section width. Form rows have a 20px gap, labels a 7px gap, and optional columns use `repeat(auto-fit, minmax(160px, 1fr))` with a 16px gap.

Responsive behavior follows the existing media queries:

- At ≤1024px, the header becomes white and sticky; the logo/account/menu arrangement replaces desktop navigation. Header minimum height is 110px, the tour grid becomes two columns with 24px gaps, and the Ubud hero becomes 520px tall.
- At ≤767px, the header is 108px tall, area panels and tour cards stack, and the hero becomes 430px tall. Tour gutters remain 24px; the Home introduction is left aligned with 10px side padding. Feature panels and home-review sections use 16px outer gutters.
- At ≤640px, customer gutters become 16px, top margin becomes 32px, panels use 24px padding, and form columns/account heading/list rows stack.
- At ≤390px, the header becomes 102px tall with a 210px logo; navigation width and action gaps tighten. Tour rating moves below the title.

The footer retains the source logo-first topology: a 47%/53% desktop row for logo/contact, copyright below, then one column on mobile. Its inner maximum width is 1280px.

## Elevation & Depth

Public tour cards and area panels remain flat. Borders, colored fields, photography and dark image overlays establish hierarchy. Small shadows are reserved for customer panels, navigation dropdowns and the modal. The Home panel overlay changes from `#0006` to `#0004` on hover; the Ubud hero uses `#0008`. These existing image overlays are not decorative gradients.

### Shadow Vocabulary

- **Customer panel:** `0 6px 8px #082b5514`.
- **Desktop itinerary dropdown:** `0 10px 24px #0d315b14`.
- **Mobile navigation:** `0 12px 30px #081c3614`.
- **Review dialog:** `0 20px 70px #081b3033`, with backdrop `#081b3094`.

**The Flat Tour Card Rule.** Keep tour cards square, lightly bordered and shadowless. Customer-panel depth does not propagate into the public itinerary grid.

## Shapes

Square photographic area panels and tour cards anchor the public pages. Fully rounded actions and verdict chips use the source pill token. Fields, menu controls, dropdowns, reviews, dialogs and feature panels use their distinct extracted radii; do not normalize them into one universal card shape.

Review entries have an 18px radius. Customer panels and desktop dialogs use 16px, with mobile dialogs at 12px. Customized-tour panels and their image use 24px, reducing to 20px on mobile. The menu toggle uses 8px; mobile navigation uses 14px. Icon-only dialog controls are circular (44px square with 50% radius).

## Components

### Buttons

Navy pill actions are clear and quiet. The common button has a 46px minimum height and a 1.5px navy border; its tokens define padding, type and color. Tour actions use 13px 20px padding on desktop and 13px 15px on mobile, with a mobile 44px minimum height. The outline variant inverts to navy on hover. White actions support the header and navy feature panel.

Color and border changes transition over 180ms with ease-out. All interactive controls retain the global gold focus outline (3px with 5px offset); do not remove it for visual parity. Disabled buttons use 0.6 opacity and a wait cursor. Preserve actual busy labels.

### Tour Cards

A 1px light rule encloses a square white card with a 12px image inset. The body uses 24px 12px 28px padding. Keep the image aspect ratio (1280/813), title/rating hierarchy, simple destination bullets, price divider, crossed-out regular price when applicable, prominent navy current price, gold note and paired Book Now/Reviews actions.

Only structured Tour API data supplies title, destinations, prices, currency, duration, note and card image. `card_image` is canonical even when a local photograph appears more attractive. Show the existing unavailable-image or empty-rating treatment when data is absent; never invent content, reviews or scores.

### Customer Panels and Inputs

White customer panels sit on the pale blue field with the restrained panel shadow. Login and registration remain narrow; account and review work can use the wider panel. Inputs/selects/textareas are native controls with a 1px field stroke, 46px minimum height and the extracted field radius/padding. Textareas resize vertically.

Labels stay visible above fields. Help text remains adjacent; checkbox/radio groups retain native affordances. Errors and success notices have 14px type, 14px 16px padding and the field radius. Busy, loading, retry, empty and pending states keep the same hierarchy.

### Navigation

Desktop navigation is plain regular-weight body text with a 2px active underline; itinerary opens a white dropdown. Mobile navigation is a right-aligned white dropdown (240px wide, 220px at ≤390px) with rounded corners. The itinerary expands within it. Keep the existing link order, account icon, small uppercase account label and square menu control. Escape and outside dismissal preserve the source implementation's focus handling.

### Reviews and Verdict Chips

Review entries lead with gold stars and a numeric score, followed by experience, masked guest/country, booking/area metadata, three rating dimensions and verdict chips. White review cards have warm borders, 22px padding (18px on mobile) and the review radius. Positive recommendation chips use the existing subdued green treatment; negative meanings remain explicit in text. These are metadata, not filter controls.

### Reviews Dialog

The dialog preserves page context. Desktop width is `min(760px, 100% - 48px)`, with maximum height `min(85dvh, 880px)`; mobile uses 12px side gutters and `100dvh - 32px` maximum height. Sticky title/close controls and a scrollable contained body keep long reviews usable.

Opening uses a 180ms entrance with `cubic-bezier(.16,1,.3,1)`, moving from 8px below while opacity rises from 0.8. Escape/backdrop dismissal, focus restoration, scroll locking, approved-review loading, retry and pagination remain part of the component. Reduced-motion preference disables animation/transitions and smooth scrolling.

## Do's and Don'ts

### Do:

- **Do** follow approved Next.js presentation revisions and preserve the original Shalom logo, photographs and illustration.
- **Do** reuse the extracted Raleway hierarchy, palette and component-specific shapes.
- **Do** preserve the distinct footer blue, logo-first order and separate copyright row.
- **Do** keep canonical API card imagery and all Tour/review facts tied to WordPress.
- **Do** retain visible focus, native labels, honest pending/error states and reduced-motion support.
- **Do** identify local test captures as local evidence; visual review is not staging business acceptance.

### Don't:

- **Don't** introduce a replacement identity, gradients, decorative card shadows or stock/AI imagery.
- **Don't** round the square tour cards or replace the source photo composition with generic equal tiles.
- **Don't** fabricate Tours, rating values, destinations, prices, eligibility or review content.
- **Don't** copy disposable test identities or synthetic reviews into product copy or component examples.
- **Don't** reproduce entrance delays that hide public content while waiting for animation.

