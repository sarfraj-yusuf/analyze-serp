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
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Gauge className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Google <span className="gradient-text">Core Web Vitals Dashboard</span>
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
          <div className="text-sm font-bold text-slate-900 dark:text-white">
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
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-5">
              {/* Glowing Gauge Ring */}
              <div
                className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-lg transition-all ${scoreColor}`}
              >
                <span className="text-2xl font-black">{score}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
                  / 100
                </span>
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
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
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
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                <span>Re-Audit Speed</span>
              </button>
            </div>
          </div>

          {/* 4 Core Web Vitals Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. LCP Card */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>LCP (Largest Content)</span>
                  <SEOExplanationTooltip text="Largest Contentful Paint: Measures how long it takes for the main content image or text block to load. Good: <= 2.5s" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
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

              {/* Threshold Meter */}
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.lcp.category === 'FAST'
                      ? 'bg-emerald-500'
                      : data.lcp.category === 'AVERAGE'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (data.lcp.value / 4.0) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-gray-400">Target: &lt;= 2.5 seconds</div>
            </div>

            {/* 2. INP Card */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                  <MousePointerClick className="w-4 h-4 text-cyan-500" />
                  <span>INP (Responsiveness)</span>
                  <SEOExplanationTooltip text="Interaction to Next Paint: Measures user click, tap, and keyboard response latency. Good: <= 200ms" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
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

              {/* Threshold Meter */}
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.inp.category === 'FAST'
                      ? 'bg-emerald-500'
                      : data.inp.category === 'AVERAGE'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (data.inp.value / 500) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-gray-400">Target: &lt;= 200 ms</div>
            </div>

            {/* 3. CLS Card */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                  <Layout className="w-4 h-4 text-indigo-500" />
                  <span>CLS (Layout Shift)</span>
                  <SEOExplanationTooltip text="Cumulative Layout Shift: Measures visual stability of elements during page load. Good: <= 0.10" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
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

              {/* Threshold Meter */}
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.cls.category === 'FAST'
                      ? 'bg-emerald-500'
                      : data.cls.category === 'AVERAGE'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (data.cls.value / 0.25) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-gray-400">Target: &lt;= 0.10</div>
            </div>

            {/* 4. FCP Card */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>FCP (First Render)</span>
                  <SEOExplanationTooltip text="First Contentful Paint: Time taken to render the first DOM text or image element. Good: <= 1.8s" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
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

              {/* Threshold Meter */}
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.fcp.category === 'FAST'
                      ? 'bg-emerald-500'
                      : data.fcp.category === 'AVERAGE'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (data.fcp.value / 3.0) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-gray-400">Target: &lt;= 1.8 seconds</div>
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
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between gap-2">
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
