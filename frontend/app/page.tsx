"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAnalytics, fetchRewards, fetchTransactions, redeemReward } from "./lib/api";
import type { Analytics, Filters, Reward, RewardsResponse, Transaction, TransactionPage } from "./types";
import { FilterBar } from "./components/FilterBar";
import { Header } from "./components/Header";
import { RewardsPanel } from "./components/RewardsPanel";
import { SpendCharts } from "./components/SpendCharts";
import { StatCards } from "./components/StatCards";
import { Toast } from "./components/Toast";
import { TransactionDrawer } from "./components/TransactionDrawer";
import { TransactionTable } from "./components/TransactionTable";

const initialFilters: Filters = {
  search: "",
  category: "",
  status: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  sortOrder: "desc",
};

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [transactionData, setTransactionData] = useState<TransactionPage | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedTransaction(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setDataError(null);
      Promise.all([fetchTransactions(filters, page, 25, controller.signal), fetchAnalytics(filters, controller.signal)])
        .then(([transactions, spending]) => {
          if (!active) return;
          setTransactionData(transactions);
          setAnalytics(spending);
          if (transactions.total_pages > 0 && page > transactions.total_pages) setPage(transactions.total_pages);
        })
        .catch((error: unknown) => {
          if (!active || controller.signal.aborted) return;
          setDataError(error instanceof Error ? error.message : "Could not load dashboard data.");
        })
        .finally(() => { if (active && !controller.signal.aborted) setLoading(false); });
    }, 250);
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [filters, page]);

  useEffect(() => {
    fetchRewards()
      .then((data: RewardsResponse) => { setRewards(data.rewards); setBalance(data.coin_balance); })
      .catch((error: unknown) => setToast({ message: error instanceof Error ? error.message : "Could not load rewards.", error: true }));
  }, []);

  const activeFilterLabel = useMemo(() => {
    if (filters.category) return filters.category;
    if (filters.status) return filters.status;
    if (filters.search) return `“${filters.search}”`;
    return "all spending";
  }, [filters]);

  const updateFilters = (next: Filters) => {
    setFilters(next);
    setPage(1);
  };

  const handleCategoryClick = (category: string) => updateFilters({ ...filters, category: filters.category === category ? "" : category });

  const handleRedeem = async (reward: Reward) => {
    setRedeeming(true);
    try {
      const result = await redeemReward(reward.id);
      setBalance(result.coin_balance);
      setToast({ message: result.message });
    } catch (error: unknown) {
      setToast({ message: error instanceof Error ? error.message : "Redemption failed. Your balance was not changed.", error: true });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="app-shell">
      <Header balance={balance} />
      <main>
        <section className="hero">
          <div className="hero-copy"><span className="eyebrow">Personal finance</span><h1>Your money,<br /><em>in perspective.</em></h1><p>One calm view of your spending, payments and rewards.</p></div>
          <div className="hero-meta"><span className="live-dot" /> Live account view <strong>·</strong> {activeFilterLabel}</div>
        </section>

        <StatCards transactions={transactionData} analytics={analytics} />

        <div className="dashboard-stack">
          <SpendCharts analytics={analytics} onCategoryClick={handleCategoryClick} />
          <div className="transactions-section">
            <div className="section-heading"><div><span className="eyebrow">Activity</span><h2>Every payment, accounted for.</h2></div><span className="data-note">10,000 source records</span></div>
            <FilterBar filters={filters} onChange={updateFilters} />
            <TransactionTable data={transactionData} loading={loading} error={dataError} filters={filters} onChange={updateFilters} onPage={setPage} onRow={setSelectedTransaction} />
          </div>
        </div>

        <RewardsPanel balance={balance} rewards={rewards} redeeming={redeeming} onRedeem={handleRedeem} />
      </main>
      <footer className="site-footer"><span>luma / spend smarter</span><span>Built with React · FastAPI · PostgreSQL</span></footer>
      <TransactionDrawer transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
      <Toast message={toast?.message ?? null} error={toast?.error} onClose={() => setToast(null)} />
    </div>
  );
}
