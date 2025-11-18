'use client';

import { AccountingProvider } from '@/context/AccountingContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AccountingProvider>{children}</AccountingProvider>;
}
