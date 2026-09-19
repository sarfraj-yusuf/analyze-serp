'use client';

import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface FloatingFeedbackButtonProps {
  onOpenFeedback: () => void;
}

export const FloatingFeedbackButton: React.FC<FloatingFeedbackButtonProps> = ({ onOpenFeedback }) => {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={onOpenFeedback}
        aria-label="Open feedback and suggestions dialog"
        className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-850 border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 shadow-lg shadow-slate-950/5 dark:shadow-black/40 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer text-xs font-medium active:scale-95"
      >
        <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors shrink-0">
          <MessageSquarePlus className="w-3 h-3" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>
        <span className="font-semibold tracking-tight">Feedback &amp; Ideas</span>
      </button>
    </div>
  );
};

