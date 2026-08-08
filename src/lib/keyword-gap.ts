import { SinglePageAudit, KeywordGapAnalysis, KeywordGapItem, KeywordItem } from '@/types/seo';

/**
 * Calculates Keyword Gap and Topic Overlap analysis across 2 to 5 competitor URLs.
 * Identifies specific gaps missing on "Your Page" (targetUrl, defaults to URL #1).
 */
export function analyzeKeywordGaps(
  results: SinglePageAudit[],
  targetUrl?: string
): KeywordGapAnalysis {
  const validAudits = results.filter((r) => r.status === 'success');
  if (validAudits.length < 2) {
    return {
      totalUniqueKeywords: 0,
      targetPageUrl: targetUrl || '',
      yourPageMissingGaps: [],
      commonCoreKeywords: [],
      keywordGaps: [],
      allItems: [],
    };
  }

  const urls = validAudits.map((a) => a.url);
  const primaryTargetUrl = targetUrl || urls[0];

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
    const { keywords } = audit;
    processGramList(keywords.fullOneGram ?? keywords.oneGram, audit.url, '1-gram');
    processGramList(keywords.fullTwoGram ?? keywords.twoGram, audit.url, '2-gram');
    processGramList(keywords.fullThreeGram ?? keywords.threeGram, audit.url, '3-gram');
  });

  const allItems: KeywordGapItem[] = [];
  const commonCoreKeywords: KeywordGapItem[] = [];
  const keywordGaps: KeywordGapItem[] = [];
  const yourPageMissingGaps: KeywordGapItem[] = [];

  gapMap.forEach((entry) => {
    const missingInUrls: string[] = [];
    let presentCount = 0;
    let maxDensity = 0;
    let competitorTotalDensity = 0;
    let competitorCount = 0;
    let topCompetitorUrl = urls[0];

    urls.forEach((u) => {
      const data = entry.presenceMap[u];
      if (data && data.density > 0) {
        presentCount++;
        if (data.density > maxDensity) {
          maxDensity = data.density;
          topCompetitorUrl = u;
        }
        if (u !== primaryTargetUrl) {
          competitorTotalDensity += data.density;
          competitorCount++;
        }
      } else {
        missingInUrls.push(u);
      }
    });

    const isCommonCore =
      presentCount === urls.length ||
      (urls.length >= 3 && presentCount / urls.length >= 0.7);

    const targetData = entry.presenceMap[primaryTargetUrl] || { count: 0, density: 0 };
    const targetPageDensity = targetData.density;
    const targetPageCount = targetData.count;

    const gapThreshold =
      entry.nGramType === '1-gram'
        ? 0.6
        : entry.nGramType === '2-gram'
        ? 0.25
        : 0.12;

    const isTargetPageMissing = targetPageDensity === 0 && maxDensity >= gapThreshold;
    const avgCompetitorDensity = competitorCount > 0 ? competitorTotalDensity / competitorCount : 0;
    const isTargetPageUnderOptimized =
      targetPageDensity > 0 &&
      avgCompetitorDensity >= targetPageDensity * 1.5 &&
      avgCompetitorDensity >= gapThreshold;

    const gapItem: KeywordGapItem = {
      phrase: entry.phrase,
      nGramType: entry.nGramType,
      presenceMap: entry.presenceMap,
      isCommonCore,
      missingInUrls,
      maxDensity,
      topCompetitorUrl,
      targetPageDensity,
      targetPageCount,
      isTargetPageMissing,
      isTargetPageUnderOptimized,
    };

    allItems.push(gapItem);

    if (isCommonCore) {
      commonCoreKeywords.push(gapItem);
    }

    if (missingInUrls.length > 0 && maxDensity >= gapThreshold) {
      keywordGaps.push(gapItem);
    }

    if (isTargetPageMissing || isTargetPageUnderOptimized) {
      yourPageMissingGaps.push(gapItem);
    }
  });

  // Sort common core keywords by max density descending
  commonCoreKeywords.sort((a, b) => b.maxDensity - a.maxDensity);

  // Sort keyword gaps by max density descending
  keywordGaps.sort((a, b) => b.maxDensity - a.maxDensity);

  // Sort your page missing gaps by max density descending
  yourPageMissingGaps.sort((a, b) => b.maxDensity - a.maxDensity);

  // Sort all items by max density
  allItems.sort((a, b) => b.maxDensity - a.maxDensity);

  return {
    totalUniqueKeywords: allItems.length,
    targetPageUrl: primaryTargetUrl,
    yourPageMissingGaps,
    commonCoreKeywords,
    keywordGaps,
    allItems,
  };
}
