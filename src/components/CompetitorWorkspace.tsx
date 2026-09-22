'use client';

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { SinglePageAudit } from '@/types/seo';
import { analyzeSerpAlignment } from '@/lib/serp-decision-engine';
import { SerpHeroHeader } from './SerpHeroHeader';
import { SerpConsensusBlueprint } from './SerpConsensusBlueprint';
import { TechnicalHygieneCard } from './TechnicalHygieneCard';
import { ActionMatrixRoadmap } from './ActionMatrixRoadmap';
import { DontTouchStrengthsCard } from './DontTouchStrengthsCard';
import { KeywordGapMatrix } from './KeywordGapMatrix';
import { ComparisonMatrix } from './ComparisonMatrix';
import { ContentBriefGenerator } from './ContentBriefGenerator';
import { SingleAuditCard } from './SingleAuditCard';
import { WhiteLabelPdfModal } from './WhiteLabelPdfModal';
import { ExportDropdown } from './ExportDropdown';
import { AuditDiffModal } from './AuditDiffModal';
import { InternalLinkTopologyModal } from './InternalLinkTopologyModal';
import { AuthModal } from './AuthModal';
import {
  Activity,
  Target,
  Layers,
  Search,
  FileText,
  Download,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Share2,
  SlidersHorizontal,
  FileCode,
  GitCompare,
  Network,
} from 'lucide-react';

export type WorkspaceTab = 'overview' | 'keywords' | 'matrix' | 'inspector' | 'brief';

interface CompetitorWorkspaceProps {
  results: SinglePageAudit[];
  targetUrl?: string;
  targetKeyword?: string;
  urls?: string[];
  initialOpenDiff?: boolean;
  onStartNewAudit?: () => void;
  onEditUrls?: () => void;
}

export const CompetitorWorkspace: React.FC<CompetitorWorkspaceProps> = ({
  results,
  targetUrl,
  targetKeyword,
  urls = [],
  initialOpenDiff = false,
  onStartNewAudit,
  onEditUrls,
}) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [activeUrlIndex, setActiveUrlIndex] = useState<number>(0);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(initialOpenDiff);
  const [isTopologyModalOpen, setIsTopologyModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter only valid successful results
  const validResults = useMemo(() => {
    return (results || []).filter((r) => r.status === 'success');
  }, [results]);

  // Compute SERP alignment report
  const report = useMemo(() => {
    if (validResults.length === 0) return null;
    return analyzeSerpAlignment(validResults, targetUrl, targetKeyword);
  }, [validResults, targetUrl, targetKeyword]);

  if (!results || results.length === 0 || !report || validResults.length === 0) {
    return null;
  }

  const effectiveTargetUrl = targetUrl || validResults[0]?.url || '';
  const targetAudit = validResults.find((r) => r.url === effectiveTargetUrl) || validResults[0];
  const competitorUrls = validResults.filter((r) => r.url !== effectiveTargetUrl).map((r) => r.url);
  const competitorCount = competitorUrls.length;

  const handleTabSwitch = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    const el = document.getElementById('workspace-tabs-bar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleGoToActionPlan = () => {
    const el = document.getElementById('action-plan-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopySummary = () => {
    const summaryText = [
      `AnalyzeSERP Competitor Audit Summary`,
      `Target URL: ${effectiveTargetUrl}`,
      targetKeyword ? `Target Keyword: ${targetKeyword}` : '',
      `Competitors Benchmarked: ${competitorCount}`,
      `SERP Alignment Score: ${report.alignmentScore}%`,
      `Verdict: ${report.verdictHeadline}`,
      `Top Opportunities: ${report.opportunityCount} identified`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div id="competitor-workspace" className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. EXECUTIVE SERP PARITY COCKPIT */}
      <div className="rounded-2xl p-4 sm:p-5 glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-sm relative z-40 backdrop-blur-md">
        
        {/* Tier 1: Top Context Strip & Command Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-white/[0.06]">
          {/* Left Context: Status & Focus Keyword */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              BENCHMARK AUDIT ACTIVE
            </span>
            {targetKeyword && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] text-slate-700 dark:text-slate-300">
                <Target className="size-3 text-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400">Query:</span>
                <strong className="font-semibold text-slate-800 dark:text-slate-200">"{targetKeyword}"</strong>
              </span>
            )}
          </div>

          {/* Right: Action Command Group */}
          <div className="flex flex-wrap items-center gap-1.5">
            {session?.user?.email ? (
              <span
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5"
                title="This audit is automatically saved to your cloud workspace"
              >
                <ShieldCheck className="size-3 text-emerald-500" />
                <span>Saved to Cloud</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Sign in to save this audit permanently to your cloud account"
              >
                <ShieldCheck className="size-3" />
                <span>Save to Cloud</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShareLink}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 active:scale-95 cursor-pointer"
              title="Copy shareable audit link to clipboard"
            >
              {copiedLink ? <Check className="size-3 text-emerald-500" /> : <Share2 className="size-3" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 active:scale-95 cursor-pointer"
              title="Copy executive summary to clipboard"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDiffModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium text-xs flex items-center gap-1.5 transition-all border border-indigo-200 dark:border-indigo-800 active:scale-95 cursor-pointer"
              title="Compare current audit against previous baseline"
            >
              <GitCompare className="size-3 text-indigo-600 dark:text-indigo-400" />
              <span>Before vs After</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTopologyModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium text-xs flex items-center gap-1.5 transition-all border border-indigo-200 dark:border-indigo-800 active:scale-95 cursor-pointer"
              title="Inspect competitor internal link topology, destination hubs & anchor text"
            >
              <Network className="size-3 text-indigo-600 dark:text-indigo-400" />
              <span>Link Topology</span>
            </button>

            {/* Unified Export Hub Dropdown */}
            <ExportDropdown
              report={report}
              validResults={validResults}
              targetUrl={effectiveTargetUrl}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
            />
          </div>
        </div>

        {/* Tier 2: Balanced 2-Column Cockpit Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 pt-3.5 items-stretch">
          
          {/* Left Column (7 Cols): Benchmark Arena (Target Page vs Competitors) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3 min-w-0">
            {/* Target Page Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                  Target Page (Your Site)
                </span>
                {targetAudit?.wordCount ? (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    • {targetAudit.wordCount.toLocaleString()} words
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                <a
                  href={effectiveTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 max-w-full group"
                  title={effectiveTargetUrl}
                >
                  <span className="truncate">{effectiveTargetUrl}</span>
                  <ExternalLink className="size-3.5 shrink-0 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </a>
              </div>

              {targetAudit?.meta?.title && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl" title={targetAudit.meta.title}>
                  {targetAudit.meta.title}
                </p>
              )}
            </div>

            {/* Visual VS Divider */}
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 text-[10px] font-mono font-bold">
              <div className="h-px bg-slate-200/80 dark:bg-white/[0.06] flex-1" />
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 tracking-wider">
                BENCHMARKED AGAINST {competitorCount} COMPETITOR{competitorCount > 1 ? 'S' : ''}
              </span>
              <div className="h-px bg-slate-200/80 dark:bg-white/[0.06] flex-1" />
            </div>

            {/* Competitor Domain Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {competitorUrls.length > 0 ? (
                competitorUrls.map((cUrl, cIdx) => {
                  let host = '';
                  try {
                    host = new URL(cUrl).hostname.replace(/^www\./, '');
                  } catch {
                    host = cUrl;
                  }
                  const compAudit = validResults.find((r) => r.url === cUrl);
                  return (
                    <a
                      key={cIdx}
                      href={cUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors group max-w-[240px]"
                      title={cUrl}
                    >
                      <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{host}</span>
                      {compAudit?.wordCount ? (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          ({compAudit.wordCount.toLocaleString()}w)
                        </span>
                      ) : null}
                      <ExternalLink className="size-3 text-slate-400 group-hover:text-emerald-500 shrink-0 transition-colors" />
                    </a>
                  );
                })
              ) : (
                <span className="font-mono text-xs text-slate-400">Single URL baseline audit (no competitors added)</span>
              )}
            </div>
          </div>

          {/* Right Column (5 Cols): Elevated Executive Parity Scorecard */}
          <div className="lg:col-span-5 rounded-xl p-4 bg-slate-50/90 dark:bg-[#070b14]/80 border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-3 shadow-xs">
            
            {/* Score & Gauge Row */}
            <div className="flex items-center gap-3.5">
              <div className="relative size-12 flex items-center justify-center shrink-0">
                <svg className="size-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-slate-200 dark:text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className={
                      (report.alignmentScore || 0) >= 70
                        ? 'text-emerald-500'
                        : (report.alignmentScore || 0) >= 50
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (125.6 * (report.alignmentScore || 70)) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span
                  className={`absolute font-heading font-extrabold text-xs ${
                    (report.alignmentScore || 0) >= 70
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : (report.alignmentScore || 0) >= 50
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {report.alignmentScore}%
                </span>
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  SERP Parity Index
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`inline-block size-1.5 rounded-full ${
                      (report.alignmentScore || 0) >= 70
                        ? 'bg-emerald-500'
                        : (report.alignmentScore || 0) >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span>
                    {(report.alignmentScore || 0) >= 75
                      ? 'Strong Parity'
                      : (report.alignmentScore || 0) >= 50
                      ? 'Moderate Alignment'
                      : 'Critical Parity Gaps'}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">
                    • {report.opportunityCount} Priority Gaps
                  </span>
                </div>
              </div>
            </div>

            {/* Verdict Takeaway */}
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2" title={report.verdictHeadline}>
              {report.verdictHeadline || 'Target page benchmarked against top ranking competitors.'}
            </p>

            {/* Interactive Jump to Roadmap */}
            <button
              type="button"
              onClick={handleGoToActionPlan}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1 transition-colors self-start cursor-pointer group"
            >
              <span>Explore Prioritized Action Roadmap</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </button>

          </div>

        </div>

      </div>

      {/* 2. STICKY WORKSPACE NAVIGATION TABS (Mobile-friendly horizontal touch carousel) */}
      <div
        id="workspace-tabs-bar"
        className="sticky top-16 z-30 p-1.5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        {/* Tab 1: Overview */}
        <button
          type="button"
          onClick={() => handleTabSwitch('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Activity className="size-3.5" />
          <span>Overview &amp; Roadmap</span>
        </button>

        {/* Tab 2: Keywords */}
        {validResults.length >= 2 && (
          <button
            type="button"
            onClick={() => handleTabSwitch('keywords')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'keywords'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Target className="size-3.5" />
            <span>Keyword Gaps</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'keywords'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              }`}
            >
              Gap Matrix
            </span>
          </button>
        )}

        {/* Tab 3: Comparison Matrix */}
        {validResults.length >= 2 && (
          <button
            type="button"
            onClick={() => handleTabSwitch('matrix')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'matrix'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Layers className="size-3.5" />
            <span>Multi-URL Matrix</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'matrix'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              {validResults.length} URLs
            </span>
          </button>
        )}

        {/* Tab 4: Single URL Inspector */}
        <button
          type="button"
          onClick={() => handleTabSwitch('inspector')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'inspector'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Search className="size-3.5" />
          <span>URL Deep Inspector</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'inspector'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            Interactive
          </span>
        </button>

        {/* Tab 5: Content Brief */}
        <button
          type="button"
          onClick={() => handleTabSwitch('brief')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'brief'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <FileText className="size-3.5" />
          <span>Strategic Content Brief</span>
        </button>
      </div>

      {/* 3. TAB WORKSPACE CONTENTS */}
      <div className="space-y-8">
        
        {/* ========================================== */}
        {/* TAB 1: OVERVIEW & ROADMAP                  */}
        {/* ========================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Executive Verdict Header Card */}
            <div id="decision-hero-section">
              <SerpHeroHeader
                report={report}
                results={validResults}
                onScrollToActionPlan={handleGoToActionPlan}
              />
            </div>

            {/* Winning SERP Consensus Blueprint */}
            {report.serpConsensusPatterns && report.serpConsensusPatterns.length > 0 && (
              <div id="consensus-blueprint-section">
                <SerpConsensusBlueprint patterns={report.serpConsensusPatterns} />
              </div>
            )}

            {/* Impact x Effort Action Roadmap */}
            {report.evidenceActions && report.evidenceActions.length > 0 && (
              <div id="action-plan-section">
                <ActionMatrixRoadmap actions={report.evidenceActions} />
              </div>
            )}

            {/* CHAPTER 03: FOUNDATIONS & COMPETITIVE SAFEGUARDS (2-COLUMN BALANCED DECK) */}
            {(report.technicalHygiene || (report.dontTouchStrengths && report.dontTouchStrengths.length > 0)) && (
              <div id="foundations-safeguards-section" className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    Chapter 03 · Foundations &amp; Safeguards Deck
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                  {report.technicalHygiene && (
                    <div id="technical-hygiene-section" className="flex flex-col">
                      <TechnicalHygieneCard technicalHygiene={report.technicalHygiene} />
                    </div>
                  )}
                  {report.dontTouchStrengths && report.dontTouchStrengths.length > 0 && (
                    <div id="strengths-section" className="flex flex-col">
                      <DontTouchStrengthsCard strengths={report.dontTouchStrengths} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next Phase Quick Navigation Bridge */}
            {validResults.length >= 2 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-50 to-emerald-500/15 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-900/30 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" />
                    <span>Next Workspace · Semantic &amp; Editorial Intelligence</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Ready to close content gaps? Discover missing competitor keywords
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                    You've audited technical parity. Now view the specific N-gram keyword phrases your competitors use and craft your high-ranking content outline.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabSwitch('keywords')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-sm shadow-emerald-600/20 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Explore Keyword Gaps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: KEYWORD & TOPIC GAPS               */}
        {/* ========================================== */}
        {activeTab === 'keywords' && validResults.length >= 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1.5">
                  <Target className="w-3 h-3" />
                  <span>Stage 02 · Editorial &amp; Semantic Strategy</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  Competitor Keyword Gaps &amp; Topic Matrix
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Cross-compare search terminology between your target page and ranking competitors to eliminate topic gaps.
                </p>
              </div>
            </div>
            <KeywordGapMatrix results={validResults} targetUrl={effectiveTargetUrl} />
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: MULTI-URL BENCHMARK MATRIX          */}
        {/* ========================================== */}
        {activeTab === 'matrix' && validResults.length >= 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1.5">
                  <Layers className="w-3 h-3" />
                  <span>Cross-URL Signal Comparison</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  Side-by-Side Competitor Benchmark Matrix
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Full technical, on-page, and link comparison table comparing all audited URLs horizontally.
                </p>
              </div>
            </div>
            <ComparisonMatrix results={validResults} targetUrl={effectiveTargetUrl} />
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: INTERACTIVE SINGLE URL INSPECTOR    */}
        {/* ========================================== */}
        {activeTab === 'inspector' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1.5">
                  <Search className="w-3 h-3" />
                  <span>DOM &amp; Technical Deep Dive</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  Single Page Technical Inspector
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Select any URL below to inspect its heading hierarchy tree, SERP snippet, internal links, and technical tags without scrolling.
                </p>
              </div>

              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 self-start sm:self-auto shrink-0">
                {validResults.length} URLs Ready
              </span>
            </div>

            {/* Interactive URL Switcher Dock */}
            <div className="p-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                {validResults.map((audit, idx) => {
                  const isTarget = audit.url === effectiveTargetUrl;
                  const isSelected = activeUrlIndex === idx;
                  let host = '';
                  try {
                    const parsed = new URL(audit.url);
                    host = parsed.hostname.replace(/^www\./, '') + (parsed.pathname !== '/' ? parsed.pathname.slice(0, 16) + '...' : '');
                  } catch {
                    host = audit.url.slice(0, 24);
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveUrlIndex(idx)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10'
                      }`}
                    >
                      {isTarget ? (
                        <>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-500'}`} />
                          <span className={`font-mono text-[10px] uppercase tracking-wider font-bold mr-0.5 ${isSelected ? 'text-emerald-300 dark:text-emerald-700' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            Target (You):
                          </span>
                          <span className="truncate max-w-[180px] font-bold">{host}</span>
                        </>
                      ) : (
                        <>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-slate-400 dark:bg-slate-600' : 'bg-slate-400'}`} />
                          <span className={`font-mono text-[10px] uppercase tracking-wider font-bold mr-0.5 ${isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                            #{idx}:
                          </span>
                          <span className="truncate max-w-[180px] font-medium">{host}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Single Page Audit Card */}
            {validResults[activeUrlIndex] && (
              <div className="animate-in fade-in duration-200">
                <SingleAuditCard audit={validResults[activeUrlIndex]} />
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: STRATEGIC CONTENT BRIEF             */}
        {/* ========================================== */}
        {activeTab === 'brief' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1.5">
                  <FileCode className="w-3 h-3" />
                  <span>Stage 03 · Editorial Execution &amp; Briefing</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  Strategic SEO Content Brief &amp; Heading Outline
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Evidence-based content specifications, keyword placement rules, and competitor heading architecture for writers.
                </p>
              </div>
            </div>
            <ContentBriefGenerator
              results={validResults}
              targetUrl={effectiveTargetUrl}
              targetKeyword={targetKeyword}
            />
          </div>
        )}

      </div>

      {/* Branded White-Label PDF Export Modal */}
      {isPdfModalOpen && targetAudit && (
        <WhiteLabelPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          audit={targetAudit}
        />
      )}

      {/* Before vs After Audit Progress Tracker Modal */}
      {isDiffModalOpen && targetAudit && (
        <AuditDiffModal
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          currentAudit={targetAudit}
          targetKeyword={targetKeyword}
        />
      )}

      {/* Competitor Internal Linking Topology Modal */}
      {isTopologyModalOpen && (
        <InternalLinkTopologyModal
          isOpen={isTopologyModalOpen}
          onClose={() => setIsTopologyModalOpen(false)}
          initialUrl={effectiveTargetUrl}
          initialKeyword={targetKeyword}
          links={targetAudit?.linkAudit?.links || validResults[0]?.linkAudit?.links || []}
          wordCount={targetAudit?.wordCount || validResults[0]?.wordCount || 1000}
          competitorAudits={validResults}
          pageTitle={targetAudit?.meta?.title || validResults[0]?.meta?.title || ''}
          headings={(targetAudit?.headings || validResults[0]?.headings || []).map((h) => ({ level: h.level, text: h.text }))}
        />
      )}

      {/* Cloud Workspace Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        featureTitle="Cloud Audit Saving"
      />

    </div>
  );
};
