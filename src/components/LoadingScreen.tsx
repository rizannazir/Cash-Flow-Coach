import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

const STEPS = [
  'Cleaning your transactions...',
  'Categorising expenses...',
  'Finding money leaks...',
  'Building your dashboard...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 550);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5 ring-8 ring-blue-50/50">
          <Sparkles className="w-8 h-8 animate-pulse text-blue-600" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Cash-Flow Coach is Working
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Normalizing rupee figures, classifying Indian business expenses, and auditing cash leaks
        </p>

        {/* Steps Progress */}
        <div className="space-y-3 text-left">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 border border-blue-200'
                    : isCompleted
                    ? 'text-slate-600'
                    : 'text-slate-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    isCurrent
                      ? 'font-bold text-blue-900'
                      : isCompleted
                      ? 'font-medium text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Processing Indian MSME rules engine...</span>
        </div>
      </div>
    </div>
  );
};
