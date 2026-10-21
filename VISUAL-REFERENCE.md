# Staging visual inspection — 18 October 2026

Completed before frontend implementation. Primary authority: https://slategray-goshawk-210407.hostingersite.com/ and its /ubud/ page. Inspected the rendered site at its normal desktop width, 1440 × 900 and 390 × 844; read original CSS and existing plugin component styles. Evidence is stored in ../.reference/frontend (HTML is inspection evidence only).

## Typography

Raleway, sans-serif throughout the public site. Desktop home h1: 600, 60px/70px. Ubud h1: 600, 48px/58px. Section h2: 48px/58px. Area-panel h3: 40px/50px. Card title: 26px/36px. Body/navigation: 16px/26px. Buttons: 600, 14px, reducing to 13px on narrow phones. Home mobile h1 is 28px; Ubud mobile h1 is 27px. Elementor retains desktop line-height on these small headings; the POC may use a proportionate line-height to preserve the intention without large empty line boxes.

## Palette

| Role | Existing value |
| --- | --- |
| Navy action / outline | #0D315B |
| Navy hover / dark | #092542 |
| Heading ink | #142033 |
| Body muted | #5C6675 |
| Pale blue header / home | #E1ECF0 |
| Surface | #FFFFFF |
| Card rule | #EBEBEB |
| Gold note / accent | #D9A01B (some legacy note text is lighter) |

Keep the gold note treatment, using a darker gold text value where necessary for readability on white. No new gradients, decorative shadows or stock imagery.

## Layout and spacing

Desktop content is constrained to approximately 1328px with 24px outer padding. Desktop header is about 168px tall. The home introduction starts around 175px below it; title/copy have roughly 28px separation, then 48px to the area panels. The panels use a 2:1:1 desktop composition, 24px gaps, full-bleed cover photography, white overlaid type and square corners. Order: introduction, South Kuta/Ubud/West Bali panels, customized-tour section, guest reviews, contact/footer.

Ubud has a darkened cover photograph approximately 600px tall, centered white text and a narrow paragraph. A 96px section gap precedes the card grid. Legacy desktop grid: three columns, about 32px gaps. The POC includes only Tour 523 and retains the first card's normal grid width, without inventing cards or migrating the other packages.

## Header

Desktop: pale blue, original horizontal logo, wrapping centered navigation, dark Sign In pill, white Contact Us pill. Tour Itinerary expands to Ubud, South Kuta and West Bali. Home is underlined when active. Preserve the same navigation labels/order. The existing Contact Us points to an unrelated template URL; route this action to the actual contact section.

At <=1024px: white mobile header with logo left, small outlined account icon and LOGIN / REGISTER label, then a square soft-white hamburger. Approximately 102px tall on narrow phones, 108–110px at larger mobile/tablet widths. The mobile header stays at the top while scrolling. Menu opens as a white, rounded, right-aligned dropdown with expandable Tour Itinerary. Use semantic buttons, Escape/outside dismissal and visible focus.

## TourCard

Thin light-gray border, white ground, square corners and no shadow. Roughly 12px image inset and another 12px content inset. Existing Ubud A image is a photographic collage; use the API Featured Image instead of a hardcoded card-image substitution. Title then score/review count; the initial manual card puts New below the title, while the agreed reusable layout permits the populated score alongside the title. Destinations are a simple bullet list. Divider, crossed-out regular price, large navy current price, smaller / duration on the same baseline, small gold information note. Bottom buttons: Book Now filled navy and Reviews outlined navy, both pills. Do not invent a score when review_count is zero.

## Mobile

Home panels stack in source order and expand to the available width. The settled mobile intro is left aligned, with compact outer padding; keep the same hierarchy. Ubud hero becomes approximately 430px tall under the header; text wraps centrally. Cards stack with about 24px page gutters. Preserve image aspect/crop and align the two action buttons consistently. Tighten oversized legacy gaps while retaining section order and visual rhythm. Reviews use a scrollable modal with small viewport gutters, not a desktop panel spilling off the phone.

## Interactions and implementation decisions

Public Reviews opens in-place and shows the backend summary and approved structured reviews. Loading, empty, failure/retry, pagination, Escape, focus restoration and scroll containment are required. Keep content visible immediately; do not reproduce Elementor entrance delays which briefly hide cards/text. Preserve existing WordPress authentication and inquiry rules through the selected integration, without client-side eligibility or rating calculation.

## Resolved API deployment discrepancy

The initial 404 was traced to active staging plugin 1.9.2, whose actual bootstrap omitted the new REST chain. Approved updates to 1.10.0 and then 1.11.0 resolved this. Collection, Tour523, structured public reviews and latest reviews now return HTTP200. Customer config returns200; guest account returns401. The existing-customer Next login/booking/account staging journey has passed. See POC-REPORT.md and ../STAGING-REST-DIAGNOSTIC.md. Tour523 still has empty canonical image/destinations/duration/note, which must not be replaced with runtime Elementor HTML or invented values.
