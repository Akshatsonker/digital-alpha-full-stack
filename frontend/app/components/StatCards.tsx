import type { Analytics, TransactionPage } from "../types";
import { TrendIcon } from "./Icons";

function num(value: string | number) { return Number(value); }
function inr(value: number) { return `₹${Math.round(value).toLocaleString("en-IN")}`; }

export function StatCards({ transactions, analytics }: { transactions: TransactionPage | null; analytics: Analytics | null }) {
  const spend = analytics?.category.reduce((sum, item) => sum + num(item.amount), 0) ?? 0;
  const categoryCount = analytics?.category.length ?? 0;
  const monthly = analytics?.monthly ?? [];
  const latest = monthly.at(-1)?.amount ? num(monthly.at(-1)!.amount) : 0;
  const previous = monthly.at(-2)?.amount ? num(monthly.at(-2)!.amount) : 0;
  const change = previous ? ((latest - previous) / previous) * 100 : null;

  return (
    <div className="stat-grid">
      <article className="stat-card primary">
        <div className="stat-label">Successful spend</div>
        <div className="stat-value">{inr(spend)}</div>
        <div className="stat-foot"><span>Current filter scope</span><span className="mini-dot" /></div>
      </article>
      <article className="stat-card">
        <div className="stat-label">Transactions found</div>
        <div className="stat-value">{transactions?.total.toLocaleString("en-IN") ?? "—"}</div>
        <div className="stat-foot"><span>Across {categoryCount || "—"} spend categories</span></div>
      </article>
      <article className="stat-card">
        <div className="stat-label">Latest month</div>
        <div className="stat-value">{latest ? inr(latest) : "—"}</div>
        <div className={`stat-foot ${change !== null && change >= 0 ? "positive" : "muted"}`}><TrendIcon />{change === null ? "Not enough history" : `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs prior month`}</div>
      </article>
    </div>
  );
}
