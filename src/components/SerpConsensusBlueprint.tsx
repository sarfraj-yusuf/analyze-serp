'use client';

import React from 'react';
import { SerpConsensusPattern } from '@/types/seo';
import { Layers, CheckCircle2, XCircle, Sparkles, HelpCircle } from 'lucide-react';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';

interface SerpConsensusBlueprintProps {
  patterns: SerpConsensusPattern[];
}

export const SerpConsensusBlueprint: React.FC<SerpConsensusBlueprintProps> = ({ patterns }) => {
  if (!patterns || patterns.length === 0) return null;

  const presentCount = patterns.filter((p) => p.isPresentOnTarget).length;
  const missingCount = patterns.length - presentCount;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Sparkles className="size-3" />
              CHAPTER 01 (CONT.) · SERP BLUEPRINT
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Winning Page 1 Architectural Patterns
            <SEOExplanationTooltip text="Identifies features, subtopic modules, and architectural standards present across top-ranking competitors on Google." />
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
            Empirical consensus standards detected across audited competitor URLs.
          </p>
        </div>

        {/* Blueprint Summary Pill */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto text-xs font-mono font-semibold">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/50 font-bold">
            {presentCount} Present
          </span>
          {missingCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/50 font-bold">
              {missingCount} Missing
            </span>
          )}
        </div>
      </div>

      {/* Blueprint Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-slate-900/60 shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-mono text-[10px] uppercase font-bold tracking-wider">
              <th className="py-3 px-4 w-32">SERP Consensus</th>
              <th className="py-3 px-4">Observed Pattern / Module</th>
              <th className="py-3 px-4 w-28">Category</th>
              <th className="py-3 px-4 text-center w-36">Target Page Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {patterns.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                {/* Frequency Ratio Badge */}
                <td className="py-3 px-4 font-mono font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] inline-block ${
                      p.frequencyPercent >= 80
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/50 font-bold'
                        : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 font-semibold'
                    }`}
                  >
                    {p.frequencyRatio} ({p.frequencyPercent}%)
                  </span>
                </td>

                {/* Pattern Title & Description */}
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{p.title}</div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-normal">{p.description}</div>
                </td>

                {/* Type Badge */}
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60">
                    {p.patternType}
                  </span>
                </td>

                {/* Status on Target Page */}
                <td className="py-3 px-4 text-center">
                  {p.isPresentOnTarget ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/50 text-xs font-bold">
                      <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Present</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/50 text-xs font-bold">
                      <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Missing Gap</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
