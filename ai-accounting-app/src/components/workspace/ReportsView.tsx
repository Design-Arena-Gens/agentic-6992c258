'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { useAccounting, JournalEntry, InventoryItem, Invoice } from '@/context/AccountingContext';

type StatementRow = {
  label: string;
  amount: number;
};

type StatementSection = {
  heading: string;
  rows: StatementRow[];
  totalLabel: string;
  total: number;
};

export function ReportsView() {
  const { journal, inventory, invoices, profile } = useAccounting();

  const plStatement = useMemo(() => buildProfitAndLoss(journal), [journal]);
  const balanceSheet = useMemo(() => buildBalanceSheet(journal, inventory), [journal, inventory]);
  const cashFlow = useMemo(() => buildCashFlow(journal, invoices), [journal, invoices]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">AI-Driven Books</h2>
        <p className="text-xs text-slate-500">
          Generated for {profile?.firmName} as on {format(new Date(), 'dd MMM yyyy')}
        </p>
      </header>
      <section className="grid gap-6 lg:grid-cols-3">
        <StatementCard title="Profit & Loss Statement" statement={plStatement} />
        <StatementCard title="Balance Sheet Snapshot" statement={balanceSheet} />
        <StatementCard title="Cash Flow Statement" statement={cashFlow} />
      </section>
    </div>
  );
}

function StatementCard({ title, statement }: { title: string; statement: StatementSection[] }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Compiled intelligently</p>
      </header>
      <div className="mt-3 flex-1 space-y-4">
        {statement.map((section) => (
          <div key={section.heading} className="rounded-xl bg-slate-50/60 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{section.heading}</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {section.rows.map((row) => (
                <li key={row.label} className="flex items-center justify-between">
                  <span>{row.label}</span>
                  <span className="font-medium">₹{row.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>{section.totalLabel}</span>
              <span>₹{section.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function buildProfitAndLoss(entries: JournalEntry[]): StatementSection[] {
  let revenue = 0;
  let otherIncome = 0;
  let costOfGoods = 0;
  let operatingExpenses = 0;
  let taxExpenses = 0;

  const categorize = (label: string) => label.toLowerCase();

  entries.forEach((entry) => {
    entry.lines.forEach((line) => {
      const account = categorize(line.account);
      if (line.type === 'credit' && (account.includes('sales') || account.includes('revenue'))) {
        revenue += line.amount;
      } else if (line.type === 'credit' && account.includes('income')) {
        otherIncome += line.amount;
      } else if (line.type === 'debit' && (account.includes('inventory') || account.includes('cogs'))) {
        costOfGoods += line.amount;
      } else if (line.type === 'debit' && (account.includes('expense') || account.includes('salary') || account.includes('rent'))) {
        operatingExpenses += line.amount;
      } else if (account.includes('tax')) {
        taxExpenses += line.amount;
      }
    });
  });

  const grossProfit = revenue - costOfGoods;
  const ebitda = grossProfit - operatingExpenses;
  const profitBeforeTax = ebitda + otherIncome;
  const profitAfterTax = profitBeforeTax - taxExpenses;

  return [
    {
      heading: 'Income',
      rows: [
        { label: 'Net Revenue', amount: revenue },
        { label: 'Other Income', amount: otherIncome },
      ],
      totalLabel: 'Total Income',
      total: revenue + otherIncome,
    },
    {
      heading: 'Expenses',
      rows: [
        { label: 'Cost of Goods Sold', amount: costOfGoods },
        { label: 'Operating Expenses', amount: operatingExpenses },
        { label: 'Tax Expenses', amount: taxExpenses },
      ],
      totalLabel: 'Total Expenditure',
      total: costOfGoods + operatingExpenses + taxExpenses,
    },
    {
      heading: 'Profitability',
      rows: [
        { label: 'Gross Profit', amount: grossProfit },
        { label: 'EBITDA', amount: ebitda },
        { label: 'Profit Before Tax', amount: profitBeforeTax },
      ],
      totalLabel: 'Profit After Tax',
      total: profitAfterTax,
    },
  ];
}

function buildBalanceSheet(entries: JournalEntry[], inventory: InventoryItem[]): StatementSection[] {
  let assetsCurrent = 0;
  let assetsFixed = 0;
  let liabilitiesCurrent = 0;
  let liabilitiesLong = 0;
  let equity = 0;

  const categorize = (label: string) => label.toLowerCase();

  entries.forEach((entry) => {
    entry.lines.forEach((line) => {
      const account = categorize(line.account);
      if (line.type === 'debit') {
        if (account.includes('cash') || account.includes('bank') || account.includes('receivable')) {
          assetsCurrent += line.amount;
        } else if (account.includes('asset') || account.includes('equipment')) {
          assetsFixed += line.amount;
        }
      }
      if (line.type === 'credit') {
        if (account.includes('loan') || account.includes('term')) {
          liabilitiesLong += line.amount;
        } else if (account.includes('payable') || account.includes('creditor')) {
          liabilitiesCurrent += line.amount;
        } else if (account.includes('capital') || account.includes('equity')) {
          equity += line.amount;
        }
      }
    });
  });

  const inventoryValue = inventory.reduce((sum, item) => sum + item.purchaseCost * item.quantity, 0);
  assetsCurrent += inventoryValue;

  const totalAssets = assetsCurrent + assetsFixed;
  const totalLiabilitiesEquity = liabilitiesCurrent + liabilitiesLong + equity;

  return [
    {
      heading: 'Assets',
      rows: [
        { label: 'Current Assets', amount: assetsCurrent },
        { label: 'Fixed Assets', amount: assetsFixed },
      ],
      totalLabel: 'Total Assets',
      total: totalAssets,
    },
    {
      heading: 'Liabilities & Equity',
      rows: [
        { label: 'Current Liabilities', amount: liabilitiesCurrent },
        { label: 'Long-Term Liabilities', amount: liabilitiesLong },
        { label: 'Shareholder Equity', amount: equity },
      ],
      totalLabel: 'Total Liabilities & Equity',
      total: totalLiabilitiesEquity,
    },
  ];
}

function buildCashFlow(entries: JournalEntry[], invoices: Invoice[]): StatementSection[] {
  let cashFromOps = 0;
  let cashFromInv = 0;
  let cashFromFin = 0;

  entries.forEach((entry) => {
    entry.lines.forEach((line) => {
      const account = line.account.toLowerCase();
      if (account.includes('cash') || account.includes('bank')) {
        if (line.type === 'debit') {
          cashFromOps += line.amount;
        } else {
          cashFromOps -= line.amount;
        }
      }
      if (account.includes('asset') && line.type === 'debit') {
        cashFromInv -= line.amount;
      }
      if ((account.includes('loan') || account.includes('capital')) && line.type === 'credit') {
        cashFromFin += line.amount;
      }
    });
  });

  const invoicedRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  cashFromOps += invoicedRevenue * 0.1; // assume 10% immediate collection

  const netChange = cashFromOps + cashFromInv + cashFromFin;

  return [
    {
      heading: 'Operating Activities',
      rows: [
        { label: 'Cash from operations', amount: cashFromOps },
        { label: 'Cash impact from invoices', amount: invoicedRevenue * 0.1 },
      ],
      totalLabel: 'Net Operating Cash',
      total: cashFromOps,
    },
    {
      heading: 'Investing Activities',
      rows: [{ label: 'Capital expenditure & investments', amount: cashFromInv }],
      totalLabel: 'Net Investing Cash',
      total: cashFromInv,
    },
    {
      heading: 'Financing Activities',
      rows: [{ label: 'Loans & equity inflow', amount: cashFromFin }],
      totalLabel: 'Net Financing Cash',
      total: cashFromFin,
    },
    {
      heading: 'Net Movement',
      rows: [],
      totalLabel: 'Net Change in Cash',
      total: netChange,
    },
  ];
}
