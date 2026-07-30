'use client';

import React from 'react';
import { MessageSquareHeart, Sparkles } from 'lucide-react';

interface FloatingFeedbackButtonProps {
  onOpenFeedback: () => void;
}

export const FloatingFeedbackButton: React.FC<FloatingFeedbackButtonProps> = ({ onOpenFeedback }) => {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={onOpenFeedback}
        className="glass-panel px-4 py-2.5 rounded-full border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-indigo-500/20 hover:from-emerald-500/30 hover:to-indigo-500/30 text-slate-900 dark:text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/10 transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
          <MessageSquareHeart className="w-3.5 h-3.5" />
        </div>
        <span>Review & Suggestion</span>
        <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
          Free
        </span>
      </button>
    </div>
  );
};
