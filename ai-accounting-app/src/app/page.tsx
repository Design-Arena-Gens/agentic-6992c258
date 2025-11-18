'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounting } from '@/context/AccountingContext';

const highlights = [
  'One-click GST-ready invoicing with auto tax computation',
  'AI narration to smartly convert Hindi, Hinglish or English notes into balanced journal entries',
  'Inventory valuation with supplier trails and HSN intelligence',
  'Live CFO dashboard with trend analytics and compliance alerts',
];

export default function Home() {
  const { profile, sessionToken, hydrated } = useAccounting();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (sessionToken) {
      router.replace('/workspace');
    }
  }, [hydrated, router, sessionToken]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-indigo-100 bg-white/80 p-10 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">AuroraBooks AI Accounting</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              Finance cockpit for modern Indian accounting firms.
            </h1>
            <p className="mt-4 text-base text-slate-600">
              Automate journals, orchestrate GST filings, control inventory and craft polished invoices powered by
              domain-trained intelligence.
            </p>
          </div>
          <div className="flex w-full max-w-[220px] flex-col gap-3 text-sm text-slate-600">
            {highlights.map((item) => (
              <div key={item} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-sm">
                <p className="font-medium text-indigo-600">• {item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <button
            onClick={() => router.push(profile ? '/login' : '/register')}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-indigo-700"
          >
            {profile ? 'Enter with PIN' : 'Register Firm'}
          </button>
          <button
            onClick={() => router.push('/workspace')}
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            Explore workspace
          </button>
        </div>
      </div>
    </div>
  );
}
