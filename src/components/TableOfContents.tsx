'use client';

import React, { useState } from 'react';
import { TOCItem } from '@/lib/blog';
import { ListOrdered, ChevronDown, ChevronUp } from 'lucide-react';

interface TableOfContentsProps {
  toc: TOCItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ toc }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!toc || toc.length === 0) {
    return null;
  }

  return (
    <div className="my-8 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-lg space-y-3 not-prose">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-extrabold text-sm text-slate-900 dark:text-white cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ListOrdered className="w-4 h-4" />
          </div>
          <span>Table of Contents ({toc.length} Sections)</span>
        </div>

        <div className="text-slate-400 hover:text-emerald-500 transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <nav className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1.5 text-xs">
          {toc.map((item, idx) => (
            <a
              key={idx}
              href={`#${item.id}`}
              className={`block py-1.5 px-3 rounded-lg text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 font-medium transition-all ${
                item.level === 3 ? 'ml-4 text-[11px] text-slate-500 dark:text-gray-400' : ''
              }`}
            >
              <span className="text-emerald-500 font-bold mr-1.5">
                {item.level === 2 ? `•` : `-`}
              </span>
              {item.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
};
