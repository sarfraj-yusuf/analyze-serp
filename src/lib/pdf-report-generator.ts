import jsPDF from 'jspdf';
import { SinglePageAudit } from '@/types/seo';

export interface WhiteLabelOptions {
  agencyName: string;
  clientName: string;
  auditorEmail: string;
  primaryColorHex: string; // e.g. '#059669', '#0284c7', '#4f46e5'
  tagline?: string;
}

// Convert Hex to RGB helper
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

export function generateWhiteLabelPdfReport(
  audit: SinglePageAudit,
  options: WhiteLabelOptions
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const brandRgb = hexToRgb(options.primaryColorHex || '#059669');

  const { meta, wordCount, readingTimeMinutes, headings, imageAudit, linkAudit, keywords, readability, technicalAudit } = audit;

  // Calculate Health Score
  let score = 0;
  if (meta.titleLength > 0 && !meta.titleTruncated) score += 15;
  else if (meta.titleLength > 0) score += 8;

  if (meta.descriptionLength > 0 && !meta.descriptionTruncated) score += 15;
  else if (meta.descriptionLength > 0) score += 8;

  const h1Count = headings.filter((h) => h.level === 'h1').length;
  if (h1Count === 1) score += 20;
  else if (h1Count > 0) score += 10;

  if (wordCount >= 1000) score += 20;
  else if (wordCount >= 500) score += 12;

  if (imageAudit.totalImages === 0 || imageAudit.missingAltCount === 0) score += 15;
  else score += Math.max(0, 15 - imageAudit.missingAltCount * 3);

  if (keywords.oneGram.filter((k) => k.isStuffing).length === 0) score += 15;
  else score += 5;

  const gradeLabel = score >= 85 ? 'EXCELLENT' : score >= 65 ? 'GOOD (TWEAKS NEEDED)' : 'NEEDS OPTIMIZATION';

  // --- PAGE 1: COVER & EXECUTIVE SCORECARD ---
  // Top Header Colored Banner
  doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(options.agencyName || 'SEO Growth Agency', 14, 18);

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Executive Client Audit Report • ${new Date().toLocaleDateString()}`, 14, 28);
  if (options.auditorEmail) {
    doc.text(`Prepared by: ${options.auditorEmail}`, 196, 28, { align: 'right' });
  }

  // Client Details Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 45, 182, 18, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 45, 182, 18, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.text(`Target Client: ${options.clientName || 'Valued Client'}`, 18, 52);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Audited URL: ${audit.url}`, 18, 58);

  // Scorecard Container Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, 70, 182, 45, 3, 3, 'FD');

  // Colored Score Gauge Box
  if (score >= 85) doc.setFillColor(16, 185, 129); // Emerald
  else if (score >= 65) doc.setFillColor(245, 158, 11); // Amber
  else doc.setFillColor(239, 68, 68); // Red

  doc.roundedRect(20, 76, 33, 33, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(`${score}`, 36.5, 93, { align: 'center' });
  doc.setFontSize(8);
  doc.text('/100 SCORE', 36.5, 101, { align: 'center' });

  // Scorecard Text Summary
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('On-Page SEO Health Summary', 60, 83);

  doc.setFontSize(10);
  doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.text(`Grade Status: ${gradeLabel}`, 60, 90);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Page analyzed in ${audit.fetchTimeMs}ms. Evaluates title tags, meta descriptions,`, 60, 97);
  doc.text(`heading hierarchy, image alt text, word volume, and keyword density.`, 60, 103);

  // Executive Metric Summary Cards
  const cards = [
    { title: 'WORD VOLUME', val: `${wordCount.toLocaleString()} words` },
    { title: 'READ TIME', val: `${readingTimeMinutes} min` },
    { title: 'TOTAL IMAGES', val: `${imageAudit.totalImages} (${imageAudit.missingAltCount} missing alt)` },
    { title: 'HEADINGS', val: `${headings.length} (H1: ${h1Count})` },
  ];

  let xPos = 14;
  cards.forEach((c) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(xPos, 122, 42.5, 22, 2, 2, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('Helvetica', 'bold');
    doc.text(c.title, xPos + 4, 128);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.text(c.val, xPos + 4, 137);

    xPos += 46.5;
  });

  // Actionable Executive Overview Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 152, 182, 120, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.text('Executive Key Findings & Action Plan', 20, 162);

  const findings = [
    meta.titleTruncated
      ? '🔴 TITLE TAG TRUNCATION: Title tag exceeds 60 characters (~580px) and requires trimming.'
      : '🟢 TITLE TAG OPTIMAL: Title tag length displays cleanly on Google SERPs.',

    meta.descriptionTruncated
      ? '🔴 META DESCRIPTION TOO LONG: Description exceeds 160 characters and may truncate.'
      : meta.descriptionLength === 0
      ? '🔴 MISSING META DESCRIPTION: Add a compelling 120-155 character description.'
      : '🟢 META DESCRIPTION OPTIMAL: Good length for driving search click-through rates.',

    h1Count === 1
      ? '🟢 HEADING STRUCTURE: Single clear H1 tag detected with clean sub-topic hierarchy.'
      : '🔴 HEADING ISSUES: Ensure page has exactly 1 primary H1 tag for clear topic focus.',

    imageAudit.missingAltCount > 0
      ? `🔴 MISSING IMAGE ALT TEXT: Found ${imageAudit.missingAltCount} image(s) lacking alt text attributes.`
      : '🟢 IMAGE ALT COMPLIANCE: All images include descriptive alt text.',

    wordCount >= 1000
      ? `🟢 CONTENT DEPTH: Comprehensive content volume (${wordCount.toLocaleString()} words).`
      : `🟡 CONTENT EXPANSION NEEDED: Article contains ${wordCount} words; consider expanding sub-sections.`,
  ];

  let yOffset = 172;
  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  findings.forEach((f) => {
    doc.text(f, 20, yOffset);
    yOffset += 14;
  });

  // Page 1 Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('Page 1 of 3 • Confidential Client Audit Report', 14, 286);
  doc.text(options.agencyName, 196, 286, { align: 'right' });

  // --- PAGE 2: ON-PAGE METADATA & KEYWORD BAR CHART ---
  doc.addPage();

  // Page 2 Header Banner
  doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('SECTION 2: ON-PAGE METADATA & KEYWORD DENSITY CHART', 14, 12);

  // Metadata Inspector Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 25, 182, 45, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.text('Parsed Metadata Inspection', 20, 33);

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Title Tag (${meta.titleLength} chars): ${meta.title || '(None)'}`, 20, 42);
  doc.text(`Meta Description (${meta.descriptionLength} chars): ${meta.description || '(None)'}`, 20, 52);
  doc.text(`JSON-LD Schema: ${meta.hasJsonLdSchema ? 'Detected' : 'Not Found'} • Canonical URL: ${meta.canonicalUrl || 'Default'}`, 20, 62);

  // Visual Bar Chart: Top 5 Keyword Densities
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, 78, 182, 95, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.text('Top 5 Target Keyword Density Chart (%)', 20, 88);

  const topKeywords = keywords.oneGram.slice(0, 5);
  let chartY = 100;
  const maxChartDensity = Math.max(3.0, ...topKeywords.map((k) => k.density));

  topKeywords.forEach((k) => {
    // Label
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8.5);
    doc.setFont('Helvetica', 'bold');
    doc.text(`"${k.phrase}"`, 20, chartY + 4);

    // Bar background
    doc.setFillColor(241, 245, 249);
    doc.rect(70, chartY, 95, 6, 'F');

    // Bar fill
    const barWidth = Math.min(95, Math.max(4, (k.density / maxChartDensity) * 95));
    if (k.isStuffing) doc.setFillColor(239, 68, 68); // Red if stuffing (>3.0%)
    else doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b); // Brand color

    doc.rect(70, chartY, barWidth, 6, 'F');

    // Percentage value text
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.text(`${k.density}% (${k.count}x)`, 168, chartY + 4.5);

    chartY += 14;
  });

  // Heading Tree Structure Table
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 182, 182, 85, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('Parsed Heading Tree Hierarchy (Sample)', 20, 192);

  let headingY = 202;
  doc.setFontSize(8);
  headings.slice(0, 10).forEach((h) => {
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
    doc.text(`[${h.level.toUpperCase()}]`, 20, headingY);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(h.text.substring(0, 80), 34, headingY);
    headingY += 6.5;
  });

  // Page 2 Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('Page 2 of 3 • Confidential Client Audit Report', 14, 286);
  doc.text(options.agencyName, 196, 286, { align: 'right' });

  // --- PAGE 3: TECHNICAL SPEED, READABILITY & ACTION ITEMS ---
  doc.addPage();

  // Page 3 Header Banner
  doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('SECTION 3: TECHNICAL SPEED, READABILITY & ACTION CHECKLIST', 14, 12);

  // Technical Speed & Readability Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 25, 182, 50, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('Technical Performance & Readability Scores', 20, 33);

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  if (technicalAudit) {
    doc.text(`Time-to-First-Byte (TTFB): ${technicalAudit.ttfbMs} ms • HTML Payload Size: ${technicalAudit.htmlSizeKb} kB`, 20, 42);
    doc.text(`DOM Node Count: ${technicalAudit.domNodeCount} nodes • Max Nesting Depth: ${technicalAudit.maxDomDepth} levels`, 20, 50);
  }

  if (readability) {
    doc.text(`Flesch Reading Ease: ${readability.fleschReadingEase}/100 • Target Grade: ${readability.gradeLabel}`, 20, 58);
    doc.text(`Content Tone Profile: ${readability.toneLabel} • Avg Sentence Length: ${readability.avgSentenceLength} words`, 20, 66);
  }

  // Final Actionable Audit Checklist Table
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.roundedRect(14, 82, 182, 185, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.text('Complete Actionable Optimization Checklist', 20, 93);

  const checklistItems = [
    { title: 'Title Tag Optimization', status: meta.titleTruncated ? 'ACTION NEEDED' : 'PASSED', desc: 'Ensure title length is between 40-60 characters.' },
    { title: 'Meta Description CTR', status: meta.descriptionTruncated || meta.descriptionLength === 0 ? 'ACTION NEEDED' : 'PASSED', desc: 'Add compelling description text between 120-155 characters.' },
    { title: 'H1 Main Heading Focus', status: h1Count === 1 ? 'PASSED' : 'ACTION NEEDED', desc: 'Include exactly 1 H1 main topic title per web page.' },
    { title: 'Sub-Topic H2 Headings', status: headings.filter((h) => h.level === 'h2').length > 0 ? 'PASSED' : 'ACTION NEEDED', desc: 'Break up content into H2 and H3 sub-topics.' },
    { title: 'Image Alt Text Attributes', status: imageAudit.missingAltCount === 0 ? 'PASSED' : 'ACTION NEEDED', desc: 'Add descriptive alt text to all image tags.' },
    { title: 'Keyword Stuffing Filter', status: keywords.oneGram.filter((k) => k.isStuffing).length === 0 ? 'PASSED' : 'ACTION NEEDED', desc: 'Keep top keyword density below 3.0%.' },
    { title: 'TTFB Server Speed', status: (technicalAudit?.ttfbMs || 200) < 500 ? 'PASSED' : 'ACTION NEEDED', desc: 'Maintain TTFB server response time under 400ms.' },
    { title: 'Mobile Viewport Directives', status: technicalAudit?.hasViewportMeta ? 'PASSED' : 'ACTION NEEDED', desc: 'Ensure page includes mobile viewport meta tag.' },
  ];

  let checkY = 105;
  checklistItems.forEach((item) => {
    // Status Badge
    if (item.status === 'PASSED') {
      doc.setFillColor(16, 185, 129);
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setFillColor(239, 68, 68);
      doc.setTextColor(255, 255, 255);
    }
    doc.roundedRect(20, checkY, 26, 5, 1, 1, 'F');
    doc.setFontSize(6.5);
    doc.setFont('Helvetica', 'bold');
    doc.text(item.status, 33, checkY + 3.6, { align: 'center' });

    // Item Title & Description
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text(item.title, 50, checkY + 4);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('Helvetica', 'normal');
    doc.text(item.desc, 50, checkY + 9);

    doc.setDrawColor(241, 245, 249);
    doc.line(20, checkY + 13, 190, checkY + 13);

    checkY += 18;
  });

  // Page 3 Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('Page 3 of 3 • Confidential Client Audit Report', 14, 286);
  doc.text(options.agencyName, 196, 286, { align: 'right' });

  // Save PDF
  const cleanFilename = (options.clientName || 'seo-client-audit')
    .toLowerCase()
    .replace(/[^\w-]/g, '-');
  doc.save(`${cleanFilename}-executive-audit.pdf`);
}
