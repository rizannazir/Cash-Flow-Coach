import React from 'react';
import { LayoutDashboard, ReceiptText, Sparkles, Target, RotateCcw, ShieldAlert, IndianRupee } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'transactions' | 'insights' | 'budget';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewAnalysis: () => void;
  hasData: boolean;
  transactionCount: number;
  needsReviewCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewAnalysis,
  hasData,
  transactionCount,
  needsReviewCount,
}) => {
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
                  CASH-FLOW COACH
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  MSME & Solo Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Understand your money. Fix your leaks. Plan your next month.
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
                <span>Dashboard</span>
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
                <span>Transactions</span>
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
                <span>Leaks & Insights</span>
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
                <span>Budget</span>
              </button>
            </nav>
          )}

          {/* New Analysis Button */}
          <div className="flex items-center gap-2">
            {hasData && (
              <button
                onClick={onNewAnalysis}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300/80 cursor-pointer"
                title="Start a new analysis"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Analysis</span>
                <span className="sm:hidden">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
