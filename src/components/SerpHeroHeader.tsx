'use client';

import React, { useState } from 'react';
import { SerpAlignmentReport, SinglePageAudit } from '@/types/seo';
import { Target, Sparkles, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Award, Copy, Check } from 'lucide-react';

interface SerpHeroHeaderProps {
  report: SerpAlignmentReport;
  results?: SinglePageAudit[];
  onScrollToActionPlan?: () => void;
}

export const SerpHeroHeader: React.FC<SerpHeroHeaderProps> = ({ report, results = [], onScrollToActionPlan }) => {
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

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyTopOutline = () => {
    if (!results || results.length === 0) return;
    const validResults = results.filter((r) => r.status === 'success');
    if (validResults.length === 0) return;

    // Filter out targetUrl if multiple competitors exist
    let competitors = validResults;
    if (validResults.length > 1 && targetUrl) {
      const filtered = validResults.filter((r) => r.url !== targetUrl);
      if (filtered.length > 0) competitors = filtered;
    }

    // Pick top winner with richest heading structure
    const winner = competitors.reduce((best, current) => {
      const currentHeadings = current.headings?.length || 0;
      const bestHeadings = best.headings?.length || 0;
      return currentHeadings > bestHeadings ? current : best;
    }, competitors[0]);

    if (!winner) return;

    const headings = winner.headings || [];
    let domain = winner.url;
    try {
      domain = new URL(winner.url).hostname;
    } catch {}

    let md = `# Competitor Outline: ${winner.meta?.title || domain}\n`;
    md += `> Source URL: ${winner.url}\n\n`;

    if (headings.length === 0) {
      md += `*No H1-H6 headings detected on this competitor page.*\n`;
    } else {
      headings.forEach((h: { level: string; text: string }) => {
        const lvl = h.level.toLowerCase();
        if (lvl === 'h1') md += `# ${h.text}\n`;
        else if (lvl === 'h2') md += `## ${h.text}\n`;
        else if (lvl === 'h3') md += `### ${h.text}\n`;
        else if (lvl === 'h4') md += `#### ${h.text}\n`;
        else md += `- ${h.text}\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Determine status indicators based on score
  let scoreDotClass = 'bg-emerald-500';
  let scoreBarClass = 'bg-emerald-500';
  let scoreLabel = 'Strong Parity';

  if (alignmentScore < 60) {
    scoreDotClass = 'bg-red-500';
    scoreBarClass = 'bg-red-500';
    scoreLabel = 'Major Gaps';
  } else if (alignmentScore < 80) {
    scoreDotClass = 'bg-amber-500';
    scoreBarClass = 'bg-amber-500';
    scoreLabel = 'Moderate Opportunities';
  }

  let host = targetUrl;
  try {
    host = new URL(targetUrl).hostname;
  } catch {}

  const competitorCount = results.filter((r) => r.status === 'success').length - (targetUrl ? 1 : 0);

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-8 relative overflow-hidden">
      {/* Top Banner Tag & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            TARGET
          </span>
          <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
            {host}
          </span>
          {competitorCount > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                vs {competitorCount} {competitorCount === 1 ? 'Competitor' : 'Competitors'}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 1-Click Copy Winner Outline Button */}
          {results && results.length > 0 && (
            <button
              type="button"
              onClick={handleCopyTopOutline}
              aria-label="Copy top competitor outline"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied Winner Outline</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Winner Outline</span>
                </>
              )}
            </button>
          )}

          <div className="hidden md:flex text-xs text-slate-500 dark:text-slate-400 font-mono items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>SERP Consensus</span>
          </div>
        </div>
      </div>

      {/* Unified Bento Hero: Score Anchor (4 cols) + Executive Verdict (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Score Anchor */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SERP Alignment Score
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-mono text-5xl sm:text-6xl font-bold text-slate-800 dark:text-slate-100 tabular-nums tracking-tight leading-none">
                {alignmentScore}
              </span>
              <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 uppercase">
                / 100
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Horizontal Precision Parity Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className={`h-full ${scoreBarClass} transition-all duration-1000 ease-out rounded-full`}
                  style={{ width: `${Math.max(5, alignmentScore)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <span className={`w-2 h-2 rounded-full ${scoreDotClass}`} />
                <span>{scoreLabel}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {opportunityCount} {opportunityCount === 1 ? 'gap' : 'gaps'} found
              </span>
            </div>
          </div>
        </div>

        {/* Right: Plain-English Contextual Verdict & Telemetry Stats */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-5 p-1">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Verdict</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-snug">
              {verdictHeadline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {verdictSubtext}
            </p>
          </div>

          {/* 3 Quiet Telemetry Counters */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.06]">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>High-Impact</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
                {highImpactCount}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Improvements</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
                {improvementsCount}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Strengths</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
                {strengthsCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Prioritized Actions ("DO FIRST") Section */}
      {top3Opportunities.length > 0 && (
        <div className="pt-6 border-t border-slate-200/80 dark:border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                DO FIRST
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Prioritized Action Items
              </h3>
            </div>

            {onScrollToActionPlan && (
              <button
                onClick={onScrollToActionPlan}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Complete Action Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {top3Opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/15 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      ACTION 0{idx + 1}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {opp.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {opp.evidenceText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
