# Bundle Builder

[![CI](https://github.com/chokonaira/Bundle-Builder/actions/workflows/ci.yml/badge.svg)](https://github.com/chokonaira/Bundle-Builder/actions/workflows/ci.yml)

A multi-step security-system bundle builder — a four-step accordion on the left, a live review panel on the right, everything in sync. Built with React, TypeScript, and Tailwind from [this Figma design](https://www.figma.com/design/JYf61etQVqeseX7oY5alGz/Frontend-Test-Figma?node-id=68-8088).

**Live demo → [bundle-builder-sable-six.vercel.app](https://bundle-builder-sable-six.vercel.app)**

## Quick start

```bash
git clone git@github.com:chokonaira/Bundle-Builder.git
cd Bundle-Builder
npm install
npm run dev
```

Open http://localhost:5173. That's it.

**Prefer Docker?**

```bash
docker compose up
```

Open http://localhost:8080.

### All scripts

| Command                | What it does                      |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start the dev server              |
| `npm test`             | Run the test suite (Vitest + RTL) |
| `npm run lint`         | Lint with oxlint                  |
| `npm run format:check` | Verify Prettier formatting        |
| `npm run build`        | Type-check and build production   |
| `npm run preview`      | Serve the production build        |

## How it works

- **Everything renders from JSON.** [`src/data/products.json`](src/data/products.json) defines the steps, products, variants, pricing, plan, and perks. No per-product markup anywhere — add a product to the JSON and it shows up. The same JSON is also served by a small Vercel function at [`/api/products`](api/products.ts) (the brief's bonus); the client renders from its local copy instantly and swaps in the API response when the endpoint exists, so Docker and offline runs behave identically.
- **One store, two views.** A `useReducer` + context store keys every quantity by `productId:variantId`. The product-card steppers and the review-panel steppers write to the same keys, which is what keeps them in sync — there's no syncing code to get wrong.
- **Variants count independently.** Selecting a color chip only changes which variant the card's stepper edits. Add 2 White, switch to Black — the stepper reads 0, White's 2 stay in the review panel as their own line.
- **Saved systems restore exactly.** _Save my system for later_ snapshots the state to `localStorage`. On return, the snapshot is validated against the catalog (unknown lines dropped, required items enforced, corrupt data ignored) and hydrated, so the app comes back exactly as it was left.
- **The seed state is pinned by tests.** The design's pre-populated system ($238.81 → $187.89, saving $50.92) is reproduced by the catalog defaults and asserted in the test suite, digit for digit.

## Design decisions & tradeoffs

- **Steps 2–4 are inferred.** The Figma file only shows _Choose your cameras_ expanded; the other steps appear collapsed everywhere. Their expanded layouts reuse the step-1 card pattern with the items the review panel proves exist (sensors, hub, SD card), and the plan step renders as single-select — a plan is chosen, not counted.
- **A price inconsistency in the design, resolved toward the math.** The Cam Pan v3 _card_ shows $39.98 → $34.98, but the review panel's line ($57.98 → $47.98 at ×2) implies a $28.99 → $23.99 unit price. Both can't be true, so the catalog uses the unit prices that make every total in the design check out exactly.
- **Font substitution.** The design uses Gilroy, which is a commercial font. DM Sans (closest freely-licensed match) stands in behind a `Gilroy, 'DM Sans', …` stack — drop licensed Gilroy woff2s in and the upgrade is automatic.
- **Product imagery** comes from Wyze's public store, since the design file is view-only and doesn't allow asset export. Variant chips currently reuse the product's primary image.
- **Desktop target is Frame 1735** (the frame the brief's link points at). The wider Frame 1736 in the same file reads as an alternate exploration; the responsive behavior between desktop and phone follows standard stacking instead.
- **Variant-chip selected styling** is minimal by design — the brief explicitly grades the selection-and-quantity behavior, not the chip polish.

## Not done / out of scope

- Checkout is a placeholder dialog, per the brief.
- _Learn More_ links have no destination yet.
- The financing line (“as low as $19.19/mo”) is static catalog copy, not a computed quote.
