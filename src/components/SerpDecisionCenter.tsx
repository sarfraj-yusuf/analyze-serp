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

  const handleScrollToActionPlan = () => {
    const el = document.getElementById('action-plan-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO: Executive Summary Card */}
      <SerpHeroHeader report={report} onScrollToActionPlan={handleScrollToActionPlan} />

      {/* 2. Winning SERP Consensus Blueprint */}
      {report.serpConsensusPatterns.length > 0 && (
        <SerpConsensusBlueprint patterns={report.serpConsensusPatterns} />
      )}

      {/* 3. Category 1: Technical Hygiene & Crawlability */}
      <TechnicalHygieneCard technicalHygiene={report.technicalHygiene} />

      {/* 4. Category 2: Impact x Effort Action Roadmap */}
      <ActionMatrixRoadmap actions={report.evidenceActions} />

      {/* 5. "Don't Waste Time Changing These" Strengths */}
      <DontTouchStrengthsCard strengths={report.dontTouchStrengths} />
    </div>
  );
};
