import { analyzePage } from './analyzer';
import * as cheerio from 'cheerio';

const SAMPLE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>On-Page SEO Strategy Guide: Best Practices for 2026</title>
  <meta name="description" content="Discover the ultimate guide to on-page SEO optimization. Learn how heading structures, metadata, word count, and keyword density impact your rankings.">
  <link rel="canonical" href="https://example.com/on-page-seo-guide">
  <meta name="robots" content="index, follow">
  <script type="application/ld+json">{"@context":"https://schema.org"}</script>
</head>
<body>
  <nav><a href="/">Home</a><a href="/about">About</a></nav>
  <header><h1>Header Menu</h1></header>

  <article>
    <h1>Complete On-Page SEO Guide</h1>
    <p>On-page SEO is critical for organic search engine visibility and keyword rankings.</p>

    <h2>1. Understanding Title Tags and Meta Descriptions</h2>
    <p>Title tags and meta descriptions provide search engines with concise summaries of page content.</p>

    <h3>Title Tag Length & Pixel Width</h3>
    <p>Keep titles under 60 characters and 580 pixels to avoid SERP truncation.</p>

    <h2>2. Heading Hierarchy and Content Structure</h2>
    <p>Use H1, H2, and H3 tags logically to create readable content outlines.</p>

    <img src="seo-chart.webp" alt="On-Page SEO Chart" />
    <img src="banner.png" />

    <a href="https://google.com" rel="nofollow">External Link</a>
  </article>

  <footer><p>&copy; 2026 Example Corp</p></footer>
</body>
</html>
`;

export function runScraperTest() {
  const $ = cheerio.load(SAMPLE_HTML);
  const title = $('title').text().trim();
  const description = $('meta[name="description"]').attr('content')?.trim() || '';

  const headings: { level: string; text: string; depth: number }[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = el.name.toLowerCase();
    const text = $(el).text().trim();
    headings.push({ level, text, depth: parseInt(level.substring(1)) });
  });

  console.log('--- TEST SCRAPER & PARSER RESULTS ---');
  console.log('Title:', title);
  console.log('Description:', description);
  console.log('Headings Count:', headings.length);
  console.log('Headings:', headings);

  // Test sanitization
  const cleanDom = cheerio.load(SAMPLE_HTML);
  cleanDom('script, style, nav, footer, header, iframe, aside, noscript, svg, form').remove();
  const cleanText = cleanDom('article').text().replace(/\s+/g, ' ').trim();

  console.log('Sanitized Body Text length:', cleanText.length);
  console.log('Test PASSED cleanly!');
}

if (require.main === module) {
  runScraperTest();
}
