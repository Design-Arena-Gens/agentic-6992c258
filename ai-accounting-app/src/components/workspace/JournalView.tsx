'use client';

import { FormEvent, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { v4 as uuid } from 'uuid';
import { useAccounting, JournalLine } from '@/context/AccountingContext';

type DraftLine = Omit<JournalLine, 'id'>;

export function JournalView() {
  const { journal, addJournalEntry, parseNarration } = useAccounting();
  const [activeMode, setActiveMode] = useState<'manual' | 'narration'>('manual');
  const [lines, setLines] = useState<DraftLine[]>([
    { account: 'Cash', type: 'debit', amount: 0 },
    { account: 'Sales Revenue', type: 'credit', amount: 0 },
  ]);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [narrationError, setNarrationError] = useState<string | null>(null);

  const handleManualSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = (form.get('date') as string) ?? '';
    const narration = (form.get('narration') as string) ?? '';
    if (!date || !narration) {
      setJournalError('Provide date and narration for the journal entry.');
      return;
    }
    const debitTotal = lines.filter((line) => line.type === 'debit').reduce((sum, line) => sum + line.amount, 0);
    const creditTotal = lines.filter((line) => line.type === 'credit').reduce((sum, line) => sum + line.amount, 0);
    if (Math.abs(debitTotal - creditTotal) > 0.01) {
      setJournalError('Debits and credits must balance before posting.');
      return;
    }

    addJournalEntry({
      date,
      narration,
      reference: (form.get('reference') as string) ?? '',
      source: 'manual',
      tags: [],
      lines: lines.map((line) => ({
        ...line,
        id: uuid(),
      })),
    });
    setJournalError(null);
    setLines([
      { account: 'Cash', type: 'debit', amount: 0 },
      { account: 'Sales Revenue', type: 'credit', amount: 0 },
    ]);
    (event.target as HTMLFormElement).reset();
  };

  const handleNarrationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = (form.get('date') as string) ?? '';
    const narration = (form.get('narration') as string) ?? '';
    const amount = parseFloat((form.get('amount') as string) ?? '0');
    const quantity = parseFloat((form.get('quantity') as string) ?? '1');
    const price = parseFloat((form.get('price') as string) ?? amount.toString());

    if (!date || !narration || amount <= 0) {
      setNarrationError('Provide a narration with a positive amount.');
      return;
    }

    const entry = parseNarration({
      date,
      narration,
      amount,
      quantity: Number.isNaN(quantity) ? undefined : quantity,
      price: Number.isNaN(price) ? undefined : price,
    });
    addJournalEntry(entry);
    setNarrationError(null);
    (event.target as HTMLFormElement).reset();
  };

  const sortedJournal = useMemo(
    () => [...journal].sort((a, b) => b.date.localeCompare(a.date)),
    [journal],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[400px,1fr]">
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveMode('manual')}
              className={clsx(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-semibold uppercase tracking-widest transition',
                activeMode === 'manual'
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow'
                  : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50',
              )}
            >
              Manual Ledger
            </button>
            <button
              onClick={() => setActiveMode('narration')}
              className={clsx(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-semibold uppercase tracking-widest transition',
                activeMode === 'narration'
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow'
                  : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50',
              )}
            >
              Smart Narration
            </button>
          </div>

          {activeMode === 'manual' ? (
            <form className="mt-4 space-y-4" onSubmit={handleManualSubmit}>
              <div className="grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Narration</label>
                <textarea
                  name="narration"
                  required
                  className="min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Describe the transaction"
                />
              </div>
              <div className="grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</label>
                <input
                  name="reference"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Voucher, invoice, PO etc."
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ledger Lines</span>
                  <button
                    type="button"
                    onClick={() =>
                      setLines((prev) => [
                        ...prev,
                        { account: 'New Account', type: 'debit', amount: 0 },
                        { account: 'New Account', type: 'credit', amount: 0 },
                      ])
                    }
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Add Debit/Credit
                  </button>
                </div>
                <div className="space-y-2">
                  {lines.map((line, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[auto,auto,1fr,auto] items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <select
                        value={line.type}
                        onChange={(event) =>
                          setLines((prev) =>
                            prev.map((item, idx) =>
                              idx === index ? { ...item, type: event.target.value as DraftLine['type'] } : item,
                            ),
                          )
                        }
                        className="rounded border border-slate-200 px-2 py-1 text-xs uppercase tracking-wide text-slate-500"
                      >
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                      </select>
                      <span className="text-xs uppercase tracking-wider text-slate-400">Account</span>
                      <input
                        value={line.account}
                        onChange={(event) =>
                          setLines((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, account: event.target.value } : item)),
                          )
                        }
                        className="rounded border border-slate-200 px-2 py-1 text-sm text-slate-700"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.amount}
                        onChange={(event) =>
                          setLines((prev) =>
                            prev.map((item, idx) =>
                              idx === index ? { ...item, amount: parseFloat(event.target.value || '0') } : item,
                            ),
                          )
                        }
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-right text-sm text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
              {journalError && <p className="rounded bg-red-100 px-3 py-2 text-xs text-red-700">{journalError}</p>}
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-white shadow hover:bg-indigo-700"
              >
                Post Entry
              </button>
            </form>
          ) : (
            <form className="mt-4 space-y-4" onSubmit={handleNarrationSubmit}>
              <div className="grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Narration (English, Hinglish या हिंदी)
                </label>
                <textarea
                  name="narration"
                  required
                  className="min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="goods sold to A on credit"
                />
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-3 gap-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount (₹)
                    <input
                      name="amount"
                      type="number"
                      min={1}
                      step="0.01"
                      required
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Quantity
                    <input
                      name="quantity"
                      type="number"
                      min={1}
                      step="1"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="optional"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Rate
                    <input
                      name="price"
                      type="number"
                      min={0}
                      step="0.01"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="optional"
                    />
                  </label>
                </div>
              </div>
              {narrationError && <p className="rounded bg-red-100 px-3 py-2 text-xs text-red-700">{narrationError}</p>}
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-white shadow hover:bg-indigo-700"
              >
                Generate Entry
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Posted Entries</h2>
        <div className="space-y-3">
          {sortedJournal.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No journal entries yet. Post your first transaction.
            </div>
          )}
          {sortedJournal.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{entry.narration}</p>
                  <p className="text-xs uppercase tracking-widest text-indigo-500">
                    {entry.source === 'manual' ? 'Manual Ledger' : 'AI Narration'}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{format(parseISO(entry.date), 'dd MMM yyyy')}</p>
                  {entry.reference && <p>Ref: {entry.reference}</p>}
                </div>
              </header>
              <ul className="mt-3 divide-y divide-slate-100">
                {entry.lines.map((line) => (
                  <li key={line.id} className="flex items-center justify-between py-2 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
                          line.type === 'debit' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                        )}
                      >
                        {line.type}
                      </span>
                      <span>{line.account}</span>
                    </div>
                    <span className="font-mono text-sm text-slate-900">₹{line.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              {entry.tags.length > 0 && (
                <footer className="mt-4 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                      #{tag}
                    </span>
                  ))}
                </footer>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
