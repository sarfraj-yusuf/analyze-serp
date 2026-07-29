import * as cheerio from 'cheerio';
import { MetaData, HeadingItem, ImageAudit, ImageItem, LinkAudit, LinkItem } from '@/types/seo';
import { enhanceLinkAudit } from './link-inspector';

export interface ScrapedRawDOM {
  url: string;
  html: string;
  fetchTimeMs: number;
  ttfbMs: number;
  meta: MetaData;
  headings: HeadingItem[];
  imageAudit: ImageAudit;
  linkAudit: LinkAudit;
  cleanBodyText: string;
  cheerioDom: cheerio.CheerioAPI;
}

/**
 * Normalizes URL string to include standard protocol
 */
export function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * High-performance, non-AI server-side web scraper using Cheerio
 */
export async function scrapePage(targetUrl: string): Promise<ScrapedRawDOM> {
  const formattedUrl = normalizeUrl(targetUrl);
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  const ttfbStart = Date.now();
  const response = await fetch(formattedUrl, {
    signal: controller.signal,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SEOCompetitorAnalyzer/1.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const ttfbMs = Date.now() - ttfbStart;
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const fetchTimeMs = Date.now() - startTime;
  const $ = cheerio.load(html);

  // 1. Meta Data Extraction
  const title = $('title').first().text().trim() || $('meta[property="og:title"]').attr('content')?.trim() || '';
  const titleLength = title.length;
  // Estimate pixel width: average 9.6px per char in Arial 18px
  const titlePixelEstimate = Math.round(titleLength * 9.6);
  const titleTruncated = titlePixelEstimate > 580 || titleLength > 60;

  const description =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';
  const descriptionLength = description.length;
  const descriptionTruncated = descriptionLength > 160;

  const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim() || null;
  const robotsDirective = $('meta[name="robots"]').attr('content')?.trim() || null;
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || null;
  const ogDescription = $('meta[property="og:description"]').attr('content')?.trim() || null;
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim() || null;
  const hasJsonLdSchema = $('script[type="application/ld+json"]').length > 0;

  const meta: MetaData = {
    title,
    titleLength,
    titlePixelEstimate,
    titleTruncated,
    description,
    descriptionLength,
    descriptionTruncated,
    canonicalUrl,
    robotsDirective,
    ogTitle,
    ogDescription,
    ogImage,
    hasJsonLdSchema,
  };

  // 2. Heading Tree Extraction (H1 - H6)
  const headings: HeadingItem[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tagName = el.tagName.toLowerCase() as HeadingItem['level'];
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) {
      const levelNum = parseInt(tagName.replace('h', ''), 10);
      headings.push({
        level: tagName,
        text,
        depth: levelNum,
      });
    }
  });

  // 3. Image Audit Extraction
  const imageList: ImageItem[] = [];
  let missingAltCount = 0;
  let webpOrSvgCount = 0;

  $('img').each((_, el) => {
    const src = $(el).attr('src')?.trim() || $(el).attr('data-src')?.trim() || '';
    const alt = $(el).attr('alt')?.trim() || '';
    const hasAlt = alt.length > 0;
    const isWebpOrSvg = /\.webp(\?.*)?$/i.test(src) || /\.svg(\?.*)?$/i.test(src) || src.startsWith('data:image/svg');

    if (!hasAlt) missingAltCount++;
    if (isWebpOrSvg) webpOrSvgCount++;

    if (src) {
      imageList.push({
        src,
        alt,
        hasAlt,
        isWebpOrSvg,
      });
    }
  });

  const imageAudit: ImageAudit = {
    totalImages: imageList.length,
    missingAltCount,
    webpOrSvgCount,
    imageList,
  };

  // 4. Raw Link Extraction
  const rawLinks: { href: string; text: string; isExternal: boolean; isNofollow: boolean }[] = [];
  const baseUrlObj = new URL(formattedUrl);

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim() || '';
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    const rel = $(el).attr('rel') || '';
    const isNofollow = rel.includes('nofollow');

    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    let isExternal = false;
    try {
      const resolvedUrl = new URL(href, formattedUrl);
      isExternal = resolvedUrl.hostname !== baseUrlObj.hostname;
    } catch {
      isExternal = false;
    }

    rawLinks.push({
      href,
      text,
      isExternal,
      isNofollow,
    });
  });

  // Enhanced Link Audit with Anchor Classification & Affiliate Network Detection
  const linkAudit: LinkAudit = enhanceLinkAudit(rawLinks, formattedUrl);

  // 5. DOM Sanitization & Clean Body Text Isolation
  const cleanDom = cheerio.load(html);
  cleanDom('script, style, nav, footer, header, iframe, aside, noscript, svg, form').remove();

  let primaryContainer = cleanDom('article');
  if (primaryContainer.length === 0) primaryContainer = cleanDom('main');
  if (primaryContainer.length === 0) primaryContainer = cleanDom('body');

  const cleanBodyText = primaryContainer.text().replace(/\s+/g, ' ').trim();

  return {
    url: formattedUrl,
    html,
    fetchTimeMs,
    ttfbMs,
    meta,
    headings,
    imageAudit,
    linkAudit,
    cleanBodyText,
    cheerioDom: $,
  };
}

export const scrapeURL = scrapePage;
