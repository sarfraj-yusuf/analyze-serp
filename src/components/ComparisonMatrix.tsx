'use client';

import React, { useState, useMemo } from 'react';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';
import { SinglePageAudit } from '@/types/seo';
import { DetailedMatrixTabViewer } from '@/components/DetailedMatrixTabViewer';
import {
  Trophy,
  FileText,
  Image as ImageIcon,
  BarChart2,
  ExternalLink,
  BookOpen,
  Zap,
  Tag,
  CheckCircle2,
  AlertCircle,
  Link2,
  ShieldCheck,
  Code,
  Key,
  PieChart,
  Activity,
  Layers,
  SlidersHorizontal,
  Target,
  Check,
} from 'lucide-react';

interface ComparisonMatrixProps {
  results: SinglePageAudit[];
  targetUrl?: string;
}

type MetricCategoryFilter = 'all' | 'technical' | 'content' | 'headings' | 'links';

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ results, targetUrl }) => {
  if (!results || results.length < 2) return null;

  const validResults = results.filter((r) => r.status === 'success');
  if (validResults.length < 2) return null;

  const [sortMetric, setSortMetric] = useState<'none' | 'score' | 'wordCount' | 'ttfb'>('none');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<MetricCategoryFilter>('all');

  const handleSort = (metric: 'score' | 'wordCount' | 'ttfb') => {
    if (sortMetric === metric) {
      if (sortOrder === 'desc') {
        setSortOrder('asc');
      } else {
        setSortMetric('none');
        setSortOrder('desc');
      }
    } else {
      setSortMetric(metric);
      setSortOrder('desc');
    }
  };

  // Identify target audit vs competitors
  const effectiveTargetUrl = targetUrl || validResults[0]?.url || '';
  const targetAudit = validResults.find((r) => r.url === effectiveTargetUrl) || validResults[0];

  // Organize results: Keep Target URL in column 1, then sort competitor URLs by the selected metric
  const sortedResults = useMemo(() => {
    const target = validResults.find((r) => r.url === effectiveTargetUrl);
    const competitors = validResults.filter((r) => r.url !== effectiveTargetUrl);

    if (sortMetric === 'none') {
      return target ? [target, ...competitors] : validResults;
    }

    const sortedCompetitors = [...competitors].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortMetric === 'score') {
        valA = a.technicalAudit?.technicalScore || 0;
        valB = b.technicalAudit?.technicalScore || 0;
      } else if (sortMetric === 'wordCount') {
        valA = a.wordCount || 0;
        valB = b.wordCount || 0;
      } else if (sortMetric === 'ttfb') {
        valA = a.technicalAudit?.ttfbMs || 0;
        valB = b.technicalAudit?.ttfbMs || 0;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return target ? [target, ...sortedCompetitors] : sortedCompetitors;
  }, [validResults, effectiveTargetUrl, sortMetric, sortOrder]);

  // Compute key benchmarks
  const maxWordCount = Math.max(...validResults.map((r) => r.wordCount));
  const avgWordCount = Math.round(
    validResults.reduce((acc, r) => acc + r.wordCount, 0) / validResults.length
  );

  const maxHeadings = Math.max(...validResults.map((r) => r.headings.length));
  const maxScore = Math.max(
    ...validResults.map((r) => r.technicalAudit?.technicalScore || 0)
  );

  const avgTtfb = Math.round(
    validResults.reduce(
      (acc, r) => acc + (r.technicalAudit?.ttfbMs || 200),
      0
    ) / validResults.length
  );

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-xs p-5 sm:p-7 space-y-6">
      {/* 1. Control & KPI Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              Comparative Matrix
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Comparing <strong className="text-slate-800 dark:text-slate-100">{validResults.length} audited URLs</strong>
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Benchmark Matrix & Signal Alignment</span>
          </h4>
        </div>

        {/* Right side controls: Toggle Visuals + Summary Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={showAnalytics ? 'Hide Benchmark Charts' : 'Show Benchmark Charts'}
            aria-label={showAnalytics ? 'Hide Benchmark Charts' : 'Show Benchmark Charts'}
          >
            <PieChart className="size-4" />
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Target Word Benchmark
            </div>
            <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              ~{Math.round(avgWordCount * 1.15).toLocaleString()} words
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Avg TTFB Latency
            </div>
            <div className="text-xs font-bold font-mono text-cyan-700 dark:text-cyan-400 tabular-nums">
              {avgTtfb} ms
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Analytics & Comparative Bar Graphs */}
      {showAnalytics && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Key Signal Visual Benchmarks</span>
            </h5>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="text-[11px] font-medium">Sort Matrix:</span>
              <button
                onClick={() => handleSort('wordCount')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortMetric === 'wordCount'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                    : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80'
                }`}
              >
                Words {sortMetric === 'wordCount' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('score')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortMetric === 'score'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                    : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80'
                }`}
              >
                Score {sortMetric === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('ttfb')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortMetric === 'ttfb'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                    : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80'
                }`}
              >
                Speed {sortMetric === 'ttfb' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Word Count Bar Chart */}
            <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Word Count Benchmark</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  Max: {maxWordCount.toLocaleString()}
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                {validResults.map((r, idx) => {
                  const isTarget = r.url === effectiveTargetUrl;
                  const host = getHostname(r.url);
                  const pct = maxWordCount > 0 ? Math.round((r.wordCount / maxWordCount) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span
                          className={`truncate max-w-[140px] font-medium flex items-center gap-1 ${
                            isTarget
                              ? 'font-bold text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title={r.url}
                        >
                          {isTarget ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                              <Target className="size-3 shrink-0" /> You
                            </span>
                          ) : (
                            <span className="font-mono text-slate-500">#{idx + 1}</span>
                          )}{' '}
                          <span className="truncate">{host}</span>
                        </span>
                        <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">
                          {r.wordCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isTarget ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-slate-400 dark:bg-slate-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical Score Bar Chart */}
            <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Technical Score (0-100)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  Max: {maxScore}/100
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                {validResults.map((r, idx) => {
                  const isTarget = r.url === effectiveTargetUrl;
                  const host = getHostname(r.url);
                  const score = r.technicalAudit?.technicalScore || 0;
                  const barColor =
                    score >= 80 ? 'bg-emerald-600 dark:bg-emerald-400' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span
                          className={`truncate max-w-[140px] font-medium flex items-center gap-1 ${
                            isTarget
                              ? 'font-bold text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title={r.url}
                        >
                          {isTarget ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                              <Target className="size-3 shrink-0" /> You
                            </span>
                          ) : (
                            <span className="font-mono text-slate-500">#{idx + 1}</span>
                          )}{' '}
                          <span className="truncate">{host}</span>
                        </span>
                        <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">
                          {score}/100
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-300`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TTFB Speed Latency Bar Chart */}
            <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>TTFB Latency (Lower is Better)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  Avg: {avgTtfb}ms
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                {validResults.map((r, idx) => {
                  const isTarget = r.url === effectiveTargetUrl;
                  const host = getHostname(r.url);
                  const ttfb = r.technicalAudit?.ttfbMs || 200;
                  const maxTtfb = Math.max(...validResults.map((v) => v.technicalAudit?.ttfbMs || 200), 500);
                  const pct = Math.min(100, Math.round((ttfb / maxTtfb) * 100));
                  const speedColor =
                    ttfb < 200 ? 'bg-emerald-600 dark:bg-emerald-400' : ttfb < 500 ? 'bg-amber-500' : 'bg-rose-500';
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span
                          className={`truncate max-w-[140px] font-medium flex items-center gap-1 ${
                            isTarget
                              ? 'font-bold text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title={r.url}
                        >
                          {isTarget ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                              <Target className="size-3 shrink-0" /> You
                            </span>
                          ) : (
                            <span className="font-mono text-slate-500">#{idx + 1}</span>
                          )}{' '}
                          <span className="truncate">{host}</span>
                        </span>
                        <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">
                          {ttfb}ms
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${speedColor} rounded-full transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          All Signals (13)
        </button>
        <button
          onClick={() => setActiveCategory('technical')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'technical'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Core Technical (3)</span>
        </button>
        <button
          onClick={() => setActiveCategory('content')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'content'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          <span>Content &amp; Readability (3)</span>
        </button>
        <button
          onClick={() => setActiveCategory('headings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'headings'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Headings &amp; Hierarchy (2)</span>
        </button>
        <button
          onClick={() => setActiveCategory('links')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'links'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-cyan-500" />
          <span>Links, Media &amp; Schema (5)</span>
        </button>
      </div>

      {/* 4. Benchmark Matrix Table with Sticky Left Column */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
            <tr>
              {/* Sticky Column Header */}
              <th
                scope="col"
                className="py-3.5 px-4 w-56 min-w-[210px] shrink-0 sticky left-0 z-30 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
              >
                <div className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                  SEO Signal Metric
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  Horizontal URL Benchmark
                </div>
              </th>

              {/* URL Column Headers */}
              {sortedResults.map((r, idx) => {
                const isTarget = r.url === effectiveTargetUrl;
                const host = getHostname(r.url);
                return (
                  <th
                    scope="col"
                    key={idx}
                    className={`py-3.5 px-4 w-60 min-w-[210px] max-w-[250px] border-r border-slate-200/80 dark:border-white/5 ${
                      isTarget ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {isTarget ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center gap-1 shrink-0">
                          <Target className="w-2.5 h-2.5" />
                          <span>Target (You)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 shrink-0">
                          Competitor #{idx}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:underline text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center gap-1"
                        title={r.url}
                      >
                        <span className="truncate">{host}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 hover:text-emerald-500 shrink-0" />
                      </a>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5" title={r.url}>
                      {r.url}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-800 dark:text-slate-200">
            {/* ======================================================== */}
            {/* CATEGORY A: TECHNICAL HEALTH & SPEED                     */}
            {/* ======================================================== */}
            {(activeCategory === 'all' || activeCategory === 'technical') && (
              <>
                <tr className="bg-slate-50 dark:bg-white/[0.02]">
                  <td
                    colSpan={sortedResults.length + 1}
                    className="py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-white/10"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Zap className="size-3 text-emerald-500" />
                      <span>Technical &amp; Server Speed Performance</span>
                    </span>
                  </td>
                </tr>

                {/* 1. Technical Health Score */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Technical SEO Score</span>
                      <SEOExplanationTooltip text="Combined 0-100 grade of server response speed, page payload weight, HTTPS security, and viewport rules." />
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const score = r.technicalAudit?.technicalScore || 0;
                    const isTop = score === maxScore && maxScore > 0;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              score >= 80
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : score >= 60
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {score} / 100
                          </span>
                          {isTop && (
                            <span title="Top Score">
                              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 2. TTFB Speed & Page Weight */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>TTFB &amp; HTML Size</span>
                      <SEOExplanationTooltip text="TTFB: Time To First Byte (server response latency). HTML Size: Uncompressed initial page weight." />
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const tech = r.technicalAudit;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        {tech ? (
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                              {tech.ttfbMs} ms TTFB
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                              {tech.htmlSizeKb} kB • {tech.domNodeCount} DOM nodes
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Technical Signals (Schema, Canonical, Robots) */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Schema &amp; Directives</span>
                      <SEOExplanationTooltip text="JSON-LD Schema presence, canonical tag configuration, and search engine robots directives." />
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const hasSchema = r.meta.hasJsonLdSchema;
                    const hasCanonical = !!r.meta.canonicalUrl;
                    const robots = r.meta.robotsDirective || 'index, follow';
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono text-[11px] border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 dark:text-slate-400">Schema:</span>
                            {hasSchema ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">JSON-LD Present</span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-semibold">Missing</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 dark:text-slate-400">Canonical:</span>
                            {hasCanonical ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Set</span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">Missing</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            Robots: {robots}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </>
            )}

            {/* ======================================================== */}
            {/* CATEGORY B: CONTENT & READABILITY                        */}
            {/* ======================================================== */}
            {(activeCategory === 'all' || activeCategory === 'content') && (
              <>
                <tr className="bg-slate-50 dark:bg-white/[0.02]">
                  <td
                    colSpan={sortedResults.length + 1}
                    className="py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-white/10"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="size-3 text-emerald-500" />
                      <span>Content Depth &amp; Readability</span>
                    </span>
                  </td>
                </tr>

                {/* 4. Word Count */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Word Count</span>
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const isMax = r.wordCount === maxWordCount && maxWordCount > 0;
                    const isTarget = r.url === effectiveTargetUrl;
                    const percentage = maxWordCount > 0 ? Math.round((r.wordCount / maxWordCount) * 100) : 0;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span
                              className={`inline-flex items-center gap-1 ${
                                isTarget
                                  ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {r.wordCount.toLocaleString()} words
                              {isMax && <Trophy className="w-3 h-3 text-amber-500 shrink-0" />}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isTarget ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-slate-400 dark:bg-slate-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Readability & Tone */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Readability Grade</span>
                      <SEOExplanationTooltip text="Flesch Reading Ease score from 0-100. Higher scores mean content is easier for general readers to digest." />
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const read = r.readability;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        {read ? (
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                              Flesch {read.fleschReadingEase} ({read.toneLabel})
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {read.gradeLabel}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. Top 3 Keyword Phrases */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span>Top 2-Gram Keywords</span>
                      <SEOExplanationTooltip text="Most frequent 2-word semantic phrases and their estimated density in body content." />
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const topKw = (r.keywords?.twoGram || []).slice(0, 3);
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        {topKw.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {topKw.map((kw, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-white/5"
                              >
                                {kw.phrase} ({kw.density}%)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </>
            )}

            {/* ======================================================== */}
            {/* CATEGORY C: HEADINGS & STRUCTURE                         */}
            {/* ======================================================== */}
            {(activeCategory === 'all' || activeCategory === 'headings') && (
              <>
                <tr className="bg-slate-50 dark:bg-white/[0.02]">
                  <td
                    colSpan={sortedResults.length + 1}
                    className="py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-white/10"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="size-3 text-indigo-500" />
                      <span>Headings &amp; Document Hierarchy</span>
                    </span>
                  </td>
                </tr>

                {/* 7. H1 Count */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>H1 Tag Count</span>
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const h1Count = r.headings.filter((h) => h.level === 'h1').length;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            h1Count === 1
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : h1Count === 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {h1Count === 1
                            ? '1 H1 (Optimal)'
                            : h1Count === 0
                            ? '0 H1 (Missing)'
                            : `${h1Count} H1s (Multiple)`}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Headings Breakdown (H2 & H3) */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Total Headings (H2/H3)</span>
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const h2Count = r.headings.filter((h) => h.level === 'h2').length;
                    const h3Count = r.headings.filter((h) => h.level === 'h3').length;
                    const isMax = r.headings.length === maxHeadings && maxHeadings > 0;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                            isMax
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {r.headings.length} Headings ({h2Count} H2s, {h3Count} H3s)
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </>
            )}

            {/* ======================================================== */}
            {/* CATEGORY D: METADATA, MEDIA & LINKS                      */}
            {/* ======================================================== */}
            {(activeCategory === 'all' || activeCategory === 'links') && (
              <>
                <tr className="bg-slate-50 dark:bg-white/[0.02]">
                  <td
                    colSpan={sortedResults.length + 1}
                    className="py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-white/10"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Link2 className="size-3 text-cyan-500" />
                      <span>Metadata, Media &amp; Link Graph</span>
                    </span>
                  </td>
                </tr>

                {/* 9. Title Tag Length */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span>Title Tag Length</span>
                      <SEOExplanationTooltip text="Google cuts off SERP titles exceeding ~600px width (usually 55-60 characters)." />
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const len = r.meta.titleLength;
                    const isTruncated = r.meta.titleTruncated;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                          {len} chars (~{r.meta.titlePixelEstimate}px)
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {isTruncated ? (
                            <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> May Truncate
                            </span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Optimal (&lt;600px)
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 10. Meta Description Length */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span>Meta Description</span>
                      <SEOExplanationTooltip text="Recommended snippet description length is between 120-160 characters for desktop and mobile SERPs." />
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const len = r.meta.descriptionLength;
                    const isTruncated = r.meta.descriptionTruncated;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        {len > 0 ? (
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                              {len} chars
                            </div>
                            <div className="text-[10px] mt-0.5">
                              {isTruncated ? (
                                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                                  Long (&gt;160 chars)
                                </span>
                              ) : (
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                  Optimal Length
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">Missing Description</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 11. Images & Missing Alt Text */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Images &amp; Missing ALT</span>
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const totalImgs = r.imageAudit.totalImages;
                    const missingAlt = r.imageAudit.missingAltCount;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                          {totalImgs} Images
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {missingAlt > 0 ? (
                            <span className="text-amber-700 dark:text-amber-400 font-semibold">
                              {missingAlt} Missing ALT Tags
                            </span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              All ALT Present
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 12. Internal vs External Links */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Internal &amp; External Links</span>
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const intCount = r.linkAudit.internalCount;
                    const extCount = r.linkAudit.externalCount;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                          {r.linkAudit.totalLinks} Links Total
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                          {intCount} Internal • {extCount} External
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 13. Affiliate Links Detected */}
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Affiliate Monetization</span>
                    </div>
                  </td>
                  {sortedResults.map((r, idx) => {
                    const affCount = r.linkAudit.affiliateCount;
                    const isTarget = r.url === effectiveTargetUrl;
                    return (
                      <td
                        key={idx}
                        className={`py-3 px-4 font-mono border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        {affCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-[11px]">
                            {affCount} Affiliate Links
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">None Detected</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Detailed Category-wise Competitor Inspector */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-white/[0.08]">
        <DetailedMatrixTabViewer audits={validResults} targetUrl={effectiveTargetUrl} />
      </div>
    </div>
  );
};
