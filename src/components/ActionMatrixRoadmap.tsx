'use client';

import React, { useState } from 'react';
import { EvidenceRecommendation } from '@/types/seo';
import { Target, Zap, Clock, CheckCircle2, AlertTriangle, ArrowRight, Filter, Info } from 'lucide-react';
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
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">No Major Action Items Detected</h4>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              Category 2: Competitive Opportunities
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500" />
            Impact × Effort Prioritized Action Roadmap
            <SEOExplanationTooltip text="Prioritizes updates by combining estimated SEO ranking impact with execution effort, backed by direct SERP consensus evidence." />
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Step-by-step optimization recommendations prioritized by impact and empirical SERP evidence.
          </p>
        </div>
      </div>

      {/* Quadrant Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
              : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          <span>All Opportunities ({actions.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('DO_FIRST')}
          className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'DO_FIRST'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>🔴 High Impact / Low Effort — DO FIRST ({doFirstCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('PLAN_THIS')}
          className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'PLAN_THIS'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>🔴 High Impact / High Effort — PLAN THIS ({planThisCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('DO_NEXT')}
          className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'DO_NEXT'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          <span>🟡 Medium Impact — DO NEXT ({doNextCount})</span>
        </button>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {filteredActions.map((item, idx) => {
          // Quadrant badge styling
          let badgeBg = 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/40';
          let quadrantLabel = '🟡 Medium Impact / Do Next';

          if (item.quadrant === 'DO_FIRST') {
            badgeBg = 'bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/40';
            quadrantLabel = '🔴 High Impact / Low Effort — DO THIS FIRST';
          } else if (item.quadrant === 'PLAN_THIS') {
            badgeBg = 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40';
            quadrantLabel = '🔴 High Impact / High Effort — PLAN THIS';
          }

          return (
            <div
              key={item.id || idx}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-3 hover:border-emerald-500/40 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-black border ${badgeBg}`}>
                    {quadrantLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                    {item.category}
                  </span>
                </div>

                <div className="text-[11px] font-mono font-bold text-slate-500 dark:text-gray-400">
                  Effort: <strong className="text-slate-800 dark:text-white">{item.effort}</strong>
                </div>
              </div>

              {/* Title & Action Step */}
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{item.title}</span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-semibold">
                  👉 <strong>Recommended Action:</strong> {item.action}
                </p>
              </div>

              {/* Empirical SERP Evidence Tag */}
              <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white">SERP Evidence Proof: </span>
                  <span className="text-slate-600 dark:text-gray-300 font-mono text-[11px]">{item.evidence}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
