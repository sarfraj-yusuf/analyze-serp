import { STOP_WORDS } from './stopwords';
import { KeywordAnalysis, KeywordItem, SinglePageAudit } from '@/types/seo';
import { ScrapedRawDOM } from './scraper';
import { calculateReadability } from './readability';
import { analyzeTechnicalHealth } from './technical-audit';

/**
 * Calculates keyword frequency & density for 1-gram, 2-gram, and 3-gram phrases
 */
/**
 * Calculates keyword frequency & density for 1-gram, 2-gram, and 3-gram phrases
 * operating strictly within sentence boundaries to prevent cross-sentence N-gram bleeding.
 */
function calculateNGrams(
  sentenceTokens: string[][],
  n: number,
  totalWordCount: number,
  maxResults: number = 15
): KeywordItem[] {
  if (sentenceTokens.length === 0 || totalWordCount === 0) return [];

  const frequencyMap = new Map<string, number>();

  for (const words of sentenceTokens) {
    if (words.length < n) continue;

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

      // 2-Gram rules (n = 2):
      // Must contain at least ONE non-stopword of length > 1.
      // Cannot be composed entirely of stopwords (e.g. reject "is a", "and the", "in of").
      if (n === 2) {
        const [w1, w2] = ngramTokens;
        const isW1Stop = STOP_WORDS.has(w1) || w1.length <= 1 || /^\d+$/.test(w1);
        const isW2Stop = STOP_WORDS.has(w2) || w2.length <= 1 || /^\d+$/.test(w2);

        // If BOTH words are stopwords/noise, skip
        if (isW1Stop && isW2Stop) continue;

        // Ensure neither token is single char or purely numeric noise
        if (w1.length <= 1 || w2.length <= 1 || (/^\d+$/.test(w1) && /^\d+$/.test(w2))) {
          continue;
        }

        const phrase = ngramTokens.join(' ');
        frequencyMap.set(phrase, (frequencyMap.get(phrase) || 0) + 1);
        continue;
      }

      // 3-Gram rules (n = 3):
      // Must contain at least TWO non-stopword tokens of length > 1.
      const nonStopTokens = ngramTokens.filter((token) => !STOP_WORDS.has(token) && token.length > 1 && !/^\d+$/.test(token));
      if (nonStopTokens.length < 2) continue;

      const phrase = ngramTokens.join(' ');
      frequencyMap.set(phrase, (frequencyMap.get(phrase) || 0) + 1);
    }
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
  const { url, finalUrl, fetchTimeMs, ttfbMs, html, meta, headings, imageAudit, linkAudit, cleanBodyText, cheerioDom } = scrapedData;

  // Segment cleanBodyText into sentences first to prevent cross-sentence N-gram bleeding
  const rawSentences = cleanBodyText.split(/[.!?\n\r]+\s*/).filter((s) => s.trim().length > 0);

  // Tokenize each sentence independently
  const sentenceTokens: string[][] = rawSentences
    .map((sentence) =>
      sentence
        .toLowerCase()
        .replace(/[''ʼ`]/g, '')
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 0)
    )
    .filter((tokens) => tokens.length > 0);

  const allTokens = sentenceTokens.flat();
  const wordCount = allTokens.length;
  const characterCount = cleanBodyText.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Compute truncated N-grams for UI display (capped at top 20/15/10)
  const oneGram = calculateNGrams(sentenceTokens, 1, wordCount, 20);
  const twoGram = calculateNGrams(sentenceTokens, 2, wordCount, 15);
  const threeGram = calculateNGrams(sentenceTokens, 3, wordCount, 10);

  // Compute full un-truncated N-grams for keyword-gap cross-comparison
  const fullOneGram = calculateNGrams(sentenceTokens, 1, wordCount, 500);
  const fullTwoGram = calculateNGrams(sentenceTokens, 2, wordCount, 500);
  const fullThreeGram = calculateNGrams(sentenceTokens, 3, wordCount, 500);

  const keywords: KeywordAnalysis = {
    oneGram,
    twoGram,
    threeGram,
    fullOneGram,
    fullTwoGram,
    fullThreeGram,
  };

  // Compute Readability & Tone Metrics
  const readability = calculateReadability(cleanBodyText);

  // Compute Performance & Technical Health Audit
  const technicalAudit = analyzeTechnicalHealth(html, fetchTimeMs, ttfbMs, finalUrl || url, cheerioDom);

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
