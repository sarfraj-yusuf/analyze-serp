import * as cheerio from 'cheerio';
import { MetaData, HeadingItem, ImageAudit, ImageItem, LinkAudit, LinkItem, SpaDiagnostic } from '@/types/seo';
import { enhanceLinkAudit } from './link-inspector';
import { validateUrlSafety, safeFetchWithSsrf } from './ssrf-protection';
import { performSpaFallbackExtraction } from './spa-extractor';

export interface ScrapedRawDOM {
  url: string;
  finalUrl: string;
  html: string;
  fetchTimeMs: number;
  ttfbMs: number;
  meta: MetaData;
  headings: HeadingItem[];
  imageAudit: ImageAudit;
  linkAudit: LinkAudit;
  cleanBodyText: string;
  cheerioDom: cheerio.CheerioAPI;
  spaDiagnostic?: SpaDiagnostic;
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

export interface BrowserProfile {
  name: string;
  headers: Record<string, string>;
}

export const DESKTOP_BROWSER_PROFILES: BrowserProfile[] = [
  // 1. Chrome on Windows 11 / 10
  {
    name: 'Chrome Windows',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
  },
  // 2. Chrome on macOS (Apple Silicon / Intel)
  {
    name: 'Chrome macOS',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
  },
  // 3. Microsoft Edge on Windows
  {
    name: 'Edge Windows',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
  },
  // 4. Apple Safari on macOS (Sonoma)
  {
    name: 'Safari macOS',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
    },
  },
  // 5. Mozilla Firefox on Windows
  {
    name: 'Firefox Windows',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
  },
];

let globalRotationCounter = 0;

/**
 * Returns an authentic desktop browser header profile.
 * Supports round-robin rotation or explicit profile index.
 */
export function getRotatingBrowserHeaders(targetIndex?: number): Record<string, string> {
  const index =
    typeof targetIndex === 'number'
      ? Math.abs(targetIndex) % DESKTOP_BROWSER_PROFILES.length
      : (globalRotationCounter++) % DESKTOP_BROWSER_PROFILES.length;
  return { ...DESKTOP_BROWSER_PROFILES[index].headers };
}

function formatNetworkError(err: any, url: string): Error {
  const code = String(err.code || err.cause?.code || '').toUpperCase();
  const msg = String(err.message || '').toLowerCase();

  if (err.name === 'AbortError' || msg.includes('timeout') || msg.includes('aborted')) {
    return new Error(`Connection Timeout: Target website at ${url} took longer than 8 seconds to respond.`);
  }
  if (code === 'ENOTFOUND' || msg.includes('getaddrinfo') || msg.includes('enotfound')) {
    return new Error(`Domain Not Found: Could not resolve DNS for ${url}. The domain may be offline, misspelled, or expired.`);
  }
  if (code === 'ECONNREFUSED' || msg.includes('econnrefused')) {
    return new Error(`Server Unreachable: The target web server at ${url} refused the connection.`);
  }
  if (code === 'ECONNRESET' || msg.includes('econnreset')) {
    return new Error(`Connection Reset: The target server abruptly closed the connection for ${url}.`);
  }
  if (code.includes('CERT') || msg.includes('ssl') || msg.includes('tls') || msg.includes('certificate')) {
    return new Error(`SSL/TLS Error: Failed to establish a secure HTTPS connection to ${url}.`);
  }
  return new Error(err.message || `Failed to fetch webpage at ${url}`);
}

/**
 * High-performance, non-AI server-side web scraper using Cheerio
 */
export async function scrapePage(targetUrl: string, profileIndex?: number): Promise<ScrapedRawDOM> {
  const formattedUrl = normalizeUrl(targetUrl);

  // Validate URL safety against SSRF before initiating fetch
  await validateUrlSafety(formattedUrl);

  const startTime = Date.now();
  const browserHeaders = getRotatingBrowserHeaders(profileIndex);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // Strict 8-second independent per-URL timeout

  const ttfbStart = Date.now();
  let response: Response;
  try {
    response = await safeFetchWithSsrf(formattedUrl, {
      signal: controller.signal,
      headers: browserHeaders,
      maxRedirects: 5,
    });
  } catch (fetchErr: any) {
    // If the 8-second timer aborted the request, do NOT retry; fail immediately
    if (fetchErr.name === 'AbortError' || controller.signal.aborted) {
      throw new Error(`Connection Timeout: Target website at ${formattedUrl} took longer than 8 seconds to respond.`);
    }

    // If https connection failed (e.g. SSL/TLS handshake error) and user entered bare domain without protocol, try http fallback
    if (formattedUrl.startsWith('https://') && !/^https:\/\//i.test(targetUrl.trim())) {
      const fallbackUrl = `http://${targetUrl.trim().replace(/^https?:\/\//i, '')}`;
      try {
        response = await safeFetchWithSsrf(fallbackUrl, {
          signal: controller.signal,
          headers: browserHeaders,
          maxRedirects: 5,
        });
      } catch (fallbackErr: any) {
        throw formatNetworkError(fallbackErr, formattedUrl);
      }
    } else {
      throw formatNetworkError(fetchErr, formattedUrl);
    }
  }

    const ttfbMs = Date.now() - ttfbStart;

    if (!response.ok) {
      const serverHeader = response.headers.get('server') || '';
      const cfRay = response.headers.get('cf-ray');
      if (response.status === 403 || response.status === 503) {
        if (cfRay || serverHeader.toLowerCase().includes('cloudflare')) {
          throw new Error(
            `Cloudflare Bot Protection: The website at ${formattedUrl} requires an interactive browser challenge (HTTP ${response.status}). Automated crawling was declined by their security policy.`
          );
        }
        throw new Error(
          `Access Denied (HTTP ${response.status}): The website at ${formattedUrl} blocked automated crawling requests.`
        );
      }
      if (response.status === 404) {
        throw new Error(`Page Not Found (HTTP 404): The webpage at ${formattedUrl} does not exist or has been removed.`);
      }
      throw new Error(`HTTP Error ${response.status}: ${response.statusText} while fetching ${formattedUrl}`);
    }

    // Validate Content-Type
    const contentType = response.headers.get('content-type') || '';
    if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error(
        `Unsupported Content-Type: Target URL returned "${contentType}". AnalyzeSERP only audits HTML webpages.`
      );
    }

    // Content Length Guard (Max 5MB)
    const contentLength = Number(response.headers.get('content-length'));
    if (contentLength && contentLength > 5 * 1024 * 1024) {
      throw new Error(
        `Payload Too Large: Webpage size (${(contentLength / 1024 / 1024).toFixed(1)}MB) exceeds the 5MB crawl limit.`
      );
    }

    const finalUrl = response.url || formattedUrl;

    // Body download stream is protected by the same 8-second global timeout
    const html = await response.text();
    const fetchTimeMs = Date.now() - startTime;
    clearTimeout(timeoutId);
    const $ = cheerio.load(html);

  // Clean junk meta tags from DOM inspection
  $('meta[name="next-size-adjust"]').remove();

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

    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    let isExternal = false;
    let resolvedHref = href;
    try {
      const resolvedUrl = new URL(href, formattedUrl);
      resolvedHref = resolvedUrl.href;
      isExternal = resolvedUrl.hostname !== baseUrlObj.hostname;
    } catch {
      // If URL resolution fails entirely, keep the raw href
      isExternal = false;
    }

    rawLinks.push({
      href: resolvedHref,
      text,
      isExternal,
      isNofollow,
    });
  });

  // Enhanced Link Audit with Anchor Classification & Affiliate Network Detection
  const linkAudit: LinkAudit = enhanceLinkAudit(rawLinks, formattedUrl);

  // 5. DOM Sanitization & Clean Body Text Isolation
  const cleanDom = cheerio.load(html);
  cleanDom('script, style, nav, footer, header, iframe, aside, noscript, svg, form, meta[name="next-size-adjust"]').remove();

  let primaryContainer = cleanDom('article');
  if (primaryContainer.length === 0) primaryContainer = cleanDom('main');
  if (primaryContainer.length === 0) primaryContainer = cleanDom('body');

  // Inject space markers before block-level elements so Cheerio's .text()
  // doesn't merge words across tag boundaries (e.g., "<h1>Heading</h1><p>Text</p>" → "Heading Text")
  const blockSelectors = 'p, div, h1, h2, h3, h4, h5, h6, li, tr, td, th, blockquote, section, article, main, dt, dd, figcaption, pre, br, hr';
  primaryContainer.find(blockSelectors).each((_, el) => {
    cleanDom(el).before(' ');
  });

  const initialBodyText = primaryContainer.text().replace(/\s+/g, ' ').trim();

  // 6. SPA & Client-Rendered Fallback Cascades (Next.js __NEXT_DATA__, JSON-LD articleBody, Meta)
  const fallbackResult = performSpaFallbackExtraction(html, $, initialBodyText, headings, meta);
  const cleanBodyText = fallbackResult.cleanBodyText;
  const finalHeadings = fallbackResult.headings;
  const spaDiagnostic = fallbackResult.spaDiagnostic;

  return {
    url: formattedUrl,
    finalUrl,
    html,
    fetchTimeMs,
    ttfbMs,
    meta,
    headings: finalHeadings,
    imageAudit,
    linkAudit,
    cleanBodyText,
    cheerioDom: $,
    spaDiagnostic,
  };
}

export const scrapeURL = scrapePage;
