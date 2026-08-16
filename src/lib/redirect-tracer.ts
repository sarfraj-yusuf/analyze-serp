export interface RedirectHop {
  hopNumber: number;
  url: string;
  statusCode: number;
  statusText: string;
  destinationUrl: string | null;
  responseTimeMs: number;
  server: string;
  isHttps: boolean;
  isPermanent: boolean; // 301 or 308
  isTemporary: boolean; // 302 or 307
}

export interface RedirectChainReportData {
  initialUrl: string;
  finalDestinationUrl: string;
  totalHops: number;
  totalLatencyMs: number;
  overallScore: number; // 0 - 100
  hasInfiniteLoop: boolean;
  hasTemporaryRedirectLeak: boolean;
  isDirectRoute: boolean; // 0 redirects
  statusVerdict: 'EXCELLENT' | 'WARNING' | 'CRITICAL_LOOP' | 'BROKEN_CHAIN';
  hops: RedirectHop[];
  recommendations: string[];
  timestamp: string;
}

/**
 * Normalizes URL string cleanly
 */
export function normalizeUrlInput(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * Traces HTTP redirect chain recursively step-by-step
 */
export async function traceRedirectChain(rawUrl: string): Promise<RedirectChainReportData> {
  const initialUrl = normalizeUrlInput(rawUrl);
  const hops: RedirectHop[] = [];
  const visitedUrls = new Set<string>();

  let currentUrl = initialUrl;
  let hasInfiniteLoop = false;
  let hasTemporaryRedirectLeak = false;
  let totalLatencyMs = 0;
  const maxHops = 10;

  for (let hopIndex = 1; hopIndex <= maxHops; hopIndex++) {
    if (visitedUrls.has(currentUrl)) {
      hasInfiniteLoop = true;
      break;
    }
    visitedUrls.add(currentUrl);

    const startTime = Date.now();
    let response: Response;

    try {
      response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual', // Strictly do not auto-follow redirects!
        signal: AbortSignal.timeout(5000), // Enforce 5-second per-hop timeout safeguard
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AnalyzeSERP-RedirectInspector/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
    } catch (err: any) {
      // Record failed connection hop
      const duration = Date.now() - startTime;
      totalLatencyMs += duration;

      hops.push({
        hopNumber: hopIndex,
        url: currentUrl,
        statusCode: 0,
        statusText: 'Connection Failed / DNS Error',
        destinationUrl: null,
        responseTimeMs: duration,
        server: 'Unknown',
        isHttps: currentUrl.startsWith('https://'),
        isPermanent: false,
        isTemporary: false,
      });
      break;
    }

    const duration = Date.now() - startTime;
    totalLatencyMs += duration;

    const statusCode = response.status;
    const statusText = response.statusText || `HTTP ${statusCode}`;
    const locationHeader = response.headers.get('location');
    const serverHeader = response.headers.get('server') || 'Web Server';

    let resolvedDestination: string | null = null;
    if (locationHeader) {
      try {
        resolvedDestination = new URL(locationHeader, currentUrl).href;
      } catch (e) {
        resolvedDestination = locationHeader;
      }
    }

    const isPermanent = statusCode === 301 || statusCode === 308;
    const isTemporary = statusCode === 302 || statusCode === 307;

    if (isTemporary) {
      hasTemporaryRedirectLeak = true;
    }

    hops.push({
      hopNumber: hopIndex,
      url: currentUrl,
      statusCode,
      statusText,
      destinationUrl: resolvedDestination,
      responseTimeMs: duration,
      server: serverHeader,
      isHttps: currentUrl.startsWith('https://'),
      isPermanent,
      isTemporary,
    });

    // Check if redirect continues
    if ((statusCode >= 300 && statusCode < 400) && resolvedDestination) {
      currentUrl = resolvedDestination;
    } else {
      // Reached final destination (200, 404, 500, etc.)
      break;
    }
  }

  const finalDestinationUrl = currentUrl;
  const totalHops = hops.length - 1; // 0 hops means direct 200 OK
  const isDirectRoute = totalHops === 0;

  // Determine overall status verdict and health score
  let statusVerdict: 'EXCELLENT' | 'WARNING' | 'CRITICAL_LOOP' | 'BROKEN_CHAIN' = 'EXCELLENT';
  let overallScore = 100;

  const lastHop = hops[hops.length - 1];

  if (hasInfiniteLoop) {
    statusVerdict = 'CRITICAL_LOOP';
    overallScore = 10;
  } else if (lastHop.statusCode >= 400 || lastHop.statusCode === 0) {
    statusVerdict = 'BROKEN_CHAIN';
    overallScore = 25;
  } else if (totalHops > 2 || hasTemporaryRedirectLeak) {
    statusVerdict = 'WARNING';
    overallScore = Math.max(40, 100 - totalHops * 20 - (hasTemporaryRedirectLeak ? 15 : 0));
  } else if (totalHops > 0) {
    overallScore = 90 - totalHops * 10;
  }

  // Generate actionable SEO recommendations
  const recommendations: string[] = [];

  if (hasInfiniteLoop) {
    recommendations.push(
      'CRITICAL: Infinite Redirect Loop detected! Fix your .htaccess, Nginx rewrite rules, or Cloudflare Page Rules immediately.'
    );
  }

  if (lastHop.statusCode >= 400) {
    recommendations.push(
      `CRITICAL: Final destination URL returned HTTP ${lastHop.statusCode}. Update the redirect target to an active 200 OK page.`
    );
  }

  if (totalHops > 1) {
    recommendations.push(
      `Multi-Hop Chain Warning (${totalHops} redirects): Update Hop 1 directly to "${finalDestinationUrl}" to save ${totalLatencyMs}ms of latency and preserve crawl budget.`
    );
  }

  if (hasTemporaryRedirectLeak) {
    recommendations.push(
      '302/307 Temporary Redirect Detected: Replace 302 redirects with 301 Permanent Redirects to pass 100% Google PageRank / Link Equity.'
    );
  }

  if (!hops[0].isHttps && finalDestinationUrl.startsWith('https://')) {
    recommendations.push(
      'HTTP to HTTPS Migration: Ensure HTTP requests redirect directly to HTTPS in 1 single 301 hop.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Perfect Redirect Architecture! Your page resolves quickly with zero unnecessary redirect hops.'
    );
  }

  return {
    initialUrl,
    finalDestinationUrl,
    totalHops,
    totalLatencyMs,
    overallScore,
    hasInfiniteLoop,
    hasTemporaryRedirectLeak,
    isDirectRoute,
    statusVerdict,
    hops,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}
