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
 * "₹15,000", "Rs 15000", "INR 12.5k", "1.5K", "12k", "25,000.00", "15000 രൂപ", "രൂപ 15,000", "500 രൂ"
 */
export function parseRupeeAmount(raw: string): number | null {
  if (!raw || typeof raw !== 'string') return null;

  // Clean trailing punctuation, parentheses, and Malayalam rupee markers
  let str = raw.trim().replace(/[()]/g, '');

  // Check for 'k' or 'K' multiplier (e.g. 1.5k, 15k, 25K)
  const kMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*[kK]\b/);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    if (!isNaN(val)) {
      return Math.round(val * 1000);
    }
  }

  // Remove currency markers and formatting (including Malayalam രൂപ / രൂ)
  str = str.replace(/[₹\s,]/g, '')
           .replace(/\b(?:Rs\.?|INR|roopa|rupees?)\b/gi, '')
           .replace(/(?:രൂപ|രൂ\.?)/g, '')
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

  // 1. Personal withdrawals (വീട്ടുചെലവ് / personal use)
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
    lower.includes('pocket money') ||
    lower.includes('വീട്ടുചെലവ്') ||
    lower.includes('വീട്ടിലേക്ക്') ||
    lower.includes('വീട്ടു ചിലവ്') ||
    lower.includes('സ്വന്തം ആവശ്യം') ||
    lower.includes('സ്വന്തം ചിലവ്') ||
    lower.includes('കുട്ടിയുടെ ഫീസ്') ||
    lower.includes('വീട്ടാവശ്യം') ||
    lower.includes('veettu chelavu') ||
    lower.includes('veettilekku') ||
    lower.includes('swantham avashyam')
  ) {
    return { type: 'Expense', category: 'Personal Withdrawals', confidence: 0.95 };
  }

  // 2. Clear Income triggers
  // Client Payments (ക്ലയന്റ് പേയ്‌മെന്റ് / client cash)
  if (
    lower.includes('client payment') ||
    lower.includes('customer payment') ||
    lower.includes('received from') ||
    lower.includes('invoice paid') ||
    lower.includes('project fee') ||
    lower.includes('retainer') ||
    lower.includes('consulting fee') ||
    lower.includes('freelance') ||
    lower.includes('payment received') ||
    lower.includes('ക്ലയന്റ്') ||
    lower.includes('പ്രോജക്ട് പണം') ||
    lower.includes('അഡ്വാൻസ് കിട്ടിയത്') ||
    lower.includes('ബാക്കി കിട്ടിയത്') ||
    lower.includes('പാർട്ടി തന്നത്') ||
    lower.includes('client paisa') ||
    lower.includes('advance kittiyath') ||
    lower.includes('party thannath')
  ) {
    return { type: 'Income', category: 'Client Payments', confidence: 0.95 };
  }

  // Sales (കച്ചവടം / വില്പന / daily collections)
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
    lower.includes('order sale') ||
    lower.includes('കച്ചവടം') ||
    lower.includes('വില്പന') ||
    lower.includes('വിൽപ്പന') ||
    lower.includes('കടയിലെ വില്പന') ||
    lower.includes('സെയിൽസ്') ||
    lower.includes('കളക്ഷൻ') ||
    lower.includes('കട വരുമാനം') ||
    lower.includes('kachavadam') ||
    lower.includes('vilpana') ||
    lower.includes('innathe collection')
  ) {
    return { type: 'Income', category: 'Sales', confidence: 0.95 };
  }

  // Service Revenue (സർവീസ് ചാർജ് / കൂലി)
  if (
    lower.includes('service fee') ||
    lower.includes('service revenue') ||
    lower.includes('repair service') ||
    lower.includes('consultation') ||
    lower.includes('coaching fee') ||
    lower.includes('class fee') ||
    lower.includes('സർവീസ് ചാർജ്') ||
    lower.includes('സർവീസ് ഫീസ്') ||
    lower.includes('പണിക്കൂലി കിട്ടിയത്') ||
    lower.includes('കൺസൾട്ടേഷൻ ഫീസ്') ||
    lower.includes('റിപ്പയറിംഗ് ചാർജ്') ||
    lower.includes('service charge') ||
    lower.includes('pani kooli kittiyath')
  ) {
    return { type: 'Income', category: 'Service Revenue', confidence: 0.9 };
  }

  // Other Income (പലിശ / റീഫണ്ട് / ക്യാഷ്ബാക്ക്)
  if (
    lower.includes('interest credit') ||
    lower.includes('cashback') ||
    lower.includes('refund received') ||
    lower.includes('dividend') ||
    lower.includes('scrap sale') ||
    lower.includes('other income') ||
    lower.includes('പലിശ കിട്ടിയത്') ||
    lower.includes('ക്യാഷ്ബാക്ക്') ||
    lower.includes('റീഫണ്ട്') ||
    lower.includes('കമ്മീഷൻ') ||
    lower.includes('മറ്റ് വരുമാനം') ||
    lower.includes('palisa kittiyath')
  ) {
    return { type: 'Income', category: 'Other Income', confidence: 0.85 };
  }

  // 3. Explicit Expense triggers
  // Rent (കട വാടക / room vadaka)
  if (
    lower.includes('rent') ||
    lower.includes('shop rent') ||
    lower.includes('office rent') ||
    lower.includes('godown rent') ||
    lower.includes('വാടക') ||
    lower.includes('കട വാടക') ||
    lower.includes('റൂം വാടക') ||
    lower.includes('ഓഫീസ് വാടക') ||
    lower.includes('ഗോഡൗൺ വാടക') ||
    lower.includes('vadaka') ||
    lower.includes('kada vadaka')
  ) {
    return { type: 'Expense', category: 'Rent', confidence: 0.95 };
  }

  // Salaries / Labour (ശമ്പളം / കൂലി)
  if (
    lower.includes('salary') ||
    lower.includes('salaries') ||
    lower.includes('wage') ||
    lower.includes('wages') ||
    lower.includes('labour') ||
    lower.includes('helper') ||
    lower.includes('maid') ||
    lower.includes('staff pay') ||
    lower.includes('intern stipend') ||
    lower.includes('ശമ്പളം') ||
    lower.includes('കൂലി') ||
    lower.includes('സ്റ്റാഫ് ശമ്പളം') ||
    lower.includes('ഹെൽപ്പർ കൂലി') ||
    lower.includes('പണിക്കൂലി') ||
    lower.includes('അസിസ്റ്റന്റ് ശമ്പളം') ||
    lower.includes('sambalam') ||
    lower.includes('kooli') ||
    lower.includes('panikkooli') ||
    lower.includes('staff salary')
  ) {
    return { type: 'Expense', category: 'Salaries / Labour', confidence: 0.95 };
  }

  // Inventory / Raw Materials (സാധനങ്ങൾ വാങ്ങിയത് / സ്റ്റോക്ക്)
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
    lower.includes('ingredients') ||
    lower.includes('സാധനങ്ങൾ വാങ്ങിയത്') ||
    lower.includes('സ്റ്റോക്ക്') ||
    lower.includes('സാധനം എടുത്തത്') ||
    lower.includes('റോ മെറ്റീരിയൽ') ||
    lower.includes('സാധന സാമഗ്രികൾ') ||
    lower.includes('ഹോൾസെയിൽ') ||
    lower.includes('പാക്കിംഗ് ബോക്സ്') ||
    lower.includes('തുണി വാങ്ങിയത്') ||
    lower.includes('സപ്ലയർക്ക്') ||
    lower.includes('sadhanam vangiyath') ||
    lower.includes('stock eduthath')
  ) {
    return { type: 'Expense', category: 'Inventory / Raw Materials', confidence: 0.9 };
  }

  // Transport / Fuel (പെട്രോൾ / വണ്ടി കൂലി / കൊറിയർ)
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
    lower.includes('transport') ||
    lower.includes('പെട്രോൾ') ||
    lower.includes('ഡീസൽ') ||
    lower.includes('വണ്ടി കൂലി') ||
    lower.includes('ഓട്ടോ കൂലി') ||
    lower.includes('കൊറിയർ ചാർജ്') ||
    lower.includes('പാർസൽ അയച്ചത്') ||
    lower.includes('ഡെലിവറി ചാർജ്') ||
    lower.includes('ഡെലിവറി') ||
    lower.includes('vandi kooli') ||
    lower.includes('auto kooli') ||
    lower.includes('courier charge')
  ) {
    return { type: 'Expense', category: 'Transport / Fuel', confidence: 0.9 };
  }

  // Utilities (കറന്റ് ബിൽ / വെള്ളക്കരം / വൈഫൈ)
  if (
    lower.includes('electricity') ||
    lower.includes('power bill') ||
    lower.includes('water bill') ||
    lower.includes('wifi') ||
    lower.includes('internet') ||
    lower.includes('broadband') ||
    lower.includes('mobile recharge') ||
    lower.includes('airtel') ||
    lower.includes('jio') ||
    lower.includes('കറന്റ് ബിൽ') ||
    lower.includes('വൈദ്യുതി ബിൽ') ||
    lower.includes('വെള്ളക്കരം') ||
    lower.includes('ഇന്റർനെറ്റ് ബിൽ') ||
    lower.includes('വൈഫൈ') ||
    lower.includes('റീചാർജ്') ||
    lower.includes('ഫോൺ റീചാർജ്') ||
    lower.includes('current bill') ||
    lower.includes('vaidyuthi bill') ||
    lower.includes('internet bill')
  ) {
    return { type: 'Expense', category: 'Utilities', confidence: 0.9 };
  }

  // Marketing / Ads (പരസ്യം / പോസ്റ്റർ / പ്രൊമോഷൻ)
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
    lower.includes('poster') ||
    lower.includes('പരസ്യം') ||
    lower.includes('ഇൻസ്റ്റാഗ്രാം പരസ്യം') ||
    lower.includes('ഫേസ്ബുക്ക് പരസ്യം') ||
    lower.includes('പോസ്റ്റർ') ||
    lower.includes('നോട്ടീസ്') ||
    lower.includes('പ്രൊമോഷൻ') ||
    lower.includes('ബൂസ്റ്റ് ചെയ്തത്') ||
    lower.includes('മാർക്കറ്റിംഗ്') ||
    lower.includes('parasyam') ||
    lower.includes('parasym')
  ) {
    return { type: 'Expense', category: 'Marketing / Advertising', confidence: 0.9 };
  }

  // Food / Refreshments (ചായ / കാപ്പി / സ്നാക്സ് / ഭക്ഷണം)
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
    lower.includes('biscuits') ||
    lower.includes('ചായ') ||
    lower.includes('കാപ്പി') ||
    lower.includes('സ്നാക്സ്') ||
    lower.includes('ഉച്ചഭക്ഷണം') ||
    lower.includes('ഊണ്') ||
    lower.includes('ബിസ്കറ്റ്') ||
    lower.includes('സമോസ') ||
    lower.includes('ഭക്ഷണം') ||
    lower.includes('ഹോട്ടൽ') ||
    lower.includes('കടി') ||
    lower.includes('പലഹാരം') ||
    lower.includes('രാത്രി ഭക്ഷണം') ||
    lower.includes('chaya') ||
    lower.includes('kaapi') ||
    lower.includes('oonu') ||
    lower.includes('bhakshanam')
  ) {
    return { type: 'Expense', category: 'Food / Refreshments', confidence: 0.9 };
  }

  // Software / Subscriptions (സോഫ്റ്റ്‌വെയർ / കാൻവ)
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
    lower.includes('aws') ||
    lower.includes('സോഫ്റ്റ്‌വെയർ') ||
    lower.includes('സബ്സ്ക്രിപ്ഷൻ') ||
    lower.includes('കാൻവ') ||
    lower.includes('ടാലി') ||
    lower.includes('ഡൊമൈൻ')
  ) {
    return { type: 'Expense', category: 'Software / Subscriptions', confidence: 0.9 };
  }

  // Equipment (മെഷീൻ / പ്രിന്റർ)
  if (
    lower.includes('printer') ||
    lower.includes('laptop') ||
    lower.includes('monitor') ||
    lower.includes('tools') ||
    lower.includes('machine') ||
    lower.includes('equipment') ||
    lower.includes('ac purchase') ||
    lower.includes('മെഷീൻ വാങ്ങിയത്') ||
    lower.includes('പ്രിന്റർ') ||
    lower.includes('ഉപകരണം') ||
    lower.includes('കമ്പ്യൂട്ടർ വാങ്ങിയത്')
  ) {
    return { type: 'Expense', category: 'Equipment', confidence: 0.85 };
  }

  // Repairs / Maintenance (റിപ്പയർ / സർവീസിംഗ്)
  if (
    lower.includes('repair') ||
    lower.includes('maintenance') ||
    lower.includes('plumber') ||
    lower.includes('electrician') ||
    lower.includes('servicing') ||
    lower.includes('painting') ||
    lower.includes('റിപ്പയർ') ||
    lower.includes('അറ്റകുറ്റപ്പണി') ||
    lower.includes('സർവീസിംഗ്') ||
    lower.includes('പ്ലംബർ കൂലി') ||
    lower.includes('ഇലക്ട്രീഷ്യൻ കൂലി')
  ) {
    return { type: 'Expense', category: 'Repairs / Maintenance', confidence: 0.85 };
  }

  // Loan / EMI (ലോൺ തിരിച്ചടവ് / ഇഎംഐ / ചിട്ടി)
  if (
    lower.includes('emi') ||
    lower.includes('loan repayment') ||
    lower.includes('loan') ||
    lower.includes('interest on loan') ||
    lower.includes('ലോൺ') ||
    lower.includes('ലോൺ തിരിച്ചടവ്') ||
    lower.includes('ഇഎംഐ') ||
    lower.includes('ചിട്ടി') ||
    lower.includes('ചിട്ടി അടവ്') ||
    lower.includes('ചിട്ടിയടവ്') ||
    lower.includes('വായ്പ') ||
    lower.includes('പലിശ കൊടുത്തത്') ||
    lower.includes('chitty') ||
    lower.includes('chitti') ||
    lower.includes('loan thirichadavu')
  ) {
    return { type: 'Expense', category: 'Loan / EMI', confidence: 0.9 };
  }

  // Bank Charges (ബാങ്ക് ചാർജ് / ഗേറ്റ്‌വേ)
  if (
    lower.includes('bank charge') ||
    lower.includes('pos machine fee') ||
    lower.includes('pg fee') ||
    lower.includes('razorpay fee') ||
    lower.includes('sms charge') ||
    lower.includes('convenience fee') ||
    lower.includes('ബാങ്ക് ചാർജ്') ||
    lower.includes('യുപിഐ ചാർജ്') ||
    lower.includes('ഗേറ്റ്‌വേ ചാർജ്') ||
    lower.includes('bank charge')
  ) {
    return { type: 'Expense', category: 'Bank / Payment Charges', confidence: 0.9 };
  }

  // Office Supplies (സ്റ്റേഷനറി / പേപ്പർ)
  if (
    lower.includes('stationery') ||
    lower.includes('pen') ||
    lower.includes('paper') ||
    lower.includes('printout') ||
    lower.includes('stapler') ||
    lower.includes('office supply') ||
    lower.includes('cleaning liquid') ||
    lower.includes('സ്റ്റേഷനറി') ||
    lower.includes('പേപ്പർ') ||
    lower.includes('പ്രിന്റർ പേപ്പർ') ||
    lower.includes('മഷി') ||
    lower.includes('ഓഫീസ് സാധനങ്ങൾ')
  ) {
    return { type: 'Expense', category: 'Office / Supplies', confidence: 0.85 };
  }

  // Miscellaneous / പലവക
  if (lower.includes('പലവക') || lower.includes('ചില്ലറ ചെലവുകൾ') || lower.includes('മറ്റ് ചെലവുകൾ') || lower.includes('chillara chelavu')) {
    return { type: 'Expense', category: 'Miscellaneous', confidence: 0.8 };
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

    // Check if line specifies explicit Income / Expense prefix (Malayalam or English)
    let forcedType: TransactionType | undefined = undefined;
    const prefixMatch = content.match(/^(വരവ്|വരുമാനം|Income|Credit|ചെലവ്|ചിലവ്|Expense|Debit)\s*[:\-–]\s*(.*)$/i);
    if (prefixMatch) {
      const typeWord = prefixMatch[1].toLowerCase();
      if (typeWord === 'വരവ്' || typeWord === 'വരുമാനം' || typeWord === 'income' || typeWord === 'credit') {
        forcedType = 'Income';
      } else {
        forcedType = 'Expense';
      }
      content = prefixMatch[2].trim();
    }

    // Extract amount: look for patterns like "15000", "₹15,000", "15k", "1.2k", "Rs 800", "15000 രൂപ"
    // Also look for " - 15000", " 15000", "15k petrol"
    let amount: number | null = null;
    let description = content;

    // Pattern A: trailing amount e.g. "Client payment - 15000", "കട വാടക 12000 രൂപ", "Tea ₹120", "Instagram ads: 2.5k"
    const trailingAmountMatch = content.match(/^(.*?)(?:[:\-–\s]+)?\s*([₹\s]*(?:Rs\.?|INR|രൂപ|രൂ\.?)?\s*\d+(?:[.,]\d+)?\s*(?:[kK]|രൂപ|രൂ\.?)?)\s*$/i);
    // Pattern B: leading amount e.g. "15k client payment", "1.2k petrol", "₹500 lunch", "15000 രൂപ കട വാടക"
    const leadingAmountMatch = content.match(/^([₹\s]*(?:Rs\.?|INR|രൂപ|രൂ\.?)?\s*\d+(?:[.,]\d+)?\s*(?:[kK]|രൂപ|രൂ\.?)?)\s*(?:[:\-–\s]+)?\s*(.*?)$/i);

    if (trailingAmountMatch && trailingAmountMatch[1].trim().length > 0 && isAmountToken(trailingAmountMatch[2])) {
      amount = parseRupeeAmount(trailingAmountMatch[2]);
      description = trailingAmountMatch[1].trim().replace(/[:\-–]$/, '').trim();
    } else if (leadingAmountMatch && leadingAmountMatch[2].trim().length > 0 && isAmountToken(leadingAmountMatch[1])) {
      amount = parseRupeeAmount(leadingAmountMatch[1]);
      description = leadingAmountMatch[2].trim();
    } else {
      // General regex search for rupee or k pattern
      const generalAmountMatch = content.match(/([₹\s]*(?:Rs\.?|INR|രൂപ|രൂ\.?)\s*\d+(?:[.,]\d+)?|\b\d+(?:[.,]\d+)?\s*(?:[kK]|രൂപ|രൂ\.?)\b)/i);
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
        type: forcedType || 'Expense',
        category: 'Miscellaneous',
        amount: 0,
        status: 'needs_review',
        reviewReason: 'Missing or unreadable amount',
        isAmbiguous: true,
      });
      continue;
    }

    // Determine type and category
    const { type, category } = categorizeTransaction(description, forcedType);

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
  return /^[₹\s]*(?:Rs\.?|INR|രൂപ|രൂ\.?|roopa)?\s*\d+(?:[.,]\d+)?\s*(?:[kK]|രൂപ|രൂ\.?)?$/i.test(token.trim());
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/^[-–:\s]+|[-–:\s]+$/g, '')
    .trim()
    .replace(/^([a-z])/, (_m, p1) => p1.toUpperCase());
}

const MALAYALAM_MONTHS: Record<string, string> = {
  'ജനുവരി': '01',
  'ഫെബ്രുവരി': '02',
  'മാർച്ച്': '03',
  'ഏപ്രിൽ': '04',
  'മെയ്': '05',
  'ജൂൺ': '06',
  'ജൂലൈ': '07',
  'ഓഗസ്റ്റ്': '08',
  'സെപ്റ്റംബർ': '09',
  'ഒക്ടോബർ': '10',
  'നവംബർ': '11',
  'ഡിസംബർ': '12',
};

function standardizeDate(raw: any): string {
  try {
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);

    if (typeof raw === 'number' || (/^\d{5}$/.test(String(raw).trim()))) {
      const serial = Number(raw);
      if (serial > 20000 && serial < 65000) {
        // Excel epoch date conversion
        const excelEpoch = new Date(1899, 11, 30);
        const dateObj = new Date(excelEpoch.getTime() + serial * 86400000);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString().slice(0, 10);
        }
      }
    }

    const trimmed = String(raw).trim();

    // Malayalam relative dates
    if (trimmed.includes('ഇന്ന്') || trimmed.toLowerCase() === 'today') {
      return todayISO;
    }
    if (trimmed.includes('ഇന്നലെ') || trimmed.toLowerCase() === 'yesterday') {
      const yesterday = new Date(today.getTime() - 86400000);
      return yesterday.toISOString().slice(0, 10);
    }

    // Check Malayalam month names e.g. "01 ഒക്ടോബർ 2026", "ഒക്ടോബർ 1"
    for (const [mlMonthName, monthNum] of Object.entries(MALAYALAM_MONTHS)) {
      if (trimmed.includes(mlMonthName)) {
        const dayMatch = trimmed.match(/(\d{1,2})/);
        const yearMatch = trimmed.match(/(\d{4})/);
        const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
        const year = yearMatch ? yearMatch[1] : String(today.getFullYear());
        return `${year}-${monthNum}-${day}`;
      }
    }

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

    const dateKey = keys.find(k => /date|day|dated|when|transaction_date|തീയതി|തിയതി/i.test(k));
    const descKey = keys.find(k => /desc|description|particulars|narration|item|details|remarks|വിവരണം|ഇനം|വിവരം/i.test(k));
    const amountKey = keys.find(k => /amount|total|value|rs|inr|net|txn_amt|തുക|രൂപ/i.test(k));
    const creditKey = keys.find(k => /credit|income|deposit|inflow|received|വരവ്|വരുമാനം/i.test(k));
    const debitKey = keys.find(k => /debit|expense|spent|outflow|payment|ചെലവ്|ചിലവ്/i.test(k));
    const typeKey = keys.find(k => /type|trans_type|nature|തരം/i.test(k));
    const catKey = keys.find(k => /category|head|group|വിഭാഗം/i.test(k));

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
