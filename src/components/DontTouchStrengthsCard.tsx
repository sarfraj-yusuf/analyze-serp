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
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              Competitive Safeguards
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Don&apos;t Waste Time Changing These
            <SEOExplanationTooltip text="Identifies features and metrics where your target page is already equal or superior to ranking competitors. Protect these strengths and avoid unnecessary edits." />
          </h3>
          <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 font-medium">
            Your page is already competitive in these areas. Focus your effort elsewhere.
          </p>
        </div>

        <div className="shrink-0">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{strengths.length} Competitive Strengths Protected</span>
          </span>
        </div>
      </div>

      {/* Grid of Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strengths.map((s, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-emerald-500/20 space-y-1.5 shadow-sm"
          >
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{s.title}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-semibold pl-6">
              {s.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
