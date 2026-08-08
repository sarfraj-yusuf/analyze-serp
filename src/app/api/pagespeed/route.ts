import { NextRequest, NextResponse } from 'next/server';
import { fetchGooglePageSpeedData, CoreWebVitalsData } from '@/lib/pagespeed';

// 1-Hour In-Memory Cache Map (key: url + strategy)
const cacheMap = new Map<string, { data: CoreWebVitalsData; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour (3,600,000 ms)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, strategy = 'mobile' } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL parameter is required' },
        { status: 400 }
      );
    }

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
