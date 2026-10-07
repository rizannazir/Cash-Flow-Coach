import { Transaction } from '../types/cashflow';

/**
 * 35 realistic sample transactions for a small Indian business (e.g. Design Studio & Retail Shop).
 * Includes positive income, multiple categories, identifiable leaks (frequent tea/snacks, high fuel/couriers, personal withdrawals, software),
 * and 1 intentional duplicate entry to showcase the "Needs Review" feature.
 */
export const DEMO_OPENING_BALANCE = 28500;

export const DEMO_RAW_TEXT = `01/10/2026 Client retainer payment Sharma Exports - 45000
01/10/2026 Shop & studio rent - 18000
02/10/2026 Tea and biscuits for team - 140
02/10/2026 Petrol bike conveyance - 650
03/10/2026 Counter sales UPI - 8500
04/10/2026 Packaging boxes and bubble wrap - 3200
04/10/2026 Chai snacks client meeting - 380
05/10/2026 Fabric and raw materials supplier payment - 18500
05/10/2026 Courier charges delivery - 420
06/10/2026 Instagram ad boost campaign - 3500
07/10/2026 Staff helper salary advance - 5000
08/10/2026 Lunch swiggy order studio - 620
08/10/2026 Shop electricity bill - 3450
09/10/2026 Website redesign client payment - 28000
10/10/2026 Canva Pro and Figma subscription - 2100
10/10/2026 Chai vendor weekly settlement - 850
11/10/2026 Petrol car delivery - 1200
12/10/2026 Weekend counter sales - 14200
13/10/2026 Raw material accessories purchase - 6800
14/10/2026 Personal home expense withdrawal - 8000
15/10/2026 Airtel fiber broadband internet - 1180
16/10/2026 Evening tea and samosas - 240
17/10/2026 Logo design client payout - 15000
18/10/2026 Porter auto delivery charges - 850
19/10/2026 Assistant designer monthly salary - 14000
20/10/2026 Meta ads Diwali promo boost - 4500
21/10/2026 Samosa and tea snacks - 180
22/10/2026 Printer toner cartridge and paper - 1450
23/10/2026 Personal withdrawal kid tuition fee - 4500
24/10/2026 Walk-in retail product sales - 9800
25/10/2026 AC servicing and filter cleaning - 1200
26/10/2026 Delivery courier parcel charges - 680
27/10/2026 Client retainer payment TechStart - 32000
28/10/2026 Client retainer payment TechStart - 32000
29/10/2026 Swiggy team dinner late work - 980
30/10/2026 Petrol bike re-fuel - 600
31/10/2026 Razorpay gateway payment processing fee - 860`;

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-1',
    date: '2026-10-01',
    description: 'Client retainer payment Sharma Exports',
    type: 'Income',
    category: 'Client Payments',
    amount: 45000,
    status: 'valid',
  },
  {
    id: 'demo-2',
    date: '2026-10-01',
    description: 'Shop & studio rent',
    type: 'Expense',
    category: 'Rent',
    amount: 18000,
    status: 'valid',
  },
  {
    id: 'demo-3',
    date: '2026-10-02',
    description: 'Tea and biscuits for team',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 140,
    status: 'valid',
  },
  {
    id: 'demo-4',
    date: '2026-10-02',
    description: 'Petrol bike conveyance',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 650,
    status: 'valid',
  },
  {
    id: 'demo-5',
    date: '2026-10-03',
    description: 'Counter sales UPI',
    type: 'Income',
    category: 'Sales',
    amount: 8500,
    status: 'valid',
  },
  {
    id: 'demo-6',
    date: '2026-10-04',
    description: 'Packaging boxes and bubble wrap',
    type: 'Expense',
    category: 'Inventory / Raw Materials',
    amount: 3200,
    status: 'valid',
  },
  {
    id: 'demo-7',
    date: '2026-10-04',
    description: 'Chai snacks client meeting',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 380,
    status: 'valid',
  },
  {
    id: 'demo-8',
    date: '2026-10-05',
    description: 'Fabric and raw materials supplier payment',
    type: 'Expense',
    category: 'Inventory / Raw Materials',
    amount: 18500,
    status: 'valid',
  },
  {
    id: 'demo-9',
    date: '2026-10-05',
    description: 'Courier charges delivery',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 420,
    status: 'valid',
  },
  {
    id: 'demo-10',
    date: '2026-10-06',
    description: 'Instagram ad boost campaign',
    type: 'Expense',
    category: 'Marketing / Advertising',
    amount: 3500,
    status: 'valid',
  },
  {
    id: 'demo-11',
    date: '2026-10-07',
    description: 'Staff helper salary advance',
    type: 'Expense',
    category: 'Salaries / Labour',
    amount: 5000,
    status: 'valid',
  },
  {
    id: 'demo-12',
    date: '2026-10-08',
    description: 'Lunch swiggy order studio',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 620,
    status: 'valid',
  },
  {
    id: 'demo-13',
    date: '2026-10-08',
    description: 'Shop electricity bill',
    type: 'Expense',
    category: 'Utilities',
    amount: 3450,
    status: 'valid',
  },
  {
    id: 'demo-14',
    date: '2026-10-09',
    description: 'Website redesign client payment',
    type: 'Income',
    category: 'Client Payments',
    amount: 28000,
    status: 'valid',
  },
  {
    id: 'demo-15',
    date: '2026-10-10',
    description: 'Canva Pro and Figma subscription',
    type: 'Expense',
    category: 'Software / Subscriptions',
    amount: 2100,
    status: 'valid',
  },
  {
    id: 'demo-16',
    date: '2026-10-10',
    description: 'Chai vendor weekly settlement',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 850,
    status: 'valid',
  },
  {
    id: 'demo-17',
    date: '2026-10-11',
    description: 'Petrol car delivery run',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 1200,
    status: 'valid',
  },
  {
    id: 'demo-18',
    date: '2026-10-12',
    description: 'Weekend counter sales',
    type: 'Income',
    category: 'Sales',
    amount: 14200,
    status: 'valid',
  },
  {
    id: 'demo-19',
    date: '2026-10-13',
    description: 'Raw material accessories purchase',
    type: 'Expense',
    category: 'Inventory / Raw Materials',
    amount: 6800,
    status: 'valid',
  },
  {
    id: 'demo-20',
    date: '2026-10-14',
    description: 'Personal home expense withdrawal',
    type: 'Expense',
    category: 'Personal Withdrawals',
    amount: 8000,
    status: 'valid',
  },
  {
    id: 'demo-21',
    date: '2026-10-15',
    description: 'Airtel fiber broadband internet',
    type: 'Expense',
    category: 'Utilities',
    amount: 1180,
    status: 'valid',
  },
  {
    id: 'demo-22',
    date: '2026-10-16',
    description: 'Evening tea and samosas',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 240,
    status: 'valid',
  },
  {
    id: 'demo-23',
    date: '2026-10-17',
    description: 'Logo design client payout',
    type: 'Income',
    category: 'Client Payments',
    amount: 15000,
    status: 'valid',
  },
  {
    id: 'demo-24',
    date: '2026-10-18',
    description: 'Porter auto delivery charges',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 850,
    status: 'valid',
  },
  {
    id: 'demo-25',
    date: '2026-10-19',
    description: 'Assistant designer monthly salary',
    type: 'Expense',
    category: 'Salaries / Labour',
    amount: 14000,
    status: 'valid',
  },
  {
    id: 'demo-26',
    date: '2026-10-20',
    description: 'Meta ads Diwali promo boost',
    type: 'Expense',
    category: 'Marketing / Advertising',
    amount: 4500,
    status: 'valid',
  },
  {
    id: 'demo-27',
    date: '2026-10-21',
    description: 'Samosa and tea snacks',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 180,
    status: 'valid',
  },
  {
    id: 'demo-28',
    date: '2026-10-22',
    description: 'Printer toner cartridge and paper',
    type: 'Expense',
    category: 'Office / Supplies',
    amount: 1450,
    status: 'valid',
  },
  {
    id: 'demo-29',
    date: '2026-10-23',
    description: 'Personal withdrawal kid tuition fee',
    type: 'Expense',
    category: 'Personal Withdrawals',
    amount: 4500,
    status: 'valid',
  },
  {
    id: 'demo-30',
    date: '2026-10-24',
    description: 'Walk-in retail product sales',
    type: 'Income',
    category: 'Sales',
    amount: 9800,
    status: 'valid',
  },
  {
    id: 'demo-31',
    date: '2026-10-25',
    description: 'AC servicing and filter cleaning',
    type: 'Expense',
    category: 'Repairs / Maintenance',
    amount: 1200,
    status: 'valid',
  },
  {
    id: 'demo-32',
    date: '2026-10-26',
    description: 'Delivery courier parcel charges',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 680,
    status: 'valid',
  },
  {
    id: 'demo-33',
    date: '2026-10-27',
    description: 'Client retainer payment TechStart',
    type: 'Income',
    category: 'Client Payments',
    amount: 32000,
    status: 'valid',
  },
  {
    id: 'demo-34',
    date: '2026-10-27',
    description: 'Client retainer payment TechStart',
    type: 'Income',
    category: 'Client Payments',
    amount: 32000,
    status: 'needs_review',
    isDuplicate: true,
    reviewReason: 'Possible duplicate transaction (repeated 2 times on same date)',
  },
  {
    id: 'demo-35',
    date: '2026-10-29',
    description: 'Swiggy team dinner late work',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 980,
    status: 'valid',
  },
  {
    id: 'demo-36',
    date: '2026-10-30',
    description: 'Petrol bike re-fuel',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 600,
    status: 'valid',
  },
  {
    id: 'demo-37',
    date: '2026-10-31',
    description: 'Razorpay gateway payment processing fee',
    type: 'Expense',
    category: 'Bank / Payment Charges',
    amount: 860,
    status: 'valid',
  },
];
