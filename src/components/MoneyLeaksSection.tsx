import React from 'react';
import { AlertCircle, Lightbulb, TrendingDown, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { MoneyLeak } from '../types/cashflow';
import { Language, UI_TEXT } from '../utils/i18n';

interface MoneyLeaksSectionProps {
  leaks: MoneyLeak[];
  totalExpenses: number;
  language?: Language;
}

export const MoneyLeaksSection: React.FC<MoneyLeaksSectionProps> = ({
  leaks,
  totalExpenses,
  language = 'en',
}) => {
  const isMl = language === 'ml';
  const t = UI_TEXT[language];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {t.moneyLeaksTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.moneyLeaksSub}
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 self-start sm:self-auto">
          {isMl ? `ആകെ ₹${totalExpenses.toLocaleString('en-IN')} ചെലവിന്റെ പരിശോധന` : `Audit of ₹${totalExpenses.toLocaleString('en-IN')} total expenses`}
        </div>
      </div>

      {leaks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-slate-500 text-xs">
          {isMl ? 'പ്രത്യേക പണച്ചോർച്ചകൾ കണ്ടെത്തിയിട്ടില്ല. കൃത്യമായ കണക്കുകൾക്കായി പ്രതിദിന ചെലവുകൾ രേഖപ്പെടുത്തുക.' : 'No significant spending leaks detected yet. Record your daily operating expenses to run a leak audit.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {leaks.map((leak, index) => {
            return (
              <div
                key={leak.category + index}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
              {/* Badge top ribbon */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
                  <Flame className="w-3 h-3 text-rose-600" />
                  <span>{isMl ? `ചോർച്ച #${index + 1}` : `Leak #${index + 1}`}</span>
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {isMl ? `ചെലവിന്റെ ${leak.percentage}%` : `${leak.percentage}% of spending`}
                </span>
              </div>

              <div>
                {/* Category & Amount */}
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {leak.category}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-600 tracking-tight">
                    ₹{leak.amount.toLocaleString('en-IN')}
                  </span>
                  {leak.transactionCount && (
                    <span className="text-xs text-slate-400 font-medium">
                      ({leak.transactionCount} {isMl ? 'ഇടപാടുകൾ' : 'transactions'})
                    </span>
                  )}
                </div>

                {/* Progress share bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, leak.percentage))}%` }}
                  />
                </div>

                {/* Why it matters */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        {isMl ? 'എന്തുകൊണ്ട് ശ്രദ്ധിക്കണം' : 'Why it matters'}
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {leak.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Practical Fix */}
              <div className="mt-4 pt-3 border-t border-slate-100 bg-emerald-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl border-emerald-100">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      {isMl ? 'പ്രായോഗിക പരിഹാരം' : 'Practical Fix'}
                    </span>
                    <p className="text-xs text-emerald-900 font-medium mt-0.5 leading-relaxed">
                      {leak.fix}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
