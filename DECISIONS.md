# Technical Decisions

## 1. Next.js + TypeScript

The brief prefers Next.js and explicitly weights React patterns, TypeScript, component structure, state, CSS, and UI craft highly. The frontend therefore uses Next.js App Router with TypeScript.

## 2. Server-side pagination/filtering/sorting

The dataset is exactly 10,000 rows. Pagination and filtering are handled by PostgreSQL rather than shipping all rows to the browser. This keeps initial payloads small and makes the architecture scale beyond the supplied dataset.

## 3. Hand-built table

The assignment specifically prohibits MUI, Ant, Chakra, shadcn and similar table components. The transaction table is plain semantic HTML with custom CSS for sticky headers, hover/focus states, responsive layout, loading/empty/error states, and pagination.

## 4. Relational schema

Transactions are stored in typed PostgreSQL columns instead of a JSON blob. `NUMERIC(15,2)` is used for money, `TIMESTAMPTZ` for normalized timestamps, and check constraints enforce supported statuses. A separate user balance and redemption ledger keeps reward state auditable. The source dataset contains 40 duplicated transaction IDs, so the table uses a generated `BIGSERIAL` record ID and preserves the supplied ID as `source_id`; this is necessary to retain all 10,000 source rows.

## 5. SQLAlchemy + psycopg

SQLAlchemy provides a small separation between API routes, data access, and database models while psycopg 3 provides the PostgreSQL driver. The application uses SQLAlchemy Core/ORM deliberately rather than hiding business rules in a large framework.

## 6. Recharts

The brief allows Recharts/Chart.js/D3. Recharts gives responsive SVG charts with click handlers without introducing unnecessary custom charting code.

## 7. Analytics endpoint

The analytics endpoint accepts the same filters as the transactions endpoint. This means the UI can provide a useful two-way interaction: table filters reshape charts, and clicking a category chart slice sets the category table filter.

## 8. Reward redemption transaction

A redeem is a business transaction: validate reward, lock balance row, verify balance, insert redemption, decrement balance, commit. This makes insufficient-balance failures atomic rather than relying on a fragile frontend-only check.

## 9. Demo-user model

There is no authentication or user identifier in the supplied data. Adding fake authentication would increase scope without improving the requested core. A seeded demo user is therefore explicit and documented.

## 10. CSS design tokens

Global CSS variables define color, spacing, radius, shadows, and typography. Components consume those tokens instead of scattering one-off values throughout the UI.

## 11. API error contract

FastAPI returns standard HTTP errors with human-readable `detail` messages. The frontend converts those messages into a visible error state/toast and refreshes the balance after successful redemption.

## 12. Currency

The supplied dataset is entirely INR, so the UI uses Indian-number formatting and the rupee symbol.

## 13. Compose startup ordering

PostgreSQL has an explicit healthcheck, a one-shot seed service runs only after the database is ready, and the API waits for seed completion. This prevents a race between database startup and seeding and avoids reseeding on every API container restart.

## 14. Deployment choice

The repository includes Dockerfiles and Compose for reproducibility. The browser defaults to a same-origin `/api` path and Next.js proxies that path to FastAPI using `BACKEND_API_URL`. This avoids the common deployment mistake of relying on a `NEXT_PUBLIC_*` value that was not present when the client bundle was built. The architecture is also compatible with the vendors named in the assignment, but this environment cannot publish a public deployment, so live URLs remain TODO in the README.
