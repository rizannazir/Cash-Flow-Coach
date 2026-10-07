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
  }
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

  // 1. Cash Health evaluation
  let cashHealth: CashHealthStatus = 'manageable';
  let cashHealthHeadline = 'Cash Flow Looks Manageable';
  let cashHealthReason =
    'Based on the transactions provided, your monthly operating cash inflow is covering your expenses comfortably.';

  if (openingBalance !== null && closingBalance !== null) {
    if (closingBalance < 0) {
      cashHealth = 'shortfall_risk';
      cashHealthHeadline = 'Possible Cash Shortfall';
      cashHealthReason =
        'Based on the transactions provided, your net outflows have drawn closing cash below zero. Urgent collection of pending receivables or curbing non-critical spending is advised.';
    } else if (closingBalance < totalExpenses * 0.35 || netCashMovement < 0) {
      cashHealth = 'needs_attention';
      cashHealthHeadline = 'Cash Cushion Needs Attention';
      cashHealthReason =
        'Your cash position remains positive, but your closing balance is thin relative to monthly recurring expenses. A delayed client payment could create operational friction.';
    }
  } else {
    // Opening balance not provided
    if (netCashMovement < 0) {
      if (Math.abs(netCashMovement) > totalIncome * 0.4) {
        cashHealth = 'shortfall_risk';
        cashHealthHeadline = 'Deficit Inflow Alert';
        cashHealthReason =
          'Your recorded expenses exceeded your income significantly this month. Verify if unbilled sales or pending receipts are missing.';
      } else {
        cashHealth = 'needs_attention';
        cashHealthHeadline = 'Net Negative Cash Flow';
        cashHealthReason =
          'Expenses exceeded income by ₹' +
          Math.abs(netCashMovement).toLocaleString('en-IN') +
          '. Review discretionary costs and accelerate pending client payments.';
      }
    } else if (netCashMovement < totalIncome * 0.15) {
      cashHealth = 'needs_attention';
      cashHealthHeadline = 'Tight Operating Margin';
      cashHealthReason =
        'Your cash position is positive, but your net savings margin is slim. Recurring expenses could put pressure on next month if income is delayed.';
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
  // Look for: Frequent small spending (tea, snacks, food), high transport/fuel, personal withdrawals eating buffer, avoidable subscriptions, or oversized marketing.
  const topLeaks: MoneyLeak[] = identifyTopMoneyLeaks(
    transactions,
    expenseBreakdown,
    totalExpenses,
    aiInsights?.topLeaks
  );

  // 3. Next Month Budget table
  const budget = generateNextMonthBudget(expenseBreakdown, topLeaks);
  const totalLastMonthBudget = budget.reduce((acc, b) => acc + b.lastMonth, 0);
  const totalNextMonthBudget = budget.reduce((acc, b) => acc + b.nextMonthBudget, 0);

  // 4. Next Month Focus recommendation
  const recommendedBuffer = Math.max(5000, Math.round(totalNextMonthBudget * 0.25 / 1000) * 1000);
  const nextMonthFocus =
    aiInsights?.nextMonthFocus ||
    `Keep total expenses below ₹${totalNextMonthBudget.toLocaleString(
      'en-IN'
    )} and protect at least ₹${recommendedBuffer.toLocaleString(
      'en-IN'
    )} of cash reserve for peace of mind.`;

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
  aiLeaks?: MoneyLeak[]
): MoneyLeak[] {
  if (aiLeaks && aiLeaks.length >= 2) {
    // If AI provided qualitative leaks, adopt and verify percentages
    return aiLeaks.slice(0, 3).map((leak) => ({
      ...leak,
      percentage: totalExpenses > 0 ? Math.round((leak.amount / totalExpenses) * 100) : 0,
    }));
  }

  const leaks: MoneyLeak[] = [];

  // Check 1: Food / Refreshments / Chai
  const foodCat = expenseBreakdown.find((c) => c.category === 'Food / Refreshments');
  if (foodCat && foodCat.amount > 0) {
    leaks.push({
      category: 'Food / Refreshments',
      amount: foodCat.amount,
      percentage: totalExpenses > 0 ? Math.round((foodCat.amount / totalExpenses) * 100) : 0,
      transactionCount: foodCat.count,
      reason: `Frequent small spends (${foodCat.count} times) for chai, lunches, and snacks silently siphon operating cash without leaving tangible business assets.`,
      fix: 'Set a weekly team snack cap (e.g. ₹500/week) and pay via a dedicated weekly petty cash envelope instead of daily UPI.',
    });
  }

  // Check 2: Transport / Fuel / Couriers
  const transportCat = expenseBreakdown.find((c) => c.category === 'Transport / Fuel');
  if (transportCat && transportCat.amount > 0) {
    leaks.push({
      category: 'Transport / Fuel',
      amount: transportCat.amount,
      percentage: totalExpenses > 0 ? Math.round((transportCat.amount / totalExpenses) * 100) : 0,
      transactionCount: transportCat.count,
      reason: `Multiple unplanned auto/fuel trips (${transportCat.count} entries) are draining monthly cash flow.`,
      fix: 'Batch raw material purchasing and customer deliveries into fixed Tuesdays and Fridays instead of daily on-demand runs.',
    });
  }

  // Check 3: Personal Withdrawals
  const personalCat = expenseBreakdown.find((c) => c.category === 'Personal Withdrawals');
  if (personalCat && personalCat.amount > 0) {
    leaks.push({
      category: 'Personal Withdrawals',
      amount: personalCat.amount,
      percentage: totalExpenses > 0 ? Math.round((personalCat.amount / totalExpenses) * 100) : 0,
      transactionCount: personalCat.count,
      reason: `Mixing personal household expenses directly with the business current account depletes working capital unexpectedly.`,
      fix: 'Transfer one fixed predictable owner withdrawal at the start of the month and strictly stop ad-hoc transfers during the week.',
    });
  }

  // Check 4: Subscriptions / Software
  const softwareCat = expenseBreakdown.find((c) => c.category === 'Software / Subscriptions');
  if (softwareCat && softwareCat.amount > 0 && leaks.length < 3) {
    leaks.push({
      category: 'Software / Subscriptions',
      amount: softwareCat.amount,
      percentage: totalExpenses > 0 ? Math.round((softwareCat.amount / totalExpenses) * 100) : 0,
      transactionCount: softwareCat.count,
      reason: 'Recurring digital tools and apps continue charging automatically even when underutilized.',
      fix: 'Audit active tool licenses, pause unused seats, or switch from monthly to annual discounts where necessary.',
    });
  }

  // Check 5: Marketing / Advertising
  const marketingCat = expenseBreakdown.find((c) => c.category === 'Marketing / Advertising');
  if (marketingCat && marketingCat.amount > 0 && leaks.length < 3) {
    leaks.push({
      category: 'Marketing / Advertising',
      amount: marketingCat.amount,
      percentage: totalExpenses > 0 ? Math.round((marketingCat.amount / totalExpenses) * 100) : 0,
      transactionCount: marketingCat.count,
      reason: 'Ad spends without clear customer conversion tracking act as a steady cash drain.',
      fix: 'Pause non-performing creative campaigns and focus on high-intent local customer word-of-mouth or repeat buyers.',
    });
  }

  // Fallback to largest non-essential expenses if fewer than 3 leaks found
  for (const item of expenseBreakdown) {
    if (leaks.length >= 3) break;
    // skip rent and salaries if we have alternatives, or include with practical advice
    if (!leaks.some((l) => l.category === item.category)) {
      let reason = `${item.category} represents ${item.percentage}% of all cash spent this cycle.`;
      let fix = 'Compare supplier quotes and negotiate payment milestones on 30-day terms.';
      if (item.category === 'Rent') {
        reason = 'Fixed premises rent consumes a significant portion of incoming revenue.';
        fix = 'Ensure sub-leasing excess storage or renegotiate lock-in terms upon renewal.';
      } else if (item.category === 'Salaries / Labour') {
        reason = 'Staff wages are a major committed outflow.';
        fix = 'Align staffing schedules strictly to peak business sales hours to maximize productivity.';
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
