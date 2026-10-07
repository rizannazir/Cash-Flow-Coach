import React, { useState, useMemo } from 'react';
import { Transaction, CashFlowSummary } from './types/cashflow';
import { parseRawTextEntries, parseSpreadsheetFile } from './utils/parser';
import { calculateCashFlowSummary } from './utils/calculator';
import {
  DEMO_TRANSACTIONS,
  DEMO_OPENING_BALANCE,
  DEMO_TRANSACTIONS_MALAYALAM,
  DEMO_OPENING_BALANCE_MALAYALAM,
} from './utils/demoData';
import { Language, UI_TEXT } from './utils/i18n';
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
import { PrintReportModal } from './components/PrintReportModal';
import { Sparkles, ArrowRight, RefreshCw, AlertCircle, Printer } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('ml');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [aiInsightsCache, setAiInsightsCache] = useState<any>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const t = UI_TEXT[language];

  // Synchronously compute the full cash flow summary deterministically whenever transactions change
  const summary: CashFlowSummary = useMemo(() => {
    return calculateCashFlowSummary(transactions, openingBalance, aiInsightsCache, language);
  }, [transactions, openingBalance, aiInsightsCache, language]);

  const handleStartAnalysis = async (
    rawText: string,
    file: File | null,
    providedOpeningBalance: number | null
  ) => {
    setIsLoading(true);
    setGeneralError(null);
    setOpeningBalance(providedOpeningBalance);

    // Auto-detect Malayalam script in raw text and switch language if present
    const hasMalayalamScript = /[\u0D00-\u0D7F]/.test(rawText);
    const effectiveLang = hasMalayalamScript ? 'ml' : language;
    if (hasMalayalamScript && language !== 'ml') {
      setLanguage('ml');
    }

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
          effectiveLang === 'ml'
            ? 'വരവ്-ചെലവ് വിവരങ്ങൾ തിരിച്ചറിയാൻ സാധിച്ചില്ല. ഉദാഹരണത്തിന്: കട വാടക - 12000 അല്ലെങ്കിൽ പെട്രോൾ - 800 എന്ന് നൽകി നോക്കുക.'
            : "I couldn't find recognizable income or expense entries. Try pasting entries such as: Petrol - ₹500 or Client payment - ₹10,000."
        );
        setIsLoading(false);
        return;
      }

      setTransactions(parsedTransactions);

      // Attempt AI advisory call in background with AbortController timeout without blocking UI
      const controller = new AbortController();
      const abortTimeout = setTimeout(() => controller.abort(), 12000);

      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: parsedTransactions.slice(0, 50),
          openingBalance: providedOpeningBalance,
          language: effectiveLang,
        }),
        signal: controller.signal,
      })
        .then(async (res) => {
          clearTimeout(abortTimeout);
          if (res.ok) {
            const aiJson = await res.json();
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
        })
        .catch(() => {
          clearTimeout(abortTimeout);
          // Gracefully fall back to deterministic calculations already computed
        });

      // Smooth transition to show report ready
      setTimeout(() => {
        setIsLoading(false);
        setHasAnalyzed(true);
        setActiveTab('dashboard');
      }, 1200);
    } catch (err: any) {
      setGeneralError(err?.message || 'Failed to process transactions');
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    setLanguage('en');
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

  const handleLoadMalayalamDemo = () => {
    setLanguage('ml');
    setIsLoading(true);
    setGeneralError(null);
    setOpeningBalance(DEMO_OPENING_BALANCE_MALAYALAM);
    setTransactions(DEMO_TRANSACTIONS_MALAYALAM);

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
        onPrintReport={() => setIsPrintModalOpen(true)}
        hasData={hasAnalyzed}
        transactionCount={transactions.length}
        needsReviewCount={summary.needsReviewList.length}
        language={language}
        onToggleLanguage={setLanguage}
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
              onLoadMalayalamDemo={handleLoadMalayalamDemo}
              isLoading={isLoading}
              language={language}
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
                      {t.dashboardTitle}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {language === 'ml'
                        ? `${transactions.length} ഇടപാടുകളുടെ സമഗ്ര സാമ്പത്തിക വിശകലനം.`
                        : `Consolidated financial analysis across ${transactions.length} transactions.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPrintModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.printReport}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.viewAllTxns}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cash Health Diagnostic Card */}
                <CashHealthCard
                  status={summary.cashHealth}
                  headline={summary.cashHealthHeadline}
                  reason={summary.cashHealthReason}
                  language={language}
                />

                {/* Top KPI Cards */}
                <KPICards summary={summary} language={language} />

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
                <ChartsSection summary={summary} language={language} />

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
                    language={language}
                  />
                </div>

                {/* Next Month Budget Focus Preview */}
                <div className="pt-2">
                  <NextMonthBudgetSection
                    budget={summary.budget}
                    totalLastMonth={summary.totalLastMonthBudget}
                    totalNextMonth={summary.totalNextMonthBudget}
                    nextMonthFocus={summary.nextMonthFocus}
                    language={language}
                  />
                </div>

                {/* Full Transaction Table (for complete dataset transparency) */}
                <div className="pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      {language === 'ml' ? `രേഖപ്പെടുത്തിയ എല്ലാ ഇടപാടുകളും (${transactions.length})` : `All Recorded Transactions (${transactions.length})`}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {language === 'ml' ? 'നേരിട്ട് തിരുത്താവുന്ന ലെഡ്ജർ' : 'Editable inline ledger'}
                    </span>
                  </div>
                  <TransactionTable
                    transactions={transactions}
                    onUpdateTransaction={handleUpdateTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onAddTransaction={handleAddTransaction}
                    language={language}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {t.ledgerTitle}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {t.ledgerSub}
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
                  language={language}
                />
              </div>
            )}

            {/* TAB 3: INSIGHTS & LEAKS */}
            {activeTab === 'insights' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {t.moneyLeaksTitle}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {t.moneyLeaksSub}
                  </p>
                </div>

                {/* Top 3 Money Leaks */}
                <MoneyLeaksSection
                  leaks={summary.topLeaks}
                  totalExpenses={summary.totalExpenses}
                  language={language}
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
                  language={language}
                />
              </div>
            )}

            {/* TAB 4: BUDGET */}
            {activeTab === 'budget' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {t.nextMonthBudgetTitle}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {t.nextMonthBudgetSub}
                  </p>
                </div>

                <NextMonthBudgetSection
                  budget={summary.budget}
                  totalLastMonth={summary.totalLastMonthBudget}
                  totalNextMonth={summary.totalNextMonthBudget}
                  nextMonthFocus={summary.nextMonthFocus}
                  language={language}
                />

                {/* Expense Breakdown Reference */}
                <ExpenseBreakdownSection
                  categories={summary.categoryBreakdown}
                  totalExpenses={summary.totalExpenses}
                  language={language}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Financial Disclaimer */}
      <FinancialDisclaimer />

      {/* Print Report Preview Modal */}
      {isPrintModalOpen && (
        <PrintReportModal
          summary={summary}
          transactions={transactions}
          onClose={() => setIsPrintModalOpen(false)}
          language={language}
        />
      )}
    </div>
  );
}
