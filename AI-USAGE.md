# AI Usage

AI assistance was used as allowed by the assignment.

## Tools used

- OpenAI ChatGPT — requirements decomposition, architecture review, code scaffolding, edge-case analysis, documentation drafting, and test-case generation.
- Local Python/runtime tools — dataset profiling and validation of the supplied 10,000-row JSON.

## Where AI was used

- Translating the PDF requirements into frontend/backend acceptance criteria.
- Designing the PostgreSQL schema and API contract.
- Drafting React component boundaries and CSS token structure.
- Generating initial FastAPI route/model/test scaffolding.
- Reviewing data-quality edge cases such as mixed timestamps, null categories, lowercase statuses, string amounts, and negative values.
- Drafting README, assumptions, and technical-decision documentation.

## Examples of AI output changed or thrown away

### Example 1 — treating the dataset as clean

An initial approach assumed every `amount` was already numeric and every `timestamp` was ISO-8601. Profiling the supplied JSON showed string amounts, Unix-millisecond timestamps, date-only values, timezone-less `dd/mm/yyyy` values, and other variants. That approach was discarded. The final seed explicitly normalizes each supported source representation before insertion.

### Example 2 — awarding coins from all successful amounts

A naive reward calculation would use `floor(amount / 100)` for every successful row. The supplied data contains negative successful amounts, so that could produce nonsensical negative coin awards. The final business rule uses `floor(max(amount, 0) / 100)` and applies the documented per-transaction cap.

### Example 3 — browser-side 10k-row filtering

A browser-only approach would technically work for 10,000 rows, but the assignment explicitly calls server-side filtering/pagination the stronger implementation. The final architecture uses PostgreSQL for filtering, sorting, aggregation, and pagination so the client only receives the current page.

The final code was reviewed and adjusted to match the assignment rather than copied blindly from generated output.
