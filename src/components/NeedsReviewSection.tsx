import React from 'react';
import { AlertTriangle, CheckCircle2, Trash2, Edit3, HelpCircle, CopyCheck } from 'lucide-react';
import { NeedsReviewItem, Transaction } from '../types/cashflow';

interface NeedsReviewSectionProps {
  items: NeedsReviewItem[];
  transactions: Transaction[];
  onRemoveTransaction: (id: string) => void;
  onVerifyTransaction: (id: string) => void;
}

export const NeedsReviewSection: React.FC<NeedsReviewSectionProps> = ({
  items,
  transactions,
  onRemoveTransaction,
  onVerifyTransaction,
}) => {
  const activeItems = items.filter((item) =>
    transactions.some((t) => t.id === item.transactionId)
  );

  if (activeItems.length === 0) return null;

  return (
    <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-amber-950 tracking-tight flex items-center gap-2">
              <span>🔎 Needs Review ({activeItems.length})</span>
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              These items were flagged for duplicates, zero amounts, or unclear descriptions. Duplicates are kept by default unless you choose to remove them.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {activeItems.map((item) => {
          const tx = transactions.find((t) => t.id === item.transactionId);

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 uppercase">
                    {item.issueType.replace('_', ' ')}
                  </span>
                  {tx && (
                    <span className="font-mono text-xs font-bold text-slate-800">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-900 mt-2">
                  {item.title}: <span className="font-normal text-slate-700">{item.description}</span>
                </p>
                {tx && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Entry: "{tx.description}" on {tx.date} ({tx.type})
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                {item.issueType === 'duplicate' && (
                  <button
                    type="button"
                    onClick={() => onRemoveTransaction(item.transactionId)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Duplicate</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onVerifyTransaction(item.transactionId)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mark as Verified</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
