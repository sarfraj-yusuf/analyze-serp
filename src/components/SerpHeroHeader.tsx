'use client';

import React, { useState } from 'react';
import { SerpAlignmentReport, SinglePageAudit } from '@/types/seo';
import { Target, Sparkles, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Award, Copy, Check } from 'lucide-react';
import { Tooltip } from './Tooltip';

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
    <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs space-y-5 relative">
      {/* Chapter 01 Header & Outline Utility */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
            Diagnostic Telemetry
          </span>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Empirical Parity Diagnosis &amp; Priority Actions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Core high-impact opportunities identified by benchmarking against ranking competitor DOMs.
          </p>
        </div>

        {/* 1-Click Copy Winner Heading Outline */}
        {results && results.length > 0 && (
          <Tooltip
            content={isCopied ? 'Outline Copied!' : 'Copy Winner Outline'}
            side="top"
          >
            <button
              type="button"
              onClick={handleCopyTopOutline}
              aria-label="Copy Winner Heading Outline"
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              {isCopied ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </Tooltip>
        )}
      </div>

      {/* 3 Telemetry Cards - Quiet Neutral Cards with Single Color Indicator Dot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: High Impact */}
        <div
          onClick={onScrollToActionPlan}
          className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Immediate Quick Wins
            </span>
            <span className="size-2 rounded-full bg-rose-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {highImpactCount}
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">High-Impact</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Actions with the highest ranking impact and minimal execution effort.
          </p>
        </div>

        {/* Card 2: Improvements */}
        <div
          onClick={onScrollToActionPlan}
          className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Strategic Tasks
            </span>
            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {improvementsCount}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Optimizations</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Heading restructuring, schema parity, and content depth improvements.
          </p>
        </div>

        {/* Card 3: Strengths */}
        <div
          onClick={() => {
            const el = document.getElementById('foundations-safeguards-section') || document.getElementById('strengths-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Competitive Safeguards
            </span>
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {strengthsCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Protected</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Areas where your page already equals or beats ranking competitors.
          </p>
        </div>
      </div>

      {/* Top 3 Priority Actions ("DO FIRST") - Minimalist Card with Subtle Left Accent Line */}
      {top3Opportunities.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.04] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                TOP 3 PRIORITIES
              </span>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Immediate Execution Items
              </h4>
            </div>

            {onScrollToActionPlan && (
              <button
                type="button"
                onClick={onScrollToActionPlan}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Jump to Action Roadmap</span>
                <ArrowRight className="size-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3Opportunities.map((opp, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={onScrollToActionPlan}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onScrollToActionPlan?.();
                  }
                }}
                className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] border-l-2 border-l-rose-500 space-y-2 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      #{idx + 1} Priority
                    </span>
                    {opp.category && (
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {opp.category}
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {opp.title}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal line-clamp-2">
                    {opp.evidenceText}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>View in Action Plan</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
