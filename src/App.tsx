import React, { useState, useMemo } from 'react';
import { Transaction, CashFlowSummary } from './types/cashflow';
import { parseRawTextEntries, parseSpreadsheetFile } from './utils/parser';
import { calculateCashFlowSummary } from './utils/calculator';
import { DEMO_TRANSACTIONS, DEMO_OPENING_BALANCE } from './utils/demoData';
import { Header, ActiveTab } from './components/Header';
import { InputScreen } from './components/InputScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { KPICards } from './components/KPICards';
import { CashHealthCard } from './components/CashHealthCard';
import { ChartsSection } from './components/ChartsSection';
import { MoneyLeaksSection } from './components/MoneyLeaksSection';
import { NextMonthBudgetSection } from './components/NextMonthBudgetSection';
import { CashShortageAlert } from './components/CashShortageAlert';
import { ExpenseBreakdownSection } from './components/ExpenseBreakdownSection';
import { NeedsReviewSection } from './components/NeedsReviewSection';
import { TransactionTable } from './components/TransactionTable';
import { FinancialDisclaimer } from './components/FinancialDisclaimer';
import { Sparkles, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [aiInsightsCache, setAiInsightsCache] = useState<any>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Synchronously compute the full cash flow summary deterministically whenever transactions change
  const summary: CashFlowSummary = useMemo(() => {
    return calculateCashFlowSummary(transactions, openingBalance, aiInsightsCache);
  }, [transactions, openingBalance, aiInsightsCache]);

  const handleStartAnalysis = async (
    rawText: string,
    file: File | null,
    providedOpeningBalance: number | null
  ) => {
    setIsLoading(true);
    setGeneralError(null);
    setOpeningBalance(providedOpeningBalance);

    let parsedTransactions: Transaction[] = [];

    try {
      if (file) {
        const fileResult = await parseSpreadsheetFile(file);
        if (fileResult.error) {
          setGeneralError(fileResult.error);
          setIsLoading(false);
          return;
        }
        parsedTransactions = fileResult.transactions;
      } else {
        const textResult = parseRawTextEntries(rawText);
        parsedTransactions = textResult.transactions;
      }

      if (parsedTransactions.length === 0) {
        setGeneralError(
          "I couldn't find recognizable income or expense entries. Try pasting entries such as: Petrol - ₹500 or Client payment - ₹10,000."
        );
        setIsLoading(false);
        return;
      }

      setTransactions(parsedTransactions);

      // Attempt AI advisory call in background while user experiences loading step
      try {
        const aiResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions: parsedTransactions.slice(0, 50),
            openingBalance: providedOpeningBalance,
          }),
        });

        if (aiResponse.ok) {
          const aiJson = await aiResponse.json();
          if (aiJson.success && aiJson.analysis) {
            setAiInsightsCache({
              cashHealth: aiJson.analysis.cashHealth,
              cashHealthHeadline: aiJson.analysis.cashHealthHeadline,
              cashHealthReason: aiJson.analysis.cashHealthReason,
              topLeaks: aiJson.analysis.topMoneyLeaks,
              nextMonthFocus: aiJson.analysis.nextMonthFocus,
            });
          }
        }
      } catch (aiErr) {
        // Deterministic engine handles everything safely if server fails
        console.warn('AI analysis unavailable, using local rules engine:', aiErr);
      }

      // Smooth transition to show report ready
      setTimeout(() => {
        setIsLoading(false);
        setHasAnalyzed(true);
        setActiveTab('dashboard');
      }, 1600);
    } catch (err: any) {
      setGeneralError(err?.message || 'Failed to process transactions');
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    setIsLoading(true);
    setGeneralError(null);
    setOpeningBalance(DEMO_OPENING_BALANCE);
    setTransactions(DEMO_TRANSACTIONS);

    setTimeout(() => {
      setIsLoading(false);
      setHasAnalyzed(true);
      setActiveTab('dashboard');
    }, 1400);
  };

  const handleNewAnalysis = () => {
    setTransactions([]);
    setOpeningBalance(null);
    setHasAnalyzed(false);
    setAiInsightsCache(null);
    setGeneralError(null);
    setActiveTab('dashboard');
  };

  // Transaction mutations that trigger real-time recalculation
  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const fullTx: Transaction = {
      ...newTx,
      id: `manual-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [fullTx, ...prev]);
  };

  const handleVerifyTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'valid', isDuplicate: false, reviewReason: undefined }
          : t
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewAnalysis={handleNewAnalysis}
        hasData={hasAnalyzed}
        transactionCount={transactions.length}
        needsReviewCount={summary.needsReviewList.length}
      />

      <main className="flex-1">
        {/* Loading State */}
        {isLoading && <LoadingScreen />}

        {/* Input / Landing Screen */}
        {!isLoading && !hasAnalyzed && (
          <div>
            {generalError && (
              <div className="max-w-4xl mx-auto px-4 mt-6">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{generalError}</span>
                </div>
              </div>
            )}
            <InputScreen
              onAnalyze={handleStartAnalysis}
              onLoadDemo={handleLoadDemo}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Main Dashboard & Tabs when Analyzed */}
        {!isLoading && hasAnalyzed && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Title & Subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Monthly Cash-flow Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Consolidated financial analysis across {transactions.length} transactions.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View All Transactions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cash Health Diagnostic Card */}
                <CashHealthCard
                  status={summary.cashHealth}
                  headline={summary.cashHealthHeadline}
                  reason={summary.cashHealthReason}
                />

                {/* Top KPI Cards */}
                <KPICards summary={summary} />

                {/* Needs Review Section (only shown if issues exist) */}
                {summary.needsReviewList.length > 0 && (
                  <NeedsReviewSection
                    items={summary.needsReviewList}
                    transactions={transactions}
                    onRemoveTransaction={handleDeleteTransaction}
                    onVerifyTransaction={handleVerifyTransaction}
                  />
                )}

                {/* Interactive Visual Charts */}
                <ChartsSection summary={summary} />

                {/* Cash Shortage Alert */}
                <CashShortageAlert
                  status={summary.cashHealth}
                  closingBalance={summary.closingBalance}
                  netCashMovement={summary.netCashMovement}
                  totalExpenses={summary.totalExpenses}
                />

                {/* Top 3 Money Leaks Quick Preview */}
                <div className="pt-2">
                  <MoneyLeaksSection
                    leaks={summary.topLeaks}
                    totalExpenses={summary.totalExpenses}
                  />
                </div>

                {/* Next Month Budget Focus Preview */}
                <div className="pt-2">
                  <NextMonthBudgetSection
                    budget={summary.budget}
                    totalLastMonth={summary.totalLastMonthBudget}
                    totalNextMonth={summary.totalNextMonthBudget}
                    nextMonthFocus={summary.nextMonthFocus}
                  />
                </div>

                {/* Full Transaction Table (for complete dataset transparency) */}
                <div className="pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      All Recorded Transactions ({transactions.length})
                    </h2>
                    <span className="text-xs text-slate-400">
                      Editable inline ledger
                    </span>
                  </div>
                  <TransactionTable
                    transactions={transactions}
                    onUpdateTransaction={handleUpdateTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onAddTransaction={handleAddTransaction}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Cleaned Transaction Ledger
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Review and fine-tune your categorized income and expenses. Any edits update all totals instantly.
                  </p>
                </div>

                {/* Needs Review Section */}
                {summary.needsReviewList.length > 0 && (
                  <NeedsReviewSection
                    items={summary.needsReviewList}
                    transactions={transactions}
                    onRemoveTransaction={handleDeleteTransaction}
                    onVerifyTransaction={handleVerifyTransaction}
                  />
                )}

                <TransactionTable
                  transactions={transactions}
                  onUpdateTransaction={handleUpdateTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onAddTransaction={handleAddTransaction}
                />
              </div>
            )}

            {/* TAB 3: INSIGHTS & LEAKS */}
            {activeTab === 'insights' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Money Leaks & Deep Insights
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Intelligent diagnosis of discretionary spending, recurring small leaks, and cash protection recommendations.
                  </p>
                </div>

                {/* Top 3 Money Leaks */}
                <MoneyLeaksSection
                  leaks={summary.topLeaks}
                  totalExpenses={summary.totalExpenses}
                />

                {/* Cash Shortage Warning Box */}
                <CashShortageAlert
                  status={summary.cashHealth}
                  closingBalance={summary.closingBalance}
                  netCashMovement={summary.netCashMovement}
                  totalExpenses={summary.totalExpenses}
                />

                {/* Detailed Expense Category Breakdown */}
                <ExpenseBreakdownSection
                  categories={summary.categoryBreakdown}
                  totalExpenses={summary.totalExpenses}
                />
              </div>
            )}

            {/* TAB 4: BUDGET */}
            {activeTab === 'budget' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Next-Month Budget & Spending Limits
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Realistic targets designed to protect business-critical operations while recovering cash reserves.
                  </p>
                </div>

                <NextMonthBudgetSection
                  budget={summary.budget}
                  totalLastMonth={summary.totalLastMonthBudget}
                  totalNextMonth={summary.totalNextMonthBudget}
                  nextMonthFocus={summary.nextMonthFocus}
                />

                {/* Expense Breakdown Reference */}
                <ExpenseBreakdownSection
                  categories={summary.categoryBreakdown}
                  totalExpenses={summary.totalExpenses}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Financial Disclaimer */}
      <FinancialDisclaimer />
    </div>
  );
}
