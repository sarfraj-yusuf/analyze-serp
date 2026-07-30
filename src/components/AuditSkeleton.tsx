import React from 'react';
import { Zap } from 'lucide-react';

export const AuditSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Loading Status Indicator */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Analyzing Competitor DOM & Parsing SERP...</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">Fetching title tags, heading trees, word counts, and N-gram keyword densities</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          Fast Non-AI Engine
        </span>
      </div>

      {/* Side-by-Side Comparison Matrix Skeleton */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
        <div className="h-6 w-56 bg-slate-200 dark:bg-white/10 rounded-md" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* Single Audit Card Skeleton */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-7 w-96 bg-slate-200 dark:bg-white/10 rounded-md" />
          </div>
          <div className="h-10 w-44 bg-slate-200 dark:bg-white/10 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-20 bg-slate-200 dark:bg-white/5 rounded-xl" />
          <div className="h-20 bg-slate-200 dark:bg-white/5 rounded-xl" />
        </div>

        {/* Tab Buttons Skeleton */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="h-9 w-32 bg-slate-200 dark:bg-white/10 rounded-xl" />
          <div className="h-9 w-36 bg-slate-200 dark:bg-white/5 rounded-xl" />
          <div className="h-9 w-36 bg-slate-200 dark:bg-white/5 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-white/5 rounded-xl" />
        </div>

        {/* Content Box Skeleton */}
        <div className="h-48 bg-slate-200 dark:bg-white/5 rounded-xl" />
      </div>
    </div>
  );
};
