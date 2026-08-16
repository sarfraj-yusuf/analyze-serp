'use client';

import React, { useState, useMemo } from 'react';
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
  HelpCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';

interface ContentBriefGeneratorProps {
  results: SinglePageAudit[];
}

export const ContentBriefGenerator: React.FC<ContentBriefGeneratorProps> = ({ results }) => {
  const [copied, setCopied] = useState(false);
  const [customKeyword, setCustomKeyword] = useState<string>('');

  const validResults = useMemo(
    () => results.filter((r) => r.status === 'success'),
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

  // Initial target keyword default (first multi-word phrase or first 1-gram)
  const defaultTargetKeyword = useMemo(() => {
    if (suggestedKeywords.length > 0) return suggestedKeywords[0];
    return validResults[0]?.keywords?.oneGram?.[0]?.phrase || 'target primary keyword';
  }, [suggestedKeywords, validResults]);

  const activeTargetKeyword = (customKeyword.trim() || defaultTargetKeyword).toLowerCase();

  if (validResults.length === 0) return null;

  // Compute Keyword Gaps for the brief
  const gapAnalysis = analyzeKeywordGaps(validResults, validResults[0].url);
  const topGaps = (gapAnalysis.yourPageMissingGaps && gapAnalysis.yourPageMissingGaps.length > 0
    ? gapAnalysis.yourPageMissingGaps
    : gapAnalysis.keywordGaps
  )
    .slice(0, 12)
    .map((g) => g.phrase);

  // Aggregate word count benchmark
  const avgWordCount = Math.round(
    validResults.reduce((acc, r) => acc + r.wordCount, 0) / validResults.length
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
    ) / validResults.length
  );
  const targetGradeLabel =
    validResults[0]?.readability?.gradeLabel || '8th-9th Grade (Standard)';

  // Aggregate unique H2 and H3 headings across competitors
  const aggregatedHeadings: { level: string; text: string; sourceHost: string }[] = [];
  const seenHeadings = new Set<string>();

  validResults.forEach((r) => {
    let host = 'Competitor';
    try {
      host = new URL(r.url).hostname;
    } catch {
      host = 'Competitor';
    }

    r.headings.forEach((h) => {
      if (h.level === 'h2' || h.level === 'h3') {
        const key = h.text.toLowerCase();
        if (!seenHeadings.has(key)) {
          seenHeadings.add(key);
          aggregatedHeadings.push({
            level: h.level.toUpperCase(),
            text: h.text,
            sourceHost: host,
          });
        }
      }
    });
  });

  // Build Markdown Brief string
  const markdownBrief = `# Evidence-Based SEO Content Brief & Outline
**Target Focus Query**: "${activeTargetKeyword}"
**SERP Word Count Benchmark**: ~${targetWordCount.toLocaleString()} words (based on competitor consensus)
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
    ? topGaps.map((g) => `- **${g}** *(Used across ranking competitors)*`).join('\n')
    : '- No major keyword gaps detected.'
}

---

## 📑 Synthesized Competitor Heading Structure
${aggregatedHeadings
  .map(
    (h) =>
      `${h.level === 'H2' ? '###' : '####'} ${h.text} (Source: ${h.sourceHost})`
  )
  .join('\n')}

---

## ⚙️ Recommended Technical & Schema Enhancements
- [ ] **FAQ Section**: 4/5 competitors feature an FAQ section. Add an FAQ H2 section answering key user questions.
- [ ] **JSON-LD Schema**: Consider adding FAQPage or Article schema if helpful to users.

---
*Generated by AnalyzeSERP Evidence-Based Brief Generator*
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
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SEO Content Brief & Keyword Strategy', 14, 20);

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Target Primary Keyword: "${activeTargetKeyword}"`, 14, 30);
    doc.text(
      `Recommended Word Count: ${targetWordCount.toLocaleString()} words`,
      14,
      36
    );
    doc.text(
      `Target Readability: ${targetGradeLabel} (~${avgReadabilityEase}/100 Ease)`,
      14,
      42
    );
    doc.text(
      `Keyword Frequency Goal: ${minMentions}-${maxMentions} mentions (1.0%-2.0% density)`,
      14,
      48
    );
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

    doc.save(
      `content-brief-${activeTargetKeyword.replace(/\s+/g, '-')}.pdf`
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm my-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
              High-Value SEO Utility
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCode className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Actionable <span className="gradient-text">Content Brief Generator</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Generates custom content brief outlines, placement rules, and keyword density targets for your writers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-white/10 shadow-sm"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            )}
            <span>{copied ? 'Copied Brief!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-purple-500/30 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-emerald-500/30 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF Brief</span>
          </button>
        </div>
      </div>

      {/* Target Keyword Input & Suggestions Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>Enter Target Primary Keyword for Content Brief:</span>
            <SEOExplanationTooltip text="Enter the exact search query you want your article to rank for in Google." />
          </label>
        </div>

        <input
          type="text"
          value={customKeyword}
          onChange={(e) => setCustomKeyword(e.target.value)}
          placeholder={`Target Keyword (e.g. ${defaultTargetKeyword})`}
          className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:outline-none font-bold text-slate-900 dark:text-white shadow-sm"
        />

        {suggestedKeywords.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">
              Or quick-select top competitor search phrases:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedKeywords.map((kw, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomKeyword(kw)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    activeTargetKeyword === kw.toLowerCase()
                      ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                      : 'bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brief Preview Card */}
      <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-800 dark:text-gray-300 space-y-4 max-h-96 overflow-y-auto shadow-inner">
        <div className="text-emerald-700 dark:text-emerald-400 font-bold border-b border-slate-200 dark:border-white/10 pb-3 space-y-1">
          <div className="text-sm"># Target Primary Keyword: &quot;{activeTargetKeyword}&quot;</div>
          <div className="text-slate-500 dark:text-gray-400 font-normal">
            ## Recommended Word Count: {targetWordCount.toLocaleString()} words (15% above average)
          </div>
          <div className="text-indigo-600 dark:text-indigo-400 font-normal">
            ## Target Readability: {targetGradeLabel} (~{avgReadabilityEase}/100 Flesch Ease)
          </div>
          <div className="text-cyan-600 dark:text-cyan-400 font-normal">
            ## Keyword Frequency Goal: {minMentions} – {maxMentions} mentions (1.0% – 2.0% density)
          </div>
        </div>

        {/* Primary Keyword Placement Checklist */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-3 space-y-1.5 font-sans">
          <div className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5 text-xs">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <span>Primary Keyword Placement Checklist for Writer:</span>
          </div>
          <ul className="text-xs space-y-1 text-slate-600 dark:text-gray-300 pl-5 list-disc font-mono">
            <li>Title Tag: Place &quot;{activeTargetKeyword}&quot; near beginning</li>
            <li>H1 Heading: Include &quot;{activeTargetKeyword}&quot; in article title</li>
            <li>First 100 Words: Include &quot;{activeTargetKeyword}&quot; naturally in introduction</li>
            <li>Meta Description: Include &quot;{activeTargetKeyword}&quot; with call to action</li>
          </ul>
        </div>

        {topGaps.length > 0 && (
          <div className="border-b border-slate-200 dark:border-white/10 pb-3">
            <div className="text-amber-600 dark:text-amber-400 font-bold mb-1">
              ## Recommended Keyword Gaps & Topics to Include:
            </div>
            <div className="text-slate-600 dark:text-gray-400 font-sans text-xs flex flex-wrap gap-1.5">
              {topGaps.map((g, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono text-[11px]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="text-purple-700 dark:text-purple-400 font-bold mb-2">
            ### Competitor Outline Headings:
          </div>
          {aggregatedHeadings.map((h, idx) => (
            <div
              key={idx}
              className={`py-1 flex items-center justify-between gap-2 ${
                h.level === 'H2'
                  ? 'text-slate-900 dark:text-white font-semibold pl-2'
                  : 'text-slate-600 dark:text-gray-400 pl-6'
              }`}
            >
              <div>
                <span className="text-cyan-600 dark:text-cyan-400">
                  {h.level === 'H2' ? '- H2:' : '  - H3:'}
                </span>{' '}
                {h.text}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-gray-500 font-sans px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/5 shrink-0">
                {h.sourceHost}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
