'use client';

import { useRouter } from 'next/navigation';
import { RecoveryForm } from '@/components/auth/RecoveryForm';
import { useAccounting } from '@/context/AccountingContext';

export default function RecoverPage() {
  const { profile, hydrated } = useAccounting();
  const router = useRouter();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading security prompts...
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-indigo-100 bg-white/90 p-10 shadow-xl backdrop-blur">
        <div className="mb-6 space-y-2">
          <button onClick={() => router.back()} className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            ← back
          </button>
          <h1 className="text-3xl font-semibold text-slate-900">Recover with security questions</h1>
          <p className="text-sm text-slate-500">
            Answer the questions you configured while onboarding your firm to automatically regain access.
          </p>
        </div>
        {profile ? <RecoveryForm /> : <p className="text-sm text-slate-500">No firm registered yet.</p>}
      </div>
    </div>
  );
}
