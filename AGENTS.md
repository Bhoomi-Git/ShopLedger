# ShopLedger

## Stack

- Node.js with CommonJS, Express 4, and body-parser for JSON request bodies.
- Plain HTML, CSS, and browser JavaScript served from `public/`.
- Synchronous JSON storage in `data/db.json`.

## Module map

- `routes/customers.js` — Lists Khata customers and records settlements.
- `routes/orders.js` — Lists, retrieves, creates, and cancels orders.
- `routes/products.js` — Lists and filters products and lists active coupons.
- `routes/reports.js` — Serves dashboard and GST reconciliation data, previews cart pricing, and exports the database.
- `lib/coupons.js` — Normalizes coupon codes, checks eligibility, and calculates discounts.
- `lib/dates.js` — Formats dates, normalizes date keys, and derives fiscal years.
- `lib/inventory.js` — Looks up products, checks sellable stock, deducts stock, releases reservations, and summarizes inventory.
- `lib/invoice.js` — Recomputes invoice figures and renders printable HTML.
- `lib/ledger.js` — Looks up Khata customers, charges or reverses order debits, and records settlements.
- `lib/orders.js` — Creates, retrieves, cancels, and filters order records.
- `lib/pricing.js` — Calculates checkout subtotals, applies discounts, and computes per-line GST and cart totals.
- `lib/reports.js` — Builds the dashboard summary and compares invoice figures with saved order totals and GST.
- `lib/store.js` — Reads and writes the JSON database and maintains the audit log.
- `lib/tax.js` — Resolves item GST rates and splits GST into CGST and SGST.

## Commands

- Start the app with `node server.js`.
- Run tests with `node --test`. The package's `test` script is a failing placeholder.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module or modules the ticket is about.
3. Tests must use in-memory data and must never read or write `data/db.json`.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed.

Allowed files are `lib/invoice.js` and, only if truly needed, `lib/tax.js`.
