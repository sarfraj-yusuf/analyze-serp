import { NextResponse } from 'next/server';
import { saveUserFeedback, getAllFeedback } from '@/lib/db';
import { getClientIp } from '@/lib/activity-logger';

// Basic sliding window memory rate limiter for feedback submissions (5 per IP / 24h)
const feedbackIpMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();

    const { rating, category, message, email, user_type, hp_website } = body;

    // 1. HONEYPOT ANTI-SPAM CHECK:
    // If the hidden honeypot field is filled out, a bot triggered it.
    // Return a silent fake success response without writing to the database!
    if (hp_website && hp_website.trim().length > 0) {
      console.warn(`[Anti-Spam] Honeypot field triggered from IP ${ip}. Silently dropping spam.`);
      return NextResponse.json(
        { success: true, message: 'Thank you for your feedback!' },
        { status: 200 }
      );
    }

    // 2. IP RATE LIMITING (Max 5 submissions per IP per 24 hours)
    const now = Date.now();
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

    // 3. INPUT VALIDATION
    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Please select a valid star rating (1 to 5).' }, { status: 400 });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json({ error: 'Please select a feedback category.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Please enter a message of at least 5 characters.' }, { status: 400 });
    }

    // 4. SAVE TO DATABASE
    await saveUserFeedback({
      user_type: user_type || 'Guest',
      rating: parsedRating,
      category: category.trim(),
      message: message.trim(),
      email: email ? email.trim() : null,
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

export async function GET(req: Request) {
  try {
    const feedbackList = await getAllFeedback();
    return NextResponse.json({ success: true, feedback: feedbackList });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch feedback list' }, { status: 500 });
  }
}
