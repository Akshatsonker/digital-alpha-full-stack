import type { Analytics, Filters, RewardsResponse, Transaction, TransactionPage } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

function buildQuery(filters: Filters, page?: number, pageSize?: number) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (pageSize) params.set("page_size", String(pageSize));
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.startDate) params.set("start_date", filters.startDate);
  if (filters.endDate) params.set("end_date", filters.endDate);
  if (filters.minAmount !== "") params.set("min_amount", filters.minAmount);
  if (filters.maxAmount !== "") params.set("max_amount", filters.maxAmount);
  params.set("sort_by", filters.sortBy);
  params.set("sort_order", filters.sortOrder);
  return params;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.detail) message = body.detail;
    } catch {
      // Keep the generic HTTP message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

