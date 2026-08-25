"use client";

import { useState } from "react";
import type { Filters } from "../types";
import { SearchIcon, SlidersIcon, XIcon } from "./Icons";

const categories = [
  "Travel", "Shopping", "Utilities", "Food & Dining", "Health", "Education",
  "Entertainment", "Groceries", "Fuel", "Insurance", "Uncategorised",
];
const statuses = ["SUCCESS", "PENDING", "FAILED"];

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const [advanced, setAdvanced] = useState(false);
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const hasFilters = Boolean(filters.category || filters.status || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount);

  return (
    <section className="filter-card" aria-label="Transaction filters">
      <div className="filter-top">
        <label className="search-box">
          <SearchIcon />
          <span className="sr-only">Search merchant</span>
          <input
            value={filters.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Search merchants…"
            autoComplete="off"
          />
          {filters.search && <button type="button" className="icon-button subtle" onClick={() => update("search", "")} aria-label="Clear search"><XIcon /></button>}
        </label>
        <button type="button" className={`filter-toggle ${advanced ? "active" : ""}`} onClick={() => setAdvanced((value) => !value)}>
          <SlidersIcon /> Filters {hasFilters && <span className="filter-dot" aria-label="Filters active" />}
        </button>
      </div>

      {advanced && (
        <div className="advanced-filters">
          <label>
            <span>Category</span>
            <select value={filters.category} onChange={(event) => update("category", event.target.value)}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={filters.status} onChange={(event) => update("status", event.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label><span>From</span><input type="date" value={filters.startDate} onChange={(event) => update("startDate", event.target.value)} /></label>
          <label><span>To</span><input type="date" value={filters.endDate} onChange={(event) => update("endDate", event.target.value)} /></label>
          <label><span>Min amount</span><input inputMode="decimal" type="number" step="0.01" value={filters.minAmount} onChange={(event) => update("minAmount", event.target.value)} placeholder="₹ 0" /></label>
          <label><span>Max amount</span><input inputMode="decimal" type="number" step="0.01" value={filters.maxAmount} onChange={(event) => update("maxAmount", event.target.value)} placeholder="₹ 50,000" /></label>
          {hasFilters && (
            <button type="button" className="clear-filters" onClick={() => onChange({ ...filters, category: "", status: "", startDate: "", endDate: "", minAmount: "", maxAmount: "" })}>
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}
