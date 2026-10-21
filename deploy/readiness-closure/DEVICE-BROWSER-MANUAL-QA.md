# Device/browser QA matrix and manual completion sheet

Release under test: `dpl_D2u6fftg6ctiE4d96EKWA8tsrmCT`
Preview: https://shalom-nextjs-preview-aye930kn4-rickyaaaas-projects.vercel.app
Date: 20 October 2026. Login is protected by Vercel Authentication.

Labels: **REAL DEVICE**, **REAL BROWSER**, **EMULATION**, **NOT TESTED**. Rendering in the real in-app Chromium engine is not DOM emulation; it also does not establish branded Chrome, Firefox or Safari coverage.

| Requested platform | Classification | Actual coverage |
| --- | --- | --- |
| In-app desktop Chromium, 1280×720 | REAL BROWSER | Account inquiry UI and desktop navigation; native modal keyboard input; login/logout; digits-only phone detects country; no horizontal overflow |
| Android Chrome | NOT TESTED — no real device/session attached | Physical touch keyboard/input zoom/menu/image behavior pending |
| iOS Safari | NOT TESTED — unavailable | Physical device and WebKit behavior pending |
| Desktop Chrome | NOT TESTED — standalone Chrome session unavailable | Chromium-engine result is not relabelled Chrome |
| Desktop Firefox | NOT TESTED — unavailable | Gecko keyboard/layout coverage pending |
| Desktop Safari | NOT TESTED — unavailable | macOS/WebKit unavailable |

| Requested size/zoom | Classification / result |
| --- | --- |
| 375px | NOT TESTED at actual size |
| 390px | NOT TESTED at actual size; earlier viewport override did not change observed 1280px width |
| 430px | NOT TESTED at actual size |
| Tablet (e.g. 768×1024 and landscape) | NOT TESTED |
| Desktop 1280×720 | REAL BROWSER; Account document scrollWidth 1270 <= innerWidth1280; no overflow |
| 200% browser zoom | NOT TESTED; Ctrl+plus left actual innerWidth/innerHeight unchanged; it does not prove zoom support or 200% reflow |
| Mobile emulation | None accepted: an ineffective viewport request is not valid EMULATION evidence |

Desktop observations: header/navigation visible; Tour Itinerary expands with South Kuta/Ubud/West Bali links and closes with Escape. Native login works with existing synthetic account 8 and no manually typed plus. Account shows two own inquiries with Tour/date/status and explicit UTC context; no admin links. Book Now/inquiry continuation, native review count/modal and logout operate on the actual Preview. Desktop CTAs remain single-line as observed in the earlier same-runtime acceptance. Narrow-width wrapping has not been established. Header is non-sticky in the existing implementation; preservation is intentional, not a newly promised sticky feature. Existing images render with their canonical source; mobile crops are unverified.

Modal on the updated release, REAL BROWSER/native key input: initial Close focus, four forward Tab cycles all inside, Shift+Tab inside, Escape closes and restores Reviews. Native `:modal` is active and AX tree exposes the dialog while open; background did not receive focus in tested traversal. No DOM-simulated keyboard event was used. Retry/load-more focus states need additional branded browser coverage if those controls are present with other data.

## Manual completion sheet — do not pre-mark PASS

For each available platform above record tester/date, device model, OS/browser exact version, actual CSS viewport, zoom and portrait/landscape. Mark unavailable cases NOT TESTED and keep that limit in the final report.

At 375,390,430px, tablet and desktop, then at real 200% browser zoom:

- Header: logo/navigation/contact/Account fit; hamburger opens and closes; focus/aria-expanded correct; menu links reachable; resize does not strand focus or leave overlays.
- Tour Itinerary: expand, use keyboard/touch, follow each area link, Escape/outside close as designed; no offscreen submenu.
- Login/Register: labels/errors/terms readable, phone accepts country code digits without manual `+`, country feedback updates, password visibility works, form fits. Use existing approved fixture for login; do **not** create another registration without controlled mail and explicit test approval.
- Physical input zoom: focus phone/password at actual device settings, verify legible font and no disruptive iOS auto-zoom; close keyboard and confirm layout recovers.
- Account: correct owner only; My Inquiries date/status/title readable; long title wraps; no table overflow; empty/error/load-more states usable. No admin links/internal fields.
- Book Now: intended Tour survives guest gate; CTA labels one line; touch targets usable; use existing-ticket retry if a write is authorized. Never open/send WhatsApp for QA.
- Reviews: open and close; initial focus; repeatedly Tab/Shift+Tab including retry/load-more; Escape; trigger focus restoration; background keyboard isolation; touch scroll contained.
- Layout: compare viewport and scroll width; verify CTA row/column follows parent design, no clipped labels, visible focus, canonical image cropping without stretching. Scroll to verify actual header behavior.
- Record a screenshot for each tested breakpoint/platform and any defect. Do not use CSS transforms, DOM-created mock layouts, screenshot resizing or an unverified viewport request as coverage.

Standalone Chrome/Firefox and real Android coverage remain required before production sign-off. Safari is conditional on availability, with any omission explicitly accepted by the owner. No device/browser pass has been fabricated.
