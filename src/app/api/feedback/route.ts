import { NextResponse } from 'next/server';
import { saveUserFeedback, getAllFeedback } from '@/lib/db';
import { getTrustedClientIp } from '@/lib/client-ip';
import { verifySameOrigin } from '@/lib/csrf';

// Basic sliding window memory rate limiter for feedback submissions (5 per IP / 24h)
const feedbackIpMap = new Map<string, { count: number; resetTime: number }>();
let lastFeedbackCleanup = Date.now();

function cleanupFeedbackMap(now: number): void {
  lastFeedbackCleanup = now;
  for (const [ip, data] of feedbackIpMap.entries()) {
    if (now > data.resetTime) {
      feedbackIpMap.delete(ip);
    }
  }
  // Hard ceiling safety cap (max 2,000 entries)
  if (feedbackIpMap.size > 2000) {
    const excess = feedbackIpMap.size - 2000;
    const keys = Array.from(feedbackIpMap.keys()).slice(0, excess);
    for (const k of keys) feedbackIpMap.delete(k);
  }
}

export async function POST(req: Request) {
  try {
    // 1. CSRF / ORIGIN PROTECTION
    const originCheck = verifySameOrigin(req);
    if (!originCheck.valid) {
      return NextResponse.json(
        { error: originCheck.reason || 'Forbidden: Cross-site request rejected.' },
        { status: 403 }
      );
    }

    // 2. REQUEST PAYLOAD SIZE LIMIT (Max 50 KB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && Number(contentLength) > 50 * 1024) {
      return NextResponse.json(
        { error: 'Payload too large. Maximum feedback size is 50 KB.' },
        { status: 413 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const ip = getTrustedClientIp(req);
    const { rating, category, message, email, user_type, hp_website } = body;

    // 3. HONEYPOT ANTI-SPAM CHECK:
    // If the hidden honeypot field is filled out, a bot triggered it.
    // Return a silent fake success response without writing to the database!
    if (hp_website && typeof hp_website === 'string' && hp_website.trim().length > 0) {
      console.warn(`[Anti-Spam] Honeypot field triggered from IP ${ip}. Silently dropping spam.`);
      return NextResponse.json(
        { success: true, message: 'Thank you for your feedback!' },
        { status: 200 }
      );
    }

    // 4. IP RATE LIMITING (Max 5 submissions per IP per 24 hours with TTL pruning)
    const now = Date.now();
    if (now - lastFeedbackCleanup > 60 * 60 * 1000 || feedbackIpMap.size > 2000) {
      cleanupFeedbackMap(now);
    }

    const windowMs = 24 * 60 * 60 * 1000;
    const ipData = feedbackIpMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > ipData.resetTime) {
      ipData.count = 0;
      ipData.resetTime = now + windowMs;
    }

    if (ipData.count >= 5) {
      return NextResponse.json(
        { error: 'Feedback submission limit reached for today. Thank you for your support!' },
        { status: 429 }
      );
    }

    // 5. STRICT INPUT SCHEMA & BOUNDS VALIDATION
    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Please select a valid star rating (1 to 5).' }, { status: 400 });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0 || category.trim().length > 50) {
      return NextResponse.json({ error: 'Please select a valid feedback category (maximum 50 characters).' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Please enter a message of at least 5 characters.' }, { status: 400 });
    }

    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'Feedback message cannot exceed 2,000 characters.' }, { status: 400 });
    }

    let cleanEmail: string | null = null;
    if (email && typeof email === 'string' && email.trim().length > 0) {
      const trimmedEmail = email.trim();
      if (trimmedEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return NextResponse.json({ error: 'Please enter a valid email address (maximum 255 characters).' }, { status: 400 });
      }
      cleanEmail = trimmedEmail;
    }

    const cleanUserType = typeof user_type === 'string' && user_type.trim().length > 0
      ? user_type.trim().slice(0, 50)
      : 'Guest';

    // 6. SAVE TO DATABASE
    await saveUserFeedback({
      user_type: cleanUserType,
      rating: parsedRating,
      category: category.trim(),
      message: message.trim(),
      email: cleanEmail,
      ip_address: ip,
    });

    // Update IP counter
    ipData.count += 1;
    feedbackIpMap.set(ip, ipData);

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your feedback has been recorded. You have unlocked Early Adopter Status!',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Feedback API Error]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving your feedback.' },
      { status: 500 }
    );
  }
}

import { verifyAdminSession } from '@/lib/auth-admin';

export async function GET(req: Request) {
  try {
    const authResult = await verifyAdminSession(req, '/api/feedback');
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: authResult.status || 401 }
      );
    }

    const feedbackList = await getAllFeedback();
    return NextResponse.json({ success: true, feedback: feedbackList });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch feedback list' }, { status: 500 });
  }
}
