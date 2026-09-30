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
    <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs space-y-5 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
        <div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
            Competitive Safeguards
          </span>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
            <span>Don&apos;t Waste Time Changing These</span>
            <SEOExplanationTooltip text="Identifies features and metrics where your target page is already equal or superior to ranking competitors. Protect these strengths and avoid unnecessary edits." />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your page is already competitive in these areas. Focus your effort elsewhere.
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium text-xs border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{strengths.length} Strengths Protected</span>
          </span>
        </div>
      </div>

      {/* Grid of Strengths - Clean Neutral Cards with Subtle Left Accent Line */}
      <div className="grid grid-cols-1 gap-2 flex-1 content-start">
        {strengths.map((s, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] border-l-2 border-l-emerald-500 space-y-1 transition-all"
          >
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{s.title}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-5 font-normal">
              {s.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
