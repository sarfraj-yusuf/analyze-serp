import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 transition-colors duration-200">
      {/* Top Navbar Skeleton Bar */}
      <div className="h-16 border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse" />
          <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded-md animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded-md animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-pulse">
        {/* Hero / Page Header Skeleton */}
        <div className="space-y-3 max-w-2xl">
          <div className="h-4 w-28 bg-emerald-500/20 rounded-md" />
          <div className="h-8 sm:h-10 w-3/4 bg-slate-200 dark:bg-white/10 rounded-xl" />
          <div className="h-4 w-full bg-slate-200 dark:bg-white/5 rounded-md" />
          <div className="h-4 w-2/3 bg-slate-200 dark:bg-white/5 rounded-md" />
        </div>

        {/* Input Dock Skeleton */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
          <div className="h-4 w-40 bg-slate-200 dark:bg-white/10 rounded-md" />
          <div className="h-12 w-full bg-slate-200 dark:bg-white/5 rounded-xl" />
        </div>

        {/* Content Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-20 bg-slate-200 dark:bg-white/5 rounded-xl" />
            <div className="h-10 bg-slate-200 dark:bg-white/5 rounded-xl" />
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-20 bg-slate-200 dark:bg-white/5 rounded-xl" />
            <div className="h-10 bg-slate-200 dark:bg-white/5 rounded-xl" />
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-20 bg-slate-200 dark:bg-white/5 rounded-xl" />
            <div className="h-10 bg-slate-200 dark:bg-white/5 rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
