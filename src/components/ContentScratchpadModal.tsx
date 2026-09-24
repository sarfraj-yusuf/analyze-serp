'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Key,
  Target,
  Heading,
  Clock,
  BookOpen,
  HelpCircle,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  FileCode,
  Zap,
  Trash2,
  Share2,
} from 'lucide-react';
import {
  analyzeScratchpad,
  convertScratchpadToHtml,
  ScratchpadAnalysisResult,
  ScratchpadKeyword,
} from '@/lib/scratchpad-scorer';
import { AuthModal } from './AuthModal';
import { Tooltip } from './Tooltip';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export interface ContentScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialContent?: string;
  targetKeyword?: string;
  targetWordCount?: number;
  competitorKeywords?: Array<{ phrase: string; targetMin?: number; targetMax?: number } | string>;
  suggestedHeadings?: Array<{ level: string; text: string } | string>;
  targetUrl?: string;
}

export function ContentScratchpadModal({
  isOpen,
  onClose,
  initialTitle = '',
  initialContent = '',
  targetKeyword = '',
  targetWordCount = 1200,
  competitorKeywords = [],
  suggestedHeadings = [],
  targetUrl = '',
}: ContentScratchpadModalProps) {
  const modalRef = useFocusTrap({ isOpen, onClose });
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialContent);
  const [focusKeyword, setFocusKeyword] = useState(targetKeyword);
  const [wordCountTarget, setWordCountTarget] = useState(targetWordCount);
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'missing' | 'optimal' | 'over'>('all');
  const [activeRightTab, setActiveRightTab] = useState<'keywords' | 'headings' | 'ai'>('keywords');
  const [isScoreDetailsOpen, setIsScoreDetailsOpen] = useState(false);
  const [isCopiedMd, setIsCopiedMd] = useState(false);
  const [isCopiedHtml, setIsCopiedHtml] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // AI Assistant State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState<'insert-keywords' | 'improve-intro' | 'simplify-reading'>('insert-keywords');
  const [aiResult, setAiResult] = useState<{ suggestedContent: string; explanation: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format competitor gap keywords into normalized structure
  const formattedGapKeywords = useMemo(() => {
    return competitorKeywords.map((k) => {
      if (typeof k === 'string') {
        return { phrase: k, targetMin: 2, targetMax: 5 };
      }
      return {
        phrase: k.phrase,
        targetMin: k.targetMin ?? 2,
        targetMax: k.targetMax ?? 5,
      };
    });
  }, [competitorKeywords]);

  // Format competitor suggested headings
  const formattedHeadings = useMemo(() => {
    return suggestedHeadings.map((h) => {
      if (typeof h === 'string') {
        return { level: 'h2', text: h };
      }
      return { level: h.level?.toLowerCase() || 'h2', text: h.text };
    });
  }, [suggestedHeadings]);

  // Try to restore any previous draft from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = `analyzeserp_scratchpad_${focusKeyword || 'general'}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.body && (!initialContent || parsed.body.length > initialContent.length)) {
          setBody(parsed.body);
          if (parsed.title) setTitle(parsed.title);
          setLastSavedTime('Restored from draft');
        }
      }
    } catch {
      // ignore
    }
  }, [focusKeyword, initialContent]);

  // Auto-save to localStorage with 1s debounce
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        const storageKey = `analyzeserp_scratchpad_${focusKeyword || 'general'}`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            title,
            body,
            timestamp: Date.now(),
          })
        );
        const d = new Date();
        setLastSavedTime(`Saved at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
      } catch {
        // ignore
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, body, focusKeyword]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Run real-time synchronous lexical analysis on every keystroke
  const analysis: ScratchpadAnalysisResult = useMemo(() => {
    return analyzeScratchpad({
      title,
      body,
      targetKeyword: focusKeyword,
      gapKeywords: formattedGapKeywords,
      targetWordCount: wordCountTarget,
    });
  }, [title, body, focusKeyword, formattedGapKeywords, wordCountTarget]);

  // Filtered keywords for list
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

  // Toolbar action helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newBody = body.substring(0, start) + replacement + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  };

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

  // Copy actions
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

  const handleClearDraft = () => {
    if (confirm('Are you sure you want to clear your current draft text?')) {
      setBody('');
    }
  };

  // AI Assist generation call
  const handleRunAiAssist = async (actionType: 'insert-keywords' | 'improve-intro' | 'simplify-reading') => {
    setIsAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setAiAction(actionType);

    try {
      const missingList = analysis.keywords.filter((k) => k.status === 'missing').map((k) => k.phrase);
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'scratchpad-assist',
          action: actionType,
          draftText: body,
          targetKeyword: focusKeyword || 'SEO',
          missingKeywords: missingList,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || data.requiresAuth) {
          setIsAuthModalOpen(true);
          return;
        }
        throw new Error(data.error || 'Failed to run AI content assistant.');
      }

      setAiResult(data.data);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  // Score color classes
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

  // SVG Circular Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.scoreBreakdown.totalScore / 100) * circumference;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scratchpad-modal-title"
        className="relative w-full max-w-[1580px] h-[94vh] flex flex-col bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100"
      >
        
        {/* Top Header Bar */}
        <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="scratchpad-modal-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  Live SEO Content Scratchpad
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  SurferSEO Style
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm sm:max-w-md">
                {targetUrl ? targetUrl : 'Real-time lexical scoring & missing keyword density radar'}
              </p>
            </div>
          </div>

          {/* Center Target & Word count config */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs">
            <label htmlFor="scratchpad-focus-keyword" className="text-slate-500 flex items-center gap-1 font-medium cursor-pointer">
              <Key className="w-3.5 h-3.5 text-emerald-500" /> Focus:
            </label>
            <input
              id="scratchpad-focus-keyword"
              type="text"
              aria-label="Target Focus Keyword"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="e.g. Technical SEO Audit"
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none w-32 sm:w-44 placeholder:text-slate-400"
            />
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <label htmlFor="scratchpad-word-target" className="text-slate-500 flex items-center gap-1 font-medium cursor-pointer">
              <Target className="w-3.5 h-3.5 text-blue-500" /> Target:
            </label>
            <input
              id="scratchpad-word-target"
              type="number"
              aria-label="Target Word Count"
              value={wordCountTarget}
              onChange={(e) => setWordCountTarget(Math.max(100, parseInt(e.target.value) || 100))}
              step={100}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none w-16"
            />
            <span className="text-slate-400">words</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {lastSavedTime && (
              <span className="hidden xl:inline-block text-[11px] text-slate-600 dark:text-slate-300 mr-1">
                {lastSavedTime}
              </span>
            )}

            <button
              type="button"
              onClick={handleCopyMarkdown}
              aria-label="Copy draft as Markdown"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              title="Copy Draft as Markdown"
            >
              {isCopiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedMd ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyHtml}
              aria-label="Copy draft as semantic HTML"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              title="Copy Draft as Semantic HTML"
            >
              {isCopiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileCode className="w-3.5 h-3.5" />}
              <span>{isCopiedHtml ? 'Copied' : 'HTML'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMd}
              aria-label="Download draft as Markdown file"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              title="Download as .md file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <Tooltip content="Clear Draft" side="bottom">
              <button
                type="button"
                onClick={handleClearDraft}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                aria-label="Clear Draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>

            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

            <Tooltip content="Close (Esc)" side="bottom">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                aria-label="Close Scratchpad"
              >
                <X className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </header>

        {/* Dual Panel Body */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* LEFT PANEL: Writing Canvas & Markdown Toolbar (flex-1) */}
          <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-950">
            
            {/* Title / H1 Input */}
            <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
              <label htmlFor="scratchpad-title-h1" className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-white/10 cursor-pointer">
                H1
              </label>
              <input
                id="scratchpad-title-h1"
                type="text"
                aria-label="Article Title / Primary H1 Headline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Article Title / Primary H1 Headline..."
                className="flex-1 bg-transparent text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none tracking-tight"
              />
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  analysis.placement.inTitle
                    ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-400 bg-slate-100 dark:bg-slate-900'
                }`}>
                  {analysis.placement.inTitle ? 'Keyword in Title' : 'Keyword Missing'}
                </span>
                <span className="text-slate-400 text-[11px] font-mono">
                  {title.length} chars
                </span>
              </div>
            </div>

            {/* Quick Markdown Formatting Strip */}
            <div role="toolbar" aria-label="Markdown formatting toolbar" className="flex items-center flex-wrap gap-1 px-4 sm:px-6 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
              <button
                type="button"
                onClick={() => insertFormatting('## ')}
                aria-label="Format as Heading 2"
                className="px-2 py-1 rounded font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ')}
                aria-label="Format as Heading 3"
                className="px-2 py-1 rounded font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Heading 3"
              >
                H3
              </button>
              <div className="h-3 w-px bg-slate-200 dark:bg-white/10 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                aria-label="Format as Bold text"
                className="px-2 py-1 rounded font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Bold (**text**)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                aria-label="Format as Italic text"
                className="px-2 py-1 rounded italic text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Italic (*text*)"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- ')}
                aria-label="Insert bulleted list"
                className="px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Bulleted List (- item)"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('1. ')}
                aria-label="Insert numbered list"
                className="px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Numbered List (1. item)"
              >
                1. Steps
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('> ')}
                aria-label="Insert quote block"
                className="px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Quote Block (> quote)"
              >
                “ Quote
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('`', '`')}
                aria-label="Insert inline code"
                className="px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Inline Code (`code`)"
              >
                `code`
              </button>

              <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
                <span>Markdown Supported</span>
              </div>
            </div>

            {/* Textarea writing area */}
            <div className="flex-1 relative p-4 sm:p-6 flex flex-col min-h-0">
              <label htmlFor="scratchpad-body-textarea" className="sr-only">Article Content Body</label>
              <textarea
                id="scratchpad-body-textarea"
                aria-label="Article Content Body"
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Start writing or paste your draft here... Use ## for H2 subheadings, bullet points for lists, and write naturally. The SEO Radar on the right will dynamically score your content and track missing competitor keywords in real-time."
                className="w-full flex-1 bg-transparent resize-none focus:outline-none text-sm sm:text-[15px] leading-relaxed font-sans text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 overflow-y-auto selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300"
              />
            </div>

            {/* Editor Bottom Status Bar */}
            <footer className="px-4 sm:px-6 py-2.5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">
                    {analysis.metrics.wordCount.toLocaleString()}
                  </span>
                  / {wordCountTarget.toLocaleString()} words
                </span>
                
                {/* Word Count Mini Progress Bar */}
                <div className="w-20 sm:w-28 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      analysis.metrics.wordCount >= wordCountTarget
                        ? 'bg-emerald-500'
                        : analysis.metrics.wordCount >= wordCountTarget * 0.7
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((analysis.metrics.wordCount / (wordCountTarget || 1)) * 100))}%`,
                    }}
                  />
                </div>

                <span className="hidden sm:flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  ~{analysis.metrics.readingTimeMinutes} min read
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  {analysis.metrics.gradeLabel}
                </span>
                <span>•</span>
                <span>{analysis.headings.length} headings</span>
                <span>•</span>
                <span>{analysis.metrics.sentenceCount} sentences</span>
              </div>
            </footer>
          </div>

          {/* RIGHT PANEL: Live SEO Scoring Radar & Companion Tabs (w-full lg:w-[410px] xl:w-[440px]) */}
          <div className="w-full lg:w-[410px] xl:w-[440px] flex flex-col bg-slate-50/50 dark:bg-slate-900/40 overflow-y-auto">
            
            {/* Top Widget: Circular Content Score Gauge & Breakdown */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/70">
              <div className="flex items-center justify-between gap-4">
                
                {/* Radial Score Gauge */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    {/* Track */}
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="7"
                      fill="transparent"
                      className="text-slate-200 dark:text-slate-800"
                    />
                    {/* Value Ring */}
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke={strokeColor}
                      strokeWidth="7"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
                      {analysis.scoreBreakdown.totalScore}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 -mt-0.5">
                      / 100
                    </span>
                  </div>
                </div>

                {/* Score Status Text */}
                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border mb-1.5 ${scoreBadgeColors}`}>
                    {analysis.scoreBreakdown.ratingLabel}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {analysis.scoreBreakdown.totalScore >= 80
                      ? 'Exceptional topical coverage and keyword placement. High rank readiness.'
                      : analysis.scoreBreakdown.totalScore >= 60
                      ? 'Solid foundation. Weave in a few more competitor gap keywords to reach 80+.'
                      : 'Increase focus keyword placement and address missing keyword opportunities.'}
                  </p>
                  <button
                    onClick={() => setIsScoreDetailsOpen(!isScoreDetailsOpen)}
                    className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>{isScoreDetailsOpen ? 'Hide Score Breakdown' : 'View Score Breakdown'}</span>
                    {isScoreDetailsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Granular Score Breakdown Drawer */}
              {isScoreDetailsOpen && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-500" /> Keyword Coverage:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {analysis.scoreBreakdown.keywordCoverageScore} / 35 pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-500" /> Keyword Placement:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {analysis.scoreBreakdown.placementScore} / 25 pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-500" /> Word Count Target:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {analysis.scoreBreakdown.wordCountScore} / 20 pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Heading className="w-3.5 h-3.5 text-amber-500" /> Structure & Headings:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {analysis.scoreBreakdown.structureScore} / 10 pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-teal-500" /> Readability & Flow:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {analysis.scoreBreakdown.readabilityScore} / 10 pts
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Placement Checklist */}
            <div className="px-4 py-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/30">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                Primary Keyword Placement ({focusKeyword || 'Focus'})
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  {analysis.placement.inTitle ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  )}
                  <span className={analysis.placement.inTitle ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                    In Title
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {analysis.placement.inH1 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  )}
                  <span className={analysis.placement.inH1 ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                    In H1 Tag
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {analysis.placement.inFirst100 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  )}
                  <span className={analysis.placement.inFirst100 ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                    First 100 Words
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {analysis.placement.inH2 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  )}
                  <span className={analysis.placement.inH2 ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                    In at least 1 H2
                  </span>
                </div>
              </div>
            </div>

            {/* Companion Nav Tabs: Keywords | Headings | AI Polish */}
            <div role="tablist" aria-label="Scratchpad tools and keyword radar" className="flex items-center border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-2 pt-1">
              <button
                type="button"
                role="tab"
                id="tab-scratchpad-keywords"
                aria-selected={activeRightTab === 'keywords'}
                aria-controls="panel-scratchpad-keywords"
                onClick={() => setActiveRightTab('keywords')}
                className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRightTab === 'keywords'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Keywords ({analysis.keywords.length})</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-scratchpad-headings"
                aria-selected={activeRightTab === 'headings'}
                aria-controls="panel-scratchpad-headings"
                onClick={() => setActiveRightTab('headings')}
                className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRightTab === 'headings'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Heading className="w-3.5 h-3.5" />
                <span>Headings ({formattedHeadings.length})</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-scratchpad-ai"
                aria-selected={activeRightTab === 'ai'}
                aria-controls="panel-scratchpad-ai"
                onClick={() => setActiveRightTab('ai')}
                className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRightTab === 'ai'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Polish</span>
              </button>
            </div>

            {/* TAB CONTENT 1: Keywords Radar */}
            {activeRightTab === 'keywords' && (
              <div id="panel-scratchpad-keywords" role="tabpanel" aria-labelledby="tab-scratchpad-keywords" className="flex-1 flex flex-col p-4 min-h-0">
                
                {/* Filter Pills */}
                <div role="radiogroup" aria-label="Keyword coverage filter" className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-[11px]">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={keywordFilter === 'all'}
                    onClick={() => setKeywordFilter('all')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      keywordFilter === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    All ({analysis.keywords.length})
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={keywordFilter === 'missing'}
                    onClick={() => setKeywordFilter('missing')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      keywordFilter === 'missing'
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                    }`}
                  >
                    Missing ({missingKeywordsCount})
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={keywordFilter === 'optimal'}
                    onClick={() => setKeywordFilter('optimal')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      keywordFilter === 'optimal'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    Optimal ({optimalKeywordsCount})
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={keywordFilter === 'over'}
                    onClick={() => setKeywordFilter('over')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      keywordFilter === 'over'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    Over-used
                  </button>
                </div>

                {/* Keyword Checklist List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredKeywords.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                      No keywords matching &quot;{keywordFilter}&quot; filter.
                    </div>
                  ) : (
                    filteredKeywords.map((kw, i) => {
                      const isOptimal = kw.status === 'optimal';
                      const isOver = kw.status === 'over';
                      const isMissing = kw.status === 'missing';

                      return (
                        <div
                          key={i}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors ${
                            isOptimal
                              ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                              : isOver
                              ? 'bg-amber-500/[0.05] border-amber-500/30'
                              : isMissing
                              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10'
                              : 'bg-blue-500/[0.04] border-blue-500/20'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {isOptimal && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                              {isOver && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                              {isMissing && <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />}
                              <span className={`font-medium truncate ${
                                isOptimal
                                  ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                                  : isOver
                                  ? 'text-amber-700 dark:text-amber-300 font-semibold'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}>
                                {kw.phrase}
                              </span>
                              {kw.isPrimary && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 bg-emerald-500/10 text-emerald-600 rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Occurrence Pill */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                                isOptimal
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : isOver
                                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                  : isMissing
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              }`}
                              title={`Used ${kw.currentCount} times. Target range: ${kw.minCount}–${kw.maxCount}`}
                            >
                              {kw.currentCount} / {kw.minCount}–{kw.maxCount}
                            </span>

                            {/* + Insert Button */}
                            <button
                              type="button"
                              onClick={() => insertAtCursor(` ${kw.phrase} `)}
                              aria-label={`Insert keyword "${kw.phrase}" into draft`}
                              className="p-1 rounded text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              title="Insert keyword into draft"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Competitor Headings Outline */}
            {activeRightTab === 'headings' && (
              <div id="panel-scratchpad-headings" role="tabpanel" aria-labelledby="tab-scratchpad-headings" className="flex-1 flex flex-col p-4 min-h-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Top ranking competitor subheadings synthesized from your SERP audit. Click <strong>+ Insert</strong> to add any section into your outline.
                </p>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {formattedHeadings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                      No competitor headings provided in this session.
                    </div>
                  ) : (
                    formattedHeadings.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                            {h.level.toUpperCase()}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 truncate font-medium">
                            {h.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => insertAtCursor(`\n\n## ${h.text}\n\n`)}
                          aria-label={`Insert heading "${h.text}" into draft`}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors shrink-0 cursor-pointer"
                          title="Insert heading into draft"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: AI Assistant Polish */}
            {activeRightTab === 'ai' && (
              <div id="panel-scratchpad-ai" role="tabpanel" aria-labelledby="tab-scratchpad-ai" className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto space-y-4">
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] text-xs">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Writing & Gap Filler
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Use Gemini 3.6 Flash to weave missing competitor keywords naturally into human-sounding copy, craft high-impact hooks, or simplify readability.
                  </p>
                </div>

                {/* 3 Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleRunAiAssist('insert-keywords')}
                    disabled={isAiLoading || missingKeywordsCount === 0}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-50"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Weave Missing Keywords Naturally
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Crafts 2–3 contextual sentences using top missing gap phrases ({missingKeywordsCount} missing)
                      </div>
                    </div>
                    {isAiLoading && aiAction === 'insert-keywords' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0 ml-2" />
                    ) : (
                      <Zap className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                    )}
                  </button>

                  <button
                    onClick={() => handleRunAiAssist('improve-intro')}
                    disabled={isAiLoading}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-50"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Generate High-CTR SEO Intro Hook
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Includes &quot;{focusKeyword || 'primary keyword'}&quot; in first 60 words to pass Google placement check
                      </div>
                    </div>
                    {isAiLoading && aiAction === 'improve-intro' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0 ml-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-500 shrink-0 ml-2" />
                    )}
                  </button>

                  <button
                    onClick={() => handleRunAiAssist('simplify-reading')}
                    disabled={isAiLoading || body.length < 40}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-50"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Simplify Readability (Flesch &gt; 65)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Rewrites convoluted phrases into 8th-grade plain English
                      </div>
                    </div>
                    {isAiLoading && aiAction === 'simplify-reading' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500 shrink-0 ml-2" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-purple-500 shrink-0 ml-2" />
                    )}
                  </button>
                </div>

                {/* AI Error */}
                {aiError && (
                  <div role="alert" aria-live="polite" className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                    {aiError}
                  </div>
                )}

                {/* AI Output Box */}
                {aiResult && (
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        AI Suggestion Ready
                      </span>
                      <button
                        onClick={() => insertAtCursor(`\n\n${aiResult.suggestedContent}\n\n`)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Insert into Draft</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 italic">
                      {aiResult.explanation}
                    </p>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {aiResult.suggestedContent}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal Trigger if user clicks AI without sign-in */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          featureTitle="Live SEO Content Scratchpad AI"
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
