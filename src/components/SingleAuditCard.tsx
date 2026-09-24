'use client';

import React, { useState } from 'react';
import { SinglePageAudit } from '@/types/seo';
import { HeadingTree } from './HeadingTree';
import { KeywordTable } from './KeywordTable';
import { ImageAuditList } from './ImageAuditList';
import { AuditScorecard } from './AuditScorecard';
import { ReadabilityCard } from './ReadabilityCard';
import { SerpSocialSimulator } from './SerpSocialSimulator';
import { LinkInspectorCard } from './LinkInspectorCard';
import { TechnicalHealthCard } from './TechnicalHealthCard';
import { CoreWebVitalsCard } from './CoreWebVitalsCard';
import { SearchIntentEntityCard } from './SearchIntentEntityCard';
import { WhiteLabelPdfModal } from './WhiteLabelPdfModal';
import { AiRewriteModal } from './AiRewriteModal';
import { JsonLdSchemaModal } from './JsonLdSchemaModal';
import { AuditDiffModal } from './AuditDiffModal';
import { FeaturedSnippetModal } from './FeaturedSnippetModal';
import { ContentScratchpadModal } from './ContentScratchpadModal';
import { InternalLinkTopologyModal } from './InternalLinkTopologyModal';
import { Tooltip } from './Tooltip';
import {
  FileText,
  Clock,
  ExternalLink,
  Layers,
  Key,
  Image as ImageIcon,
  Link2,
  AlertCircle,
  Award,
  BookOpen,
  Share2,
  Zap,
  Download,
  Activity,
  Target,
  ShieldCheck,
  Sparkles,
  FileCode,
  GitCompare,
  FileEdit,
  Network,
} from 'lucide-react';

interface SingleAuditCardProps {
  audit: SinglePageAudit;
}

type MainPillar = 'overview' | 'technical' | 'content' | 'links';
type TechnicalSubTab = 'hygiene' | 'vitals';
type ContentSubTab = 'headings' | 'intent' | 'readability' | 'keywords';
type LinksSubTab = 'serp' | 'images' | 'links';

export const SingleAuditCard: React.FC<SingleAuditCardProps> = ({ audit }) => {
  const [activePillar, setActivePillar] = useState<MainPillar>('overview');
  const [techSubTab, setTechSubTab] = useState<TechnicalSubTab>('hygiene');
  const [contentSubTab, setContentSubTab] = useState<ContentSubTab>('headings');
  const [linksSubTab, setLinksSubTab] = useState<LinksSubTab>('serp');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isRewriteModalOpen, setIsRewriteModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isLinkTopologyOpen, setIsLinkTopologyOpen] = useState(false);

  if (audit.status === 'error') {
    return (
      <div className="p-6 rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 my-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-rose-700 dark:text-rose-400">Failed to Audit URL</h3>
            <a
              href={audit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-700 dark:text-slate-300 font-mono mt-1 hover:underline flex items-center gap-1 break-all"
            >
              {audit.url}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">{audit.errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const { meta, wordCount, readingTimeMinutes, headings, imageAudit, linkAudit, keywords, readability, technicalAudit } = audit;

  return (
    <div className="rounded-2xl p-5 sm:p-7 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-xs space-y-6 my-4">
      {/* 1. Title & Top Metadata Header */}
      <div className="space-y-4 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
        {/* Top Meta & Quant Stats Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Audit Complete ({audit.fetchTimeMs}ms)
            </span>
            {audit.spaDiagnostic?.isClientRenderedSpa && (
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1"
                title={audit.spaDiagnostic.spaWarning}
              >
                <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                SPA ({audit.spaDiagnostic.frameworkDetected || 'Client-Side'} &bull; {audit.spaDiagnostic.extractionMethod})
              </span>
            )}
            <a
              href={audit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono font-medium truncate max-w-xs sm:max-w-md"
              title={audit.url}
            >
              <span className="truncate">{audit.url}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          {/* Quick Metrics: Word Count & Reading Time */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Words:</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {wordCount.toLocaleString()}
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Read:</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {readingTimeMinutes}m
              </span>
            </div>
          </div>
        </div>

        {/* Page Title & Meta Description */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {meta.title || 'No Title Tag Found'}
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 max-w-5xl leading-relaxed">
            {meta.description || 'No Meta Description Found'}
          </p>
        </div>

        {/* SPA Diagnostic Banner if fallback was active */}
        {audit.spaDiagnostic?.isClientRenderedSpa && audit.spaDiagnostic.spaWarning && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-300">
            <Sparkles className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Client-Side Rendered (SPA) Detected:
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-200/70 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-semibold">
                  Extracted via {audit.spaDiagnostic.extractionMethod}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {audit.spaDiagnostic.spaWarning}
              </p>
            </div>
          </div>
        )}

        {/* Diagnostic Actions Strip */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1">
          <div className="flex items-center gap-0.5">
            <Tooltip content="Before vs After" side="top">
              <button
                type="button"
                onClick={() => setIsDiffModalOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Before vs After"
              >
                <GitCompare className="size-4" />
              </button>
            </Tooltip>

            <Tooltip content="Position 0 Snippet" side="top">
              <button
                type="button"
                onClick={() => setIsSnippetModalOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Featured Snippet Optimization"
              >
                <Award className="size-4" />
              </button>
            </Tooltip>

            <Tooltip content="Live SEO Scratchpad" side="top">
              <button
                type="button"
                onClick={() => setIsScratchpadOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Live SEO Scratchpad"
              >
                <FileEdit className="size-4" />
              </button>
            </Tooltip>

            <Tooltip content="Link Topology" side="top">
              <button
                type="button"
                onClick={() => setIsLinkTopologyOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Internal Link Topology"
              >
                <Network className="size-4" />
              </button>
            </Tooltip>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-0.5 hidden sm:block" />

          <Tooltip content="Download Client PDF" side="top">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Export Client PDF</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 2. Primary 4-Pillar Executive Segmented Dock */}
      <div
        role="tablist"
        aria-label="URL Deep Inspector Pillars"
        className="p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-1"
      >
        {/* Pillar 1 */}
        <button
          role="tab"
          aria-selected={activePillar === 'overview'}
          onClick={() => setActivePillar('overview')}
          className={`py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePillar === 'overview'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.05] font-medium'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>1. Scorecard &amp; Basics</span>
        </button>

        {/* Pillar 2 */}
        <button
          role="tab"
          aria-selected={activePillar === 'technical'}
          onClick={() => setActivePillar('technical')}
          className={`py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePillar === 'technical'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.05] font-medium'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>2. Speed &amp; Web Vitals</span>
        </button>

        {/* Pillar 3 */}
        <button
          role="tab"
          aria-selected={activePillar === 'content'}
          onClick={() => setActivePillar('content')}
          className={`py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePillar === 'content'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.05] font-medium'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Headings &amp; Semantics</span>
        </button>

        {/* Pillar 4 */}
        <button
          role="tab"
          aria-selected={activePillar === 'links'}
          onClick={() => setActivePillar('links')}
          className={`py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePillar === 'links'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.05] font-medium'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>4. Media, Links &amp; SERP</span>
        </button>
      </div>

      {/* 3. Dynamic Pillar Content Views */}
      <div className="pt-1">
        {/* ======================================================== */}
        {/* PILLAR 1: OVERVIEW & SCORECARD                           */}
        {/* ======================================================== */}
        {activePillar === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Title & Meta Validation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title Tag Analysis */}
              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Title Tag Validation</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        meta.titleTruncated
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {meta.titleTruncated ? 'May Truncate' : 'Optimal Length'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-white/[0.05]">
                    <span>Length: <strong className="text-slate-800 dark:text-slate-100 font-mono tabular-nums">{meta.titleLength}</strong> / 60 chars</span>
                    <span>Estimated Width: <strong className="text-slate-800 dark:text-slate-100 font-mono tabular-nums">~{meta.titlePixelEstimate}px</strong> / 580px</span>
                  </div>
                </div>

                {(meta.titleTruncated || meta.titleLength === 0) && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsRewriteModalOpen(true)}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Rewrite with AI</span>
                    </button>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Target 50–60 chars</span>
                  </div>
                )}
              </div>

              {/* Meta Description Analysis */}
              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Meta Description Validation</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        meta.descriptionTruncated
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : meta.descriptionLength === 0
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {meta.descriptionTruncated ? 'Too Long (>160)' : meta.descriptionLength === 0 ? 'Missing' : 'Optimal Length'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-white/[0.05]">
                    <span>Length: <strong className="text-slate-800 dark:text-slate-100 font-mono tabular-nums">{meta.descriptionLength}</strong> / 160 chars</span>
                    <div className="flex items-center gap-2">
                      <span>JSON-LD Schema: <strong className={`font-mono ${meta.hasJsonLdSchema ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>{meta.hasJsonLdSchema ? 'Detected' : 'None'}</strong></span>
                      <Tooltip content="Build or Inspect Schema" side="top">
                        <button
                          type="button"
                          onClick={() => setIsSchemaModalOpen(true)}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FileCode className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>{meta.hasJsonLdSchema ? 'Schema Tools' : 'Build Schema'}</span>
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {(meta.descriptionTruncated || meta.descriptionLength === 0) && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsRewriteModalOpen(true)}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Write Description with AI</span>
                    </button>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Target 140–155 chars</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Scorecard Checklists */}
            <AuditScorecard audit={audit} />
          </div>
        )}

        {/* ======================================================== */}
        {/* PILLAR 2: SPEED & WEB VITALS                             */}
        {/* ======================================================== */}
        {activePillar === 'technical' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sub-navigation Pills */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setTechSubTab('hygiene')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  techSubTab === 'hygiene'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Technical Hygiene &amp; Server Speed</span>
              </button>

              <button
                type="button"
                onClick={() => setTechSubTab('vitals')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  techSubTab === 'vitals'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Google Core Web Vitals (CrUX Field Data)</span>
              </button>
            </div>

            {/* Sub-tab view */}
            {techSubTab === 'hygiene' && technicalAudit && (
              <TechnicalHealthCard technicalAudit={technicalAudit} robotsValidation={audit.robotsValidation} />
            )}
            {techSubTab === 'vitals' && (
              <CoreWebVitalsCard initialUrl={audit.url} />
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PILLAR 3: HEADINGS & SEMANTICS                           */}
        {/* ======================================================== */}
        {activePillar === 'content' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sub-navigation Pills */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-white/[0.08] overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setContentSubTab('headings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  contentSubTab === 'headings'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Heading Hierarchy Tree ({headings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('intent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  contentSubTab === 'intent'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Search Intent &amp; Topics</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('readability')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  contentSubTab === 'readability'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Readability &amp; Tone</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('keywords')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  contentSubTab === 'keywords'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Keyword Density Table</span>
              </button>
            </div>

            {/* Sub-tab view */}
            {contentSubTab === 'headings' && <HeadingTree headings={headings} />}
            {contentSubTab === 'intent' && (
              audit.searchIntent ? (
                <SearchIntentEntityCard searchIntent={audit.searchIntent} />
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                  No search intent or entity data extracted for this URL.
                </div>
              )
            )}
            {contentSubTab === 'readability' && readability && (
              <ReadabilityCard readability={readability} />
            )}
            {contentSubTab === 'keywords' && <KeywordTable keywords={keywords} />}
          </div>
        )}

        {/* ======================================================== */}
        {/* PILLAR 4: MEDIA, LINKS & SERP PREVIEW                    */}
        {/* ======================================================== */}
        {activePillar === 'links' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sub-navigation Pills */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-white/[0.08] overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setLinksSubTab('serp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  linksSubTab === 'serp'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SERP &amp; Social Simulator</span>
              </button>

              <button
                type="button"
                onClick={() => setLinksSubTab('images')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  linksSubTab === 'images'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Images &amp; ALT Tags ({imageAudit.totalImages})</span>
              </button>

              <button
                type="button"
                onClick={() => setLinksSubTab('links')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  linksSubTab === 'links'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Link Graph &amp; Affiliates ({linkAudit.totalLinks})</span>
              </button>
            </div>

            {/* Sub-tab view */}
            {linksSubTab === 'serp' && <SerpSocialSimulator meta={meta} initialUrl={audit.url} />}
            {linksSubTab === 'images' && <ImageAuditList imageAudit={imageAudit} />}
            {linksSubTab === 'links' && <LinkInspectorCard linkAudit={linkAudit} />}
          </div>
        )}
      </div>

      {/* White-Label PDF Export Modal */}
      <WhiteLabelPdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} audit={audit} />

      {/* AI Rewrite Modal */}
      {isRewriteModalOpen && (
        <AiRewriteModal
          isOpen={isRewriteModalOpen}
          onClose={() => setIsRewriteModalOpen(false)}
          currentTitle={meta.title}
          currentDescription={meta.description}
          pageUrl={audit.url}
          targetKeyword={keywords?.oneGram?.[0]?.phrase || ''}
        />
      )}

      {/* JSON-LD Schema Modal */}
      {isSchemaModalOpen && (
        <JsonLdSchemaModal
          isOpen={isSchemaModalOpen}
          onClose={() => setIsSchemaModalOpen(false)}
          initialTitle={meta.title}
          initialDescription={meta.description}
          initialUrl={meta.canonicalUrl || audit.url}
          initialKeyword={keywords?.oneGram?.[0]?.phrase || ''}
          headings={audit.headings}
        />
      )}

      {/* Before vs After Audit Progress Diff Modal */}
      {isDiffModalOpen && (
        <AuditDiffModal
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          currentAudit={audit}
          targetKeyword={keywords?.oneGram?.[0]?.phrase || ''}
        />
      )}

      {/* Google Featured Snippet (Position 0) Optimizer Modal */}
      {isSnippetModalOpen && (
        <FeaturedSnippetModal
          isOpen={isSnippetModalOpen}
          onClose={() => setIsSnippetModalOpen(false)}
          initialQuery={meta.title || ''}
          initialHeading={
            audit.headings.find((h) => h.level === 'h2')?.text
              ? `## ${audit.headings.find((h) => h.level === 'h2')!.text}`
              : undefined
          }
          targetUrl={audit.url}
        />
      )}

      {/* Real-Time Live SEO Content Scratchpad Modal */}
      {isScratchpadOpen && (
        <ContentScratchpadModal
          isOpen={isScratchpadOpen}
          onClose={() => setIsScratchpadOpen(false)}
          initialTitle={meta.title || ''}
          initialContent={audit.headings.map((h) => `${h.level === 'h1' ? '# ' : h.level === 'h2' ? '## ' : '### '}${h.text}`).join('\n\n')}
          targetKeyword={keywords?.oneGram?.[0]?.phrase || ''}
          targetWordCount={wordCount || 1000}
          competitorKeywords={[...(keywords?.twoGram || []), ...(keywords?.threeGram || [])].slice(0, 10).map((k) => ({ phrase: k.phrase, targetMin: 1, targetMax: 4 }))}
          suggestedHeadings={audit.headings.map((h) => ({ level: h.level, text: h.text }))}
          targetUrl={audit.url}
        />
      )}

      {/* Competitor Internal Linking Topology Modal */}
      {isLinkTopologyOpen && (
        <InternalLinkTopologyModal
          isOpen={isLinkTopologyOpen}
          onClose={() => setIsLinkTopologyOpen(false)}
          initialUrl={audit.url}
          initialKeyword={keywords?.oneGram?.[0]?.phrase || ''}
          links={audit.linkAudit?.links || []}
          wordCount={wordCount || 1000}
          pageTitle={meta.title || ''}
          headings={audit.headings.map((h) => ({ level: h.level, text: h.text }))}
        />
      )}
    </div>
  );
};
