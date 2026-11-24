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
    <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            What Top Competitors Include
            <SEOExplanationTooltip text="Identifies features, subtopic modules, and architectural standards present across top-ranking competitors on Google." />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Consensus structural standards and content patterns detected across audited competitor URLs.
          </p>
        </div>

        {/* Blueprint Summary */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{presentCount} Present</span>
          {missingCount > 0 && (
            <>
              <span>&bull;</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">{missingCount} Missing</span>
            </>
          )}
        </div>
      </div>

      {/* Blueprint Table - Clean Minimal Table without Heavy Double Borders */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase font-medium tracking-wider">
              <th className="py-2.5 px-3 w-32">Consensus</th>
              <th className="py-2.5 px-3">Structural Module</th>
              <th className="py-2.5 px-3 w-28">Category</th>
              <th className="py-2.5 px-3 text-center w-36">Your Page</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
            {patterns.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                {/* Frequency Ratio */}
                <td className="py-3 px-3 font-mono font-medium text-slate-800 dark:text-slate-200 text-xs">
                  {p.frequencyRatio}{' '}
                  <span className="text-slate-400 dark:text-slate-500 font-normal">({p.frequencyPercent}%)</span>
                </td>

                {/* Pattern Title & Description */}
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{p.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">{p.description}</div>
                </td>

                {/* Type Badge */}
                <td className="py-3 px-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {p.patternType}
                  </span>
                </td>

                {/* Status on Target Page */}
                <td className="py-3 px-3 text-center">
                  {p.isPresentOnTarget ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      <span>Present</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                      <XCircle className="size-3.5" />
                      <span>Missing</span>
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
