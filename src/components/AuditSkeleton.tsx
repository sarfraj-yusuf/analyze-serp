'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AuditSkeletonProps {
  urls?: string[];
  targetKeyword?: string;
}

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden rounded-lg bg-slate-200/80 dark:bg-white/[0.06] animate-shimmer ${className}`}
  />
);

export const AuditSkeleton: React.FC<AuditSkeletonProps> = ({ urls = [], targetKeyword }) => {
  const validUrlCount = urls.filter((u) => u && u.trim()).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" aria-busy="true">
      {/* 1. Minimalist Status Indicator */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.08]"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
          <RefreshCw className="size-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
          <span>
            {validUrlCount > 0
              ? `Checking ${validUrlCount} ${validUrlCount === 1 ? 'page' : 'pages'}...`
              : 'Checking pages...'}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
          {targetKeyword ? `Checking "${targetKeyword}" • ` : ''}Reading headings, keywords, and page health
        </span>
      </div>

      {/* 2. Cockpit Shimmer */}
      <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-36 rounded-md hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-7 space-y-3">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-3.5 w-1/2 rounded" />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-7 w-36 rounded-lg" />
              <Skeleton className="h-7 w-32 rounded-lg" />
            </div>
          </div>

          <div className="lg:col-span-5 lg:border-l lg:border-slate-100 dark:lg:border-white/5 lg:pl-6 space-y-3">
            <div className="flex items-center gap-3.5">
              <Skeleton className="size-16 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-32 rounded" />
          </div>
        </div>
      </div>

      {/* 3. Tabs Bar Shimmer */}
      <div className="p-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-white/[0.06] flex items-center gap-1.5">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg hidden sm:block" />
        <Skeleton className="h-8 w-28 rounded-lg hidden sm:block" />
      </div>

      {/* 4. At a Glance 3-Stat Card Shimmer */}
      <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs space-y-4">
        <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
              <Skeleton className="h-3 w-44 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Action List Shimmer */}
      <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs space-y-3">
        <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-3 w-72 rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-50/40 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] space-y-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
            <Skeleton className="h-3 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
