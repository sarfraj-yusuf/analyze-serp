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
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
            <span>What&apos;s Already Working</span>
            <SEOExplanationTooltip text="Areas where your page is already as strong or stronger than competitors. Keep these as they are." />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Don&apos;t waste time changing these—focus your effort on the gaps above.
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium text-xs border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{strengths.length} Working Well</span>
          </span>
        </div>
      </div>

      {/* Lightweight Dividers List of Strengths - No Nested Boxes, No Heavy Left Borders */}
      <div className="divide-y divide-slate-100 dark:divide-white/[0.04] flex-1">
        {strengths.map((s, idx) => (
          <div
            key={idx}
            className="py-2.5 first:pt-0 last:pb-0 space-y-0.5"
          >
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{s.title}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-5.5 font-normal">
              {s.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
