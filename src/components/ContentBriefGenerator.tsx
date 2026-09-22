'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SinglePageAudit } from '@/types/seo';
import { analyzeKeywordGaps } from '@/lib/keyword-gap';
import {
  FileCode,
  Copy,
  Download,
  Check,
  Sparkles,
  FileText,
  Target,
  Key,
  CheckSquare,
  Square,
  BookOpen,
  Layers,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Award,
  FileEdit,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';
import { AiSectionWriterModal } from './AiSectionWriterModal';
import { JsonLdSchemaModal } from './JsonLdSchemaModal';
import { FeaturedSnippetModal } from './FeaturedSnippetModal';
import { ContentScratchpadModal } from './ContentScratchpadModal';

interface ContentBriefGeneratorProps {
  results: SinglePageAudit[];
  targetUrl?: string;
  targetKeyword?: string;
}

export const ContentBriefGenerator: React.FC<ContentBriefGeneratorProps> = ({
  results,
  targetUrl,
  targetKeyword: initialTargetKeyword,
}) => {
  const [copied, setCopied] = useState(false);
  const [customKeyword, setCustomKeyword] = useState<string>(initialTargetKeyword || '');
  const [isAiWriterOpen, setIsAiWriterOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [snippetModalHeading, setSnippetModalHeading] = useState<string>('');
  const [aiModalHeading, setAiModalHeading] = useState<string>('');
  const [aiModalTopic, setAiModalTopic] = useState<string>('');
  const [copiedHeadingIdx, setCopiedHeadingIdx] = useState<number | null>(null);

  // Interactive on-page checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    title: false,
    h1: false,
    first100: false,
    meta: false,
    h2: false,
    schema: false,
  });

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('analyzeserp_pending_ai_modal');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.type === 'section-writer') {
        if (parsed.timestamp && Date.now() - parsed.timestamp > 15 * 60 * 1000) {
          localStorage.removeItem('analyzeserp_pending_ai_modal');
          return;
        }
        localStorage.removeItem('analyzeserp_pending_ai_modal');
        if (parsed.targetKeyword) {
          setCustomKeyword(parsed.targetKeyword);
        }
        if (parsed.sectionHeading) {
          setAiModalHeading(parsed.sectionHeading);
        }
        if (parsed.topic) {
          setAiModalTopic(parsed.topic);
        }
        setIsAiWriterOpen(true);
      }
    } catch (err) {
      console.warn('[ContentBriefGenerator] Failed to restore pending AI section writer modal:', err);
    }
  }, []);

  const validResults = useMemo(
    () => (results || []).filter((r) => r.status === 'success'),
    [results]
  );

  // Extract top 2-gram and 3-gram phrases across all valid audited URLs for suggestions
  const suggestedKeywords = useMemo(() => {
    const map = new Map<string, number>();
    validResults.forEach((r) => {
      const grams = [...(r.keywords?.twoGram || []), ...(r.keywords?.threeGram || [])];
      grams.forEach((g) => {
        const lower = g.phrase.toLowerCase().trim();
        if (lower.length > 3 && !/^\d+$/.test(lower)) {
          map.set(lower, (map.get(lower) || 0) + g.count);
        }
      });
    });

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([phrase]) => phrase);
  }, [validResults]);

  // Initial target keyword default
  const defaultTargetKeyword = useMemo(() => {
    if (initialTargetKeyword?.trim()) return initialTargetKeyword.trim();
    if (suggestedKeywords.length > 0) return suggestedKeywords[0];
    return validResults[0]?.keywords?.oneGram?.[0]?.phrase || 'target primary keyword';
  }, [initialTargetKeyword, suggestedKeywords, validResults]);

  const activeTargetKeyword = (customKeyword.trim() || defaultTargetKeyword).toLowerCase();

  const effectiveTargetUrl = targetUrl || validResults[0]?.url || '';

  // Compute Keyword Gaps for the brief
  const gapAnalysis = useMemo(() => {
    if (validResults.length < 2) {
      return { yourPageMissingGaps: [], keywordGaps: [] };
    }
    return analyzeKeywordGaps(validResults, effectiveTargetUrl);
  }, [validResults, effectiveTargetUrl]);

  const topGaps = (
    gapAnalysis.yourPageMissingGaps && gapAnalysis.yourPageMissingGaps.length > 0
      ? gapAnalysis.yourPageMissingGaps
      : gapAnalysis.keywordGaps
  )
    .slice(0, 14)
    .map((g) => g.phrase);

  // Aggregate word count benchmark
  const avgWordCount = Math.round(
    validResults.reduce((acc, r) => acc + r.wordCount, 0) / (validResults.length || 1)
  );
  const targetWordCount = Math.round(avgWordCount * 1.15); // Recommend 15% longer than average

  // Recommended primary keyword mentions range (1.0% to 2.0% density)
  const minMentions = Math.max(3, Math.round(targetWordCount * 0.01));
  const maxMentions = Math.max(5, Math.round(targetWordCount * 0.02));

  // Readability benchmark calculation
  const avgReadabilityEase = Math.round(
    validResults.reduce(
      (acc, r) => acc + (r.readability?.fleschReadingEase || 60),
      0
    ) / (validResults.length || 1)
  );
  const targetGradeLabel =
    validResults[0]?.readability?.gradeLabel || '8th-9th Grade (Standard)';

  // Aggregate unique H2 and H3 headings across competitors
  const { aggregatedHeadings, briefHeadings } = useMemo(() => {
    const list: { level: string; text: string; sourceHost: string }[] = [];
    const briefList: { level: string; text: string }[] = [];
    const seen = new Set<string>();

    validResults.forEach((r) => {
      let host = 'Competitor';
      try {
        host = new URL(r.url).hostname.replace(/^www\./, '');
      } catch {
        host = 'Competitor';
      }

      r.headings.forEach((h) => {
        if (h.level === 'h2' || h.level === 'h3') {
          const key = h.text.toLowerCase().trim();
          if (!seen.has(key) && key.length > 3) {
            seen.add(key);
            list.push({
              level: h.level.toUpperCase(),
              text: h.text.trim(),
              sourceHost: host,
            });
            briefList.push({
              level: h.level.toLowerCase(),
              text: h.text.trim(),
            });
          }
        }
      });
    });

    return { aggregatedHeadings: list, briefHeadings: briefList };
  }, [validResults]);

  if (validResults.length === 0) return null;

  // Build Markdown Brief string
  const markdownBrief = `# Evidence-Based SEO Content Brief & Outline
**Target Focus Query**: "${activeTargetKeyword}"
**SERP Word Count Benchmark**: ~${targetWordCount.toLocaleString()} words (15% above competitor average of ${avgWordCount.toLocaleString()} words)
**Target Readability Level**: ${targetGradeLabel} (Flesch Reading Ease: ~${avgReadabilityEase}/100)
**Keyword Density Benchmark**: ~1.0% – 2.0% density (${minMentions}–${maxMentions} mentions)
**Competitor Pages Analyzed**: ${validResults.length} URLs

---

## 🎯 Keyword Placement & On-Page Checklist
- [ ] **Title Tag**: Include "${activeTargetKeyword}" near the beginning (under 60 characters).
- [ ] **H1 Heading**: Include "${activeTargetKeyword}" naturally in the primary main heading.
- [ ] **First 100 Words**: Introduce "${activeTargetKeyword}" within the opening paragraph.
- [ ] **Meta Description**: Include "${activeTargetKeyword}" with a compelling search click-through hook.
- [ ] **H2 Subheading**: Use "${activeTargetKeyword}" or a close variation in at least one H2 section.

---

## 🔑 Missing Keyword & Entity Opportunities (SERP Evidence)
${
  topGaps.length > 0
    ? topGaps.map((g) => `- **${g}** *(Used repeatedly across ranking competitors)*`).join('\n')
    : '- No major keyword gaps detected.'
}

---

## 📑 Synthesized Competitor Heading Architecture
${aggregatedHeadings
  .map(
    (h) =>
      `${h.level === 'H2' ? '###' : '####'} ${h.text} (Source: ${h.sourceHost})`
  )
  .join('\n')}

---

## ⚙️ Recommended Technical & Schema Enhancements
- [ ] **FAQ Section**: Add an FAQ H2 section answering key user search queries.
- [ ] **JSON-LD Schema**: Add FAQPage or Article structured data for rich snippet eligibility.

---
*Generated by AnalyzeSERP Strategic Content Brief Generator*
`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownBrief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownBrief], {
      type: 'text/markdown;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `content-brief-${activeTargetKeyword.replace(/\s+/g, '-')}.md`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SEO Content Brief & Keyword Strategy', 14, 20);

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Target Primary Keyword: "${activeTargetKeyword}"`, 14, 30);
    doc.text(`Recommended Word Count: ${targetWordCount.toLocaleString()} words`, 14, 36);
    doc.text(`Target Readability: ${targetGradeLabel} (~${avgReadabilityEase}/100 Ease)`, 14, 42);
    doc.text(`Keyword Frequency Goal: ${minMentions}-${maxMentions} mentions (1.0%-2.0% density)`, 14, 48);
    doc.text(`Competitors Analyzed: ${validResults.length}`, 14, 54);

    let yPosition = 64;
    if (topGaps.length > 0) {
      doc.setFont('Helvetica', 'bold');
      doc.text('Missing Keyword Gaps to Include:', 14, yPosition);
      yPosition += 6;
      doc.setFont('Helvetica', 'normal');
      doc.text(topGaps.slice(0, 6).join(', '), 14, yPosition);
      yPosition += 10;
    }

    doc.setFont('Helvetica', 'bold');
    doc.text('Competitor Outline Headings:', 14, yPosition);
    yPosition += 8;

    doc.setFont('Helvetica', 'normal');
    aggregatedHeadings.slice(0, 25).forEach((h) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      const prefix = h.level === 'H2' ? '• [H2] ' : '   - [H3] ';
      doc.text(`${prefix}${h.text} (${h.sourceHost})`, 14, yPosition);
      yPosition += 6;
    });

    doc.save(`content-brief-${activeTargetKeyword.replace(/\s+/g, '-')}.pdf`);
  };

  const handleTriggerAiForHeading = (headingText: string) => {
    setAiModalHeading(headingText);
    setAiModalTopic(`${activeTargetKeyword} - ${headingText}`);
    setIsAiWriterOpen(true);
  };

  const handleCopySingleHeading = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedHeadingIdx(idx);
    setTimeout(() => setCopiedHeadingIdx(null), 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-xs p-5 sm:p-7 space-y-6">
      {/* 1. Control & Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              Editorial Blueprint
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Synthesized across <strong className="text-slate-800 dark:text-slate-100">{validResults.length} audited URLs</strong>
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Evidence-Based Content Brief &amp; Outline Specification</span>
          </h4>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setIsScratchpadOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-emerald-600/20"
            title="Open in Live SEO Content Scratchpad with real-time scoring"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Live SEO Scratchpad</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAiModalHeading(`Comprehensive Guide to ${activeTargetKeyword}`);
              setAiModalTopic(activeTargetKeyword);
              setIsAiWriterOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>AI Draft Section</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy formatted Markdown brief to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied Brief!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download brief as .MD file"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export brief as PDF"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Target Keyword Input & Quick-Select Suggestions */}
      <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 space-y-2.5">
        <label htmlFor="brief-target-query" className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Target Primary Keyword for Content Brief:</span>
          <SEOExplanationTooltip text="The exact search query your article is written to rank for. This configures the placement rules, density bounds, and outline." />
        </label>

        <input
          id="brief-target-query"
          type="text"
          value={customKeyword}
          onChange={(e) => setCustomKeyword(e.target.value)}
          placeholder={`Enter target search query (e.g. ${defaultTargetKeyword})`}
          className="w-full px-3.5 py-2 rounded-lg text-xs border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
        />

        {suggestedKeywords.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              Or quick-select top competitor search phrases:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedKeywords.map((kw, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomKeyword(kw)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    activeTargetKeyword === kw.toLowerCase()
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. SERP Benchmark KPI Deck (3 Semantic Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Target Word Goal */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5">
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>Target Word Goal</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              +15% Consensus
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300 tabular-nums">
            ~{targetWordCount.toLocaleString()} <span className="text-xs font-normal">words</span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            Competitor average is {avgWordCount.toLocaleString()} words. A +15% cushion ensures superior topical depth.
          </p>
        </div>

        {/* Card 2: Target Readability */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 space-y-1.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Target Readability Level</span>
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
            {avgReadabilityEase} <span className="text-xs font-normal">/ 100 Ease</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Calibrate writing to <strong>{targetGradeLabel}</strong> for optimal comprehension and lower bounce rates.
          </p>
        </div>

        {/* Card 3: Keyword Frequency Goal */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 space-y-1.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Target Keyword Density</span>
            <Key className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
            {minMentions}–{maxMentions} <span className="text-xs font-normal">mentions</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Maintain ~1.0% to 2.0% natural density. Avoid keyword stuffing over 2.5%.
          </p>
        </div>
      </div>

      {/* 4. Two-Column Operational Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: On-Page Placement Checklist */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Keyword Placement Rules for Writers</span>
            </h5>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Interactive Checklist
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Title Tag */}
            <label
              onClick={() => toggleCheck('title')}
              className="p-3 rounded-lg border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] flex items-start gap-2.5 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors"
            >
              <button type="button" className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                {checkedItems.title ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
              </button>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  Title Tag Optimization (&lt; 60 chars)
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-snug">
                  Place &quot;<strong>{activeTargetKeyword}</strong>&quot; near the start of the title tag. Ensure total length stays under ~580 pixels to avoid truncation.
                </p>
              </div>
            </label>

            {/* H1 Main Heading */}
            <label
              onClick={() => toggleCheck('h1')}
              className="p-3 rounded-lg border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] flex items-start gap-2.5 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors"
            >
              <button type="button" className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                {checkedItems.h1 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
              </button>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  H1 Main Document Title
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-snug">
                  Incorporate the exact query &quot;<strong>{activeTargetKeyword}</strong>&quot; in your page&apos;s single H1 heading with user-focused context.
                </p>
              </div>
            </label>

            {/* First 100 Words */}
            <label
              onClick={() => toggleCheck('first100')}
              className="p-3 rounded-lg border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] flex items-start gap-2.5 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors"
            >
              <button type="button" className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                {checkedItems.first100 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
              </button>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  Opening 100 Words
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-snug">
                  Introduce the primary keyword in the first sentence or opening paragraph to establish immediate topical relevance for Googlebot.
                </p>
              </div>
            </label>

            {/* Meta Description */}
            <label
              onClick={() => toggleCheck('meta')}
              className="p-3 rounded-lg border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] flex items-start gap-2.5 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors"
            >
              <button type="button" className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                {checkedItems.meta ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
              </button>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  Meta Description Snippet (120–155 chars)
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-snug">
                  Include &quot;<strong>{activeTargetKeyword}</strong>&quot; naturally with a clear value proposition to maximize organic SERP CTR.
                </p>
              </div>
            </label>

            {/* H2 Subheadings */}
            <label
              onClick={() => toggleCheck('h2')}
              className="p-3 rounded-lg border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] flex items-start gap-2.5 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors"
            >
              <button type="button" className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                {checkedItems.h2 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
              </button>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  H2 Subheadings Coverage
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-snug">
                  Use semantic variations of &quot;<strong>{activeTargetKeyword}</strong>&quot; across 2 or more H2 subheadings to capture secondary long-tail intents.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Missing Keyword & Semantic Gaps */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Missing Semantic Vocabulary (SERP Evidence)</span>
              </h5>
              <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                {topGaps.length} Terms
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              These terms are used repeatedly by ranking competitors. Weave them naturally into your subheadings, explanations, and FAQ blocks:
            </p>

            {topGaps.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-[300px] overflow-y-auto">
                {topGaps.map((gap, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-mono text-[11px] font-medium flex items-center gap-1"
                  >
                    <span>{gap}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                No major keyword gaps detected — your target page already shares all core competitor terms.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400">
            Tip: Click <strong>&quot;AI Draft Section&quot;</strong> on any heading below to automatically integrate these gap terms.
          </div>
        </div>
      </div>

      {/* 5. Synthesized Competitor Heading Architecture */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Synthesized Competitor Heading Architecture ({aggregatedHeadings.length} Headings)</span>
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Extracted from Page 1 competitors. Model this structure to create the most thorough guide on the web.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSchemaModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Convert heading questions to FAQPage Schema"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>FAQ Schema</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSnippetModalHeading(aggregatedHeadings[0]?.text ? `## ${aggregatedHeadings[0].text}` : `## What is ${activeTargetKeyword}?`);
                setIsSnippetModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Craft Google Featured Snippet (Position 0) bait"
            >
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Position 0 Bait</span>
            </button>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
              Click <strong>&quot;Draft with AI&quot;</strong> to generate section copy
            </div>
          </div>
        </div>

        <div className="space-y-1.5 max-h-[440px] overflow-y-auto modal-scroll pr-1">
          {aggregatedHeadings.map((h, idx) => {
            const isH2 = h.level === 'H2';
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                  isH2
                    ? 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/5'
                    : 'bg-white dark:bg-white/[0.01] border-slate-100 dark:border-white/[0.03] ml-4'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 ${
                      isH2
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {h.level}
                  </span>
                  <span className={`text-xs truncate ${isH2 ? 'font-bold text-slate-800 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`} title={h.text}>
                    {h.text}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline">
                    ({h.sourceHost})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopySingleHeading(h.text, idx)}
                    className="p-1 px-2 rounded text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy heading text"
                  >
                    {copiedHeadingIdx === idx ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSnippetModalHeading(`## ${h.text}`);
                      setIsSnippetModalOpen(true);
                    }}
                    className="p-1 px-2 rounded text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Optimize this question heading for Google Position 0"
                  >
                    <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="hidden sm:inline">Pos 0</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTriggerAiForHeading(h.text)}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Generate section text using Gemini AI"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Draft with AI</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Technical & Schema Enhancements */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>Recommended Technical &amp; Schema Enhancements</span>
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Unlock Google SERP FAQ accordions and Article rich snippets to capture higher click-through rates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSchemaModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shadow-xs active:scale-95"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Build JSON-LD Schema</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>FAQPage Structured Data</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                Rich Accordions
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Google displays expandable Q&amp;A accordions directly below your search result snippet. Use our visual builder to automatically convert heading questions into valid Schema.org markup.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Article / BlogPosting Schema</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                Discover &amp; E-E-A-T
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Signals author identity, publication timestamp, and verified organization publisher data to Googlebot for stronger topical authority and Google Discover eligibility.
            </p>
          </div>
        </div>
      </div>

      {/* AI Section Writer Modal */}
      <AiSectionWriterModal
        isOpen={isAiWriterOpen}
        onClose={() => setIsAiWriterOpen(false)}
        topic={aiModalTopic || activeTargetKeyword}
        targetKeyword={activeTargetKeyword}
        sectionHeading={aiModalHeading || `Comprehensive Guide to ${activeTargetKeyword}`}
      />

      {/* JSON-LD Schema Generator Modal */}
      {isSchemaModalOpen && (
        <JsonLdSchemaModal
          isOpen={isSchemaModalOpen}
          onClose={() => setIsSchemaModalOpen(false)}
          initialTitle={validResults[0]?.meta?.title || activeTargetKeyword}
          initialDescription={validResults[0]?.meta?.description || ''}
          initialUrl={effectiveTargetUrl}
          initialKeyword={activeTargetKeyword}
          headings={briefHeadings}
        />
      )}

      {/* Google Featured Snippet (Position 0) Optimizer Modal */}
      {isSnippetModalOpen && (
        <FeaturedSnippetModal
          isOpen={isSnippetModalOpen}
          onClose={() => setIsSnippetModalOpen(false)}
          initialQuery={activeTargetKeyword}
          initialHeading={snippetModalHeading || (aggregatedHeadings[0]?.text ? `## ${aggregatedHeadings[0].text}` : `## What is ${activeTargetKeyword}?`)}
          targetUrl={effectiveTargetUrl}
        />
      )}

      {/* Real-Time Live SEO Content Scratchpad Modal */}
      {isScratchpadOpen && (
        <ContentScratchpadModal
          isOpen={isScratchpadOpen}
          onClose={() => setIsScratchpadOpen(false)}
          initialTitle={validResults[0]?.meta?.title || `${activeTargetKeyword.charAt(0).toUpperCase() + activeTargetKeyword.slice(1)}: Complete Guide`}
          initialContent={markdownBrief}
          targetKeyword={activeTargetKeyword}
          targetWordCount={targetWordCount}
          competitorKeywords={topGaps.map((g) => ({ phrase: g, targetMin: 2, targetMax: 5 }))}
          suggestedHeadings={aggregatedHeadings.map((h) => ({ level: h.level.toLowerCase(), text: h.text }))}
          targetUrl={effectiveTargetUrl}
        />
      )}
    </div>
  );
};
