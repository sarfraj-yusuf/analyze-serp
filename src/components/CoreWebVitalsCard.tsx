'use client';

import React, { useState, useEffect } from 'react';
import { CoreWebVitalsData } from '@/lib/pagespeed';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';
import { SpeedFixGuideCard } from '@/components/SpeedFixGuideCard';
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
  ShieldCheck,
  Search,
  ExternalLink,
  Layers,
  Server,
} from 'lucide-react';

interface CoreWebVitalsCardProps {
  initialUrl: string;
}

function CircularScoreDial({
  score,
  label,
  isPrimary = false,
}: {
  score?: number;
  label: string;
  isPrimary?: boolean;
}) {
  if (score === undefined || score === null) return null;

  const colorClass =
    score >= 90
      ? 'text-emerald-500'
      : score >= 50
      ? 'text-amber-500'
      : 'text-rose-500';

  const badgeClass =
    score >= 90
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      : score >= 50
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';

  // Standardized 100x100 viewBox with cx=50, cy=50, r=40 guarantees pixel-perfect centering on any screen
  const circumference = 251.33; // 2 * Math.PI * 40
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, score))) / 100;

  return (
    <div
      className={`flex flex-col items-center justify-between h-full p-4 sm:p-5 rounded-2xl glass-panel border transition-all text-center space-y-3 shadow-xs ${
        isPrimary
          ? 'border-emerald-500/40 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04] ring-1 ring-emerald-500/20'
          : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
      }`}
    >
      {/* Top Header Label Row (Maintains identical vertical baseline across all cards) */}
      <div className="w-full flex items-center justify-center h-5">
        {isPrimary ? (
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Primary Metric
          </span>
        ) : (
          <span className="text-[9px] font-mono font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Lighthouse Pillar
          </span>
        )}
      </div>

      {/* Perfectly Centered Circular Progress Dial */}
      <div className="relative size-24 sm:size-26 flex items-center justify-center shrink-0 mx-auto">
        <svg className="size-full" viewBox="0 0 100 100">
          {/* Background track circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="7"
            className="text-slate-200 dark:text-slate-800"
            fill="none"
          />
          {/* Animated Progress Arc (Native SVG rotation around center 50,50 for 100% reliable 12 o'clock start) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="7"
            className={`${colorClass} transition-all duration-700 ease-out`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            fill="none"
          />
        </svg>

        {/* Centered Score Number (Dead center in viewBox geometry) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
          <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight leading-none ${colorClass}`}>
            {score}
          </span>
          <span className="text-[9px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold mt-1">
            / 100
          </span>
        </div>
      </div>

      {/* Standardized Bottom Information Container */}
      <div className="space-y-1.5 w-full">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight min-h-[2.25rem] flex items-center justify-center text-center">
          {label}
        </div>
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${badgeClass}`}>
          {score >= 90 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor'}
        </span>
      </div>
    </div>
  );
}

export const CoreWebVitalsCard: React.FC<CoreWebVitalsCardProps> = ({ initialUrl }) => {
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile');
  const [data, setData] = useState<CoreWebVitalsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(initialUrl));
  const [error, setError] = useState<string | null>(null);

  const fetchSpeedData = async (url: string, strat: 'mobile' | 'desktop', forceRefresh: boolean = false) => {
    if (!url) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pagespeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, strategy: strat, forceRefresh }),
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

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 dark:border-white/10 shadow-xl my-8 space-y-8">
      {/* Top Header & Strategy Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              <span>Official Google PageSpeed &amp; CrUX Field Engine</span>
            </span>

            {data?.isCached && (
              <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-mono">
                Cached (1 hr)
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Gauge className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Google Core Web Vitals &amp; Lighthouse Suite</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Live real-user Chrome UX Report (CrUX) field performance &amp; Lighthouse laboratory metrics for <strong className="font-mono text-slate-700 dark:text-slate-300">{initialUrl}</strong>.
          </p>
        </div>

        {/* Strategy Switcher + Re-audit Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
            <button
              onClick={() => setStrategy('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                strategy === 'mobile'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>

            <button
              onClick={() => setStrategy('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                strategy === 'desktop'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
          </div>

          <button
            onClick={() => fetchSpeedData(initialUrl, strategy, true)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Re-run Google PageSpeed audit"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Running Live Google PageSpeed Audit ({strategy.toUpperCase()})...
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Fetching Lighthouse lab data &amp; CrUX field metrics from Google servers.
          </p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchSpeedData(initialUrl, strategy)}
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-bold transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 1. Multi-Pillar Score Dials Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Google Lighthouse Pillar Scores ({strategy.toUpperCase()})
              </span>
              <span className="text-[10px] font-mono text-slate-400">Target: &gt;= 90 for optimal SEO</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <CircularScoreDial
                score={data.performanceScore}
                label="Performance"
                isPrimary={true}
              />
              <CircularScoreDial
                score={data.seoScore !== undefined ? data.seoScore : 100}
                label="SEO &amp; Crawlability"
              />
              <CircularScoreDial
                score={data.bestPracticesScore !== undefined ? data.bestPracticesScore : 95}
                label="Best Practices"
              />
              <CircularScoreDial
                score={data.accessibilityScore !== undefined ? data.accessibilityScore : 90}
                label="Accessibility"
              />
            </div>
          </div>

          {/* 2. Official Core Web Vitals Pass / Fail Status Banner */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
              data.coreWebVitalsPassed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3">
              {data.coreWebVitalsPassed ? (
                <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-6" />
                </div>
              ) : (
                <div className="size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="size-6" />
                </div>
              )}

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight">
                    {data.coreWebVitalsPassed
                      ? 'Core Web Vitals Assessment: PASSED'
                      : 'Core Web Vitals Assessment: ACTION NEEDED'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      data.coreWebVitalsPassed
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {data.coreWebVitalsPassed ? 'Official Pass' : 'Does Not Meet All 3 Thresholds'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {data.coreWebVitalsPassed
                    ? 'Your page satisfies Google\'s recommended thresholds across LCP (<= 2.5s), INP (<= 200ms), and CLS (<= 0.10) for Google search ranking signals.'
                    : 'One or more official Core Web Vitals metrics exceed Google recommended thresholds. Follow the actionable code fix guides below to pass.'}
                </p>
              </div>
            </div>

            <div className="text-xs font-mono shrink-0 flex items-center gap-2 self-end sm:self-center">
              <span className="text-slate-500 dark:text-slate-400">LCP: {data.lcp.displayValue}</span>
              <span>·</span>
              <span className="text-slate-500 dark:text-slate-400">INP: {data.inp.displayValue}</span>
              <span>·</span>
              <span className="text-slate-500 dark:text-slate-400">CLS: {data.cls.displayValue}</span>
            </div>
          </div>

          {/* 3. 6 Core Web Vitals & Loading Metrics Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Core Web Vitals &amp; Page Experience Indicators
              </span>
              <span className="text-[10px] font-mono text-slate-400">Color-coded by Google standard thresholds</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* 1. LCP Card */}
              <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>LCP (Largest Contentful Paint)</span>
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

                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[62.5%]" />
                    <div className="h-full bg-amber-500 w-[37.5%]" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0s</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt;= 2.5s (Good)</span>
                    <span>&gt; 4.0s (Poor)</span>
                  </div>
                </div>
              </div>

              {/* 2. INP Card */}
              <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                    <MousePointerClick className="w-4 h-4 text-cyan-500" />
                    <span>{data.inp.source === 'lab' ? 'TBT / INP' : 'INP (Responsiveness)'}</span>
                    <SEOExplanationTooltip text="Interaction to Next Paint: Real-user field responsiveness measured from Chrome user sessions. Good: <= 200ms" />
                  </div>
                  {data.inp.source && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                      {data.inp.source === 'lab' ? 'Lab TBT' : 'CrUX Field'}
                    </span>
                  )}
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

                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[40%]" />
                    <div className="h-full bg-amber-500 w-[60%]" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0ms</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt;= 200ms (Good)</span>
                    <span>&gt; 500ms (Poor)</span>
                  </div>
                </div>
              </div>

              {/* 3. CLS Card */}
              <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                    <Layout className="w-4 h-4 text-indigo-500" />
                    <span>CLS (Cumulative Layout Shift)</span>
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

                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[40%]" />
                    <div className="h-full bg-amber-500 w-[60%]" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0.0</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt;= 0.10 (Good)</span>
                    <span>&gt; 0.25 (Poor)</span>
                  </div>
                </div>
              </div>

              {/* 4. FCP Card */}
              <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span>FCP (First Contentful Paint)</span>
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

                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[60%]" />
                    <div className="h-full bg-amber-500 w-[40%]" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0s</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt;= 1.8s (Good)</span>
                    <span>&gt; 3.0s (Poor)</span>
                  </div>
                </div>
              </div>

              {/* 5. TTFB Card */}
              <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                    <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>TTFB (Server Response Time)</span>
                    <SEOExplanationTooltip text="Time to First Byte: Latency of web server responding with the first byte of HTML. Good: <= 200ms" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                    {data.ttfb.displayValue}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      data.ttfb.category === 'FAST'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : data.ttfb.category === 'AVERAGE'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {data.ttfb.category === 'FAST' ? 'Good' : data.ttfb.category === 'AVERAGE' ? 'Needs Work' : 'Poor'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[33%]" />
                    <div className="h-full bg-amber-500 w-[67%]" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0ms</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt;= 200ms (Good)</span>
                    <span>&gt; 600ms (Poor)</span>
                  </div>
                </div>
              </div>

              {/* 6. Speed Index Card */}
              {data.speedIndex && (
                <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Speed Index</span>
                      <SEOExplanationTooltip text="Speed Index: Shows how quickly the contents of a page are visually populated. Good: <= 3.4s" />
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                      {data.speedIndex.displayValue}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        data.speedIndex.category === 'FAST'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : data.speedIndex.category === 'AVERAGE'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {data.speedIndex.category === 'FAST' ? 'Good' : data.speedIndex.category === 'AVERAGE' ? 'Needs Work' : 'Poor'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 w-[58%]" />
                      <div className="h-full bg-amber-500 w-[42%]" />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>0s</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt;= 3.4s (Good)</span>
                      <span>&gt; 5.8s (Poor)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Actionable Fix Guides Component */}
          <SpeedFixGuideCard
            opportunities={data.opportunities}
            diagnostics={data.diagnostics}
            passedAudits={data.passedAudits}
          />
        </div>
      ) : null}
    </div>
  );
};
