# Digital Alpha — Spend & Rewards Dashboard

A polished full-stack slice for the Digital Alpha Technologies take-home assignment: a responsive transactions dashboard, spending analytics, and rewards redemption flow backed by FastAPI and PostgreSQL.

## What is included

- **Transactions:** server-side pagination, merchant search, category/date/amount/status filters, combined filters, date/amount sorting, and a responsive hand-built table.
- **Transaction detail:** accessible slide-over drawer with the complete transaction record.
- **Analytics:** category spend donut + monthly successful-spend trend. Chart clicks feed back into the transaction category filter; the charts use the same active filters as the table.
- **Rewards:** visible coin balance, five reward choices, select → confirm → done flow, and backend validation for unknown rewards / insufficient balance.
- **Data quality handling:** the supplied JSON contains mixed timestamp formats, numeric strings, null/empty categories, lowercase status values, negative amounts, and duplicate source transaction IDs. The seed normalizes the values into a stable relational schema while preserving every source record in `backend/data/transactions.json`.
- **Testing:** redeem validation tests plus transaction filtering coverage.

## Stack

- Next.js + React + TypeScript
- Recharts
- FastAPI + Pydantic + SQLAlchemy 2 + psycopg 3
- PostgreSQL 18
- Pytest
- Docker Compose for local Postgres/backend/frontend orchestration

The assignment explicitly asks for PostgreSQL, a real schema, a documented seed command, and a frontend table built without a component-library table. This project follows those constraints.

## Local setup — under five minutes

### Option A: Docker Compose (recommended)

Requirements: Docker Desktop.

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs
- API health: http://localhost:8000/api/health

A dedicated seed container waits for PostgreSQL readiness, loads the supplied dataset, and then the API starts. This avoids resetting the balance every time the backend container restarts.

### Option B: run services separately

#### 1. PostgreSQL

Create a PostgreSQL 16+ database (18 is preferred by the brief) and set:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE
CORS_ORIGINS=http://localhost:3000
```

#### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Then:

```bash
npm run dev
```

Open http://localhost:3000.

## Seed command

The documented one-command seed is:

```bash
cd backend
python -m app.seed
```

It creates the relational schema from `schema.sql`, clears demo data, loads all 10,000 supplied transactions (including records whose source `id` is duplicated), and calculates the starting coin balance from successful payments.

The seed is deliberately idempotent: re-running it replaces the demo transaction/reward state instead of creating duplicates.

## API

### `GET /api/transactions`

Query parameters:

- `page`, `page_size`
- `search`
- `category`
- `status`
- `start_date`, `end_date`
- `min_amount`, `max_amount`
- `sort_by=date|amount`
- `sort_order=asc|desc`

### `GET /api/analytics`

Accepts the same filter parameters and returns category totals and monthly totals. Analytics intentionally represent **spend** as successful, positive-value transactions.

### `GET /api/rewards`

Returns the five reward catalogue entries and the current coin balance.

### `GET /api/balance`

Returns the current coin balance.

### `POST /api/rewards/redeem`

Body:

```json
{"reward_id":"cashback_100"}
```

The backend validates the reward and balance inside a database transaction. A failed redemption does not mutate the balance.

## Testing

From `backend/`:

```bash
pytest
```

The tests cover timestamp/status/amount normalization, the 10,000-row dataset shape and duplicate source IDs, plus successful redemption, insufficient balance, and unknown-reward validation.

## Production / deployment

The frontend is designed for Vercel/Netlify and the backend for Render/Railway/Fly with a managed PostgreSQL provider such as Neon/Supabase/Railway. Set `NEXT_PUBLIC_API_URL` on the frontend and `DATABASE_URL` + `CORS_ORIGINS` on the backend.

For a public submission, add the deployed URLs below before sending the repo:

- Frontend: **TODO — add deployed URL**
- Backend: **TODO — add deployed URL**

## Done / not-done / known issues

### Done

- Full 10k-row dataset loaded into PostgreSQL
- Server-side filtering, search, sorting, and pagination
- Responsive custom table
- Transaction detail drawer
- Category and monthly spend analytics
- Chart-to-table category filtering
- Rewards catalogue and redeem flow
- Atomic backend balance validation
- Relational schema + repeatable seed
- API and backend tests
- AI usage / assumptions / decisions documentation

### Not done

- No live deployment is included from this local build environment.
- No walkthrough video is included.

### Known / deliberate limitations

- This is a single-user demo rather than an authenticated multi-user product; the brief does not provide user/account data.
- Reward redemptions are stored as a demo ledger but are not connected to a real payment provider.
- The data's inconsistent source timestamp formats are normalized during seed; see `ASSUMPTIONS.md`.

## Repository documents

- `ASSUMPTIONS.md` — product calls made where the brief was intentionally vague.
- `DECISIONS.md` — important architecture and frontend/backend decisions.
- `AI-USAGE.md` — tools used and examples of generated output that was changed/rejected.
- `schema.sql` — explicit PostgreSQL schema.
