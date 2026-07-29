import React from 'react';
import { TechnicalAudit } from '@/types/seo';
import { Zap, Clock, FileCode, Layers, ShieldCheck, AlertTriangle, Check, Cpu, Code2, Lock } from 'lucide-react';

interface TechnicalHealthCardProps {
  technicalAudit: TechnicalAudit;
}

export const TechnicalHealthCard: React.FC<TechnicalHealthCardProps> = ({ technicalAudit }) => {
  const {
    ttfbMs,
    totalDownloadTimeMs,
    htmlSizeKb,
    domNodeCount,
    maxDomDepth,
    inlineScriptCount,
    inlineScriptSizeKb,
    inlineStyleCount,
    inlineStyleSizeKb,
    externalScriptCount,
    externalStyleCount,
    hasViewportMeta,
    hasHttps,
    hasCharsetMeta,
    technicalScore,
    technicalGrade,
    warnings,
  } = technicalAudit;

  // Grade color
  const gradeColor =
    technicalScore >= 80
      ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : technicalScore >= 60
      ? 'text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-red-600 dark:text-red-400 border-red-500/40 bg-red-500/10';

  return (
    <div className="space-y-6">
      {/* Header Score Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-md ${gradeColor}`}>
            <span className="text-2xl font-black">{technicalScore}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">/ 100 Speed</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${gradeColor}`}>
                {technicalGrade}
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Lightweight Technical Audit</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Zero-browser latency score measuring payload size, TTFB, DOM node density & script overhead.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">TTFB Latency</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{ttfbMs}ms</div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">HTML Size</div>
            <div className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">{htmlSizeKb} kB</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>TTFB Latency</span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">{ttfbMs} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">ms</span></div>
          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">Download: {totalDownloadTimeMs}ms</div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
            <FileCode className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>HTML Payload Size</span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">{htmlSizeKb} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">kB</span></div>
          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">{htmlSizeKb < 100 ? 'Optimal Size' : 'Heavy Payload'}</div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>DOM Node Count</span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">{domNodeCount} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">nodes</span></div>
          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">Depth: {maxDomDepth} levels</div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
            <Code2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Inline Script Overhead</span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">{inlineScriptSizeKb} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">kB</span></div>
          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">{inlineScriptCount} inline scripts</div>
        </div>
      </div>

      {/* Checklist & Directive Badges */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
          Core Technical SEO Compliance Checklist
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold p-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            {hasHttps ? (
              <div className="p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="p-1 rounded bg-red-500/20 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            )}
            <span className={hasHttps ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'}>
              {hasHttps ? 'SSL / HTTPS Enabled' : 'Non-HTTPS (HTTP Only)'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold p-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            {hasViewportMeta ? (
              <div className="p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            ) : (
              <div className="p-1 rounded bg-red-500/20 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            )}
            <span className={hasViewportMeta ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'}>
              {hasViewportMeta ? 'Mobile Viewport Tag' : 'Missing Viewport Meta'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold p-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            {hasCharsetMeta ? (
              <div className="p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            ) : (
              <div className="p-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-slate-900 dark:text-white">
              {hasCharsetMeta ? 'UTF-8 Charset Tag' : 'Missing Charset Meta'}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Warnings & Recommendations */}
      {warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Technical Performance Alerts ({warnings.length})</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700 dark:text-gray-300">
            {warnings.map((w, idx) => (
              <li key={idx} className="leading-relaxed">{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
