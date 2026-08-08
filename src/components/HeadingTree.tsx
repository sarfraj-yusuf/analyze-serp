'use client';

import React, { useState } from 'react';
import { HeadingItem } from '@/types/seo';
import { ChevronDown, ChevronRight, ListOrdered, FileText } from 'lucide-react';

interface HeadingTreeProps {
  headings: HeadingItem[];
}

export const HeadingTree: React.FC<HeadingTreeProps> = ({ headings }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!headings || headings.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
        No H1-H6 headings detected on this web page.
      </div>
    );
  }

  const h1Count = headings.filter((h) => h.level === 'h1').length;
  const h2Count = headings.filter((h) => h.level === 'h2').length;
  const h3Count = headings.filter((h) => h.level === 'h3').length;

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Heading Structure Tree</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Total Headings: <span className="text-slate-900 dark:text-white font-bold">{headings.length}</span> (H1: {h1Count}, H2: {h2Count}, H3: {h3Count})
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-white/10 shadow-sm"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span>{isExpanded ? 'Collapse Tree' : 'Expand Tree'}</span>
        </button>
      </div>

      {/* Tree Content */}
      {isExpanded && (
        <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 max-h-96 overflow-y-auto font-mono text-xs shadow-inner">
          {headings.map((item, index) => {
            const indentClass =
              item.level === 'h1'
                ? 'ml-0 font-bold text-emerald-700 dark:text-emerald-400'
                : item.level === 'h2'
                ? 'ml-4 font-semibold text-cyan-700 dark:text-cyan-300'
                : item.level === 'h3'
                ? 'ml-8 text-slate-800 dark:text-gray-200'
                : item.level === 'h4'
                ? 'ml-12 text-slate-600 dark:text-gray-400'
                : 'ml-16 text-slate-500 dark:text-gray-500';

            const badgeBg =
              item.level === 'h1'
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-500/40'
                : item.level === 'h2'
                ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 border-cyan-500/40'
                : item.level === 'h3'
                ? 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-400 border-indigo-500/40'
                : 'bg-slate-200 dark:bg-gray-500/20 text-slate-700 dark:text-gray-400 border-slate-300 dark:border-gray-500/40';

            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 py-1.5 px-2 rounded hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all ${indentClass}`}
              >
                <span
                  className={`uppercase text-[10px] px-1.5 py-0.5 rounded border font-bold shrink-0 ${badgeBg}`}
                >
                  {item.level}
                </span>
                <span className="break-words line-clamp-2 text-slate-900 dark:text-gray-100">{item.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
