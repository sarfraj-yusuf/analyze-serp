import { NextRequest, NextResponse } from 'next/server';
import { scrapeURL } from '@/lib/scraper';
import { analyzePage } from '@/lib/analyzer';
import { validateRobotsTxt } from '@/lib/robots-validator';
import { SinglePageAudit, BatchAuditResponse } from '@/types/seo';
import { auditRateLimiter } from '@/lib/rate-limiter';
import { auditCache } from '@/lib/lru-cache';
import { freemiumLimiter } from '@/lib/freemium-limiter';
import { logToolUsage } from '@/lib/activity-logger';
import { auth } from '@/auth';
import { saveUserAudit, saveUserAuditSnapshot, getUserByEmail } from '@/lib/db';
import { reserveUserAuditQuota, refundUserAuditQuota } from '@/lib/user-credits';

export async function POST(req: NextRequest) {
  try {
    const clientIp = auditRateLimiter.getClientIp(req);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    const { urls } = body as { urls: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one valid URL to analyze.' },
        { status: 400 }
      );
    }

    // Limit to maximum 5 URLs per request
    const targetUrls = urls.slice(0, 5).map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean);
    if (targetUrls.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one valid URL string.' },
        { status: 400 }
      );
    }

    // 1. IP Rate Limiting Check (weighted by batch size to protect scraping engine)
    const rateLimit = auditRateLimiter.check(clientIp, '/api/audit', targetUrls.length);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Too many audit requests from your IP. Please try again in ${Math.ceil(rateLimit.resetMs / 1000)} seconds.` },
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

    // Log tool usage to DB activity log
    logToolUsage(req, 'Competitor Audit', targetUrls[0] || undefined);

    // 2. Authentication & Account-based vs Guest Quota Check
    const session = await auth();
    const userEmail = session?.user?.email;

    let userAuditReservation: { success: boolean; remainingCredits: number; limit: number } | null = null;
    let isDbUser = false;

    if (userEmail) {
      const dbUser = await getUserByEmail(userEmail);
      if (dbUser) {
        isDbUser = true;

        // Authenticated User: Check suspension status & Atomically reserve quota
        if (session?.user?.status === 'suspended' || dbUser.status === 'suspended') {
          return NextResponse.json(
            { error: 'Your account has been suspended by an administrator. Please contact support.', isSuspended: true },
            { status: 403 }
          );
        }

        // Atomically reserve audit quota before scraping starts (eliminates race conditions)
        const reservation = await reserveUserAuditQuota(userEmail, targetUrls.length);
        if (!reservation.success) {
          return NextResponse.json(
            {
              error: reservation.error || 'Daily audit quota limit reached. Please wait for daily reset or upgrade to Pro!',
              isQuotaExceeded: true,
              cooldownSeconds: 0,
            },
            {
              status: 403,
              headers: {
                'X-Quota-Limit': String(reservation.limit),
                'X-Quota-Remaining': '0',
              },
            }
          );
        }
        userAuditReservation = reservation;
      }
    }

    if (!isDbUser) {
      // Guest User (or unauthenticated visitor): IP-based Quota & Cooldown Check (freemiumLimiter)
      const quotaCheck = freemiumLimiter.check(clientIp, targetUrls.length);
      if (!quotaCheck.allowed) {
        return NextResponse.json(
          {
            error: `Daily free guest quota limit reached (${quotaCheck.used}/${quotaCheck.limit} audits used). Please wait ${quotaCheck.cooldownSeconds || 120} seconds or sign in for 20 free daily audits with cloud history!`,
            isQuotaExceeded: true,
            cooldownSeconds: quotaCheck.cooldownSeconds || 120,
          },
          {
            status: 403,
            headers: {
              'X-Quota-Limit': String(quotaCheck.limit),
              'X-Quota-Remaining': '0',
              'Retry-After': String(quotaCheck.cooldownSeconds || 120),
            },
          }
        );
      }
    }

    // NOTE: Pre-consumption removed to fix the double-consumption bug.
    // Quota is consumed once after processing.

    const auditPromises = targetUrls.map(async (url, idx): Promise<SinglePageAudit> => {
      const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

      // Check LRU cache first
      const cached = auditCache.get(normalizedUrl);
      if (cached) {
        return cached;
      }

      try {
        const [scraped, robotsValidation] = await Promise.all([
          scrapeURL(normalizedUrl, idx),
          validateRobotsTxt(normalizedUrl),
        ]);

        const auditResult = {
          ...analyzePage(scraped),
          robotsValidation,
        };

        // Store in LRU cache
        auditCache.set(normalizedUrl, auditResult);

        return auditResult;
      } catch (err: any) {
        return {
          url: normalizedUrl,
          fetchTimeMs: 0,
          status: 'error',
          errorMessage: err.message || 'Failed to fetch or parse website content.',
          wordCount: 0,
          characterCount: 0,
          readingTimeMinutes: 0,
          meta: {
            title: '',
            titleLength: 0,
            titlePixelEstimate: 0,
            titleTruncated: false,
            description: '',
            descriptionLength: 0,
            descriptionTruncated: false,
            canonicalUrl: null,
            robotsDirective: null,
            ogTitle: null,
            ogDescription: null,
            ogImage: null,
            hasJsonLdSchema: false,
          },
          headings: [],
          imageAudit: { totalImages: 0, missingAltCount: 0, webpOrSvgCount: 0, imageList: [] },
          linkAudit: {
            totalLinks: 0,
            internalCount: 0,
            externalCount: 0,
            nofollowCount: 0,
            affiliateCount: 0,
            anchorBreakdown: { keywordRichCount: 0, brandedCount: 0, genericCount: 0 },
            affiliateNetworksDetected: [],
            links: [],
          },
          keywords: { oneGram: [], twoGram: [], threeGram: [] },
          readability: {
            fleschReadingEase: 0,
            fleschGradeLevel: 0,
            gradeLabel: 'N/A',
            toneLabel: 'Informative',
            totalSentences: 0,
            avgSentenceLength: 0,
            avgSyllablesPerWord: 0,
            complexWordsCount: 0,
            complexWordsPercentage: 0,
          },
          technicalAudit: {
            ttfbMs: 0,
            totalDownloadTimeMs: 0,
            htmlSizeKb: 0,
            domNodeCount: 0,
            maxDomDepth: 0,
            inlineScriptCount: 0,
            inlineScriptSizeKb: 0,
            inlineStyleCount: 0,
            inlineStyleSizeKb: 0,
            externalScriptCount: 0,
            externalStyleCount: 0,
            hasViewportMeta: false,
            hasHttps: false,
            hasCharsetMeta: false,
            technicalScore: 0,
            technicalGrade: 'Heavy & Unoptimized',
            warnings: [],
          },
        };
      }
    });

    const results = await Promise.all(auditPromises);

    // If authenticated, persist audit history and full snapshot for user
    if (userEmail) {
      try {
        for (const r of results) {
          if (r.status === 'success') {
            await saveUserAudit({
              user_email: userEmail,
              url: r.url,
              title: r.meta?.title || 'Audited Webpage',
              score: r.technicalAudit?.technicalScore ?? null,
              word_count: r.wordCount,
              status: r.status,
            });

            const targetKw = r.keywords?.oneGram?.[0]?.phrase || undefined;
            const now = Date.now();
            const dateLabel = new Date(now).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            await saveUserAuditSnapshot({
              user_email: userEmail,
              url: r.url,
              label: `Crawl (${dateLabel})`,
              score: r.technicalAudit?.technicalScore ?? 0,
              target_keyword: targetKw || null,
              snapshot_json: JSON.stringify({
                id: `snap-${now}-${Math.random().toString(36).slice(2, 7)}`,
                url: r.url,
                label: `Crawl (${dateLabel})`,
                timestamp: now,
                score: r.technicalAudit?.technicalScore ?? 0,
                targetKeyword: targetKw,
                audit: r,
                isCloudSynced: true,
              }),
            });
          }
        }
      } catch (auditSaveErr) {
        console.error('[User Audit History Save Warning]:', auditSaveErr);
      }
    }

    // Reconcile Quota: If any target URLs completely errored, refund the difference
    const successCount = results.filter((r) => r.status === 'success').length;
    const failedCount = targetUrls.length - successCount;

    let updatedQuotaLimit = 20;
    let updatedQuotaRemaining = 20;

    if (userEmail && userAuditReservation) {
      if (failedCount > 0) {
        await refundUserAuditQuota(userEmail, failedCount);
      }
      updatedQuotaLimit = userAuditReservation.limit;
      updatedQuotaRemaining = Math.max(0, userAuditReservation.remainingCredits + failedCount);
    } else {
      const countToDeduct = successCount > 0 ? successCount : targetUrls.length;
      freemiumLimiter.consume(clientIp, countToDeduct);
      const updatedGuestQuota = freemiumLimiter.check(clientIp, 0);
      updatedQuotaLimit = updatedGuestQuota.limit;
      updatedQuotaRemaining = updatedGuestQuota.remaining;
    }

    const responsePayload: BatchAuditResponse = {
      timestamp: new Date().toISOString(),
      totalUrls: results.length,
      results,
    };

    return NextResponse.json(responsePayload, {
      headers: {
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-Daily-Quota-Limit': String(updatedQuotaLimit),
        'X-Daily-Quota-Remaining': String(updatedQuotaRemaining),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error processing SEO audit request.' },
      { status: 500 }
    );
  }
}
