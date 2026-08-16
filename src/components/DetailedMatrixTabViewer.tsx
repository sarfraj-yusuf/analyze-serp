'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface DetailedMatrixTabViewerProps {
  audits: SinglePageAudit[];
}

export const DetailedMatrixTabViewer: React.FC<DetailedMatrixTabViewerProps> = ({ audits }) => {
  const [activeTab, setActiveTab] = useState<MatrixCategory>('titles_descriptions');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

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

  return (
    <div className="glass-panel rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header & Category Tabs Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Detailed Comparative Inspector
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Facet-by-Facet Competitor Analysis
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Compare titles, meta descriptions, heading trees, keywords, and speed signals side-by-side for all <strong className="text-slate-900 dark:text-white">{audits.length} URLs</strong> at once.
          </p>
        </div>

        {/* 1-Click Multi-Format Export Actions */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            title="Download CSV for current tab"
          >
            <FileSpreadsheet className="w-4 h-4 text-black" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy Markdown table to clipboard for Notion/Google Docs"
          >
            {copiedStatus ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-500" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export JSON structured data"
          >
            <FileJson className="w-4 h-4 text-indigo-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('titles_descriptions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'titles_descriptions'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Titles & Meta Descriptions</span>
        </button>

        <button
          onClick={() => setActiveTab('headings_tree')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'headings_tree'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Headings Hierarchy Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('keywords_density')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'keywords_density'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Keywords & Density</span>
        </button>

        <button
          onClick={() => setActiveTab('technical_speed')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'technical_speed'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Technical & Speed</span>
        </button>

        <button
          onClick={() => setActiveTab('images_links')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'images_links'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Images & Link Breakdown</span>
        </button>
      </div>

      {/* Dynamic Tab Content Views */}
      <div className="pt-2">
        {/* TAB 1: Titles & Meta Descriptions */}
        {activeTab === 'titles_descriptions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map((audit, index) => {
              const meta = audit.meta || { title: '', titlePixelEstimate: 0, titleLength: 0, description: '', descriptionLength: 0 };

              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* URL Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white">
                        URL #{index + 1}
                      </span>
                      <a
                        href={audit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-emerald-500 transition-colors font-mono truncate max-w-[200px]"
                      >
                        {audit.url}
                      </a>
                    </div>

                    {/* Title Section */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-500 dark:text-gray-400">
                        <span>Title Tag</span>
                        <span className="font-mono text-emerald-500">
                          {meta.titlePixelEstimate || 0}px ({(meta.title || '').length} chars)
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                        {meta.title || <span className="text-red-500 italic">Missing Title Tag</span>}
                      </div>
                    </div>

                    {/* Meta Description Section */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-500 dark:text-gray-400">
                        <span>Meta Description</span>
                        <span className="font-mono text-cyan-500">
                          {(meta.description || '').length} chars
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-300 leading-relaxed min-h-[90px]">
                        {meta.description || (
                          <span className="text-red-500 italic">Missing Meta Description Tag</span>
                        )}
                      </div>
                    </div>

                    {/* Google SERP Snippet Box */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a1f2c] border border-slate-200 dark:border-white/10 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Google Search SERP Preview
                      </div>
                      <div className="text-xs text-[#1a0dab] dark:text-[#8ab4f8] font-bold truncate">
                        {meta.title || audit.url}
                      </div>
                      <div className="text-[10px] text-[#202124] dark:text-[#bdc1c6] line-clamp-2 leading-tight">
                        {meta.description || 'No description snippet provided for Google search indexing.'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map((audit, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white">
                      URL #{index + 1}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-gray-400">
                      {audit.headings?.length || 0} Headings
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {audit.headings && audit.headings.length > 0 ? (
                      audit.headings.map((h, idx) => {
                        const levelNum = parseInt(h.level.replace('h', ''), 10) || 1;

                        return (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs flex items-start gap-2"
                            style={{ marginLeft: `${Math.max(0, (levelNum - 1) * 12)}px` }}
                          >
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold font-mono text-[9px] shrink-0 uppercase">
                              {h.level}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-gray-200 leading-snug break-words">
                              {h.text}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-xs text-center font-bold">
                        No heading tags (H1-H6) found on page.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Keywords & N-Gram Density */}
        {activeTab === 'keywords_density' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map((audit, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 shadow-sm hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white">
                    URL #{index + 1}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-gray-400 truncate max-w-[180px]">
                    {audit.url}
                  </span>
                </div>

                {/* Top Keywords List */}
                <div className="space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                    Top 1-Gram Keywords
                  </div>
                  <div className="space-y-1.5">
                    {(audit.keywords?.oneGram || []).slice(0, 5).map((kw, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">{kw.phrase}</span>
                        <span className="font-mono text-[11px] text-emerald-500 font-bold">
                          {kw.count}x ({kw.density.toFixed(2)}%)
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-400 pt-2">
                    Top 2-Gram & 3-Gram Phrases
                  </div>
                  <div className="space-y-1.5">
                    {(audit.keywords?.twoGram || []).slice(0, 3).map((kw, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">{kw.phrase}</span>
                        <span className="font-mono text-[11px] text-cyan-500 font-bold">
                          {kw.count}x ({kw.density.toFixed(2)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Technical & Speed Signals */}
        {activeTab === 'technical_speed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map((audit, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 shadow-sm hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white">
                    URL #{index + 1}
                  </span>
                  <span className="font-mono text-xs font-black text-emerald-500">
                    Health Score: {audit.technicalAudit?.technicalScore || 0}%
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Response Load Time</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {audit.technicalAudit?.ttfbMs || 0}ms
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-gray-400">HTML Document Size</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {(audit.technicalAudit?.htmlSizeKb || 0).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase font-extrabold">
                      Canonical Tag
                    </div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white truncate">
                      {audit.meta?.canonicalUrl || 'N/A'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Robots.txt Indexability</span>
                    <span className="font-bold text-emerald-500">
                      {audit.robotsValidation?.status || 'ALLOWED'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: Image & Link Breakdown */}
        {activeTab === 'images_links' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map((audit, index) => {
              const links = audit.linkAudit || { totalLinks: 0, internalCount: 0, externalCount: 0, affiliateCount: 0 };
              const imgs = audit.imageAudit || { totalImages: 0, missingAltCount: 0 };

              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 shadow-sm hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white">
                      URL #{index + 1}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-gray-400 truncate max-w-[180px]">
                      {audit.url}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-gray-400">Total Page Images</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {imgs.totalImages}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-gray-400">Images Missing Alt Tag</span>
                      <span className="font-mono font-bold text-rose-500">
                        {imgs.missingAltCount}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-gray-400">Total Links Found</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {links.totalLinks}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <div className="text-slate-500 dark:text-gray-400 uppercase">Internal</div>
                        <div className="font-bold text-emerald-500">{links.internalCount}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <div className="text-slate-500 dark:text-gray-400 uppercase">External</div>
                        <div className="font-bold text-cyan-500">{links.externalCount}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <div className="text-slate-500 dark:text-gray-400 uppercase">Affiliate</div>
                        <div className="font-bold text-amber-500">{links.affiliateCount}</div>
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
