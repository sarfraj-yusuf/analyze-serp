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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  PieChart,
  Activity,
  Layers,
} from 'lucide-react';

interface ComparisonMatrixProps {
  results: SinglePageAudit[];
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ results }) => {
  if (!results || results.length < 2) return null;

  const validResults = results.filter((r) => r.status === 'success');
  if (validResults.length < 2) return null;

  const [sortMetric, setSortMetric] = useState<'none' | 'score' | 'wordCount' | 'ttfb'>('none');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);

  const handleSort = (metric: 'score' | 'wordCount' | 'ttfb') => {
    if (sortMetric === metric) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortMetric(metric);
      setSortOrder('desc');
    }
  };

  const sortedResults = useMemo(() => {
    if (sortMetric === 'none') return validResults;
    return [...validResults].sort((a, b) => {
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
  }, [validResults, sortMetric, sortOrder]);

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

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm my-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
              Multi-URL Competitor Benchmark
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Side-by-Side <span className="gradient-text">Competitor SEO Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Comprehensive feature & metric comparison of{' '}
            <span className="text-slate-800 dark:text-slate-100 font-bold">
              {validResults.length} competitor URLs
            </span>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] ${
              showAnalytics
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10'
            }`}
          >
            <PieChart className="w-4 h-4 text-emerald-500" />
            <span>{showAnalytics ? 'Hide Visual Charts' : 'Show Visual Charts'}</span>
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">
              Target Word Goal
            </div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
              ~{Math.round(avgWordCount * 1.15).toLocaleString()} words
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">
              Avg TTFB Speed
            </div>
            <div className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5 tabular-nums">
              {avgTtfb} ms
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Comparative Bar Graphs */}
      {showAnalytics && (
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Visual Benchmark Analytics & Bar Charts
            </h4>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-gray-400">
              <span>Sort Matrix:</span>
              <button
                onClick={() => handleSort('wordCount')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  sortMetric === 'wordCount' ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-200 dark:bg-white/10'
                }`}
              >
                Words
              </button>
              <button
                onClick={() => handleSort('score')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  sortMetric === 'score' ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-200 dark:bg-white/10'
                }`}
              >
                Score
              </button>
              <button
                onClick={() => handleSort('ttfb')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  sortMetric === 'ttfb' ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-200 dark:bg-white/10'
                }`}
              >
                Speed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Word Count Bar Chart */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  Word Count Benchmark
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 tabular-nums">
                  Max: {maxWordCount.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {validResults.map((r, idx) => {
                  let host = r.url;
                  try {
                    host = new URL(r.url).hostname;
                  } catch {}
                  const pct = maxWordCount > 0 ? Math.round((r.wordCount / maxWordCount) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="truncate max-w-[150px] font-semibold text-slate-700 dark:text-gray-300" title={r.url}>
                          #{idx + 1} {host}
                        </span>
                        <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">
                          {r.wordCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Technical Score Bar Chart */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                  Technical SEO Score (0-100)
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 tabular-nums">
                  Max: {maxScore}/100
                </span>
              </div>
              <div className="space-y-2">
                {validResults.map((r, idx) => {
                  let host = r.url;
                  try {
                    host = new URL(r.url).hostname;
                  } catch {}
                  const score = r.technicalAudit?.technicalScore || 0;
                  const barColor = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="truncate max-w-[150px] font-semibold text-slate-700 dark:text-gray-300" title={r.url}>
                          #{idx + 1} {host}
                        </span>
                        <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">
                          {score}/100
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. TTFB Speed Latency Bar Chart */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  TTFB Latency Speed (ms)
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 tabular-nums">
                  Avg: {avgTtfb}ms
                </span>
              </div>
              <div className="space-y-2">
                {validResults.map((r, idx) => {
                  let host = r.url;
                  try {
                    host = new URL(r.url).hostname;
                  } catch {}
                  const ttfb = r.technicalAudit?.ttfbMs || 200;
                  const maxTtfb = Math.max(...validResults.map((v) => v.technicalAudit?.ttfbMs || 200), 500);
                  const pct = Math.min(100, Math.round((ttfb / maxTtfb) * 100));
                  const speedColor = ttfb < 200 ? 'bg-emerald-500' : ttfb < 500 ? 'bg-amber-500' : 'bg-rose-500';
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="truncate max-w-[150px] font-semibold text-slate-700 dark:text-gray-300" title={r.url}>
                          #{idx + 1} {host}
                        </span>
                        <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">
                          {ttfb}ms
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${speedColor} rounded-full transition-all duration-500`}
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

      {/* Benchmark Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080c14] shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#0c1322] border-b border-slate-200 dark:border-white/10 shadow-xs">
            <tr className="text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <th scope="col" className="py-4 px-4 w-48 shrink-0">SEO Metric</th>
              {sortedResults.map((r, idx) => (
                <th scope="col" key={idx} className="py-4 px-4 w-60 min-w-[200px] max-w-[240px]">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold text-xs truncate max-w-[200px] mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline text-slate-800 dark:text-slate-100 flex items-center gap-1 font-bold min-w-0"
                      title={r.url}
                    >
                      <span className="truncate">{new URL(r.url).hostname}</span>
                      <ExternalLink className="w-3 h-3 text-cyan-600 dark:text-cyan-400 opacity-70 shrink-0" />
                    </a>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate max-w-[200px] font-mono font-normal" title={r.url}>
                    {r.url}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-gray-200">
            {/* 1. Technical Health Score */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Technical SEO Score</span>
                <SEOExplanationTooltip text="Combined 0-100 grade of server response speed, page payload weight, HTTPS security, and viewport rules." />
              </td>
              {sortedResults.map((r, idx) => {
                const score = r.technicalAudit?.technicalScore || 0;
                const isTop = score === maxScore && maxScore > 0;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md font-extrabold text-xs ${
                          score >= 80
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : score >= 60
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30'
                        }`}
                      >
                        {score} / 100
                      </span>
                      {isTop && (
                        <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 2. Word Count */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Word Count
              </td>
              {sortedResults.map((r, idx) => {
                const isMax = r.wordCount === maxWordCount && maxWordCount > 0;
                const percentage =
                  maxWordCount > 0
                    ? Math.round((r.wordCount / maxWordCount) * 100)
                    : 0;

                return (
                  <td key={idx} className="py-3.5 px-4 font-mono max-w-[220px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isMax
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-800 dark:text-gray-200'
                          }`}
                        >
                          {r.wordCount.toLocaleString()} words
                          {isMax && (
                            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-normal">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isMax
                              ? 'bg-emerald-500 shadow-sm'
                              : 'bg-cyan-500/60'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 3. Title Tag Length */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-500" />
                <span>Title Tag Length</span>
                <SEOExplanationTooltip text="Length of page title. Google cuts off titles longer than ~600 pixels (approx. 60 characters)." />
              </td>
              {sortedResults.map((r, idx) => {
                const len = r.meta.titleLength;
                const isTruncated = r.meta.titleTruncated;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {len} chars (~{r.meta.titlePixelEstimate}px)
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {isTruncated ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> May Truncate
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Optimal (&lt;600px)
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 4. Meta Description Length */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-500" />
                <span>Meta Description Length</span>
                <SEOExplanationTooltip text="Summary snippet shown in Google search results. Ideal length is 120-160 characters." />
              </td>
              {sortedResults.map((r, idx) => {
                const len = r.meta.descriptionLength;
                const isTruncated = r.meta.descriptionTruncated;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    {len > 0 ? (
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {len} chars
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {isTruncated ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              Long (&gt;160 chars)
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Optimal Length
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Missing Description
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 5. H1 Count */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                H1 Tag Count
              </td>
              {sortedResults.map((r, idx) => {
                const h1Count = r.headings.filter((h) => h.level === 'h1').length;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        h1Count === 1
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : h1Count === 0
                          ? 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
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

            {/* 6. Headings Count (H2 & H3 Breakdown) */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                Total Headings (H2/H3)
              </td>
              {sortedResults.map((r, idx) => {
                const h2Count = r.headings.filter((h) => h.level === 'h2').length;
                const h3Count = r.headings.filter((h) => h.level === 'h3').length;
                const isMax =
                  r.headings.length === maxHeadings && maxHeadings > 0;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded ${
                        isMax
                          ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40 font-bold'
                          : 'text-slate-800 dark:text-gray-200'
                      }`}
                    >
                      {r.headings.length} Headings ({h2Count} H2s, {h3Count} H3s)
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* 7. Image Count & Missing Alt Text */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                Images & Missing ALT
              </td>
              {sortedResults.map((r, idx) => {
                const totalImgs = r.imageAudit.totalImages;
                const missingAlt = r.imageAudit.missingAltCount;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {totalImgs} Images
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {missingAlt > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          {missingAlt} Missing ALT Tags
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          All ALT Tags Present
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 8. Internal vs External Links */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-teal-500" />
                Internal & External Links
              </td>
              {sortedResults.map((r, idx) => {
                const intCount = r.linkAudit.internalCount;
                const extCount = r.linkAudit.externalCount;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {r.linkAudit.totalLinks} Links Total
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-400">
                      {intCount} Internal • {extCount} External
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 9. Affiliate Links Detected */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-amber-500" />
                Affiliate Links
              </td>
              {sortedResults.map((r, idx) => {
                const affCount = r.linkAudit.affiliateCount;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    {affCount > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold">
                        {affCount} Affiliate Links
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500">
                        None Detected
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 10. TTFB Speed & Page Weight */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>TTFB Speed & HTML Size</span>
                <SEOExplanationTooltip text="TTFB: How long server takes to start responding. DOM Nodes: Total HTML elements." />
              </td>
              {sortedResults.map((r, idx) => {
                const tech = r.technicalAudit;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    {tech ? (
                      <div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {tech.ttfbMs} ms TTFB
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400">
                          {tech.htmlSizeKb} kB HTML • {tech.domNodeCount} DOM nodes
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500">
                        N/A
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 11. Readability & Tone */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Readability Grade</span>
                <SEOExplanationTooltip text="Flesch Score: Measures how easy text is to read from 0-100. Higher score means easier reading." />
              </td>
              {sortedResults.map((r, idx) => {
                const read = r.readability;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    {read ? (
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          Flesch {read.fleschReadingEase} ({read.toneLabel})
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400">
                          {read.gradeLabel}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500">
                        N/A
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 12. Top 3 Keyword Phrases */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-500" />
                <span>Top 2-Gram Keywords</span>
                <SEOExplanationTooltip text="N-gram / Keyword Density: Multi-word phrase frequency percentage in total content." />
              </td>
              {sortedResults.map((r, idx) => {
                const topKw = (r.keywords?.twoGram || []).slice(0, 3);
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    {topKw.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {topKw.map((kw, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-[10px] font-semibold text-slate-800 dark:text-gray-200"
                          >
                            {kw.phrase} ({kw.density}%)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500">
                        N/A
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 13. Technical Signals (Schema, Canonical, Robots) */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-500" />
                <span>Schema & Directives</span>
                <SEOExplanationTooltip text="JSON-LD: Structured code for Google. Canonical: Master URL tag. Robots: Indexing rules." />
              </td>
              {sortedResults.map((r, idx) => {
                const hasSchema = r.meta.hasJsonLdSchema;
                const hasCanonical = !!r.meta.canonicalUrl;
                const robots = r.meta.robotsDirective || 'index, follow';

                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <div className="space-y-0.5 text-[10px]">
                      <div>
                        Schema:{' '}
                        {hasSchema ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            JSON-LD Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-500">
                            No
                          </span>
                        )}
                      </div>
                      <div>
                        Canonical:{' '}
                        {hasCanonical ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Set
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold">
                            Missing
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 dark:text-gray-400">
                        Robots: {robots}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detailed Category-wise Competitor Inspector & Multi-Format Exporter */}
      <div className="pt-6 border-t border-slate-200 dark:border-white/10">
        <DetailedMatrixTabViewer audits={validResults} />
      </div>
    </div>
  );
};
