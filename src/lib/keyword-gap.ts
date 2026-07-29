import { SinglePageAudit, KeywordGapAnalysis, KeywordGapItem, KeywordItem } from '@/types/seo';

/**
 * Calculates Keyword Gap and Topic Overlap analysis across 2 to 5 competitor URLs
 */
export function analyzeKeywordGaps(results: SinglePageAudit[]): KeywordGapAnalysis {
  const validAudits = results.filter((r) => r.status === 'success');
  if (validAudits.length < 2) {
    return {
      totalUniqueKeywords: 0,
      commonCoreKeywords: [],
      keywordGaps: [],
      allItems: [],
    };
  }

  const urls = validAudits.map((a) => a.url);

  // Map to hold aggregated keyword metrics across all URLs
  const gapMap = new Map<
    string,
    {
      phrase: string;
      nGramType: '1-gram' | '2-gram' | '3-gram';
      presenceMap: { [url: string]: { count: number; density: number } };
    }
  >();

  const processGramList = (
    items: KeywordItem[],
    auditUrl: string,
    type: '1-gram' | '2-gram' | '3-gram'
  ) => {
    items.forEach((item) => {
      const key = item.phrase.toLowerCase();
      if (!gapMap.has(key)) {
        const presenceMap: { [url: string]: { count: number; density: number } } = {};
        urls.forEach((u) => {
          presenceMap[u] = { count: 0, density: 0 };
        });
        gapMap.set(key, { phrase: item.phrase, nGramType: type, presenceMap });
      }

      const existing = gapMap.get(key)!;
      existing.presenceMap[auditUrl] = {
        count: item.count,
        density: item.density,
      };
    });
  };

  validAudits.forEach((audit) => {
    processGramList(audit.keywords.oneGram, audit.url, '1-gram');
    processGramList(audit.keywords.twoGram, audit.url, '2-gram');
    processGramList(audit.keywords.threeGram, audit.url, '3-gram');
  });

  const allItems: KeywordGapItem[] = [];
  const commonCoreKeywords: KeywordGapItem[] = [];
  const keywordGaps: KeywordGapItem[] = [];

  gapMap.forEach((entry) => {
    const missingInUrls: string[] = [];
    let presentCount = 0;
    let maxDensity = 0;
    let topCompetitorUrl = urls[0];

    urls.forEach((u) => {
      const data = entry.presenceMap[u];
      if (data && data.density > 0) {
        presentCount++;
        if (data.density > maxDensity) {
          maxDensity = data.density;
          topCompetitorUrl = u;
        }
      } else {
        missingInUrls.push(u);
      }
    });

    const isCommonCore = presentCount === urls.length || (urls.length >= 3 && presentCount / urls.length >= 0.7);

    const gapItem: KeywordGapItem = {
      phrase: entry.phrase,
      nGramType: entry.nGramType,
      presenceMap: entry.presenceMap,
      isCommonCore,
      missingInUrls,
      maxDensity,
      topCompetitorUrl,
    };

    allItems.push(gapItem);

    if (isCommonCore) {
      commonCoreKeywords.push(gapItem);
    }

    // A term is a "Keyword Gap" if at least 1 competitor uses it with high density (>= 0.8%) but at least 1 competitor missed it
    if (missingInUrls.length > 0 && maxDensity >= 0.8) {
      keywordGaps.push(gapItem);
    }
  });

  // Sort common core keywords by average density descending
  commonCoreKeywords.sort((a, b) => b.maxDensity - a.maxDensity);

  // Sort keyword gaps by max density descending
  keywordGaps.sort((a, b) => b.maxDensity - a.maxDensity);

  // Sort all items by max density
  allItems.sort((a, b) => b.maxDensity - a.maxDensity);

  return {
    totalUniqueKeywords: allItems.length,
    commonCoreKeywords,
    keywordGaps,
    allItems,
  };
}
