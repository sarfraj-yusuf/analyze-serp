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

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              SERP Pattern Blueprint
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Winning SERP Consensus Patterns
            <SEOExplanationTooltip text="Identifies features, subtopic sections, and structural modules present across top-ranking competitors on Google." />
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Empirical consensus standards detected across audited competitor URLs.
          </p>
        </div>
      </div>

      {/* Blueprint Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080c14] shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-extrabold uppercase tracking-wider">
              <th className="py-4 px-4 w-28">SERP Ratio</th>
              <th className="py-4 px-4">Observed Pattern / Section</th>
              <th className="py-4 px-4">Pattern Type</th>
              <th className="py-4 px-4 text-center">Status on Your Page</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-gray-200">
            {patterns.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
                {/* Frequency Ratio Badge */}
                <td className="py-3.5 px-4 font-mono font-black">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs border font-extrabold inline-block text-center ${
                      p.frequencyPercent >= 80
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
                        : 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {p.frequencyRatio}
                  </span>
                </td>

                {/* Pattern Title & Description */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">{p.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">{p.description}</div>
                </td>

                {/* Type Badge */}
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-white/10">
                    {p.patternType}
                  </span>
                </td>

                {/* Status on Target Page */}
                <td className="py-3.5 px-4 text-center">
                  {p.isPresentOnTarget ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Present</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 text-[11px] font-bold">
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
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
