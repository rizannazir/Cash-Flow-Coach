import React from 'react';
import { Target, ShieldCheck, ArrowDownRight, Sparkles, TrendingDown, Check } from 'lucide-react';
import { BudgetItem } from '../types/cashflow';
import { Language, UI_TEXT, getCategoryLabel } from '../utils/i18n';

interface NextMonthBudgetSectionProps {
  budget: BudgetItem[];
  totalLastMonth: number;
  totalNextMonth: number;
  nextMonthFocus: string;
  language?: Language;
}

export const NextMonthBudgetSection: React.FC<NextMonthBudgetSectionProps> = ({
  budget,
  totalLastMonth,
  totalNextMonth,
  nextMonthFocus,
  language = 'en',
}) => {
  const totalPotentialSavings = totalLastMonth - totalNextMonth;
  const isMl = language === 'ml';
  const t = UI_TEXT[language];

  return (
    <div className="space-y-6">
      {/* 13. Next Month's Focus Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              {t.nextMonthFocusTitle}
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white tracking-tight leading-relaxed max-w-3xl">
            "{nextMonthFocus}"
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-blue-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isMl ? 'അത്യാവശ്യ ബിസിനസ്സ് ചെലവുകൾ സംരക്ഷിച്ചിരിക്കുന്നു' : 'Essential core expenses strictly protected'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-blue-300" />
              <span>₹{totalPotentialSavings.toLocaleString('en-IN')} {isMl ? 'ലക്ഷ്യ സമ്പാദ്യം കണ്ടെത്തി' : 'target savings identified'}</span>
            </div>
          </div>
        </div>
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
      </div>

      {/* 12. Next Month Budget Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {t.nextMonthBudgetTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.nextMonthBudgetSub}
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg self-start sm:self-auto">
            {isMl ? `കണ്ടെത്തിയ സമ്പാദ്യം: ₹${totalPotentialSavings.toLocaleString('en-IN')}` : `Projected Savings: ₹${totalPotentialSavings.toLocaleString('en-IN')}`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200/80">
                <th className="py-3 px-5">{isMl ? 'വിഭാഗം' : 'Category'}</th>
                <th className="py-3 px-5 text-right">{isMl ? 'കഴിഞ്ഞ മാസം' : 'Last Month'}</th>
                <th className="py-3 px-5 text-right">{isMl ? 'അടുത്ത മാസത്തെ ബജറ്റ്' : 'Next Month Budget'}</th>
                <th className="py-3 px-5 text-right">{isMl ? 'മാറ്റം / ലാഭം' : 'Variance / Savings'}</th>
                <th className="py-3 px-5">{isMl ? 'ബജറ്റ് നയം' : 'Budget Strategy'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budget.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    {isMl ? 'ചെലവുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.' : 'No expense categories recorded yet. Add business expenses to generate an optimized budget plan.'}
                  </td>
                </tr>
              ) : (
                budget.map((item) => {
                  const isProtected = item.lastMonth === item.nextMonthBudget;
                  const catLabel = getCategoryLabel(item.category as any, language);
                  return (
                    <tr key={item.category} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-5 font-semibold text-slate-800">
                        {catLabel}
                      </td>
                      <td className="py-3 px-5 text-right text-slate-600 font-mono">
                        ₹{item.lastMonth.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-5 text-right font-bold text-slate-900 font-mono">
                        ₹{item.nextMonthBudget.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-5 text-right font-mono">
                        {item.savingsOrBuffer > 0 ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                            -₹{item.savingsOrBuffer.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">₹0</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-xs">
                        {isProtected ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>{isMl ? 'സംരക്ഷിച്ചത്' : 'Strictly Protected'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                            <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                            <span>{isMl ? 'ചോർച്ച ഒഴിവാക്കൽ' : 'Trimmed Leaks'}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}

              {/* TOTAL ROW */}
              <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-slate-900">
                <td className="py-4 px-5 uppercase tracking-wider text-xs">
                  {isMl ? 'ആകെ തുക' : 'TOTAL'}
                </td>
                <td className="py-4 px-5 text-right font-mono text-slate-700">
                  ₹{totalLastMonth.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-5 text-right font-mono text-blue-700 text-base">
                  ₹{totalNextMonth.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-5 text-right font-mono text-emerald-700">
                  -₹{totalPotentialSavings.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-5 text-xs text-slate-500">
                  {isMl ? 'പരമാവധി ചെലവ് പരിധി' : 'Target spending ceiling'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
