'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, ThumbsUp } from 'lucide-react';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';

interface DontTouchStrengthsCardProps {
  strengths: {
    title: string;
    reason: string;
  }[];
}

export const DontTouchStrengthsCard: React.FC<DontTouchStrengthsCardProps> = ({ strengths }) => {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-gray-400">
              Competitive Safeguards
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Don&apos;t Waste Time Changing These
            <SEOExplanationTooltip text="Identifies features and metrics where your target page is already equal or superior to ranking competitors. Protect these strengths and avoid unnecessary edits." />
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Your page is already competitive in these areas. Focus your effort elsewhere.
          </p>
        </div>

        <div className="shrink-0">
          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 font-semibold text-xs border border-slate-200/80 dark:border-white/10 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{strengths.length} Strengths Protected</span>
          </span>
        </div>
      </div>

      {/* Grid of Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {strengths.map((s, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{s.title}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed pl-5">
              {s.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
