import { NextRequest } from 'next/server';

export interface SameOriginResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates that an incoming state-changing request (POST, DELETE, PUT, PATCH)
 * originates from the trusted same-origin domain, protecting against Cross-Site Request Forgery (CSRF).
 *
 * Checks:
 * 1. Sec-Fetch-Site (if cross-site -> immediate reject)
 * 2. Origin header against current Host / forwarded host / configured site URLs
 * 3. Referer header fallback if Origin is absent
 */
export function verifySameOrigin(req: Request | NextRequest): SameOriginResult {
  const headers = req.headers;

  // 1. Modern browser metadata check: Sec-Fetch-Site
  const secFetchSite = headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return {
      valid: false,
      reason: 'Cross-site request blocked by Sec-Fetch-Site header validation.',
    };
  }

  // 2. Resolve target application host
  const rawHost = headers.get('x-forwarded-host') || headers.get('host');
  if (!rawHost) {
    // If no host header exists, allow non-browser or internal requests
    return { valid: true };
  }

  const currentHost = rawHost.split(':')[0].toLowerCase();

  // Helper to extract hostname safely
  const extractHostname = (urlStr: string): string | null => {
    try {
      return new URL(urlStr).hostname.toLowerCase();
    } catch {
      return null;
    }
  };

  // Build trusted host set
  const trustedHosts = new Set<string>();
  trustedHosts.add(currentHost);

  // Add environment configured app URLs
  const configuredUrls = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean) as string[];

  for (const url of configuredUrls) {
    const h = extractHostname(url);
    if (h) trustedHosts.add(h);
  }

  // Localhost / Loopback allowed during non-production
  if (process.env.NODE_ENV !== 'production') {
    trustedHosts.add('localhost');
    trustedHosts.add('127.0.0.1');
    trustedHosts.add('::1');
  }

  // 3. Origin check (present on all modern browser CORS & mutating fetch/form requests)
  const origin = headers.get('origin');
  if (origin) {
    const originHost = extractHostname(origin);
    if (!originHost) {
      return { valid: false, reason: 'Invalid or malformed Origin header.' };
    }

    if (!trustedHosts.has(originHost)) {
      return {
        valid: false,
        reason: `Cross-site Origin denied: ${originHost} is not in trusted host list.`,
      };
    }

    return { valid: true };
  }

  // 4. Referer fallback check
  const referer = headers.get('referer');
  if (referer) {
    const refererHost = extractHostname(referer);
    if (!refererHost) {
      return { valid: false, reason: 'Invalid or malformed Referer header.' };
    }

    if (!trustedHosts.has(refererHost)) {
      return {
        valid: false,
        reason: `Cross-site Referer denied: ${refererHost} is not in trusted host list.`,
      };
    }

    return { valid: true };
  }

  // 5. Neither Origin nor Referer provided (e.g. server-to-server or non-browser tooling)
  return { valid: true };
}
