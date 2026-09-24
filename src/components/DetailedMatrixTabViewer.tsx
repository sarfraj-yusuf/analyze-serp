'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SinglePageAudit } from '@/types/seo';
import {
  MatrixCategory,
  exportTitlesAndDescriptionsCsv,
  generateTitlesAndDescriptionsMarkdown,
  exportHeadingsCsv,
  generateHeadingsMarkdown,
  exportKeywordsCsv,
  generateKeywordsMarkdown,
  exportTechnicalSpeedCsv,
  generateTechnicalSpeedMarkdown,
  exportImagesAndLinksCsv,
  generateImagesAndLinksMarkdown,
  downloadJsonFile,
} from '@/lib/matrix-export';
import {
  FileSpreadsheet,
  Copy,
  FileJson,
  Check,
  FileText,
  Layers,
  Key,
  Zap,
  Image as ImageIcon,
  Target,
  ExternalLink,
  Download,
  ChevronDown,
} from 'lucide-react';
import { Tooltip } from './Tooltip';

interface DetailedMatrixTabViewerProps {
  audits: SinglePageAudit[];
  targetUrl?: string;
}

export const DetailedMatrixTabViewer: React.FC<DetailedMatrixTabViewerProps> = ({
  audits,
  targetUrl,
}) => {
  const [activeTab, setActiveTab] = useState<MatrixCategory>('titles_descriptions');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExportDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExportDropdownOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExportDropdownOpen]);

  const handleCopyMarkdown = () => {
    let md = '';
    if (activeTab === 'titles_descriptions') {
      md = generateTitlesAndDescriptionsMarkdown(audits);
    } else if (activeTab === 'headings_tree') {
      md = generateHeadingsMarkdown(audits);
    } else if (activeTab === 'keywords_density') {
      md = generateKeywordsMarkdown(audits);
    } else if (activeTab === 'technical_speed') {
      md = generateTechnicalSpeedMarkdown(audits);
    } else if (activeTab === 'images_links') {
      md = generateImagesAndLinksMarkdown(audits);
    }

    navigator.clipboard.writeText(md);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  const handleExportCsv = () => {
    if (activeTab === 'titles_descriptions') {
      exportTitlesAndDescriptionsCsv(audits);
    } else if (activeTab === 'headings_tree') {
      exportHeadingsCsv(audits);
    } else if (activeTab === 'keywords_density') {
      exportKeywordsCsv(audits);
    } else if (activeTab === 'technical_speed') {
      exportTechnicalSpeedCsv(audits);
    } else if (activeTab === 'images_links') {
      exportImagesAndLinksCsv(audits);
    }
  };

  const handleExportJson = () => {
    downloadJsonFile(`competitor_${activeTab}_matrix_${Date.now()}.json`, audits);
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] p-5 sm:p-7 space-y-6">
      {/* Header & 1-Click Multi-Format Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Granular Signal Inspector
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-1">
            Facet-by-Facet Deep Signal Comparison
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Compare titles, meta descriptions, heading trees, keywords, and speed signals side-by-side across all{' '}
            <strong className="text-slate-800 dark:text-slate-100">{audits.length} URLs</strong>.
          </p>
        </div>

        {/* Compact Unified Export Action */}
        <div className="relative shrink-0" ref={exportDropdownRef}>
          <Tooltip content="Export Matrix" side="top">
            <button
              type="button"
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                  isExportDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </Tooltip>

          {isExportDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-xl p-1 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
              {/* 1. Export CSV */}
              <button
                type="button"
                onClick={() => {
                  handleExportCsv();
                  setIsExportDropdownOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">Export CSV</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40">
                  CSV
                </span>
              </button>

              {/* 2. Copy Markdown */}
              <button
                type="button"
                onClick={() => {
                  handleCopyMarkdown();
                  setTimeout(() => setIsExportDropdownOpen(false), 800);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  {copiedStatus ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  )}
                  <span className={copiedStatus ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'font-medium'}>
                    {copiedStatus ? 'Copied Table!' : 'Copy Markdown'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 px-1 py-0.5 rounded bg-slate-100 dark:bg-white/5">
                  MD
                </span>
              </button>

              {/* 3. Export JSON */}
              <button
                type="button"
                onClick={() => {
                  handleExportJson();
                  setIsExportDropdownOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <FileJson className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-medium">Export JSON</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40">
                  JSON
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('titles_descriptions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'titles_descriptions'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Titles &amp; Meta Descriptions</span>
        </button>

        <button
          onClick={() => setActiveTab('headings_tree')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'headings_tree'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Headings Hierarchy Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('keywords_density')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'keywords_density'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Keywords &amp; Density</span>
        </button>

        <button
          onClick={() => setActiveTab('technical_speed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'technical_speed'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Technical &amp; Speed</span>
        </button>

        <button
          onClick={() => setActiveTab('images_links')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'images_links'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Images &amp; Link Graph</span>
        </button>
      </div>

      {/* Dynamic Facet Views */}
      <div className="pt-1">
        {/* TAB 1: Titles & Meta Descriptions */}
        {activeTab === 'titles_descriptions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {audits.map((audit, index) => {
              const isTarget = audit.url === targetUrl;
              const meta = audit.meta || {
                title: '',
                titlePixelEstimate: 0,
                titleLength: 0,
                description: '',
                descriptionLength: 0,
              };
              const host = getHostname(audit.url);

              return (
                <div
                  key={index}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                    isTarget
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10 shadow-2xs'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                      {isTarget ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center gap-1">
                          <Target className="w-2.5 h-2.5" />
                          <span>Target (You)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          Competitor #{index}
                        </span>
                      )}

                      <a
                        href={audit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-mono font-medium truncate max-w-[160px] flex items-center gap-1"
                        title={audit.url}
                      >
                        <span className="truncate">{host}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>

                    {/* Title Section */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                        <span>Title Tag</span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {meta.titlePixelEstimate || 0}px ({(meta.title || '').length} chars)
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 font-bold text-xs text-slate-800 dark:text-slate-100 leading-snug">
                        {meta.title || <span className="text-rose-600 dark:text-rose-400 italic">Missing Title Tag</span>}
                      </div>
                    </div>

                    {/* Meta Description Section */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                        <span>Meta Description</span>
                        <span className="font-mono text-cyan-700 dark:text-cyan-400 tabular-nums">
                          {(meta.description || '').length} chars
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed min-h-[75px]">
                        {meta.description || (
                          <span className="text-rose-600 dark:text-rose-400 italic">Missing Meta Description Tag</span>
                        )}
                      </div>
                    </div>

                    {/* Google SERP Snippet Box */}
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-1 shadow-2xs">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Google Search Preview
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-bold truncate">
                        {meta.title || audit.url}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-tight">
                        {meta.description || 'No meta description snippet provided for Google search indexing.'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Headings Hierarchy Tree */}
        {activeTab === 'headings_tree' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {audits.map((audit, index) => {
              const isTarget = audit.url === targetUrl;
              const host = getHostname(audit.url);

              return (
                <div
                  key={index}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                    isTarget
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10 shadow-2xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                      {isTarget ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center gap-1">
                          <Target className="w-2.5 h-2.5" />
                          <span>Target (You)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          Competitor #{index}
                        </span>
                      )}
                      <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                        {audit.headings?.length || 0} Headings
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                      {audit.headings && audit.headings.length > 0 ? (
                        audit.headings.map((h, idx) => {
                          const levelNum = parseInt(h.level.replace('h', ''), 10) || 1;
                          return (
                            <div
                              key={idx}
                              className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-xs flex items-start gap-2"
                              style={{ marginLeft: `${Math.max(0, (levelNum - 1) * 10)}px` }}
                            >
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold font-mono text-[9px] shrink-0 uppercase border border-emerald-300 dark:border-emerald-800">
                                {h.level}
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 leading-snug break-words">
                                {h.text}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs text-center font-bold border border-rose-200 dark:border-rose-900/40">
                          No heading tags (H1-H6) detected on page.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: Keywords & N-Gram Density */}
        {activeTab === 'keywords_density' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {audits.map((audit, index) => {
              const isTarget = audit.url === targetUrl;
              const host = getHostname(audit.url);

              return (
                <div
                  key={index}
                  className={`p-5 rounded-xl border transition-all space-y-4 ${
                    isTarget
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                    {isTarget ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center gap-1">
                        <Target className="w-2.5 h-2.5" />
                        <span>Target (You)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        Competitor #{index}
                      </span>
                    )}
                    <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                      {host}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Top 1-Gram Keywords
                    </div>
                    <div className="space-y-1">
                      {(audit.keywords?.oneGram || []).slice(0, 5).map((kw, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-1.5 px-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-100">{kw.phrase}</span>
                          <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
                            {kw.count}x ({kw.density.toFixed(2)}%)
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-1">
                      Top 2-Gram &amp; 3-Gram Phrases
                    </div>
                    <div className="space-y-1">
                      {(audit.keywords?.twoGram || []).slice(0, 3).map((kw, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-1.5 px-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-100">{kw.phrase}</span>
                          <span className="font-mono text-[11px] text-cyan-700 dark:text-cyan-400 font-bold tabular-nums">
                            {kw.count}x ({kw.density.toFixed(2)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: Technical & Speed Signals */}
        {activeTab === 'technical_speed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {audits.map((audit, index) => {
              const isTarget = audit.url === targetUrl;
              const host = getHostname(audit.url);

              return (
                <div
                  key={index}
                  className={`p-5 rounded-xl border transition-all space-y-4 ${
                    isTarget
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                    {isTarget ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center gap-1">
                        <Target className="w-2.5 h-2.5" />
                        <span>Target (You)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        Competitor #{index}
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      Health Score: {audit.technicalAudit?.technicalScore || 0}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Response TTFB Speed</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                        {audit.technicalAudit?.ttfbMs || 0}ms
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">HTML Document Weight</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                        {(audit.technicalAudit?.htmlSizeKb || 0).toFixed(1)} KB
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 space-y-0.5">
                      <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">
                        Canonical URL
                      </div>
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-100 truncate text-[11px]" title={audit.meta?.canonicalUrl || ''}>
                        {audit.meta?.canonicalUrl || 'Missing Canonical Tag'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Robots.txt Indexability</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {audit.robotsValidation?.status || 'ALLOWED'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: Images & Link Graph */}
        {activeTab === 'images_links' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {audits.map((audit, index) => {
              const isTarget = audit.url === targetUrl;
              const host = getHostname(audit.url);
              const links = audit.linkAudit || { totalLinks: 0, internalCount: 0, externalCount: 0, affiliateCount: 0 };
              const imgs = audit.imageAudit || { totalImages: 0, missingAltCount: 0 };

              return (
                <div
                  key={index}
                  className={`p-5 rounded-xl border transition-all space-y-4 ${
                    isTarget
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                    {isTarget ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center gap-1">
                        <Target className="w-2.5 h-2.5" />
                        <span>Target (You)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        Competitor #{index}
                      </span>
                    )}
                    <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                      {host}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Total Page Images</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                        {imgs.totalImages}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Images Missing Alt Tag</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        {imgs.missingAltCount}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Total Links Found</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                        {links.totalLinks}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-0.5">
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                        <div className="text-slate-500 dark:text-slate-400 uppercase">Internal</div>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{links.internalCount}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                        <div className="text-slate-500 dark:text-slate-400 uppercase">External</div>
                        <div className="font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">{links.externalCount}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                        <div className="text-slate-500 dark:text-slate-400 uppercase">Affiliate</div>
                        <div className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">{links.affiliateCount}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
