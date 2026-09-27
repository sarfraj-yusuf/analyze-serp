import { NextRequest, NextResponse } from 'next/server';
import { fetchGooglePageSpeedData, CoreWebVitalsData } from '@/lib/pagespeed';
import { pageSpeedRateLimiter } from '@/lib/rate-limiter';
import { validateUrlSafety } from '@/lib/ssrf-protection';
import { LRUCache } from '@/lib/lru-cache';

// 1-Hour Bounded LRU Cache (max 200 entries, 1-hour TTL)
const pageSpeedCache = new LRUCache<CoreWebVitalsData>(200, 60 * 60 * 1000);

export async function POST(req: NextRequest) {
  try {
    const clientIp = pageSpeedRateLimiter.getClientIp(req);
    const rateLimit = pageSpeedRateLimiter.check(clientIp, '/api/pagespeed');

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'PageSpeed rate limit exceeded. Please wait a few seconds before testing another URL.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const { url, strategy = 'mobile', forceRefresh = false } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { error: 'Valid URL parameter is required' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl.length > 2000) {
      return NextResponse.json(
        { error: 'URL exceeds maximum allowed length.' },
        { status: 400 }
      );
    }

    const normalizedUrl = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
    await validateUrlSafety(normalizedUrl);

    const cleanStrategy = strategy === 'desktop' ? 'desktop' : 'mobile';
    const cacheKey = `${url.trim().toLowerCase()}::${cleanStrategy}`;

    // Check 1-Hour Bounded LRU cache (unless forceRefresh is explicitly requested)
    if (!forceRefresh) {
      const cached = pageSpeedCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          isCached: true,
        });
      }
    }

    // Fetch live Google PageSpeed Insights data
    const data = await fetchGooglePageSpeedData(url, cleanStrategy);

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to fetch PageSpeed data from Google Insights API' },
        { status: 502 }
      );
    }

    // Save to Bounded LRU cache (automatically evicts oldest when exceeding 200 items)
    pageSpeedCache.set(cacheKey, data);

    return NextResponse.json({
      ...data,
      isCached: false,
    });
  } catch (error) {
    console.error('Error in /api/pagespeed route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while fetching Core Web Vitals' },
      { status: 500 }
    );
  }
}
