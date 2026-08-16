import { SinglePageAudit } from '@/types/seo';

export type MatrixCategory =
  | 'titles_descriptions'
  | 'headings_tree'
  | 'keywords_density'
  | 'technical_speed'
  | 'images_links';

/**
 * Downloads data as a CSV file in the browser
 */
export function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads data as a JSON file in the browser
 */
export function downloadJsonFile(filename: string, data: any) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates CSV string for Titles & Meta Descriptions category
 */
export function exportTitlesAndDescriptionsCsv(audits: SinglePageAudit[]) {
  const headers = ['URL', 'Page Title', 'Title Pixel Width (px)', 'Title Length (chars)', 'Meta Description', 'Description Length (chars)', 'SERP Snippet Status'];
  
  const rows = audits.map((audit) => [
    `"${audit.url.replace(/"/g, '""')}"`,
    `"${(audit.meta?.title || 'N/A').replace(/"/g, '""')}"`,
    audit.meta?.titlePixelEstimate || 0,
    audit.meta?.titleLength || 0,
    `"${(audit.meta?.description || 'N/A').replace(/"/g, '""')}"`,
    audit.meta?.descriptionLength || 0,
    (audit.meta?.titlePixelEstimate || 0) > 600 ? 'Truncated (>600px)' : 'Optimal Pixel Length',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsvFile(`competitor_meta_descriptions_${Date.now()}.csv`, csvContent);
}

/**
 * Helper to extract clean domain name from URL
 */
function getDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
}

/**
 * Generates Markdown table string for Titles & Meta Descriptions
 */
export function generateTitlesAndDescriptionsMarkdown(audits: SinglePageAudit[]): string {
  let md = `### 📌 Competitor Titles & Meta Descriptions Comparison\n\n`;
  md += `| Target Domain | Page Title | Title Length | Meta Description | Description Length |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach((audit) => {
    const domain = getDomain(audit.url);
    const title = (audit.meta?.title || 'N/A').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const desc = (audit.meta?.description || 'N/A').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const px = audit.meta?.titlePixelEstimate || 0;
    md += `| [${domain}](${audit.url}) | ${title} | ${px}px (${audit.meta?.titleLength || 0} chars) | ${desc} | ${audit.meta?.descriptionLength || 0} chars |\n`;
  });

  return md;
}

/**
 * Generates CSV string for Headings Hierarchy category
 */
export function exportHeadingsCsv(audits: SinglePageAudit[]) {
  const headers = ['URL', 'Heading Level', 'Heading Text'];
  const rows: string[][] = [];

  audits.forEach((audit) => {
    if (audit.headings && audit.headings.length > 0) {
      audit.headings.forEach((h) => {
        rows.push([
          `"${audit.url.replace(/"/g, '""')}"`,
          `"${h.level.toUpperCase()}"`,
          `"${h.text.replace(/"/g, '""')}"`,
        ]);
      });
    } else {
      rows.push([`"${audit.url.replace(/"/g, '""')}"`, '"N/A"', '"No Headings Found"']);
    }
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsvFile(`competitor_headings_hierarchy_${Date.now()}.csv`, csvContent);
}

/**
 * Generates Markdown table string for Headings Hierarchy
 */
export function generateHeadingsMarkdown(audits: SinglePageAudit[]): string {
  let md = `### 📑 Competitor Headings Hierarchy Comparison\n\n`;

  audits.forEach((audit) => {
    const domain = getDomain(audit.url);
    md += `#### 🌐 [${domain}](${audit.url})\n`;
    if (audit.headings && audit.headings.length > 0) {
      audit.headings.forEach((h) => {
        const levelNum = parseInt(h.level.replace('h', ''), 10) || 1;
        const indent = '  '.repeat(Math.max(0, levelNum - 1));
        md += `${indent}- **${h.level.toUpperCase()}**: ${h.text}\n`;
      });
    } else {
      md += `*No headings found on this page.*\n`;
    }
    md += `\n`;
  });

  return md;
}

/**
 * Generates CSV string for Keywords & N-Gram Density
 */
export function exportKeywordsCsv(audits: SinglePageAudit[]) {
  const headers = ['URL', 'N-Gram Type', 'Keyword / Phrase', 'Frequency Count', 'Density Percentage (%)'];
  const rows: string[][] = [];

  audits.forEach((audit) => {
    if (audit.keywords?.oneGram && audit.keywords.oneGram.length > 0) {
      audit.keywords.oneGram.slice(0, 15).forEach((kw) => {
        rows.push([
          `"${audit.url.replace(/"/g, '""')}"`,
          '"1-Gram"',
          `"${kw.phrase.replace(/"/g, '""')}"`,
          kw.count.toString(),
          `${kw.density.toFixed(2)}%`,
        ]);
      });
    }
    if (audit.keywords?.twoGram && audit.keywords.twoGram.length > 0) {
      audit.keywords.twoGram.slice(0, 10).forEach((kw) => {
        rows.push([
          `"${audit.url.replace(/"/g, '""')}"`,
          '"2-Gram"',
          `"${kw.phrase.replace(/"/g, '""')}"`,
          kw.count.toString(),
          `${kw.density.toFixed(2)}%`,
        ]);
      });
    }
    if (audit.keywords?.threeGram && audit.keywords.threeGram.length > 0) {
      audit.keywords.threeGram.slice(0, 10).forEach((kw) => {
        rows.push([
          `"${audit.url.replace(/"/g, '""')}"`,
          '"3-Gram"',
          `"${kw.phrase.replace(/"/g, '""')}"`,
          kw.count.toString(),
          `${kw.density.toFixed(2)}%`,
        ]);
      });
    }
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsvFile(`competitor_keywords_density_${Date.now()}.csv`, csvContent);
}

/**
 * Generates Markdown table string for Keywords & N-Gram Density
 */
export function generateKeywordsMarkdown(audits: SinglePageAudit[]): string {
  let md = `### 🔑 Competitor Keywords & N-Gram Density Comparison\n\n`;

  audits.forEach((audit) => {
    const domain = getDomain(audit.url);
    md += `#### 🌐 Domain: [${domain}](${audit.url})\n`;
    md += `| Keyword / Phrase | Type | Frequency | Density |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    (audit.keywords?.oneGram || []).slice(0, 5).forEach((kw) => {
      md += `| ${kw.phrase} | 1-Gram | ${kw.count} | ${kw.density.toFixed(2)}% |\n`;
    });
    (audit.keywords?.twoGram || []).slice(0, 5).forEach((kw) => {
      md += `| ${kw.phrase} | 2-Gram | ${kw.count} | ${kw.density.toFixed(2)}% |\n`;
    });
    (audit.keywords?.threeGram || []).slice(0, 5).forEach((kw) => {
      md += `| ${kw.phrase} | 3-Gram | ${kw.count} | ${kw.density.toFixed(2)}% |\n`;
    });
    md += `\n`;
  });

  return md;
}

/**
 * Generates CSV for Technical & Speed Signals
 */
export function exportTechnicalSpeedCsv(audits: SinglePageAudit[]) {
  const headers = ['URL', 'Technical Health Score', 'Response Load Time (ms)', 'HTML Document Size (KB)', 'Canonical URL', 'Robots.txt Status', 'SSL HTTPS Encrypted'];
  
  const rows = audits.map((audit) => [
    `"${audit.url.replace(/"/g, '""')}"`,
    audit.technicalAudit?.technicalScore || 0,
    audit.technicalAudit?.ttfbMs || 0,
    audit.technicalAudit?.htmlSizeKb || 0,
    `"${(audit.meta?.canonicalUrl || 'N/A').replace(/"/g, '""')}"`,
    `"${(audit.robotsValidation?.status || 'ALLOWED').replace(/"/g, '""')}"`,
    audit.technicalAudit?.hasHttps ? 'Yes (HTTPS)' : 'No (HTTP)',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsvFile(`competitor_technical_speed_${Date.now()}.csv`, csvContent);
}

/**
 * Generates Markdown for Technical & Speed Signals
 */
export function generateTechnicalSpeedMarkdown(audits: SinglePageAudit[]): string {
  let md = `### ⚡ Competitor Technical & Speed Comparison\n\n`;
  md += `| Target Domain | Tech Score | Load Time | HTML Size | Canonical Tag | SSL Status |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach((audit) => {
    const domain = getDomain(audit.url);
    const score = audit.technicalAudit?.technicalScore || 0;
    const time = audit.technicalAudit?.ttfbMs || 0;
    const size = (audit.technicalAudit?.htmlSizeKb || 0).toFixed(1) + ' KB';
    const canonical = audit.meta?.canonicalUrl ? `[${getDomain(audit.meta.canonicalUrl)}](${audit.meta.canonicalUrl})` : 'N/A';
    const ssl = audit.technicalAudit?.hasHttps ? 'HTTPS 🟢' : 'HTTP 🔴';

    md += `| [${domain}](${audit.url}) | ${score}% | ${time}ms | ${size} | ${canonical} | ${ssl} |\n`;
  });

  return md;
}

/**
 * Generates CSV for Image & Link Assets
 */
export function exportImagesAndLinksCsv(audits: SinglePageAudit[]) {
  const headers = ['URL', 'Total Images', 'Images Missing Alt', 'Total Links', 'Internal Links', 'External Links', 'Affiliate Links'];
  
  const rows = audits.map((audit) => {
    const totalImgs = audit.imageAudit?.totalImages || 0;
    const missingAlt = audit.imageAudit?.missingAltCount || 0;
    const links = audit.linkAudit || { totalLinks: 0, internalCount: 0, externalCount: 0, affiliateCount: 0 };

    return [
      `"${audit.url.replace(/"/g, '""')}"`,
      totalImgs,
      missingAlt,
      links.totalLinks,
      links.internalCount,
      links.externalCount,
      links.affiliateCount,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsvFile(`competitor_images_links_${Date.now()}.csv`, csvContent);
}

/**
 * Generates Markdown for Image & Link Assets
 */
export function generateImagesAndLinksMarkdown(audits: SinglePageAudit[]): string {
  let md = `### 🖼️ Competitor Images & Link Breakdown Comparison\n\n`;
  md += `| Target Domain | Total Images | Missing Alt Tags | Total Links | Internal | External | Affiliate |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach((audit) => {
    const domain = getDomain(audit.url);
    const totalImgs = audit.imageAudit?.totalImages || 0;
    const missingAlt = audit.imageAudit?.missingAltCount || 0;
    const links = audit.linkAudit || { totalLinks: 0, internalCount: 0, externalCount: 0, affiliateCount: 0 };

    md += `| [${domain}](${audit.url}) | ${totalImgs} | ${missingAlt} | ${links.totalLinks} | ${links.internalCount} | ${links.externalCount} | ${links.affiliateCount} |\n`;
  });

  return md;
}
