'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ContentScratchpadModal } from '@/components/ContentScratchpadModal';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { AuthModal } from '@/components/AuthModal';
import {
  FileText,
  Key,
  Target,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Clock,
  BookOpen,
  Heading,
  Plus,
  Trash2,
  FileCode,
  Zap,
  SlidersHorizontal,
  Maximize2,
  Share2,
} from 'lucide-react';
import {
  analyzeScratchpad,
  convertScratchpadToHtml,
  ScratchpadAnalysisResult,
} from '@/lib/scratchpad-scorer';

const SAMPLE_INITIAL_TITLE = 'Technical SEO Audit: The Complete 2026 Action Checklist';

const SAMPLE_INITIAL_BODY = `## What is a Technical SEO Audit?

A technical SEO audit is the comprehensive process of evaluating a website's server infrastructure, crawling accessibility, indexing status, and code health. By conducting a thorough audit, digital marketers identify hidden bottlenecks that prevent search engines from discovering and ranking high-value content.

## Key Elements of Technical Audits

To rank on Google's first page, every modern web application must satisfy several foundational technical requirements:

- **Core Web Vitals**: Optimize Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) for fast mobile rendering.
- **Crawl Budget Management**: Ensure Googlebot spends crawl time on conversion pages rather than thin or duplicate URLs.
- **XML Sitemap**: Maintain a fresh, compressed sitemap submitted directly in Google Search Console.
- **Robots txt Directives**: Prevent staging environments and private admin folders from being indexed.

## On-Page Architecture and Internal Links

Internal links pass topical authority and PageRank across your content cluster. When auditing pages, verify that all anchor text uses relevant, natural descriptive phrases rather than generic labels. Additionally, inspect canonical tags to eliminate self-competing duplicate URL variations.

## Implementing Schema Markup

Adding structured data using JSON-LD schema markup enables rich snippets in Google search results, increasing organic click-through rates significantly.`;

const DEFAULT_GAP_KEYWORDS = [
  { phrase: 'core web vitals', targetMin: 2, targetMax: 5 },
  { phrase: 'crawl budget', targetMin: 1, targetMax: 4 },
  { phrase: 'xml sitemap', targetMin: 1, targetMax: 3 },
  { phrase: 'robots txt', targetMin: 1, targetMax: 3 },
  { phrase: 'internal links', targetMin: 2, targetMax: 6 },
  { phrase: 'schema markup', targetMin: 1, targetMax: 4 },
  { phrase: 'canonical tags', targetMin: 1, targetMax: 3 },
  { phrase: 'broken links', targetMin: 1, targetMax: 3 },
];

const DEFAULT_COMPETITOR_HEADINGS = [
  { level: 'h2', text: 'How Often Should You Run a Technical SEO Audit?' },
  { level: 'h2', text: 'Top 5 Crawling Tools for Technical Diagnosis' },
  { level: 'h3', text: 'Inspecting Server Response Headers and 404s' },
  { level: 'h2', text: 'Measuring Audit ROI and Organic Traffic Recovery' },
];

const FAQS = [
  {
    q: 'How does the Real-Time Content Scratchpad calculate the Content Score?',
    a: 'The 0–100% Content Score is evaluated across 5 weighted ranking factors: Keyword Coverage (35%), Focus Keyword Placement in Title, H1, First 100 Words, and H2 (25%), Word Count Benchmark vs Ranking Competitors (20%), Heading Structure & Hierarchy (10%), and Flesch Reading Ease & Paragraph Length (10%).',
  },
  {
    q: 'Does using this Scratchpad upload my article text to external servers?',
    a: 'No. The lexical tokenizer and keyword occurrence engine run 100% locally in your browser memory (sub-millisecond latency). Your drafts are auto-saved in your browser localStorage and are never sent to third-party databases unless you explicitly trigger the optional AI Writing Assistant.',
  },
  {
    q: 'What is the recommended keyword frequency for primary and secondary keywords?',
    a: 'Modern search engines prioritize natural language, topical depth, and search intent over rigid keyword density percentages. Rather than repeating terms artificially, ensure your focus keyword appears naturally in key structural places (title, intro, headings) and weave in semantic terms without stuffing.',
  },
  {
    q: 'Can I export my content to WordPress, Notion, or Webflow?',
    a: 'Yes. With one click, you can copy clean, semantic HTML (with properly formatted headings, paragraphs, and list tags) or clean GitHub-Flavored Markdown to paste directly into your CMS or publishing pipeline.',
  },
];

export default function ContentScratchpadPage() {
  const [title, setTitle] = useState(SAMPLE_INITIAL_TITLE);
  const [body, setBody] = useState(SAMPLE_INITIAL_BODY);
  const [focusKeyword, setFocusKeyword] = useState('technical seo audit');
  const [targetWordCount, setTargetWordCount] = useState(1000);
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'missing' | 'optimal' | 'over'>('all');
  const [activeRightTab, setActiveRightTab] = useState<'keywords' | 'headings'>('keywords');
  const [isScoreDetailsOpen, setIsScoreDetailsOpen] = useState(false);
  const [isCopiedMd, setIsCopiedMd] = useState(false);
  const [isCopiedHtml, setIsCopiedHtml] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronous keystroke analysis
  const analysis: ScratchpadAnalysisResult = useMemo(() => {
    return analyzeScratchpad({
      title,
      body,
      targetKeyword: focusKeyword,
      gapKeywords: DEFAULT_GAP_KEYWORDS,
      targetWordCount,
    });
  }, [title, body, focusKeyword, targetWordCount]);

  const filteredKeywords = useMemo(() => {
    if (keywordFilter === 'all') return analysis.keywords;
    return analysis.keywords.filter((k) => k.status === keywordFilter);
  }, [analysis.keywords, keywordFilter]);

  const missingKeywordsCount = useMemo(() => {
    return analysis.keywords.filter((k) => k.status === 'missing').length;
  }, [analysis.keywords]);

  const optimalKeywordsCount = useMemo(() => {
    return analysis.keywords.filter((k) => k.status === 'optimal').length;
  }, [analysis.keywords]);

  const insertAtCursor = useCallback((textToInsert: string) => {
    const el = textareaRef.current;
    if (!el) {
      setBody((prev) => `${prev}\n\n${textToInsert}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newBody = body.substring(0, start) + textToInsert + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  }, [body]);

  const handleCopyMarkdown = () => {
    const fullMd = title.trim() ? `# ${title.trim()}\n\n${body}` : body;
    navigator.clipboard.writeText(fullMd);
    setIsCopiedMd(true);
    setTimeout(() => setIsCopiedMd(false), 2000);
  };

  const handleCopyHtml = () => {
    const html = convertScratchpadToHtml(title, body);
    navigator.clipboard.writeText(html);
    setIsCopiedHtml(true);
    setTimeout(() => setIsCopiedHtml(false), 2000);
  };

  const handleDownloadMd = () => {
    const fullMd = title.trim() ? `# ${title.trim()}\n\n${body}` : body;
    const blob = new Blob([fullMd], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(focusKeyword || 'seo-article').replace(/\s+/g, '-').toLowerCase()}-draft.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // SVG Gauge
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.scoreBreakdown.totalScore / 100) * circumference;

  const scoreBadgeColors = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    slate: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  }[analysis.scoreBreakdown.ratingColor];

  const strokeColor = {
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    slate: '#64748b',
  }[analysis.scoreBreakdown.ratingColor];

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span>Tools</span>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            Live SEO Content Scratchpad
          </span>
        </div>

        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>SurferSEO & Yoast Alternative • 100% In-Memory & Free</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight text-balance">
            Real-Time Live SEO Content Scratchpad & Content Score Studio
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-balance">
            Write or paste your article draft, benchmark word count against top-ranking SERP competitors, and watch your <strong>0–100% Content Score</strong> and missing keyword checklist update live on every keystroke.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Launch Full-Screen Studio</span>
            </button>
            <Link
              href="/audit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Run Multi-URL Competitor Audit</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Embedded Interactive Workbench */}
        <section className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-950 shadow-xl overflow-hidden">
          
          {/* Workbench Header */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Live Studio Workbench
              </span>
            </div>

            {/* Keyword and Target Inputs */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-lg text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Key className="w-3 h-3 text-emerald-500" /> Focus:
              </span>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none w-36 sm:w-44"
              />
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Target className="w-3 h-3 text-blue-500" /> Target:
              </span>
              <input
                type="number"
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(Math.max(100, parseInt(e.target.value) || 100))}
                step={100}
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none w-14"
              />
              <span className="text-slate-400">words</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-colors"
                title="Copy as Markdown"
              >
                {isCopiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedMd ? 'Copied' : 'Copy MD'}</span>
              </button>

              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-colors"
                title="Copy as HTML"
              >
                {isCopiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileCode className="w-3.5 h-3.5" />}
                <span>{isCopiedHtml ? 'Copied' : 'HTML'}</span>
              </button>

              <button
                onClick={handleDownloadMd}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-colors"
                title="Download Draft"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                title="Expand Full Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Workbench Columns */}
          <div className="flex flex-col lg:flex-row h-[700px]">
            
            {/* Editor column */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/10 min-w-0">
              {/* Title input */}
              <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">
                  H1
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article Headline..."
                  className="flex-1 bg-transparent text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  analysis.placement.inTitle
                    ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-400 bg-slate-100 dark:bg-slate-900'
                }`}>
                  {analysis.placement.inTitle ? 'In Title' : 'Missing in Title'}
                </span>
              </div>

              {/* Textarea */}
              <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-0">
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Start typing your article here in markdown..."
                  className="w-full flex-1 bg-transparent resize-none focus:outline-none text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 overflow-y-auto"
                />
              </div>

              {/* Status bar */}
              <div className="px-4 sm:px-6 py-2 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {analysis.metrics.wordCount} / {targetWordCount} words
                  </span>
                  <span>•</span>
                  <span>~{analysis.metrics.readingTimeMinutes} min read</span>
                </div>
                <div>{analysis.metrics.gradeLabel}</div>
              </div>
            </div>

            {/* Live Scoring Radar Column */}
            <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-slate-50/50 dark:bg-slate-900/40 overflow-y-auto">
              
              {/* Score Gauge */}
              <div className="p-4 border-b border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/70">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-slate-200 dark:text-slate-800"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                        {analysis.scoreBreakdown.totalScore}
                      </span>
                      <span className="text-[8px] font-semibold text-slate-400 uppercase -mt-0.5">/ 100</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border mb-1 ${scoreBadgeColors}`}>
                      {analysis.scoreBreakdown.ratingLabel}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      {analysis.scoreBreakdown.totalScore >= 80
                        ? 'High rank readiness. Comprehensive keyword coverage.'
                        : 'Weave in missing keywords to increase topical authority.'}
                    </p>
                  </div>
                </div>

                {/* Placement checks */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {analysis.placement.inTitle ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-slate-400" />}
                    <span className={analysis.placement.inTitle ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>In Title</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {analysis.placement.inH1 ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-slate-400" />}
                    <span className={analysis.placement.inH1 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>In H1 Tag</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {analysis.placement.inFirst100 ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-slate-400" />}
                    <span className={analysis.placement.inFirst100 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>First 100 Words</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {analysis.placement.inH2 ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-slate-400" />}
                    <span className={analysis.placement.inH2 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>In at least 1 H2</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 pt-1">
                <button
                  onClick={() => setActiveRightTab('keywords')}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1 ${
                    activeRightTab === 'keywords'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  <Key className="w-3 h-3" />
                  <span>Keywords ({analysis.keywords.length})</span>
                </button>
                <button
                  onClick={() => setActiveRightTab('headings')}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1 ${
                    activeRightTab === 'headings'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  <Heading className="w-3 h-3" />
                  <span>Headings</span>
                </button>
              </div>

              {/* Keyword Tab */}
              {activeRightTab === 'keywords' && (
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      onClick={() => setKeywordFilter('all')}
                      className={`px-2 py-0.5 rounded-full ${keywordFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                    >
                      All ({analysis.keywords.length})
                    </button>
                    <button
                      onClick={() => setKeywordFilter('missing')}
                      className={`px-2 py-0.5 rounded-full ${keywordFilter === 'missing' ? 'bg-rose-500 text-white' : 'bg-rose-500/10 text-rose-600'}`}
                    >
                      Missing ({missingKeywordsCount})
                    </button>
                    <button
                      onClick={() => setKeywordFilter('optimal')}
                      className={`px-2 py-0.5 rounded-full ${keywordFilter === 'optimal' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-600'}`}
                    >
                      Optimal ({optimalKeywordsCount})
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {filteredKeywords.map((kw, i) => {
                      const isOpt = kw.status === 'optimal';
                      const isOver = kw.status === 'over';
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            isOpt
                              ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                              : isOver
                              ? 'bg-amber-500/[0.05] border-amber-500/30'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10'
                          }`}
                        >
                          <span className="font-medium truncate text-slate-800 dark:text-slate-200">
                            {kw.phrase}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {kw.currentCount}/{kw.minCount}–{kw.maxCount}
                            </span>
                            <button
                              onClick={() => insertAtCursor(` ${kw.phrase} `)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-500"
                              title="Insert"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Headings Tab */}
              {activeRightTab === 'headings' && (
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  <p className="text-[11px] text-slate-500">
                    Click + Insert to inject competitor outline sections directly into your draft:
                  </p>
                  {DEFAULT_COMPETITOR_HEADINGS.map((h, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-800 dark:text-slate-200 truncate font-medium">
                        {h.text}
                      </span>
                      <button
                        onClick={() => insertAtCursor(`\n\n## ${h.text}\n\n`)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 shrink-0"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Insert</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3 Steps Workflow */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              How to Write High-Ranking Content in 3 Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Eliminate the guesswork of SEO writing. Build topic-complete content that answers user search intent naturally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Set Target Keyword & Word Count
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Specify your primary search query and target word count benchmark (synthesized from ranking competitor pages).
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Write & Watch Keyword Checkboxes Turn Green
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                As you type, missing competitor gaps are detected on every keystroke. Watch the Content Score climb from 30 to 85+.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Export Clean Markdown or HTML
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Copy semantic HTML or Markdown with 1 click directly into WordPress, Webflow, Ghost, or Google Docs.
              </p>
            </div>
          </div>
        </section>

        {/* 4 Pillars Bento Grid */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Why Teams Choose AnalyzeSERP Scratchpad
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Built for precision, zero latency, and algorithmic alignment with modern Google ranking systems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/50 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sub-Millisecond Lexical Engine</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Zero server lag. Tokenization, word boundaries, and scoring calculate in browser RAM on every single keystroke.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/50 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Competitor Gap Radar</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Imports missing keywords discovered in your SERP audits so your writers never miss critical topical entities.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/50 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Stuffing & Penalty Guard</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flags over-optimized terms with amber warning pills before you publish, shielding you from search quality penalties.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/50 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Flesch-Kincaid Reading Grade</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Measures readability ease to keep writing within standard 8th–9th grade plain English for maximum search engagement.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="space-y-6 pt-4 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Everything you need to know about the Live SEO Content Scratchpad.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      {/* Full-Screen Modal */}
      {isModalOpen && (
        <ContentScratchpadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialTitle={title}
          initialContent={body}
          targetKeyword={focusKeyword}
          targetWordCount={targetWordCount}
          competitorKeywords={DEFAULT_GAP_KEYWORDS}
          suggestedHeadings={DEFAULT_COMPETITOR_HEADINGS}
        />
      )}

      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
    </div>
  );
}
