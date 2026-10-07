import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, PiggyBank, UserCheck } from 'lucide-react';
import { CashFlowSummary } from '../types/cashflow';
import { Language, UI_TEXT } from '../utils/i18n';

interface KPICardsProps {
  summary: CashFlowSummary;
  language?: Language;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, language = 'en' }) => {
  const isNetPositive = summary.netCashMovement >= 0;
  const t = UI_TEXT[language];

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.kpiTotalIncome}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{summary.totalIncome.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>{language === 'ml' ? 'ലഭിച്ച ആകെ തുകകൾ' : 'All recorded cash inflows'}</span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.kpiTotalExpenses}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{summary.totalExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-between">
              <span>{language === 'ml' ? 'ബിസിനസ്സ് + വ്യക്തിഗത ചിലവുകൾ' : 'Operating + Personal spends'}</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
        </div>

        {/* Net Cash Movement */}
        <div
          className={`rounded-2xl p-5 border shadow-xs relative overflow-hidden ${
            isNetPositive
              ? 'bg-emerald-50/40 border-emerald-200/80'
              : 'bg-rose-50/40 border-rose-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isNetPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {t.kpiNetCash}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isNetPositive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isNetPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isNetPositive ? '+' : '-'}₹
              {Math.abs(summary.netCashMovement).toLocaleString('en-IN')}
            </div>
            <p
              className={`text-xs font-semibold mt-1 ${
                isNetPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isNetPositive ? t.kpiCashSurplus : t.kpiCashDeficit}
            </p>
          </div>
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 ${
              isNetPositive ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </div>

        {/* Closing Balance or Opening Balance Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {summary.closingBalance !== null ? t.kpiClosingBalance : (language === 'ml' ? 'ക്യാഷ് സ്ഥിതി' : 'Cash Position')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            {summary.closingBalance !== null ? (
              <>
                <div
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    summary.closingBalance >= 0 ? 'text-slate-900' : 'text-rose-700'
                  }`}
                >
                  ₹{summary.closingBalance.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {language === 'ml' ? 'തുടക്ക ബാലൻസ്:' : 'Opening:'} ₹{summary.openingBalance?.toLocaleString('en-IN')}
                </p>
              </>
            ) : (
              <>
                <div className="text-base sm:text-lg font-bold text-slate-600 mt-1">
                  {language === 'ml' ? 'തുടക്ക ബാലൻസ് നൽകിയിട്ടില്ല' : 'Opening balance not provided'}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ml' ? 'നെറ്റ് മിച്ചത്തിൽ നിന്ന് കണക്കാക്കി' : 'Calculated from net cash movement'}
                </p>
              </>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </div>
      </div>

      {/* Secondary Insight Pill: Personal Withdrawals callout */}
      {summary.personalWithdrawalsTotal > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <UserCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>{t.personalWithdrawalNote}</strong> ₹
              {summary.personalWithdrawalsTotal.toLocaleString('en-IN')} {language === 'ml' ? 'സ്വന്തം ആവശ്യങ്ങൾക്കായി ബിസിനസ്സിൽ നിന്ന് പിൻവലിച്ചു.' : 'was taken out for personal/home expenses.'}
            </span>
          </div>
          <span className="text-amber-800 text-[11px] bg-amber-100 px-2 py-0.5 rounded-md font-semibold">
            {t.personalWithdrawalSub}
          </span>
        </div>
      )}
    </div>
  );
};
