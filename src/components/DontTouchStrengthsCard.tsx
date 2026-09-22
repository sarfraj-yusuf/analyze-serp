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
    <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-white/10 shadow-sm space-y-5 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800/50">
              Competitive Safeguards
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            Don&apos;t Waste Time Changing These
            <SEOExplanationTooltip text="Identifies features and metrics where your target page is already equal or superior to ranking competitors. Protect these strengths and avoid unnecessary edits." />
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Your page is already competitive in these areas. Focus your effort elsewhere.
          </p>
        </div>

        <div className="shrink-0">
          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs border border-emerald-300/80 dark:border-emerald-800/50 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{strengths.length} Strengths Protected</span>
          </span>
        </div>
      </div>

      {/* Grid of Strengths (Semantic Emerald Tinted Cards) */}
      <div className="grid grid-cols-1 gap-2.5 flex-1 content-start">
        {strengths.map((s, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1 transition-all"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{s.title}</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-normal leading-relaxed pl-6">
              {s.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
