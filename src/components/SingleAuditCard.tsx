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
import {
  FileText,
  Clock,
  ExternalLink,
  Layers,
  Key,
  Image,
  Link2,
  CheckCircle,
  AlertCircle,
  Globe,
  Info,
  Award,
  BookOpen,
  Share2,
  Zap,
  Download,
  Activity,
  Target,
} from 'lucide-react';

interface SingleAuditCardProps {
  audit: SinglePageAudit;
}

export const SingleAuditCard: React.FC<SingleAuditCardProps> = ({ audit }) => {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'technical' | 'vitals' | 'intent' | 'serp' | 'readability' | 'headings' | 'keywords' | 'images' | 'links'>('scorecard');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  if (audit.status === 'error') {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-red-500/30 bg-red-500/5 my-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-red-600 dark:text-red-400">Failed to Audit URL</h3>
            <a
              href={audit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-700 dark:text-gray-300 font-mono mt-1 hover:underline flex items-center gap-1 break-all"
            >
              {audit.url}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <p className="text-xs text-red-600/80 dark:text-red-300/80 mt-2">{audit.errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const { meta, wordCount, characterCount, readingTimeMinutes, headings, imageAudit, linkAudit, keywords, readability, technicalAudit } = audit;

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border shadow-sm space-y-6 my-6">
      {/* Title & Top Metadata Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Audit Complete ({audit.fetchTimeMs}ms)
            </span>
            <a
              href={audit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-mono min-w-0 max-w-[260px] sm:max-w-md"
              title={audit.url}
            >
              <span className="truncate">{audit.url}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2">{meta.title || 'No Title Tag Found'}</h3>
          <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 line-clamp-2">{meta.description || 'No Meta Description Found'}</p>
        </div>

        {/* Quick Stats Pills & White-Label PDF Export */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Client PDF</span>
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <div className="text-xs text-slate-500 dark:text-slate-400">Words:</div>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">{wordCount.toLocaleString()}</div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <div className="text-xs text-slate-500 dark:text-slate-400">Read Time:</div>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">{readingTimeMinutes} min</div>
          </div>
        </div>
      </div>

      {/* Title & Meta Health Check Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Title Tag Analysis */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Title Tag Validation</span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                meta.titleTruncated
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {meta.titleTruncated ? 'May Truncate' : 'Optimal Length'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/[0.05]">
            <span>Character Count: <strong className="text-slate-800 dark:text-slate-100 font-mono">{meta.titleLength}</strong> / 60 chars</span>
            <span>Pixel Width: <strong className="text-slate-800 dark:text-slate-100 font-mono">~{meta.titlePixelEstimate}px</strong> / 580px</span>
          </div>
        </div>

        {/* Meta Description Analysis */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Meta Description Validation</span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                meta.descriptionTruncated
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {meta.descriptionTruncated ? 'Too Long (>160)' : 'Optimal Length'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/[0.05]">
            <span>Character Count: <strong className="text-slate-800 dark:text-slate-100 font-mono">{meta.descriptionLength}</strong> / 160 chars</span>
            <span>JSON-LD Schema: <strong className={`font-mono ${meta.hasJsonLdSchema ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{meta.hasJsonLdSchema ? 'Detected' : 'None'}</strong></span>
          </div>
        </div>
      </div>

      {/* Tactile Segmented Control Track */}
      <div
        role="tablist"
        aria-label="Page Audit Sections"
        className="p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] flex items-center gap-1 overflow-x-auto scrollbar-none"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'scorecard'}
          aria-controls="panel-scorecard"
          onClick={() => setActiveTab('scorecard')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'scorecard'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'scorecard' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <Award className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>SEO Basics</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'technical'}
          aria-controls="panel-technical"
          onClick={() => setActiveTab('technical')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'technical'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'technical' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Technical Health</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'vitals'}
          aria-controls="panel-vitals"
          onClick={() => setActiveTab('vitals')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'vitals'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'vitals' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Web Vitals</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'intent'}
          aria-controls="panel-intent"
          onClick={() => setActiveTab('intent')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'intent'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'intent' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <Target className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Search Intent</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'serp'}
          aria-controls="panel-serp"
          onClick={() => setActiveTab('serp')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'serp'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'serp' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>SERP Preview</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'readability'}
          aria-controls="panel-readability"
          onClick={() => setActiveTab('readability')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'readability'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'readability' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Readability</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'headings'}
          aria-controls="panel-headings"
          onClick={() => setActiveTab('headings')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'headings'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'headings' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Headings ({headings.length})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'keywords'}
          aria-controls="panel-keywords"
          onClick={() => setActiveTab('keywords')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'keywords'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'keywords' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <Key className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Keywords</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'images'}
          aria-controls="panel-images"
          onClick={() => setActiveTab('images')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'images'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'images' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <Image className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Images ({imageAudit.totalImages})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'links'}
          aria-controls="panel-links"
          onClick={() => setActiveTab('links')}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'links'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/70 dark:border-white/10 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] font-medium'
          }`}
        >
          {activeTab === 'links' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <Link2 className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Links ({linkAudit.totalLinks})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div role="tabpanel" id={`panel-${activeTab}`}>
        {activeTab === 'scorecard' && <AuditScorecard audit={audit} />}
        {activeTab === 'technical' && technicalAudit && (
          <TechnicalHealthCard technicalAudit={technicalAudit} robotsValidation={audit.robotsValidation} />
        )}
        {activeTab === 'vitals' && <CoreWebVitalsCard initialUrl={audit.url} />}
        {activeTab === 'intent' && audit.searchIntent && <SearchIntentEntityCard searchIntent={audit.searchIntent} />}
        {activeTab === 'serp' && <SerpSocialSimulator meta={meta} initialUrl={audit.url} />}
        {activeTab === 'readability' && readability && <ReadabilityCard readability={readability} />}
        {activeTab === 'headings' && <HeadingTree headings={headings} />}
        {activeTab === 'keywords' && <KeywordTable keywords={keywords} />}
        {activeTab === 'images' && <ImageAuditList imageAudit={imageAudit} />}
        {activeTab === 'links' && <LinkInspectorCard linkAudit={linkAudit} />}
      </div>

      {/* White-Label PDF Export Modal */}
      <WhiteLabelPdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} audit={audit} />
    </div>
  );
};
