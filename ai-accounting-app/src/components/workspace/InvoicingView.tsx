'use client';

import { FormEvent, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { useAccounting, InvoiceLine } from '@/context/AccountingContext';

type DraftLine = Omit<InvoiceLine, 'id'>;

export function InvoicingView() {
  const { invoices, addInvoice, deleteInvoice, profile } = useAccounting();
  const [lines, setLines] = useState<DraftLine[]>([
    { description: 'Consulting services', quantity: 1, unitPrice: 0, gstRate: 18 },
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const baseTotals = lines.reduce(
      (acc, line) => {
        const subtotal = line.unitPrice * line.quantity;
        const tax = (line.gstRate / 100) * subtotal;
        acc.subtotal += subtotal;
        acc.tax += tax;
        return acc;
      },
      { subtotal: 0, tax: 0 },
    );

    if (baseTotals.subtotal <= 0) {
      setError('Please add at least one line with a value.');
      return;
    }

    addInvoice({
      invoiceNumber: (form.get('invoice_number') as string) ?? '',
      issueDate: (form.get('issue_date') as string) ?? '',
      dueDate: (form.get('due_date') as string) ?? '',
      customerName: (form.get('customer_name') as string) ?? '',
      customerAddress: (form.get('customer_address') as string) ?? '',
      notes: (form.get('notes') as string) ?? '',
      lines: lines.map((line) => ({
        ...line,
        id: uuid(),
      })),
    });

    setError(null);
    setLines([{ description: 'Consulting services', quantity: 1, unitPrice: 0, gstRate: 18 }]);
    (event.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Issue Invoice</h3>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Generate GST-compliant invoices</p>
          </div>
        </header>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice Number</span>
              <input
                name="invoice_number"
                required
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="INV-1001"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Issue Date</span>
              <input
                name="issue_date"
                type="date"
                required
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Due Date</span>
              <input
                name="due_date"
                type="date"
                required
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer GSTIN</span>
              <input
                name="customer_gstin"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase tracking-wide text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Optional"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer Name</span>
              <input
                name="customer_name"
                required
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer Address</span>
              <textarea
                name="customer_address"
                required
                className="min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice Lines</span>
              <button
                type="button"
                onClick={() => setLines((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0, gstRate: 18 }])}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Add line
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                >
                  <input
                    value={line.description}
                    onChange={(event) =>
                      setLines((prev) =>
                        prev.map((item, idx) => (idx === index ? { ...item, description: event.target.value } : item)),
                      )
                    }
                    placeholder="Description"
                    className="rounded border border-slate-200 px-2 py-1 text-sm text-slate-700"
                    required
                  />
                  <input
                    type="number"
                    min={1}
                    step="1"
                    value={line.quantity}
                    onChange={(event) =>
                      setLines((prev) =>
                        prev.map((item, idx) => (idx === index ? { ...item, quantity: parseFloat(event.target.value) } : item)),
                      )
                    }
                    className="rounded border border-slate-200 px-2 py-1 text-sm text-slate-700"
                    required
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(event) =>
                      setLines((prev) =>
                        prev.map((item, idx) => (idx === index ? { ...item, unitPrice: parseFloat(event.target.value) } : item)),
                      )
                    }
                    className="rounded border border-slate-200 px-2 py-1 text-sm text-slate-700"
                    required
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={line.gstRate}
                    onChange={(event) =>
                      setLines((prev) =>
                        prev.map((item, idx) => (idx === index ? { ...item, gstRate: parseFloat(event.target.value) } : item)),
                      )
                    }
                    className="rounded border border-slate-200 px-2 py-1 text-sm text-slate-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== index))}
                    className="text-rose-500 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</label>
            <textarea
              name="notes"
              className="mt-2 min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Payment terms, banking details, thank you notes..."
            />
          </div>
          {error && <p className="rounded bg-red-100 px-3 py-2 text-xs text-red-700">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-white shadow hover:bg-indigo-700"
          >
            Generate Invoice
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Invoice Library</h3>
        <div className="grid gap-4">
          {invoices.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No invoices issued yet. Generated invoices will appear here.
            </div>
          )}
          {invoices.map((invoice) => (
            <article key={invoice.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Invoice #{invoice.invoiceNumber}</h4>
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">{invoice.customerName}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Issued {format(parseISO(invoice.issueDate), 'dd MMM yyyy')}</p>
                  <p>Due {format(parseISO(invoice.dueDate), 'dd MMM yyyy')}</p>
                </div>
              </header>
              <ul className="mt-3 divide-y divide-slate-100 text-sm text-slate-600">
                {invoice.lines.map((line) => (
                  <li key={line.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-slate-800">{line.description}</p>
                      <p className="text-xs text-slate-500">
                        Qty {line.quantity} × ₹{line.unitPrice.toFixed(2)} | GST {line.gstRate}%
                      </p>
                    </div>
                    <span className="font-semibold text-slate-900">
                      ₹{(line.quantity * line.unitPrice * (1 + line.gstRate / 100)).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  <p>Subtotal: ₹{(invoice.total - invoice.totalTax).toFixed(2)}</p>
                  <p>Tax: ₹{invoice.totalTax.toFixed(2)}</p>
                  <p className="font-semibold text-slate-900">Total: ₹{invoice.total.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => deleteInvoice(invoice.id)}
                  className="text-xs font-semibold uppercase tracking-widest text-rose-500 hover:text-rose-600"
                >
                  Delete Invoice
                </button>
              </footer>
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-600">
                <p className="font-semibold uppercase tracking-[0.3em]">Billing Summary</p>
                <p>
                  Issued by {profile?.firmName} | GST: {profile?.gstNumber} | Bank: {profile?.bankName}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
