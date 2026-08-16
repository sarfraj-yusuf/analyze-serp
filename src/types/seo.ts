export interface MetaData {
  title: string;
  titleLength: number;
  titlePixelEstimate: number;
  titleTruncated: boolean;
  description: string;
  descriptionLength: number;
  descriptionTruncated: boolean;
  canonicalUrl: string | null;
  robotsDirective: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  hasJsonLdSchema: boolean;
}

export interface HeadingItem {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  text: string;
  depth: number;
}

export interface ImageItem {
  src: string;
  alt: string;
  hasAlt: boolean;
  isWebpOrSvg: boolean;
}

export interface ImageAudit {
  totalImages: number;
  missingAltCount: number;
  webpOrSvgCount: number;
  imageList: ImageItem[];
}

export type AnchorCategory = 'Keyword-Rich' | 'Branded' | 'Generic';

export interface LinkItem {
  href: string;
  text: string;
  isExternal: boolean;
  isNofollow: boolean;
  anchorCategory: AnchorCategory;
  isAffiliate: boolean;
  affiliateNetwork?: string | null;
}

export interface LinkAudit {
  totalLinks: number;
  internalCount: number;
  externalCount: number;
  nofollowCount: number;
  affiliateCount: number;
  anchorBreakdown: {
    keywordRichCount: number;
    brandedCount: number;
    genericCount: number;
  };
  affiliateNetworksDetected: string[];
  links: LinkItem[];
}

export interface KeywordItem {
  phrase: string;
  count: number;
  density: number;
  isStuffing: boolean; // density > 3.0%
}

export interface KeywordAnalysis {
  oneGram: KeywordItem[];
  twoGram: KeywordItem[];
  threeGram: KeywordItem[];
  // Full un-truncated keyword arrays used internally by keyword-gap analysis.
  // These are NOT sent to the UI — they exist only for accurate cross-page comparison.
  fullOneGram?: KeywordItem[];
  fullTwoGram?: KeywordItem[];
  fullThreeGram?: KeywordItem[];
}

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschGradeLevel: number;
  gradeLabel: string;
  toneLabel: 'Conversational' | 'Informative' | 'Technical' | 'Academic / Academic Paper';
  totalSentences: number;
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
  complexWordsCount: number;
  complexWordsPercentage: number;
}

export interface TechnicalAudit {
  ttfbMs: number;
  totalDownloadTimeMs: number;
  htmlSizeKb: number;
  domNodeCount: number;
  maxDomDepth: number;
  inlineScriptCount: number;
  inlineScriptSizeKb: number;
  inlineStyleCount: number;
  inlineStyleSizeKb: number;
  externalScriptCount: number;
  externalStyleCount: number;
  hasViewportMeta: boolean;
  hasHttps: boolean;
  hasCharsetMeta: boolean;
  technicalScore: number; // 0 - 100
  technicalGrade: 'Fast & Optimized' | 'Moderate Overhead' | 'Heavy & Unoptimized';
  warnings: string[];
}

export interface RobotsValidationResult {
  status: 'ALLOWED' | 'BLOCKED' | 'NO_ROBOTS_TXT';
  robotsUrl: string;
  matchedRule?: string; // e.g., "Disallow: /admin/"
  sitemaps: string[];
  userAgentsFound: string[];
}

export interface TopicalEntity {
  name: string;
  category: 'BRAND' | 'TECHNICAL_TERM' | 'TOPIC_CONCEPT' | 'LOCATION';
  count: number;
  densityPercent: number;
}

export interface SearchIntentData {
  primaryIntent: 'INFORMATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL' | 'NAVIGATIONAL';
  confidencePercent: number; // 0 - 100
  intentSignalsFound: string[];
  topicalEntities: TopicalEntity[];
  recommendations: string[];
}

export interface SinglePageAudit {
  url: string;
  fetchTimeMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
  meta: MetaData;
  headings: HeadingItem[];
  imageAudit: ImageAudit;
  linkAudit: LinkAudit;
  keywords: KeywordAnalysis;
  readability: ReadabilityMetrics;
  technicalAudit: TechnicalAudit;
  robotsValidation?: RobotsValidationResult;
  searchIntent?: SearchIntentData;
}

export interface KeywordGapItem {
  phrase: string;
  nGramType: '1-gram' | '2-gram' | '3-gram';
  presenceMap: { [url: string]: { count: number; density: number } };
  isCommonCore: boolean; // Present across all/most competitors
  missingInUrls: string[]; // Competitor URLs lacking this phrase
  maxDensity: number;
  topCompetitorUrl: string;
  targetPageDensity?: number;
  targetPageCount?: number;
  isTargetPageMissing?: boolean; // Present in 1+ competitors, but 0 on Your Page
  isTargetPageUnderOptimized?: boolean; // Present on Your Page, but competitor avg is 1.5x+ higher
}

export interface KeywordGapAnalysis {
  totalUniqueKeywords: number;
  targetPageUrl?: string;
  yourPageMissingGaps?: KeywordGapItem[];
  commonCoreKeywords: KeywordGapItem[];
  keywordGaps: KeywordGapItem[];
  allItems: KeywordGapItem[];
}

export interface BatchAuditResponse {
  timestamp: string;
  totalUrls: number;
  results: SinglePageAudit[];
}

export type OpportunityLevel = 'High' | 'Medium' | 'Low';

export interface SerpConsensusPattern {
  frequencyRatio: string; // e.g. "5/5", "4/5", "3/5"
  frequencyPercent: number; // e.g. 100, 80, 60
  patternType: 'TOPIC' | 'QUESTION' | 'STRUCTURE' | 'SCHEMA' | 'INTENT';
  title: string;
  description: string;
  isPresentOnTarget: boolean;
}

export interface EvidenceRecommendation {
  id: string;
  title: string;
  action: string;
  evidence: string; // e.g. "4/5 ranking pages cover this subtopic"
  isMissing: boolean;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  quadrant: 'DO_FIRST' | 'PLAN_THIS' | 'DO_NEXT' | 'OPTIONAL';
  category: 'TOPIC' | 'QUESTION' | 'STRUCTURE' | 'INTENT' | 'SCHEMA' | 'ONPAGE' | 'TECH';
}

export interface SerpAlignmentReport {
  alignmentScore: number; // 0 - 100 (Higher = Closer to SERP consensus)
  opportunityCount: number; // e.g. 7 meaningful opportunities found
  verdictHeadline: string;
  verdictSubtext: string;
  highImpactCount: number;
  improvementsCount: number;
  strengthsCount: number;
  targetUrl: string;
  targetKeyword?: string;
  top3Opportunities: {
    title: string;
    category: string;
    evidenceText: string;
  }[];
  serpConsensusPatterns: SerpConsensusPattern[];
  technicalHygiene: {
    isCrawlable: boolean;
    isIndexable: boolean;
    hasHttps: boolean;
    hasCanonicalMatch: boolean;
    issues: string[];
  };
  evidenceActions: EvidenceRecommendation[];
  dontTouchStrengths: {
    title: string;
    reason: string;
  }[];
}

