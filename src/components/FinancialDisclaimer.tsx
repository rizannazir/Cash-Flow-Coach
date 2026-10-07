import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const FinancialDisclaimer: React.FC = () => {
  return (
    <footer className="mt-12 pt-8 pb-12 border-t border-slate-200 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-700">
              Cash-Flow Coach Financial & Planning Disclaimer
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cash-Flow Coach is a managerial financial organisation, bookkeeping categorization, and cash-flow forecasting tool.
              It is not a financial adviser, investment adviser, tax adviser, Chartered Accountant, or legal counsel.
              Estimates, money leak suggestions, and next-month budgets are computed from your historical transaction notes for operational decision support.
              For formal statutory compliance, GST filing, Income Tax Returns (ITR), or legal counsel, please consult a certified Chartered Accountant (CA) or qualified tax professional.
            </p>
          </div>
        </div>
        <div className="mt-4 text-center text-[11px] text-slate-400">
          Cash-Flow Coach &bull; "Turn messy money entries into clear business decisions." &bull; Built for Indian MSMEs & solo entrepreneurs.
        </div>
      </div>
    </footer>
  );
};
