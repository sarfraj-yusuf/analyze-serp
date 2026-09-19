'use client';

import React, { useState } from 'react';
import { EvidenceRecommendation } from '@/types/seo';
import { Target, Zap, Clock, CheckCircle2, AlertTriangle, ArrowRight, Filter, Info, TrendingUp } from 'lucide-react';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';

interface ActionMatrixRoadmapProps {
  actions: EvidenceRecommendation[];
}

export const ActionMatrixRoadmap: React.FC<ActionMatrixRoadmapProps> = ({ actions }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DO_FIRST' | 'PLAN_THIS' | 'DO_NEXT'>('ALL');

  if (!actions || actions.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8 border border-slate-200 dark:border-white/10 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">No Major Action Items Detected</h4>
        <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto">
          Your page is already well-aligned with ranking competitor content structures.
        </p>
      </div>
    );
  }

  const filteredActions = activeFilter === 'ALL'
    ? actions
    : actions.filter((a) => a.quadrant === activeFilter);

  const doFirstCount = actions.filter((a) => a.quadrant === 'DO_FIRST').length;
  const planThisCount = actions.filter((a) => a.quadrant === 'PLAN_THIS').length;
  const doNextCount = actions.filter((a) => a.quadrant === 'DO_NEXT').length;

  return (
    <div id="action-plan-section" className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
              Competitive Opportunities Roadmap
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Impact × Effort Prioritized Action Roadmap
            <SEOExplanationTooltip text="Prioritizes updates by combining estimated SEO ranking impact with execution effort, backed by direct SERP consensus evidence." />
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Step-by-step optimization recommendations prioritized by impact and empirical SERP evidence.
          </p>
        </div>
      </div>

      {/* Segmented Control Filter Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'ALL'
              ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-slate-100 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
          }`}
        >
          All Opportunities ({actions.length})
        </button>

        <button
          onClick={() => setActiveFilter('DO_FIRST')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'DO_FIRST'
              ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-slate-100 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span>DO FIRST ({doFirstCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('PLAN_THIS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'PLAN_THIS'
              ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-slate-100 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>PLAN THIS ({planThisCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('DO_NEXT')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'DO_NEXT'
              ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-700 dark:text-slate-100 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>DO NEXT ({doNextCount})</span>
        </button>
      </div>

      {/* Action Cards List */}
      <div className="divide-y divide-slate-200/80 dark:divide-slate-800 pt-2">
        {filteredActions.map((item, idx) => {
          return (
            <div
              key={item.id || idx}
              className="py-4 space-y-2.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/50">
                    {item.category}
                  </span>
                  {activeFilter === 'ALL' && (
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      • {item.quadrant === 'DO_FIRST' ? 'High Impact' : item.quadrant === 'PLAN_THIS' ? 'High Impact (Plan)' : 'Medium Impact'}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300">
                  Effort: <strong className="text-slate-800 dark:text-gray-200 uppercase">{item.effort}</strong>
                </div>
              </div>

              {/* Title & Action Step */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-700 dark:text-gray-200 leading-relaxed">
                  <strong className="font-semibold text-slate-800 dark:text-slate-100">Recommended Action:</strong> {item.action}
                </p>
              </div>

              {/* Plain-English Business Impact Callout */}
              {item.businessImpact && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/[0.04] border border-emerald-500/20 text-[11px] text-slate-700 dark:text-slate-300">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="font-semibold text-emerald-700 dark:text-emerald-400">Why this matters:</strong>{' '}
                    {item.businessImpact}
                  </span>
                </div>
              )}

              {/* Empirical SERP Evidence Tag (Clean Inline Meta Row) */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-0.5">
                <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  <strong className="font-semibold text-slate-700 dark:text-gray-300">SERP Evidence Proof:</strong>{' '}
                  <span className="font-mono">{item.evidence}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
