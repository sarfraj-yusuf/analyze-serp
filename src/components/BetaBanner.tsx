'use client';

import React from 'react';
import { Sparkles, MessageSquareHeart } from 'lucide-react';

interface BetaBannerProps {
  onOpenFeedback: () => void;
}

export const BetaBanner: React.FC<BetaBannerProps> = ({ onOpenFeedback }) => {
  return (
    <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white py-2 px-4 shadow-md text-xs relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 font-medium tracking-tight">
          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md font-bold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" /> Public Beta
          </span>
          <span>
            <strong>AnalyzeSERP Pro (Valued at $19/month) is 100% FREE during Public Beta!</strong>
          </span>
        </div>

        <button
          onClick={onOpenFeedback}
          className="bg-white text-slate-900 hover:bg-emerald-50 px-3 py-1 rounded-full font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-600" />
          <span>Give Feedback & Suggestions</span>
        </button>
      </div>
    </div>
  );
};
