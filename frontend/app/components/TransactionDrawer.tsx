"use client";

import type { Transaction } from "../types";
import { XIcon } from "./Icons";

function money(value: string | number) {
  const n = Number(value);
  return `${n < 0 ? "−" : ""}₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function dateTime(value: string) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short" }).format(new Date(value)); }

export function TransactionDrawer({ transaction, onClose }: { transaction: Transaction | null; onClose: () => void }) {
  if (!transaction) return null;
  const rows = [
    ["Record ID", transaction.id],
    ["Source transaction ID", transaction.source_id],
    ["Date & time", dateTime(transaction.occurred_at)],
    ["Category", transaction.category || "Uncategorised"],
    ["Payment method", transaction.payment_method],
    ["Currency", transaction.currency],
  ];
  return (
    <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title">
        <div className="drawer-header"><div><span className="eyebrow">Transaction detail</span><h2 id="transaction-detail-title">{transaction.merchant}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close transaction detail"><XIcon /></button></div>
        <div className="drawer-amount"><span>Amount</span><strong className={Number(transaction.amount) < 0 ? "negative" : ""}>{money(transaction.amount)}</strong><span className={`status-pill ${transaction.status.toLowerCase()}`}><i />{transaction.status}</span></div>
        <dl className="detail-list">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <div className="drawer-note"><span>Rewards</span><p>{transaction.status === "SUCCESS" && Number(transaction.amount) > 0 ? `${Math.min(Math.floor(Number(transaction.amount) / 100), 50)} coins earned from this payment.` : "No coins earned from this transaction."}</p></div>
      </aside>
    </div>
  );
}
