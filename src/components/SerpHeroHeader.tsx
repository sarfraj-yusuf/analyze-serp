'use client';

import React from 'react';
import { SerpAlignmentReport } from '@/types/seo';
import { Target, Sparkles, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Award } from 'lucide-react';

interface SerpHeroHeaderProps {
  report: SerpAlignmentReport;
  onScrollToActionPlan?: () => void;
}

export const SerpHeroHeader: React.FC<SerpHeroHeaderProps> = ({ report, onScrollToActionPlan }) => {
  const {
    alignmentScore,
    opportunityCount,
    verdictHeadline,
    verdictSubtext,
    highImpactCount,
    improvementsCount,
    strengthsCount,
    targetUrl,
    top3Opportunities,
  } = report;

  // Determine badge styling based on score
  let scoreBadgeClass = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40';
  let scoreLabel = 'Strong Parity';

  if (alignmentScore < 60) {
    scoreBadgeClass = 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40';
    scoreLabel = 'Major Gaps';
  } else if (alignmentScore < 80) {
    scoreBadgeClass = 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40';
    scoreLabel = 'Moderate Opportunities';
  }

  let host = targetUrl;
  try {
    host = new URL(targetUrl).hostname;
  } catch {}

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-sm space-y-6 relative overflow-hidden bg-gradient-to-br from-slate-900/5 via-emerald-500/5 to-cyan-500/5 dark:from-[#0a101d] dark:via-[#0c1629] dark:to-[#091322]">
      {/* Top Banner Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>Target Page vs SERP Benchmark</span>
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-gray-400 truncate max-w-xs sm:max-w-md">
            {host}
          </span>
        </div>

        <div className="text-xs text-slate-500 dark:text-gray-400 font-semibold flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <span>SERP Consensus Decision Engine</span>
        </div>
      </div>

      {/* Hero Core Score & Opportunities Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: SERP Alignment Gauge */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center lg:items-start gap-4 p-6 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-inner">
          <div className="text-center lg:text-left space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-gray-400">
              SERP Alignment Score
            </span>
            <div className="flex items-baseline justify-center lg:justify-start gap-2">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                {alignmentScore}
              </span>
              <span className="text-2xl font-bold text-slate-400 dark:text-gray-500">/ 100</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border text-center ${scoreBadgeClass}`}>
              {scoreLabel} ({alignmentScore}% Fit to Ranking Standard)
            </span>

            <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-extrabold flex items-center justify-center gap-2">
              <span>🟠 {opportunityCount} Meaningful Opportunities Found</span>
            </div>
          </div>
        </div>

        {/* Right: Plain-English Contextual Verdict & Status Pills */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {verdictHeadline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
              {verdictSubtext}
            </p>
          </div>

          {/* 3 Status Summary Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 font-extrabold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>🔴 {highImpactCount} High-Impact Gaps</span>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
              <span>🟠 {improvementsCount} Improvements</span>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>🟢 {strengthsCount} Competitive Strengths</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Biggest Opportunities Preview */}
      {top3Opportunities.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Biggest Opportunities at a Glance</span>
            </span>

            {onScrollToActionPlan && (
              <button
                onClick={onScrollToActionPlan}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Complete Action Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3Opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1"
              >
                <div className="text-[11px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{opp.title}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-2">
                  {opp.evidenceText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
