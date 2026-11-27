import { NextRequest, NextResponse } from 'next/server';
import { verifySameOrigin } from '@/lib/csrf';
import { diagnosticRateLimiter } from '@/lib/rate-limiter';
import { addToWaitlist } from '@/lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    // 0. CSRF / Origin Guard (same check as /api/ai/generate)
    const originCheck = verifySameOrigin(req);
    if (!originCheck.valid) {
      return NextResponse.json(
        { error: originCheck.reason || 'Forbidden: Cross-site request rejected.' },
        { status: 403 }
      );
    }

    // 1. IP Rate Limiting Guard
    const clientIp = diagnosticRateLimiter.getClientIp(req);
    const rateLimit = diagnosticRateLimiter.check(clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many requests. Please wait ${Math.ceil(rateLimit.resetMs / 1000)} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        }
      );
    }

    // 2. Parse & validate payload
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!rawEmail || rawEmail.length > 255 || !EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const rawSource = typeof body.source === 'string' ? body.source.trim().slice(0, 50) : 'unknown';
    const source = rawSource || 'unknown';

    // 3. Insert into waitlist (ignores duplicate emails safely via UNIQUE constraint)
    const result = await addToWaitlist(rawEmail, source);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Unable to save your email right now. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyJoined: result.alreadyJoined,
      message: result.alreadyJoined
        ? "You're already on the Pro waitlist!"
        : "You're on the list! We'll notify you when Pro launches.",
    });
  } catch (error) {
    console.error('[Waitlist API Error]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
