import { NextRequest, NextResponse } from 'next/server';
import { scrapeURL } from '@/lib/scraper';
import { analyzePageContrast } from '@/lib/contrast-analyzer';
import { auditRateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const clientIp = auditRateLimiter.getClientIp(req);
    const rateLimit = auditRateLimiter.check(clientIp);

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
    const report = analyzePageContrast(scraped.html, normalizedUrl);

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
