'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, MessageSquare } from 'lucide-react';

interface ArticleFeedbackProps {
  slug: string;
}

export const ArticleFeedback: React.FC<ArticleFeedbackProps> = ({ slug }) => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  const handleVote = (vote: 'yes' | 'no') => {
    setFeedback(vote);
    try {
      localStorage.setItem(`article_feedback_${slug}`, vote);
    } catch {
      // fallback if storage disabled
    }
  };

  return (
    <div className="my-10 p-6 sm:p-7 rounded-3xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs not-prose">
      {feedback ? (
        <div className="flex items-center gap-3 text-sm text-slate-800 dark:text-slate-200">
          <div className="size-9 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="size-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">
              Thank you for your feedback!
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your feedback directly helps us refine and improve our technical SEO guides.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="size-3.5 text-emerald-500" />
              <span>Reader Feedback</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Was this guide actionable and helpful?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Let us know so we can keep our analysis blueprints sharp.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleVote('yes')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ThumbsUp className="size-3.5" />
              <span>Yes, helpful</span>
            </button>

            <button
              type="button"
              onClick={() => handleVote('no')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:border-rose-500/50 hover:bg-rose-500/5 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ThumbsDown className="size-3.5" />
              <span>Could be better</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
