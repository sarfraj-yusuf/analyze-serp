'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SerpAlignmentReport, SinglePageAudit } from '@/types/seo';
import { analyzeKeywordGaps } from '@/lib/keyword-gap';
import {
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Layers,
  Target,
  Code,
  Check,
} from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ExportDropdownProps {
  report: SerpAlignmentReport;
  validResults?: SinglePageAudit[];
  targetUrl?: string;
  onOpenPdfModal: () => void;
}

function escapeCsv(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

function downloadBlob(content: string, filename: string, mimeType: string, isCsv = false) {
  const finalContent = isCsv ? `\uFEFF${content}` : content;
  const blob = new Blob([finalContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getSanitizedHost(url?: string): string {
  if (!url) return 'audit';
  try {
    return new URL(url).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
  } catch {
    return 'audit';
  }
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  report,
  validResults = [],
  targetUrl,
  onOpenPdfModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const effectiveTargetUrl = targetUrl || report.targetUrl || (validResults[0]?.url ?? '');
  const host = getSanitizedHost(effectiveTargetUrl);
  const dateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
  };

  const toggleOpen = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen]);

  const triggerSuccess = (label: string) => {
    setDownloadSuccess(label);
    setTimeout(() => {
      setDownloadSuccess(null);
      setIsOpen(false);
    }, 1200);
  };

  // 1. Export Action Roadmap CSV
  const handleExportActionCsv = () => {
    const actions = report.evidenceActions || [];
    const headers = [
      'ID',
      'Priority Quadrant',
      'Category',
      'Task Title',
      'Recommended Action',
      'Effort Level',
      'Estimated Impact',
      'Business Impact / Why It Matters',
      'SERP Empirical Evidence Proof',
    ];

    const rows = actions.map((a, idx) => [
      escapeCsv(a.id || `task-${idx + 1}`),
      escapeCsv(a.quadrant),
      escapeCsv(a.category),
      escapeCsv(a.title),
      escapeCsv(a.action),
      escapeCsv(a.effort),
      escapeCsv(a.impact),
      escapeCsv(a.businessImpact || ''),
      escapeCsv(a.evidence),
    ]);

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadBlob(csvContent, `${host}_action_roadmap_${dateStr}.csv`, 'text/csv;charset=utf-8;', true);
    triggerSuccess('Actions CSV');
  };

  // 2. Export SERP Consensus Blueprint CSV
  const handleExportBlueprintCsv = () => {
    const patterns = report.serpConsensusPatterns || [];
    const headers = [
      'Pattern / Module Name',
      'Category',
      'SERP Frequency Ratio',
      'Adoption Percentage',
      'Target Page Status',
      'Description / Consensus Standard',
    ];

    const rows = patterns.map((p) => [
      escapeCsv(p.title),
      escapeCsv(p.patternType),
      escapeCsv(p.frequencyRatio),
      escapeCsv(`${p.frequencyPercent}%`),
      escapeCsv(p.isPresentOnTarget ? 'Present in Target' : 'Missing Gap in Target'),
      escapeCsv(p.description),
    ]);

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadBlob(csvContent, `${host}_serp_consensus_${dateStr}.csv`, 'text/csv;charset=utf-8;', true);
    triggerSuccess('SERP Blueprint CSV');
  };

  // 3. Export Competitor Keyword Gaps CSV
  const handleExportKeywordGapsCsv = () => {
    if (validResults.length < 2) return;
    const gapAnalysis = analyzeKeywordGaps(validResults, effectiveTargetUrl);
    const missingGaps = gapAnalysis.yourPageMissingGaps || [];
    const commonCore = gapAnalysis.commonCoreKeywords || [];
    const allGaps = gapAnalysis.allItems || [];

    const headers = [
      'Keyword Phrase',
      'N-Gram Classification',
      'Status in Target Page',
      'Target Page Density',
      'Target Page Count',
      'Max Competitor Density',
      'Top Competitor Source',
    ];

    const rows = allGaps.map((item) => {
      let status = 'Covered';
      if (missingGaps.some((g) => g.phrase === item.phrase)) {
        status = 'Missing Gap (0 occurrences)';
      } else if (commonCore.some((c) => c.phrase === item.phrase)) {
        status = 'Common Core Keyword';
      }

      return [
        escapeCsv(item.phrase),
        escapeCsv(item.nGramType),
        escapeCsv(status),
        escapeCsv(`${((item.targetPageDensity || 0) * 100).toFixed(2)}%`),
        escapeCsv(item.targetPageCount || 0),
        escapeCsv(`${((item.maxDensity || 0) * 100).toFixed(2)}%`),
        escapeCsv(item.topCompetitorUrl || ''),
      ];
    });

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadBlob(csvContent, `${host}_keyword_gaps_${dateStr}.csv`, 'text/csv;charset=utf-8;', true);
    triggerSuccess('Keywords CSV');
  };

  // 4. Export Markdown Project Brief
  const handleExportMarkdownBrief = () => {
    const doFirst = (report.evidenceActions || []).filter((a) => a.quadrant === 'DO_FIRST');
    const planThis = (report.evidenceActions || []).filter((a) => a.quadrant === 'PLAN_THIS');
    const doNext = (report.evidenceActions || []).filter((a) => a.quadrant === 'DO_NEXT');
    const strengths = report.dontTouchStrengths || [];

    let md = `# 🎯 SERP Competitive Audit & Action Brief\n`;
    md += `**Target URL**: ${effectiveTargetUrl}\n`;
    md += `**SERP Parity Score**: ${report.alignmentScore}% (${report.verdictHeadline})\n`;
    md += `**Benchmarked Competitors**: ${validResults.length > 1 ? validResults.length - 1 : 0} ranking pages\n`;
    md += `**Audit Date**: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n`;

    md += `## Executive Verdict\n> ${report.verdictSubtext}\n\n`;

    md += `## 🚀 Prioritized Implementation Roadmap\n\n`;

    if (doFirst.length > 0) {
      md += `### 🔴 Chapter 2.1: DO FIRST (High Impact Quick Wins)\n`;
      doFirst.forEach((a) => {
        md += `- [ ] **${a.title}** (${a.category} · Effort: ${a.effort})\n`;
        md += `  - **Action**: ${a.action}\n`;
        if (a.businessImpact) md += `  - **Why it matters**: ${a.businessImpact}\n`;
        md += `  - **SERP Evidence**: ${a.evidence}\n\n`;
      });
    }

    if (planThis.length > 0) {
      md += `### 🟡 Chapter 2.2: PLAN THIS (Strategic Milestones)\n`;
      planThis.forEach((a) => {
        md += `- [ ] **${a.title}** (${a.category} · Effort: ${a.effort})\n`;
        md += `  - **Action**: ${a.action}\n`;
        if (a.businessImpact) md += `  - **Why it matters**: ${a.businessImpact}\n`;
        md += `  - **SERP Evidence**: ${a.evidence}\n\n`;
      });
    }

    if (doNext.length > 0) {
      md += `### 🟢 Chapter 2.3: DO NEXT (Operational Improvements)\n`;
      doNext.forEach((a) => {
        md += `- [ ] **${a.title}** (${a.category} · Effort: ${a.effort})\n`;
        md += `  - **Action**: ${a.action}\n`;
        if (a.businessImpact) md += `  - **Why it matters**: ${a.businessImpact}\n`;
        md += `  - **SERP Evidence**: ${a.evidence}\n\n`;
      });
    }

    if (strengths.length > 0) {
      md += `## 🛡️ Competitive Safeguards (Do Not Change These)\n`;
      strengths.forEach((s) => {
        md += `- **${s.title}**: ${s.reason}\n`;
      });
      md += `\n`;
    }

    md += `---\n*Generated by AnalyzeSERP (Evidence-Based SERP Intelligence)*\n`;
    downloadBlob(md, `${host}_audit_brief_${dateStr}.md`, 'text/markdown;charset=utf-8;');
    triggerSuccess('Markdown Brief');
  };

  // 5. Export Complete Raw Audit JSON
  const handleExportRawJson = () => {
    const payload = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: '2.0',
        targetUrl: effectiveTargetUrl,
        generator: 'AnalyzeSERP Competitor Audit Hub',
      },
      alignmentReport: report,
      competitorAudits: validResults,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    downloadBlob(jsonStr, `${host}_serp_audit_data_${dateStr}.json`, 'application/json;charset=utf-8;');
    triggerSuccess('Raw JSON');
  };

  return (
    <>
      {/* Trigger Button */}
      <Tooltip content="Export Reports" side="top">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer shrink-0"
        >
          <Download className="size-3" />
          <span>Export</span>
          <ChevronDown className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </Tooltip>

      {/* Floating Dropdown Hub Rendered via React Portal */}
      {mounted && isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            right: `${coords.right}px`,
            maxHeight: `calc(100vh - ${coords.top + 16}px)`,
            zIndex: 99999,
          }}
          className="w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-2.5 space-y-2.5 overflow-y-auto modal-scroll animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-2.5 pt-1 pb-2 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Audit Export Hub
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Download Reports &amp; Datasets
              </div>
            </div>
            {downloadSuccess && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1 animate-in fade-in">
                <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>Downloaded!</span>
              </span>
            )}
          </div>

          {/* Section 1: Presentation Reports */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Presentation &amp; Briefs
            </div>

            {/* Executive PDF Report */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenPdfModal();
              }}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Executive PDF Report
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    PDF
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                  Branded report with score gauge, graphs &amp; white-label agency setup.
                </p>
              </div>
            </button>

            {/* Markdown Project Brief */}
            <button
              type="button"
              onClick={handleExportMarkdownBrief}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Markdown Project Brief
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                    MD
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                  Formatted checklist document ready for Notion, Jira, GitHub &amp; Slack.
                </p>
              </div>
            </button>
          </div>

          {/* Section 2: Spreadsheets & Tabular Data (CSV / Excel) */}
          <div className="space-y-1 pt-1 border-t border-slate-200/80 dark:border-slate-800">
            <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Spreadsheets (Excel / Sheets Compatible)
            </div>

            {/* Action Roadmap Tasks CSV */}
            <button
              type="button"
              onClick={handleExportActionCsv}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <FileSpreadsheet className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Action Roadmap Tasks
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    CSV
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                  DO FIRST / PLAN THIS tasks with priority, effort, &amp; business impact.
                </p>
              </div>
            </button>

            {/* SERP Consensus Blueprint CSV */}
            <button
              type="button"
              onClick={handleExportBlueprintCsv}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                <Layers className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    SERP Consensus Blueprint
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                    CSV
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                  Page 1 competitor pattern adoption ratios, frequencies &amp; target gaps.
                </p>
              </div>
            </button>

            {/* Competitor Keyword Gaps CSV */}
            {validResults.length >= 2 && (
              <button
                type="button"
                onClick={handleExportKeywordGapsCsv}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <Target className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Competitor Keyword Gaps
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                      CSV
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                    Missing N-gram keyword phrases, competitor density, &amp; common core.
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Section 3: Developer & Raw Technical Data */}
          <div className="space-y-1 pt-1 border-t border-slate-200/80 dark:border-slate-800">
            <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Developer &amp; Raw Data
            </div>

            <button
              type="button"
              onClick={handleExportRawJson}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5">
                <Code className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Complete Audit Payload
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    JSON
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                  Full machine-readable JSON dump of all DOM metrics &amp; audits.
                </p>
              </div>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
