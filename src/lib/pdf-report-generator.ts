import type jsPDF from 'jspdf';
import { SinglePageAudit } from '@/types/seo';

export interface WhiteLabelOptions {
  agencyName: string;
  clientName: string;
  auditorEmail: string;
  primaryColorHex: string;
  tagline?: string;
}

// ── Design Constants ──────────────────────────────────────────────────
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 170mm
const HEADER_HEIGHT = 35;
const ACCENT_HEIGHT = 1.5;
const CONTENT_START_Y = 45; // 35mm header + 1.5mm accent + 8.5mm padding
const FOOTER_SAFE_Y = PAGE_HEIGHT - 28; // Safe cutoff above footer zone
const SECTION_GAP = 12; // Between major sections
const SUBSECTION_GAP = 8; // Between sub-sections within a section

// ── Typography Scale (consistent across all pages) ────────────────────
const FONT = {
  TITLE: 16,        // Page 1 client name
  SECTION: 11,      // Section headers (drawSectionHeader)
  CARD_VALUE: 12,   // Metric card big numbers
  BODY: 9.5,        // Body text, findings, meta rows
  LABEL: 8,         // Card labels, footer, small text
  SMALL: 7.5,       // Very small annotations
} as const;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Draw a smooth circular arc using line segments
function drawArc(
  doc: jsPDF, cx: number, cy: number, r: number,
  startAngleDeg: number, endAngleDeg: number,
  color: { r: number; g: number; b: number }, thickness: number
) {
  doc.setDrawColor(color.r, color.g, color.b);
  doc.setLineWidth(thickness);

  const steps = 48;
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;
  const angleStep = (endRad - startRad) / steps;

  for (let i = 0; i < steps; i++) {
    const a1 = startRad + i * angleStep;
    const a2 = startRad + (i + 1) * angleStep;
    doc.line(
      cx + r * Math.cos(a1), cy + r * Math.sin(a1),
      cx + r * Math.cos(a2), cy + r * Math.sin(a2)
    );
  }
}

export async function generateWhiteLabelPdfReport(
  audit: SinglePageAudit,
  options: WhiteLabelOptions
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const brandRgb = hexToRgb(options.primaryColorHex || '#059669');

  const COLORS = {
    navy:    { r: 15,  g: 23,  b: 42  },
    white:   { r: 255, g: 255, b: 255 },
    gray50:  { r: 249, g: 250, b: 251 },
    gray100: { r: 243, g: 244, b: 246 },
    gray200: { r: 229, g: 231, b: 235 },
    gray500: { r: 107, g: 114, b: 128 },
    gray800: { r: 31,  g: 41,  b: 55  },
    green:   { r: 16,  g: 185, b: 129 },
    red:     { r: 239, g: 68,  b: 68  },
    amber:   { r: 245, g: 158, b: 11  },
  };

  let totalPages = 1;

  // ── Reusable Primitives ─────────────────────────────────────────────

  const drawHeader = () => {
    // Dark navy header
    doc.setFillColor(COLORS.navy.r, COLORS.navy.g, COLORS.navy.b);
    doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT, 'F');
    // Brand accent line
    doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
    doc.rect(0, HEADER_HEIGHT, PAGE_WIDTH, ACCENT_HEIGHT, 'F');
    // Agency name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(options.agencyName, MARGIN, 16);
    // Tagline
    if (options.tagline) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(FONT.LABEL);
      doc.setTextColor(200, 200, 200);
      doc.text(options.tagline, MARGIN, 23);
    }
    // Date & email (right-aligned)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT.LABEL);
    doc.setTextColor(200, 200, 200);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, PAGE_WIDTH - MARGIN, 16, { align: 'right' });
    if (options.auditorEmail) {
      doc.text(options.auditorEmail, PAGE_WIDTH - MARGIN, 23, { align: 'right' });
    }
  };

  const drawFooter = (pageNum: number) => {
    doc.setDrawColor(COLORS.gray200.r, COLORS.gray200.g, COLORS.gray200.b);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_HEIGHT - 15, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT.SMALL);
    doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    doc.text(`Page ${pageNum} | Confidential Client Audit Report`, MARGIN, PAGE_HEIGHT - 9);
    doc.text(`${options.agencyName} | Powered by AnalyzeSERP`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 9, { align: 'right' });
  };

  const checkPageBreak = (currentY: number, requiredHeight: number): number => {
    if (currentY + requiredHeight > FOOTER_SAFE_Y) {
      drawFooter(totalPages);
      doc.addPage();
      totalPages++;
      drawHeader();
      return CONTENT_START_Y;
    }
    return currentY;
  };

  const drawSectionHeader = (title: string, y: number): number => {
    // Brand-colored left accent bar
    doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
    doc.rect(MARGIN, y - 4, 2.5, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT.SECTION);
    doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
    doc.text(title, MARGIN + 6, y + 1);
    return y + SUBSECTION_GAP + 2;
  };

  const drawStatusDot = (x: number, y: number, status: 'pass' | 'fail' | 'warn') => {
    const color = status === 'fail' ? COLORS.red : status === 'warn' ? COLORS.amber : COLORS.green;
    doc.setFillColor(color.r, color.g, color.b);
    doc.circle(x, y, 1.8, 'F');
  };

  /** Draws a consistent metric card with rounded border */
  const drawMetricCard = (
    x: number, y: number, width: number, height: number,
    label: string, value: string,
    highlightColor?: { r: number; g: number; b: number }
  ) => {
    doc.setFillColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    doc.setDrawColor(COLORS.gray200.r, COLORS.gray200.g, COLORS.gray200.b);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, width, height, 2, 2, 'FD');
    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT.CARD_VALUE);
    const valColor = highlightColor || COLORS.gray800;
    doc.setTextColor(valColor.r, valColor.g, valColor.b);
    doc.text(value, x + width / 2, y + height / 2, { align: 'center' });
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT.LABEL);
    doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    doc.text(label, x + width / 2, y + height - 3, { align: 'center' });
  };

  /** Renders a metadata row with label, value, optional fixed-position status dot, and detail */
  const drawMetaRow = (
    label: string, val: string, yRef: { y: number },
    status?: 'pass' | 'fail' | 'warn', details?: string
  ) => {
    yRef.y = checkPageBreak(yRef.y, 14);
    // Label (bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT.BODY);
    doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
    doc.text(label, MARGIN, yRef.y);
    // Status dot at fixed X position for vertical alignment
    if (status) {
      drawStatusDot(PAGE_WIDTH - MARGIN - 6, yRef.y - 1, status);
    }
    // Detail text (right-aligned, before the dot)
    if (details) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(FONT.LABEL);
      doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
      doc.text(details, PAGE_WIDTH - MARGIN - (status ? 12 : 0), yRef.y, { align: 'right' });
    }
    // Value text (wrapped)
    yRef.y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT.BODY);
    doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    const lines: string[] = doc.splitTextToSize(val || 'N/A', CONTENT_WIDTH - 10);
    doc.text(lines, MARGIN, yRef.y);
    yRef.y += lines.length * 4.5 + 4;
  };

  // ── Score Calculation (Transparent Additive Formula) ────────────────

  let contentScore = 0;
  // Title Tag (15 pts)
  if (audit.meta.titleLength > 0 && !audit.meta.titleTruncated) contentScore += 15;
  else if (audit.meta.titleLength > 0) contentScore += 8;
  // Meta Description (15 pts)
  if (audit.meta.descriptionLength > 0 && !audit.meta.descriptionTruncated) contentScore += 15;
  else if (audit.meta.descriptionLength > 0) contentScore += 8;
  // H1 Structure (20 pts)
  const h1Count = audit.headings.filter((h) => h.level === 'h1').length;
  if (h1Count === 1) contentScore += 20;
  else if (h1Count > 0) contentScore += 10;
  // Word Volume (20 pts)
  if (audit.wordCount >= 1000) contentScore += 20;
  else if (audit.wordCount >= 500) contentScore += 12;
  // Image Alt Compliance (15 pts)
  if (audit.imageAudit.totalImages === 0 || audit.imageAudit.missingAltCount === 0) contentScore += 15;
  else contentScore += Math.max(0, 15 - audit.imageAudit.missingAltCount * 3);
  // Keyword Health (15 pts)
  if (audit.keywords.oneGram.filter((k) => k.isStuffing).length === 0) contentScore += 15;
  else contentScore += 5;

  const techScore = audit.technicalAudit?.technicalScore ?? 70;
  const overallScore = Math.round(contentScore * 0.6 + techScore * 0.4);
  const gradeLabel = overallScore >= 85 ? 'A+' : overallScore >= 75 ? 'A' : overallScore >= 65 ? 'B' : overallScore >= 50 ? 'C' : 'D';
  const gradeDesc = overallScore >= 85 ? 'EXCELLENT' : overallScore >= 65 ? 'GOOD' : 'NEEDS WORK';

  // ══════════════════════════════════════════════════════════════════
  // PAGE 1: Cover & Executive Scorecard
  // ══════════════════════════════════════════════════════════════════
  drawHeader();
  let yPos = CONTENT_START_Y;

  // Client Details Card
  doc.setFillColor(COLORS.gray50.r, COLORS.gray50.g, COLORS.gray50.b);
  doc.setDrawColor(COLORS.gray200.r, COLORS.gray200.g, COLORS.gray200.b);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
  doc.text(`SEO Audit for: ${options.clientName}`, MARGIN + 5, yPos + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONT.BODY);
  doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
  const truncUrl = audit.url.length > 75 ? audit.url.substring(0, 72) + '...' : audit.url;
  doc.text(truncUrl, MARGIN + 5, yPos + 16);

  yPos += 30;

  // ── Score Gauge (Standard 270° arc: 135° → 405°) ──
  yPos = drawSectionHeader('Executive Scorecard', yPos);

  const gaugeCx = MARGIN + CONTENT_WIDTH / 2;
  const gaugeCy = yPos + 30;
  const gaugeRadius = 22;

  // Track (gray, 270° sweep)
  drawArc(doc, gaugeCx, gaugeCy, gaugeRadius, 135, 405, COLORS.gray200, 5);
  // Filled arc (score proportion of 270°)
  const scoreSpan = (overallScore / 100) * 270;
  const scoreColor = overallScore >= 85 ? COLORS.green : overallScore >= 65 ? COLORS.amber : COLORS.red;
  drawArc(doc, gaugeCx, gaugeCy, gaugeRadius, 135, 135 + scoreSpan, scoreColor, 5);

  // Center score text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
  doc.text(`${overallScore}`, gaugeCx, gaugeCy + 2, { align: 'center' });
  doc.setFontSize(FONT.BODY);
  doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
  doc.text('/ 100', gaugeCx, gaugeCy + 8, { align: 'center' });

  // Grade badge (right of gauge)
  doc.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b);
  doc.roundedRect(gaugeCx + 30, gaugeCy - 12, 12, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(FONT.SECTION);
  doc.setTextColor(255, 255, 255);
  doc.text(gradeLabel, gaugeCx + 36, gaugeCy - 5, { align: 'center' });
  // Grade description below badge
  doc.setFontSize(FONT.SMALL);
  doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
  doc.text(gradeDesc, gaugeCx + 36, gaugeCy + 2, { align: 'center' });

  yPos += 66; // gaugeRadius*2 + labels + padding

  // ── 6 Metric Cards (3×2 grid, consistent width) ──
  const cardW = (CONTENT_WIDTH - 10) / 3;
  const cardH = 20;
  drawMetricCard(MARGIN, yPos, cardW, cardH, 'Word Volume', `${audit.wordCount.toLocaleString()}`);
  drawMetricCard(MARGIN + cardW + 5, yPos, cardW, cardH, 'Read Time', `${audit.readingTimeMinutes} min`);
  drawMetricCard(MARGIN + (cardW + 5) * 2, yPos, cardW, cardH, 'Total Images', `${audit.imageAudit.totalImages}`);

  yPos += cardH + 5;
  drawMetricCard(MARGIN, yPos, cardW, cardH, 'Headings', `${audit.headings.length} (H1: ${h1Count})`);
  drawMetricCard(MARGIN + cardW + 5, yPos, cardW, cardH, 'Total Links', `${audit.linkAudit?.totalLinks ?? 'N/A'}`);
  drawMetricCard(MARGIN + (cardW + 5) * 2, yPos, cardW, cardH, 'Tech Score', `${techScore}/100`, techScore >= 80 ? COLORS.green : techScore >= 60 ? COLORS.amber : COLORS.red);

  yPos += cardH + SECTION_GAP;

  // ── Executive Key Findings ──
  yPos = drawSectionHeader('Executive Key Findings', yPos);

  const findings: Array<{ text: string; status: 'pass' | 'fail' | 'warn' }> = [];
  // Content depth
  if (audit.wordCount >= 1000) findings.push({ text: `Content depth is strong (${audit.wordCount.toLocaleString()} words).`, status: 'pass' });
  else if (audit.wordCount >= 500) findings.push({ text: `Content volume is adequate (${audit.wordCount} words) but could be expanded.`, status: 'warn' });
  else findings.push({ text: `Low content volume (${audit.wordCount} words). Consider expanding for better indexing.`, status: 'fail' });
  // Title tag
  if (audit.meta.titleTruncated) findings.push({ text: `Title tag truncated at ${audit.meta.titleLength} chars. Trim to 50-60 chars.`, status: 'fail' });
  else if (audit.meta.titleLength > 0) findings.push({ text: 'Title tag length is optimal for SERP display.', status: 'pass' });
  else findings.push({ text: 'Missing title tag. Critical for search rankings.', status: 'fail' });
  // Images
  if (audit.imageAudit.missingAltCount > 0) findings.push({ text: `${audit.imageAudit.missingAltCount} image(s) missing ALT text attributes.`, status: 'fail' });
  else findings.push({ text: 'All images include descriptive ALT text.', status: 'pass' });
  // Canonical
  if (!audit.meta.canonicalUrl) findings.push({ text: 'No canonical URL declared. Risk of duplicate content.', status: 'warn' });
  else findings.push({ text: 'Canonical URL is properly declared.', status: 'pass' });
  // HTTPS
  if (!audit.technicalAudit?.hasHttps) findings.push({ text: 'Page is NOT served over HTTPS. Security risk.', status: 'fail' });
  else findings.push({ text: 'Page is served securely over HTTPS.', status: 'pass' });
  // H1
  if (h1Count !== 1) findings.push({ text: `Found ${h1Count} H1 tags. Best practice is exactly 1 H1.`, status: h1Count === 0 ? 'fail' : 'warn' });
  else findings.push({ text: 'Single H1 heading tag detected. Clean hierarchy.', status: 'pass' });

  findings.forEach((f) => {
    yPos = checkPageBreak(yPos, 8);
    drawStatusDot(MARGIN + 2, yPos - 0.5, f.status);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT.BODY);
    doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
    const findingLines: string[] = doc.splitTextToSize(f.text, CONTENT_WIDTH - 12);
    doc.text(findingLines[0], MARGIN + 8, yPos);
    yPos += 7;
  });

  // ══════════════════════════════════════════════════════════════════
  // PAGE 2: On-Page Metadata & Social Preview
  // ══════════════════════════════════════════════════════════════════
  drawFooter(totalPages);
  doc.addPage();
  totalPages++;
  drawHeader();
  yPos = CONTENT_START_Y;

  const metaRef = { y: yPos };

  metaRef.y = drawSectionHeader('On-Page Metadata', metaRef.y);

  const tStatus: 'pass' | 'warn' = audit.meta.titleLength >= 40 && audit.meta.titleLength <= 60 ? 'pass' : 'warn';
  drawMetaRow('Title Tag', audit.meta.title || '(Missing)', metaRef, tStatus, `${audit.meta.titleLength} chars`);

  const dStatus: 'pass' | 'warn' = audit.meta.descriptionLength >= 120 && audit.meta.descriptionLength <= 155 ? 'pass' : 'warn';
  drawMetaRow('Meta Description', audit.meta.description || '(Missing)', metaRef, dStatus, `${audit.meta.descriptionLength} chars`);

  drawMetaRow('Canonical URL', audit.meta.canonicalUrl || 'Not Set', metaRef, audit.meta.canonicalUrl ? 'pass' : 'warn');
  drawMetaRow('Robots Directive', audit.meta.robotsDirective || 'Default (index, follow)', metaRef, 'pass');
  drawMetaRow('JSON-LD Schema', audit.meta.hasJsonLdSchema ? 'Detected' : 'Not Found', metaRef, audit.meta.hasJsonLdSchema ? 'pass' : 'warn');

  metaRef.y += SECTION_GAP;
  metaRef.y = checkPageBreak(metaRef.y, 30);
  metaRef.y = drawSectionHeader('Social & Open Graph Preview', metaRef.y);

  drawMetaRow('OG Title', audit.meta.ogTitle || 'Missing', metaRef, audit.meta.ogTitle ? 'pass' : 'warn');
  drawMetaRow('OG Description', audit.meta.ogDescription || 'Missing', metaRef, audit.meta.ogDescription ? 'pass' : 'warn');
  drawMetaRow('OG Image', audit.meta.ogImage || 'Missing', metaRef, audit.meta.ogImage ? 'pass' : 'warn');

  // Robots.txt section (conditional)
  if (audit.robotsValidation) {
    metaRef.y += SECTION_GAP;
    metaRef.y = checkPageBreak(metaRef.y, 30);
    metaRef.y = drawSectionHeader('Robots.txt & Crawl Status', metaRef.y);
    drawMetaRow('Crawl Status', audit.robotsValidation.status, metaRef, audit.robotsValidation.status === 'ALLOWED' ? 'pass' : 'fail');
    drawMetaRow('Matched Rule', audit.robotsValidation.matchedRule || 'Default Allow', metaRef);
    if (audit.robotsValidation.sitemaps.length > 0) {
      drawMetaRow('Sitemaps Found', audit.robotsValidation.sitemaps.join(', '), metaRef, 'pass');
    }
  }

  // Search Intent section (conditional)
  if (audit.searchIntent) {
    metaRef.y += SECTION_GAP;
    metaRef.y = checkPageBreak(metaRef.y, 25);
    metaRef.y = drawSectionHeader('Search Intent Analysis', metaRef.y);
    drawMetaRow('Primary Intent', audit.searchIntent.primaryIntent, metaRef, 'pass', `${audit.searchIntent.confidencePercent}% confidence`);
    if (audit.searchIntent.intentSignalsFound.length > 0) {
      drawMetaRow('Intent Signals', audit.searchIntent.intentSignalsFound.join(', '), metaRef);
    }
  }

  yPos = metaRef.y;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 3: Keyword Density & Heading Hierarchy
  // ══════════════════════════════════════════════════════════════════
  drawFooter(totalPages);
  doc.addPage();
  totalPages++;
  drawHeader();
  yPos = CONTENT_START_Y;

  yPos = drawSectionHeader('Keyword Density (Top Phrases)', yPos);

  const topKeywords = [...audit.keywords.oneGram, ...audit.keywords.twoGram]
    .sort((a, b) => b.density - a.density)
    .slice(0, 8);

  if (topKeywords.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT.BODY);
    doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    doc.text('No keyword data available.', MARGIN, yPos);
    yPos += 10;
  } else {
    const maxDensity = Math.max(5, ...topKeywords.map((k) => k.density));
    const barMaxWidth = 90;
    const barStartX = MARGIN + 55;

    topKeywords.forEach((kw) => {
      yPos = checkPageBreak(yPos, 10);

      // Keyword label (consistent 9pt)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FONT.BODY);
      doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
      const label = kw.phrase.length > 20 ? kw.phrase.substring(0, 18) + '..' : kw.phrase;
      doc.text(`"${label}"`, MARGIN, yPos + 3.5);

      // Background track bar (gray50, rounded)
      doc.setFillColor(COLORS.gray100.r, COLORS.gray100.g, COLORS.gray100.b);
      doc.roundedRect(barStartX, yPos, barMaxWidth, 5, 1, 1, 'F');

      // Filled density bar
      const barW = Math.max(3, (kw.density / maxDensity) * barMaxWidth);
      const isStuffing = kw.isStuffing || kw.density > 3;
      const bColor = isStuffing ? COLORS.red : brandRgb;
      doc.setFillColor(bColor.r, bColor.g, bColor.b);
      doc.roundedRect(barStartX, yPos, barW, 5, 1, 1, 'F');

      // Density value (consistent 9pt)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(FONT.BODY);
      doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
      doc.text(`${kw.density.toFixed(1)}% (${kw.count}x)`, barStartX + barMaxWidth + 4, yPos + 3.5);

      yPos += 9;
    });
  }

  yPos += SECTION_GAP;
  yPos = checkPageBreak(yPos, 30);
  yPos = drawSectionHeader('Heading Hierarchy', yPos);

  if (audit.headings.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT.BODY);
    doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    doc.text('No headings found on this page.', MARGIN, yPos);
    yPos += 10;
  } else {
    const headLimit = audit.headings.slice(0, 15);
    headLimit.forEach((h) => {
      yPos = checkPageBreak(yPos, 7);
      const indent = (h.depth - 1) * 4;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FONT.BODY);
      doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
      doc.text(h.level.toUpperCase(), MARGIN + indent, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
      let headText = h.text;
      if (headText.length > 75) headText = headText.substring(0, 72) + '...';
      doc.text(headText, MARGIN + indent + 10, yPos);

      yPos += 6.5;
    });

    if (audit.headings.length > 15) {
      doc.setFontSize(FONT.LABEL);
      doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
      doc.text(`... and ${audit.headings.length - 15} more headings`, MARGIN, yPos);
      yPos += 8;
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // PAGE 4: Link Profile & Technical Performance
  // ══════════════════════════════════════════════════════════════════
  drawFooter(totalPages);
  doc.addPage();
  totalPages++;
  drawHeader();
  yPos = CONTENT_START_Y;

  yPos = drawSectionHeader('Link Profile & Architecture', yPos);

  if (audit.linkAudit) {
    // 3 cards (consistent with Page 1 layout) + text row below
    drawMetricCard(MARGIN, yPos, cardW, cardH, 'Internal Links', `${audit.linkAudit.internalCount}`);
    drawMetricCard(MARGIN + cardW + 5, yPos, cardW, cardH, 'External Links', `${audit.linkAudit.externalCount}`);
    drawMetricCard(MARGIN + (cardW + 5) * 2, yPos, cardW, cardH, 'Nofollow Links', `${audit.linkAudit.nofollowCount}`);
    yPos += cardH + SUBSECTION_GAP;

    // Anchor text breakdown row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT.BODY);
    doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
    doc.text('Anchor Text Breakdown:', MARGIN, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Keyword-Rich: ${audit.linkAudit.anchorBreakdown.keywordRichCount}  |  Branded: ${audit.linkAudit.anchorBreakdown.brandedCount}  |  Generic: ${audit.linkAudit.anchorBreakdown.genericCount}`,
      MARGIN, yPos + 5
    );
    yPos += 12;

    // Affiliate info
    if (audit.linkAudit.affiliateCount > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Affiliate Links: ${audit.linkAudit.affiliateCount}`, MARGIN, yPos);
      if (audit.linkAudit.affiliateNetworksDetected.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Networks: ${audit.linkAudit.affiliateNetworksDetected.join(', ')}`, MARGIN + 40, yPos);
      }
      yPos += 8;
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT.BODY);
    doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    doc.text('Link audit data not available.', MARGIN, yPos);
    yPos += 10;
  }

  yPos += SECTION_GAP;
  yPos = drawSectionHeader('Technical Performance', yPos);

  const tech = audit.technicalAudit;
  if (tech) {
    const techMetrics = [
      { label: 'Time to First Byte (TTFB)', val: `${tech.ttfbMs} ms`, warn: tech.ttfbMs > 500 },
      { label: 'Total Download Time', val: `${tech.totalDownloadTimeMs} ms`, warn: tech.totalDownloadTimeMs > 2000 },
      { label: 'HTML Payload Size', val: `${tech.htmlSizeKb.toFixed(1)} KB`, warn: tech.htmlSizeKb > 100 },
      { label: 'DOM Node Count', val: `${tech.domNodeCount.toLocaleString()}`, warn: tech.domNodeCount > 1500 },
      { label: 'Max DOM Nesting Depth', val: `${tech.maxDomDepth} levels`, warn: tech.maxDomDepth > 15 },
      { label: 'Inline Scripts / Styles', val: `${tech.inlineScriptCount} scripts, ${tech.inlineStyleCount} styles`, warn: tech.inlineScriptCount > 5 },
      { label: 'External Scripts / Styles', val: `${tech.externalScriptCount} scripts, ${tech.externalStyleCount} styles`, warn: false },
    ];

    techMetrics.forEach((m) => {
      yPos = checkPageBreak(yPos, 7);
      drawStatusDot(MARGIN + 2, yPos - 0.5, m.warn ? 'warn' : 'pass');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FONT.BODY);
      doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
      doc.text(m.label, MARGIN + 8, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
      doc.text(m.val, MARGIN + 75, yPos);
      yPos += 7;
    });
  }

  yPos += SECTION_GAP;
  yPos = checkPageBreak(yPos, 30);
  yPos = drawSectionHeader('Content Readability', yPos);

  const read = audit.readability;
  if (read) {
    const readMetrics = [
      { label: 'Flesch Reading Ease', val: `${read.fleschReadingEase.toFixed(1)} / 100` },
      { label: 'Grade Level', val: read.gradeLabel },
      { label: 'Tone Profile', val: read.toneLabel },
      { label: 'Avg Sentence Length', val: `${read.avgSentenceLength.toFixed(1)} words` },
      { label: 'Complex Words', val: `${read.complexWordsPercentage.toFixed(1)}% (${read.complexWordsCount} words)` },
    ];
    readMetrics.forEach((m) => {
      yPos = checkPageBreak(yPos, 7);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FONT.BODY);
      doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
      doc.text(m.label, MARGIN, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
      doc.text(m.val, MARGIN + 55, yPos);
      yPos += 7;
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // PAGE 5: Comprehensive Audit Checklist
  // ══════════════════════════════════════════════════════════════════
  drawFooter(totalPages);
  doc.addPage();
  totalPages++;
  drawHeader();
  yPos = CONTENT_START_Y;

  yPos = drawSectionHeader('Comprehensive Audit Checklist', yPos);

  const h2Count = audit.headings.filter((h) => h.level === 'h2').length;

  const checklist = [
    { task: 'Title Tag Length (40-60 chars)', pass: audit.meta.titleLength >= 40 && audit.meta.titleLength <= 60 },
    { task: 'Meta Description (120-155 chars)', pass: audit.meta.descriptionLength >= 120 && audit.meta.descriptionLength <= 155 },
    { task: 'H1 Heading (exactly 1)', pass: h1Count === 1 },
    { task: 'H2 Sub-Headings (at least 2)', pass: h2Count >= 2 },
    { task: 'Image Alt Text (all images)', pass: audit.imageAudit.missingAltCount === 0 },
    { task: 'Modern Image Formats (WebP/SVG)', pass: audit.imageAudit.webpOrSvgCount > 0 || audit.imageAudit.totalImages === 0 },
    { task: 'Keyword Stuffing Check (<3%)', pass: audit.keywords.oneGram.every((k) => !k.isStuffing) },
    { task: 'Content Depth (>500 words)', pass: audit.wordCount > 500 },
    { task: 'HTTPS Security', pass: audit.technicalAudit?.hasHttps ?? false },
    { task: 'Mobile Viewport Meta', pass: audit.technicalAudit?.hasViewportMeta ?? false },
    { task: 'Charset Declaration', pass: audit.technicalAudit?.hasCharsetMeta ?? false },
    { task: 'Canonical URL Set', pass: !!audit.meta.canonicalUrl },
    { task: 'JSON-LD Structured Data', pass: audit.meta.hasJsonLdSchema },
    { task: 'Open Graph Tags Present', pass: !!audit.meta.ogTitle && !!audit.meta.ogImage },
    { task: 'Robots.txt Crawl Allowed', pass: !audit.robotsValidation || audit.robotsValidation.status === 'ALLOWED' },
  ];

  checklist.forEach((item, idx) => {
    yPos = checkPageBreak(yPos, 10);

    // Alternating row background
    const rowBg = idx % 2 === 0 ? COLORS.gray50 : COLORS.white;
    doc.setFillColor(rowBg.r, rowBg.g, rowBg.b);
    doc.setDrawColor(COLORS.gray200.r, COLORS.gray200.g, COLORS.gray200.b);
    doc.setLineWidth(0.2);
    doc.rect(MARGIN, yPos - 4, CONTENT_WIDTH, 9, 'FD');

    // Status dot
    drawStatusDot(MARGIN + 5, yPos, item.pass ? 'pass' : 'fail');

    // Item text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT.BODY);
    doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
    doc.text(`${idx + 1}. ${item.task}`, MARGIN + 12, yPos + 1);

    // Status badge text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT.BODY);
    if (item.pass) {
      doc.setTextColor(COLORS.green.r, COLORS.green.g, COLORS.green.b);
      doc.text('PASSED', PAGE_WIDTH - MARGIN - 3, yPos + 1, { align: 'right' });
    } else {
      doc.setTextColor(COLORS.red.r, COLORS.red.g, COLORS.red.b);
      doc.text('ACTION NEEDED', PAGE_WIDTH - MARGIN - 3, yPos + 1, { align: 'right' });
    }

    yPos += 11;
  });

  // ── Final Recommendation Box (dynamic height) ──
  yPos += SECTION_GAP;
  yPos = checkPageBreak(yPos, 40);

  let recText = 'Your page has a solid technical foundation but requires content optimizations. Focus on resolving the "Action Needed" items above to improve your search visibility.';
  if (overallScore >= 85) {
    recText = 'Excellent performance! Your page is highly optimized. Continue monitoring for minor tweaks and maintain content quality to retain strong rankings.';
  } else if (overallScore < 65) {
    recText = 'Significant optimization required. Address critical technical and content issues immediately to ensure the page can be properly crawled, indexed, and ranked by search engines.';
  }

  // IMPORTANT: Set the target rendering font BEFORE splitting so line widths are measured accurately
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONT.BODY);

  const recWrapWidth = CONTENT_WIDTH - 20; // Account for left accent bar (3mm) + left pad (8mm) + right pad (9mm)
  const LINE_HEIGHT = 5; // Explicit line height in mm (matches rendering below)
  const recLines: string[] = doc.splitTextToSize(recText, recWrapWidth);
  const recBoxHeight = Math.max(30, recLines.length * LINE_HEIGHT + 22); // title(8) + gap(7) + lines + bottom pad(7)

  doc.setFillColor(COLORS.gray50.r, COLORS.gray50.g, COLORS.gray50.b);
  doc.setDrawColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, yPos, CONTENT_WIDTH, recBoxHeight, 2, 2, 'FD');

  // Brand accent bar inside box
  doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.rect(MARGIN, yPos, 3, recBoxHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(FONT.SECTION);
  doc.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
  doc.text('Final Recommendation', MARGIN + 8, yPos + 8);

  // Render text lines with explicit line height to guarantee they stay inside the box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONT.BODY);
  doc.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
  recLines.forEach((line, i) => {
    doc.text(line, MARGIN + 8, yPos + 16 + i * LINE_HEIGHT);
  });

  // ── Save PDF ──
  drawFooter(totalPages);

  const cleanFilename = (options.clientName || 'seo-audit')
    .toLowerCase()
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  doc.save(`${cleanFilename}-executive-audit.pdf`);
}
