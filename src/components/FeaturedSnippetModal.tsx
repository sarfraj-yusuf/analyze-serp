'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Monitor,
  FileText,
  ListOrdered,
  List,
  Table as TableIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Globe,
  Info,
} from 'lucide-react';
import {
  SnippetFormat,
  SnippetTableData,
  classifySnippetIntent,
  calculateSnippetReadiness,
  generateSnippetHtml,
  generateSnippetMarkdown,
  countWords,
  SnippetReadinessReport,
} from '@/lib/snippet-optimizer-engine';
import { AuthModal } from '@/components/AuthModal';

export interface FeaturedSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialHeading?: string;
  initialFormat?: SnippetFormat;
  initialText?: string;
  targetUrl?: string;
}

const DEFAULT_SAMPLE_TABLE: SnippetTableData = {
  headers: ['Tool', 'Starting Price', 'Best For', 'Position 0 Fit'],
  rows: [
    ['AnalyzeSERP', 'Free Beta', 'Competitor SERP Audits', 'Native Snippet Bait'],
    ['Ahrefs', '$99 / mo', 'Backlink Audits', 'Keyword Explorer'],
    ['Semrush', '$129 / mo', 'PPC & Domain Rank', 'Position Tracking'],
    ['SurferSEO', '$89 / mo', 'On-Page Content Score', 'Brief Guidelines'],
  ],
};

const DEFAULT_SAMPLE_LIST: string[] = [
  '**Step 1: Identify Question Intent** - Search for "what is" or "how to" queries where Google already displays a featured snippet.',
  '**Step 2: Add Direct H2 Heading** - Place an H2 or H3 heading immediately above your answer that mirrors the search query.',
  '**Step 3: Write Direct Answer in Sentence 1** - State the definition or solution immediately without preamble (Inverted Pyramid style).',
  '**Step 4: Calibrate to 40–58 Words** - Keep paragraph length strictly within Google\'s snippet extraction box boundary.',
  '**Step 5: Eliminate Filler Clichés** - Remove phrases like "in today\'s world" or "in this post" that disqualify content from Position 0.',
  '**Step 6: Validate Semantic HTML** - Wrap content in clean semantic `<p>`, `<ol>`, or `<table>` tags.',
];

export function FeaturedSnippetModal({
  isOpen,
  onClose,
  initialQuery = '',
  initialHeading = '',
  initialFormat,
  initialText = '',
  targetUrl = 'https://analyzeserp.com/blog/position-0-guide',
}: FeaturedSnippetModalProps) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState(initialQuery || 'what is competitor seo analysis');
  const [heading, setHeading] = useState(initialHeading || '## What is Competitor SEO Analysis?');
  const [format, setFormat] = useState<SnippetFormat>(initialFormat || 'PARAGRAPH');
  const [paragraphText, setParagraphText] = useState(
    initialText ||
      'Competitor SEO analysis is the process of evaluating the content, backlink profiles, technical health, and keyword rankings of top-performing websites in search results. It helps businesses identify organic traffic gaps, reverse-engineer high-ranking content architectures, and benchmark on-page signals against authoritative search rivals.'
  );
  const [listItems, setListItems] = useState<string[]>(DEFAULT_SAMPLE_LIST);
  const [tableData, setTableData] = useState<SnippetTableData>(DEFAULT_SAMPLE_TABLE);

  // UI state
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'checklist' | 'export'>('preview');
  const [exportMode, setExportMode] = useState<'html' | 'markdown' | 'plain'>('html');
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update initial props on opening
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) setQuery(initialQuery);
      if (initialHeading) setHeading(initialHeading);
      if (initialFormat) setFormat(initialFormat);
      if (initialText) setParagraphText(initialText);
      setAiError(null);
    }
  }, [isOpen, initialQuery, initialHeading, initialFormat, initialText]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Real-time classification & readiness report
  const classification = useMemo(() => classifySnippetIntent(query), [query]);

  const readiness: SnippetReadinessReport = useMemo(() => {
    return calculateSnippetReadiness({
      query,
      format,
      heading,
      paragraphText,
      listItems,
      tableData,
      targetUrl,
    });
  }, [query, format, heading, paragraphText, listItems, tableData, targetUrl]);

  // Auto-fill query recommended heading
  const handleApplyRecommendedHeading = () => {
    const cleanQ = query.trim();
    if (!cleanQ) return;
    const formatted = cleanQ.charAt(0).toUpperCase() + cleanQ.slice(1);
    const withQuestion = formatted.endsWith('?') ? formatted : `${formatted}?`;
    setHeading(`## ${withQuestion}`);
  };

  // Switch format and adapt defaults
  const handleSelectFormat = (newFormat: SnippetFormat) => {
    setFormat(newFormat);
    if (newFormat === 'NUMBERED_LIST' && listItems.length === 0) {
      setListItems(DEFAULT_SAMPLE_LIST);
    } else if (newFormat === 'TABLE' && tableData.rows.length === 0) {
      setTableData(DEFAULT_SAMPLE_TABLE);
    }
  };

  // AI Generation via /api/ai/generate
  const handleGenerateAiSnippet = async () => {
    if (!query.trim()) {
      setAiError('Please enter a target search query first.');
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'snippet-bait',
          query: query.trim(),
          format,
          heading: heading.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresAuth) {
          setIsAuthModalOpen(true);
          return;
        }
        throw new Error(data.error || 'Failed to generate snippet bait.');
      }

      if (data.suggestedHeading) {
        setHeading(data.suggestedHeading);
      }

      if (data.format) {
        setFormat(data.format);
      }

      if (data.paragraphText) {
        setParagraphText(data.paragraphText);
      }

      if (data.listItems && Array.isArray(data.listItems) && data.listItems.length > 0) {
        setListItems(data.listItems);
      }

      if (data.tableData && data.tableData.headers && data.tableData.rows) {
        setTableData(data.tableData);
      }
    } catch (err: any) {
      console.error('[FeaturedSnippetModal] AI generation error:', err);
      setAiError(err.message || 'Failed to generate snippet bait. Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Copy code / markdown
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Generated code string
  const generatedCode = useMemo(() => {
    const input = { query, format, heading, paragraphText, listItems, tableData, targetUrl };
    if (exportMode === 'html') return generateSnippetHtml(input);
    if (exportMode === 'markdown') return generateSnippetMarkdown(input);
    return `${heading}\n\n${format === 'PARAGRAPH' ? paragraphText : format === 'TABLE' ? tableData.rows.map((r) => r.join(' | ')).join('\n') : listItems.join('\n')}`;
  }, [exportMode, query, format, heading, paragraphText, listItems, tableData, targetUrl]);

  // List helpers
  const handleAddListItem = () => {
    setListItems([...listItems, `**Step ${listItems.length + 1}: Action** - Describe concise instruction.`]);
  };

  const handleUpdateListItem = (index: number, val: string) => {
    const updated = [...listItems];
    updated[index] = val;
    setListItems(updated);
  };

  const handleDeleteListItem = (index: number) => {
    if (listItems.length <= 1) return;
    setListItems(listItems.filter((_, i) => i !== index));
  };

  const handleMoveListItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === listItems.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...listItems];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setListItems(updated);
  };

  // Table helpers
  const handleUpdateTableHeader = (colIdx: number, val: string) => {
    const updated = [...tableData.headers];
    updated[colIdx] = val;
    setTableData({ ...tableData, headers: updated });
  };

  const handleUpdateTableCell = (rowIdx: number, colIdx: number, val: string) => {
    const updatedRows = tableData.rows.map((row, r) =>
      r === rowIdx ? row.map((cell, c) => (c === colIdx ? val : cell)) : row
    );
    setTableData({ ...tableData, rows: updatedRows });
  };

  const handleAddTableRow = () => {
    const newRow = new Array(tableData.headers.length).fill('Data Value');
    setTableData({ ...tableData, rows: [...tableData.rows, newRow] });
  };

  const handleDeleteTableRow = (rowIdx: number) => {
    if (tableData.rows.length <= 1) return;
    setTableData({ ...tableData, rows: tableData.rows.filter((_, idx) => idx !== rowIdx) });
  };

  if (!mounted || !isOpen) return null;

  // Grade color map
  const gradeBadgeClasses =
    readiness.grade === 'EXCELLENT'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
      : readiness.grade === 'GOOD'
      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
      : readiness.grade === 'NEEDS_WORK'
      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="snippet-modal-title"
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-white/10 shrink-0 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="snippet-modal-title" className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  Google Featured Snippet (Position 0) Optimizer
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider hidden sm:inline">
                  Position 0 Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Craft, validate, and simulate snippet bait to steal Position 0 clicks above standard #1 rankings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${gradeBadgeClasses}`}>
              <span>Score: {readiness.score}/100</span>
              <span>•</span>
              <span>{readiness.grade}</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Workbench Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-white/10">
          {/* Left Column: Snippet Bait Studio (7 Cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Target Query Input Dock */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <span>Target Search Query</span>
                  <span className="text-slate-400 text-[11px] font-normal">(The exact term triggering the snippet)</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">Intent: {classification.format}</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. what is competitor seo analysis"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm font-mono focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleGenerateAiSnippet}
                  disabled={isGeneratingAi}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                  title="Generate mathematically optimal Position 0 snippet bait with Gemini AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Drafting...' : 'AI Draft'}</span>
                </button>
              </div>

              {/* Format Intent Rationale Bar */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{classification.rationale}</span>
                </div>
                {format !== classification.format && (
                  <button
                    type="button"
                    onClick={() => handleSelectFormat(classification.format)}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline shrink-0 cursor-pointer"
                  >
                    Switch to {classification.format}
                  </button>
                )}
              </div>

              {aiError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>

            {/* Format Switcher Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Snippet Format</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'PARAGRAPH' as SnippetFormat, label: 'Paragraph', desc: '40–58 words', icon: FileText },
                  { id: 'NUMBERED_LIST' as SnippetFormat, label: 'Numbered', desc: 'Steps / Process', icon: ListOrdered },
                  { id: 'BULLETED_LIST' as SnippetFormat, label: 'Bulleted', desc: 'Top Items / Tips', icon: List },
                  { id: 'TABLE' as SnippetFormat, label: 'Table', desc: 'Specs / Compare', icon: TableIcon },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = format === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleSelectFormat(tab.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-800 dark:text-slate-100 shadow-xs ring-1 ring-emerald-500/20'
                          : 'bg-slate-50/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold">{tab.label}</div>
                        <div className="text-[10px] text-slate-400">{tab.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preceding Heading (H2 / H3) Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <span>Preceding Question Heading (H2 / H3)</span>
                  <span className="text-slate-400 text-[11px] font-normal">(Crucial anchor Google extracts from)</span>
                </label>
                <button
                  type="button"
                  onClick={handleApplyRecommendedHeading}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  Auto-Align with Query
                </button>
              </div>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="## What is Competitor SEO Analysis?"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono focus:outline-none transition-all"
              />
            </div>

            {/* Dynamic Content Editor based on Format */}
            {format === 'PARAGRAPH' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Paragraph Snippet Bait (Inverted Pyramid)
                  </label>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        readiness.wordCount >= 40 && readiness.wordCount <= 58
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : readiness.wordCount >= 32 && readiness.wordCount <= 68
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {readiness.wordCount} words (Target: 40–58)
                    </span>
                    <span className="text-slate-400">{readiness.charCount} chars</span>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={paragraphText}
                  onChange={(e) => setParagraphText(e.target.value)}
                  placeholder="[Query/Topic] is [direct definition]... (Provide direct answer in sentence 1, followed by 1-2 supporting context sentences)."
                  className="w-full p-3.5 rounded-xl glass-input text-xs sm:text-sm leading-relaxed focus:outline-none transition-all resize-y"
                />

                {/* Fluff Alert Pill */}
                {readiness.detectedFluff.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Filler detected: <strong>&quot;{readiness.detectedFluff.join('&quot;, &quot;')}&quot;</strong></span>
                    </div>
                    <span className="text-[10px] font-mono">Remove for higher Position 0 CTR</span>
                  </div>
                )}
              </div>
            )}

            {(format === 'NUMBERED_LIST' || format === 'BULLETED_LIST') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    List Items ({listItems.length} items · Optimal: 5–8)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddListItem}
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {listItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-5 text-[11px] font-mono font-bold text-slate-400 text-center shrink-0">
                        {format === 'NUMBERED_LIST' ? `${idx + 1}.` : '•'}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateListItem(idx, e.target.value)}
                        placeholder="**Step Action** - Detail instruction..."
                        className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs font-mono focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleMoveListItem(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveListItem(idx, 'down')}
                        disabled={idx === listItems.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteListItem(idx)}
                        disabled={listItems.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {format === 'TABLE' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Table Matrix ({tableData.headers.length} Columns × {tableData.rows.length} Rows)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddTableRow}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Row</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-x-auto max-h-60">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/10">
                      <tr>
                        {tableData.headers.map((h, colIdx) => (
                          <th key={colIdx} className="p-2 font-mono">
                            <input
                              type="text"
                              value={h}
                              onChange={(e) => handleUpdateTableHeader(colIdx, e.target.value)}
                              className="w-full font-bold bg-transparent focus:outline-none focus:bg-white dark:focus:bg-slate-800 px-1.5 py-0.5 rounded"
                            />
                          </th>
                        ))}
                        <th className="w-8 p-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {tableData.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          {row.map((cell, colIdx) => (
                            <td key={colIdx} className="p-2">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => handleUpdateTableCell(rowIdx, colIdx, e.target.value)}
                                className="w-full bg-transparent focus:outline-none focus:bg-white dark:focus:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]"
                              />
                            </td>
                          ))}
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteTableRow(rowIdx)}
                              disabled={tableData.rows.length <= 1}
                              className="text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: SERP Simulator & Export Center (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-50/50 dark:bg-black/20">
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveRightTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeRightTab === 'preview'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  SERP Position 0
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRightTab === 'checklist'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Checklist</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('export')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeRightTab === 'export'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Export Code
                </button>
              </div>

              {activeRightTab === 'preview' && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded cursor-pointer ${previewDevice === 'desktop' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-400'}`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded cursor-pointer ${previewDevice === 'mobile' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-400'}`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Tab Content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {/* Tab 1: Live Google SERP Position 0 Preview */}
              {activeRightTab === 'preview' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Google SERP · Position 0 Simulation</span>
                    <span>{previewDevice === 'desktop' ? '600px Desktop' : '360px Mobile'}</span>
                  </div>

                  {/* Google Card Simulation */}
                  <div
                    className={`mx-auto bg-white dark:bg-[#202124] rounded-xl border border-slate-200 dark:border-[#3c4043] p-4 shadow-sm space-y-3 text-left transition-all ${
                      previewDevice === 'mobile' ? 'max-w-[360px]' : 'w-full'
                    }`}
                  >
                    {/* Breadcrumbs & Source Identity */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#303134] flex items-center justify-center border border-slate-200 dark:border-[#3c4043] shrink-0">
                        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-[12px] text-slate-900 dark:text-[#dadce0] truncate">AnalyzeSERP</div>
                        <div className="text-[11px] text-slate-500 dark:text-[#bdc1c6] font-mono truncate">
                          {targetUrl.replace(/^https?:\/\//, '')}
                        </div>
                      </div>
                    </div>

                    {/* Highlighted Snippet Box */}
                    <div className="space-y-2 text-slate-800 dark:text-[#e8eaed] text-[13px] leading-relaxed">
                      {format === 'PARAGRAPH' && (
                        <p className="line-clamp-6">
                          {paragraphText.trim() || 'Snippet text will appear here...'}
                        </p>
                      )}

                      {format === 'NUMBERED_LIST' && (
                        <ol className="list-decimal pl-5 space-y-1">
                          {listItems.slice(0, 6).map((item, idx) => (
                            <li key={idx} className="line-clamp-2 text-[12.5px]">
                              {item.replace(/\*\*/g, '')}
                            </li>
                          ))}
                          {listItems.length > 6 && (
                            <li className="text-emerald-700 dark:text-emerald-400 font-medium list-none text-xs pt-1">
                              More items...
                            </li>
                          )}
                        </ol>
                      )}

                      {format === 'BULLETED_LIST' && (
                        <ul className="list-disc pl-5 space-y-1">
                          {listItems.slice(0, 6).map((item, idx) => (
                            <li key={idx} className="line-clamp-2 text-[12.5px]">
                              {item.replace(/\*\*/g, '')}
                            </li>
                          ))}
                          {listItems.length > 6 && (
                            <li className="text-emerald-700 dark:text-emerald-400 font-medium list-none text-xs pt-1">
                              More items...
                            </li>
                          )}
                        </ul>
                      )}

                      {format === 'TABLE' && (
                        <div className="border border-slate-200 dark:border-[#3c4043] rounded-lg overflow-hidden text-[11px]">
                          <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-[#303134] border-b border-slate-200 dark:border-[#3c4043]">
                              <tr>
                                {tableData.headers.slice(0, 3).map((h, i) => (
                                  <th key={i} className="p-1.5 font-bold">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#3c4043]">
                              {tableData.rows.slice(0, 4).map((row, r) => (
                                <tr key={r}>
                                  {row.slice(0, 3).map((cell, c) => (
                                    <td key={c} className="p-1.5">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Source Blue Link */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#3c4043]">
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline block truncate"
                      >
                        {heading.replace(/^#+\s*/, '') || 'Comprehensive Guide to ' + query}
                      </a>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Readiness</div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {readiness.score} / 100
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Volume</div>
                      <div className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
                        {format === 'PARAGRAPH' ? `${readiness.wordCount} words` : `${readiness.itemCount} items`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Position 0 Readiness Checklist */}
              {activeRightTab === 'checklist' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Position 0 Checklist
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">
                      {readiness.checks.filter((c) => c.status === 'pass').length} / {readiness.checks.length} Passed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {readiness.checks.map((check) => (
                      <div
                        key={check.id}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 text-left transition-colors ${
                          check.status === 'pass'
                            ? 'bg-emerald-500/5 border-emerald-500/25'
                            : check.status === 'warn'
                            ? 'bg-amber-500/5 border-amber-500/25'
                            : 'bg-rose-500/5 border-rose-500/25'
                        }`}
                      >
                        {check.status === 'pass' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : check.status === 'warn' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{check.label}</span>
                            <span className="text-[10px] font-mono font-semibold text-slate-500">
                              {check.score}/{check.maxScore}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">
                            {check.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {readiness.feedback.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-1.5 text-left">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Recommended Next Steps:</div>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                        {readiness.feedback.map((fb, idx) => (
                          <li key={idx}>{fb}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Code & Markdown Export */}
              {activeRightTab === 'export' && (
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {(['html', 'markdown', 'plain'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setExportMode(m)}
                          className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase cursor-pointer ${
                            exportMode === m
                              ? 'bg-slate-800 dark:bg-white text-white dark:text-black'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(generatedCode)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="relative rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 p-4 font-mono text-[11px] overflow-x-auto max-h-72">
                    <pre className="whitespace-pre-wrap">{generatedCode}</pre>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <ExternalLink className="w-3 h-3 text-emerald-500" />
                      <span>CMS Implementation Guide:</span>
                    </div>
                    <p>
                      Paste directly into your WordPress Custom HTML block, Gutenberg editor, Ghost Markdown, or Next.js MDX content file.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Calibrated to Google Search Central Featured Snippet Extraction Rules</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handleCopyCode(generatedCode)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy Snippet'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal Trigger if user wants AI generation without sign-in */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          featureTitle="Position 0 Snippet Bait Generator"
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
