import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Activity, Sparkles } from 'lucide-react';
import { CashHealthStatus } from '../types/cashflow';

interface CashHealthCardProps {
  status: CashHealthStatus;
  headline: string;
  reason: string;
}

export const CashHealthCard: React.FC<CashHealthCardProps> = ({
  status,
  headline,
  reason,
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'manageable':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800',
          indicatorBg: 'bg-emerald-500',
          badgeText: '🟢 MANAGEABLE',
          titleColor: 'text-emerald-950',
          accentBorder: 'border-l-4 border-l-emerald-500',
        };
      case 'needs_attention':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-900',
          indicatorBg: 'bg-amber-500',
          badgeText: '🟡 NEEDS ATTENTION',
          titleColor: 'text-amber-950',
          accentBorder: 'border-l-4 border-l-amber-500',
        };
      case 'shortfall_risk':
        return {
          icon: AlertOctagon,
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-900',
          indicatorBg: 'bg-rose-500',
          badgeText: '🔴 POSSIBLE SHORTFALL',
          titleColor: 'text-rose-950',
          accentBorder: 'border-l-4 border-l-rose-500',
        };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs ${config.accentBorder}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cash Health Diagnostic
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/50">
                <Sparkles className="w-3 h-3" />
                Coach Analysis
              </span>
            </div>
            <h3 className={`text-xl font-extrabold ${config.titleColor} mt-0.5 tracking-tight`}>
              {headline}
            </h3>
          </div>
        </div>

        {/* Status Pill */}
        <div className="shrink-0">
          <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${config.bg} border`}>
            <span className={`w-2.5 h-2.5 rounded-full ${config.indicatorBg} animate-pulse`} />
            <span>{config.badgeText}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 text-sm sm:text-base text-slate-700 leading-relaxed font-normal bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
        <p className="flex items-start gap-2.5">
          <IconComponent className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <span>{reason}</span>
        </p>
      </div>
    </div>
  );
};
