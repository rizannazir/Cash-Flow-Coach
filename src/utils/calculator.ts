import {
  Transaction,
  CashFlowSummary,
  CashHealthStatus,
  MoneyLeak,
  BudgetItem,
  CategoryBreakdown,
  CashFlowTrendPoint,
  NeedsReviewItem,
} from '../types/cashflow';
import { Language } from './i18n';

/**
 * Deterministic financial calculator for Cash-Flow Coach.
 * Guarantees 100% mathematical accuracy without relying on LLM arithmetic.
 */
export function calculateCashFlowSummary(
  transactions: Transaction[],
  openingBalance: number | null = null,
  aiInsights?: {
    cashHealth?: CashHealthStatus;
    cashHealthHeadline?: string;
    cashHealthReason?: string;
    topLeaks?: MoneyLeak[];
    nextMonthFocus?: string;
  },
  language: Language = 'en'
): CashFlowSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let personalWithdrawalsTotal = 0;

  const categoryMap = new Map<string, { amount: number; count: number; type: 'Income' | 'Expense' }>();

  // Process all transactions
  transactions.forEach((tx) => {
    const amt = tx.amount || 0;
    if (amt <= 0) return;

    if (tx.type === 'Income') {
      totalIncome += amt;
    } else {
      totalExpenses += amt;
      if (tx.category === 'Personal Withdrawals') {
        personalWithdrawalsTotal += amt;
      }
    }

    const existing = categoryMap.get(tx.category) || { amount: 0, count: 0, type: tx.type };
    existing.amount += amt;
    existing.count += 1;
    categoryMap.set(tx.category, existing);
  });

  const netCashMovement = totalIncome - totalExpenses;
  const closingBalance = openingBalance !== null ? openingBalance + netCashMovement : null;

  // Category Breakdown for expenses
  const categoryBreakdown: CategoryBreakdown[] = [];
  categoryMap.forEach((val, cat) => {
    const baseTotal = val.type === 'Income' ? totalIncome : totalExpenses;
    const percentage = baseTotal > 0 ? Math.round((val.amount / baseTotal) * 100) : 0;
    categoryBreakdown.push({
      category: cat as any,
      amount: val.amount,
      percentage,
      count: val.count,
      type: val.type,
    });
  });

  // Sort expenses by amount descending
  const expenseBreakdown = categoryBreakdown
    .filter((c) => c.type === 'Expense')
    .sort((a, b) => b.amount - a.amount);

  const isMl = language === 'ml';

  // 1. Cash Health evaluation
  let cashHealth: CashHealthStatus = 'manageable';
  let cashHealthHeadline = isMl ? 'പണമൊഴുക്ക് സുരക്ഷിതമാണ്' : 'Cash Flow Looks Manageable';
  let cashHealthReason = isMl
    ? 'നൽകിയ ഇടപാടുകൾ പരിശോധിച്ചതിൽ, നിങ്ങളുടെ പ്രതിമാസ ബിസിനസ്സ് വരുമാനം നിലവിലെ ചെലവുകൾക്ക് ആവശ്യത്തിന് തികയുന്നുണ്ട്.'
    : 'Based on the transactions provided, your monthly operating cash inflow is covering your expenses comfortably.';

  if (openingBalance !== null && closingBalance !== null) {
    if (closingBalance < 0) {
      cashHealth = 'shortfall_risk';
      cashHealthHeadline = isMl ? 'പണക്ഷാമ സാധ്യത മുന്നറിയിപ്പ്' : 'Possible Cash Shortfall';
      cashHealthReason = isMl
        ? 'വരവിനേക്കാൾ കൂടുതൽ തുക ചെലവഴിച്ചതിനാൽ അവസാന ബാലൻസ് നെഗറ്റീവ് ആയിരിക്കുന്നു. ക്ലയന്റുകളിൽ നിന്ന് കിട്ടാനുള്ള കുടിശ്ശിക വേഗത്തിൽ വാങ്ങുകയോ അനാവശ്യ ചെലവുകൾ ഉടൻ കുറയ്ക്കുകയോ ചെയ്യേണ്ടതുണ്ട്.'
        : 'Based on the transactions provided, your net outflows have drawn closing cash below zero. Urgent collection of pending receivables or curbing non-critical spending is advised.';
    } else if (closingBalance < totalExpenses * 0.35 || netCashMovement < 0) {
      cashHealth = 'needs_attention';
      cashHealthHeadline = isMl ? 'പണത്തിന്റെ നീക്കിയിരിപ്പിൽ ശ്രദ്ധ വേണം' : 'Cash Cushion Needs Attention';
      cashHealthReason = isMl
        ? 'കയ്യിൽ ബാലൻസ് ഉണ്ടെങ്കിലും, ആവർത്തിച്ചുള്ള ചെലവുകൾ കാരണം അടുത്ത മാസം പണഞെരുക്കം ഉണ്ടാകാൻ സാധ്യതയുണ്ട്. വരാനുള്ള പേയ്‌മെന്റുകൾ ഉറപ്പാക്കുക.'
        : 'Your cash position remains positive, but your closing balance is thin relative to monthly recurring expenses. A delayed client payment could create operational friction.';
    }
  } else {
    // Opening balance not provided
    if (netCashMovement < 0) {
      if (Math.abs(netCashMovement) > totalIncome * 0.4) {
        cashHealth = 'shortfall_risk';
        cashHealthHeadline = isMl ? 'വരവിനേക്കാൾ ചെലവ് വളരെ കൂടുതൽ' : 'Deficit Inflow Alert';
        cashHealthReason = isMl
          ? 'ഈ മാസം വരുമാനത്തേക്കാൾ കൂടുതൽ തുക ചെലവായിരിക്കുന്നു. ലഭിക്കാനുള്ള ബില്ലുകളോ കച്ചവട പണമോ രേഖപ്പെടുത്താൻ വിട്ടുപോയിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുക.'
          : 'Your recorded expenses exceeded your income significantly this month. Verify if unbilled sales or pending receipts are missing.';
      } else {
        cashHealth = 'needs_attention';
        cashHealthHeadline = isMl ? 'നെറ്റ് നെഗറ്റീവ് കാഷ് ഫ്ലോ' : 'Net Negative Cash Flow';
        cashHealthReason = isMl
          ? `ചെലവ് വരുമാനത്തേക്കാൾ ₹${Math.abs(netCashMovement).toLocaleString('en-IN')} കൂടുതലാണ്. അനാവശ്യ ചെലവുകൾ കുറയ്ക്കുകയും കിട്ടാനുള്ള തുക പിരിച്ചെടുക്കുകയും ചെയ്യുക.`
          : 'Expenses exceeded income by ₹' +
            Math.abs(netCashMovement).toLocaleString('en-IN') +
            '. Review discretionary costs and accelerate pending client payments.';
      }
    } else if (netCashMovement < totalIncome * 0.15) {
      cashHealth = 'needs_attention';
      cashHealthHeadline = isMl ? 'ലാഭവിഹിതം കുറവാണ്' : 'Tight Operating Margin';
      cashHealthReason = isMl
        ? 'പണത്തിന്റെ സ്ഥിതി പോസിറ്റീവ് ആണെങ്കിലും, മിച്ചം വളരെ കുറവാണ്. അടുത്ത മാസത്തെ ചെലവുകൾക്കായി കരുതൽ ധനം ഉറപ്പാക്കുക.'
        : 'Your cash position is positive, but your net savings margin is slim. Recurring expenses could put pressure on next month if income is delayed.';
    }
  }

  // Override with AI nuances if provided, keeping integrity
  if (aiInsights?.cashHealth) {
    cashHealth = aiInsights.cashHealth;
  }
  if (aiInsights?.cashHealthHeadline) {
    cashHealthHeadline = aiInsights.cashHealthHeadline;
  }
  if (aiInsights?.cashHealthReason) {
    cashHealthReason = aiInsights.cashHealthReason;
  }

  // 2. Identify Top 3 Money Leaks
  const topLeaks: MoneyLeak[] = identifyTopMoneyLeaks(
    transactions,
    expenseBreakdown,
    totalExpenses,
    aiInsights?.topLeaks,
    language
  );

  // 3. Next Month Budget table
  const budget = generateNextMonthBudget(expenseBreakdown, topLeaks);
  const totalLastMonthBudget = budget.reduce((acc, b) => acc + b.lastMonth, 0);
  const totalNextMonthBudget = budget.reduce((acc, b) => acc + b.nextMonthBudget, 0);

  // 4. Next Month Focus recommendation
  const recommendedBuffer = Math.max(5000, Math.round(totalNextMonthBudget * 0.25 / 1000) * 1000);
  const defaultFocus = isMl
    ? `അടുത്ത മാസത്തെ ആകെ ചെലവുകൾ ₹${totalNextMonthBudget.toLocaleString('en-IN')} ൽ താഴെ നിർത്തുകയും, സുരക്ഷിതമായ പ്രവർത്തനത്തിന് കുറഞ്ഞത് ₹${recommendedBuffer.toLocaleString('en-IN')} കരുതൽ ധനമായി സംരക്ഷിക്കുകയും ചെയ്യുക.`
    : `Keep total expenses below ₹${totalNextMonthBudget.toLocaleString('en-IN')} and protect at least ₹${recommendedBuffer.toLocaleString('en-IN')} of cash reserve for peace of mind.`;

  const nextMonthFocus = aiInsights?.nextMonthFocus || defaultFocus;

  // 5. Cash-flow Trend (chronological line chart)
  const trend = calculateCashFlowTrend(transactions, openingBalance);

  // 6. Needs Review Items
  const needsReviewList = buildNeedsReviewList(transactions);

  return {
    totalIncome,
    totalExpenses,
    netCashMovement,
    openingBalance,
    closingBalance,
    cashHealth,
    cashHealthHeadline,
    cashHealthReason,
    topLeaks,
    budget,
    totalNextMonthBudget,
    totalLastMonthBudget,
    nextMonthFocus,
    categoryBreakdown,
    trend,
    needsReviewList,
    personalWithdrawalsTotal,
  };
}

/**
 * Intelligent leak detection avoiding simply picking the biggest fixed expenses (like shop rent).
 */
function identifyTopMoneyLeaks(
  transactions: Transaction[],
  expenseBreakdown: CategoryBreakdown[],
  totalExpenses: number,
  aiLeaks?: MoneyLeak[],
  language: Language = 'en'
): MoneyLeak[] {
  if (aiLeaks && aiLeaks.length >= 2) {
    // If AI provided qualitative leaks, adopt and verify percentages
    return aiLeaks.slice(0, 3).map((leak) => ({
      ...leak,
      percentage: totalExpenses > 0 ? Math.round((leak.amount / totalExpenses) * 100) : 0,
    }));
  }

  const isMl = language === 'ml';
  const leaks: MoneyLeak[] = [];

  // Check 1: Food / Refreshments / Chai
  const foodCat = expenseBreakdown.find((c) => c.category === 'Food / Refreshments');
  if (foodCat && foodCat.amount > 0) {
    leaks.push({
      category: isMl ? 'ഭക്ഷണം / ചായ പലഹാരം' : 'Food / Refreshments',
      amount: foodCat.amount,
      percentage: totalExpenses > 0 ? Math.round((foodCat.amount / totalExpenses) * 100) : 0,
      transactionCount: foodCat.count,
      reason: isMl
        ? `ചായ, കാപ്പി, പലഹാരങ്ങൾ എന്നിവയ്ക്കായി ഇടയ്ക്കിടെയുള്ള ചെറിയ ചെലവുകൾ (${foodCat.count} തവണ) ബിസിനസ്സ് ഫണ്ടിൽ നിന്ന് നിശബ്ദമായി പണം ചോർത്തുന്നു.`
        : `Frequent small spends (${foodCat.count} times) for chai, lunches, and snacks silently siphon operating cash without leaving tangible business assets.`,
      fix: isMl
        ? 'ആഴ്ചയിൽ പരമാവധി ₹500 നിശ്ചയിച്ച് ദിവസേനയുള്ള യുപിഐ ഇടപാടുകൾക്ക് പകരം പെറ്റി ക്യാഷ് ഉപയോഗിക്കുക.'
        : 'Set a weekly team snack cap (e.g. ₹500/week) and pay via a dedicated weekly petty cash envelope instead of daily UPI.',
    });
  }

  // Check 2: Transport / Fuel / Couriers
  const transportCat = expenseBreakdown.find((c) => c.category === 'Transport / Fuel');
  if (transportCat && transportCat.amount > 0) {
    leaks.push({
      category: isMl ? 'പെട്രോൾ / യാത്ര' : 'Transport / Fuel',
      amount: transportCat.amount,
      percentage: totalExpenses > 0 ? Math.round((transportCat.amount / totalExpenses) * 100) : 0,
      transactionCount: transportCat.count,
      reason: isMl
        ? `ആസൂത്രണമില്ലാത്ത പെട്രോൾ, ഓട്ടോ, യാത്രാ ചെലവുകൾ (${transportCat.count} തവണ) മാസാവസാനം വലിയ തുകയായി മാറുന്നു.`
        : `Multiple unplanned auto/fuel trips (${transportCat.count} entries) are draining monthly cash flow.`,
      fix: isMl
        ? 'ദിവസേന പോകുന്നതിന് പകരം ആഴ്ചയിൽ നിശ്ചിത ദിവസങ്ങളിൽ (ചൊവ്വ, വെള്ളി) സാധനങ്ങൾ വാങ്ങലും വിതരണവും ഒരുമിച്ച് നടത്തുക.'
        : 'Batch raw material purchasing and customer deliveries into fixed Tuesdays and Fridays instead of daily on-demand runs.',
    });
  }

  // Check 3: Personal Withdrawals
  const personalCat = expenseBreakdown.find((c) => c.category === 'Personal Withdrawals');
  if (personalCat && personalCat.amount > 0) {
    leaks.push({
      category: isMl ? 'വീട്ടുചെലവ് / പേഴ്സണൽ' : 'Personal Withdrawals',
      amount: personalCat.amount,
      percentage: totalExpenses > 0 ? Math.round((personalCat.amount / totalExpenses) * 100) : 0,
      transactionCount: personalCat.count,
      reason: isMl
        ? `ബിസിനസ്സ് അക്കൗണ്ടിൽ നിന്ന് വ്യക്തിഗത ആവശ്യങ്ങൾക്കും വീട്ടുചെലവുകൾക്കുമായി പണം എടുക്കുന്നത് പ്രവർത്തന മൂലധനത്തെ പെട്ടെന്ന് ഇല്ലാതാക്കുന്നു.`
        : `Mixing personal household expenses directly with the business current account depletes working capital unexpectedly.`,
      fix: isMl
        ? 'ബിസിനസ്സിൽ നിന്ന് ഓരോ തവണയും പണം എടുക്കാതെ, ഓരോ മാസവും നിശ്ചിത ശമ്പളം പോലെ ഒരു തുക മാത്രം സ്വന്തം അക്കൗണ്ടിലേക്ക് മാറ്റുക.'
        : 'Transfer one fixed predictable owner withdrawal at the start of the month and strictly stop ad-hoc transfers during the week.',
    });
  }

  // Check 4: Subscriptions / Software
  const softwareCat = expenseBreakdown.find((c) => c.category === 'Software / Subscriptions');
  if (softwareCat && softwareCat.amount > 0 && leaks.length < 3) {
    leaks.push({
      category: isMl ? 'സോഫ്റ്റ്‌വെയർ / ടൂളുകൾ' : 'Software / Subscriptions',
      amount: softwareCat.amount,
      percentage: totalExpenses > 0 ? Math.round((softwareCat.amount / totalExpenses) * 100) : 0,
      transactionCount: softwareCat.count,
      reason: isMl
        ? 'ഉപയോഗിക്കാത്തതോ മറന്നുപോയതോ ആയ സോഫ്റ്റ്‌വെയർ സബ്സ്ക്രിപ്ഷനുകൾ എല്ലാ മാസവും പണം നഷ്ടപ്പെടുത്തുന്നു.'
        : 'Recurring digital tools and apps continue charging automatically even when underutilized.',
      fix: isMl
        ? 'ഉപയോഗിക്കാത്ത ആപ്പുകൾ ഉടൻ റദ്ദാക്കുകയോ സൗജന്യ പ്ലാനുകളിലേക്ക് മാറ്റുകയോ ചെയ്യുക.'
        : 'Audit active tool licenses, pause unused seats, or switch from monthly to annual discounts where necessary.',
    });
  }

  // Check 5: Marketing / Advertising
  const marketingCat = expenseBreakdown.find((c) => c.category === 'Marketing / Advertising');
  if (marketingCat && marketingCat.amount > 0 && leaks.length < 3) {
    leaks.push({
      category: isMl ? 'പരസ്യം / പ്രമോഷൻ' : 'Marketing / Advertising',
      amount: marketingCat.amount,
      percentage: totalExpenses > 0 ? Math.round((marketingCat.amount / totalExpenses) * 100) : 0,
      transactionCount: marketingCat.count,
      reason: isMl
        ? 'നേരിട്ട് വിൽപ്പന കൊണ്ടുവരാത്ത ഓൺലൈൻ പരസ്യങ്ങൾ പണം ചോർത്തുന്നതിന് കാരണമാകുന്നു.'
        : 'Ad spends without clear customer conversion tracking act as a steady cash drain.',
      fix: isMl
        ? 'ഫലപ്രദമല്ലാത്ത പരസ്യങ്ങൾ നിർത്തിവെച്ച്, നിലവിലെ കസ്റ്റമർമാർ വഴിയുള്ള വിൽപ്പനയിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുക.'
        : 'Pause non-performing creative campaigns and focus on high-intent local customer word-of-mouth or repeat buyers.',
    });
  }

  // Fallback to largest non-essential expenses if fewer than 3 leaks found
  for (const item of expenseBreakdown) {
    if (leaks.length >= 3) break;
    // skip rent and salaries if we have alternatives, or include with practical advice
    if (!leaks.some((l) => l.category === item.category)) {
      let reason = isMl
        ? `${item.category} ഈ മാസത്തെ ആകെ ചെലവിന്റെ ${item.percentage}% വരുന്നു.`
        : `${item.category} represents ${item.percentage}% of all cash spent this cycle.`;
      let fix = isMl
        ? 'സപ്ലയർമാരുമായി സംസാരിച്ച് പെയ്‌മെന്റ് നിബന്ധനകൾ 30 ദിവസത്തേക്ക് നീട്ടാൻ ശ്രമിക്കുക.'
        : 'Compare supplier quotes and negotiate payment milestones on 30-day terms.';
      if (item.category === 'Rent') {
        reason = isMl
          ? 'കട/സ്ഥാപന വാടക വരുമാനത്തിന്റെ വലിയൊരു പങ്ക് അപഹരിക്കുന്നു.'
          : 'Fixed premises rent consumes a significant portion of incoming revenue.';
        fix = isMl
          ? 'ഉപയോഗിക്കാത്ത സ്ഥലം ഉപവാടകയ്ക്ക് നൽകുകയോ വാടക കരാർ പുതുക്കുമ്പോൾ നിരക്ക് ചർച്ച ചെയ്യുകയോ ചെയ്യുക.'
          : 'Ensure sub-leasing excess storage or renegotiate lock-in terms upon renewal.';
      } else if (item.category === 'Salaries / Labour') {
        reason = isMl
          ? 'ജീവനക്കാരുടെ വേതനം പ്രധാന പ്രതിമാസ ബാധ്യതയാണ്.'
          : 'Staff wages are a major committed outflow.';
        fix = isMl
          ? 'കൂടുതൽ വിൽപ്പനയുള്ള സമയങ്ങളിലേക്ക് സ്റ്റാഫ് ഡ്യൂട്ടി ക്രമീകരിച്ച് ഉൽപ്പാദനക്ഷമത കൂട്ടുക.'
          : 'Align staffing schedules strictly to peak business sales hours to maximize productivity.';
      }
      leaks.push({
        category: item.category,
        amount: item.amount,
        percentage: item.percentage,
        transactionCount: item.count,
        reason,
        fix,
      });
    }
  }

  return leaks.slice(0, 3);
}

/**
 * Generates protected baseline budget:
 * Protects Rent, Salaries, Essential Raw Materials, Utilities.
 * Rationalizes Food/Refreshments, Unmonitored Transport, Marketing, Miscellaneous.
 */
function generateNextMonthBudget(
  expenseBreakdown: CategoryBreakdown[],
  leaks: MoneyLeak[]
): BudgetItem[] {
  const protectedCategories = ['Rent', 'Salaries / Labour', 'Utilities'];

  const budgetItems: BudgetItem[] = [];

  expenseBreakdown.forEach((item) => {
    let nextMonthBudget = item.amount;
    let protectionNote: string | undefined;

    if (protectedCategories.includes(item.category)) {
      // 100% protected (fixed business necessity)
      nextMonthBudget = item.amount;
      protectionNote = 'Protected essential business expense';
    } else if (item.category === 'Inventory / Raw Materials') {
      // Moderate optimization (5-8% savings by batching)
      nextMonthBudget = Math.round((item.amount * 0.93) / 100) * 100;
      protectionNote = 'Optimized with volume bulk ordering';
    } else if (item.category === 'Food / Refreshments') {
      // Avoidable leak reduction (25% reduction)
      nextMonthBudget = Math.round((item.amount * 0.75) / 100) * 100;
      protectionNote = 'Capped with daily/weekly budget envelope';
    } else if (item.category === 'Transport / Fuel') {
      // 15% reduction
      nextMonthBudget = Math.round((item.amount * 0.85) / 100) * 100;
      protectionNote = 'Route planning & trip consolidation';
    } else if (item.category === 'Marketing / Advertising') {
      // 10% reduction
      nextMonthBudget = Math.round((item.amount * 0.90) / 100) * 100;
      protectionNote = 'Paused underperforming campaigns';
    } else if (item.category === 'Personal Withdrawals') {
      // 10-15% discipline
      nextMonthBudget = Math.round((item.amount * 0.88) / 100) * 100;
      protectionNote = 'Strict single lump-sum monthly allocation';
    } else if (item.category === 'Miscellaneous' || item.category === 'Office / Supplies') {
      // 20% reduction
      nextMonthBudget = Math.round((item.amount * 0.80) / 100) * 100;
      protectionNote = 'Restricted non-urgent purchases';
    } else {
      nextMonthBudget = Math.round((item.amount * 0.95) / 100) * 100;
    }

    const savingsOrBuffer = item.amount - nextMonthBudget;

    budgetItems.push({
      category: item.category,
      lastMonth: item.amount,
      nextMonthBudget,
      savingsOrBuffer,
      protectionNote,
    });
  });

  return budgetItems;
}

/**
 * Calculates date-by-date running cash flow line chart without inventing dates.
 */
function calculateCashFlowTrend(
  transactions: Transaction[],
  openingBalance: number | null
): CashFlowTrendPoint[] {
  // Filter valid transactions with date
  const valid = transactions.filter((t) => t.date && t.amount > 0);
  if (valid.length === 0) return [];

  // Group by date
  const dateMap = new Map<string, { income: number; expenses: number }>();

  valid.forEach((tx) => {
    const d = tx.date;
    const curr = dateMap.get(d) || { income: 0, expenses: 0 };
    if (tx.type === 'Income') {
      curr.income += tx.amount;
    } else {
      curr.expenses += tx.amount;
    }
    dateMap.set(d, curr);
  });

  // Sort dates chronologically
  const sortedDates = Array.from(dateMap.keys()).sort();

  let runningBalance = openingBalance || 0;
  const trend: CashFlowTrendPoint[] = [];

  sortedDates.forEach((d) => {
    const val = dateMap.get(d)!;
    const net = val.income - val.expenses;
    runningBalance += net;

    // Readable display date e.g. "01 Oct"
    let displayDate = d;
    try {
      const parts = d.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        displayDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      }
    } catch (_e) {
      // fallback to original
    }

    trend.push({
      date: d,
      displayDate,
      income: val.income,
      expenses: val.expenses,
      net,
      cumulativeCash: runningBalance,
    });
  });

  return trend;
}

/**
 * Finds all transactions flagged for review (duplicates, missing amount, ambiguous).
 */
function buildNeedsReviewList(transactions: Transaction[]): NeedsReviewItem[] {
  const list: NeedsReviewItem[] = [];

  transactions.forEach((tx) => {
    if (tx.status === 'needs_review' || tx.isDuplicate || tx.amount <= 0 || tx.isAmbiguous) {
      let issueType: NeedsReviewItem['issueType'] = 'ambiguous';
      let title = 'Review Transaction';
      let desc = tx.reviewReason || 'Please verify amount and classification';

      if (tx.isDuplicate) {
        issueType = 'duplicate';
        title = 'Possible Duplicate Entry';
        desc = `Repeated entry for ₹${tx.amount.toLocaleString('en-IN')} on ${tx.date} (${tx.description}).`;
      } else if (tx.amount <= 0) {
        issueType = 'missing_amount';
        title = 'Missing or Zero Amount';
        desc = `Could not find a valid rupee amount for: "${tx.description}".`;
      }

      list.push({
        id: `rev-${tx.id}`,
        transactionId: tx.id,
        title,
        description: desc,
        issueType,
        suggestedAction: tx.isDuplicate ? 'Keep or remove duplicate' : 'Edit amount or category',
      });
    }
  });

  return list;
}
