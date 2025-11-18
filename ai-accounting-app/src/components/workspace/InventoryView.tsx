'use client';

import { FormEvent, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useAccounting } from '@/context/AccountingContext';

export function InventoryView() {
  const { inventory, addInventoryItem, deleteInventoryItem } = useAccounting();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const purchaseCost = parseFloat((form.get('purchase_cost') as string) ?? '0');
    const salesPrice = parseFloat((form.get('sales_price') as string) ?? '0');
    const gstRate = parseFloat((form.get('gst_rate') as string) ?? '0');
    const quantity = parseFloat((form.get('quantity') as string) ?? '0');

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    addInventoryItem({
      name: (form.get('name') as string) ?? '',
      supplier: (form.get('supplier') as string) ?? '',
      invoiceNumber: (form.get('invoice_number') as string) ?? '',
      hsnCode: (form.get('hsn_code') as string) ?? '',
      gstRate,
      purchaseCost,
      salesPrice,
      quantity,
    });

    setError(null);
    (event.target as HTMLFormElement).reset();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Add Inventory</h3>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Item Name</label>
            <input
              name="name"
              required
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Product Name"
            />
          </div>
          <div className="grid gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Supplier</label>
            <input
              name="supplier"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Vendor Name"
            />
          </div>
          <div className="grid gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice Number</label>
            <input
              name="invoice_number"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="INV-2024-001"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">HSN Code</label>
              <input
                name="hsn_code"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="xxxx"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">GST %</label>
              <input
                name="gst_rate"
                type="number"
                min={0}
                max={100}
                step="0.1"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="18"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Purchase Cost</label>
              <input
                name="purchase_cost"
                type="number"
                min={0}
                step="0.01"
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sales Price</label>
              <input
                name="sales_price"
                type="number"
                min={0}
                step="0.01"
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</label>
            <input
              name="quantity"
              type="number"
              min={1}
              step="1"
              required
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {error && <p className="rounded bg-red-100 px-3 py-2 text-xs text-red-700">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-white shadow hover:bg-indigo-700"
          >
            Save Item
          </button>
        </form>
      </section>
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Inventory Register</h3>
        <div className="grid gap-4">
          {inventory.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No inventory captured yet. Add your first SKU.
            </div>
          )}
          {inventory.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
                  <p className="text-xs uppercase tracking-widest text-indigo-500">HSN {item.hsnCode || 'N/A'}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Qty: {item.quantity}</p>
                  <p>Last updated {format(parseISO(item.updatedAt), 'dd MMM yyyy')}</p>
                </div>
              </header>
              <dl className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">Supplier</dt>
                  <dd>{item.supplier || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">Invoice</dt>
                  <dd>{item.invoiceNumber || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">Purchase Cost</dt>
                  <dd>₹{item.purchaseCost.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">Sales Price</dt>
                  <dd>₹{item.salesPrice.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">GST %</dt>
                  <dd>{item.gstRate}%</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">Inventory Value</dt>
                  <dd>₹{(item.purchaseCost * item.quantity).toFixed(2)}</dd>
                </div>
              </dl>
              <footer className="mt-4 flex justify-end">
                <button
                  onClick={() => deleteInventoryItem(item.id)}
                  className="text-xs font-semibold uppercase tracking-widest text-rose-500 hover:text-rose-600"
                >
                  Remove Item
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
