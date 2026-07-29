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
}

export interface KeywordGapItem {
  phrase: string;
  nGramType: '1-gram' | '2-gram' | '3-gram';
  presenceMap: { [url: string]: { count: number; density: number } };
  isCommonCore: boolean; // Present across all/most competitors
  missingInUrls: string[]; // Competitor URLs lacking this phrase
  maxDensity: number;
  topCompetitorUrl: string;
}

export interface KeywordGapAnalysis {
  totalUniqueKeywords: number;
  commonCoreKeywords: KeywordGapItem[];
  keywordGaps: KeywordGapItem[];
  allItems: KeywordGapItem[];
}

export interface BatchAuditResponse {
  timestamp: string;
  totalUrls: number;
  results: SinglePageAudit[];
}
