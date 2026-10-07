import * as XLSX from 'xlsx';
import { Transaction, TransactionType, Category, ExpenseCategory, IncomeCategory } from '../types/cashflow';

// Default categories
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Salaries / Labour',
  'Inventory / Raw Materials',
  'Transport / Fuel',
  'Utilities',
  'Marketing / Advertising',
  'Food / Refreshments',
  'Software / Subscriptions',
  'Equipment',
  'Repairs / Maintenance',
  'Loan / EMI',
  'Bank / Payment Charges',
  'Office / Supplies',
  'Personal Withdrawals',
  'Miscellaneous',
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Sales',
  'Client Payments',
  'Service Revenue',
  'Other Income',
];

/**
 * Normalizes Indian currency string into a number.
 * Handles:
 * "₹15,000", "Rs 15000", "INR 12.5k", "1.5K", "12k", "25,000.00"
 */
export function parseRupeeAmount(raw: string): number | null {
  if (!raw || typeof raw !== 'string') return null;

  // Clean trailing punctuation or parentheses
  let str = raw.trim().replace(/[()]/g, '');

  // Check for 'k' or 'K' multiplier (e.g. 1.5k, 15k, 25K)
  const kMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*[kK]\b/);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    if (!isNaN(val)) {
      return Math.round(val * 1000);
    }
  }

  // Remove currency markers and formatting
  str = str.replace(/[₹\s,]/g, '')
           .replace(/\b(?:Rs\.?|INR)\b/gi, '')
           .replace(/^-/, '') // minus if negative
           .trim();

  // If there's a number left
  const numMatch = str.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    return isNaN(val) ? null : Math.round(val);
  }

  return null;
}

/**
 * Intelligent categorization rules specifically tailored for Indian MSMEs & solo entrepreneurs.
 */
export function categorizeTransaction(desc: string, forcedType?: TransactionType): {
  type: TransactionType;
  category: Category;
  confidence: number;
} {
  const lower = desc.toLowerCase().trim();

  // 1. Personal withdrawals
  if (
    lower.includes('personal') ||
    lower.includes('home expense') ||
    lower.includes('house expense') ||
    lower.includes('household') ||
    lower.includes('drawing') ||
    lower.includes('drawings') ||
    lower.includes('self transfer') ||
    lower.includes('transfer to wife') ||
    lower.includes('transfer to self') ||
    lower.includes('school fee') ||
    lower.includes('grocery home') ||
    lower.includes('pocket money')
  ) {
    return { type: 'Expense', category: 'Personal Withdrawals', confidence: 0.95 };
  }

  // 2. Clear Income triggers
  if (
    lower.includes('client payment') ||
    lower.includes('customer payment') ||
    lower.includes('received from') ||
    lower.includes('invoice paid') ||
    lower.includes('project fee') ||
    lower.includes('retainer') ||
    lower.includes('consulting fee') ||
    lower.includes('freelance') ||
    lower.includes('payment received')
  ) {
    return { type: 'Income', category: 'Client Payments', confidence: 0.95 };
  }

  if (
    lower.includes('shop sale') ||
    lower.includes('counter sale') ||
    lower.includes('cash sale') ||
    lower.includes('upi sale') ||
    lower.includes('daily sale') ||
    lower.includes('product sale') ||
    lower.includes('swiggy payout') ||
    lower.includes('zomato payout') ||
    lower.includes('amazon payout') ||
    lower.includes('order sale')
  ) {
    return { type: 'Income', category: 'Sales', confidence: 0.95 };
  }

  if (
    lower.includes('service fee') ||
    lower.includes('repair service') ||
    lower.includes('consultation') ||
    lower.includes('coaching fee') ||
    lower.includes('class fee')
  ) {
    return { type: 'Income', category: 'Service Revenue', confidence: 0.9 };
  }

  if (
    lower.includes('interest credit') ||
    lower.includes('cashback') ||
    lower.includes('refund received') ||
    lower.includes('dividend') ||
    lower.includes('scrap sale') ||
    lower.includes('other income')
  ) {
    return { type: 'Income', category: 'Other Income', confidence: 0.85 };
  }

  // 3. Explicit Expense triggers
  if (lower.includes('rent') || lower.includes('shop rent') || lower.includes('office rent') || lower.includes('godown rent')) {
    return { type: 'Expense', category: 'Rent', confidence: 0.95 };
  }

  if (
    lower.includes('salary') ||
    lower.includes('salaries') ||
    lower.includes('wage') ||
    lower.includes('wages') ||
    lower.includes('labour') ||
    lower.includes('helper') ||
    lower.includes('maid') ||
    lower.includes('staff pay') ||
    lower.includes('intern stipend')
  ) {
    return { type: 'Expense', category: 'Salaries / Labour', confidence: 0.95 };
  }

  if (
    lower.includes('raw material') ||
    lower.includes('inventory') ||
    lower.includes('stock purchase') ||
    lower.includes('goods purchase') ||
    lower.includes('packing material') ||
    lower.includes('boxes') ||
    lower.includes('wholesale') ||
    lower.includes('supplier') ||
    lower.includes('fabric') ||
    lower.includes('ingredients')
  ) {
    return { type: 'Expense', category: 'Inventory / Raw Materials', confidence: 0.9 };
  }

  if (
    lower.includes('petrol') ||
    lower.includes('diesel') ||
    lower.includes('fuel') ||
    lower.includes('auto') ||
    lower.includes('cab') ||
    lower.includes('ola') ||
    lower.includes('uber') ||
    lower.includes('rapido') ||
    lower.includes('porter') ||
    lower.includes('delivery charge') ||
    lower.includes('courier') ||
    lower.includes('fastag') ||
    lower.includes('transport')
  ) {
    return { type: 'Expense', category: 'Transport / Fuel', confidence: 0.9 };
  }

  if (
    lower.includes('electricity') ||
    lower.includes('power bill') ||
    lower.includes('water bill') ||
    lower.includes('wifi') ||
    lower.includes('internet') ||
    lower.includes('broadband') ||
    lower.includes('mobile recharge') ||
    lower.includes('airtel') ||
    lower.includes('jio')
  ) {
    return { type: 'Expense', category: 'Utilities', confidence: 0.9 };
  }

  if (
    lower.includes('instagram ad') ||
    lower.includes('facebook ad') ||
    lower.includes('google ad') ||
    lower.includes('meta ad') ||
    lower.includes('pamphlet') ||
    lower.includes('banner') ||
    lower.includes('marketing') ||
    lower.includes('ad spend') ||
    lower.includes('sponsored') ||
    lower.includes('poster')
  ) {
    return { type: 'Expense', category: 'Marketing / Advertising', confidence: 0.9 };
  }

  if (
    lower.includes('chai') ||
    lower.includes('tea') ||
    lower.includes('coffee') ||
    lower.includes('snacks') ||
    lower.includes('samosa') ||
    lower.includes('lunch') ||
    lower.includes('dinner') ||
    lower.includes('swiggy') ||
    lower.includes('zomato') ||
    lower.includes('refreshment') ||
    lower.includes('client lunch') ||
    lower.includes('biscuits')
  ) {
    return { type: 'Expense', category: 'Food / Refreshments', confidence: 0.9 };
  }

  if (
    lower.includes('software') ||
    lower.includes('subscription') ||
    lower.includes('canva') ||
    lower.includes('zoho') ||
    lower.includes('tally') ||
    lower.includes('google workspace') ||
    lower.includes('domain') ||
    lower.includes('hosting') ||
    lower.includes('chatgpt') ||
    lower.includes('notion') ||
    lower.includes('aws')
  ) {
    return { type: 'Expense', category: 'Software / Subscriptions', confidence: 0.9 };
  }

  if (
    lower.includes('printer') ||
    lower.includes('laptop') ||
    lower.includes('monitor') ||
    lower.includes('tools') ||
    lower.includes('machine') ||
    lower.includes('equipment') ||
    lower.includes('ac purchase')
  ) {
    return { type: 'Expense', category: 'Equipment', confidence: 0.85 };
  }

  if (
    lower.includes('repair') ||
    lower.includes('maintenance') ||
    lower.includes('plumber') ||
    lower.includes('electrician') ||
    lower.includes('servicing') ||
    lower.includes('painting')
  ) {
    return { type: 'Expense', category: 'Repairs / Maintenance', confidence: 0.85 };
  }

  if (lower.includes('emi') || lower.includes('loan repayment') || lower.includes('interest on loan')) {
    return { type: 'Expense', category: 'Loan / EMI', confidence: 0.9 };
  }

  if (
    lower.includes('bank charge') ||
    lower.includes('pos machine fee') ||
    lower.includes('pg fee') ||
    lower.includes('razorpay fee') ||
    lower.includes('sms charge') ||
    lower.includes('convenience fee')
  ) {
    return { type: 'Expense', category: 'Bank / Payment Charges', confidence: 0.9 };
  }

  if (
    lower.includes('stationery') ||
    lower.includes('pen') ||
    lower.includes('paper') ||
    lower.includes('printout') ||
    lower.includes('stapler') ||
    lower.includes('office supply') ||
    lower.includes('cleaning liquid')
  ) {
    return { type: 'Expense', category: 'Office / Supplies', confidence: 0.85 };
  }

  // If forced type is given:
  if (forcedType === 'Income') {
    return { type: 'Income', category: 'Sales', confidence: 0.6 };
  }

  // Default fallback
  return { type: 'Expense', category: 'Miscellaneous', confidence: 0.5 };
}

/**
 * Parses raw messy lines of text into structured transactions.
 */
export function parseRawTextEntries(text: string): {
  transactions: Transaction[];
  unparsedCount: number;
} {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const transactions: Transaction[] = [];
  let unparsedCount = 0;

  let currentDate = new Date().toISOString().slice(0, 10); // default today

  // Pattern to detect pure date lines like "01/10/2026", "Oct 02", "03-10-2026"
  const dateRegex = /^(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:,? \d{4})?|\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:,? \d{4})?)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is just a date heading
    if (dateRegex.test(line)) {
      currentDate = standardizeDate(line);
      continue;
    }

    // Check if line contains inline date at start, e.g., "01/10/2026 Client payment - 15000"
    let lineDate = currentDate;
    let content = line;

    const leadingDateMatch = line.match(/^(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\d{1,2} [A-Za-z]{3,9}(?: \d{4})?|[A-Za-z]{3,9} \d{1,2}(?:, \d{4})?)\s*[:\-–]?\s*(.*)$/);
    if (leadingDateMatch) {
      lineDate = standardizeDate(leadingDateMatch[1]);
      content = leadingDateMatch[2].trim();
    }

    if (!content) continue;

    // Extract amount: look for patterns like "15000", "₹15,000", "15k", "1.2k", "Rs 800"
    // Also look for " - 15000", " 15000", "15k petrol"
    let amount: number | null = null;
    let description = content;

    // Pattern A: trailing amount e.g. "Client payment - 15000", "Petrol 800", "Tea ₹120", "Instagram ads: 2.5k"
    const trailingAmountMatch = content.match(/^(.*?)(?:[:\-–\s]+)?\s*([₹\s]*(?:Rs\.?|INR)?\s*\d+(?:[.,]\d+)?\s*[kK]?)\s*$/i);
    // Pattern B: leading amount e.g. "15k client payment", "1.2k petrol", "₹500 lunch"
    const leadingAmountMatch = content.match(/^([₹\s]*(?:Rs\.?|INR)?\s*\d+(?:[.,]\d+)?\s*[kK]?)\s*(?:[:\-–\s]+)?\s*(.*?)$/i);

    if (trailingAmountMatch && trailingAmountMatch[1].trim().length > 0 && isAmountToken(trailingAmountMatch[2])) {
      amount = parseRupeeAmount(trailingAmountMatch[2]);
      description = trailingAmountMatch[1].trim().replace(/[:\-–]$/, '').trim();
    } else if (leadingAmountMatch && leadingAmountMatch[2].trim().length > 0 && isAmountToken(leadingAmountMatch[1])) {
      amount = parseRupeeAmount(leadingAmountMatch[1]);
      description = leadingAmountMatch[2].trim();
    } else {
      // General regex search for rupee or k pattern
      const generalAmountMatch = content.match(/([₹\s]*(?:Rs\.?|INR)\s*\d+(?:[.,]\d+)?|\b\d+(?:[.,]\d+)?\s*[kK]\b)/i);
      if (generalAmountMatch) {
        amount = parseRupeeAmount(generalAmountMatch[1]);
        description = content.replace(generalAmountMatch[1], '').trim().replace(/^[:\-–]|[:\-–]$/g, '').trim();
      }
    }

    if (amount === null || isNaN(amount) || amount <= 0) {
      // Flag as needing review or unparsed
      unparsedCount++;
      transactions.push({
        id: `tx-${Date.now()}-${i}`,
        date: lineDate,
        description: content,
        type: 'Expense',
        category: 'Miscellaneous',
        amount: 0,
        status: 'needs_review',
        reviewReason: 'Missing or unreadable amount',
        isAmbiguous: true,
      });
      continue;
    }

    // Determine type and category
    const { type, category } = categorizeTransaction(description);

    transactions.push({
      id: `tx-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      date: lineDate,
      description: cleanDescription(description),
      type,
      category,
      amount,
      status: 'valid',
    });
  }

  // Deduplication check: flag exact duplicate date + amount + description
  detectDuplicates(transactions);

  return { transactions, unparsedCount };
}

function isAmountToken(token: string): boolean {
  return /^[₹\s]*(?:Rs\.?|INR)?\s*\d+(?:[.,]\d+)?\s*[kK]?$/i.test(token.trim());
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/^[-–:\s]+|[-–:\s]+$/g, '')
    .trim()
    .replace(/^([a-z])/, (_m, p1) => p1.toUpperCase());
}

function standardizeDate(raw: string): string {
  try {
    const trimmed = raw.trim();
    // Format DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3] ? (dmyMatch[3].length === 2 ? `20${dmyMatch[3]}` : dmyMatch[3]) : '2026';
      return `${year}-${month}-${day}`;
    }

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch (_e) {
    // fallback
  }
  return new Date().toISOString().slice(0, 10);
}

function detectDuplicates(transactions: Transaction[]) {
  const seen = new Map<string, Transaction[]>();

  transactions.forEach((tx) => {
    if (tx.amount <= 0) return;
    const key = `${tx.date}_${tx.amount}_${tx.description.toLowerCase().trim()}`;
    const group = seen.get(key) || [];
    group.push(tx);
    seen.set(key, group);
  });

  seen.forEach((group) => {
    if (group.length > 1) {
      group.forEach((tx) => {
        tx.isDuplicate = true;
        tx.status = 'needs_review';
        tx.reviewReason = `Possible duplicate transaction (repeated ${group.length} times)`;
      });
    }
  });
}

/**
 * Parses XLSX / XLS / CSV ArrayBuffer or File
 */
export async function parseSpreadsheetFile(file: File): Promise<{
  transactions: Transaction[];
  error?: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { transactions: [], error: "No sheets found in this file." };
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return { transactions: [], error: "The file seems to be empty." };
    }

    // Header matching logic
    const firstRow = rawRows[0];
    const keys = Object.keys(firstRow);

    const dateKey = keys.find(k => /date|day|dated|when|transaction_date/i.test(k));
    const descKey = keys.find(k => /desc|description|particulars|narration|item|details|remarks/i.test(k));
    const amountKey = keys.find(k => /amount|total|value|rs|inr|net|txn_amt/i.test(k));
    const creditKey = keys.find(k => /credit|income|deposit|inflow|received/i.test(k));
    const debitKey = keys.find(k => /debit|expense|spent|outflow|payment/i.test(k));
    const typeKey = keys.find(k => /type|trans_type|nature/i.test(k));
    const catKey = keys.find(k => /category|head|group/i.test(k));

    const transactions: Transaction[] = [];

    rawRows.forEach((row, idx) => {
      let rawDate = dateKey ? String(row[dateKey]).trim() : '';
      let desc = descKey ? String(row[descKey]).trim() : '';
      let amount = 0;
      let type: TransactionType = 'Expense';

      if (creditKey && debitKey) {
        const creditVal = parseRupeeAmount(String(row[creditKey]));
        const debitVal = parseRupeeAmount(String(row[debitKey]));

        if (creditVal && creditVal > 0) {
          amount = creditVal;
          type = 'Income';
        } else if (debitVal && debitVal > 0) {
          amount = debitVal;
          type = 'Expense';
        }
      } else if (amountKey) {
        const parsed = parseRupeeAmount(String(row[amountKey]));
        amount = parsed || 0;

        if (typeKey && String(row[typeKey]).toLowerCase().includes('in')) {
          type = 'Income';
        } else {
          // Check sign if negative
          const rawStr = String(row[amountKey]);
          if (rawStr.includes('-')) {
            type = 'Expense';
          }
        }
      }

      // If description wasn't under a named key, try first string cell
      if (!desc) {
        for (const k of keys) {
          if (k !== dateKey && k !== amountKey && k !== creditKey && k !== debitKey) {
            const v = String(row[k]).trim();
            if (v && isNaN(Number(v))) {
              desc = v;
              break;
            }
          }
        }
      }

      if (!desc && amount === 0) return; // skip empty rows

      // Normalize date
      const date = rawDate ? standardizeDate(rawDate) : new Date().toISOString().slice(0, 10);

      // Category
      let category: Category;
      if (catKey && row[catKey]) {
        category = row[catKey] as Category;
      } else {
        const catRes = categorizeTransaction(desc, type);
        category = catRes.category;
        if (!typeKey && !creditKey) {
          type = catRes.type;
        }
      }

      const tx: Transaction = {
        id: `file-tx-${Date.now()}-${idx}`,
        date,
        description: desc || 'Uncategorized Entry',
        type,
        category,
        amount: Math.abs(amount),
        status: amount > 0 && desc ? 'valid' : 'needs_review',
        reviewReason: amount === 0 ? 'Amount is zero or missing' : undefined,
      };

      transactions.push(tx);
    });

    detectDuplicates(transactions);

    return { transactions };
  } catch (err: any) {
    return { transactions: [], error: err?.message || 'Failed to parse file' };
  }
}
