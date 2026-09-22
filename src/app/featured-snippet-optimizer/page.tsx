'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { AuthModal } from '@/components/AuthModal';
import {
  Award,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Users,
  Copy,
  Check,
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
  Globe,
  Info,
  Layers,
  Search,
} from 'lucide-react';
import {
  SnippetFormat,
  SnippetTableData,
  classifySnippetIntent,
  calculateSnippetReadiness,
  generateSnippetHtml,
  generateSnippetMarkdown,
} from '@/lib/snippet-optimizer-engine';

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

export default function FeaturedSnippetOptimizerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [query, setQuery] = useState('what is competitor seo analysis');
  const [heading, setHeading] = useState('## What is Competitor SEO Analysis?');
  const [format, setFormat] = useState<SnippetFormat>('PARAGRAPH');
  const [paragraphText, setParagraphText] = useState(
    'Competitor SEO analysis is the process of evaluating the content, backlink profiles, technical health, and keyword rankings of top-performing websites in search results. It helps businesses identify organic traffic gaps, reverse-engineer high-ranking content architectures, and benchmark on-page signals against authoritative search rivals.'
  );
  const [listItems, setListItems] = useState<string[]>(DEFAULT_SAMPLE_LIST);
  const [tableData, setTableData] = useState<SnippetTableData>(DEFAULT_SAMPLE_TABLE);

  // Workbench view controls
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'checklist' | 'export'>('preview');
  const [exportMode, setExportMode] = useState<'html' | 'markdown' | 'plain'>('html');
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Real-time classification & readiness report
  const classification = useMemo(() => classifySnippetIntent(query), [query]);

  const readiness = useMemo(() => {
    return calculateSnippetReadiness({
      query,
      format,
      heading,
      paragraphText,
      listItems,
      tableData,
    });
  }, [query, format, heading, paragraphText, listItems, tableData]);

  // Heading alignment helper
  const handleApplyRecommendedHeading = () => {
    const cleanQ = query.trim();
    if (!cleanQ) return;
    const formatted = cleanQ.charAt(0).toUpperCase() + cleanQ.slice(1);
    const withQuestion = formatted.endsWith('?') ? formatted : `${formatted}?`;
    setHeading(`## ${withQuestion}`);
  };

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

      if (data.suggestedHeading) setHeading(data.suggestedHeading);
      if (data.format) setFormat(data.format);
      if (data.paragraphText) setParagraphText(data.paragraphText);
      if (data.listItems && Array.isArray(data.listItems) && data.listItems.length > 0) {
        setListItems(data.listItems);
      }
      if (data.tableData && data.tableData.headers && data.tableData.rows) {
        setTableData(data.tableData);
      }
    } catch (err: any) {
      console.error('[FeaturedSnippetOptimizerPage] AI generation error:', err);
      setAiError(err.message || 'Failed to generate snippet bait. Please retry.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const generatedCode = useMemo(() => {
    const input = { query, format, heading, paragraphText, listItems, tableData };
    if (exportMode === 'html') return generateSnippetHtml(input);
    if (exportMode === 'markdown') return generateSnippetMarkdown(input);
    return `${heading}\n\n${format === 'PARAGRAPH' ? paragraphText : format === 'TABLE' ? tableData.rows.map((r) => r.join(' | ')).join('\n') : listItems.join('\n')}`;
  }, [exportMode, query, format, heading, paragraphText, listItems, tableData]);

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

  const faqs = [
    {
      question: 'What is a Google Featured Snippet (Position 0)?',
      answer:
        'A Featured Snippet is a highlighted search result that appears at the very top of Google\'s organic search results page (Position 0). It extracts an excerpt from a webpage to answer the user\'s query immediately, capturing over 35% of total organic search clicks.',
    },
    {
      question: 'What is "Snippet Bait" and how does it work?',
      answer:
        'Snippet Bait is a block of content placed near the top of an article specifically formatted for Google\'s extraction algorithms. For paragraph queries, it is typically a 40–58 word concise definition placed under an H2 question heading. For step-by-step queries, it is a 5–8 item numbered list.',
    },
    {
      question: 'What is the optimal word count for a paragraph featured snippet?',
      answer:
        'Google\'s paragraph snippet box fits approximately 40 to 58 words (roughly 250 to 300 characters). Content shorter than 32 words is often rejected as too brief, while text exceeding 60 words risks awkward cut-offs or truncation.',
    },
    {
      question: 'Do I need to rank #1 on Google to win a featured snippet?',
      answer:
        'No. According to Ahrefs and Google Search Central data, roughly 70% of featured snippets are awarded to pages ranking anywhere between Positions #2 and #5 on Page 1. Having superior formatting and inverted-pyramid syntax allows you to steal Position 0 from the #1 result.',
    },
    {
      question: 'Why does introductory conversational filler prevent winning snippets?',
      answer:
        'Phrases like "in today\'s fast-paced world", "in this guide", or "have you ever wondered" push the direct answer down. Google\'s NLP algorithms prioritize pages that deliver the core factual answer immediately in the first sentence.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const gradeBadgeClasses =
    readiness.grade === 'EXCELLENT'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
      : readiness.grade === 'GOOD'
      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
      : readiness.grade === 'NEEDS_WORK'
      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      {/* FAQPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span>Tools</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">Featured Snippet Optimizer</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2 pb-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>Google Position 0 Studio</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.03em] leading-tight">
            Featured Snippet Optimizer <br />
            <span className="text-slate-500 dark:text-slate-400 font-semibold">&amp; Position 0 Snippet Bait</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Craft, validate, and simulate content blocks engineered to win Google&apos;s coveted Position 0.
            Captures 35%+ organic CTR above traditional #1 rankings.
          </p>
        </div>

        {/* Full-Width Interactive Workbench Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden">
          {/* Workbench Top Status Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  Interactive Snippet Bait Studio
                </h2>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target Intent: <strong className="text-slate-700 dark:text-slate-300">{classification.format}</strong>
                </div>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${gradeBadgeClasses}`}>
              <span>Readiness: {readiness.score}/100</span>
              <span>•</span>
              <span>{readiness.grade}</span>
            </div>
          </div>

          {/* Workbench Body (Split View) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-white/10">
            {/* Left Panel: Studio Editor (7 Cols) */}
            <div className="lg:col-span-7 p-6 space-y-5">
              {/* Target Search Query */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Target Search Query
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">Google Intent Match: 92%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. what is competitor seo analysis"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm font-mono focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAiSnippet}
                    disabled={isGeneratingAi}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAi ? 'Drafting...' : 'AI Draft'}</span>
                  </button>
                </div>

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

              {/* Format Selection Chips */}
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
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Preceding Question Heading (H2 / H3)
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
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono focus:outline-none transition-all"
                />
              </div>

              {/* Dynamic Content Editor */}
              {format === 'PARAGRAPH' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Paragraph Content (Inverted Pyramid Answer)
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
                    rows={5}
                    value={paragraphText}
                    onChange={(e) => setParagraphText(e.target.value)}
                    placeholder="[Query/Topic] is [direct definition]... (Provide direct answer in sentence 1, followed by 1-2 supporting context sentences)."
                    className="w-full p-3.5 rounded-xl glass-input text-xs sm:text-sm leading-relaxed focus:outline-none transition-all resize-y"
                  />

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

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
                      Table Matrix ({tableData.headers.length} Cols × {tableData.rows.length} Rows)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddTableRow}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-x-auto max-h-72">
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

            {/* Right Panel: SERP Simulator & Export Engine (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col bg-slate-50/50 dark:bg-black/20">
              {/* Tab Navigation */}
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

              {/* Right Tab Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {activeRightTab === 'preview' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Google SERP · Position 0 Simulation</span>
                      <span>{previewDevice === 'desktop' ? '600px Desktop' : '360px Mobile'}</span>
                    </div>

                    <div
                      className={`mx-auto bg-white dark:bg-[#202124] rounded-xl border border-slate-200 dark:border-[#3c4043] p-4 shadow-sm space-y-3 text-left transition-all ${
                        previewDevice === 'mobile' ? 'max-w-[360px]' : 'w-full'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#303134] flex items-center justify-center border border-slate-200 dark:border-[#3c4043] shrink-0">
                          <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="truncate">
                          <div className="font-medium text-[12px] text-slate-900 dark:text-[#dadce0] truncate">AnalyzeSERP</div>
                          <div className="text-[11px] text-slate-500 dark:text-[#bdc1c6] font-mono truncate">
                            analyzeserp.com/blog/competitor-seo-guide
                          </div>
                        </div>
                      </div>

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

                      <div className="pt-2 border-t border-slate-100 dark:border-[#3c4043]">
                        <span className="text-[15px] font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline block truncate cursor-pointer">
                          {heading.replace(/^#+\s*/, '') || 'Comprehensive Guide to ' + query}
                        </span>
                      </div>
                    </div>

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

                {activeRightTab === 'checklist' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                        Algorithmic Checklist
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
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Recommended Improvements:</div>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                          {readiness.feedback.map((fb, idx) => (
                            <li key={idx}>{fb}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

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
                        <span>CMS Implementation Note:</span>
                      </div>
                      <p>
                        Paste this code directly under your primary topic intro. Google parses semantic HTML headings and paragraphs within the top 30% of web documents.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                STEP 01
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Classify Search Intent Format
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Determine whether Google extracts a 40–58 word Paragraph, a 5–8 step Numbered List, or a Comparison Table.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Intent sniffer calibrated</span>
            </div>
          </div>

          <div className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                STEP 02
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Craft Inverted-Pyramid Answer
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deliver the direct solution in sentence 1 immediately following your H2 question heading. Eliminate filler clichés.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero conversational fluff</span>
            </div>
          </div>

          <div className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                STEP 03
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Simulate &amp; Export Clean Code
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Preview how your snippet looks in real Google Desktop/Mobile cards, then copy clean HTML or Markdown for your CMS.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1-Click CMS export</span>
            </div>
          </div>
        </div>

        {/* 4-Pillar Position 0 Algorithmic Bento Grid */}
        <section className="space-y-6 pt-4">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
              <Layers className="w-3.5 h-3.5" />
              <span>SERP EXTRACTION ARCHITECTURE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              The 4 Formats of Google Featured Snippets
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Understanding Google&apos;s mathematical extraction rules allows you to optimize content blocks for maximum Position 0 CTR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">1. Paragraph Snippets (~70% of SERPs)</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">40–58 Words</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Triggered by &quot;what is&quot;, definitions, &quot;why&quot;, and factual questions. Sentence 1 must define the query directly using the Inverted Pyramid method.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <ListOrdered className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">2. Numbered List Snippets (~18% of SERPs)</h3>
                </div>
                <span className="text-[10px] font-mono text-blue-600 font-bold">5–8 Steps</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Triggered by &quot;how to&quot;, step-by-step processes, and tutorials. Each list item should feature bold action verbs for quick entity parsing.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <TableIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">3. Table Snippets (~12% of SERPs)</h3>
                </div>
                <span className="text-[10px] font-mono text-amber-600 font-bold">3–4 Columns</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Triggered by comparisons (&quot;X vs Y&quot;), pricing, specs, and dimensions. Requires clean HTML &lt;table&gt; structure with &lt;thead&gt;.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <List className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">4. Bulleted Lists (Top Items)</h3>
                </div>
                <span className="text-[10px] font-mono text-purple-600 font-bold">5–8 Items</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Triggered by &quot;best tools&quot;, checklists, ideas, and non-chronological collections. Uses bold tags to anchor primary nouns.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="space-y-6 max-w-4xl mx-auto pt-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Common Questions</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Featured Snippet (Position 0) FAQs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Expert answers to winning and maintaining Position 0 rich snippets on Google.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-colors duration-150 ${
                    isOpen
                      ? 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-300 dark:border-white/15'
                      : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-controls={`faq-snippet-answer-${index}`}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-snippet-answer-${index}`}
                      role="region"
                      aria-hidden={!isOpen}
                      className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 leading-relaxed"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          featureTitle="Position 0 Snippet Bait Generator"
        />
      )}
    </div>
  );
}
