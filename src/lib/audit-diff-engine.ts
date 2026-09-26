/**
 * Pure Diff & Delta Calculation Engine for SEO Audits
 * Inspired by Sitebulb hints, Screaming Frog crawl compare, and accessibility-diff
 * Reference: interface-design & accessibility-diff skills
 */

import { SinglePageAudit } from '@/types/seo';

export type DiffIssueStatus = 'FIXED' | 'REGRESSED' | 'UNCHANGED' | 'MAINTAINED';

export interface DiffIssueItem {
  id: string;
  category: 'META' | 'SCHEMA' | 'CONTENT' | 'STRUCTURE' | 'MEDIA' | 'TECHNICAL';
  title: string;
  status: DiffIssueStatus;
  beforeDetail: string;
  afterDetail: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
}

export interface FieldDiffItem {
  field: string;
  label: string;
  beforeValue: string | number;
  afterValue: string | number;
  deltaValue?: string | number;
  isPositiveChange?: boolean;
  isNegativeChange?: boolean;
  isUnchanged?: boolean;
  unit?: string;
}

export interface AuditDiffReport {
  targetUrl: string;
  targetKeyword?: string;
  baselineDate: number;
  currentDate: number;
  baselineScore: number;
  currentScore: number;
  scoreDelta: number;
  status: 'IMPROVED' | 'REGRESSED' | 'UNCHANGED';
  fixedIssues: DiffIssueItem[];
  regressedIssues: DiffIssueItem[];
  unchangedIssues: DiffIssueItem[];
  maintainedStrengths: DiffIssueItem[];
  fieldDiffs: FieldDiffItem[];
  summary: {
    fixedCount: number;
    regressedCount: number;
    unchangedCount: number;
    wordCountDelta: number;
    wordCountPercent: number;
    readabilityDelta: number;
  };
  markdownReport: string;
}

/**
 * Calculates deterministic 0-100 on-page SEO score for a single page audit
 */
export function calculateAuditScore(audit: SinglePageAudit): number {
  if (!audit || audit.status === 'error') return 0;
  let score = 0;
  const { meta, wordCount, headings, imageAudit, readability } = audit;

  // Title (15 pts)
  if (meta.titleLength > 0 && !meta.titleTruncated && meta.titleLength <= 60) {
    score += 15;
  } else if (meta.titleLength > 0) {
    score += 8;
  }

  // Meta Description (15 pts)
  if (meta.descriptionLength >= 120 && meta.descriptionLength <= 160 && !meta.descriptionTruncated) {
    score += 15;
  } else if (meta.descriptionLength > 0) {
    score += 8;
  }

  // Headings (20 pts)
  const h1Count = (headings || []).filter((h) => h.level === 'h1').length;
  const h2Count = (headings || []).filter((h) => h.level === 'h2').length;
  if (h1Count === 1 && h2Count > 0) {
    score += 20;
  } else if (h1Count === 1) {
    score += 15;
  } else if (h1Count > 1) {
    score += 10;
  }

  // Images (15 pts)
  if (imageAudit.totalImages === 0 || imageAudit.missingAltCount === 0) {
    score += 15;
  } else {
    const altRatio = (imageAudit.totalImages - imageAudit.missingAltCount) / (imageAudit.totalImages || 1);
    score += Math.round(altRatio * 15);
  }

  // Word Count (15 pts)
  if (wordCount >= 800) {
    score += 15;
  } else if (wordCount >= 400) {
    score += 10;
  } else if (wordCount >= 200) {
    score += 5;
  }

  // Schema (10 pts)
  if (meta.hasJsonLdSchema) {
    score += 10;
  }

  // Readability (10 pts)
  const ease = readability?.fleschReadingEase || 60;
  if (ease >= 60) {
    score += 10;
  } else if (ease >= 45) {
    score += 6;
  } else {
    score += 3;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Compares two audits (Baseline vs Current) and produces an actionable delta report
 */
export function compareAudits(
  baseline: SinglePageAudit,
  current: SinglePageAudit,
  targetKeyword?: string,
  baselineTimestamp?: number
): AuditDiffReport {
  const baselineScore = calculateAuditScore(baseline);
  const currentScore = calculateAuditScore(current);
  const scoreDelta = currentScore - baselineScore;

  let overallStatus: 'IMPROVED' | 'REGRESSED' | 'UNCHANGED' = 'UNCHANGED';
  if (scoreDelta > 0) overallStatus = 'IMPROVED';
  else if (scoreDelta < 0) overallStatus = 'REGRESSED';

  const fixedIssues: DiffIssueItem[] = [];
  const regressedIssues: DiffIssueItem[] = [];
  const unchangedIssues: DiffIssueItem[] = [];
  const maintainedStrengths: DiffIssueItem[] = [];

  // Helper evaluator
  const evaluateRule = (
    id: string,
    category: DiffIssueItem['category'],
    title: string,
    impact: DiffIssueItem['impact'],
    wasFailing: boolean,
    isFailing: boolean,
    beforeDetail: string,
    afterDetail: string,
    explanation: string
  ) => {
    if (wasFailing && !isFailing) {
      fixedIssues.push({
        id,
        category,
        title,
        status: 'FIXED',
        beforeDetail,
        afterDetail,
        impact,
        explanation,
      });
    } else if (!wasFailing && isFailing) {
      regressedIssues.push({
        id,
        category,
        title,
        status: 'REGRESSED',
        beforeDetail,
        afterDetail,
        impact,
        explanation,
      });
    } else if (wasFailing && isFailing) {
      unchangedIssues.push({
        id,
        category,
        title,
        status: 'UNCHANGED',
        beforeDetail,
        afterDetail,
        impact,
        explanation,
      });
    } else {
      maintainedStrengths.push({
        id,
        category,
        title,
        status: 'MAINTAINED',
        beforeDetail,
        afterDetail,
        impact,
        explanation,
      });
    }
  };

  // 1. Title Tag Length Check
  const bTitleLen = baseline.meta.titleLength;
  const cTitleLen = current.meta.titleLength;
  const bTitleFail = bTitleLen === 0 || baseline.meta.titleTruncated || bTitleLen > 60;
  const cTitleFail = cTitleLen === 0 || current.meta.titleTruncated || cTitleLen > 60;
  evaluateRule(
    'title-tag-length',
    'META',
    'Title Tag Optimization (30–60 characters)',
    'HIGH',
    bTitleFail,
    cTitleFail,
    bTitleLen === 0 ? 'Missing Title' : `${bTitleLen} chars (${baseline.meta.titleTruncated ? 'Truncated' : 'Too Long'})`,
    cTitleLen === 0 ? 'Missing Title' : `${cTitleLen} chars (${current.meta.titleTruncated ? 'Truncated' : 'Optimal'})`,
    'Google search results truncate titles exceeding 60 characters or ~600px, reducing search CTR.'
  );

  // 2. Meta Description Length Check
  const bDescLen = baseline.meta.descriptionLength;
  const cDescLen = current.meta.descriptionLength;
  const bDescFail = bDescLen === 0 || baseline.meta.descriptionTruncated || bDescLen > 160;
  const cDescFail = cDescLen === 0 || current.meta.descriptionTruncated || cDescLen > 160;
  evaluateRule(
    'meta-description-length',
    'META',
    'Meta Description Snippet (120–160 characters)',
    'MEDIUM',
    bDescFail,
    cDescFail,
    bDescLen === 0 ? 'Missing Description' : `${bDescLen} chars (${baseline.meta.descriptionTruncated ? 'Truncated' : 'Length'})`,
    cDescLen === 0 ? 'Missing Description' : `${cDescLen} chars (${current.meta.descriptionTruncated ? 'Truncated' : 'Optimal'})`,
    'High-relevance meta descriptions under 160 characters generate higher click-through rates.'
  );

  // 3. JSON-LD Structured Data Schema Check
  const bSchemaFail = !baseline.meta.hasJsonLdSchema;
  const cSchemaFail = !current.meta.hasJsonLdSchema;
  evaluateRule(
    'jsonld-schema-markup',
    'SCHEMA',
    'Schema.org JSON-LD Structured Data',
    'HIGH',
    bSchemaFail,
    cSchemaFail,
    baseline.meta.hasJsonLdSchema ? 'Schema Detected' : 'Missing Schema',
    current.meta.hasJsonLdSchema ? 'Schema Detected' : 'Missing Schema',
    'JSON-LD Schema clarifies page entity types, author attribution, and rich result eligibility for search engines.'
  );

  // 4. Canonical URL Configuration
  const bCanonFail = !baseline.meta.canonicalUrl;
  const cCanonFail = !current.meta.canonicalUrl;
  evaluateRule(
    'canonical-url',
    'TECHNICAL',
    'Canonical URL Self-Reference',
    'MEDIUM',
    bCanonFail,
    cCanonFail,
    baseline.meta.canonicalUrl ? 'Configured' : 'Missing Canonical',
    current.meta.canonicalUrl ? 'Configured' : 'Missing Canonical',
    'Prevents duplicate content cannibalization across www/non-www and query param variations.'
  );

  // 5. H1 Main Heading Hierarchy
  const bH1Count = baseline.headings.filter((h) => h.level === 'h1').length;
  const cH1Count = current.headings.filter((h) => h.level === 'h1').length;
  const bH1Fail = bH1Count !== 1;
  const cH1Fail = cH1Count !== 1;
  evaluateRule(
    'h1-single-heading',
    'STRUCTURE',
    'Single H1 Document Heading',
    'HIGH',
    bH1Fail,
    cH1Fail,
    bH1Count === 0 ? 'No H1 Detected' : `${bH1Count} H1 tags detected`,
    cH1Count === 0 ? 'No H1 Detected' : `${cH1Count} H1 tag (Optimal)`,
    'Pages should have exactly one H1 defining the main topical entity for search crawlers.'
  );

  // 6. Image Accessibility (Alt Tags)
  const bMissingAlt = baseline.imageAudit.missingAltCount;
  const cMissingAlt = current.imageAudit.missingAltCount;
  const bAltFail = bMissingAlt > 0;
  const cAltFail = cMissingAlt > 0;
  evaluateRule(
    'image-alt-tags',
    'MEDIA',
    'Image Alt Text Attributes',
    'MEDIUM',
    bAltFail,
    cAltFail,
    bMissingAlt === 0 ? 'All Images Have Alt' : `${bMissingAlt} images missing alt text`,
    cMissingAlt === 0 ? 'All Images Have Alt' : `${cMissingAlt} images missing alt text`,
    'Alt attributes provide accessibility for screen readers and context for Google Image search.'
  );

  // 7. Word Count Volume
  const bWords = baseline.wordCount;
  const cWords = current.wordCount;
  const bWordFail = bWords < 350;
  const cWordFail = cWords < 350;
  evaluateRule(
    'content-volume',
    'CONTENT',
    'Substantive Content Volume (> 350 words)',
    'MEDIUM',
    bWordFail,
    cWordFail,
    `${bWords.toLocaleString()} words`,
    `${cWords.toLocaleString()} words`,
    'Thin content risks Panda algorithmic penalties; comprehensive answers rank higher.'
  );

  // 8. Readability Level
  const bEase = baseline.readability?.fleschReadingEase || 60;
  const cEase = current.readability?.fleschReadingEase || 60;
  const bReadFail = bEase < 50;
  const cReadFail = cEase < 50;
  evaluateRule(
    'readability-ease',
    'CONTENT',
    'Plain-English Readability (Flesch Ease >= 50)',
    'LOW',
    bReadFail,
    cReadFail,
    `Score: ${bEase}/100 (${baseline.readability?.gradeLabel || 'Standard'})`,
    `Score: ${cEase}/100 (${current.readability?.gradeLabel || 'Standard'})`,
    'Search engines and mobile users prefer content that is easy to skim and understand.'
  );

  // Field Diffs Breakdown
  const wordCountDelta = cWords - bWords;
  const wordCountPercent = bWords > 0 ? Math.round((wordCountDelta / bWords) * 100) : 0;
  const readabilityDelta = cEase - bEase;

  const fieldDiffs: FieldDiffItem[] = [
    {
      field: 'score',
      label: 'Overall SEO Score',
      beforeValue: baselineScore,
      afterValue: currentScore,
      deltaValue: scoreDelta >= 0 ? `+${scoreDelta}` : `${scoreDelta}`,
      isPositiveChange: scoreDelta > 0,
      isNegativeChange: scoreDelta < 0,
      isUnchanged: scoreDelta === 0,
      unit: '/100',
    },
    {
      field: 'title',
      label: 'Title Tag Characters',
      beforeValue: bTitleLen,
      afterValue: cTitleLen,
      deltaValue: cTitleLen - bTitleLen >= 0 ? `+${cTitleLen - bTitleLen}` : `${cTitleLen - bTitleLen}`,
      isPositiveChange: cTitleLen <= 60 && bTitleLen > 60,
      isNegativeChange: cTitleLen > 60 && bTitleLen <= 60,
      isUnchanged: bTitleLen === cTitleLen,
      unit: 'chars',
    },
    {
      field: 'meta_description',
      label: 'Meta Description Characters',
      beforeValue: bDescLen,
      afterValue: cDescLen,
      deltaValue: cDescLen - bDescLen >= 0 ? `+${cDescLen - bDescLen}` : `${cDescLen - bDescLen}`,
      isPositiveChange: cDescLen >= 120 && cDescLen <= 160 && (bDescLen < 120 || bDescLen > 160),
      isNegativeChange: (cDescLen < 120 || cDescLen > 160) && bDescLen >= 120 && bDescLen <= 160,
      isUnchanged: bDescLen === cDescLen,
      unit: 'chars',
    },
    {
      field: 'schema',
      label: 'JSON-LD Schema Markup',
      beforeValue: baseline.meta.hasJsonLdSchema ? 'Detected' : 'Missing',
      afterValue: current.meta.hasJsonLdSchema ? 'Detected' : 'Missing',
      isPositiveChange: !baseline.meta.hasJsonLdSchema && current.meta.hasJsonLdSchema,
      isNegativeChange: baseline.meta.hasJsonLdSchema && !current.meta.hasJsonLdSchema,
      isUnchanged: baseline.meta.hasJsonLdSchema === current.meta.hasJsonLdSchema,
    },
    {
      field: 'word_count',
      label: 'Word Count Volume',
      beforeValue: bWords.toLocaleString(),
      afterValue: cWords.toLocaleString(),
      deltaValue: wordCountDelta >= 0 ? `+${wordCountDelta.toLocaleString()}` : `${wordCountDelta.toLocaleString()}`,
      isPositiveChange: wordCountDelta > 0,
      isNegativeChange: wordCountDelta < 0,
      isUnchanged: wordCountDelta === 0,
      unit: 'words',
    },
    {
      field: 'readability',
      label: 'Flesch Reading Ease',
      beforeValue: `${bEase}/100`,
      afterValue: `${cEase}/100`,
      deltaValue: readabilityDelta >= 0 ? `+${readabilityDelta}` : `${readabilityDelta}`,
      isPositiveChange: readabilityDelta > 0,
      isNegativeChange: readabilityDelta < 0,
      isUnchanged: readabilityDelta === 0,
      unit: 'pts',
    },
    {
      field: 'missing_alts',
      label: 'Images Missing Alt Text',
      beforeValue: bMissingAlt,
      afterValue: cMissingAlt,
      deltaValue: cMissingAlt - bMissingAlt,
      isPositiveChange: cMissingAlt < bMissingAlt,
      isNegativeChange: cMissingAlt > bMissingAlt,
      isUnchanged: bMissingAlt === cMissingAlt,
      unit: 'images',
    },
    {
      field: 'total_headings',
      label: 'Total Heading Elements',
      beforeValue: baseline.headings.length,
      afterValue: current.headings.length,
      deltaValue: current.headings.length - baseline.headings.length >= 0 ? `+${current.headings.length - baseline.headings.length}` : `${current.headings.length - baseline.headings.length}`,
      isUnchanged: baseline.headings.length === current.headings.length,
      unit: 'headings',
    },
  ];

  // Markdown Summary
  const baselineDateStr = baselineTimestamp
    ? new Date(baselineTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Previous Baseline';
  const currentDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  let md = `# 📊 SEO Optimization Audit Progress Report (Before vs After)\n`;
  md += `**Target URL**: ${current.url}\n`;
  if (targetKeyword) md += `**Target Keyword**: "${targetKeyword}"\n`;
  md += `**Comparison Window**: ${baselineDateStr} ➔ ${currentDateStr}\n`;
  md += `**Overall Score Trajectory**: **${baselineScore}/100** ➔ **${currentScore}/100** (${scoreDelta >= 0 ? `+${scoreDelta}` : `${scoreDelta}`} points)\n\n`;

  md += `## 🎯 Executive Summary\n`;
  md += `- **Resolved Issues (Fixed)**: ${fixedIssues.length}\n`;
  md += `- **New Regressions**: ${regressedIssues.length}\n`;
  md += `- **Pre-existing Items**: ${unchangedIssues.length}\n`;
  md += `- **Word Count Movement**: ${wordCountDelta >= 0 ? `+${wordCountDelta.toLocaleString()} words (+${wordCountPercent}%)` : `${wordCountDelta.toLocaleString()} words (${wordCountPercent}%)`}\n\n`;

  if (fixedIssues.length > 0) {
    md += `### ✅ Resolved Optimizations (Fixed)\n`;
    fixedIssues.forEach((f) => {
      md += `- **${f.title}** (${f.category})\n`;
      md += `  - *Before*: ${f.beforeDetail}\n`;
      md += `  - *After*: ${f.afterDetail}\n`;
    });
    md += `\n`;
  }

  if (regressedIssues.length > 0) {
    md += `### ⚠️ Regressions to Address\n`;
    regressedIssues.forEach((r) => {
      md += `- **${r.title}** (${r.category})\n`;
      md += `  - *Before*: ${r.beforeDetail}\n`;
      md += `  - *After*: ${r.afterDetail}\n`;
    });
    md += `\n`;
  }

  md += `### 📋 Metric Comparison Ledger\n`;
  md += `| SEO Metric | Before (Baseline) | After (Current) | Delta |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  fieldDiffs.forEach((fd) => {
    md += `| ${fd.label} | ${fd.beforeValue} | ${fd.afterValue} | ${fd.deltaValue || '—'} |\n`;
  });

  md += `\n---\n*Generated by AnalyzeSERP Audit Progress Tracker*`;

  return {
    targetUrl: current.url,
    targetKeyword,
    baselineDate: baselineTimestamp || Date.now() - 86400000,
    currentDate: Date.now(),
    baselineScore,
    currentScore,
    scoreDelta,
    status: overallStatus,
    fixedIssues,
    regressedIssues,
    unchangedIssues,
    maintainedStrengths,
    fieldDiffs,
    summary: {
      fixedCount: fixedIssues.length,
      regressedCount: regressedIssues.length,
      unchangedCount: unchangedIssues.length,
      wordCountDelta,
      wordCountPercent,
      readabilityDelta,
    },
    markdownReport: md,
  };
}
