# Full frontend migration: visual documentation

19 October 2026. This is the ordinary-extension documentation pass over the finished Next frontend. It records evidence and differences against the incumbent system; it does not replace the visual world or refresh its normative files. Product authority is [PRODUCT.md](PRODUCT.md), with the pinned code-led direction in [.impeccable/migration-brief.md](.impeccable/migration-brief.md). WordPress remains the source of customer, Tour and review facts. Production cutover is outside this documentation and visual verdict.

## Incumbent preservation

The following SHA256 values were recorded before this pass and verified unchanged after writing this document. Both incumbent files remain byte-for-byte intact.

| File | SHA256 before and after |
| --- | --- |
| `DESIGN.md` | `6477CDF2E619C4493FD3429801DA13F3665EA98E41D0906C88545438AF867DEA` |
| `.impeccable/design.json` | `1F7F2B475A1E71040BA5D2A2CF33242EACAA44C5A10947627BFBBED7A7D2220F` |

This pass wrote only `MIGRATION-DOCUMENTATION.md`. Implementation, PRODUCT, the direction brief, reviewer report and incumbent design files were not edited. No detector, tests, browser session or network operation was run by the documenter.

## Observed visual system

| Aspect | Finished implementation and comparison |
| --- | --- |
| Palette | `src/app/tokens.css` preserves navy `#0d315b`, dark navy `#092542`, ink `#142033`, muted `#5c6675`, pale blue `#e1ecf0`, footer blue `#a2d0ea`, light rule `#ebebeb`, gold `#d9a01b` and readable gold `#8a6412`. White public/customer surfaces, warm review cards and cool dialog ground retain the incumbent roles. The expanded FAQ restores the source gold `#c89b3c` with navy text for readable contrast; it is a component observation, not a new global palette prescription. |
| Typography | `src/app/layout.tsx` loads local Raleway 400/500/600/700. Desktop Home uses 60px/70px, area hero 48px/58px, area-tile title 40px/50px, custom title 32px/42px and card title 26px/36px. Body/navigation retain 16px; actions use 14px, reducing to 13px on mobile cards. Narrow-phone card titles use 23px/1.35 while keeping the score beside them. |
| Layout | The original horizontal logo and wrapping navigation precede the centered Home introduction and broad South Kuta tile beside narrower Ubud/West Bali tiles. No new Home hero was introduced. The source navy custom panel and original illustration follow; review, Why, FAQ, About and contact surfaces retain their distinct compositions. Area pages share darkened source photography and a flat Tour grid: three columns, two at tablet, one on phones. |
| Responsive treatment | Existing breakpoints at 1024/767/640/390px remain. Mobile uses the white sticky logo/account/hamburger header, left-aligned Home introduction, stacked area tiles, centered Why benefits with each source icon above its copy, centered custom-panel copy and a compact white action. About centers heading/prose with facts below, stacking its two facts vertically on phones. |
| Depth and shapes | Square, bordered, shadowless Tour cards and image panels preserve the public language. Navy/outline/white pill actions remain distinct from 10px fields, 16px customer panels, 18px review cards and 24px custom panels (20px on mobile). Subdued customer/menu shadows and the contained review dialog remain incumbent exceptions to flat public cards. |
| Interaction surfaces | Phone Login/Register/Request Help retain native labelled controls, busy/error/retry feedback and booking intent. Account shows backend-owned completion/review states. Reviews remain an in-page native dialog with close/Escape/backdrop handling, focus return, scroll locking, approved-data loading, retry and pagination. Area/booking service failure retains the current destination on retry. These observations do not certify backend business acceptance. |

The incumbent named rules remain applicable: **Existing Palette**, **One Family**, and **Flat Tour Card**. This document creates no additional named rules or prohibitions. Original section labels, source panel radii and the Reviews modal are source-authorized patterns, not grounds for inventing a replacement identity.

## Source comparison and approved differences

Direct visual comparison used `../.reference/migration/home-reference-desktop.jpg` and `home-reference-mobile.jpg`, supported by [VISUAL-REFERENCE.md](VISUAL-REFERENCE.md) and [MIGRATION-INSPECTION.md](MIGRATION-INSPECTION.md). The captured source shows the same logo, photography, pale blue ground, broad-first tiles, navy custom panel, illustration, review treatment, Why icons, gold FAQ and blue logo-first footer. The final capture preserves these recognizable materials.

The pinned migration direction explicitly permits these differences from literal legacy output:

- Itinerary dropdown order is South Kuta, Ubud, West Bali. Home anchors lead to their actual sections; the requested lower-page order is Why → FAQ → About → Contact.
- Tour scores remain upper-right at every width; yellow/gold notes appear after Book Now/Reviews. Canonical native titles, images and prices replace separately typed legacy facts. The owner-confirmed West Bali mapping is first card → Tour 633 and last → Tour 655.
- The ambiguous legacy “6 Serving Bali Travelers” counter becomes the already-sourced “Since 2016” statement. Facts remain below the centered About copy.
- Why freezes one original slideshow frame rather than reproducing its 500ms slideshow. Public content is visible immediately rather than waiting for Elementor entrance delays.
- Expanded FAQ uses the source gold with readable navy foreground. Native disclosure affordances and accessible focus remain visible.

These are scoped migration decisions, not permission to redesign later surfaces. No raster was created or replaced in the correction batch. [ASSETS.md](ASSETS.md) records original logo/photos/illustration and four source benefit icons; canonical Tour image bindings remain in the offline `../.reference/migration/backfill-provenance.json` evidence. No generated or stock imagery was introduced.

## Pre-existing drift reported without repair

The incumbent files describe the earlier POC/customer system. Their statement that only Tour 523 is in scope and other grid columns remain empty is superseded by the approved full migration: the finished area pages show all 17 canonical Tours. The old Layout statement that ratings move below titles at ≤390px conflicts with the now-explicit upper-right score requirement. The incumbent sidecar remains its 18 October snapshot rather than pretending to be a newly generated full-migration library.

The already-produced `.impeccable/review/migration-detector.json` contains 46 advisory differences: 29 font-size and 17 color entries. Its literal checks include existing utility/help/metadata sizes and component-specific colors not represented as primitive frontmatter entries. The source-approved FAQ color is also absent from the old palette. These observations are recorded here without editing tokens, normalizing source components or rerunning the detector. They do not establish 46 independently validated visual defects, and they are not canonized as new system rules.

Source West Bali notes remain visibly incomplete in places, as documented in MIGRATION-INSPECTION.md; no inclusions were invented. The public synthetic staging review remains explicitly labelled validation data and is not evidence of customer marketing acceptance. These content limitations are not converted into reusable component copy.

## Evidence and review scope

Code sampled: `src/app/tokens.css`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/HomeInformation.tsx`, `TourCard.tsx`, `Header.tsx`, `Footer.tsx`, `AuthForm.tsx`, `ReviewModal.tsx`, `AreaPage.tsx` and `ServiceUnavailable.tsx`. The incumbent DESIGN frontmatter, prose and sidecar were compared with those actual styles and patterns.

All supplied captures were opened for this documentation comparison under `.impeccable/review/`: `migration-home-desktop.jpg`, `migration-home-mobile.jpg`, `migration-user-1270.jpg`, `migration-ubud-desktop.jpg`, `migration-ubud-mobile.jpg`, `migration-south-kuta-mobile.jpg`, `migration-west-bali-mobile.jpg`, `migration-login-mobile.jpg`, `migration-register-mobile.jpg`, `migration-account-mobile.jpg`, `migration-review-modal-mobile.jpg`, `migration-mobile-menu.jpg` and `migration-home-first-viewport.jpg`. Long full-page previews were displayed at reduced scale; detailed measurements remain in the supplied capture/matrix evidence rather than being inferred from thumbnail pixels.

The public captures represent the corrected build. Account is the earlier real staging customer 7 Approved-state capture for unchanged implementation, taken before logout; it is not a new authenticated test. `migration-responsive-matrix.json` records the supplied 24 route/width checks; `migration-failure-retries.json` records locally simulated API failure and exact retries to `/ubud`, `/south-kuta`, `/west-bali` and `/book/523`, not a staging outage.

[MIGRATION-FINISH-REVIEW.md](MIGRATION-FINISH-REVIEW.md) records **disposition: ship**, strictly at five-fix verdict scope: About, mobile Why, expanded FAQ, custom itinerary composition and destination-preserving failure retry are all scored resolved. This documentation preserves that scope; it does not widen the verdict into whole-surface, business-rule or production-cutover approval.
