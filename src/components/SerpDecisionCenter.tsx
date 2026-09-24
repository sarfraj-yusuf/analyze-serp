'use client';

import React from 'react';
import { SinglePageAudit } from '@/types/seo';
import { analyzeSerpAlignment } from '@/lib/serp-decision-engine';
import { SerpHeroHeader } from './SerpHeroHeader';
import { SerpConsensusBlueprint } from './SerpConsensusBlueprint';
import { TechnicalHygieneCard } from './TechnicalHygieneCard';
import { ActionMatrixRoadmap } from './ActionMatrixRoadmap';
import { DontTouchStrengthsCard } from './DontTouchStrengthsCard';
import { Sparkles, ArrowRight } from 'lucide-react';

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
      {/* Sticky Report Navigation Bar (Compact HUD) */}
      <div className="sticky top-16 z-30 py-1.5 px-3 sm:px-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-xs backdrop-blur-md flex items-center justify-between gap-2 overflow-x-auto text-xs scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
            Report Sections
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 p-0.5 sm:p-1 rounded-lg bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]">
          {/* Chapter 1: Strategy & Triage */}
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 font-semibold hidden md:inline">
            Stage 1:
          </span>
          <button
            onClick={() => handleScrollToSection('decision-hero-section')}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-[11px] sm:text-xs font-medium transition-all cursor-pointer"
          >
            Verdict
          </button>
          <button
            onClick={() => handleScrollToSection('consensus-blueprint-section')}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-[11px] sm:text-xs font-medium transition-all cursor-pointer"
          >
            Blueprint
          </button>
          <button
            onClick={() => handleScrollToSection('action-plan-section')}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-[11px] sm:text-xs font-medium transition-all cursor-pointer"
          >
            Roadmap
          </button>
          <button
            onClick={() => handleScrollToSection('strengths-section')}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-[11px] sm:text-xs font-medium transition-all cursor-pointer"
          >
            Strengths
          </button>
          <button
            onClick={() => handleScrollToSection('technical-hygiene-section')}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-[11px] sm:text-xs font-medium transition-all cursor-pointer"
          >
            Technical
          </button>

          {/* Divider */}
          <span className="w-px h-3.5 bg-slate-200 dark:border-white/10 mx-0.5" />

          {/* Chapter 2: Content & Keywords */}
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-1 font-semibold hidden md:inline">
            Stage 2:
          </span>
          <button
            onClick={() => handleScrollToSection('keyword-gap-section')}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-500/10 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer"
          >
            Keyword Gaps
          </button>
          <button
            onClick={() => handleScrollToSection('content-brief-section')}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-500/10 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer"
          >
            Content Brief
          </button>

          {/* Divider */}
          <span className="w-px h-3.5 bg-slate-200 dark:border-white/10 mx-0.5" />

          {/* Chapter 3: Deep Dive */}
          <button
            onClick={() => handleScrollToSection('deep-dive-section')}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 text-[11px] sm:text-xs font-medium transition-all cursor-pointer"
          >
            Raw Data
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

      {/* 3. Category 1: Impact x Effort Action Roadmap */}
      <div id="action-plan-section">
        <ActionMatrixRoadmap actions={report.evidenceActions} />
      </div>

      {/* 4. "Don't Waste Time Changing These" Strengths */}
      <div id="strengths-section">
        <DontTouchStrengthsCard strengths={report.dontTouchStrengths} />
      </div>

      {/* 5. Category 2: Technical Hygiene & Crawlability */}
      <div id="technical-hygiene-section">
        <TechnicalHygieneCard technicalHygiene={report.technicalHygiene} />
      </div>

      {/* Stage Transition Bridge: Connects Technical Triage to Editorial Content Engine */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-slate-50 to-emerald-500/10 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-900/20 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" />
            <span>Next Phase · Semantic &amp; Editorial Engine</span>
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Ready to close content gaps? Discover missing competitor keywords
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            You've audited technical infrastructure and structural parity. Now analyze the specific N-gram keyword phrases your competitors use and generate a tailored content brief.
          </p>
        </div>

        <button
          onClick={() => handleScrollToSection('keyword-gap-section')}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center gap-2 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <span>Explore Keyword Gaps</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
