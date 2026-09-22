import * as cheerio from 'cheerio';
import { HeadingItem, MetaData, SpaDiagnostic } from '@/types/seo';

/**
 * Checks whether a candidate string looks like readable human prose rather than
 * code, URLs, base64, timestamps, or minified asset references.
 */
function isHumanProse(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.length < 25) return false;

  // Reject URLs, protocols, asset references
  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) return false;

  // Reject UUIDs, timestamps, SVG paths, CSS code
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i.test(trimmed)) return false;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) return false;
  if (/^[MmLlHhVvCcSsQqTtAaZz0-9,.\s-]{30,}$/.test(trimmed)) return false;
  if (/^(?:[.#]?[a-zA-Z0-9_-]+\s*\{|[a-zA-Z-]+:\s*[^;]+;)/.test(trimmed)) return false;

  // Must contain multiple whitespace-delimited words
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 4) return false;

  // Ratio of spaces to total length must look like human language (typically 0.08 - 0.22)
  const spaceCount = (trimmed.match(/\s/g) || []).length;
  const spaceRatio = spaceCount / trimmed.length;
  if (spaceRatio < 0.05 || spaceRatio > 0.4) return false;

  return true;
}

/**
 * Strips HTML or Markdown tags to leave clean text.
 */
function stripMarkup(raw: string): string {
  if (!raw.includes('<') && !raw.includes('#')) return raw.trim();
  try {
    const text = cheerio.load(raw).text();
    return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
  } catch {
    return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

/**
 * Recursively extracts human text blocks and prospective headings from a JSON node.
 */
function recursivelyExtractProse(
  node: any,
  depth = 0,
  collectedProse: string[] = [],
  collectedHeadings: HeadingItem[] = []
): void {
  if (depth > 10 || !node) return;

  if (typeof node === 'string') {
    if (isHumanProse(node)) {
      const clean = stripMarkup(node);
      if (clean.length > 25 && !collectedProse.includes(clean)) {
        collectedProse.push(clean);
      }
    }
  } else if (Array.isArray(node)) {
    for (const item of node) {
      recursivelyExtractProse(item, depth + 1, collectedProse, collectedHeadings);
    }
  } else if (typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      const lowerKey = key.toLowerCase();

      // Heading candidates from JSON keys (e.g. title, headline, subheading, sectionTitle)
      if (
        typeof value === 'string' &&
        ['title', 'headline', 'subheading', 'sectiontitle', 'header', 'name'].includes(lowerKey)
      ) {
        const cleanHeading = value.trim();
        if (
          cleanHeading.length >= 4 &&
          cleanHeading.length <= 120 &&
          !cleanHeading.startsWith('http') &&
          !collectedHeadings.some((h) => h.text.toLowerCase() === cleanHeading.toLowerCase())
        ) {
          collectedHeadings.push({
            level: lowerKey.includes('sub') ? 'h2' : 'h1',
            text: cleanHeading,
            depth: lowerKey.includes('sub') ? 2 : 1,
          });
        }
      }

      // Prioritize content-bearing keys
      if (
        ['post', 'article', 'content', 'body', 'markdown', 'description', 'brief', 'text', 'summary', 'html'].some(
          (k) => lowerKey.includes(k)
        )
      ) {
        if (typeof value === 'string') {
          const clean = stripMarkup(value);
          if (clean.length > 25 && !collectedProse.includes(clean)) {
            collectedProse.push(clean);
          }
        } else {
          recursivelyExtractProse(value, depth + 1, collectedProse, collectedHeadings);
        }
        continue;
      }

      recursivelyExtractProse(value, depth + 1, collectedProse, collectedHeadings);
    }
  }
}

/**
 * Extracts content from Next.js pre-rendered __NEXT_DATA__ script
 */
export function extractNextData(
  $: cheerio.CheerioAPI
): { text: string; headings: HeadingItem[] } | null {
  try {
    const nextScript = $('script#__NEXT_DATA__').first().text();
    if (!nextScript) return null;

    const data = JSON.parse(nextScript);
    const targetNode = data.props?.pageProps || data.props || data;

    const prose: string[] = [];
    const headings: HeadingItem[] = [];
    recursivelyExtractProse(targetNode, 0, prose, headings);

    if (prose.length === 0) return null;

    return {
      text: prose.join(' \n\n '),
      headings,
    };
  } catch {
    return null;
  }
}

/**
 * Extracts content from Schema.org JSON-LD scripts (articleBody, description, headline)
 */
export function extractJsonLdContent(
  $: cheerio.CheerioAPI
): { text: string; headings: HeadingItem[] } | null {
  try {
    const scripts = $('script[type="application/ld+json"]');
    if (scripts.length === 0) return null;

    const prose: string[] = [];
    const headings: HeadingItem[] = [];

    scripts.each((_, el) => {
      try {
        const rawJson = $(el).text().trim();
        if (!rawJson) return;
        const parsed = JSON.parse(rawJson);

        const items = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed['@graph'])
          ? parsed['@graph']
          : [parsed];

        for (const item of items) {
          if (!item || typeof item !== 'object') continue;

          // Article body
          if (typeof item.articleBody === 'string' && item.articleBody.trim().length > 30) {
            prose.push(stripMarkup(item.articleBody));
          }

          // Description or abstract
          if (typeof item.description === 'string' && item.description.trim().length > 30) {
            prose.push(stripMarkup(item.description));
          }
          if (typeof item.abstract === 'string' && item.abstract.trim().length > 30) {
            prose.push(stripMarkup(item.abstract));
          }

          // Headline or name as H1
          const headline = typeof item.headline === 'string' ? item.headline : typeof item.name === 'string' ? item.name : '';
          if (headline && headline.trim().length > 4 && headline.length < 120) {
            headings.push({
              level: 'h1',
              text: headline.trim(),
              depth: 1,
            });
          }
        }
      } catch {
        // Skip malformed script tag
      }
    });

    if (prose.length === 0) return null;

    return {
      text: prose.join(' \n\n '),
      headings,
    };
  } catch {
    return null;
  }
}

/**
 * Detects whether the page is a client-side rendered Single Page Application (SPA).
 */
export function detectSpaSignatures(
  html: string,
  $: cheerio.CheerioAPI
): { isSpa: boolean; framework?: 'Next.js' | 'React SPA' | 'Vue / Nuxt' | 'Generic SPA' } {
  // 1. Next.js
  if ($('script#__NEXT_DATA__').length > 0 || html.includes('/_next/static/') || $('div#__next').length > 0) {
    return { isSpa: true, framework: 'Next.js' };
  }

  // 2. React SPA (CRA / Vite)
  if ($('div#root').length > 0 || html.includes('react-root') || $('div[data-reactroot]').length > 0) {
    return { isSpa: true, framework: 'React SPA' };
  }

  // 3. Vue / Nuxt
  if ($('div#app').length > 0 || $('div#__nuxt').length > 0 || html.includes('/_nuxt/')) {
    return { isSpa: true, framework: 'Vue / Nuxt' };
  }

  // 4. Angular or generic SPA
  if ($('app-root').length > 0) {
    return { isSpa: true, framework: 'Generic SPA' };
  }

  // 5. Noscript warning test
  const noscriptText = $('noscript').text().toLowerCase();
  if (
    noscriptText.includes('enable javascript') ||
    noscriptText.includes('requires javascript') ||
    noscriptText.includes('need javascript')
  ) {
    return { isSpa: true, framework: 'Generic SPA' };
  }

  return { isSpa: false };
}

/**
 * Coordinates fallback extraction for client-rendered SPAs when static body content is thin.
 */
export function performSpaFallbackExtraction(
  html: string,
  $: cheerio.CheerioAPI,
  currentBodyText: string,
  currentHeadings: HeadingItem[],
  meta: MetaData
): {
  cleanBodyText: string;
  headings: HeadingItem[];
  spaDiagnostic: SpaDiagnostic;
} {
  const spaCheck = detectSpaSignatures(html, $);
  const wordsInDom = currentBodyText ? currentBodyText.split(/\s+/).filter(Boolean).length : 0;

  // If DOM already has ample text (40+ words) and is not a thin shell, use DOM directly
  if (wordsInDom >= 40) {
    return {
      cleanBodyText: currentBodyText,
      headings: currentHeadings,
      spaDiagnostic: {
        isClientRenderedSpa: spaCheck.isSpa,
        frameworkDetected: spaCheck.framework,
        extractionMethod: 'DOM',
        spaWarning: spaCheck.isSpa
          ? `Pre-rendered ${spaCheck.framework || 'SPA'} markup verified. DOM contains sufficient server-rendered content.`
          : undefined,
      },
    };
  }

  // -------------------------------------------------------------------------
  // THIN DOM CONTENT DETECTED (< 40 words): Initiate Smart Fallback Cascade
  // -------------------------------------------------------------------------

  // 1. Try Next.js __NEXT_DATA__
  const nextData = extractNextData($);
  if (nextData && nextData.text.split(/\s+/).filter(Boolean).length >= 40) {
    const combinedHeadings = currentHeadings.length > 0 ? currentHeadings : nextData.headings;
    return {
      cleanBodyText: nextData.text,
      headings: combinedHeadings,
      spaDiagnostic: {
        isClientRenderedSpa: true,
        frameworkDetected: 'Next.js',
        extractionMethod: '__NEXT_DATA__',
        spaWarning:
          'Client-side rendered Next.js page detected. Initial DOM markup was minimal; full article and page content was reconstructed from preloaded state (__NEXT_DATA__).',
      },
    };
  }

  // 2. Try JSON-LD Schema (articleBody / description)
  const jsonLdData = extractJsonLdContent($);
  if (jsonLdData && jsonLdData.text.split(/\s+/).filter(Boolean).length >= 30) {
    const combinedHeadings = currentHeadings.length > 0 ? currentHeadings : jsonLdData.headings;
    return {
      cleanBodyText: jsonLdData.text,
      headings: combinedHeadings,
      spaDiagnostic: {
        isClientRenderedSpa: true,
        frameworkDetected: spaCheck.framework || 'React SPA',
        extractionMethod: 'JSON-LD Schema',
        spaWarning:
          'Single Page Application (SPA) detected with dynamic client-side rendering. Text was extracted from structured JSON-LD Schema markup.',
      },
    };
  }

  // 3. Fallback to Meta Description & Title
  const metaText = [meta.title, meta.description, meta.ogDescription].filter(Boolean).join('.\n');
  const metaWords = metaText.split(/\s+/).filter(Boolean).length;

  if (metaWords > wordsInDom) {
    return {
      cleanBodyText: metaText,
      headings: currentHeadings.length > 0 ? currentHeadings : meta.title ? [{ level: 'h1', text: meta.title, depth: 1 }] : [],
      spaDiagnostic: {
        isClientRenderedSpa: spaCheck.isSpa,
        frameworkDetected: spaCheck.framework || 'Generic SPA',
        extractionMethod: 'Meta Fallback',
        spaWarning: spaCheck.isSpa
          ? 'Client-side rendered SPA with no server-rendered markup or structured schema. Content fallback generated from OpenGraph and meta descriptions.'
          : 'Thin static page detected. Analysis supplemented with meta description tags.',
      },
    };
  }

  // Default return if no fallback could improve the text
  return {
    cleanBodyText: currentBodyText,
    headings: currentHeadings,
    spaDiagnostic: {
      isClientRenderedSpa: spaCheck.isSpa,
      frameworkDetected: spaCheck.framework,
      extractionMethod: 'DOM',
      spaWarning: spaCheck.isSpa
        ? 'Client-side rendered Single Page Application (SPA) detected. Standard crawlers see minimal initial HTML markup.'
        : undefined,
    },
  };
}
