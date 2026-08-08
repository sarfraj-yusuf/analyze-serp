'use client';

import React from 'react';
import { RedirectChainReportData } from '@/lib/redirect-tracer';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Server,
  Zap,
  HelpCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface RedirectChainVisualizerProps {
  report: RedirectChainReportData;
}

export const RedirectChainVisualizer: React.FC<RedirectChainVisualizerProps> = ({ report }) => {
  return (
    <div className="space-y-8">
      {/* Overview Status Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-lg ${
              report.overallScore >= 80
                ? 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10'
                : report.overallScore >= 50
                ? 'text-amber-500 border-amber-500/40 bg-amber-500/10'
                : 'text-rose-500 border-rose-500/40 bg-rose-500/10'
            }`}
          >
            <span className="text-2xl font-black">{report.overallScore}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              Redirect Score
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider border ${
                  report.statusVerdict === 'EXCELLENT'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : report.statusVerdict === 'WARNING'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}
              >
                {report.statusVerdict === 'EXCELLENT' && '🟢 Optimal Redirect Route'}
                {report.statusVerdict === 'WARNING' && '🟡 Multi-Hop / 302 Temporary Warning'}
                {report.statusVerdict === 'CRITICAL_LOOP' && '🔴 Infinite Loop Detected'}
                {report.statusVerdict === 'BROKEN_CHAIN' && '🔴 Broken Redirect Chain'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {report.isDirectRoute ? 'Direct Route (0 Redirect Hops)' : `${report.totalHops} Redirect Hop(s) Traced`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Total Redirect Delay: <strong className="text-slate-900 dark:text-white font-mono">{report.totalLatencyMs}ms</strong> across {report.hops.length} requests.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">
              Total Hops
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {report.totalHops}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">
              Total Delay
            </div>
            <div className="text-xl font-black text-emerald-500 font-mono mt-0.5">
              {report.totalLatencyMs}ms
            </div>
          </div>
        </div>
      </div>

      {/* Visual Flowchart Hop Diagram */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            <span>HTTP Redirect Chain Flowchart</span>
          </h4>
          <span className="text-xs font-mono text-slate-500 dark:text-gray-400">
            Step-by-Step Response Trace
          </span>
        </div>

        <div className="relative space-y-6 before:absolute before:left-6 sm:before:left-8 before:top-10 before:bottom-10 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
          {report.hops.map((hop, index) => {
            const isFinal = index === report.hops.length - 1;

            return (
              <div key={index} className="relative flex items-start gap-4 sm:gap-6 group">
                {/* Hop Node Number */}
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 z-10 shadow-md font-mono transition-transform group-hover:scale-105 ${
                    isFinal
                      ? hop.statusCode >= 200 && hop.statusCode < 300
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : 'bg-rose-500 text-white border-rose-400'
                      : hop.isPermanent
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                  }`}
                >
                  <span className="text-xs font-bold opacity-75">Hop</span>
                  <span className="text-sm sm:text-base font-black">#{hop.hopNumber}</span>
                </div>

                {/* Hop Details Box */}
                <div className="flex-1 p-4 sm:p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Status Code Pill */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black font-mono border ${
                          hop.statusCode >= 200 && hop.statusCode < 300
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : hop.statusCode === 301 || hop.statusCode === 308
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
                            : hop.statusCode === 302 || hop.statusCode === 307
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {hop.statusCode > 0 ? `HTTP ${hop.statusCode}` : 'FETCH ERROR'}
                      </span>

                      <span className="text-xs font-bold text-slate-600 dark:text-gray-300">
                        {hop.statusText}
                      </span>
                    </div>

                    {/* Meta Badges */}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-500" /> {hop.responseTimeMs}ms
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Server className="w-3 h-3 text-cyan-500" /> {hop.server}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {hop.isHttps ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        {hop.isHttps ? 'HTTPS' : 'HTTP'}
                      </span>
                    </div>
                  </div>

                  {/* URL Path */}
                  <div className="font-mono text-xs text-slate-900 dark:text-white break-all bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                    <span className="truncate">{hop.url}</span>
                    <a
                      href={hop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Destination Pointer if Redirecting */}
                  {hop.destinationUrl && (
                    <div className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-2 pt-1 font-mono">
                      <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Redirects to: </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate">
                        {hop.destinationUrl}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEO Optimization Recommendations Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 shadow-lg">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>SEO Crawl Budget & Redirect Recommendations</span>
        </h4>

        <div className="space-y-2.5">
          {report.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
