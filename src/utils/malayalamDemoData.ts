import { Transaction } from '../types/cashflow';

/**
 * 35 realistic sample transactions in Malayalam script (മലയാളം) and Manglish
 * for a small Kerala business (e.g. Design Studio & Boutique Shop in Kochi/Calicut).
 */
export const DEMO_MALAYALAM_OPENING_BALANCE = 25000;

export const DEMO_MALAYALAM_RAW_TEXT = `01/10/2026 ക്ലയന്റ് പേയ്‌മെന്റ് ശർമ്മ എക്സ്പോർട്സ് - 45000
01/10/2026 കട വാടക കൊടുത്തത് - 18000
02/10/2026 ടീമംഗങ്ങൾക്ക് ചായയും ബിസ്കറ്റും - 140
02/10/2026 പെട്രോൾ അടിച്ചത് ബൈക്ക് - 650
03/10/2026 കൗണ്ടർ സെയിൽസ് യുപിഐ - 8500
04/10/2026 പാക്കിംഗ് ബോക്സ് സാധനങ്ങൾ വാങ്ങിയത് - 3200
04/10/2026 ചായയും സ്നാക്സും ക്ലയന്റ് മീറ്റിംഗ് - 380
05/10/2026 തുണിയും റോ മെറ്റീരിയലും വാങ്ങിയത് - 18500
05/10/2026 കൊറിയർ ചാർജ് പാർസൽ അയച്ചത് - 420
06/10/2026 ഇൻസ്റ്റാഗ്രാം പരസ്യം ബൂസ്റ്റ് ചെയ്തത് - 3500
07/10/2026 സ്റ്റാഫ് ശമ്പള അഡ്വാൻസ് കൊടുത്തത് - 5000
08/10/2026 ഉച്ചഭക്ഷണം സ്വിഗ്ഗി ഓർഡർ - 620
08/10/2026 കടയിലെ കറന്റ് ബിൽ അടച്ചത് - 3450
09/10/2026 വെബ്സൈറ്റ് ഡിസൈൻ ക്ലയന്റ് പേയ്‌മെന്റ് - 28000
10/10/2026 കാൻവ സബ്സ്ക്രിപ്ഷൻ - 2100
10/10/2026 ചായക്കടയിലെ ആഴ്ചപ്പണം നൽകിയത് - 850
11/10/2026 പെട്രോൾ കാർ ഡെലിവറി റൺ - 1200
12/10/2026 വാരാന്ത്യ കട കച്ചവടം - 14200
13/10/2026 അക്സസറീസ് സാധനങ്ങൾ എടുത്തത് - 6800
14/10/2026 വീട്ടുചെലവിന് എടുത്തത് - 8000
15/10/2026 വൈഫൈ ഇന്റർനെറ്റ് ബിൽ - 1180
16/10/2026 വൈകുന്നേരത്തെ ചായയും സമോസയും - 240
17/10/2026 ലോഗോ ഡിസൈൻ ഫീസ് കിട്ടിയത് - 15000
18/10/2026 ഓട്ടോ കൂലി ഡെലിവറി - 850
19/10/2026 അസിസ്റ്റന്റ് ഡിസൈനർ ശമ്പളം - 14000
20/10/2026 ഫേസ്ബുക്ക് പ്രൊമോഷൻ പരസ്യം - 4500
21/10/2026 ചായ പലഹാരം - 180
22/10/2026 പ്രിന്റർ പേപ്പറും മഷിയും - 1450
23/10/2026 വീട്ടിലെ ആവശ്യത്തിന് കുട്ടിയുടെ സ്കൂൾ ഫീസ് - 4500
24/10/2026 റീട്ടെയിൽ കടയിലെ വിൽപ്പന - 9800
25/10/2026 എസി സർവീസിംഗ് അറ്റകുറ്റപ്പണി - 1200
26/10/2026 കൊറിയർ പാഴ്സൽ അയച്ചത് - 680
27/10/2026 ക്ലയന്റ് പേയ്‌മെന്റ് ടെക്സ്റ്റാർട്ട് - 32000
28/10/2026 ക്ലയന്റ് പേയ്‌മെന്റ് ടെക്സ്റ്റാർട്ട് - 32000
29/10/2026 രാത്രി ഭക്ഷണം സ്വിഗ്ഗി - 980
30/10/2026 ബൈക്ക് പെട്രോൾ - 600
31/10/2026 ബാങ്ക് ഗേറ്റ്‌വേ ചാർജ് - 860`;

export const DEMO_MALAYALAM_TRANSACTIONS: Transaction[] = [
  {
    id: 'ml-demo-1',
    date: '2026-10-01',
    description: 'ക്ലയന്റ് പേയ്‌മെന്റ് ശർമ്മ എക്സ്പോർട്സ്',
    type: 'Income',
    category: 'Client Payments',
    amount: 45000,
    status: 'valid',
  },
  {
    id: 'ml-demo-2',
    date: '2026-10-01',
    description: 'കട വാടക കൊടുത്തത്',
    type: 'Expense',
    category: 'Rent',
    amount: 18000,
    status: 'valid',
  },
  {
    id: 'ml-demo-3',
    date: '2026-10-02',
    description: 'ടീമംഗങ്ങൾക്ക് ചായയും ബിസ്കറ്റും',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 140,
    status: 'valid',
  },
  {
    id: 'ml-demo-4',
    date: '2026-10-02',
    description: 'പെട്രോൾ അടിച്ചത് ബൈക്ക്',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 650,
    status: 'valid',
  },
  {
    id: 'ml-demo-5',
    date: '2026-10-03',
    description: 'കൗണ്ടർ സെയിൽസ് യുപിഐ',
    type: 'Income',
    category: 'Sales',
    amount: 8500,
    status: 'valid',
  },
  {
    id: 'ml-demo-6',
    date: '2026-10-04',
    description: 'പാക്കിംഗ് ബോക്സ് സാധനങ്ങൾ വാങ്ങിയത്',
    type: 'Expense',
    category: 'Inventory / Raw Materials',
    amount: 3200,
    status: 'valid',
  },
  {
    id: 'ml-demo-7',
    date: '2026-10-04',
    description: 'ചായയും സ്നാക്സും ക്ലയന്റ് മീറ്റിംഗ്',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 380,
    status: 'valid',
  },
  {
    id: 'ml-demo-8',
    date: '2026-10-05',
    description: 'തുണിയും റോ മെറ്റീരിയലും വാങ്ങിയത്',
    type: 'Expense',
    category: 'Inventory / Raw Materials',
    amount: 18500,
    status: 'valid',
  },
  {
    id: 'ml-demo-9',
    date: '2026-10-05',
    description: 'കൊറിയർ ചാർജ് പാർസൽ അയച്ചത്',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 420,
    status: 'valid',
  },
  {
    id: 'ml-demo-10',
    date: '2026-10-06',
    description: 'ഇൻസ്റ്റാഗ്രാം പരസ്യം ബൂസ്റ്റ് ചെയ്തത്',
    type: 'Expense',
    category: 'Marketing / Advertising',
    amount: 3500,
    status: 'valid',
  },
  {
    id: 'ml-demo-11',
    date: '2026-10-07',
    description: 'സ്റ്റാഫ് ശമ്പള അഡ്വാൻസ് കൊടുത്തത്',
    type: 'Expense',
    category: 'Salaries / Labour',
    amount: 5000,
    status: 'valid',
  },
  {
    id: 'ml-demo-12',
    date: '2026-10-08',
    description: 'ഉച്ചഭക്ഷണം സ്വിഗ്ഗി ഓർഡർ',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 620,
    status: 'valid',
  },
  {
    id: 'ml-demo-13',
    date: '2026-10-08',
    description: 'കടയിലെ കറന്റ് ബിൽ അടച്ചത്',
    type: 'Expense',
    category: 'Utilities',
    amount: 3450,
    status: 'valid',
  },
  {
    id: 'ml-demo-14',
    date: '2026-10-09',
    description: 'വെബ്സൈറ്റ് ഡിസൈൻ ക്ലയന്റ് പേയ്‌മെന്റ്',
    type: 'Income',
    category: 'Client Payments',
    amount: 28000,
    status: 'valid',
  },
  {
    id: 'ml-demo-15',
    date: '2026-10-10',
    description: 'കാൻവ സബ്സ്ക്രിപ്ഷൻ',
    type: 'Expense',
    category: 'Software / Subscriptions',
    amount: 2100,
    status: 'valid',
  },
  {
    id: 'ml-demo-16',
    date: '2026-10-10',
    description: 'ചായക്കടയിലെ ആഴ്ചപ്പണം നൽകിയത്',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 850,
    status: 'valid',
  },
  {
    id: 'ml-demo-17',
    date: '2026-10-11',
    description: 'പെട്രോൾ കാർ ഡെലിവറി റൺ',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 1200,
    status: 'valid',
  },
  {
    id: 'ml-demo-18',
    date: '2026-10-12',
    description: 'വാരാന്ത്യ കട കച്ചവടം',
    type: 'Income',
    category: 'Sales',
    amount: 14200,
    status: 'valid',
  },
  {
    id: 'ml-demo-19',
    date: '2026-10-13',
    description: 'അക്സസറീസ് സാധനങ്ങൾ എടുത്തത്',
    type: 'Expense',
    category: 'Inventory / Raw Materials',
    amount: 6800,
    status: 'valid',
  },
  {
    id: 'ml-demo-20',
    date: '2026-10-14',
    description: 'വീട്ടുചെലവിന് എടുത്തത്',
    type: 'Expense',
    category: 'Personal Withdrawals',
    amount: 8000,
    status: 'valid',
  },
  {
    id: 'ml-demo-21',
    date: '2026-10-15',
    description: 'വൈഫൈ ഇന്റർനെറ്റ് ബിൽ',
    type: 'Expense',
    category: 'Utilities',
    amount: 1180,
    status: 'valid',
  },
  {
    id: 'ml-demo-22',
    date: '2026-10-16',
    description: 'വൈകുന്നേരത്തെ ചായയും സമോസയും',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 240,
    status: 'valid',
  },
  {
    id: 'ml-demo-23',
    date: '2026-10-17',
    description: 'ലോഗോ ഡിസൈൻ ഫീസ് കിട്ടിയത്',
    type: 'Income',
    category: 'Client Payments',
    amount: 15000,
    status: 'valid',
  },
  {
    id: 'ml-demo-24',
    date: '2026-10-18',
    description: 'ഓട്ടോ കൂലി ഡെലിവറി',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 850,
    status: 'valid',
  },
  {
    id: 'ml-demo-25',
    date: '2026-10-19',
    description: 'അസിസ്റ്റന്റ് ഡിസൈനർ ശമ്പളം',
    type: 'Expense',
    category: 'Salaries / Labour',
    amount: 14000,
    status: 'valid',
  },
  {
    id: 'ml-demo-26',
    date: '2026-10-20',
    description: 'ഫേസ്ബുക്ക് പ്രൊമോഷൻ പരസ്യം',
    type: 'Expense',
    category: 'Marketing / Advertising',
    amount: 4500,
    status: 'valid',
  },
  {
    id: 'ml-demo-27',
    date: '2026-10-21',
    description: 'ചായ പലഹാരം',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 180,
    status: 'valid',
  },
  {
    id: 'ml-demo-28',
    date: '2026-10-22',
    description: 'പ്രിന്റർ പേപ്പറും മഷിയും',
    type: 'Expense',
    category: 'Office / Supplies',
    amount: 1450,
    status: 'valid',
  },
  {
    id: 'ml-demo-29',
    date: '2026-10-23',
    description: 'വീട്ടിലെ ആവശ്യത്തിന് കുട്ടിയുടെ സ്കൂൾ ഫീസ്',
    type: 'Expense',
    category: 'Personal Withdrawals',
    amount: 4500,
    status: 'valid',
  },
  {
    id: 'ml-demo-30',
    date: '2026-10-24',
    description: 'റീട്ടെയിൽ കടയിലെ വിൽപ്പന',
    type: 'Income',
    category: 'Sales',
    amount: 9800,
    status: 'valid',
  },
  {
    id: 'ml-demo-31',
    date: '2026-10-25',
    description: 'എസി സർവീസിംഗ് അറ്റകുറ്റപ്പണി',
    type: 'Expense',
    category: 'Repairs / Maintenance',
    amount: 1200,
    status: 'valid',
  },
  {
    id: 'ml-demo-32',
    date: '2026-10-26',
    description: 'കൊറിയർ പാഴ്സൽ അയച്ചത്',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 680,
    status: 'valid',
  },
  {
    id: 'ml-demo-33',
    date: '2026-10-27',
    description: 'ക്ലയന്റ് പേയ്‌മെന്റ് ടെക്സ്റ്റാർട്ട്',
    type: 'Income',
    category: 'Client Payments',
    amount: 32000,
    status: 'valid',
  },
  {
    id: 'ml-demo-34',
    date: '2026-10-27',
    description: 'ക്ലയന്റ് പേയ്‌മെന്റ് ടെക്സ്റ്റാർട്ട്',
    type: 'Income',
    category: 'Client Payments',
    amount: 32000,
    status: 'needs_review',
    isDuplicate: true,
    reviewReason: 'സാധ്യതയുള്ള ഇരട്ട എൻട്രി (ഒരേ ദിവസം 2 തവണ)',
  },
  {
    id: 'ml-demo-35',
    date: '2026-10-29',
    description: 'രാത്രി ഭക്ഷണം സ്വിഗ്ഗി',
    type: 'Expense',
    category: 'Food / Refreshments',
    amount: 980,
    status: 'valid',
  },
  {
    id: 'ml-demo-36',
    date: '2026-10-30',
    description: 'ബൈക്ക് പെട്രോൾ',
    type: 'Expense',
    category: 'Transport / Fuel',
    amount: 600,
    status: 'valid',
  },
  {
    id: 'ml-demo-37',
    date: '2026-10-31',
    description: 'ബാങ്ക് ഗേറ്റ്‌വേ ചാർജ്',
    type: 'Expense',
    category: 'Bank / Payment Charges',
    amount: 860,
    status: 'valid',
  },
];
