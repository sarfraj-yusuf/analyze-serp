import { analyzePage } from './analyzer';
import { ScrapedRawDOM } from './scraper';

console.log('--- Testing Non-AI SEO Scraper & Analyzer Engine ---');

const mockScrapedDOM: ScrapedRawDOM = {
  url: 'https://example.com/best-seo-tools',
  finalUrl: 'https://example.com/best-seo-tools',
  html: '<html><body><h1>Best SEO Tools Guide</h1><p>Learn how to optimize on-page SEO factors with competitor analysis tools and Keyword gap strategies.</p></body></html>',
  fetchTimeMs: 350,
  ttfbMs: 120,
  meta: {
    title: 'Best SEO Tools Guide 2026 - Master Competitor Analysis',
    titleLength: 55,
    titlePixelEstimate: 528,
    titleTruncated: false,
    description: 'Comprehensive guide analyzing top competitor SEO tools, keyword gap matrices, and Flesch readability grade levels.',
    descriptionLength: 125,
    descriptionTruncated: false,
    canonicalUrl: 'https://example.com/best-seo-tools',
    robotsDirective: 'index, follow',
    ogTitle: 'Best SEO Tools Guide 2026',
    ogDescription: 'Comprehensive guide analyzing top competitor SEO tools.',
    ogImage: 'https://example.com/og-image.jpg',
    hasJsonLdSchema: true,
  },
  headings: [
    { level: 'h1', text: 'Best SEO Tools Guide 2026', depth: 1 },
    { level: 'h2', text: 'Keyword Gap Analysis', depth: 2 },
    { level: 'h2', text: 'Flesch Readability Scoring', depth: 2 },
  ],
  imageAudit: {
    totalImages: 3,
    missingAltCount: 1,
    webpOrSvgCount: 2,
    imageList: [
      { src: '/img1.webp', alt: 'SEO Dashboard', hasAlt: true, isWebpOrSvg: true },
      { src: '/img2.png', alt: '', hasAlt: false, isWebpOrSvg: false },
      { src: '/img3.svg', alt: 'Keyword Chart', hasAlt: true, isWebpOrSvg: true },
    ],
  },
  linkAudit: {
    totalLinks: 2,
    internalCount: 1,
    externalCount: 1,
    nofollowCount: 1,
    affiliateCount: 0,
    anchorBreakdown: { keywordRichCount: 2, brandedCount: 0, genericCount: 0 },
    affiliateNetworksDetected: [],
    links: [
      { href: 'https://example.com/internal-page', text: 'Internal Link', isExternal: false, isNofollow: false, anchorCategory: 'Keyword-Rich', isAffiliate: false },
      { href: 'https://external-site.com', text: 'External Citation', isExternal: true, isNofollow: true, anchorCategory: 'Keyword-Rich', isAffiliate: false },
    ],
  },
  cleanBodyText:
    'Best SEO Tools Guide 2026. Learn how to optimize on-page SEO factors with competitor analysis tools and Keyword gap strategies. Keywords analysis helps digital marketers outrank search engine rankings.',
  cheerioDom: {} as any,
};

const audit = analyzePage(mockScrapedDOM);

console.log('Processed Audit Result:');
console.log(`URL: ${audit.url}`);
console.log(`Word Count: ${audit.wordCount}`);
console.log(`Read Time: ${audit.readingTimeMinutes} min`);
console.log(`Title Health: ${audit.meta.titleTruncated ? 'Truncated' : 'Optimal'}`);
console.log(`Top 1-Gram Keywords: ${audit.keywords.oneGram.slice(0, 3).map((k) => `${k.phrase} (${k.density}%)`).join(', ')}`);
console.log(`Top 2-Gram Keywords: ${audit.keywords.twoGram.slice(0, 3).map((k) => `${k.phrase} (${k.density}%)`).join(', ')}`);
console.log(`Readability Ease Score: ${audit.readability.fleschReadingEase} (${audit.readability.gradeLabel})`);
console.log(`Technical Score: ${audit.technicalAudit.technicalScore}/100 (${audit.technicalAudit.technicalGrade})`);

if (audit.wordCount > 0 && audit.keywords.oneGram.length > 0 && audit.readability && audit.technicalAudit) {
  console.log('\n✅ SEO Analyzer Engine test PASSED!');
} else {
  console.error('\n❌ SEO Analyzer Engine test FAILED!');
  process.exit(1);
}
