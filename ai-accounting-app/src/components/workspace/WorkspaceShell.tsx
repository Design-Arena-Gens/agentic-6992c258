'use client';

import { ReactNode, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useAccounting } from '@/context/AccountingContext';

type WorkspaceTab = 'dashboard' | 'journal' | 'reports' | 'inventory' | 'invoicing';

type WorkspaceShellProps = {
  dashboard: ReactNode;
  journal: ReactNode;
  reports: ReactNode;
  inventory: ReactNode;
  invoicing: ReactNode;
};

const tabConfig: { key: WorkspaceTab; label: string; description: string }[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'overview & analytics' },
  { key: 'journal', label: 'Journal', description: 'transactions & postings' },
  { key: 'reports', label: 'Reports', description: 'financial statements' },
  { key: 'inventory', label: 'Inventory', description: 'stock & costing' },
  { key: 'invoicing', label: 'Invoicing', description: 'client billing' },
];

export function WorkspaceShell({ dashboard, journal, reports, inventory, invoicing }: WorkspaceShellProps) {
  const { profile, logout } = useAccounting();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');

  const activeView = useMemo(() => {
    switch (activeTab) {
      case 'journal':
        return journal;
      case 'reports':
        return reports;
      case 'inventory':
        return inventory;
      case 'invoicing':
        return invoicing;
      case 'dashboard':
      default:
        return dashboard;
    }
  }, [activeTab, dashboard, inventory, invoicing, journal, reports]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{profile?.firmName ?? 'AI Accounting'}</h1>
            <p className="text-xs uppercase tracking-widest text-indigo-500">
              Intelligent Accounting Control Centre
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-slate-500">
              <p>{profile?.organizationType}</p>
              <p>GST: {profile?.gstNumber}</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="border-t border-slate-100 bg-slate-50/80">
          <div className="mx-auto flex max-w-6xl gap-2 px-4 py-2">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'group flex flex-1 flex-col items-start rounded-lg px-3 py-2 text-left transition-all',
                  activeTab === tab.key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:bg-white/80 hover:text-indigo-500',
                )}
              >
                <span className="text-sm font-semibold">{tab.label}</span>
                <span className="text-[11px] uppercase tracking-widest group-hover:tracking-[0.2em]">
                  {tab.description}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-6">{activeView}</main>
    </div>
  );
}
