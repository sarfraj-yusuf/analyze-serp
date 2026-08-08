'use client';

import React from 'react';
import { SearchIntentData } from '@/types/seo';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';
import {
  Target,
  BookOpen,
  ShoppingBag,
  ShoppingCart,
  Compass,
  Sparkles,
  CheckCircle2,
  Tag,
  Key,
  Layers,
} from 'lucide-react';

interface SearchIntentEntityCardProps {
  searchIntent: SearchIntentData;
}

export const SearchIntentEntityCard: React.FC<SearchIntentEntityCardProps> = ({ searchIntent }) => {
  const {
    primaryIntent,
    confidencePercent,
    intentSignalsFound,
    topicalEntities,
    recommendations,
  } = searchIntent;

  // Intent badge styling
  const intentConfig = {
    INFORMATIONAL: {
      label: 'Informational Intent',
      desc: 'Users are searching for answers, guides, tutorials, or educational information.',
      icon: BookOpen,
      badge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/40',
    },
    COMMERCIAL: {
      label: 'Commercial Investigation',
      desc: 'Users are evaluating and comparing products, services, or solutions before buying.',
      icon: ShoppingBag,
      badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/40',
    },
    TRANSACTIONAL: {
      label: 'Transactional Intent',
      desc: 'Users are ready to make a purchase, order, or sign up for a service.',
      icon: ShoppingCart,
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
    },
    NAVIGATIONAL: {
      label: 'Navigational Intent',
      desc: 'Users are searching for a specific brand, portal, or login page.',
      icon: Compass,
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40',
    },
  }[primaryIntent];

  const IntentIcon = intentConfig.icon;

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl my-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shrink-0 shadow-md">
            <IntentIcon className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold border ${intentConfig.badge}`}>
                {intentConfig.label} ({confidencePercent}% Fit)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              Search Intent & <span className="gradient-text">Topical Entity Analysis</span>
              <SEOExplanationTooltip text="Classifies search intent (Informational, Commercial, Transactional) and extracts primary topic entities for content optimization." />
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              {intentConfig.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Intent Signals & Topical Entities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intent Keyword Signals */}
        <div className="p-5 rounded-xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>Search Intent Indicators Detected</span>
          </div>

          {intentSignalsFound.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {intentSignalsFound.map((sig, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200"
                >
                  {sig}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-gray-400">General informative content signals detected.</p>
          )}
        </div>

        {/* Top Extracted Entities */}
        <div className="p-5 rounded-xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-500" />
            <span>Topical Entities Discovered</span>
          </div>

          {topicalEntities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {topicalEntities.map((ent, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold"
                >
                  {ent.name} ({ent.densityPercent}%)
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-gray-400">Broad topical signals.</p>
          )}
        </div>
      </div>

      {/* Writer Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
          <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Content Alignment Recommendations for {intentConfig.label}</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-700 dark:text-gray-300">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
