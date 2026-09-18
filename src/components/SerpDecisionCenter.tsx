'use client';

import React from 'react';
import { SinglePageAudit } from '@/types/seo';
import { analyzeSerpAlignment } from '@/lib/serp-decision-engine';
import { SerpHeroHeader } from './SerpHeroHeader';
import { SerpConsensusBlueprint } from './SerpConsensusBlueprint';
import { TechnicalHygieneCard } from './TechnicalHygieneCard';
import { ActionMatrixRoadmap } from './ActionMatrixRoadmap';
import { DontTouchStrengthsCard } from './DontTouchStrengthsCard';

interface SerpDecisionCenterProps {
  results: SinglePageAudit[];
  targetUrl?: string;
  targetKeyword?: string;
}

export const SerpDecisionCenter: React.FC<SerpDecisionCenterProps> = ({
  results,
  targetUrl,
  targetKeyword,
}) => {
  if (!results || results.length === 0) return null;

  const validResults = results.filter((r) => r.status === 'success');
  if (validResults.length === 0) return null;

  const report = analyzeSerpAlignment(validResults, targetUrl, targetKeyword);

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToActionPlan = () => handleScrollToSection('action-plan-section');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sticky Report Navigation Bar */}
      <div className="sticky top-16 z-30 py-2 px-3 sm:px-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-xs backdrop-blur-xl flex items-center justify-between gap-3 overflow-x-auto text-xs scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
            Report Sections
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.04]">
          <button
            onClick={() => handleScrollToSection('decision-hero-section')}
            className="px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-xs font-medium transition-all cursor-pointer"
          >
            Verdict
          </button>
          <button
            onClick={() => handleScrollToSection('consensus-blueprint-section')}
            className="px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-xs font-medium transition-all cursor-pointer"
          >
            Blueprint
          </button>
          <button
            onClick={() => handleScrollToSection('technical-hygiene-section')}
            className="px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-xs font-medium transition-all cursor-pointer"
          >
            Technical
          </button>
          <button
            onClick={() => handleScrollToSection('action-plan-section')}
            className="px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-xs font-medium transition-all cursor-pointer"
          >
            Action Roadmap
          </button>
          <button
            onClick={() => handleScrollToSection('strengths-section')}
            className="px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-xs font-medium transition-all cursor-pointer"
          >
            Strengths
          </button>
        </div>
      </div>

      {/* 1. HERO: Executive Summary Card */}
      <div id="decision-hero-section">
        <SerpHeroHeader report={report} results={results} onScrollToActionPlan={handleScrollToActionPlan} />
      </div>

      {/* 2. Winning SERP Consensus Blueprint */}
      {report.serpConsensusPatterns.length > 0 && (
        <div id="consensus-blueprint-section">
          <SerpConsensusBlueprint patterns={report.serpConsensusPatterns} />
        </div>
      )}

      {/* 3. Category 1: Technical Hygiene & Crawlability */}
      <div id="technical-hygiene-section">
        <TechnicalHygieneCard technicalHygiene={report.technicalHygiene} />
      </div>

      {/* 4. Category 2: Impact x Effort Action Roadmap */}
      <div id="action-plan-section">
        <ActionMatrixRoadmap actions={report.evidenceActions} />
      </div>

      {/* 5. "Don't Waste Time Changing These" Strengths */}
      <div id="strengths-section">
        <DontTouchStrengthsCard strengths={report.dontTouchStrengths} />
      </div>
    </div>
  );
};
