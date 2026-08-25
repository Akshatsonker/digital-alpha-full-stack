# Product Assumptions

The assignment intentionally leaves several product details open. These are the choices used in this implementation.

1. **Single demo user.** No authentication/user dataset is supplied, so the dashboard represents one demo account. The backend uses `user_id = 1` for the balance and redemption ledger.
2. **Coin earning formula.** A successful payment earns `floor(max(amount, 0) / 100)` coins, with a **50-coin cap per transaction**. The brief specifies one coin per ₹100 and says the reward is capped, but does not state the cap value; 50 is a simple, visible product rule.
3. **Negative amounts.** The source data includes negative successful amounts. These are treated as refunds/credits and earn **0 coins**; they remain visible in transactions because the source data should not be silently removed.
4. **Spend analytics.** “Spend” means successful transactions with a positive amount. Failed and pending payments do not contribute to category or monthly spend totals, and negative refunds are excluded from spend totals. This avoids presenting unsuccessful or refund rows as actual spend.
5. **Category cleanup.** Empty strings and null categories are stored as `NULL` and displayed as `Uncategorised`. Filtering has an explicit `Uncategorised` option.
6. **Status normalization.** Source statuses are normalized case-insensitively (`success` → `SUCCESS`) because status is a finite business value.
7. **Timestamp normalization.** ISO timestamps retain their offsets; Unix timestamps are interpreted as milliseconds since Unix epoch; date-only and timezone-less source strings are interpreted as UTC. This is deterministic for seed/replay.
8. **Date filtering.** UI date filters represent inclusive calendar dates. The API converts the end date into an exclusive next-day boundary.
9. **Amount filtering.** Amounts are parsed as decimal numbers and filtering uses the stored numeric value. Negative transactions can therefore be found with a negative minimum.
10. **Reward catalogue.** Five demo rewards are seeded: ₹100 cashback, ₹250 shopping voucher, ₹500 travel voucher, ₹250 food voucher, and ₹1,000 statement cashback. Costs are intentionally simple for the take-home and are not meant to model a real loyalty programme.
11. **Redemption concurrency.** The balance update is protected by a row lock inside one PostgreSQL transaction, preventing two simultaneous redeems from spending the same coins.
12. **Currency.** The supplied dataset is entirely INR, so the UI uses Indian-number formatting and the rupee symbol.
13. **Duplicate source IDs.** The supplied dataset contains 10,000 rows but only 9,960 unique source IDs; 40 source IDs occur twice. These are retained as separate transactions. PostgreSQL therefore uses an internal generated record ID and stores the supplied value as `source_id`, so no source record is dropped or overwritten.
14. **Sorting.** Date and amount sorting are server-side. The table uses the generated internal record ID as a stable secondary ordering to keep pages deterministic when values tie.
