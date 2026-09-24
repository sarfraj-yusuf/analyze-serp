'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SinglePageAudit, KeywordGapItem } from '@/types/seo';
import { analyzeKeywordGaps } from '@/lib/keyword-gap';
import {
  Target,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  FileText,
  Search,
  X,
  ExternalLink,
  SlidersHorizontal,
  Download,
  ChevronDown,
} from 'lucide-react';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';
import { AiSectionWriterModal } from './AiSectionWriterModal';
import { Tooltip } from './Tooltip';

interface KeywordGapMatrixProps {
  results: SinglePageAudit[];
  targetUrl?: string;
}

type GapStatusTab = 'yourGaps' | 'common' | 'allGaps' | 'all';
type NGramFilter = 'all' | '1-gram' | '2-gram' | '3-gram';

export const KeywordGapMatrix: React.FC<KeywordGapMatrixProps> = ({
  results,
  targetUrl: initialTargetUrl,
}) => {
  const validResults = useMemo(
    () => (results || []).filter((r) => r.status === 'success'),
    [results]
  );

  const [targetUrl, setTargetUrl] = useState<string>(
    initialTargetUrl || validResults[0]?.url || ''
  );
  const [activeTab, setActiveTab] = useState<GapStatusTab>('yourGaps');
  const [activeGram, setActiveGram] = useState<NGramFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedWords, setCopiedWords] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
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

  // AI Section Writer Modal State
  const [isAiWriterOpen, setIsAiWriterOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTargetKeyword, setAiTargetKeyword] = useState('');
  const [aiContext, setAiContext] = useState('');

  if (validResults.length < 2) return null;

  const currentTargetUrl = targetUrl || validResults[0].url;
  const gapAnalysis = analyzeKeywordGaps(validResults, currentTargetUrl);
  const {
    totalUniqueKeywords,
    yourPageMissingGaps = [],
    commonCoreKeywords,
    keywordGaps,
    allItems,
  } = gapAnalysis;

  // Primary list selection by status
  const baseList = useMemo(() => {
    switch (activeTab) {
      case 'yourGaps':
        return yourPageMissingGaps;
      case 'common':
        return commonCoreKeywords;
      case 'allGaps':
        return keywordGaps;
      case 'all':
      default:
        return allItems;
    }
  }, [activeTab, yourPageMissingGaps, commonCoreKeywords, keywordGaps, allItems]);

  // Secondary filtering by N-Gram length & search term
  const filteredList = useMemo(() => {
    return baseList.filter((item) => {
      if (activeGram !== 'all' && item.nGramType !== activeGram) {
        return false;
      }
      if (
        searchTerm.trim() &&
        !item.phrase.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [baseList, activeGram, searchTerm]);

  // Copy plain words list
  const handleCopyWords = () => {
    const words = filteredList.map((item) => item.phrase).join('\n');
    navigator.clipboard.writeText(words);
    setCopiedWords(true);
    setTimeout(() => setCopiedWords(false), 2000);
  };

  // Copy Markdown Table for Notion/Docs
  const handleCopyMarkdown = () => {
    const headers = ['| Keyword Term | Type | Your Target Density | Max Competitor Density | Status |'];
    const divider = ['| :--- | :--- | :--- | :--- | :--- |'];
    const rows = filteredList.slice(0, 100).map((item) => {
      const status = item.isTargetPageMissing
        ? 'Missing (0%)'
        : item.isTargetPageUnderOptimized
        ? 'Low Density'
        : item.isCommonCore
        ? 'Common Core Covered'
        : 'Covered';
      return `| ${item.phrase} | ${item.nGramType} | ${item.targetPageDensity}% | ${item.maxDensity}% | ${status} |`;
    });

    const markdown = [
      `### Keyword Gap Analysis (${filteredList.length} Terms)`,
      `Target URL: ${currentTargetUrl}`,
      '',
      ...headers,
      ...divider,
      ...rows,
    ].join('\n');

    navigator.clipboard.writeText(markdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  // Export CSV download
  const handleExportCsv = () => {
    const headers = ['Keyword Phrase,N-Gram Type,Your Target Density (%),Max Competitor Density (%),Gap Status'];
    const rows = filteredList.map((item) => {
      const status = item.isTargetPageMissing
        ? 'Missing'
        : item.isTargetPageUnderOptimized
        ? 'Low Density'
        : item.isCommonCore
        ? 'Common Core'
        : 'Covered';
      return `"${item.phrase.replace(/"/g, '""')}",${item.nGramType},${item.targetPageDensity},${item.maxDensity},"${status}"`;
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `keyword_gaps_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // AI Draft Section from Missing Keyword Gaps
  const handleDraftWithAi = (specificPhrase?: string) => {
    const primaryTerm =
      specificPhrase ||
      yourPageMissingGaps[0]?.phrase ||
      filteredList[0]?.phrase ||
      'SEO Content Strategy';
    const topGapsList = yourPageMissingGaps.slice(0, 8).map((g) => g.phrase);

    setAiTargetKeyword(primaryTerm);
    setAiTopic(`Strategic Guide: ${primaryTerm}`);
    setAiContext(
      `High-priority missing competitor keyword gaps to cover in subheadings and body paragraphs: ${topGapsList.join(', ')}`
    );
    setIsAiWriterOpen(true);
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const targetHost = getHostname(currentTargetUrl);

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-xs p-5 sm:p-7 space-y-6">
      {/* 1. Control & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              Semantic Gap Engine
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Anchored to{' '}
              <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{targetHost}</strong>{' '}
              vs {validResults.length - 1} competitors
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Keyword Gap &amp; Topical Coverage Alignment</span>
          </h4>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap shrink-0">
          <Tooltip content="AI Topic Draft" side="top">
            <button
              type="button"
              onClick={() => handleDraftWithAi()}
              className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="AI Topic Draft"
            >
              <Sparkles className="size-4" />
            </button>
          </Tooltip>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-0.5 hidden sm:block" />

          {/* Unified Export Gaps Dropdown */}
          <div className="relative shrink-0" ref={exportDropdownRef}>
            <Tooltip content="Export Keywords" side="top">
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
                    {copiedMarkdown ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    )}
                    <span className={copiedMarkdown ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'font-medium'}>
                      {copiedMarkdown ? 'Copied Table!' : 'Copy Markdown'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 px-1 py-0.5 rounded bg-slate-100 dark:bg-white/5">
                    MD
                  </span>
                </button>

                {/* 3. Copy Phrases */}
                <button
                  type="button"
                  onClick={() => {
                    handleCopyWords();
                    setTimeout(() => setIsExportDropdownOpen(false), 800);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    {copiedWords ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    )}
                    <span className={copiedWords ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'font-medium'}>
                      {copiedWords ? 'Copied Phrases!' : 'Copy Phrases Only'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40">
                    TXT
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Semantic Tinted Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Missing Gaps Card */}
        <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-900/40 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <span>Gaps Missing on Your Page</span>
              <SEOExplanationTooltip text="Significant terms used repeatedly by top-ranking competitor URLs where your target page has 0% or inadequate presence." />
            </div>
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-800 dark:text-rose-300 tabular-nums">
              {yourPageMissingGaps.length}
            </span>
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              critical keyword gaps
            </span>
          </div>
          <p className="text-[11px] text-rose-700/90 dark:text-rose-300/80 leading-snug">
            Immediate semantic opportunities to weave into headings and body paragraphs.
          </p>
        </div>

        {/* Common Core Topics Card */}
        <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900/40 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <span>Shared Common Core Topics</span>
              <SEOExplanationTooltip text="Industry baseline vocabulary that both your target page and ranking competitors cover extensively." />
            </div>
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300 tabular-nums">
              {commonCoreKeywords.length}
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              common core terms
            </span>
          </div>
          <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/80 leading-snug">
            Topical parity maintained — protect these baseline concepts from being pruned.
          </p>
        </div>

        {/* Total Discovered Vocabulary Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>Total Discovered Terms</span>
              <SEOExplanationTooltip text="Complete corpus of 1-gram, 2-gram, and 3-gram search terms discovered across all analyzed competitor URLs." />
            </div>
            <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
              {totalUniqueKeywords}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              extracted N-gram phrases
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Indexed vocabulary across 1-gram entities, 2-gram modifiers, and 3-gram long-tail.
          </p>
        </div>
      </div>

      {/* 3. Dual-Axis Filter Controls (Status + N-Gram Length) & Search */}
      <div className="space-y-3 pt-1">
        {/* Primary Status Segmented Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('yourGaps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'yourGaps'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Missing on Your Page ({yourPageMissingGaps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('common')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'common'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Common Core ({commonCoreKeywords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('allGaps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'allGaps'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>All Competitor Gaps ({keywordGaps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>All Terms ({allItems.length})</span>
            </button>
          </div>

          {/* Search Input with Result Count Badge */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search phrases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary N-Gram Length Filter Chips */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
              Phrase Length:
            </span>
            <button
              onClick={() => setActiveGram('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeGram === 'all'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
              }`}
            >
              All Lengths
            </button>
            <button
              onClick={() => setActiveGram('1-gram')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeGram === '1-gram'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
              }`}
            >
              1-Word (Entities)
            </button>
            <button
              onClick={() => setActiveGram('2-gram')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeGram === '2-gram'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
              }`}
            >
              2-Word (Phrases)
            </button>
            <button
              onClick={() => setActiveGram('3-gram')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeGram === '3-gram'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
              }`}
            >
              3-Word (Long-Tail)
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
            Showing <strong>{Math.min(filteredList.length, 60)}</strong> of{' '}
            <strong>{filteredList.length}</strong> terms
          </div>
        </div>
      </div>

      {/* 4. Ergonomic Cross-Comparison Table with Sticky Column */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 max-h-[520px] overflow-y-auto modal-scroll shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
            <tr>
              {/* Sticky Left Column Header */}
              <th
                scope="col"
                className="py-3 px-4 w-60 min-w-[220px] shrink-0 sticky left-0 z-30 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
              >
                <div className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                  Keyword Term
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  Identified Entity / Phrase
                </div>
              </th>

              {/* N-Gram Length Tag */}
              <th scope="col" className="py-3 px-3 text-center w-20 shrink-0 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px] border-r border-slate-200/80 dark:border-white/5">
                Type
              </th>

              {/* URL Columns */}
              {validResults.map((r, idx) => {
                const isTarget = r.url === currentTargetUrl;
                const hostname = getHostname(r.url);
                return (
                  <th
                    key={idx}
                    scope="col"
                    className={`py-3 px-3 text-center w-44 min-w-[150px] max-w-[180px] border-r border-slate-200/80 dark:border-white/5 ${
                      isTarget ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setTargetUrl(r.url)}
                      aria-label={`Set ${hostname} as Target Page`}
                      title={`Click to analyze keyword gaps against ${hostname}`}
                      className={`w-full py-1 px-2 rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
                        isTarget
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'hover:bg-slate-200/60 dark:hover:bg-white/10'
                      }`}
                    >
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          isTarget
                            ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center gap-1'
                            : 'text-slate-600 dark:text-slate-400 bg-slate-200/70 dark:bg-white/10'
                        }`}
                      >
                        {isTarget ? (
                          <>
                            <Target className="w-2.5 h-2.5" />
                            <span>Target (You)</span>
                          </>
                        ) : (
                          `Competitor #${idx}`
                        )}
                      </span>
                      <div className="truncate max-w-[130px] text-slate-800 dark:text-slate-100 font-bold text-xs mt-0.5">
                        {hostname}
                      </div>
                    </button>
                  </th>
                );
              })}

              {/* Status Indicator Header */}
              <th scope="col" className="py-3 px-4 text-center w-36 shrink-0 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Target Coverage
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-800 dark:text-slate-200">
            {filteredList.length === 0 ? (
              <tr>
                <td
                  colSpan={validResults.length + 3}
                  className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-6 h-6 text-slate-400" />
                    <span className="font-semibold">No keyword terms match this filter selection.</span>
                    <span className="text-[11px] text-slate-400">
                      Try selecting &quot;All Terms&quot; or clearing your search query.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredList.slice(0, 80).map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Sticky Left Column: Keyword Term */}
                  <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-100 max-w-xs sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate" title={item.phrase}>
                        {item.phrase}
                      </span>
                      {item.isTargetPageMissing && (
                        <button
                          type="button"
                          onClick={() => handleDraftWithAi(item.phrase)}
                          className="p-1 rounded text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800/60 transition-colors cursor-pointer shrink-0"
                          title="Draft content section for this missing gap with AI"
                        >
                          <Sparkles className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* N-Gram Length */}
                  <td className="py-2.5 px-3 text-center text-[10px] font-mono text-slate-500 dark:text-slate-400 border-r border-slate-200/60 dark:border-white/5">
                    {item.nGramType}
                  </td>

                  {/* Competitor & Target Densities */}
                  {validResults.map((r, rIdx) => {
                    const data = item.presenceMap[r.url];
                    const density = data ? data.density : 0;
                    const count = data ? data.count : 0;
                    const isTarget = r.url === currentTargetUrl;

                    return (
                      <td
                        key={rIdx}
                        className={`py-2 px-3 text-center border-r border-slate-200/60 dark:border-white/5 ${
                          isTarget ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        {density > 0 ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className={`font-mono text-xs tabular-nums ${
                                isTarget
                                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                                  : 'text-slate-800 dark:text-slate-100 font-medium'
                              }`}
                            >
                              {density.toFixed(2)}%{' '}
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                ({count}x)
                              </span>
                            </span>
                            <div className="w-14 h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isTarget ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-cyan-500'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round((density / Math.max(item.maxDensity || 1, 0.1)) * 100)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">
                            0%
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Target Status Indicator */}
                  <td className="py-2.5 px-4 text-center">
                    {item.isTargetPageMissing ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span>Missing (0%)</span>
                      </span>
                    ) : item.isTargetPageUnderOptimized ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>Low Density</span>
                      </span>
                    ) : item.isCommonCore ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>Common Core</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Covered
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* AI Section Writer Modal */}
      <AiSectionWriterModal
        isOpen={isAiWriterOpen}
        onClose={() => setIsAiWriterOpen(false)}
        topic={aiTopic}
        targetKeyword={aiTargetKeyword}
        sectionHeading={aiTopic}
        context={aiContext}
      />
    </div>
  );
};
