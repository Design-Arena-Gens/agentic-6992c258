'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAccounting } from '@/context/AccountingContext';

export default function RegisterPage() {
  const { profile, hydrated } = useAccounting();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && profile) {
      router.replace('/login');
    }
  }, [hydrated, profile, router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-indigo-100 bg-white/90 p-10 shadow-xl backdrop-blur">
        <div className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Onboard firm</p>
          <h1 className="text-3xl font-semibold text-slate-900">Register your practice with compliance intelligence</h1>
          <p className="text-sm text-slate-500">
            Capture GST, PAN, banking and control credentials to unlock the AI-powered accounting desk.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
