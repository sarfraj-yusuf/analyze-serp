'use client';

import React, { useState } from 'react';
import { SinglePageAudit } from '@/types/seo';
import { analyzeKeywordGaps } from '@/lib/keyword-gap';
import {
  Target,
  Copy,
  Check,
  Sparkles,
  Filter,
  AlertTriangle,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';

interface KeywordGapMatrixProps {
  results: SinglePageAudit[];
}

export const KeywordGapMatrix: React.FC<KeywordGapMatrixProps> = ({ results }) => {
  const validResults = results.filter((r) => r.status === 'success');
  const [targetUrl, setTargetUrl] = useState<string>(validResults[0]?.url || '');
  const [activeTab, setActiveTab] = useState<'yourGaps' | 'allGaps' | 'common' | 'all'>('yourGaps');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (validResults.length < 2) return null;

  const currentTargetUrl = targetUrl || validResults[0].url;
  const gapAnalysis = analyzeKeywordGaps(validResults, currentTargetUrl);
  const {
    totalUniqueKeywords,
    yourPageMissingGaps = [],
    commonCoreKeywords,
    keywordGaps,
    allItems,
  } = gapAnalysis;

  const currentList =
    activeTab === 'yourGaps'
      ? yourPageMissingGaps
      : activeTab === 'common'
      ? commonCoreKeywords
      : activeTab === 'allGaps'
      ? keywordGaps
      : allItems;

  const filteredList = currentList.filter((item) =>
    item.phrase.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyGaps = () => {
    const listToCopy = activeTab === 'yourGaps' ? yourPageMissingGaps : keywordGaps;
    const gapWords = listToCopy.map((item) => item.phrase).join('\n');
    navigator.clipboard.writeText(gapWords);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm my-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
              Target Page vs Competitors Gap Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Keyword Gap & Topic Overlap Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Comparing{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {new URL(currentTargetUrl).hostname} (Your Page)
            </span>{' '}
            against{' '}
            <span className="text-slate-800 dark:text-slate-100 font-bold">
              {validResults.length - 1} competitor URLs
            </span>.
          </p>
        </div>

        <button
          onClick={handleCopyGaps}
          aria-label="Copy missing keywords"
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-slate-700/60 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{copied ? 'Copied Gap Keywords!' : 'Copy Missing Keywords'}</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-gray-400 font-bold flex items-center gap-1">
              Gaps Missing on Your Page
              <SEOExplanationTooltip text="Keywords competitors use frequently that your target page has 0% or low density." />
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-0.5 tabular-nums">
              {yourPageMissingGaps.length} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">Terms</span>
            </div>
          </div>
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-gray-400 font-semibold">
              Shared Common Core Topics
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
              {commonCoreKeywords.length} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">Terms</span>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-gray-400 font-semibold">
              Total Discovered Terms
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 tabular-nums">
              {totalUniqueKeywords} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">Terms</span>
            </div>
          </div>
          <Layers className="w-5 h-5 text-slate-400 dark:text-gray-500 shrink-0" />
        </div>
      </div>

      {/* Segmented Control Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('yourGaps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'yourGaps'
                ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-slate-100 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            Missing on Your Page ({yourPageMissingGaps.length})
          </button>

          <button
            onClick={() => setActiveTab('common')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'common'
                ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-slate-100 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            Common Core ({commonCoreKeywords.length})
          </button>

          <button
            onClick={() => setActiveTab('allGaps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'allGaps'
                ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-slate-100 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            All Competitor Gaps ({keywordGaps.length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-slate-100 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            All Terms ({allItems.length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-1.5 rounded-xl text-xs glass-input focus:outline-none shadow-xs"
        />
      </div>

      {/* Cross-Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 max-h-96 overflow-y-auto shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 backdrop-blur-md z-10">
              <th scope="col" className="py-3 px-4">Keyword Term</th>
              <th scope="col" className="py-3 px-4 text-center">Type</th>
              {validResults.map((r, idx) => {
                const isTarget = r.url === currentTargetUrl;
                const hostname = new URL(r.url).hostname;
                return (
                  <th
                    key={idx}
                    scope="col"
                    className="py-2 px-2 text-center min-w-[130px]"
                  >
                    <button
                      type="button"
                      onClick={() => setTargetUrl(r.url)}
                      aria-label={`Set ${hostname} as Your Target Page`}
                      aria-pressed={isTarget}
                      title={`Click to set ${hostname} as Your Target Page`}
                      className={`w-full h-full py-1.5 px-2 rounded-lg flex flex-col items-center gap-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isTarget
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          isTarget
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {isTarget ? 'YOUR PAGE' : `COMPETITOR #${idx}`}
                      </span>
                      <div className="truncate max-w-[120px] text-slate-800 dark:text-slate-100 font-bold text-[11px] mt-0.5">
                        {hostname}
                      </div>
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="py-3 px-4 text-center">Your Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200 font-mono">
            {filteredList.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + validResults.length}
                  className="py-8 text-center text-slate-400 dark:text-slate-500 font-sans text-xs"
                >
                  No matching keywords found for this filter selection.
                </td>
              </tr>
            ) : (
              filteredList.slice(0, 50).map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-800 dark:text-slate-100 max-w-xs truncate">
                    {item.phrase}
                  </td>

                  <td className="py-2.5 px-4 text-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {item.nGramType}
                  </td>

                  {validResults.map((r, rIdx) => {
                    const data = item.presenceMap[r.url];
                    const density = data ? data.density : 0;
                    const isTarget = r.url === currentTargetUrl;

                    return (
                      <td
                        key={rIdx}
                        className={`py-2.5 px-4 text-center ${
                          isTarget ? 'bg-emerald-500/[0.02]' : ''
                        }`}
                      >
                        {density > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`font-mono text-xs ${
                                isTarget
                                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                  : 'text-slate-700 dark:text-slate-300 font-medium'
                              }`}
                            >
                              {density}%
                            </span>
                            <div className="w-12 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${isTarget ? 'bg-emerald-500' : 'bg-cyan-500'} rounded-full transition-all duration-300`}
                                style={{ width: `${Math.min(100, Math.round((density / Math.max(item.maxDensity || 1, 0.1)) * 100))}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">
                            0%
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-2.5 px-4 text-center font-sans">
                    {item.isTargetPageMissing ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        Missing
                      </span>
                    ) : item.isTargetPageUnderOptimized ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        Low Density
                      </span>
                    ) : item.isCommonCore ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Covered
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        • OK
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
