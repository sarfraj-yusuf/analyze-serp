'use client';

import React from 'react';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';
import { SinglePageAudit } from '@/types/seo';
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
} from 'lucide-react';

interface ComparisonMatrixProps {
  results: SinglePageAudit[];
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ results }) => {
  if (!results || results.length < 2) return null;

  const validResults = results.filter((r) => r.status === 'success');
  if (validResults.length < 2) return null;

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
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl my-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
              Multi-URL Competitor Benchmark
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Side-by-Side <span className="gradient-text">Competitor SEO Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Comprehensive feature & metric comparison of{' '}
            <span className="text-slate-900 dark:text-white font-bold">
              {validResults.length} competitor URLs
            </span>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">
              Target Word Goal
            </div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              ~{Math.round(avgWordCount * 1.15).toLocaleString()} words
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">
              Avg TTFB Speed
            </div>
            <div className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">
              {avgTtfb} ms
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080c14] shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <th className="py-4 px-4 w-48 shrink-0">SEO Metric</th>
              {validResults.map((r, idx) => (
                <th key={idx} className="py-4 px-4 min-w-[220px]">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs truncate mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline text-slate-900 dark:text-white flex items-center gap-1 font-bold"
                      title={r.url}
                    >
                      <span className="truncate">{new URL(r.url).hostname}</span>
                      <ExternalLink className="w-3 h-3 text-cyan-600 dark:text-cyan-400 opacity-70 shrink-0" />
                    </a>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate font-mono font-normal">
                    {r.url}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-gray-200">
            {/* 1. Technical Health Score */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Technical SEO Score</span>
                <SEOExplanationTooltip text="Combined 0-100 grade of server response speed, page payload weight, HTTPS security, and viewport rules." />
              </td>
              {validResults.map((r, idx) => {
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Word Count
              </td>
              {validResults.map((r, idx) => {
                const isMax = r.wordCount === maxWordCount && maxWordCount > 0;
                const percentage =
                  maxWordCount > 0
                    ? Math.round((r.wordCount / maxWordCount) * 100)
                    : 0;

                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-500" />
                <span>Title Tag Length</span>
                <SEOExplanationTooltip text="Length of page title. Google cuts off titles longer than ~600 pixels (approx. 60 characters)." />
              </td>
              {validResults.map((r, idx) => {
                const len = r.meta.titleLength;
                const isTruncated = r.meta.titleTruncated;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-500" />
                <span>Meta Description Length</span>
                <SEOExplanationTooltip text="Summary snippet shown in Google search results. Ideal length is 120-160 characters." />
              </td>
              {validResults.map((r, idx) => {
                const len = r.meta.descriptionLength;
                const isTruncated = r.meta.descriptionTruncated;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    {len > 0 ? (
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                H1 Tag Count
              </td>
              {validResults.map((r, idx) => {
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                Total Headings (H2/H3)
              </td>
              {validResults.map((r, idx) => {
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                Images & Missing ALT
              </td>
              {validResults.map((r, idx) => {
                const totalImgs = r.imageAudit.totalImages;
                const missingAlt = r.imageAudit.missingAltCount;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-teal-500" />
                Internal & External Links
              </td>
              {validResults.map((r, idx) => {
                const intCount = r.linkAudit.internalCount;
                const extCount = r.linkAudit.externalCount;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-amber-500" />
                Affiliate Links
              </td>
              {validResults.map((r, idx) => {
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>TTFB Speed & HTML Size</span>
                <SEOExplanationTooltip text="TTFB: How long server takes to start responding. DOM Nodes: Total HTML elements." />
              </td>
              {validResults.map((r, idx) => {
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Readability Grade</span>
                <SEOExplanationTooltip text="Flesch Score: Measures how easy text is to read from 0-100. Higher score means easier reading." />
              </td>
              {validResults.map((r, idx) => {
                const read = r.readability;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    {read ? (
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-500" />
                <span>Top 2-Gram Keywords</span>
                <SEOExplanationTooltip text="N-gram / Keyword Density: Multi-word phrase frequency percentage in total content." />
              </td>
              {validResults.map((r, idx) => {
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
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-500" />
                <span>Schema & Directives</span>
                <SEOExplanationTooltip text="JSON-LD: Structured code for Google. Canonical: Master URL tag. Robots: Indexing rules." />
              </td>
              {validResults.map((r, idx) => {
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
    </div>
  );
};
