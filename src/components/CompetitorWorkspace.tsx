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
import dynamic from 'next/dynamic';
import { SingleAuditCard } from './SingleAuditCard';
import { ExportDropdown } from './ExportDropdown';
import { Tooltip } from './Tooltip';

const ContentBriefGenerator = dynamic(
  () => import('./ContentBriefGenerator').then((mod) => mod.ContentBriefGenerator),
  { ssr: false }
);
const WhiteLabelPdfModal = dynamic(
  () => import('./WhiteLabelPdfModal').then((mod) => mod.WhiteLabelPdfModal),
  { ssr: false }
);
const AuditDiffModal = dynamic(
  () => import('./AuditDiffModal').then((mod) => mod.AuditDiffModal),
  { ssr: false }
);
const InternalLinkTopologyModal = dynamic(
  () => import('./InternalLinkTopologyModal').then((mod) => mod.InternalLinkTopologyModal),
  { ssr: false }
);
const ShareAuditModal = dynamic(
  () => import('./ShareAuditModal').then((mod) => mod.ShareAuditModal),
  { ssr: false }
);
const AuthModal = dynamic(
  () => import('./AuthModal').then((mod) => mod.AuthModal),
  { ssr: false }
);
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
  AlertTriangle,
  AlertCircle,
  Cloud,
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter valid successful results vs failed results
  const validResults = useMemo(() => {
    return (results || []).filter((r) => r.status === 'success');
  }, [results]);

  const failedResults = useMemo(() => {
    return (results || []).filter((r) => r.status === 'error');
  }, [results]);

  // Compute SERP alignment report
  const report = useMemo(() => {
    if (validResults.length === 0) return null;
    return analyzeSerpAlignment(validResults, targetUrl, targetKeyword);
  }, [validResults, targetUrl, targetKeyword]);

  if (!results || results.length === 0) {
    return null;
  }

  // Gracefully handle edge-case where ALL audited URLs failed (e.g. offline, DNS failure, 404)
  if (validResults.length === 0) {
    return (
      <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-center space-y-4 max-w-2xl mx-auto my-8 animate-in fade-in">
        <div className="size-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Unable to Benchmark Audited URLs
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            The target and competitor servers could not be crawled due to DNS resolution failures, offline hosts, or connection timeouts.
          </p>
        </div>
        <div className="space-y-2 text-left max-w-lg mx-auto pt-2">
          {failedResults.map((f, i) => (
            <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 text-xs flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {f.url}
                </span>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 leading-relaxed block">
                  {f.errorMessage || 'Failed to fetch webpage.'}
                </span>
              </div>
            </div>
          ))}
        </div>
        {onEditUrls && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onEditUrls}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Adjust Competitor URLs</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const effectiveTargetUrl = targetUrl || validResults[0]?.url || '';
  const targetAudit = validResults.find((r) => r.url === effectiveTargetUrl) || validResults[0];
  const competitorUrls = validResults.filter((r) => r.url !== effectiveTargetUrl).map((r) => r.url);
  const competitorCount = competitorUrls.length;

  const availableTabs: WorkspaceTab[] = useMemo(() => {
    const tabs: WorkspaceTab[] = ['overview'];
    if (validResults.length >= 2) tabs.push('keywords', 'matrix');
    tabs.push('inspector', 'brief');
    return tabs;
  }, [validResults.length]);

  const handleTabSwitch = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    const el = document.getElementById('workspace-tabs-bar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleTabsKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = availableTabs.indexOf(activeTab);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextTab = availableTabs[(currentIndex + 1) % availableTabs.length];
      handleTabSwitch(nextTab);
      document.getElementById(`tab-${nextTab}`)?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevTab = availableTabs[(currentIndex - 1 + availableTabs.length) % availableTabs.length];
      handleTabSwitch(prevTab);
      document.getElementById(`tab-${prevTab}`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleTabSwitch(availableTabs[0]);
      document.getElementById(`tab-${availableTabs[0]}`)?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastTab = availableTabs[availableTabs.length - 1];
      handleTabSwitch(lastTab);
      document.getElementById(`tab-${lastTab}`)?.focus();
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
      
      {/* Competitor Offline / Error Alert Banner */}
      {failedResults.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-950 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                {failedResults.length === 1 ? '1 Competitor URL Unreachable' : `${failedResults.length} Competitor URLs Unreachable`}:
              </span>{' '}
              <span className="text-slate-700 dark:text-slate-300">
                {failedResults.map((f) => {
                  try {
                    return new URL(f.url).hostname;
                  } catch {
                    return f.url;
                  }
                }).join(', ')}{' '}
                — {failedResults[0].errorMessage || 'Connection timeout or offline host'}. (Excluded from benchmark matrix).
              </span>
            </div>
          </div>
          {onEditUrls && (
            <button
              type="button"
              onClick={onEditUrls}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold text-xs shrink-0 self-start sm:self-auto transition-colors cursor-pointer border border-amber-500/30"
            >
              Replace URL
            </button>
          )}
        </div>
      )}

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
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            {/* Quick Utility Icon Buttons (Borderless & Clean) */}
            <div className="flex items-center gap-0.5">
              {/* Cloud Sync Status / Action */}
              {session?.user?.email ? (
                <Tooltip content="Saved to Cloud" side="top">
                  <div
                    className="p-1.5 sm:p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-default relative"
                    aria-label="Saved to Cloud Workspace"
                  >
                    <Cloud className="size-4" />
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-emerald-500" />
                  </div>
                </Tooltip>
              ) : (
                <Tooltip content="Save to Cloud" side="top">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Save to Cloud"
                  >
                    <Cloud className="size-4" />
                  </button>
                </Tooltip>
              )}

              <Tooltip content="Share Audit" side="top">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Share benchmark audit"
                >
                  <Share2 className="size-4" />
                </button>
              </Tooltip>

              <Tooltip content={copied ? "Summary Copied!" : "Copy Summary"} side="top">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Copy executive summary"
                >
                  {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </button>
              </Tooltip>

              <Tooltip content="Before vs After" side="top">
                <button
                  type="button"
                  onClick={() => setIsDiffModalOpen(true)}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Compare Before vs After"
                >
                  <GitCompare className="size-4" />
                </button>
              </Tooltip>

              <Tooltip content="Link Topology" side="top">
                <button
                  type="button"
                  onClick={() => setIsTopologyModalOpen(true)}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Inspect link topology"
                >
                  <Network className="size-4" />
                </button>
              </Tooltip>
            </div>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />

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
                  <ExternalLink className="size-3.5 shrink-0 text-slate-500 group-hover:text-emerald-500 dark:text-slate-400 transition-colors" />
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
                      className="px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors group max-w-[260px]"
                      title={cUrl}
                    >
                      <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{host}</span>
                      {compAudit?.wordCount ? (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          ({compAudit.wordCount.toLocaleString()}w)
                        </span>
                      ) : null}
                      {compAudit?.technicalAudit?.ttfbMs ? (
                        <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono font-semibold">
                          • {compAudit.technicalAudit.ttfbMs}ms
                        </span>
                      ) : null}
                      <ExternalLink className="size-3 text-slate-500 group-hover:text-emerald-500 dark:text-slate-400 shrink-0 transition-colors" />
                    </a>
                  );
                })
              ) : (
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">Single URL baseline audit (no competitors added)</span>
              )}
            </div>
          </div>

          {/* Right Column (5 Cols): Elevated Executive Parity Scorecard */}
          <div className="lg:col-span-5 rounded-xl p-4 bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-3 shadow-xs">
            
            {/* Score & Gauge Row */}
            <div className="flex items-center gap-3.5">
              <div className="relative size-14 sm:size-16 flex items-center justify-center shrink-0">
                <svg className="size-14 sm:size-16 -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="23"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-slate-200 dark:text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="23"
                    stroke="currentColor"
                    strokeWidth="4"
                    className={
                      (report.alignmentScore || 0) >= 70
                        ? 'text-emerald-500'
                        : (report.alignmentScore || 0) >= 50
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }
                    strokeDasharray="144.5"
                    strokeDashoffset={144.5 - (144.5 * (report.alignmentScore || 70)) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span
                  className={`absolute font-heading font-extrabold text-sm sm:text-base tabular-nums ${
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
        role="tablist"
        aria-label="Competitor audit workspace sections"
        onKeyDown={handleTabsKeyDown}
        className="sticky top-16 z-30 p-1.5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        {/* Tab 1: Overview */}
        <Tooltip content="Overview & Action Roadmap" side="bottom">
          <button
            id="tab-overview"
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="panel-overview"
            tabIndex={activeTab === 'overview' ? 0 : -1}
            type="button"
            onClick={() => handleTabSwitch('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Activity className="size-3.5" />
            <span>Overview &amp; Roadmap</span>
          </button>
        </Tooltip>

        {/* Tab 2: Keywords */}
        {validResults.length >= 2 && (
          <Tooltip content="Competitor Gap Matrix" side="bottom">
            <button
              id="tab-keywords"
              role="tab"
              aria-selected={activeTab === 'keywords'}
              aria-controls="panel-keywords"
              tabIndex={activeTab === 'keywords' ? 0 : -1}
              type="button"
              onClick={() => handleTabSwitch('keywords')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                activeTab === 'keywords'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Target className="size-3.5" />
              <span>Keyword Gaps</span>
            </button>
          </Tooltip>
        )}

        {/* Tab 3: Comparison Matrix */}
        {validResults.length >= 2 && (
          <Tooltip content={`${validResults.length} Audited URLs`} side="bottom">
            <button
              id="tab-matrix"
              role="tab"
              aria-selected={activeTab === 'matrix'}
              aria-controls="panel-matrix"
              tabIndex={activeTab === 'matrix' ? 0 : -1}
              type="button"
              onClick={() => handleTabSwitch('matrix')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                activeTab === 'matrix'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Multi-URL Matrix</span>
            </button>
          </Tooltip>
        )}

        {/* Tab 4: Single URL Inspector */}
        <Tooltip content="Interactive Page Inspector" side="bottom">
          <button
            id="tab-inspector"
            role="tab"
            aria-selected={activeTab === 'inspector'}
            aria-controls="panel-inspector"
            tabIndex={activeTab === 'inspector' ? 0 : -1}
            type="button"
            onClick={() => handleTabSwitch('inspector')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'inspector'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Search className="size-3.5" />
            <span>URL Deep Inspector</span>
          </button>
        </Tooltip>

        {/* Tab 5: Content Brief */}
        <Tooltip content="Editorial Outline Brief" side="bottom">
          <button
            id="tab-brief"
            role="tab"
            aria-selected={activeTab === 'brief'}
            aria-controls="panel-brief"
            tabIndex={activeTab === 'brief' ? 0 : -1}
            type="button"
            onClick={() => handleTabSwitch('brief')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'brief'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <FileText className="size-3.5" />
            <span>Strategic Content Brief</span>
          </button>
        </Tooltip>
      </div>

      {/* 3. TAB WORKSPACE CONTENTS */}
      <div className="space-y-8">
        
        {/* ========================================== */}
        {/* TAB 1: OVERVIEW & ROADMAP                  */}
        {/* ========================================== */}
        {activeTab === 'overview' && (
          <div
            id="panel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            tabIndex={0}
            className="space-y-8 animate-in fade-in duration-200 outline-none"
          >
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-sm shadow-emerald-600/20 cursor-pointer active:scale-95 transition-[color,background-color,transform]"
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
          <div
            id="panel-keywords"
            role="tabpanel"
            aria-labelledby="tab-keywords"
            tabIndex={0}
            className="space-y-4 animate-in fade-in duration-200 outline-none"
          >
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
          <div
            id="panel-matrix"
            role="tabpanel"
            aria-labelledby="tab-matrix"
            tabIndex={0}
            className="space-y-4 animate-in fade-in duration-200 outline-none"
          >
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
          <div
            id="panel-inspector"
            role="tabpanel"
            aria-labelledby="tab-inspector"
            tabIndex={0}
            className="space-y-5 animate-in fade-in duration-200 outline-none"
          >
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

              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 self-start sm:self-auto shrink-0">
                {validResults.length} of {results.length} URLs Active
              </span>
            </div>

            {/* Interactive URL Switcher Dock */}
            <div className="p-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                {results.map((audit, idx) => {
                  const isTarget = audit.url === effectiveTargetUrl;
                  const isSelected = activeUrlIndex === idx;
                  const isFailed = audit.status === 'error';
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
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 cursor-pointer ${
                        isSelected
                          ? isFailed
                            ? 'bg-rose-600 text-white shadow-xs font-bold'
                            : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs font-bold'
                          : isFailed
                          ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10'
                      }`}
                    >
                      {isFailed ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-mono text-[10px] uppercase tracking-wider font-bold mr-0.5">
                            Offline:
                          </span>
                          <span className="truncate max-w-[180px] font-medium">{host}</span>
                        </>
                      ) : isTarget ? (
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
            {results[activeUrlIndex] && (
              <div className="animate-in fade-in duration-200">
                <SingleAuditCard audit={results[activeUrlIndex]} />
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: STRATEGIC CONTENT BRIEF             */}
        {/* ========================================== */}
        {activeTab === 'brief' && (
          <div
            id="panel-brief"
            role="tabpanel"
            aria-labelledby="tab-brief"
            tabIndex={0}
            className="space-y-4 animate-in fade-in duration-200 outline-none"
          >
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

      {/* Share Audit Modal */}
      {isShareModalOpen && (
        <ShareAuditModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          targetUrl={effectiveTargetUrl}
          alignmentScore={report.alignmentScore}
          targetKeyword={targetKeyword}
          verdictHeadline={report.verdictHeadline}
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
