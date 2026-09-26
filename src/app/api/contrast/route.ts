import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { scrapeURL } from '@/lib/scraper';
import { analyzePageContrast } from '@/lib/contrast-analyzer';
import { diagnosticRateLimiter } from '@/lib/rate-limiter';
import { validateUrlSafety, safeFetchWithSsrf } from '@/lib/ssrf-protection';

export async function POST(req: NextRequest) {
  try {
    const clientIp = diagnosticRateLimiter.getClientIp(req);
    const rateLimit = diagnosticRateLimiter.check(clientIp, '/api/contrast');

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a few seconds.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { error: 'Valid website URL parameter is required.' },
        { status: 400 }
      );
    }

    const normalizedUrl = /^https?:\/\//i.test(url.trim())
      ? url.trim()
      : `https://${url.trim()}`;

    const scraped = await scrapeURL(normalizedUrl);
    const finalUrl = scraped.finalUrl || normalizedUrl;

    // Extract external stylesheet URLs to capture real production CSS
    const $ = cheerio.load(scraped.html);
    const stylesheetHrefs: string[] = [];
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('data:') && stylesheetHrefs.length < 3) {
        try {
          const resolved = new URL(href, finalUrl).toString();
          stylesheetHrefs.push(resolved);
        } catch {}
      }
    });

    let externalCss = '';
    if (stylesheetHrefs.length > 0) {
      try {
        const fetchedStyles = await Promise.allSettled(
          stylesheetHrefs.map(async (sheetUrl) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2500);
            const res = await safeFetchWithSsrf(sheetUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SEOCompetitorAnalyzer/1.0',
                Accept: 'text/css,*/*;q=0.1',
              },
              maxRedirects: 3,
            });
            clearTimeout(timer);
            if (res.ok) {
              const text = await res.text();
              return text.slice(0, 100000); // 100KB per sheet
            }
            return '';
          })
        );
        externalCss = fetchedStyles
          .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
          .map((r) => r.value)
          .join('\n');
      } catch (e) {
        // Non-fatal if external styles cannot be fetched
      }
    }

    const report = analyzePageContrast(scraped.html, finalUrl, externalCss);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Error in /api/contrast route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch website or analyze color contrast.' },
      { status: 500 }
    );
  }
}
