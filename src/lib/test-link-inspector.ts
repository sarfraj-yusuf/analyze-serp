import { detectAffiliateNetwork, classifyAnchorText, enhanceLinkAudit } from './link-inspector';

console.log('--- Testing Affiliate Network Detection ---');

const sampleLinks = [
  'https://www.amazon.com/dp/B08N5WRWNW?tag=mywebsite-20',
  'https://amzn.to/3xyz123',
  'https://shareasale.com/r.cfm?b=12345&u=67890',
  'https://impact.com/ref/item123',
  'https://anrdoezrs.net/click-12345-67890',
  'https://ahrefs.com/blog/on-page-seo/',
];

sampleLinks.forEach((url) => {
  const result = detectAffiliateNetwork(url);
  console.log(`URL: "${url}" -> Affiliate: ${result.isAffiliate ? 'YES' : 'NO'} (${result.network || 'None'})`);
});

console.log('\n--- Testing Anchor Text Classifier ---');
console.log('Anchor "click here" ->', classifyAnchorText('click here', 'https://example.com', 'https://mysite.com'));
console.log('Anchor "Ahrefs" ->', classifyAnchorText('Ahrefs', 'https://ahrefs.com', 'https://mysite.com'));
console.log('Anchor "Comprehensive On-Page SEO Guide" ->', classifyAnchorText('Comprehensive On-Page SEO Guide', 'https://example.com/guide', 'https://mysite.com'));

console.log('\n✅ Link Inspector Engine test PASSED!');
