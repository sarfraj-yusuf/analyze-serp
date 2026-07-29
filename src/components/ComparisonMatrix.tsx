import React from 'react';
import { SinglePageAudit } from '@/types/seo';
import { Columns, Trophy, AlertTriangle, FileText, Image, Key, LayoutGrid, BarChart2, Link2, ExternalLink, BookOpen, Zap } from 'lucide-react';

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
  const avgHeadings = Math.round(
    validResults.reduce((acc, r) => acc + r.headings.length, 0) / validResults.length
  );

  const avgTtfb = Math.round(
    validResults.reduce((acc, r) => acc + (r.technicalAudit?.ttfbMs || 200), 0) / validResults.length
  );

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl my-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
              Multi-URL Audit Mode
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <LayoutGrid className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Side-by-Side <span className="gradient-text">Competitor Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Comparing <span className="text-slate-900 dark:text-white font-bold">{validResults.length} competitor URLs</span> in a unified benchmark grid.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">Target Word Goal</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              ~{Math.round(avgWordCount * 1.15).toLocaleString()} words
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">Avg TTFB Speed</div>
            <div className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">{avgTtfb} ms</div>
          </div>
        </div>
      </div>

      {/* Benchmark Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080c14] shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <th className="py-4 px-4 w-48">SEO Metric</th>
              {validResults.map((r, idx) => (
                <th key={idx} className="py-4 px-4 min-w-[210px]">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs truncate mb-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline text-slate-900 dark:text-white flex items-center gap-1"
                      title={r.url}
                    >
                      <span className="truncate">{new URL(r.url).hostname}</span>
                      <ExternalLink className="w-3 h-3 text-cyan-600 dark:text-cyan-400 opacity-70 shrink-0" />
                    </a>
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline font-mono truncate font-normal block"
                  >
                    {r.url}
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-gray-200">
            {/* Row 1: Word Count */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Word Count
              </td>
              {validResults.map((r, idx) => {
                const isMax = r.wordCount === maxWordCount && maxWordCount > 0;
                const percentage = maxWordCount > 0 ? Math.round((r.wordCount / maxWordCount) * 100) : 0;

                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className={`inline-flex items-center gap-1 ${isMax ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-gray-200'}`}>
                          {r.wordCount.toLocaleString()} words
                          {isMax && <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-normal">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isMax ? 'bg-emerald-500 shadow-sm' : 'bg-cyan-500/60'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Technical TTFB & Payload Size */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                TTFB & HTML Size
              </td>
              {validResults.map((r, idx) => {
                const tech = r.technicalAudit;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    {tech ? (
                      <div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">{tech.ttfbMs} ms TTFB</div>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400">{tech.htmlSizeKb} kB • {tech.domNodeCount} nodes</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500">N/A</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 3: Readability & Tone */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Readability & Tone
              </td>
              {validResults.map((r, idx) => {
                const read = r.readability;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    {read ? (
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {read.fleschReadingEase} Ease <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">({read.toneLabel})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{read.gradeLabel}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500">N/A</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 4: Headings Count (H2/H3) */}
            <tr className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
              <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Headings Count (H1-H6)
              </td>
              {validResults.map((r, idx) => {
                const h2Count = r.headings.filter((h) => h.level === 'h2').length;
                const h3Count = r.headings.filter((h) => h.level === 'h3').length;
                const isMax = r.headings.length === maxHeadings && maxHeadings > 0;
                return (
                  <td key={idx} className="py-3.5 px-4 font-mono">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded ${isMax ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-800 dark:text-gray-200'}`}>
                      {r.headings.length} Total ({h2Count} H2s, {h3Count} H3s)
                    </span>
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
