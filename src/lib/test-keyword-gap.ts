import { SinglePageAudit } from '@/types/seo';
import { analyzeKeywordGaps } from './keyword-gap';

console.log('--- Testing Keyword Gap & Topic Overlap Matrix Engine ---');

const mockAudits: SinglePageAudit[] = [
  {
    url: 'https://competitor1.com/seo-guide',
    fetchTimeMs: 400,
    status: 'success',
    wordCount: 1500,
    characterCount: 9000,
    readingTimeMinutes: 8,
    meta: {
      title: 'Ultimate SEO Guide 2026',
      titleLength: 23,
      titlePixelEstimate: 220,
      titleTruncated: false,
      description: 'Learn on-page SEO factors.',
      descriptionLength: 25,
      descriptionTruncated: false,
      canonicalUrl: null,
      robotsDirective: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      hasJsonLdSchema: true,
    },
    headings: [],
    imageAudit: { totalImages: 2, missingAltCount: 0, webpOrSvgCount: 2, imageList: [] },
    linkAudit: {
      totalLinks: 10,
      internalCount: 7,
      externalCount: 3,
      nofollowCount: 1,
      affiliateCount: 0,
      anchorBreakdown: { keywordRichCount: 8, brandedCount: 2, genericCount: 0 },
      affiliateNetworksDetected: [],
      links: [],
    },
    keywords: {
      oneGram: [
        { phrase: 'search', count: 25, density: 1.67, isStuffing: false },
        { phrase: 'engine', count: 20, density: 1.33, isStuffing: false },
        { phrase: 'optimization', count: 18, density: 1.2, isStuffing: false },
        { phrase: 'backlinks', count: 12, density: 0.8, isStuffing: false },
      ],
      twoGram: [
        { phrase: 'search engine', count: 18, density: 1.2, isStuffing: false },
        { phrase: 'engine optimization', count: 15, density: 1.0, isStuffing: false },
        { phrase: 'link building', count: 10, density: 0.67, isStuffing: false },
      ],
      threeGram: [
        { phrase: 'search engine optimization', count: 14, density: 0.93, isStuffing: false },
      ],
    },
    readability: {
      fleschReadingEase: 65,
      fleschGradeLevel: 8,
      gradeLabel: '8th Grade Level',
      toneLabel: 'Informative',
      totalSentences: 75,
      avgSentenceLength: 20,
      avgSyllablesPerWord: 1.5,
      complexWordsCount: 150,
      complexWordsPercentage: 10,
    },
    technicalAudit: {
      ttfbMs: 120,
      totalDownloadTimeMs: 400,
      htmlSizeKb: 45,
      domNodeCount: 350,
      maxDomDepth: 8,
      inlineScriptCount: 2,
      inlineScriptSizeKb: 5,
      inlineStyleCount: 1,
      inlineStyleSizeKb: 2,
      externalScriptCount: 3,
      externalStyleCount: 2,
      hasViewportMeta: true,
      hasHttps: true,
      hasCharsetMeta: true,
      technicalScore: 95,
      technicalGrade: 'Fast & Optimized',
      warnings: [],
    },
  },
  {
    url: 'https://competitor2.com/seo-guide',
    fetchTimeMs: 450,
    status: 'success',
    wordCount: 1800,
    characterCount: 11000,
    readingTimeMinutes: 9,
    meta: {
      title: 'Complete On-Page SEO Checklist',
      titleLength: 30,
      titlePixelEstimate: 280,
      titleTruncated: false,
      description: 'Master search engine optimization.',
      descriptionLength: 33,
      descriptionTruncated: false,
      canonicalUrl: null,
      robotsDirective: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      hasJsonLdSchema: true,
    },
    headings: [],
    imageAudit: { totalImages: 4, missingAltCount: 1, webpOrSvgCount: 3, imageList: [] },
    linkAudit: {
      totalLinks: 14,
      internalCount: 10,
      externalCount: 4,
      nofollowCount: 2,
      affiliateCount: 0,
      anchorBreakdown: { keywordRichCount: 10, brandedCount: 2, genericCount: 2 },
      affiliateNetworksDetected: [],
      links: [],
    },
    keywords: {
      oneGram: [
        { phrase: 'search', count: 30, density: 1.67, isStuffing: false },
        { phrase: 'engine', count: 22, density: 1.22, isStuffing: false },
        { phrase: 'optimization', count: 20, density: 1.11, isStuffing: false },
        { phrase: 'technical', count: 14, density: 0.77, isStuffing: false }, // Gap vs Competitor 1
      ],
      twoGram: [
        { phrase: 'search engine', count: 20, density: 1.11, isStuffing: false },
        { phrase: 'engine optimization', count: 18, density: 1.0, isStuffing: false },
        { phrase: 'technical seo', count: 12, density: 0.67, isStuffing: false },
      ],
      threeGram: [
        { phrase: 'search engine optimization', count: 16, density: 0.89, isStuffing: false },
      ],
    },
    readability: {
      fleschReadingEase: 62,
      fleschGradeLevel: 9,
      gradeLabel: '9th Grade Level',
      toneLabel: 'Informative',
      totalSentences: 85,
      avgSentenceLength: 21,
      avgSyllablesPerWord: 1.52,
      complexWordsCount: 190,
      complexWordsPercentage: 10.5,
    },
    technicalAudit: {
      ttfbMs: 150,
      totalDownloadTimeMs: 450,
      htmlSizeKb: 52,
      domNodeCount: 420,
      maxDomDepth: 9,
      inlineScriptCount: 3,
      inlineScriptSizeKb: 8,
      inlineStyleCount: 2,
      inlineStyleSizeKb: 3,
      externalScriptCount: 4,
      externalStyleCount: 2,
      hasViewportMeta: true,
      hasHttps: true,
      hasCharsetMeta: true,
      technicalScore: 92,
      technicalGrade: 'Fast & Optimized',
      warnings: [],
    },
  },
];

const analysis = analyzeKeywordGaps(mockAudits);

console.log('Matrix Analysis Summary:');
console.log(`Total Unique Keywords Analyzed: ${analysis.totalUniqueKeywords}`);
console.log(`Common Core Phrases (Used by All): ${analysis.commonCoreKeywords.map((k) => k.phrase).join(', ')}`);
console.log(`Keyword Gaps Detected: ${analysis.keywordGaps.map((k) => `"${k.phrase}" (Missing in ${k.missingInUrls.length} URLs)`).join(', ')}`);

if (analysis.commonCoreKeywords.length > 0 && analysis.keywordGaps.length > 0) {
  console.log('\n✅ Keyword Gap Matrix Engine test PASSED!');
} else {
  console.error('\n❌ Keyword Gap Matrix Engine test FAILED!');
  process.exit(1);
}
