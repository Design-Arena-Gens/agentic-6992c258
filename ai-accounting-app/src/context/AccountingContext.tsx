'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { v4 as uuid } from 'uuid';

export type SecurityQuestion = {
  question: string;
  answer: string;
};

export type FirmProfile = {
  firmName: string;
  organizationType: string;
  gstNumber: string;
  panNumber: string;
  taxRegistration: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  businessAddress: string;
  pin: string;
  securityQuestions: SecurityQuestion[];
  createdAt: string;
};

export type JournalLine = {
  id: string;
  account: string;
  type: 'debit' | 'credit';
  amount: number;
};

export type JournalEntry = {
  id: string;
  date: string;
  narration: string;
  reference?: string;
  lines: JournalLine[];
  tags: string[];
  createdAt: string;
  source: 'manual' | 'parsed';
};

export type InventoryItem = {
  id: string;
  name: string;
  supplier: string;
  invoiceNumber: string;
  hsnCode: string;
  gstRate: number;
  purchaseCost: number;
  salesPrice: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  lines: InvoiceLine[];
  notes?: string;
  total: number;
  totalTax: number;
  createdAt: string;
};

export type AccountingState = {
  profile: FirmProfile | null;
  journal: JournalEntry[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  sessionToken: string | null;
  hydrated: boolean;
};

const defaultState: AccountingState = {
  profile: null,
  journal: [],
  inventory: [],
  invoices: [],
  sessionToken: null,
  hydrated: false,
};

type Action =
  | { type: 'HYDRATE'; payload: AccountingState }
  | { type: 'REGISTER'; payload: FirmProfile }
  | { type: 'LOGIN'; payload: { token: string } }
  | { type: 'LOGOUT' }
  | { type: 'ADD_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_ENTRY'; payload: JournalEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'ADD_INVENTORY'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY'; payload: string }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'DELETE_INVOICE'; payload: string };

function reducer(state: AccountingState, action: Action): AccountingState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'REGISTER':
      return { ...state, profile: action.payload };
    case 'LOGIN':
      return { ...state, sessionToken: action.payload.token };
    case 'LOGOUT':
      return { ...state, sessionToken: null };
    case 'ADD_ENTRY':
      return { ...state, journal: [action.payload, ...state.journal] };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        journal: state.journal.map((entry) => (entry.id === action.payload.id ? action.payload : entry)),
      };
    case 'DELETE_ENTRY':
      return { ...state, journal: state.journal.filter((entry) => entry.id !== action.payload) };
    case 'ADD_INVENTORY':
      return { ...state, inventory: [action.payload, ...state.inventory] };
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.map((item) => (item.id === action.payload.id ? action.payload : item)),
      };
    case 'DELETE_INVENTORY':
      return { ...state, inventory: state.inventory.filter((item) => item.id !== action.payload) };
    case 'ADD_INVOICE':
      return { ...state, invoices: [action.payload, ...state.invoices] };
    case 'DELETE_INVOICE':
      return { ...state, invoices: state.invoices.filter((invoice) => invoice.id !== action.payload) };
    default:
      return state;
  }
}

type AccountingContextType = AccountingState & {
  registerFirm: (profile: FirmProfile) => void;
  login: (pin: string) => boolean;
  verifySecurityAnswers: (answers: string[]) => boolean;
  logout: () => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  updateJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'total' | 'totalTax'>) => void;
  deleteInvoice: (id: string) => void;
  computeDashboard: () => DashboardSummary;
  parseNarration: (input: NarrationInput) => JournalEntry;
};

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const STORAGE_KEY = 'ai-accounting-state';
const SESSION_KEY = 'ai-accounting-session';

export type DashboardSummaryMetric = {
  label: string;
  value: number;
  delta: number;
};

export type DashboardSummary = {
  metrics: DashboardSummaryMetric[];
  trends: {
    sales: TrendPoint[];
    purchases: TrendPoint[];
    expenses: TrendPoint[];
  };
};

export type TrendPoint = {
  date: string;
  value: number;
};

export type NarrationInput = {
  date: string;
  narration: string;
  amount: number;
  quantity?: number;
  price?: number;
};

function loadState(): AccountingState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as AccountingState;
    return {
      ...defaultState,
      ...parsed,
    };
  } catch (error) {
    console.error('Failed to load state', error);
    return defaultState;
  }
}

function persistState(state: AccountingState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, sessionToken: null }));
  if (state.sessionToken) {
    localStorage.setItem(SESSION_KEY, state.sessionToken);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function generateToken() {
  return uuid();
}

const keywordMappings: Record<string, { debit: string; credit: string; tags: string[] }> = {
  sale: { debit: 'Accounts Receivable', credit: 'Sales Revenue', tags: ['sales', 'revenue'] },
  sold: { debit: 'Accounts Receivable', credit: 'Sales Revenue', tags: ['sales', 'revenue'] },
  purchase: { debit: 'Inventory', credit: 'Accounts Payable', tags: ['purchases', 'inventory'] },
  bought: { debit: 'Inventory', credit: 'Cash', tags: ['purchases', 'inventory'] },
  expense: { debit: 'Expense', credit: 'Cash', tags: ['expenses'] },
  rent: { debit: 'Rent Expense', credit: 'Cash', tags: ['expenses', 'rent'] },
  salary: { debit: 'Salary Expense', credit: 'Cash', tags: ['expenses', 'salary'] },
  tax: { debit: 'Tax Expense', credit: 'Tax Payable', tags: ['tax'] },
  goods: { debit: 'Accounts Receivable', credit: 'Sales Revenue', tags: ['sales', 'inventory'] },
  stock: { debit: 'Inventory', credit: 'Cash', tags: ['inventory'] },
  नकद: { debit: 'Cash', credit: 'Sales Revenue', tags: ['sales'] },
  बिक्री: { debit: 'Accounts Receivable', credit: 'Sales Revenue', tags: ['sales'] },
  खरीदा: { debit: 'Inventory', credit: 'Cash', tags: ['inventory'] },
  खरीद: { debit: 'Inventory', credit: 'Accounts Payable', tags: ['purchases'] },
  खर्च: { debit: 'Expense', credit: 'Cash', tags: ['expenses'] },
  बेचा: { debit: 'Accounts Receivable', credit: 'Sales Revenue', tags: ['sales'] },
  diya: { debit: 'Expense', credit: 'Cash', tags: ['expenses'] },
  liya: { debit: 'Inventory', credit: 'Cash', tags: ['inventory'] },
  becha: { debit: 'Accounts Receivable', credit: 'Sales Revenue', tags: ['sales'] },
  kharida: { debit: 'Inventory', credit: 'Cash', tags: ['inventory'] },
};

const defaultParsedEntry = {
  debit: 'Miscellaneous Debit',
  credit: 'Miscellaneous Credit',
  tags: ['general'],
};

function evaluateTags(entry: JournalEntry) {
  const map: Record<string, number> = {};
  entry.lines.forEach((line) => {
    const bucket = line.account.toLowerCase();
    if (bucket.includes('sales')) map.sales = (map.sales ?? 0) + (line.type === 'credit' ? line.amount : 0);
    if (bucket.includes('purchase') || bucket.includes('inventory')) {
      map.purchases = (map.purchases ?? 0) + (line.type === 'debit' ? line.amount : 0);
    }
    if (bucket.includes('expense')) map.expenses = (map.expenses ?? 0) + (line.type === 'debit' ? line.amount : 0);
    if (bucket.includes('tax')) map.tax = (map.tax ?? 0) + line.amount;
  });
  return map;
}

export function AccountingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    const initial = loadState();
    const session = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
    dispatch({ type: 'HYDRATE', payload: { ...initial, sessionToken: session, hydrated: true } });
  }, []);

  useEffect(() => {
    if (state.profile) {
      persistState(state);
    }
  }, [state]);

  const registerFirm = useCallback((profile: FirmProfile) => {
    dispatch({ type: 'REGISTER', payload: profile });
  }, []);

  const login = useCallback(
    (pin: string) => {
      if (!state.profile) return false;
      if (state.profile.pin !== pin) return false;
      const token = generateToken();
      dispatch({ type: 'LOGIN', payload: { token } });
      return true;
    },
    [state.profile],
  );

  const verifySecurityAnswers = useCallback(
    (answers: string[]) => {
      if (!state.profile) return false;
      return state.profile.securityQuestions.every((q, idx) => {
        const provided = answers[idx] ?? '';
        return q.answer.trim().toLowerCase() === provided.trim().toLowerCase();
      });
    },
    [state.profile],
  );

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const payload: JournalEntry = {
      ...entry,
      id: uuid(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ENTRY', payload });
  }, []);

  const updateJournalEntry = useCallback((entry: JournalEntry) => {
    dispatch({ type: 'UPDATE_ENTRY', payload: entry });
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ENTRY', payload: id });
  }, []);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload: InventoryItem = {
      ...item,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_INVENTORY', payload });
  }, []);

  const updateInventoryItem = useCallback((item: InventoryItem) => {
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: { ...item, updatedAt: new Date().toISOString() },
    });
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    dispatch({ type: 'DELETE_INVENTORY', payload: id });
  }, []);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'createdAt' | 'total' | 'totalTax'>) => {
    const totals = invoice.lines.reduce(
      (acc, line) => {
        const lineSubtotal = line.quantity * line.unitPrice;
        const tax = (line.gstRate / 100) * lineSubtotal;
        acc.total += lineSubtotal + tax;
        acc.totalTax += tax;
        return acc;
      },
      { total: 0, totalTax: 0 },
    );
    const payload: Invoice = {
      ...invoice,
      id: uuid(),
      createdAt: new Date().toISOString(),
      total: parseFloat(totals.total.toFixed(2)),
      totalTax: parseFloat(totals.totalTax.toFixed(2)),
    };
    dispatch({ type: 'ADD_INVOICE', payload });
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    dispatch({ type: 'DELETE_INVOICE', payload: id });
  }, []);

  const computeDashboard = useCallback((): DashboardSummary => {
    const today = new Date();
    const recentEntries = state.journal.filter((entry) => differenceInDays(today, parseISO(entry.date)) <= 30);
    const metrics: DashboardSummaryMetric[] = [
      { label: 'Sales', value: 0, delta: 0 },
      { label: 'Revenue', value: 0, delta: 0 },
      { label: 'Tax Due', value: 0, delta: 0 },
      { label: 'Expenses', value: 0, delta: 0 },
      { label: 'Purchases', value: 0, delta: 0 },
      { label: 'Inventory Cost', value: 0, delta: 0 },
      { label: 'Total Capital', value: 0, delta: 0 },
    ];

    const trendBuckets: Record<string, TrendPoint> = {};

    const totals = recentEntries.reduce(
      (acc, entry) => {
        const tags = evaluateTags(entry);
        acc.sales += tags.sales ?? 0;
        acc.purchases += tags.purchases ?? 0;
        acc.expenses += tags.expenses ?? 0;
        acc.tax += tags.tax ?? 0;

        const pointKey = entry.date;
        if (!trendBuckets[pointKey]) {
          trendBuckets[pointKey] = { date: pointKey, value: 0 };
        }
        trendBuckets[pointKey].value += tags.sales ?? 0;
        return acc;
      },
      { sales: 0, purchases: 0, expenses: 0, tax: 0 },
    );

    const inventoryCost = state.inventory.reduce((sum, item) => sum + item.purchaseCost * item.quantity, 0);
    const capital = totals.sales - totals.expenses - totals.purchases;

    metrics[0].value = parseFloat(totals.sales.toFixed(2));
    metrics[1].value = parseFloat(totals.sales.toFixed(2));
    metrics[2].value = parseFloat(totals.tax.toFixed(2));
    metrics[3].value = parseFloat(totals.expenses.toFixed(2));
    metrics[4].value = parseFloat(totals.purchases.toFixed(2));
    metrics[5].value = parseFloat(inventoryCost.toFixed(2));
    metrics[6].value = parseFloat(capital.toFixed(2));

    const trendPoints = Object.values(trendBuckets).sort((a, b) => a.date.localeCompare(b.date));

    const summary: DashboardSummary = {
      metrics,
      trends: {
        sales: trendPoints,
        purchases: state.journal
          .filter((entry) => entry.tags.includes('purchases'))
          .map((entry) => ({ date: entry.date, value: entry.lines[0]?.amount ?? 0 })),
        expenses: state.journal
          .filter((entry) => entry.tags.includes('expenses'))
          .map((entry) => ({ date: entry.date, value: entry.lines[0]?.amount ?? 0 })),
      },
    };

    return summary;
  }, [state.inventory, state.journal]);

  const parseNarration = useCallback(
    (input: NarrationInput): JournalEntry => {
      const base = input.narration.toLowerCase();
      const keyword = Object.keys(keywordMappings).find((key) => base.includes(key));
      const mapping = keyword ? keywordMappings[keyword] : defaultParsedEntry;

      const amount = input.amount;
      const quantity = input.quantity ?? 1;
      const price = input.price ?? amount;
      const narrationDetails =
        quantity !== 1 || price !== amount
          ? `${input.narration} (Qty: ${quantity}, Rate: ${price})`
          : input.narration;

      const tags = keyword ? keywordMappings[keyword].tags : ['general'];

      const entry: JournalEntry = {
        id: uuid(),
        date: input.date,
        narration: narrationDetails,
        createdAt: new Date().toISOString(),
        reference: undefined,
        source: 'parsed',
        tags,
        lines: [
          {
            id: uuid(),
            account: mapping.debit,
            type: 'debit',
            amount,
          },
          {
            id: uuid(),
            account: mapping.credit,
            type: 'credit',
            amount,
          },
        ],
      };

      return entry;
    },
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      registerFirm,
      login,
      verifySecurityAnswers,
      logout,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addInvoice,
      deleteInvoice,
      computeDashboard,
      parseNarration,
    }),
    [
      state,
      registerFirm,
      login,
      verifySecurityAnswers,
      logout,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addInvoice,
      deleteInvoice,
      computeDashboard,
      parseNarration,
    ],
  );

  return <AccountingContext.Provider value={value}>{children}</AccountingContext.Provider>;
}

export function useAccounting() {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within AccountingProvider');
  }
  return context;
}
