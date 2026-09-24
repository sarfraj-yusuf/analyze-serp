'use client';

import React from 'react';
import {
  Sparkles,
  Zap,
  Gauge,
  Layers,
  FileText,
  Activity,
  SlidersHorizontal,
  ChevronRight,
  Table,
} from 'lucide-react';

interface AuditSkeletonProps {
  urls?: string[];
  targetKeyword?: string;
}

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden rounded-lg bg-slate-200/80 dark:bg-white/[0.06] animate-shimmer ${className}`}
  />
);

export const AuditSkeleton: React.FC<AuditSkeletonProps> = () => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Sleek Minimalist Status Indicator */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Zap className="size-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
          <span>Benchmarking Competitor SERP Signals...</span>
        </div>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
          Extracting DOM, Core Web Vitals &amp; Keyword Gaps
        </span>
      </div>

      {/* 2. Workspace Control & Action Bar Shimmer */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-5 w-24 hidden md:block rounded-full" />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* 3. Hero Cockpit & Overall SERP Health Scorecard Shimmer */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
          {/* Target Domain Title & Meta Shimmer */}
          <div className="space-y-3 max-w-xl w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
            <Skeleton className="h-7 w-4/5 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
            </div>
          </div>

          {/* Overall Health Circular Dial Shimmer */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative size-20 sm:size-24 rounded-full border-4 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02] flex flex-col items-center justify-center animate-shimmer">
              <Skeleton className="h-6 w-10 rounded" />
              <Skeleton className="h-2.5 w-12 rounded mt-1.5" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>

        {/* 4-Stat Metric Cards Shimmer */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Word Count Depth', code: 'WORDS' },
            { label: 'Heading Hierarchy', code: 'H1-H6' },
            { label: 'Technical Health', code: 'HEALTH' },
            { label: 'Server Latency', code: 'TTFB' },
          ].map((stat) => (
            <div
              key={stat.code}
              className="p-4 rounded-xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="size-4 rounded" />
              </div>
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-2.5 w-28 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Gemini AI Strategic Summary Banner Shimmer */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/[0.03] to-purple-500/[0.03] space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-500 shrink-0">
              <Sparkles className="size-4 text-indigo-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-52 rounded-md" />
              <Skeleton className="h-3 w-72 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-7 w-28 rounded-lg hidden sm:block" />
        </div>

        {/* Priority Roadmap Fix Cards Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="p-4 rounded-xl border border-slate-200/70 dark:border-white/[0.08] bg-white dark:bg-slate-900/60 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <Skeleton className="h-4 w-44 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex justify-end">
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Side-by-Side Competitor SERP Comparison Matrix Shimmer */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-56 rounded-md" />
            <Skeleton className="h-3 w-80 rounded-md" />
          </div>
          <Skeleton className="h-8 w-32 rounded-xl hidden sm:block" />
        </div>

        {/* Matrix Table Columns Shimmer */}
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            {/* Table Header Row */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>

            {/* Table Metric Rows */}
            {[
              'Title Tag Optimization',
              'Meta Description & CTR Bait',
              'Word Count & Lexical Parity',
              'H1, H2, H3 Depth Hierarchy',
              'Core Web Vitals Pass Rate',
              'Schema Markup & Rich Snippets',
            ].map((label, idx) => (
              <div
                key={label}
                className={`grid grid-cols-4 gap-4 p-4 border-b border-slate-200/60 dark:border-white/[0.06] items-center ${
                  idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/40 dark:bg-white/[0.01]'
                }`}
              >
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-36 rounded" />
                  <Skeleton className="h-2.5 w-20 rounded" />
                </div>
                <Skeleton className="h-4 w-44 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Core Web Vitals Visual Gauges Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Time To First Byte', code: 'TTFB' },
          { label: 'First Contentful Paint', code: 'FCP' },
          { label: 'Largest Contentful Paint', code: 'LCP' },
          { label: 'Cumulative Layout Shift', code: 'CLS' },
        ].map((item) => (
          <div
            key={item.code}
            className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                  {item.code}
                </span>
                <Skeleton className="h-3.5 w-28 rounded" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>

            {/* Semicircular Gauge Shimmer */}
            <div className="flex items-center justify-center py-2">
              <div className="size-24 rounded-full border-4 border-slate-200 dark:border-white/10 border-t-emerald-500/40 animate-shimmer flex items-center justify-center">
                <Skeleton className="h-5 w-12 rounded" />
              </div>
            </div>

            <Skeleton className="h-3 w-3/4 mx-auto rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
