import { NextRequest, NextResponse } from 'next/server';
import { fetchGooglePageSpeedData, CoreWebVitalsData } from '@/lib/pagespeed';
import { auditRateLimiter } from '@/lib/rate-limiter';
import { validateUrlSafety } from '@/lib/ssrf-protection';

// 1-Hour In-Memory Cache Map (key: url + strategy)
const cacheMap = new Map<string, { data: CoreWebVitalsData; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour (3,600,000 ms)

export async function POST(req: NextRequest) {
  try {
    const clientIp = auditRateLimiter.getClientIp(req);
    const rateLimit = auditRateLimiter.check(clientIp);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a few seconds before testing another URL.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const { url, strategy = 'mobile' } = body;

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
    const now = Date.now();

    // Check 1-Hour LRU cache
    const cached = cacheMap.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        ...cached.data,
        isCached: true,
      });
    }

    // Fetch live Google PageSpeed Insights data
    const data = await fetchGooglePageSpeedData(url, cleanStrategy);

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to fetch PageSpeed data from Google Insights API' },
        { status: 502 }
      );
    }

    // Save to 1-Hour cache
    cacheMap.set(cacheKey, { data, timestamp: now });

    // Clean up expired cache items if map size exceeds 500 items
    if (cacheMap.size > 500) {
      cacheMap.forEach((val, key) => {
        if (now - val.timestamp >= CACHE_TTL_MS) {
          cacheMap.delete(key);
        }
      });
    }

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
