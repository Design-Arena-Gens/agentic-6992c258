'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAccounting } from '@/context/AccountingContext';

export default function LoginPage() {
  const { profile, sessionToken, hydrated } = useAccounting();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !profile) {
      router.replace('/register');
    }
  }, [hydrated, profile, router]);

  useEffect(() => {
    if (hydrated && sessionToken) {
      router.replace('/workspace');
    }
  }, [hydrated, router, sessionToken]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Preparing secure login...
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-indigo-100 bg-white/90 p-10 shadow-xl backdrop-blur">
        <div className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Secure PIN login</p>
          <h1 className="text-3xl font-semibold text-slate-900">Access your AI accounting cockpit</h1>
          <p className="text-sm text-slate-500">Enter your 4-digit control PIN to unlock ledgers, reports and billing.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
