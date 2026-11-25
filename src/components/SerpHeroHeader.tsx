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
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs space-y-4 relative">
      {/* Header & Copy Outline Utility */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            At a Glance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            A quick breakdown of what to fix first and what is already working well.
          </p>
        </div>

        {/* 1-Click Copy Winner Heading Outline */}
        {results && results.length > 0 && (
          <Tooltip
            content={isCopied ? 'Outline Copied!' : 'Copy Top Competitor Outline'}
            side="top"
          >
            <button
              type="button"
              onClick={handleCopyTopOutline}
              aria-label="Copy Top Competitor Outline"
              className="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              {isCopied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span>Copied Outline</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-slate-400" />
                  <span>Copy Competitor Outline</span>
                </>
              )}
            </button>
          </Tooltip>
        )}
      </div>

      {/* 3 Telemetry Summary Columns - Clean Borderless Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-white/5">
        {/* Metric 1: High Impact */}
        <div
          onClick={onScrollToActionPlan}
          className="py-2 sm:py-0 sm:px-4 first:pl-0 last:pr-0 cursor-pointer group"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-rose-500 shrink-0" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Quick Wins
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {highImpactCount}
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">High Impact</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            Easy changes that can improve rankings fast.
          </p>
        </div>

        {/* Metric 2: Improvements */}
        <div
          onClick={onScrollToActionPlan}
          className="py-2 sm:py-0 sm:px-4 cursor-pointer group"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Improvements
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {improvementsCount}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Worth Planning</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            Updates to headings, content depth, and page structure.
          </p>
        </div>

        {/* Metric 3: Strengths */}
        <div
          onClick={() => {
            const el = document.getElementById('foundations-safeguards-section') || document.getElementById('strengths-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="py-2 sm:py-0 sm:px-4 last:pr-0 cursor-pointer group"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Already Working
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {strengthsCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Strengths</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            Areas where your page already matches or beats competitors.
          </p>
        </div>
      </div>
    </div>
  );
};
