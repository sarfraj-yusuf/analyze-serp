'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquareHeart, X } from 'lucide-react';

interface BetaBannerProps {
  onOpenFeedback: () => void;
}

export const BetaBanner: React.FC<BetaBannerProps> = ({ onOpenFeedback }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Clear old permanent localStorage if present so revisit shows banner
    localStorage.removeItem('beta_banner_dismissed');

    if (sessionStorage.getItem('beta_banner_dismissed') === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (isDismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white py-2 px-4 shadow-md text-xs relative z-50 animate-in fade-in">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left pr-6 sm:pr-0">
        <div className="flex items-center justify-center gap-2 font-medium tracking-tight">
          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md font-bold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" /> Public Beta
          </span>
          <span>
            <strong>AnalyzeSERP Pro (Valued at $19/month) is 100% FREE during Public Beta!</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFeedback}
            className="bg-white text-slate-900 hover:bg-emerald-50 px-3 py-1 rounded-full font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Give Feedback & Suggestions</span>
          </button>

          <button
            onClick={() => {
              setIsDismissed(true);
              sessionStorage.setItem('beta_banner_dismissed', 'true');
            }}
            className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all cursor-pointer"
            title="Close banner"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
