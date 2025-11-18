'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounting } from '@/context/AccountingContext';

const questionTemplates = [
  'What is your favorite accounting principle?',
  'What is the name of your first auditor?',
  'Which city was your firm founded in?',
];

const organizationTypes = [
  'Proprietorship',
  'Partnership',
  'Private Limited',
  'Public Limited',
  'LLP',
  'Trust',
  'Society',
];

export function RegisterForm() {
  const { registerFirm, profile } = useAccounting();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (profile) {
      router.replace('/login');
      return;
    }
    const form = new FormData(event.currentTarget);
    const securityQuestions = Array.from({ length: 3 }).map((_, index) => ({
      question: (form.get(`security_question_${index}`) as string) || questionTemplates[index],
      answer: (form.get(`security_answer_${index}`) as string) ?? '',
    }));

    if (securityQuestions.some((item) => !item.answer.trim())) {
      setError('Please answer all security questions');
      return;
    }

    const pin = (form.get('pin') as string) ?? '';
    const confirmPin = (form.get('confirm_pin') as string) ?? '';
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN confirmation does not match');
      return;
    }

    const firmProfile = {
      firmName: (form.get('firm_name') as string) ?? '',
      organizationType: (form.get('organization_type') as string) ?? '',
      gstNumber: (form.get('gst_number') as string) ?? '',
      panNumber: (form.get('pan_number') as string) ?? '',
      taxRegistration: (form.get('tax_registration') as string) ?? '',
      bankName: (form.get('bank_name') as string) ?? '',
      bankAccountNumber: (form.get('bank_account') as string) ?? '',
      ifscCode: (form.get('ifsc_code') as string) ?? '',
      businessAddress: (form.get('business_address') as string) ?? '',
      pin,
      securityQuestions,
      createdAt: new Date().toISOString(),
    };

    if (!firmProfile.firmName.trim()) {
      setError('Firm name is required');
      return;
    }

    setError(null);
    setLoading(true);
    registerFirm(firmProfile);
    setTimeout(() => {
      setLoading(false);
      router.push('/login');
    }, 600);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Firm Name</span>
          <input
            name="firm_name"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Acme & Co."
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Organization Type</span>
          <select
            name="organization_type"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          >
            <option value="">Select type</option>
            {organizationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">GST Number</span>
          <input
            name="gst_number"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase"
            placeholder="22ABCDE1234F1Z5"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">PAN Number</span>
          <input
            name="pan_number"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase"
            placeholder="ABCDE1234F"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Tax Registration Details</span>
          <input
            name="tax_registration"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="CIN / TAN / Professional Tax"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Business Address</span>
          <textarea
            name="business_address"
            className="min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Registered office address"
            required
          />
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Bank Name</span>
          <input
            name="bank_name"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="HDFC Bank"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Account Number</span>
          <input
            name="bank_account"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="123456789012"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">IFSC Code</span>
          <input
            name="ifsc_code"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase"
            placeholder="HDFC0001234"
            required
          />
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">4-digit PIN</span>
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="****"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Confirm PIN</span>
          <input
            name="confirm_pin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="****"
            required
          />
        </label>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {questionTemplates.map((question, index) => (
          <div key={question} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
            <label className="flex flex-col gap-3">
              <div>
                <span className="text-sm font-semibold text-indigo-600">Security Question {index + 1}</span>
                <input
                  name={`security_question_${index}`}
                  defaultValue={question}
                  className="mt-2 w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <input
                name={`security_answer_${index}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Your answer"
                required
              />
            </label>
          </div>
        ))}
      </section>

      {error && <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {loading ? 'Registering…' : 'Register Firm'}
      </button>
    </form>
  );
}
