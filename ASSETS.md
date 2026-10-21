# Existing assets reused

Downloaded 18 October 2026 from the user-designated staging reference. Local copies are presentation assets only; TourCard imagery always comes from `card_image` in the structured Tour API. No stock or AI-generated imagery is used.

| Local file | Original source |
| --- | --- |
| public/images/shalom-logo.webp | https://slategray-goshawk-210407.hostingersite.com/wp-content/uploads/2026/10/Logo-Wisata-Bali-Shalom-768x256.webp |
| public/images/south-kuta.webp | https://slategray-goshawk-210407.hostingersite.com/wp-content/uploads/2026/10/south-kuta.webp |
| public/images/ubud.webp | https://slategray-goshawk-210407.hostingersite.com/wp-content/uploads/2026/10/ubud.webp |
| public/images/west-bali.jpeg | https://slategray-goshawk-210407.hostingersite.com/wp-content/uploads/2026/10/west-balii-1.jpeg |
| public/images/custom-itinerary.webp | https://slategray-goshawk-210407.hostingersite.com/wp-content/uploads/2026/10/arah.webp |

Raleway 400/500/600/700 normal is self-hosted under public/fonts, sourced from the same Google Fonts family used by staging. Original CSS is retained at ../.reference/frontend/raleway.css and the SIL Open Font License is public/fonts/OFL.txt (https://github.com/google/fonts/blob/main/ofl/raleway/OFL.txt). No generated visual assets or replacement logos.

Phone fields reuse public/vendor/libphonenumber-max.js byte-for-byte from the working WordPress portal assets/js/libphonenumber-max.js (libphonenumber-js 1.11.20). Its original MIT license is retained alongside it as libphonenumber-js.LICENSE.txt. This bundle only supplies region hints; PHP normalization/identity lookup remains authoritative.

## Full migration additions — 19 October 2026

Why Choose Us reuses the four observed WordPress icons directly through optimized Next Image: `/wp-content/uploads/2026/09/7-24-1-AQVLJK4TH3.png`, `7-19-1-AQVLJK4TH3.png`, `7-18-1-AQVLJK4TH3.png`, `7-20-1-AQVLJK4TH3.png`, on the same staging origin. Its photograph is one original frame from the source area slideshow. No replacement raster was generated. All 17 Tour images are canonical Featured Images returned by WordPress after reviewed empty-field backfill; their exact image IDs/source bindings are in `../.reference/migration/backfill-provenance.json`. These offline records are not frontend runtime imports.
