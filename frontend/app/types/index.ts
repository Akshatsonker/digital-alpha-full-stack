export type TransactionStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface Transaction {
  id: number;
  source_id: string;
  occurred_at: string;
  merchant: string;
  category: string | null;
  amount: string | number;
  currency: string;
  status: TransactionStatus;
  payment_method: string;
}

export interface TransactionPage {
  items: Transaction[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface CategorySpend {
  category: string;
  amount: string | number;
  transaction_count: number;
}

export interface MonthlySpend {
  month: string;
  amount: string | number;
  transaction_count: number;
}

export interface Analytics {
  category: CategorySpend[];
  monthly: MonthlySpend[];
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  coin_cost: number;
  reward_type: string;
  value_inr: string | number;
  active: boolean;
}

export interface RewardsResponse {
  coin_balance: number;
  rewards: Reward[];
}

export interface Filters {
  search: string;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
}
