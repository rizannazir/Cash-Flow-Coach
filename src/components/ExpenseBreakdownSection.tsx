import React from 'react';
import { CategoryBreakdown } from '../types/cashflow';
import { PieChart, ArrowDownRight, Tag } from 'lucide-react';
import { Language, getCategoryLabel } from '../utils/i18n';

interface ExpenseBreakdownSectionProps {
  categories: CategoryBreakdown[];
  totalExpenses: number;
  language?: Language;
}

export const ExpenseBreakdownSection: React.FC<ExpenseBreakdownSectionProps> = ({
  categories,
  totalExpenses,
  language = 'en',
}) => {
  const isMl = language === 'ml';
  const expenseCategories = categories
    .filter((c) => c.type === 'Expense' && c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              {isMl ? 'ചെലവുകളുടെ വിശദാംശങ്ങൾ (വിഭാഗം തിരിച്ച്)' : 'Expense Breakdown by Category'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMl ? 'പ്രതിമാസ ചെലവുകളും അവയുടെ വിഹിതവും' : 'Exact rupee spending and percentage share of monthly outflows'}
          </p>
        </div>
        <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
          {isMl ? 'ആകെ:' : 'Total:'} ₹{totalExpenses.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="space-y-3.5 pt-1">
        {expenseCategories.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            {isMl ? 'ചെലവുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.' : 'No expenses recorded yet.'}
          </div>
        ) : (
          expenseCategories.map((item) => (
            <div key={item.category} className="group">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
                <span>{getCategoryLabel(item.category, language)}</span>
                <span className="text-[11px] font-normal text-slate-400">
                  ({item.count} {isMl ? 'ഇടപാട്' : (item.count === 1 ? 'txn' : 'txns')})
                </span>
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900">
                  ₹{item.amount.toLocaleString('en-IN')}
                </span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 w-12 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(1, Math.min(100, item.percentage))}%` }}
              />
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};
