'use client';

import React, { useState } from 'react';
import { SpeedOpportunity, SpeedDiagnostic, PassedAudit } from '@/lib/pagespeed';
import { getSpeedFixGuide, SpeedAuditFixGuide, PlatformFixGuide } from '@/lib/speed-fix-guides';
import {
  AlertTriangle,
  Clock,
  FileCode,
  Layers,
  Server,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Code2,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react';

interface SpeedFixGuideCardProps {
  opportunities: SpeedOpportunity[];
  diagnostics: SpeedDiagnostic[];
  passedAudits: PassedAudit[];
}

type FilterCategory = 'all' | 'high' | 'images' | 'js-css' | 'server' | 'passed';

export const SpeedFixGuideCard: React.FC<SpeedFixGuideCardProps> = ({
  opportunities,
  diagnostics,
  passedAudits,
}) => {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(opportunities[0]?.id || null);
  const [activePlatform, setActivePlatform] = useState<Record<string, 'nextjs' | 'wordpress' | 'server'>>({});
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [fixedItems, setFixedItems] = useState<Record<string, boolean>>({});
  const [isPassedExpanded, setIsPassedExpanded] = useState<boolean>(false);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCopyCode = async (key: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeKey(key);
      setTimeout(() => setCopiedCodeKey(null), 2000);
    } catch (e) {
      console.error('Failed to copy code snippet', e);
    }
  };

  const toggleFixed = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFixedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setPlatformForAudit = (auditId: string, platform: 'nextjs' | 'wordpress' | 'server') => {
    setActivePlatform((prev) => ({ ...prev, [auditId]: platform }));
  };

  // Filter opportunities based on selected chip
  const filteredOpportunities = opportunities.filter((op) => {
    const guide = getSpeedFixGuide(op.id, op.title, op.description);
    if (filter === 'all') return true;
    if (filter === 'high') {
      return (op.wastedMs && op.wastedMs >= 300) || (op.wastedBytes && op.wastedBytes >= 100 * 1024) || guide.severity === 'high';
    }
    if (filter === 'images') {
      return guide.category === 'images' || op.id.includes('image');
    }
    if (filter === 'js-css') {
      return guide.category === 'javascript' || guide.category === 'css' || op.id.includes('script') || op.id.includes('css');
    }
    if (filter === 'server') {
      return guide.category === 'server' || guide.category === 'fonts' || op.id.includes('server') || op.id.includes('cache');
    }
    return true;
  });

  const highPriorityCount = opportunities.filter((op) => {
    const guide = getSpeedFixGuide(op.id, op.title, op.description);
    return (op.wastedMs && op.wastedMs >= 300) || (op.wastedBytes && op.wastedBytes >= 100 * 1024) || guide.severity === 'high';
  }).length;

  const imagesCount = opportunities.filter((op) => {
    const guide = getSpeedFixGuide(op.id, op.title, op.description);
    return guide.category === 'images' || op.id.includes('image');
  }).length;

  const jsCssCount = opportunities.filter((op) => {
    const guide = getSpeedFixGuide(op.id, op.title, op.description);
    return guide.category === 'javascript' || guide.category === 'css' || op.id.includes('script') || op.id.includes('css');
  }).length;

  return (
    <div className="space-y-6 pt-4">
      {/* Action Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Actionable Resolution Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Speed Optimization &amp; Fix Guides</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Diagnosed bottlenecks ranked by estimated load time savings. Expand any item to view root cause analysis and copy-ready code fixes for Next.js, WordPress, or your web server.
          </p>
        </div>

        {/* Total Progress Chip */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 shrink-0">
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            {Object.values(fixedItems).filter(Boolean).length} / {opportunities.length}
          </span>
          <span>Marked as Fixed</span>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Issues ({opportunities.length})
        </button>

        <button
          onClick={() => setFilter('high')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            filter === 'high'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>High Impact ({highPriorityCount})</span>
        </button>

        <button
          onClick={() => setFilter('images')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            filter === 'images'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Images &amp; Media ({imagesCount})
        </button>

        <button
          onClick={() => setFilter('js-css')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            filter === 'js-css'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          JavaScript &amp; CSS ({jsCssCount})
        </button>

        <button
          onClick={() => setFilter('server')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            filter === 'server'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Server &amp; Caching
        </button>
      </div>

      {/* Opportunities Accordion Worklist */}
      {filteredOpportunities.length === 0 ? (
        <div className="p-8 text-center glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Zero Critical Bottlenecks in this Category</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your webpage performs smoothly under this filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOpportunities.map((op, idx) => {
            const isExpanded = expandedId === op.id;
            const guide = getSpeedFixGuide(op.id, op.title, op.description);
            const isFixed = !!fixedItems[op.id];
            const currentPlatform = activePlatform[op.id] || 'nextjs';
            const platformGuide =
              guide.guides.find((g) => g.platform === currentPlatform) || guide.guides[0];

            return (
              <div
                key={op.id || idx}
                className={`glass-panel rounded-2xl border transition-all overflow-hidden ${
                  isFixed
                    ? 'border-emerald-500/40 bg-emerald-500/5 opacity-80'
                    : isExpanded
                    ? 'border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20'
                    : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {/* Accordion Header Row */}
                <div
                  onClick={() => toggleExpand(op.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Mark as Fixed Checkbox */}
                    <button
                      onClick={(e) => toggleFixed(op.id, e)}
                      title={isFixed ? 'Mark as unfixed' : 'Mark as fixed'}
                      className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                    >
                      {isFixed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            guide.severity === 'high'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {guide.severity} Priority
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                          {guide.categoryLabel}
                        </span>

                        {isFixed && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-bold tracking-tight text-slate-800 dark:text-slate-100 ${
                          isFixed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {op.title}
                      </h4>
                    </div>
                  </div>

                  {/* Estimated Savings & Toggle Icon */}
                  <div className="flex items-center gap-3 sm:self-center self-end shrink-0">
                    {(op.displayValue || op.wastedMs || op.wastedBytes) && (
                      <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        {op.displayValue ||
                          (op.wastedMs ? `Save ~${(op.wastedMs / 1000).toFixed(1)}s` : '') ||
                          (op.wastedBytes ? `Save ~${Math.round(op.wastedBytes / 1024)} KiB` : '')}
                      </span>
                    )}

                    <div className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Diagnostic & Step-by-Step Fix Guide */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-200/60 dark:border-white/5 space-y-5 animate-in fade-in duration-150">
                    {/* 1. Root Cause Explanation */}
                    <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1.5">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Why This Matters for User Speed &amp; Rankings</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {guide.whyItMatters}
                      </p>
                    </div>

                    {/* 2. Offending Asset Items (if available from Lighthouse) */}
                    {op.items && op.items.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>Offending Assets Detected ({op.items.length})</span>
                          <span className="font-mono text-[10px] text-slate-400">Top items by payload</span>
                        </div>
                        <div className="rounded-xl border border-slate-200/80 dark:border-white/5 overflow-hidden text-xs divide-y divide-slate-200/60 dark:divide-white/5">
                          {op.items.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className="p-2.5 bg-white/40 dark:bg-white/[0.01] flex items-center justify-between gap-3 text-[11px]"
                            >
                              <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-md" title={item.url || item.label}>
                                {item.url || item.label || 'Static Resource'}
                              </span>
                              <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
                                {item.totalBytes && (
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Total: {Math.round(item.totalBytes / 1024)} KiB
                                  </span>
                                )}
                                {item.wastedBytes && (
                                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                                    Waste: {Math.round(item.wastedBytes / 1024)} KiB
                                  </span>
                                )}
                                {item.wastedMs && (
                                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                                    Delay: {Math.round(item.wastedMs)}ms
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Platform-Specific Fix Guides */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-emerald-500" />
                          <span>Step-by-Step Resolution Blueprint</span>
                        </div>

                        {/* Platform Selector Tabs */}
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shrink-0 text-xs">
                          {guide.guides.map((g) => (
                            <button
                              key={g.platform}
                              onClick={() => setPlatformForAudit(op.id, g.platform)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                currentPlatform === g.platform
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {g.platformLabel}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active Platform Guide Content */}
                      {platformGuide && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080d1a] border border-slate-200/80 dark:border-white/10 space-y-4">
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {platformGuide.description}
                          </p>

                          {/* Action Checklist */}
                          {platformGuide.instructions && platformGuide.instructions.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Implementation Steps:
                              </span>
                              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                {platformGuide.instructions.map((step, stepIdx) => (
                                  <li key={stepIdx} className="flex items-start gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Code Snippet Box with 1-Click Copy */}
                          {platformGuide.codeSnippet && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <span>Copy-ready code:</span>
                                <button
                                  onClick={() => handleCopyCode(`${op.id}-${currentPlatform}`, platformGuide.codeSnippet || '')}
                                  className="px-2.5 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  {copiedCodeKey === `${op.id}-${currentPlatform}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Code</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <pre className="p-3.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 shadow-inner">
                                <code>{platformGuide.codeSnippet}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Diagnostics & Infrastructure Signals */}
      {diagnostics.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-500" />
              <span>Technical Diagnostics &amp; DOM Infrastructure ({diagnostics.length})</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Underlying system health</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {diagnostics.map((diag, diagIdx) => (
              <div
                key={diag.id || diagIdx}
                className="p-3.5 rounded-xl glass-panel border border-slate-200/80 dark:border-white/10 space-y-1 shadow-xs"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2">
                  <span>{diag.title}</span>
                  {diag.displayValue && (
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                      {diag.displayValue}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {diag.description.replace(/\[Learn more\]\(.*?\)\.?/g, '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passed Audits Collapsible Accordion */}
      {passedAudits.length > 0 && (
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10">
          <button
            onClick={() => setIsPassedExpanded(!isPassedExpanded)}
            className="w-full p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 text-left hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  Passed Audits ({passedAudits.length} Checks Validated)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Core standards, protocol security, and modern web directives passed successfully.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {passedAudits.length} Passed
              </span>
              <div className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                {isPassedExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {isPassedExpanded && (
            <div className="mt-3 p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs animate-in fade-in duration-150">
              {passedAudits.map((item, pIdx) => (
                <div
                  key={item.id || pIdx}
                  className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 text-[11px] font-medium truncate" title={item.title}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
