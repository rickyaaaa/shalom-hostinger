# Pre-production design notes

19 October 2026. This ordinary extension documents the completed pre-production hardening against the approved Shalom visual world. It introduces no replacement identity or new design specification. [PRODUCT.md](PRODUCT.md), [.impeccable/pre-production-brief.md](.impeccable/pre-production-brief.md), [.impeccable/migration-brief.md](.impeccable/migration-brief.md), [MIGRATION-DOCUMENTATION.md](MIGRATION-DOCUMENTATION.md) and [PRE-PRODUCTION-REPORT.md](PRE-PRODUCTION-REPORT.md) define the scope and evidence boundaries.

## Preserved system

The original WordPress source remains the visual authority. Its horizontal logo, Raleway, navy actions, pale-blue fields, gold accents, original photographs/illustration/icons, square flat Tour cards, pill actions and blue logo-first footer remain recognizable in the current captures. Source Home uses the broad South Kuta tile beside narrower Ubud/West Bali tiles on desktop and stacked source images on phones. No new hero, generated image or replacement raster was introduced.

The established **Existing Palette**, **One Family** and **Flat Tour Card** rules remain applicable. Customer panels retain white surfaces, restrained shadows and rounded fields. Their phone-first identity and native labelled controls remain intact. Source section labels, component-specific radii and the in-page Reviews dialog are incumbent patterns; this pass creates no new global rule or prohibition.

Approved migration differences remain as documented previously: South Kuta → Ubud → West Bali navigation; correct Home anchors and Why → FAQ → About → Contact order; upper-right Tour scores on phones; notes after actions; native canonical titles, images and prices; owner-confirmed West Bali first/last IDs 633/655; sourced “Since 2016”; one fixed source Why photograph; readable expanded FAQ; immediately visible public content. These are preserved decisions, not new pre-production changes.

## Narrow hardening difference

The only new UI rule is in `src/app/globals.css` at the existing `max-width:767px` breakpoint:

```css
.customer-form input:not([type=checkbox],[type=radio],[type=hidden]),
.customer-form select,
.customer-form textarea { font-size: 16px; }
```

This raises customer text-entry sizing on phones to reduce iOS focus-zoom risk. Checkbox, radio and hidden controls are excluded. The supplied final measurements record 16px for rendered Login, Register and Request Help text inputs at 375/390/430px, and the incumbent 14px at 768/1440px. Selects/textareas are covered by the selector; the current guest-form matrix does not establish a fresh authenticated textarea interaction.

No field, label, consent, phone normalization, identity rule, native authentication architecture or runtime handler changed. The rule does not change public-page composition or enlarge the system-wide type ramp. Desktop viewport emulation cannot certify physical iOS Safari focus/keyboard behavior.

## Evidence checked

Source inspection sampled `src/app/tokens.css`, `src/app/globals.css`, `src/app/layout.tsx` and `src/components/AuthForm.tsx`, alongside the incumbent DESIGN frontmatter/prose and sidecar metadata. This confirms reused palette roles, self-hosted Raleway 400/500/600/700, form structure and the scoped mobile override.

Direct image inspection compared original `../.reference/migration/home-reference-desktop.jpg` and `home-reference-mobile.jpg` with current `.impeccable/review/pre-production-home-1440.jpg`, `pre-production-home-390.jpg` and `pre-production-ubud-390.jpg`. Current `pre-production-login-390.jpg`, `pre-production-register-390.jpg`, `pre-production-register-bottom-390.jpg` and `pre-production-account-390.jpg` were also opened. Full-page previews were displayed at reduced scale; precise viewport and field-size conclusions come from the supplied measurements rather than thumbnail pixels.

| Supplied evidence | Scope and result |
| --- | --- |
| `pre-production-audit.json` | 301 passed read-only checks against local production Next and real staging WordPress/public media; all 17 canonical Tours and eight customer pages. This is evidence review, not a rerun. |
| `pre-production-visual.json` | 40 post-build route/width checks: Home, three areas, Login, Register, Request Help and Account at 375/390/430/768/1440px. Requested/actual widths agree; no recorded horizontal overflow or header overlap. Rendered Tour actions are aligned and nowrap. |
| `pre-production-interactions.json` | Supplied anchor/menu-close measurement; contained 375px Reviews modal, scroll lock, Escape dismissal and return of focus to Reviews. |
| Current image inventory | Login at all five widths; Register top/bottom at 390; Request Help/guest Account at 390; menu/modal at 375; Home/Ubud at 390/1440; South Kuta/West Bali at 390. Inventory existence was checked; only the explicitly listed sample above was opened by this documenter. |

The two Register captures are an intentional viewport pair: the first shows the upper fields, and the bottom capture shows the consent, Register action and footer continuation. A first viewport ending before the submit action is not evidence that the action is missing.

Current `pre-production-account-390.jpg` is the **guest** Account view with Log In/Create Account and guest header labels. Earlier `migration-account-mobile.jpg` remains real authenticated staging customer 7 Approved-state evidence for unchanged implementation. The earlier ID7 inquiries/completions and review lifecycle are documented in the migration reports. They are not a fresh HTTPS login, registration, mail or business-acceptance test.

The independent [PRE-PRODUCTION-VISUAL-REVIEW.md](PRE-PRODUCTION-VISUAL-REVIEW.md) now records **disposition: ship**, limited to source preservation and the isolated mobile control sizing. It reports no material visual fixes within that scope. The reviewer opened all 17 fresh captures and original/approved references; this documenter's smaller direct sample is distinguished above. The verdict does not approve HTTPS authentication, mail, business content, production readiness, DNS/traffic changes or plugin removal. The earlier migration finish verdict remains limited to its recorded five-fix scope.

## Drift and remaining acceptance

The inherited detector result remains 46 advisory documentation/token differences (29 font-size, 17 color), not 46 independently validated defects. Earlier DESIGN statements about a single Tour 523 and below-title phone ratings are superseded by the approved 17-Tour migration and upper-right-score requirement. The sidecar remains its 18 October snapshot. This pass reports those differences without repairing them or running a second detector; no defect or incomplete source note is promoted into a reusable design rule.

Incomplete West Bali notes, uncertain native content and synthetic staging review text remain owner/content decisions in PRE-PRODUCTION-REPORT.md. No commercial promise or replacement copy was invented.

The updated report records a passed production build, final TypeScript and 16 passing unit/contract/SEO/environment tests; the documenter did not rerun them. It classifies the work **READY FOR HTTPS PREVIEW**, with actual hosting/TLS deployment and HTTPS authentication/mail/business acceptance still outstanding. This documentation adds no production approval. Physical iOS/other-device certification, real HTTPS session states, controlled mail delivery and production capacity remain outside the evidence established here. DNS/traffic, WordPress URLs, SCF, Elementor, legacy content and phone-authentication architecture remain untouched.

## Preservation verification

This documenter wrote only `PRE-PRODUCTION-DESIGN-NOTES.md`. No implementation, other document, raster, detector, test, network or browser operation was performed by this pass. SHA256 was checked before and after writing:

| Preserved file | SHA256 before and after |
| --- | --- |
| `DESIGN.md` | `6477CDF2E619C4493FD3429801DA13F3665EA98E41D0906C88545438AF867DEA` |
| `.impeccable/design.json` | `1F7F2B475A1E71040BA5D2A2CF33242EACAA44C5A10947627BFBBED7A7D2220F` |

Both incumbent files remain byte-for-byte unchanged.
