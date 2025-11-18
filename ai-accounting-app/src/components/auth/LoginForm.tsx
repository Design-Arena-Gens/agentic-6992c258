'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounting } from '@/context/AccountingContext';

export function LoginForm() {
  const { login, profile } = useAccounting();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) {
      router.replace('/register');
      return;
    }
    const form = new FormData(event.currentTarget);
    const pin = (form.get('pin') as string) ?? '';
    if (pin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }
    setLoading(true);
    const success = login(pin);
    if (!success) {
      setError('Invalid PIN. Try again or use security questions.');
      setLoading(false);
      return;
    }
    setTimeout(() => {
      setLoading(false);
      router.push('/workspace');
    }, 500);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="pin">
          4-digit PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          maxLength={4}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg tracking-widest text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="••••"
          required
        />
      </div>

      {error && <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {loading ? 'Authenticating…' : 'Enter Workspace'}
      </button>

      <button
        type="button"
        onClick={() => router.push('/recover')}
        className="w-full text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
      >
        Forgot PIN? Use security questions
      </button>
    </form>
  );
}
