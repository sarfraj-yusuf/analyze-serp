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
    <div className="glass-panel rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-6 relative overflow-hidden">
      {/* Chapter 01 Header & Outline Utility */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              CHAPTER 01 · DIAGNOSTIC PULSE
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Empirical Parity Diagnosis &amp; Priority Actions
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
            Core high-impact opportunities identified by benchmarking against ranking competitor DOMs.
          </p>
        </div>

        {/* 1-Click Copy Winner Heading Outline */}
        {results && results.length > 0 && (
          <button
            type="button"
            onClick={handleCopyTopOutline}
            aria-label="Copy top competitor heading outline"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
            title="Export top competitor's H1-H6 heading hierarchy as markdown"
          >
            {isCopied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Outline Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-slate-400" />
                <span>Copy Winner Outline</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 3 Interactive KPI Telemetry Cards with Semantic Color Tinting */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: High Impact (Soft Rose Tint) */}
        <div
          onClick={onScrollToActionPlan}
          className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-900/40 hover:border-rose-400 dark:hover:border-rose-700/60 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Immediate Quick Wins
            </span>
            <span className="size-2 rounded-full bg-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {highImpactCount}
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">High-Impact</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-200 mt-1 font-medium leading-relaxed">
            Actions with the highest ranking impact and minimal execution effort.
          </p>
        </div>

        {/* Card 2: Improvements (Soft Amber Tint) */}
        <div
          onClick={onScrollToActionPlan}
          className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-700/60 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Strategic Tasks
            </span>
            <span className="size-2 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {improvementsCount}
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Optimizations</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-200 mt-1 font-medium leading-relaxed">
            Heading restructuring, schema parity, and content depth improvements.
          </p>
        </div>

        {/* Card 3: Strengths (Soft Emerald Tint) */}
        <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700/60 transition-all shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Competitive Safeguards
            </span>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {strengthsCount}
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Protected</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-200 mt-1 font-medium leading-relaxed">
            Areas where your page already equals or beats ranking competitors.
          </p>
        </div>
      </div>

      {/* Top 3 Priority Actions ("DO FIRST") */}
      {top3Opportunities.length > 0 && (
        <div className="pt-4 border-t border-slate-200/70 dark:border-white/[0.06] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                TOP 3 PRIORITIES
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Immediate Execution Items
              </h4>
            </div>

            {onScrollToActionPlan && (
              <button
                type="button"
                onClick={onScrollToActionPlan}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Jump to Action Roadmap Matrix</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3Opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-xs border-l-4 border-l-rose-500 space-y-2 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-rose-700 dark:text-rose-400">
                      PRIORITY #{idx + 1}
                    </span>
                    <span className="size-1.5 rounded-full bg-rose-500" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {opp.title}
                  </h5>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal line-clamp-3">
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
