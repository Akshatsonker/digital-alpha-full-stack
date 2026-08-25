"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import type { Analytics } from "../types";

const chartColors = ["#6d5dfc", "#1f9d8f", "#e8a23a", "#e65c78", "#4d82d8", "#7b8b9a", "#c65bb3", "#47a66d", "#e27b46", "#5b6bd5", "#9b7c52"];

function money(value: number) { return `₹${Math.round(value).toLocaleString("en-IN")}`; }

export function SpendCharts({ analytics, onCategoryClick }: { analytics: Analytics | null; onCategoryClick: (category: string) => void }) {
  const categories = analytics?.category ?? [];
  const monthly = (analytics?.monthly ?? []).map((item) => ({ ...item, amount: Number(item.amount) }));

  return (
    <section className="charts-grid" aria-label="Spending analytics">
      <article className="panel chart-panel category-chart">
        <div className="panel-heading">
          <div><span className="eyebrow">Breakdown</span><h2>Where your money goes</h2></div>
          <span className="chart-hint">Click a slice to filter</span>
        </div>
        <div className="donut-wrap">
          {categories.length ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={2}
                    stroke="none"
                    onClick={(entry) => onCategoryClick(String(entry.category))}
                    cursor="pointer"
                  >
                    {categories.map((entry, index) => <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => money(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center"><strong>{categories.length}</strong><span>categories</span></div>
            </>
          ) : <EmptyChart />}
        </div>
        <div className="legend-list">
          {categories.slice(0, 6).map((item, index) => (
            <button key={item.category} type="button" onClick={() => onCategoryClick(item.category)} className="legend-item">
              <span className="legend-swatch" style={{ background: chartColors[index % chartColors.length] }} />
              <span>{item.category}</span>
              <strong>{money(Number(item.amount))}</strong>
            </button>
          ))}
        </div>
      </article>

      <article className="panel chart-panel trend-chart">
        <div className="panel-heading">
          <div><span className="eyebrow">Momentum</span><h2>Monthly spending</h2></div>
          <span className="chart-hint">Successful payments</span>
        </div>
        <div className="trend-wrap">
          {monthly.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                <defs><linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6d5dfc" stopOpacity={0.25} /><stop offset="100%" stopColor="#6d5dfc" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#ece9f5" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#858297", fontSize: 11 }} tickFormatter={(value) => value.slice(2)} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#858297", fontSize: 11 }} tickFormatter={(value) => `₹${Math.round(Number(value) / 1000)}k`} width={42} />
                <Tooltip formatter={(value) => money(Number(value))} labelFormatter={(label) => `Month: ${label}`} />
                <Area type="monotone" dataKey="amount" stroke="#6d5dfc" strokeWidth={2.5} fill="url(#spendFill)" activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
        <div className="trend-summary"><span>Trend across the active filter</span><span className="line-chip" /></div>
      </article>
    </section>
  );
}

function EmptyChart() { return <div className="chart-empty">No spend data for these filters.</div>; }
