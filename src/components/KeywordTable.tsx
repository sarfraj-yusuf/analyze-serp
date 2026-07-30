import React, { useState } from 'react';
import { KeywordAnalysis, KeywordItem } from '@/types/seo';
import { Search, AlertTriangle, Hash, Percent } from 'lucide-react';

interface KeywordTableProps {
  keywords: KeywordAnalysis;
}

export const KeywordTable: React.FC<KeywordTableProps> = ({ keywords }) => {
  const [activeGram, setActiveGram] = useState<'one' | 'two' | 'three'>('one');
  const [searchTerm, setSearchTerm] = useState('');

  const currentList: KeywordItem[] =
    activeGram === 'one'
      ? keywords.oneGram
      : activeGram === 'two'
      ? keywords.twoGram
      : keywords.threeGram;

  const filteredList = currentList.filter((item) =>
    item.phrase.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stuffingCount = currentList.filter((item) => item.isStuffing).length;

  return (
    <div className="space-y-4">
      {/* Tab Selectors & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
        {/* Gram Tabs */}
        <div role="tablist" aria-label="N-Gram Keyword Filter" className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            role="tab"
            aria-selected={activeGram === 'one'}
            onClick={() => setActiveGram('one')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeGram === 'one'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10'
            }`}
          >
            1-Word (Core)
          </button>
          <button
            role="tab"
            aria-selected={activeGram === 'two'}
            onClick={() => setActiveGram('two')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeGram === 'two'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                : 'bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10'
            }`}
          >
            2-Words (Phrases)
          </button>
          <button
            role="tab"
            aria-selected={activeGram === 'three'}
            onClick={() => setActiveGram('three')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeGram === 'three'
                ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10'
            }`}
          >
            3-Words (Long-tail)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Filter keywords by phrase"
            placeholder="Filter keyword phrases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg glass-input text-xs focus:outline-none shadow-sm font-mono"
          />
        </div>
      </div>

      {/* Stuffing Alert Warning */}
      {stuffingCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Warning: <strong className="font-bold">{stuffingCount} terms</strong> exceed 3.0% density
            and may trigger search engine keyword stuffing flags.
          </span>
        </div>
      )}

      {/* Keyword Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080c14] shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Keyword Term</th>
              <th className="py-3 px-4 text-center">Frequency</th>
              <th className="py-3 px-4 text-right">Density (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-gray-200 font-mono">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400 dark:text-gray-500">
                  No matching keywords found for this selection.
                </td>
              </tr>
            ) : (
              filteredList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{item.phrase}</span>
                    {item.isStuffing && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/40 font-mono font-bold">
                        High Density
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-cyan-800 dark:text-cyan-300 font-bold">
                      <Hash className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      {item.count}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-bold ${
                        item.isStuffing
                          ? 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/40'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      <Percent className="w-3 h-3" />
                      {item.density}%
                    </span>
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
