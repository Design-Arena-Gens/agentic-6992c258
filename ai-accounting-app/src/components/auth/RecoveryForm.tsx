'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounting } from '@/context/AccountingContext';

export function RecoveryForm() {
  const { profile, verifySecurityAnswers, login } = useAccounting();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  if (!profile) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
        No firm is registered yet. Please register your firm first.
      </div>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const answers = profile.securityQuestions.map((_, index) => (form.get(`answer_${index}`) as string) ?? '');
    if (verifySecurityAnswers(answers)) {
      setSucceeded(true);
      login(profile.pin);
      setTimeout(() => router.push('/workspace'), 600);
    } else {
      setError('Security answers do not match our records.');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {profile.securityQuestions.map((item, index) => (
          <label key={item.question} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">{item.question}</span>
            <input
              name={`answer_${index}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your answer"
              required
            />
          </label>
        ))}
      </div>
      {error && <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800">{error}</div>}
      {succeeded && (
        <div className="rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-700">
          Answers verified. Redirecting to workspace…
        </div>
      )}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        Verify & Sign In
      </button>
    </form>
  );
}
