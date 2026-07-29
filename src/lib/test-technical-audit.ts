import * as cheerio from 'cheerio';
import { analyzeTechnicalHealth } from './technical-audit';

console.log('--- Testing Lightweight Performance & Technical Health Engine ---');

const sampleHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Technical SEO Page</title>
  <style>body { background: #fff; }</style>
</head>
<body>
  <div>
    <article>
      <h1>Technical Performance Test</h1>
      <p>Testing payload size, DOM node count, and TTFB calculation.</p>
    </article>
  </div>
</body>
</html>
`;

const $ = cheerio.load(sampleHtml);
const audit = analyzeTechnicalHealth(sampleHtml, 120, 85, 'https://example.com/test', $);

console.log('Technical Audit Results:', JSON.stringify(audit, null, 2));

if (audit.technicalScore > 0 && audit.domNodeCount > 0) {
  console.log('\n✅ Technical Health Engine test PASSED!');
} else {
  console.error('\n❌ Technical Health Engine test FAILED!');
  process.exit(1);
}
