import React from 'react';
import { Target, ShieldCheck, ArrowDownRight, Sparkles, TrendingDown, Check } from 'lucide-react';
import { BudgetItem } from '../types/cashflow';

interface NextMonthBudgetSectionProps {
  budget: BudgetItem[];
  totalLastMonth: number;
  totalNextMonth: number;
  nextMonthFocus: string;
}

export const NextMonthBudgetSection: React.FC<NextMonthBudgetSectionProps> = ({
  budget,
  totalLastMonth,
  totalNextMonth,
  nextMonthFocus,
}) => {
  const totalPotentialSavings = totalLastMonth - totalNextMonth;

  return (
    <div className="space-y-6">
      {/* 13. Next Month's Focus Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Next Month's Focus
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white tracking-tight leading-relaxed max-w-3xl">
            "{nextMonthFocus}"
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-blue-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Essential core expenses strictly protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-blue-300" />
              <span>₹{totalPotentialSavings.toLocaleString('en-IN')} target savings identified</span>
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
                Next Month Budget Plan
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Protects non-negotiable business expenses while trimming discretionary leakages
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg self-start sm:self-auto">
            Projected Savings: ₹{totalPotentialSavings.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200/80">
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5 text-right">Last Month</th>
                <th className="py-3 px-5 text-right">Next Month Budget</th>
                <th className="py-3 px-5 text-right">Variance / Savings</th>
                <th className="py-3 px-5">Budget Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budget.map((item) => {
                const isProtected = item.lastMonth === item.nextMonthBudget;
                return (
                  <tr key={item.category} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-800">
                      {item.category}
                    </td>
                    <td className="py-3 px-5 text-right text-slate-600 font-mono">
                      ₹{item.lastMonth.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-5 text-right font-bold text-slate-900 font-mono">
                      ₹{item.nextMonthBudget.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-5 text-right font-mono">
                      {item.savingsOrBuffer > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-md">
                          <ArrowDownRight className="w-3 h-3" />
                          -₹{item.savingsOrBuffer.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-xs">
                      {isProtected ? (
                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          <ShieldCheck className="w-3 h-3 text-slate-500" />
                          <span>Protected Fixed Cost</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 font-medium">
                          {item.protectionNote || 'Discretionary optimization'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* TOTAL ROW */}
              <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-slate-900">
                <td className="py-4 px-5 uppercase tracking-wider text-xs">TOTAL</td>
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
                  Target spending ceiling
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
