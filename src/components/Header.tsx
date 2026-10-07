import React from 'react';
import { LayoutDashboard, ReceiptText, Sparkles, Target, RotateCcw, ShieldAlert, IndianRupee, Printer, Globe } from 'lucide-react';
import { Language, UI_TEXT } from '../utils/i18n';

export type ActiveTab = 'dashboard' | 'transactions' | 'insights' | 'budget';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewAnalysis: () => void;
  onPrintReport?: () => void;
  hasData: boolean;
  transactionCount: number;
  needsReviewCount: number;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewAnalysis,
  onPrintReport,
  hasData,
  transactionCount,
  needsReviewCount,
  language,
  onToggleLanguage,
}) => {
  const t = UI_TEXT[language];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-500/20">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  {t.appTitle}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  {t.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (when data is loaded) */}
          {hasData && (
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.navDashboard}</span>
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ReceiptText className="w-4 h-4" />
                <span>{t.navTransactions}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    activeTab === 'transactions'
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {transactionCount}
                </span>
                {needsReviewCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('insights')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'insights'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.navInsights}</span>
              </button>

              <button
                onClick={() => setActiveTab('budget')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'budget'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>{t.navBudget}</span>
              </button>
            </nav>
          )}

          {/* Right Action Bar: Language Selector, Print Report & New Analysis */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-50 text-xs font-semibold">
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => onToggleLanguage('ml')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  language === 'ml'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="മലയാളത്തിലേക്ക് മാറ്റുക"
              >
                മലയാളം
              </button>
            </div>

            {hasData && (
              <>
                {onPrintReport && (
                  <button
                    onClick={onPrintReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 shadow-2xs cursor-pointer"
                    title={t.printReport}
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">{t.printReport}</span>
                  </button>
                )}
                <button
                  onClick={onNewAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300/80 cursor-pointer"
                  title={t.newAnalysis}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.newAnalysis}</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
