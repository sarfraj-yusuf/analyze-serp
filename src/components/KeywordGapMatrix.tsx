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
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl my-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              Target Page vs Competitors Gap Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Keyword Gap & <span className="gradient-text">Topic Overlap Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Comparing{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold underline">
              {new URL(currentTargetUrl).hostname} (Your Page)
            </span>{' '}
            against{' '}
            <span className="text-slate-900 dark:text-white font-bold">
              {validResults.length - 1} competitor URLs
            </span>.
          </p>
        </div>

        <button
          onClick={handleCopyGaps}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20 shrink-0"
        >
          {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Gap Keywords!' : 'Copy Missing Keywords for Content Brief'}</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
              Gaps Missing on Your Page
              <SEOExplanationTooltip text="Keywords competitors use frequently that your target page has 0% or low density." />
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-0.5">
              {yourPageMissingGaps.length} Terms
            </div>
          </div>
          <AlertTriangle className="w-7 h-7 text-red-500 shrink-0" />
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-gray-400 font-semibold">
              Shared Common Core Topics
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {commonCoreKeywords.length} Terms
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-gray-400 font-semibold">
              Total Discovered Terms
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalUniqueKeywords} Terms
            </div>
          </div>
          <Layers className="w-6 h-6 text-slate-400 dark:text-gray-500 shrink-0" />
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('yourGaps')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'yourGaps'
                ? 'bg-red-600 text-white font-extrabold shadow-md shadow-red-600/20'
                : 'bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Missing on Your Page ({yourPageMissingGaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('common')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'common'
                ? 'bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Common Core Topics ({commonCoreKeywords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('allGaps')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'allGaps'
                ? 'bg-amber-600 text-white font-extrabold shadow-md shadow-amber-600/20'
                : 'bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Competitor Gaps ({keywordGaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-600 text-white font-extrabold shadow-md shadow-cyan-600/20'
                : 'bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Discovered ({allItems.length})</span>
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2 rounded-xl text-xs glass-input focus:outline-none shadow-sm"
        />
      </div>

      {/* Cross-Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080c14] max-h-96 overflow-y-auto shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
              <th className="py-3 px-4">Keyword Term</th>
              <th className="py-3 px-4 text-center">Type</th>
              {validResults.map((r, idx) => {
                const isTarget = r.url === currentTargetUrl;
                return (
                  <th
                    key={idx}
                    className={`py-3 px-4 text-center min-w-[140px] cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${
                      isTarget ? 'bg-emerald-500/10 border-x border-emerald-500/30' : ''
                    }`}
                    onClick={() => setTargetUrl(r.url)}
                    title="Click to set as Your Target Page"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          isTarget
                            ? 'bg-emerald-500 text-black shadow-sm'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300'
                        }`}
                      >
                        {isTarget ? 'YOUR PAGE' : `COMPETITOR #${idx}`}
                      </span>
                      <div className="truncate max-w-[130px] text-slate-900 dark:text-white font-bold text-[11px] mt-0.5">
                        {new URL(r.url).hostname}
                      </div>
                    </div>
                  </th>
                );
              })}
              <th className="py-3 px-4 text-center">Your Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-gray-200 font-mono">
            {filteredList.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + validResults.length}
                  className="py-8 text-center text-slate-400 dark:text-gray-500"
                >
                  No matching keywords found for this filter selection.
                </td>
              </tr>
            ) : (
              filteredList.slice(0, 50).map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all"
                >
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-white max-w-xs truncate">
                    {item.phrase}
                  </td>

                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-gray-300 font-bold">
                      {item.nGramType}
                    </span>
                  </td>

                  {validResults.map((r, rIdx) => {
                    const data = item.presenceMap[r.url];
                    const density = data ? data.density : 0;
                    const isTarget = r.url === currentTargetUrl;

                    return (
                      <td
                        key={rIdx}
                        className={`py-2.5 px-4 text-center ${
                          isTarget ? 'bg-emerald-500/5 border-x border-emerald-500/20' : ''
                        }`}
                      >
                        {density > 0 ? (
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-bold ${
                              isTarget
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-gray-200'
                            }`}
                          >
                            {density}%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold">
                            0%
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-2.5 px-4 text-center">
                    {item.isTargetPageMissing ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase">
                        MISSING ON YOUR PAGE
                      </span>
                    ) : item.isTargetPageUnderOptimized ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                        UNDER-OPTIMIZED
                      </span>
                    ) : item.isCommonCore ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                        COVERED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 text-[10px] font-semibold">
                        OK
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
