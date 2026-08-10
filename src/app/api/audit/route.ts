import { NextRequest, NextResponse } from 'next/server';
import { scrapeURL } from '@/lib/scraper';
import { analyzePage } from '@/lib/analyzer';
import { validateRobotsTxt } from '@/lib/robots-validator';
import { SinglePageAudit, BatchAuditResponse } from '@/types/seo';
import { auditRateLimiter } from '@/lib/rate-limiter';
import { auditCache } from '@/lib/lru-cache';
import { freemiumLimiter } from '@/lib/freemium-limiter';
import { logToolUsage } from '@/lib/activity-logger';

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting Check (burst limit)
    const clientIp = auditRateLimiter.getClientIp(req);
    const rateLimit = auditRateLimiter.check(clientIp);

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

    const body = await req.json();
    const { urls } = body as { urls: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one valid URL to analyze.' },
        { status: 400 }
      );
    }

    // Limit to maximum 5 URLs per request
    const targetUrls = urls.slice(0, 5).map((u) => u.trim()).filter(Boolean);

    // Log tool usage to DB activity log
    logToolUsage(req, 'Competitor Audit', targetUrls[0] || undefined);

    // 2. Server-side Quota & Cooldown Check (5 audits per batch, 120s cooldown)
    const quotaCheck = freemiumLimiter.check(clientIp, targetUrls.length);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: `Daily free quota limit reached (20/20 audits used). Please wait 120 seconds before your next free audits unlock!`,
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

    // Consume quota
    freemiumLimiter.consume(clientIp, targetUrls.length);

    const auditPromises = targetUrls.map(async (url): Promise<SinglePageAudit> => {
      const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

      // Check LRU cache first
      const cached = auditCache.get(normalizedUrl);
      if (cached) {
        return cached;
      }

      try {
        const [scraped, robotsValidation] = await Promise.all([
          scrapeURL(normalizedUrl),
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

    // Consume server-side freemium quota for successfully processed target URLs
    freemiumLimiter.consume(clientIp, targetUrls.length);
    const updatedQuota = freemiumLimiter.check(clientIp, 0);

    const responsePayload: BatchAuditResponse = {
      timestamp: new Date().toISOString(),
      totalUrls: results.length,
      results,
    };

    return NextResponse.json(responsePayload, {
      headers: {
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-Daily-Quota-Limit': String(updatedQuota.limit),
        'X-Daily-Quota-Remaining': String(updatedQuota.remaining),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error processing SEO audit request.' },
      { status: 500 }
    );
  }
}
