import React from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';
import { CashHealthStatus } from '../types/cashflow';

interface CashShortageAlertProps {
  status: CashHealthStatus;
  closingBalance: number | null;
  netCashMovement: number;
  totalExpenses: number;
}

export const CashShortageAlert: React.FC<CashShortageAlertProps> = ({
  status,
  closingBalance,
  netCashMovement,
  totalExpenses,
}) => {
  const renderAlertContent = () => {
    switch (status) {
      case 'manageable':
        return {
          color: 'emerald',
          border: 'border-emerald-200 bg-emerald-50/60 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          title: 'Cash Flow Looks Manageable',
          icon: CheckCircle,
          body: (
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
              Based on the transactions provided, your monthly operating cash inflow is covering your expenses comfortably.
              This assumes client income remains around the recent level and no unexpected large capital expenditure occurs.
              Maintaining at least 30 days of recurring operating expenses (approx. ₹
              {Math.max(5000, Math.round((totalExpenses * 0.3) / 1000) * 1000).toLocaleString('en-IN')} buffer) is recommended to absorb client invoice payment delays.
            </p>
          ),
        };

      case 'needs_attention':
        return {
          color: 'amber',
          border: 'border-amber-200 bg-amber-50/70 text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          title: 'Cash Needs Attention',
          icon: AlertTriangle,
          body: (
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              Based on the transactions provided, your cash reserves could become tight next month if customer receipts are delayed by even 1–2 weeks.
              Recurring obligations like rent, salaries, and inventory will require prompt liquidity.
              We recommend prioritizing immediate follow-ups on outstanding client payments and temporarily restricting discretionary withdrawals.
            </p>
          ),
        };

      case 'shortfall_risk':
        return {
          color: 'rose',
          border: 'border-rose-200 bg-rose-50/70 text-rose-950',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          title: 'Possible Cash Shortfall Alert',
          icon: AlertOctagon,
          body: (
            <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
              Based on the transactions provided, recorded cash outflows currently exceed inflows, indicating a potential cash shortfall risk.
              If this spending pattern persists without incoming receipts, operational obligations may be strained.
              Consider deferring non-urgent purchases, renegotiating vendor payment cycles to 30 days, and following up on all pending receivables today.
            </p>
          ),
        };
    }
  };

  const alert = renderAlertContent();
  const Icon = alert.icon;

  return (
    <div className={`rounded-2xl p-5 border ${alert.border} shadow-2xs`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white shadow-2xs shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <h4 className="font-extrabold text-sm sm:text-base tracking-tight">
              {alert.title}
            </h4>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${alert.badge}`}
            >
              Early Warning Indicator
            </span>
          </div>
          {alert.body}
          <p className="text-[11px] text-slate-500 mt-2 italic">
            * Note: This indicator is based on historical transactions supplied. Future cash flow is subject to business timing and is not guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
};
