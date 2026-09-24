'use client';

import React, { useState, useEffect } from 'react';
import { CoreWebVitalsData } from '@/lib/pagespeed';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';
import {
  Zap,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sparkles,
  Gauge,
  Clock,
  Layout,
  MousePointerClick,
  Activity,
  Check,
} from 'lucide-react';

interface CoreWebVitalsCardProps {
  initialUrl: string;
}

export const CoreWebVitalsCard: React.FC<CoreWebVitalsCardProps> = ({ initialUrl }) => {
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile');
  const [data, setData] = useState<CoreWebVitalsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpeedData = async (url: string, strat: 'mobile' | 'desktop') => {
    if (!url) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pagespeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, strategy: strat }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch Google PageSpeed data');
      }

      const json: CoreWebVitalsData = await res.json();
      setData(json);
    } catch (err: any) {
      setError('Unable to fetch live Google PageSpeed metrics for this URL.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialUrl) {
      fetchSpeedData(initialUrl, strategy);
    }
  }, [initialUrl, strategy]);

  if (!initialUrl) return null;

  const score = data?.performanceScore || 0;

  // Grade color styling matching theme
  const scoreColor =
    score >= 90
      ? 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/20'
      : score >= 50
      ? 'text-amber-500 border-amber-500/40 bg-amber-500/10 shadow-amber-500/20'
      : 'text-rose-500 border-rose-500/40 bg-rose-500/10 shadow-rose-500/20';

  const scoreBadge =
    score >= 90
      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
      : score >= 50
      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40';

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl my-8 space-y-6">
      {/* Header & Strategy Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              Official Google PageSpeed & CrUX Field Data
            </span>
            {data?.isCached && (
              <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-400">
                Cached (1 hr)
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Gauge className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Google Core Web Vitals Dashboard</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Real-user field performance metrics & Lighthouse score powered by Google PageSpeed API.
          </p>
        </div>

        {/* Mobile vs Desktop Strategy Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
          <button
            onClick={() => setStrategy('mobile')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              strategy === 'mobile'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>

          <button
            onClick={() => setStrategy('desktop')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              strategy === 'desktop'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Running Live Google PageSpeed Audit ({strategy.toUpperCase()})...
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm">
            Fetching Lighthouse lab data & CrUX field metrics from Google servers.
          </p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchSpeedData(initialUrl, strategy)}
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 font-bold transition-all"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top Score Banner with Circular SVG Gauge Ring */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="flex items-center gap-5">
              {/* Circular SVG Gauge Ring */}
              <div className="relative size-22 sm:size-24 flex items-center justify-center shrink-0">
                <svg className="size-22 sm:size-24 -rotate-90">
                  <circle
                    cx="44"
                    cy="44"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="5.5"
                    className="text-slate-200 dark:text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="44"
                    cy="44"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="5.5"
                    className={
                      score >= 90
                        ? 'text-emerald-500'
                        : score >= 50
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }
                    strokeDasharray="226.19"
                    strokeDashoffset={226.19 - (226.19 * Math.min(100, Math.max(0, score))) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className={`text-2xl font-bold font-mono tracking-tight ${
                      score >= 90
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : score >= 50
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {score}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                    / 100
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${scoreBadge}`}
                  >
                    {score >= 90
                      ? 'Fast Performance'
                      : score >= 50
                      ? 'Needs Optimization'
                      : 'Slow Performance'}
                  </span>
                </div>
                <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
                  <span>Lighthouse Score ({strategy})</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Overall speed score calculated from Core Web Vitals loading metrics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => fetchSpeedData(initialUrl, strategy)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                <span>Re-Audit Speed</span>
              </button>
            </div>
          </div>

          {/* 4 Core Web Vitals Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. LCP Card */}
            <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>LCP (Largest Content)</span>
                  <SEOExplanationTooltip text="Largest Contentful Paint: Measures how long it takes for the main content image or text block to load. Good: <= 2.5s" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                  {data.lcp.displayValue}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    data.lcp.category === 'FAST'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : data.lcp.category === 'AVERAGE'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {data.lcp.category === 'FAST' ? 'Good' : data.lcp.category === 'AVERAGE' ? 'Needs Work' : 'Poor'}
                </span>
              </div>

              {/* 3-Zone Visual Gauge Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[62.5%]" title="Good (<=2.5s)" />
                  <div className="h-full bg-amber-500 w-[37.5%]" title="Needs Work (2.5s - 4.0s)" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span>0s</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">2.5s (Good)</span>
                  <span>4.0s (Poor)</span>
                </div>
              </div>
            </div>

            {/* 2. INP Card */}
            <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                  <MousePointerClick className="w-4 h-4 text-cyan-500" />
                  <span>INP (Responsiveness)</span>
                  <SEOExplanationTooltip text="Interaction to Next Paint: Measures user click, tap, and keyboard response latency. Good: <= 200ms" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                  {data.inp.displayValue}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    data.inp.category === 'FAST'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : data.inp.category === 'AVERAGE'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {data.inp.category === 'FAST' ? 'Good' : data.inp.category === 'AVERAGE' ? 'Needs Work' : 'Poor'}
                </span>
              </div>

              {/* 3-Zone Visual Gauge Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[40%]" title="Good (<=200ms)" />
                  <div className="h-full bg-amber-500 w-[60%]" title="Needs Work (200ms - 500ms)" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span>0ms</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">200ms (Good)</span>
                  <span>500ms (Poor)</span>
                </div>
              </div>
            </div>

            {/* 3. CLS Card */}
            <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                  <Layout className="w-4 h-4 text-indigo-500" />
                  <span>CLS (Layout Shift)</span>
                  <SEOExplanationTooltip text="Cumulative Layout Shift: Measures visual stability of elements during page load. Good: <= 0.10" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                  {data.cls.displayValue}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    data.cls.category === 'FAST'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : data.cls.category === 'AVERAGE'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {data.cls.category === 'FAST' ? 'Good' : data.cls.category === 'AVERAGE' ? 'Needs Work' : 'Poor'}
                </span>
              </div>

              {/* 3-Zone Visual Gauge Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[40%]" title="Good (<=0.10)" />
                  <div className="h-full bg-amber-500 w-[60%]" title="Needs Work (0.10 - 0.25)" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span>0.0</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">0.10 (Good)</span>
                  <span>0.25 (Poor)</span>
                </div>
              </div>
            </div>

            {/* 4. FCP Card */}
            <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>FCP (First Render)</span>
                  <SEOExplanationTooltip text="First Contentful Paint: Time taken to render the first DOM text or image element. Good: <= 1.8s" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                  {data.fcp.displayValue}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    data.fcp.category === 'FAST'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : data.fcp.category === 'AVERAGE'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {data.fcp.category === 'FAST' ? 'Good' : data.fcp.category === 'AVERAGE' ? 'Needs Work' : 'Poor'}
                </span>
              </div>

              {/* 3-Zone Visual Gauge Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[60%]" title="Good (<=1.8s)" />
                  <div className="h-full bg-amber-500 w-[40%]" title="Needs Work (1.8s - 3.0s)" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span>0s</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">1.8s (Good)</span>
                  <span>3.0s (Poor)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Speed Diagnostics Checklist */}
          {data.opportunities.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Speed Optimization Opportunities ({data.opportunities.length} Items)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.opportunities.map((op, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm hover:border-slate-300 dark:hover:border-white/10 transition-all flex items-start gap-3"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2">
                        <span>{op.title}</span>
                        {op.displayValue && (
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                            {op.displayValue}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                        {op.description.replace(/\[Learn more\]\(.*?\)\.?/g, '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
