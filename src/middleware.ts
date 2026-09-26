import { NextRequest, NextResponse } from 'next/server';

const PRODUCTION_HOST = 'analyzeserp.com';
const PRODUCTION_HOST_ALIASES = new Set([PRODUCTION_HOST, `www.${PRODUCTION_HOST}`]);

/**
 * Consolidate production host and protocol variants in one permanent redirect.
 *
 * The checks deliberately apply only to the production host aliases so preview
 * deployments and local development hosts remain accessible. `x-forwarded-proto`
 * is supplied by common reverse proxies (including Vercel); the request URL
 * protocol is retained as a fallback for direct deployments.
 */
export function middleware(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = (forwardedHost ?? request.headers.get('host') ?? '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');

  if (!PRODUCTION_HOST_ALIASES.has(host)) {
    return NextResponse.next();
  }

  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim();
  const protocol = forwardedProtocol ?? request.nextUrl.protocol.replace(':', '');
  const needsCanonicalRedirect = host !== PRODUCTION_HOST || protocol !== 'https';

  if (!needsCanonicalRedirect) {
    return NextResponse.next();
  }

  const canonicalUrl = request.nextUrl.clone();
  canonicalUrl.protocol = 'https:';
  canonicalUrl.hostname = PRODUCTION_HOST;
  canonicalUrl.port = '';

  return NextResponse.redirect(canonicalUrl, 308);
}

export const config = {
  // Run before all public and API routes so every production URL variant is
  // consolidated. Static Next.js assets do not need this extra redirect work.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
