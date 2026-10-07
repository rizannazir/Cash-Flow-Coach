import React, { useState } from 'react';
import { CashFlowSummary, Transaction } from '../types/cashflow';
import {
  Printer,
  X,
  FileText,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  Target,
  ShieldCheck,
  Flame,
  Info,
} from 'lucide-react';
import { ChartsSection } from './ChartsSection';
import { Language, UI_TEXT, getCategoryLabel } from '../utils/i18n';

interface PrintReportModalProps {
  summary: CashFlowSummary;
  transactions: Transaction[];
  onClose: () => void;
  language?: Language;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  summary,
  transactions,
  onClose,
  language = 'en',
}) => {
  const [includeLedger, setIncludeLedger] = useState(true);
  const isMl = language === 'ml';
  const t = UI_TEXT[language];

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isNetPositive = summary.netCashMovement >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto flex justify-center p-2 sm:p-4 md:p-6">
      {/* Container */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 flex flex-col my-auto max-h-[96vh]">
        {/* Top Control Bar (Hidden when printed) */}
        <div className="no-print p-4 sm:px-6 bg-slate-900 text-white rounded-t-2xl flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Print & PDF Report Preview
              </h3>
              <p className="text-[11px] text-slate-400">
                Optimized layout for paper printing and PDF export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Ledger toggle */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800">
              <input
                type="checkbox"
                checked={includeLedger}
                onChange={(e) => setIncludeLedger(e.target.checked)}
                className="rounded border-slate-600 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Include Transaction Ledger</span>
            </label>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Report Canvas */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-white text-slate-900 printable-document">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-lg">
                  ₹
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                  CASH-FLOW COACH
                </h1>
              </div>
              <p className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
                Monthly Business Cash-Flow & Planning Report
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Turn messy money entries into clear business decisions
              </p>
            </div>

            <div className="sm:text-right text-xs text-slate-600 font-mono space-y-0.5">
              <p>
                <strong className="text-slate-800">Date Generated:</strong> {todayStr}
              </p>
              <p>
                <strong className="text-slate-800">Total Entries:</strong> {transactions.length} records
              </p>
              <p>
                <strong className="text-slate-800">Currency:</strong> Indian Rupee (₹)
              </p>
            </div>
          </div>

          {/* Cash Health Diagnostic Banner */}
          <div
            className={`p-4 rounded-xl border-l-4 text-sm ${
              summary.cashHealth === 'manageable'
                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950'
                : summary.cashHealth === 'needs_attention'
                ? 'border-amber-600 bg-amber-50/70 text-amber-950'
                : 'border-rose-600 bg-rose-50/70 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-sm uppercase tracking-wider">
                Status: {summary.cashHealth.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 bg-white/80 rounded-md border border-slate-300">
                {summary.cashHealthHeadline}
              </span>
            </div>
            <p className="text-xs leading-relaxed mt-1 font-medium">
              {summary.cashHealthReason}
            </p>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Total Income
              </span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono mt-1 block">
                ₹{summary.totalIncome.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">Recorded Inflows</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Total Expenses
              </span>
              <span className="text-xl font-extrabold text-rose-700 font-mono mt-1 block">
                ₹{summary.totalExpenses.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">Recorded Outflows</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Net Cash Shift
              </span>
              <span
                className={`text-xl font-extrabold font-mono mt-1 block ${
                  isNetPositive ? 'text-blue-700' : 'text-rose-700'
                }`}
              >
                {isNetPositive ? '+' : '-'}₹
                {Math.abs(summary.netCashMovement).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">
                {isNetPositive ? 'Cash Surplus' : 'Operating Deficit'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Closing Balance
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
                {summary.closingBalance !== null
                  ? `₹${summary.closingBalance.toLocaleString('en-IN')}`
                  : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500">
                {summary.openingBalance !== null
                  ? `Open: ₹${summary.openingBalance.toLocaleString('en-IN')}`
                  : 'Opening not provided'}
              </span>
            </div>
          </div>

          {/* Interactive Charts Section */}
          <div className="border border-slate-200 rounded-2xl p-5 break-inside-avoid">
            <h2 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
              Visual Cash-Flow Analytics
            </h2>
            <ChartsSection summary={summary} language={language} />
          </div>

          {/* Top 3 Money Leaks */}
          <div className="border border-slate-200 rounded-2xl p-5 break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
              <span className="text-base">🚨</span>
              <h2 className="text-base font-bold text-slate-900">
                Top 3 Money Leaks & Recommended Actions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.topLeaks.map((leak, idx) => (
                <div
                  key={leak.category + idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Leak #{idx + 1}</span>
                      <span className="text-rose-600">{leak.percentage}% of expenses</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">
                      {leak.category}
                    </h3>
                    <div className="text-lg font-black text-rose-600 font-mono mt-0.5">
                      ₹{leak.amount.toLocaleString('en-IN')}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      <strong>Why it matters:</strong> {leak.reason}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-xs text-emerald-900 bg-emerald-50/80 p-2 rounded-lg font-medium">
                    <strong>Fix:</strong> {leak.fix}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Month Budget Plan */}
          <div className="border border-slate-200 rounded-2xl p-5 break-inside-avoid">
            <div className="flex items-center justify-between gap-2 mb-3 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <h2 className="text-base font-bold text-slate-900">
                  Next Month Target & Budget Plan
                </h2>
              </div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Target Savings: ₹{(summary.totalLastMonthBudget - summary.totalNextMonthBudget).toLocaleString('en-IN')}
              </div>
            </div>

            <p className="text-xs text-slate-700 mb-3 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 font-medium">
              <strong>Focus:</strong> "{summary.nextMonthFocus}"
            </p>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-right">Last Month</th>
                  <th className="py-2 px-3 text-right">Next Month Budget</th>
                  <th className="py-2 px-3 text-right">Target Variance</th>
                  <th className="py-2 px-3">Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summary.budget.map((b) => (
                  <tr key={b.category}>
                    <td className="py-2 px-3 font-semibold text-slate-900">{b.category}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">
                      ₹{b.lastMonth.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{b.nextMonthBudget.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {b.savingsOrBuffer > 0 ? (
                        <span className="text-emerald-700 font-bold">
                          -₹{b.savingsOrBuffer.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {b.protectionNote || 'Discretionary optimization'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td className="py-2.5 px-3 uppercase">Total</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    ₹{summary.totalLastMonthBudget.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-700">
                    ₹{summary.totalNextMonthBudget.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                    -₹{(summary.totalLastMonthBudget - summary.totalNextMonthBudget).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">Spending ceiling</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Full Transaction Ledger (Included if checkbox is selected) */}
          {includeLedger && (
            <div className="border border-slate-200 rounded-2xl p-5 break-before-page">
              <h2 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
                Itemized Transaction Ledger ({transactions.length} Entries)
              </h2>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2 px-3 w-24">Date</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 w-20">Type</th>
                    <th className="py-2 px-3 w-36">Category</th>
                    <th className="py-2 px-3 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-mono text-slate-500">{tx.date}</td>
                      <td className="py-1.5 px-3 font-medium text-slate-900">{tx.description}</td>
                      <td className="py-1.5 px-3">
                        <span
                          className={`font-bold ${
                            tx.type === 'Income' ? 'text-emerald-700' : 'text-slate-600'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-slate-700">{tx.category}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">
                        <span
                          className={tx.type === 'Income' ? 'text-emerald-700' : 'text-slate-900'}
                        >
                          {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Statutory Disclaimer Footer */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-700">
              Statutory Financial Disclaimer
            </p>
            <p>
              This document is prepared by Cash-Flow Coach as an operational decision-support tool. It is not formal accounting, investment, tax, or legal advice. For statutory GST filing, Income Tax Returns (ITR), and audit compliance, please consult a certified Chartered Accountant (CA).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
