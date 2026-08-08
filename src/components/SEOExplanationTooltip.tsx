'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface SEOExplanationTooltipProps {
  text: string;
}

export const SEOExplanationTooltip: React.FC<SEOExplanationTooltipProps> = ({ text }) => {
  return (
    <div className="relative inline-flex items-center group cursor-pointer ml-1.5 align-middle">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shrink-0" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 w-60 sm:w-64 p-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-normal leading-relaxed shadow-xl border border-slate-700 pointer-events-none transition-all text-center">
        <span>{text}</span>
        <div className="w-2 h-2 -mb-1 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700"></div>
      </div>
    </div>
  );
};
