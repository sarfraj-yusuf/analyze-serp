import * as cheerio from 'cheerio';
import { TechnicalAudit } from '@/types/seo';

/**
 * Calculates maximum DOM nesting depth
 */
function calculateMaxDomDepth($: cheerio.CheerioAPI): number {
  let maxDepth = 0;

  function traverse(el: any, depth: number) {
    if (!el) return;
    if (depth > maxDepth) maxDepth = depth;
    if (el.children && Array.isArray(el.children)) {
      el.children.forEach((child: any) => {
        if (child && child.type === 'tag') {
          traverse(child, depth + 1);
        }
      });
    }
  }

  const root = $('html').get(0);
  if (root) {
    traverse(root, 1);
  } else {
    traverse($('body').get(0) || $('*').first().get(0), 1);
  }

  return Math.max(1, maxDepth);
}

/**
 * Analyzes page performance, HTML payload size, DOM depth, and technical health rules
 */
export function analyzeTechnicalHealth(
  html: string,
  fetchTimeMs: number,
  ttfbMs: number,
  url: string,
  $: cheerio.CheerioAPI
): TechnicalAudit {
  // 1. Raw Payload Size
  const rawBytes = Buffer.byteLength(html, 'utf-8');
  const htmlSizeKb = Math.round((rawBytes / 1024) * 10) / 10;

  // 2. DOM Node Count & Depth
  const domNodeCount = $('*:not(script):not(style)').length;
  const maxDomDepth = calculateMaxDomDepth($);

  // 3. Inline Script & Style Overhead
  let inlineScriptCount = 0;
  let inlineScriptBytes = 0;
  let externalScriptCount = 0;

  $('script').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      externalScriptCount++;
    } else {
      inlineScriptCount++;
      const content = $(el).html() || '';
      inlineScriptBytes += Buffer.byteLength(content, 'utf-8');
    }
  });

  let inlineStyleCount = 0;
  let inlineStyleBytes = 0;

  $('style').each((_, el) => {
    inlineStyleCount++;
    const content = $(el).html() || '';
    inlineStyleBytes += Buffer.byteLength(content, 'utf-8');
  });

  const externalStyleCount = $('link[rel="stylesheet"]').length;

  const inlineScriptSizeKb = Math.round((inlineScriptBytes / 1024) * 10) / 10;
  const inlineStyleSizeKb = Math.round((inlineStyleBytes / 1024) * 10) / 10;

  // 4. Checklist Directives
  const hasViewportMeta = $('meta[name="viewport"]').length > 0;
  const hasHttps = url.toLowerCase().startsWith('https://');
  const hasCharsetMeta = $('meta[charset]').length > 0 || $('meta[http-equiv="Content-Type"]').length > 0;

  // 5. Technical Warnings & Scoring (0 - 100)
  const warnings: string[] = [];
  let score = 100;

  if (ttfbMs > 500) {
    score -= 15;
    warnings.push(`Slow Time-to-First-Byte (TTFB) latency (${ttfbMs}ms > 500ms limit). Consider upgrading web hosting or enabling CDN caching.`);
  } else if (ttfbMs > 300) {
    score -= 5;
  }

  if (htmlSizeKb > 150) {
    score -= 15;
    warnings.push(`Heavy HTML payload size (${htmlSizeKb}kB > 150kB limit). Minify HTML source code and remove unnecessary DOM comments.`);
  } else if (htmlSizeKb > 100) {
    score -= 5;
  }

  if (domNodeCount > 1500) {
    score -= 15;
    warnings.push(`Excessive DOM node count (${domNodeCount} nodes > 1,500 limit). Complex DOM trees increase browser memory consumption & rendering time.`);
  } else if (domNodeCount > 1000) {
    score -= 5;
  }

  if (maxDomDepth > 32) {
    score -= 10;
    warnings.push(`Deep DOM nesting level (${maxDomDepth} levels > 32 max depth). Simplify HTML layout container structure.`);
  }

  if (inlineScriptSizeKb > 50) {
    score -= 10;
    warnings.push(`High inline JavaScript overhead (${inlineScriptSizeKb}kB). Move inline scripts into external cached .js files.`);
  }

  if (!hasViewportMeta) {
    score -= 15;
    warnings.push('Missing viewport meta tag. Mobile devices may render unscaled desktop views.');
  }

  if (!hasHttps) {
    score -= 20;
    warnings.push('Missing SSL/HTTPS security protocol. Google penalizes non-secure HTTP pages.');
  }

  if (!hasCharsetMeta) {
    score -= 5;
    warnings.push('Missing character encoding meta tag (<meta charset="utf-8">).');
  }

  const technicalScore = Math.max(0, Math.min(100, score));

  let technicalGrade: TechnicalAudit['technicalGrade'] = 'Fast & Optimized';
  if (technicalScore >= 80) technicalGrade = 'Fast & Optimized';
  else if (technicalScore >= 60) technicalGrade = 'Moderate Overhead';
  else technicalGrade = 'Heavy & Unoptimized';

  return {
    ttfbMs,
    totalDownloadTimeMs: fetchTimeMs,
    htmlSizeKb,
    domNodeCount,
    maxDomDepth,
    inlineScriptCount,
    inlineScriptSizeKb,
    inlineStyleCount,
    inlineStyleSizeKb,
    externalScriptCount,
    externalStyleCount,
    hasViewportMeta,
    hasHttps,
    hasCharsetMeta,
    technicalScore,
    technicalGrade,
    warnings,
  };
}
