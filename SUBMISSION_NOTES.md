# Submission Notes

Use these points in the final email after pushing/deploying:

- **GitHub:** `<public-repository-url>`
- **Frontend:** `<deployed-frontend-url>`
- **Backend:** `<deployed-backend-url>`

## Done

- Responsive transactions/rewards dashboard backed by FastAPI + PostgreSQL.
- Server-side pagination, merchant search, combined filters, sorting, transaction detail drawer.
- Category and monthly spend analytics with chart-to-table filtering.
- Five-reward catalogue and atomic redeem validation.
- Relational PostgreSQL schema, repeatable seed, tests, assumptions, decisions, and AI usage documentation.

## Not done

- Live URLs are not included in this local deliverable because no hosting credentials/environment were available.
- Walkthrough video is not included.

## Biggest assumptions

1. One demo user because the supplied data has no user/account identity.
2. 50-coin per-transaction cap because the brief says the earning is capped but does not specify the cap value.
3. Spend analytics use successful positive transactions; negative successful amounts are treated as refunds and earn no coins.
