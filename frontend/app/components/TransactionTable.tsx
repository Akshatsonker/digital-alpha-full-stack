"use client";

import type { Filters, Transaction, TransactionPage } from "../types";
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";

function money(amount: string | number) {
  const value = Number(amount);
  return `${value < 0 ? "−" : ""}₹${Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
function categoryLabel(value: string | null) { return value || "Uncategorised"; }

interface Props {
  data: TransactionPage | null;
  loading: boolean;
  error: string | null;
  filters: Filters;
  onChange: (next: Filters) => void;
  onPage: (page: number) => void;
  onRow: (transaction: Transaction) => void;
}

export function TransactionTable({ data, loading, error, filters, onChange, onPage, onRow }: Props) {
  const toggleSort = (field: "date" | "amount") => {
    onChange({ ...filters, sortBy: field, sortOrder: filters.sortBy === field && filters.sortOrder === "desc" ? "asc" : "desc" });
  };
  const sortIcon = (field: "date" | "amount") => filters.sortBy === field ? (filters.sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />) : null;

  return (
    <section className="panel table-panel">
      <div className="panel-heading table-heading">
        <div><span className="eyebrow">Ledger</span><h2>Transactions</h2></div>
        {data && <span className="result-count">{data.total.toLocaleString("en-IN")} results</span>}
      </div>
      <div className="table-scroll">
        <table className="transactions-table">
          <thead>
            <tr>
              <th><button type="button" className="sort-button" onClick={() => toggleSort("date")}>Date {sortIcon("date")}</button></th>
              <th>Merchant</th><th>Category</th>
              <th><button type="button" className="sort-button" onClick={() => toggleSort("amount")}>Amount {sortIcon("amount")}</button></th>
              <th>Status</th><th>Method</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRows /> : error ? <StateRow message={error} tone="error" /> : data?.items.length ? data.items.map((transaction) => (
              <tr key={transaction.id} tabIndex={0} onClick={() => onRow(transaction)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onRow(transaction); } }}>
                <td className="date-cell">{dateLabel(transaction.occurred_at)}</td>
                <td><div className="merchant-cell"><span className="merchant-avatar">{transaction.merchant.slice(0, 1).toUpperCase()}</span><span className="merchant-name">{transaction.merchant}</span></div></td>
                <td><span className="category-chip">{categoryLabel(transaction.category)}</span></td>
                <td className={`amount-cell ${Number(transaction.amount) < 0 ? "negative" : ""}`}>{money(transaction.amount)}</td>
                <td><span className={`status-pill ${transaction.status.toLowerCase()}`}><i />{transaction.status}</span></td>
                <td className="method-cell">{transaction.payment_method}</td>
              </tr>
            )) : <StateRow message="No transactions match these filters." />}
          </tbody>
        </table>
      </div>
      {data && data.total > 0 && (
        <div className="pagination">
          <span>Page {data.page} of {data.total_pages}</span>
          <div className="pagination-actions">
            <button type="button" disabled={data.page <= 1} onClick={() => onPage(data.page - 1)} aria-label="Previous page"><ChevronLeftIcon /></button>
            <button type="button" disabled={data.page >= data.total_pages} onClick={() => onPage(data.page + 1)} aria-label="Next page"><ChevronRightIcon /></button>
          </div>
        </div>
      )}
    </section>
  );
}

function LoadingRows() {
  return Array.from({ length: 7 }).map((_, index) => <tr key={index} className="skeleton-row"><td colSpan={6}><span /></td></tr>);
}
function StateRow({ message, tone = "empty" }: { message: string; tone?: "empty" | "error" }) {
  return <tr><td colSpan={6}><div className={`table-state ${tone}`}>{message}</div></td></tr>;
}
