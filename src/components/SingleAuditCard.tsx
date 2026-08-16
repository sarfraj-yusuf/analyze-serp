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
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white line-clamp-2">{meta.title || 'No Title Tag Found'}</h3>
          <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 line-clamp-2">{meta.description || 'No Meta Description Found'}</p>
        </div>

        {/* Quick Stats Pills & White-Label PDF Export */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/20 hover:opacity-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Branded Client PDF</span>
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Word Count
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{wordCount.toLocaleString()}</div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Read Time
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{readingTimeMinutes} min</div>
          </div>
        </div>
      </div>

      {/* Title & Meta Health Check Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title Tag Analysis */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-gray-300">Title Tag Validation</span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                meta.titleTruncated
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {meta.titleTruncated ? 'May Truncate on SERP' : 'Optimal Length'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 pt-1 border-t border-slate-200 dark:border-white/5">
            <span>Character Count: <strong className="text-slate-900 dark:text-white">{meta.titleLength}</strong> / 60 chars</span>
            <span>Pixel Estimate: <strong className="text-slate-900 dark:text-white">~{meta.titlePixelEstimate}px</strong> / 580px</span>
          </div>
        </div>

        {/* Meta Description Analysis */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-gray-300">Meta Description Validation</span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                meta.descriptionTruncated
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {meta.descriptionTruncated ? 'Too Long (>160 Chars)' : 'Optimal Length'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 pt-1 border-t border-slate-200 dark:border-white/5">
            <span>Character Count: <strong className="text-slate-900 dark:text-white">{meta.descriptionLength}</strong> / 160 chars</span>
            <span>JSON-LD Schema: <strong className={meta.hasJsonLdSchema ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-gray-500'}>{meta.hasJsonLdSchema ? 'Detected' : 'None'}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div role="tablist" aria-label="Page Audit Sections" className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3 overflow-x-auto">
        <button
          role="tab"
          aria-selected={activeTab === 'scorecard'}
          aria-controls="panel-scorecard"
          onClick={() => setActiveTab('scorecard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'scorecard'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>On-Page SEO Basics</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'technical'}
          aria-controls="panel-technical"
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'technical'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Technical Health & Speed</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'vitals'}
          aria-controls="panel-vitals"
          onClick={() => setActiveTab('vitals')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'vitals'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-500" />
          <span>Core Web Vitals</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'intent'}
          aria-controls="panel-intent"
          onClick={() => setActiveTab('intent')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'intent'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <Target className="w-4 h-4 text-indigo-500" />
          <span>Search Intent & Entities</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'serp'}
          aria-controls="panel-serp"
          onClick={() => setActiveTab('serp')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'serp'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>SERP & Social Preview</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'readability'}
          aria-controls="panel-readability"
          onClick={() => setActiveTab('readability')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'readability'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Readability & Tone</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'headings'}
          aria-controls="panel-headings"
          onClick={() => setActiveTab('headings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'headings'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Heading Hierarchy ({headings.length})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'keywords'}
          aria-controls="panel-keywords"
          onClick={() => setActiveTab('keywords')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'keywords'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Keyword Density</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'images'}
          aria-controls="panel-images"
          onClick={() => setActiveTab('images')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'images'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Image Audit ({imageAudit.totalImages})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'links'}
          aria-controls="panel-links"
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'links'
              ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Deep Link & Affiliate ({linkAudit.totalLinks})</span>
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
