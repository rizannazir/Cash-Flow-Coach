export type TransactionType = 'Income' | 'Expense';

export type ExpenseCategory =
  | 'Rent'
  | 'Salaries / Labour'
  | 'Inventory / Raw Materials'
  | 'Transport / Fuel'
  | 'Utilities'
  | 'Marketing / Advertising'
  | 'Food / Refreshments'
  | 'Software / Subscriptions'
  | 'Equipment'
  | 'Repairs / Maintenance'
  | 'Loan / EMI'
  | 'Bank / Payment Charges'
  | 'Office / Supplies'
  | 'Personal Withdrawals'
  | 'Miscellaneous';

export type IncomeCategory =
  | 'Sales'
  | 'Client Payments'
  | 'Service Revenue'
  | 'Other Income';

export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD or readable string like '01 Oct 2026'
  rawDate?: string;
  description: string;
  type: TransactionType;
  category: Category;
  amount: number;
  status: 'valid' | 'needs_review';
  reviewReason?: string;
  isAmbiguous?: boolean;
  isDuplicate?: boolean;
}

export type CashHealthStatus = 'manageable' | 'needs_attention' | 'shortfall_risk';

export interface MoneyLeak {
  category: string;
  amount: number;
  percentage: number;
  reason: string;
  fix: string;
  transactionCount?: number;
}

export interface BudgetItem {
  category: string;
  lastMonth: number;
  nextMonthBudget: number;
  savingsOrBuffer: number;
  protectionNote?: string;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  count: number;
  type: TransactionType;
}

export interface CashFlowTrendPoint {
  date: string;
  displayDate: string;
  income: number;
  expenses: number;
  net: number;
  cumulativeCash: number;
}

export interface NeedsReviewItem {
  id: string;
  transactionId: string;
  title: string;
  description: string;
  issueType: 'duplicate' | 'missing_amount' | 'ambiguous' | 'missing_date';
  suggestedAction?: string;
}

export interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashMovement: number;
  openingBalance: number | null;
  closingBalance: number | null;
  cashHealth: CashHealthStatus;
  cashHealthHeadline: string;
  cashHealthReason: string;
  topLeaks: MoneyLeak[];
  budget: BudgetItem[];
  totalNextMonthBudget: number;
  totalLastMonthBudget: number;
  nextMonthFocus: string;
  categoryBreakdown: CategoryBreakdown[];
  trend: CashFlowTrendPoint[];
  needsReviewList: NeedsReviewItem[];
  personalWithdrawalsTotal: number;
}
