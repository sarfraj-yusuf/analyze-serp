import React from 'react';

export const KeywordGapSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4 animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-slate-200 dark:bg-white/10 rounded-md" />
          <div className="h-3 w-72 bg-slate-200 dark:bg-white/5 rounded-md" />
        </div>
        <div className="h-8 w-28 bg-slate-200 dark:bg-white/10 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="h-16 bg-slate-200 dark:bg-white/5 rounded-xl" />
        <div className="h-16 bg-slate-200 dark:bg-white/5 rounded-xl" />
        <div className="h-16 bg-slate-200 dark:bg-white/5 rounded-xl" />
      </div>

      <div className="space-y-2 pt-2">
        <div className="h-10 bg-slate-200 dark:bg-white/5 rounded-xl w-full" />
        <div className="h-10 bg-slate-200 dark:bg-white/5 rounded-xl w-full" />
        <div className="h-10 bg-slate-200 dark:bg-white/5 rounded-xl w-full" />
      </div>
    </div>
  );
};

export const ContentBriefSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-52 bg-slate-200 dark:bg-white/10 rounded-md" />
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-slate-200 dark:bg-white/10 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-white/10 rounded-xl" />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="h-20 bg-slate-200 dark:bg-white/5 rounded-xl" />
        <div className="h-28 bg-slate-200 dark:bg-white/5 rounded-xl" />
      </div>
    </div>
  );
};

export const ComparisonMatrixSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-60 bg-slate-200 dark:bg-white/10 rounded-md" />
        <div className="h-8 w-36 bg-slate-200 dark:bg-white/5 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl" />
        <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl" />
        <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl" />
        <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl" />
      </div>
    </div>
  );
};
