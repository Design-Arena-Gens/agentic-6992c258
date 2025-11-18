'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { DashboardView } from '@/components/workspace/DashboardView';
import { JournalView } from '@/components/workspace/JournalView';
import { ReportsView } from '@/components/workspace/ReportsView';
import { InventoryView } from '@/components/workspace/InventoryView';
import { InvoicingView } from '@/components/workspace/InvoicingView';
import { useAccounting } from '@/context/AccountingContext';

export default function WorkspacePage() {
  const { profile, sessionToken, hydrated } = useAccounting();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!profile) {
      router.replace('/register');
    } else if (!sessionToken) {
      router.replace('/login');
    }
  }, [hydrated, profile, router, sessionToken]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Syncing your books...
      </div>
    );
  }

  if (!profile || !sessionToken) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Preparing your workspace…
      </div>
    );
  }

  return (
    <WorkspaceShell
      dashboard={<DashboardView />}
      journal={<JournalView />}
      reports={<ReportsView />}
      inventory={<InventoryView />}
      invoicing={<InvoicingView />}
    />
  );
}
