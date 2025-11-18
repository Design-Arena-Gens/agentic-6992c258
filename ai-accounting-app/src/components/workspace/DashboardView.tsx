'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAccounting } from '@/context/AccountingContext';

const palette = {
  sales: '#4f46e5',
  purchases: '#0ea5e9',
  expenses: '#fb7185',
};

export function DashboardView() {
  const { computeDashboard } = useAccounting();
  const summary = useMemo(() => computeDashboard(), [computeDashboard]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {summary.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{metric.label}</span>
              <span
                className={`text-[10px] uppercase ${
                  metric.delta >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {metric.delta >= 0 ? '+' : ''}
                {metric.delta.toFixed(1)}%
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">₹{formatINR(metric.value)}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Sales Velocity">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={summary.trends.sales}>
              <defs>
                <linearGradient id="gradientSales" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor={palette.sales} stopOpacity={0.55} />
                  <stop offset="95%" stopColor={palette.sales} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} labelFormatter={(label) => label} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={palette.sales}
                fillOpacity={1}
                fill="url(#gradientSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Expense Footprint">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={summary.trends.expenses}>
              <defs>
                <linearGradient id="gradientExpenses" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor={palette.expenses} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={palette.expenses} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} labelFormatter={(label) => label} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={palette.expenses}
                fillOpacity={1}
                fill="url(#gradientExpenses)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </section>
    </div>
  );
}

type CardProps = {
  title: string;
  children: React.ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function formatINR(value: number) {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
