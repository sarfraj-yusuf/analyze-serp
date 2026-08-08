import { NextRequest, NextResponse } from 'next/server';
import { traceRedirectChain } from '@/lib/redirect-tracer';
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

    const report = await traceRedirectChain(url.trim());

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Error in /api/redirect route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to trace HTTP redirect chain.' },
      { status: 500 }
    );
  }
}
