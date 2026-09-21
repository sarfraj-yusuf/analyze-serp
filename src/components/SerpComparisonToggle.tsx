'use client';

import React, { useState } from 'react';
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Key,
  BookOpen,
  TrendingUp,
  Star,
  ArrowUp,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export function SerpComparisonToggle() {
  const [mode, setMode] = useState<'unoptimized' | 'optimized'>('optimized');

  const scrollToInput = () => {
    const el = document.getElementById('target-keyword-input');
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-label="Interactive SERP Optimization Simulator"
      className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] space-y-6"
    >
      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Sliders className="w-3 h-3" />
            <span>INTERACTIVE SIMULATOR</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            See the Difference: Empirical Benchmarking in Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Toggle below to compare an uncalibrated page against an AnalyzeSERP-optimized snippet.
          </p>
        </div>

        {/* Tactile Segmented Switch */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('unoptimized')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'unoptimized'
                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unoptimized</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('optimized')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'optimized'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>AnalyzeSERP Optimized</span>
          </button>
        </div>
      </div>

      {/* Main Comparison Area: Google Mock vs. Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Realistic Google SERP Mock (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
          <div className="space-y-3">
            {/* Google Search Mock Brand & Favicon */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                  AS
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-slate-800 dark:text-slate-200">
                    AnalyzeSERP Software
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {mode === 'optimized'
                      ? 'https://analyzeserp.com > tools > competitor-audit'
                      : 'https://example.com/blog/2026/01/post-final-v2-draft-review'}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  mode === 'optimized'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {mode === 'optimized' ? '548px · 100% Visible' : '642px · Truncated (84px overflow)'}
              </span>
            </div>

            {/* Google Result Title */}
            <div>
              <h3
                className={`text-base sm:text-lg font-medium leading-snug cursor-pointer hover:underline transition-colors ${
                  mode === 'optimized'
                    ? 'text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-blue-800/90 dark:text-blue-300'
                }`}
              >
                {mode === 'optimized'
                  ? 'Best Competitor SEO Analysis Tools (2026 Tested & Ranked)'
                  : 'Best Competitor SEO Analysis Tools for Remote Agencies and Marketing Teams in 2026: The Ultimate In-Depth Guide...'}
              </h3>
            </div>

            {/* Rich Schema Rating (Only on Optimized) */}
            {mode === 'optimized' && (
              <div className="flex items-center gap-2 text-xs text-amber-500 dark:text-amber-400 font-medium">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300">4.9</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  (128 verified audits) · Free beta access
                </span>
              </div>
            )}

            {/* Snippet Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {mode === 'optimized' ? (
                <>
                  Compare top 5 competitor URLs side-by-side in under 500ms. Extract exact{' '}
                  <strong className="text-slate-800 dark:text-slate-100 font-semibold">
                    n-gram keyword gaps
                  </strong>
                  , audit heading outlines, and export white-label PDF reports with zero tracking.
                </>
              ) : (
                <>
                  We analyzed many SEO tools to find which ones help you benchmark competitors. In this article, you will read about our team testing various platforms, looking at their features, their pros and cons, and whether you should buy them...
                </>
              )}
            </p>

            {/* Rich Sitelink Chips (Optimized Mode) */}
            {mode === 'optimized' && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                {['Live SERP Matrix', 'N-Gram Mining', 'Client PDF Briefs', 'Free Beta'].map((pill, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Diagnostic Takeaway */}
          <div
            className={`p-3 rounded-lg text-xs leading-relaxed border ${
              mode === 'optimized'
                ? 'bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                : 'bg-rose-500/5 text-rose-800 dark:text-rose-300 border-rose-500/20'
            }`}
          >
            {mode === 'optimized' ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Full Intent Parity:</strong> Title stays under Google's 600px ceiling, zero ellipses truncation, and rich snippet review stars elevate CTR.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  <strong>Truncation Warning:</strong> Title is cut off midway at 642px. Missing high-volume competitor n-grams lowers topical authority score.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Comparative Telemetry Scorecard (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-6 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Live Diagnostic Telemetry
            </span>

            {/* Metric 1: Server Speed */}
            <div className="p-3 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center border ${
                    mode === 'optimized'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Server Response (TTFB)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {mode === 'optimized' ? 'Edge-cached HTML' : 'Origin server overhead'}
                  </div>
                </div>
              </div>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  mode === 'optimized'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                }`}
              >
                {mode === 'optimized' ? '340ms' : '1.84s'}
              </span>
            </div>

            {/* Metric 2: Keyword Voids */}
            <div className="p-3 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center border ${
                    mode === 'optimized'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    N-Gram Keyword Voids
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {mode === 'optimized' ? '100% intent alignment' : 'Critical competitor voids'}
                  </div>
                </div>
              </div>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  mode === 'optimized'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                }`}
              >
                {mode === 'optimized' ? '0 Voids' : '8 Voids'}
              </span>
            </div>

            {/* Metric 3: Heading Outline */}
            <div className="p-3 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center border ${
                    mode === 'optimized'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Heading Outline (DOM)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {mode === 'optimized' ? 'Single H1 + nested H2/H3' : '2x H1 tags + skip levels'}
                  </div>
                </div>
              </div>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  mode === 'optimized'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                }`}
              >
                {mode === 'optimized' ? 'Valid' : 'Flawed'}
              </span>
            </div>

            {/* Metric 4: Predicted CTR Impact */}
            <div className="p-3 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center border ${
                    mode === 'optimized'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Predicted Organic CTR
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {mode === 'optimized' ? 'Based on SERP test data' : 'Estimated baseline CTR'}
                  </div>
                </div>
              </div>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  mode === 'optimized'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                }`}
              >
                {mode === 'optimized' ? '+28.4% Lift' : '~1.4% CTR'}
              </span>
            </div>
          </div>

          {/* Quick Action Button: Scrolls to auditor */}
          <button
            type="button"
            onClick={scrollToInput}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <span>Test Your URLs in the Auditor Above</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
