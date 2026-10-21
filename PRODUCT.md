# Shalom Bali Tour headless frontend

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, TypeScript, reusable React components and responsive CSS, in a separate application outside the WordPress plugin.

## Users

Visitors exploring Bali itineraries, customers requesting Tours, and returning customers reading or leaving eligible reviews.

## Product Purpose

Next.js is the canonical customer-facing presentation layer. WordPress remains the canonical CMS, Tour/customer/inquiry/review database, authentication authority, Shalom plugin runtime and wp-admin.

## Capabilities and Constraints

Full Home, shared Header/Footer, Ubud, South Kuta, West Bali, canonical API TourCards, public reviews/modal, phone Login/Register/Request Help, Account, all-Tour and custom booking gates, and eligible review submission. WordPress owns permissions and moderation. No new customer/Tour/review database and no browsing Tour detail pages. Preserve existing WordPress shortcodes and fallback. Structured Shalom REST only; no runtime Elementor parsing or hardcoded Tour-data fallback. Do not touch production, switch traffic, uninstall SCF/Elementor or edit legacy Elementor content.

## Brand Commitments

Preserve the Shalom visual identity. Legacy staging captures are historical visual references, not an ongoing Elementor layout authority. From 20 October 2026, implement all approved visual/content-layout revisions in Next.js only; do not synchronize them to Elementor. Keep Elementor and SCF installed and intact for rollback/fallback.

## Evidence on Hand

VISUAL-REFERENCE.md records initial measurements; MIGRATION-INSPECTION.md extends them to full Home/three areas. Original asset provenance is in ASSETS.md; schema ownership remains in ../INSPECTION.md. The approved 1.12.2 phone vertical passed real staging acceptance. The separately approved 1.13.0 transport is now active in staging; all17 canonical cards are populated without price changes. Native phone login resolves to existing customer7, with original inquiries/completion preserved. Real staging review6 passed Pending/private-only → duplicate rejection → Approved/public8.0/count1. Registration is tested through actual local WordPress/Next with mail intercepted. Production, SCF, Elementor and legacy pages remain untouched.

## Confirmed Integration Decision

Customers remain in Next for phone login, registration, Request Help, account, booking authentication and review submission. WordPress native sessions and existing handlers are authoritative; Next seals native credentials in a private HttpOnly cookie. Full migration was explicitly approved on 19 October 2026 after the 1.12.2 staging vertical passed. Preserve staging noindex; public pages become indexable only through an explicit production indexing setting. Stop at staging parity for final approval before any production cutover. No real WhatsApp/SMS/email during automated regression.

## Product Principles

- WordPress is the single source of truth for canonical content and business data.
- Next.js is the single presentation authority; backend origin comes only from server environment configuration.
- Preserve visual identity and existing business rules.
- Public reviews are approved/masked by the backend; Next does not recalculate scores.
- Missing canonical Tour content stays visibly absent until explicitly populated.
- Local QA data is labelled and cannot prove staging content.
