import { STOP_WORDS } from './stopwords';
import { KeywordAnalysis, KeywordItem, SinglePageAudit } from '@/types/seo';
import { ScrapedRawDOM } from './scraper';
import { calculateReadability } from './readability';
import { analyzeTechnicalHealth } from './technical-audit';

/**
 * Calculates keyword frequency & density for 1-gram, 2-gram, and 3-gram phrases
 */
function calculateNGrams(
  words: string[],
  n: number,
  totalWordCount: number,
  maxResults: number = 15
): KeywordItem[] {
  if (words.length < n || totalWordCount === 0) return [];

  const frequencyMap = new Map<string, number>();

  for (let i = 0; i <= words.length - n; i++) {
    const ngramTokens = words.slice(i, i + n);

    // 1-Gram rules: must not be a stop-word, must be length > 1, not purely numeric
    if (n === 1) {
      const token = ngramTokens[0];
      if (STOP_WORDS.has(token) || token.length <= 1 || /^\d+$/.test(token)) {
        continue;
      }
      frequencyMap.set(token, (frequencyMap.get(token) || 0) + 1);
      continue;
    }

    // 2-Gram & 3-Gram rules:
    // First and last word in N-gram must be a non-stop word
    const firstWord = ngramTokens[0];
    const lastWord = ngramTokens[ngramTokens.length - 1];

    if (
      STOP_WORDS.has(firstWord) ||
      STOP_WORDS.has(lastWord) ||
      firstWord.length <= 1 ||
      lastWord.length <= 1 ||
      /^\d+$/.test(firstWord) ||
      /^\d+$/.test(lastWord)
    ) {
      continue;
    }

    // Ensure at least one token is non-stop
    const nonStopTokens = ngramTokens.filter((token) => !STOP_WORDS.has(token) && token.length > 1);
    if (nonStopTokens.length < Math.ceil(n / 2)) continue;

    const phrase = ngramTokens.join(' ');
    frequencyMap.set(phrase, (frequencyMap.get(phrase) || 0) + 1);
  }

  // Sort by frequency descending
  const sorted = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults);

  return sorted.map(([phrase, count]) => {
    const density = parseFloat(((count / totalWordCount) * 100).toFixed(2));
    return {
      phrase,
      count,
      density,
      isStuffing: density > 3.0, // Keyword stuffing alert threshold (> 3.0%)
    };
  });
}

/**
 * Main Analyzer function: processes clean DOM text into comprehensive SEO audit metrics
 */
export function analyzePage(scrapedData: ScrapedRawDOM): SinglePageAudit {
  const { url, fetchTimeMs, ttfbMs, html, meta, headings, imageAudit, linkAudit, cleanBodyText, cheerioDom } = scrapedData;

  // Tokenize clean text into lowercase words (alphanumeric + hyphens)
  const tokens = cleanBodyText
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0);

  const wordCount = tokens.length;
  const characterCount = cleanBodyText.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Compute 1-gram, 2-gram, and 3-gram frequencies
  const oneGram = calculateNGrams(tokens, 1, wordCount, 20);
  const twoGram = calculateNGrams(tokens, 2, wordCount, 15);
  const threeGram = calculateNGrams(tokens, 3, wordCount, 10);

  const keywords: KeywordAnalysis = {
    oneGram,
    twoGram,
    threeGram,
  };

  // Compute Readability & Tone Metrics
  const readability = calculateReadability(cleanBodyText);

  // Compute Performance & Technical Health Audit
  const technicalAudit = analyzeTechnicalHealth(html, fetchTimeMs, ttfbMs, url, cheerioDom);

  return {
    url,
    fetchTimeMs,
    status: 'success',
    wordCount,
    characterCount,
    readingTimeMinutes,
    meta,
    headings,
    imageAudit,
    linkAudit,
    keywords,
    readability,
    technicalAudit,
  };
}
