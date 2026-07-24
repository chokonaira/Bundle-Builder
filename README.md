# Bundle Builder

[![CI](https://github.com/chokonaira/Bundle-Builder/actions/workflows/ci.yml/badge.svg)](https://github.com/chokonaira/Bundle-Builder/actions/workflows/ci.yml)

A multi-step bundle builder for a home security system. Shoppers assemble cameras, a plan, sensors, and extras in a four-step accordion while a live review panel keeps totals in sync. Built with React, TypeScript, and Tailwind from [this Figma design](https://www.figma.com/design/JYf61etQVqeseX7oY5alGz/Frontend-Test-Figma?node-id=68-8088).

**Live demo:** [bundle-builder-sable-six.vercel.app](https://bundle-builder-sable-six.vercel.app)

## Getting started

```bash
git clone git@github.com:chokonaira/Bundle-Builder.git
cd Bundle-Builder
npm install
npm run dev
```

Open http://localhost:5173.

To run it with Docker instead:

```bash
docker compose up
```

Open http://localhost:8080.

### Scripts

| Command                | What it does                      |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start the dev server              |
| `npm test`             | Run the test suite (Vitest + RTL) |
| `npm run lint`         | Lint with oxlint                  |
| `npm run format:check` | Verify Prettier formatting        |
| `npm run build`        | Type-check and build production   |
| `npm run preview`      | Serve the production build        |

## How it works

- The whole catalog lives in [`src/data/products.json`](src/data/products.json): steps, products, variants, pricing, plan, and perks. Components render from that data, so adding a product means editing JSON, not JSX. The same file is served by a small Vercel function at [`/api/products`](api/products.ts) as the brief's bonus; the client starts from its local copy and swaps in the API response when the endpoint is available, so Docker and offline runs work the same.
- One store (reducer + context) keys every quantity by `productId:variantId`. Card steppers and review-panel steppers write to the same keys, so they can never drift apart.
- Each color variant has its own count. Add 2 White, switch the card to Black, and the stepper reads 0 while White keeps its own line in the review panel.
- "Save my system for later" snapshots the state to localStorage. On return the snapshot is checked against the catalog (unknown items dropped, quantities clamped, required items pinned, corrupt data ignored) before it hydrates.
- The design's pre-seeded totals ($238.81 crossed out, $187.89 final, $50.92 saved) come straight from the catalog defaults and are pinned by tests.

## Decisions and tradeoffs

- The Figma file only shows step 1 expanded. Steps 2 to 4 reuse the same card pattern with the items the review panel proves exist, and the plan step is single-select because a plan is chosen, not counted.
- The Cam Pan v3 card in the design shows $39.98/$34.98, but the review panel's line math implies a $28.99/$23.99 unit price. Both can't be right, so I used the unit prices that make every total in the design check out exactly.
- The design's font is Gilroy, which is commercial. DM Sans stands in behind a `Gilroy, 'DM Sans'` font stack, so licensed Gilroy files can be dropped in without code changes.
- Product images come from Wyze's public store because the Figma file is view-only and doesn't allow asset export.
- Desktop follows Frame 1735. The wider Frame 1736 shapes the tablet range (768 to 1024px), where the review section moves below the builder with the guarantee seal, returns copy, totals, and checkout on the right.
- Checkout is a placeholder dialog and the Learn More links have no destination, both per the brief. The financing line is static catalog copy, not a computed quote.
