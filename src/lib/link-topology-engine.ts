/**
 * Competitor Internal Linking Topology & Anchor Text Distribution Engine
 * Evaluates internal PageRank distribution, identifies destination hubs,
 * categorizes anchors across 5 SEO tiers, and calculates anchor health scores.
 */

import { LinkItem, SinglePageAudit } from '@/types/seo';

export type DetailedAnchorCategory =
  | 'exact-match'
  | 'partial-match'
  | 'branded'
  | 'generic'
  | 'naked-url';

export interface DetailedLinkItem extends LinkItem {
  detailedAnchorCategory: DetailedAnchorCategory;
  cleanDestinationPath: string;
}

export interface InternalTargetHub {
  targetUrl: string;
  cleanPath: string;
  linkCount: number;
  uniqueAnchors: string[];
  topAnchor: string;
  isNofollowCount: number;
  pctOfTotalInternal: number;
}

export interface AnchorDiversityBreakdown {
  exactCount: number;
  exactPct: number;
  partialCount: number;
  partialPct: number;
  brandedCount: number;
  brandedPct: number;
  genericCount: number;
  genericPct: number;
  nakedCount: number;
  nakedPct: number;
}

export interface AnchorHealthScore {
  score: number; // 0 - 100
  ratingLabel: string;
  ratingColor: 'emerald' | 'amber' | 'rose';
  isOverOptimized: boolean;
  issues: string[];
  recommendations: string[];
}

export interface CompetitorLinkBenchmark {
  url: string;
  host: string;
  totalInternalLinks: number;
  totalExternalLinks: number;
  uniqueInternalHubs: number;
  internalLinkDensity: number; // links per 1,000 words
  internalExternalRatio: string;
  followPct: number;
  topAnchors: string[];
}

export interface LinkTopologyAnalysisResult {
  sourceUrl: string;
  totalLinks: number;
  internalCount: number;
  externalCount: number;
  internalDensityPer1kWords: number;
  targetHubs: InternalTargetHub[];
  anchorBreakdown: AnchorDiversityBreakdown;
  healthScore: AnchorHealthScore;
  detailedLinks: DetailedLinkItem[];
  competitorBenchmarks: CompetitorLinkBenchmark[];
  anchorGaps: string[];
}

const GENERIC_ANCHOR_PATTERNS = [
  'click here',
  'read more',
  'learn more',
  'here',
  'website',
  'source',
  'this article',
  'this guide',
  'this link',
  'link',
  'visit site',
  'continue reading',
  'view more',
  'details',
  'more info',
  'check this out',
  'find out more',
  'homepage',
  'page',
  'see more',
];

function extractBrandName(hostname: string): string {
  const clean = hostname.replace(/^(?:www|m|blog|app|shop)\./i, '');
  const parts = clean.split('.');
  return parts[0]?.toLowerCase() || '';
}

/**
 * Normalizes URL path to clean hub identifier (strips query parameters, hashes, trailing slashes)
 */
export function extractCleanPath(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    let path = parsed.pathname;
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path || '/';
  } catch {
    return urlStr;
  }
}

/**
 * Classifies an anchor text into 5 SEO tiers:
 * Exact Match, Partial Match, Branded, Generic, or Naked URL
 */
export function classifyDetailedAnchor(
  text: string,
  href: string,
  sourceUrl: string,
  targetKeyword: string = ''
): DetailedAnchorCategory {
  const cleanText = text.toLowerCase().trim();
  const cleanKw = targetKeyword.toLowerCase().trim();

  // 1. Naked URL check (anchor text looks like a URL or matches href)
  if (
    cleanText.startsWith('http://') ||
    cleanText.startsWith('https://') ||
    cleanText.startsWith('www.') ||
    cleanText.includes('.com') ||
    cleanText.includes('.org') ||
    cleanText.includes('.io') ||
    cleanText === href.toLowerCase().trim()
  ) {
    return 'naked-url';
  }

  // 2. Generic / CTA check
  if (
    cleanText.length <= 1 ||
    GENERIC_ANCHOR_PATTERNS.some((pattern) => cleanText === pattern || cleanText.startsWith(pattern + ' ') || cleanText.endsWith(' ' + pattern))
  ) {
    return 'generic';
  }

  // 3. Exact Match check (if target keyword is provided)
  if (cleanKw.length > 2 && cleanText === cleanKw) {
    return 'exact-match';
  }

  // 4. Branded check
  let sourceBrand = '';
  let targetBrand = '';
  try {
    sourceBrand = extractBrandName(new URL(sourceUrl).hostname);
  } catch {}
  try {
    targetBrand = extractBrandName(new URL(href).hostname);
  } catch {}

  if (sourceBrand.length >= 3 && cleanText.includes(sourceBrand)) {
    return 'branded';
  }
  if (targetBrand.length >= 3 && cleanText.includes(targetBrand)) {
    return 'branded';
  }

  // 5. Partial Match check (contains target keyword words or key terms)
  if (cleanKw.length > 2) {
    const kwTokens = cleanKw.split(/\s+/).filter((t) => t.length > 2);
    const hasAnyKwToken = kwTokens.some((token) => cleanText.includes(token));
    if (hasAnyKwToken || cleanText.includes(cleanKw)) {
      return 'partial-match';
    }
  }

  // If text has descriptive words (> 2 words), treat as partial / descriptive match
  if (cleanText.split(/\s+/).length >= 2) {
    return 'partial-match';
  }

  return 'generic';
}

/**
 * Computes anchor diversity health score (0 - 100) and flags over-optimization risks
 */
export function calculateAnchorHealthScore(
  breakdown: AnchorDiversityBreakdown,
  internalCount: number
): AnchorHealthScore {
  let score = 85; // Baseline healthy score
  const issues: string[] = [];
  const recommendations: string[] = [];
  let isOverOptimized = false;

  if (internalCount === 0) {
    return {
      score: 30,
      ratingLabel: 'No Internal Links',
      ratingColor: 'rose',
      isOverOptimized: false,
      issues: ['The page has zero internal links pointing to related cluster pages.'],
      recommendations: ['Add 3–8 contextual internal links to relevant guides or product hubs.'],
    };
  }

  // Check 1: Excessive Exact Match Anchor Text (> 35% risk of Google Penguin/Spam penalty)
  if (breakdown.exactPct > 35) {
    isOverOptimized = true;
    score -= 35;
    issues.push(`Exact Match anchor percentage is dangerously high (${breakdown.exactPct}%). Google algorithms flag >35% as unnatural.`);
    recommendations.push('Diversify exact match anchors with partial descriptive phrases and natural sentence flow.');
  } else if (breakdown.exactPct > 20) {
    score -= 10;
    issues.push(`Exact Match anchors are slightly elevated (${breakdown.exactPct}%).`);
    recommendations.push('Aim to keep exact match anchors between 10% and 18% of total internal links.');
  }

  // Check 2: Too many generic anchors (> 25% "click here", "read more")
  if (breakdown.genericPct > 25) {
    score -= 20;
    issues.push(`Generic non-descriptive anchors make up ${breakdown.genericPct}% of your internal links.`);
    recommendations.push('Replace generic anchors like "read more" or "click here" with topical keywords describing the destination page.');
  } else if (breakdown.genericPct > 15) {
    score -= 8;
    issues.push(`Generic anchors are moderately high (${breakdown.genericPct}%).`);
  }

  // Check 3: Healthy Partial Match presence (40–70% is optimal)
  if (breakdown.partialPct >= 40 && breakdown.partialPct <= 75) {
    score += 10;
  } else if (breakdown.partialPct < 25) {
    score -= 12;
    issues.push(`Low partial match / descriptive anchors (${breakdown.partialPct}%).`);
    recommendations.push('Use more long-tail descriptive anchor phrases to build topical relevance.');
  }

  // Check 4: Naked URLs
  if (breakdown.nakedPct > 15) {
    score -= 10;
    issues.push(`Naked raw URLs detected (${breakdown.nakedPct}%).`);
    recommendations.push('Hyperlink descriptive text instead of pasting raw URLs directly in the body.');
  }

  score = Math.max(15, Math.min(100, score));

  let ratingLabel = 'Natural & Balanced';
  let ratingColor: AnchorHealthScore['ratingColor'] = 'emerald';

  if (isOverOptimized || score < 50) {
    ratingLabel = 'Over-Optimized Risk';
    ratingColor = 'rose';
  } else if (score < 75) {
    ratingLabel = 'Needs Anchor Diversity';
    ratingColor = 'amber';
  } else {
    ratingLabel = 'Natural & Search-Engine Ready';
    ratingColor = 'emerald';
  }

  if (recommendations.length === 0) {
    recommendations.push('Your internal anchor distribution adheres to Google Search Central quality benchmarks.');
  }

  return {
    score,
    ratingLabel,
    ratingColor,
    isOverOptimized,
    issues,
    recommendations,
  };
}

/**
 * Analyzes internal links, groups destination hubs, and calculates topology metrics
 */
export function analyzeLinkTopology(
  links: LinkItem[],
  sourceUrl: string,
  wordCount: number,
  targetKeyword: string = '',
  competitorResults: SinglePageAudit[] = []
): LinkTopologyAnalysisResult {
  const internalLinks = links.filter((l) => !l.isExternal);
  const externalLinks = links.filter((l) => l.isExternal);
  const internalCount = internalLinks.length;
  const externalCount = externalLinks.length;
  const totalLinks = links.length;

  // Internal link density: links per 1,000 words
  const effectiveWords = Math.max(1, wordCount);
  const internalDensityPer1kWords = Math.round((internalCount / (effectiveWords / 1000)) * 10) / 10;

  // Detailed Classification
  let exactCount = 0;
  let partialCount = 0;
  let brandedCount = 0;
  let genericCount = 0;
  let nakedCount = 0;

  const detailedLinks: DetailedLinkItem[] = internalLinks.map((l) => {
    const category = classifyDetailedAnchor(l.text, l.href, sourceUrl, targetKeyword);
    if (category === 'exact-match') exactCount++;
    else if (category === 'partial-match') partialCount++;
    else if (category === 'branded') brandedCount++;
    else if (category === 'generic') genericCount++;
    else if (category === 'naked-url') nakedCount++;

    return {
      ...l,
      detailedAnchorCategory: category,
      cleanDestinationPath: extractCleanPath(l.href),
    };
  });

  const anchorBreakdown: AnchorDiversityBreakdown = {
    exactCount,
    exactPct: internalCount > 0 ? Math.round((exactCount / internalCount) * 100) : 0,
    partialCount,
    partialPct: internalCount > 0 ? Math.round((partialCount / internalCount) * 100) : 0,
    brandedCount,
    brandedPct: internalCount > 0 ? Math.round((brandedCount / internalCount) * 100) : 0,
    genericCount,
    genericPct: internalCount > 0 ? Math.round((genericCount / internalCount) * 100) : 0,
    nakedCount,
    nakedPct: internalCount > 0 ? Math.round((nakedCount / internalCount) * 100) : 0,
  };

  // Group into Destination Hubs
  const hubMap = new Map<
    string,
    {
      targetUrl: string;
      cleanPath: string;
      linkCount: number;
      uniqueAnchors: Set<string>;
      isNofollowCount: number;
    }
  >();

  for (const l of detailedLinks) {
    const key = l.cleanDestinationPath;
    const existing = hubMap.get(key);
    if (!existing) {
      hubMap.set(key, {
        targetUrl: l.href,
        cleanPath: key,
        linkCount: 1,
        uniqueAnchors: new Set([l.text.trim() || '(blank)']),
        isNofollowCount: l.isNofollow ? 1 : 0,
      });
    } else {
      existing.linkCount++;
      if (l.text.trim()) existing.uniqueAnchors.add(l.text.trim());
      if (l.isNofollow) existing.isNofollowCount++;
    }
  }

  const targetHubs: InternalTargetHub[] = Array.from(hubMap.values())
    .map((h) => {
      const anchorsArr = Array.from(h.uniqueAnchors);
      return {
        targetUrl: h.targetUrl,
        cleanPath: h.cleanPath,
        linkCount: h.linkCount,
        uniqueAnchors: anchorsArr,
        topAnchor: anchorsArr[0] || '(none)',
        isNofollowCount: h.isNofollowCount,
        pctOfTotalInternal:
          internalCount > 0 ? Math.round((h.linkCount / internalCount) * 100) : 0,
      };
    })
    .sort((a, b) => b.linkCount - a.linkCount);

  // Anchor health calculation
  const healthScore = calculateAnchorHealthScore(anchorBreakdown, internalCount);

  // Competitor benchmarks
  const competitorBenchmarks = compareCompetitorLinkTopologies(
    competitorResults,
    targetKeyword
  );

  // Discover Anchor Gaps (descriptive anchors used repeatedly across competitors that our page lacks)
  const ourAnchorsSet = new Set(internalLinks.map((l) => l.text.toLowerCase().trim()));
  const gapFreq = new Map<string, number>();

  for (const comp of competitorResults) {
    if (comp.url === sourceUrl) continue;
    const compLinks = (comp.linkAudit?.links || []).filter((l) => !l.isExternal);
    for (const cl of compLinks) {
      const clean = cl.text.toLowerCase().trim();
      if (
        clean.length > 3 &&
        clean.split(/\s+/).length >= 2 &&
        !GENERIC_ANCHOR_PATTERNS.includes(clean) &&
        !ourAnchorsSet.has(clean)
      ) {
        gapFreq.set(clean, (gapFreq.get(clean) || 0) + 1);
      }
    }
  }

  const anchorGaps = Array.from(gapFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([anchor]) => anchor);

  return {
    sourceUrl,
    totalLinks,
    internalCount,
    externalCount,
    internalDensityPer1kWords,
    targetHubs,
    anchorBreakdown,
    healthScore,
    detailedLinks,
    competitorBenchmarks,
    anchorGaps,
  };
}

/**
 * Builds side-by-side competitor link benchmark table
 */
export function compareCompetitorLinkTopologies(
  results: SinglePageAudit[],
  targetKeyword: string = ''
): CompetitorLinkBenchmark[] {
  return (results || [])
    .filter((r) => r.status === 'success')
    .map((r) => {
      let host = 'Competitor';
      try {
        host = new URL(r.url).hostname.replace(/^www\./, '');
      } catch {}

      const allLinks = r.linkAudit?.links || [];
      const internal = allLinks.filter((l) => !l.isExternal);
      const external = allLinks.filter((l) => l.isExternal);

      const words = Math.max(1, r.wordCount || 1);
      const density = Math.round((internal.length / (words / 1000)) * 10) / 10;

      // Unique hubs
      const hubs = new Set(internal.map((l) => extractCleanPath(l.href)));

      // Follow %
      const followCount = internal.filter((l) => !l.isNofollow).length;
      const followPct = internal.length > 0 ? Math.round((followCount / internal.length) * 100) : 100;

      // Top Anchors
      const anchorCounts = new Map<string, number>();
      internal.forEach((l) => {
        const t = l.text.trim();
        if (t.length > 2 && !GENERIC_ANCHOR_PATTERNS.includes(t.toLowerCase())) {
          anchorCounts.set(t, (anchorCounts.get(t) || 0) + 1);
        }
      });

      const topAnchors = Array.from(anchorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([t]) => t);

      const total = internal.length + external.length;
      const intRatioPct = total > 0 ? Math.round((internal.length / total) * 100) : 0;
      const extRatioPct = total > 0 ? Math.round((external.length / total) * 100) : 0;

      return {
        url: r.url,
        host,
        totalInternalLinks: internal.length,
        totalExternalLinks: external.length,
        uniqueInternalHubs: hubs.size,
        internalLinkDensity: density,
        internalExternalRatio: `${intRatioPct}% : ${extRatioPct}%`,
        followPct,
        topAnchors,
      };
    });
}
