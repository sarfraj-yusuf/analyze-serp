export interface CoreWebVitalsMetric {
  value: number;
  displayValue: string;
  category: 'FAST' | 'AVERAGE' | 'SLOW'; // Good, Needs Improvement, Poor
  score: number; // 0 - 1
}

export interface SpeedOpportunity {
  title: string;
  description: string;
  displayValue?: string;
  score: number;
}

export interface CoreWebVitalsData {
  url: string;
  strategy: 'mobile' | 'desktop';
  performanceScore: number; // 0 - 100
  lcp: CoreWebVitalsMetric; // Largest Contentful Paint (s)
  inp: CoreWebVitalsMetric; // Interaction to Next Paint (ms)
  cls: CoreWebVitalsMetric; // Cumulative Layout Shift
  fcp: CoreWebVitalsMetric; // First Contentful Paint (s)
  ttfb: CoreWebVitalsMetric; // Time to First Byte (ms)
  opportunities: SpeedOpportunity[];
  timestamp: string;
  isCached?: boolean;
}

/**
 * Fetches Google PageSpeed Insights API v5 data with CrUX Field & Lighthouse metrics.
 */
export async function fetchGooglePageSpeedData(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<CoreWebVitalsData | null> {
  try {
    const apiKey = process.env.PAGESPEED_API_KEY || '';
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&strategy=${strategy}${
      apiKey ? `&key=${apiKey}` : ''
    }`;

    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 3600 }, // 1 hour revalidate
    });

    if (!res.ok) {
      console.warn(`PageSpeed API returned status ${res.status} for ${url}`);
      return null;
    }

    const json = await res.json();
    const lighthouse = json.lighthouseResult;
    const crux = json.loadingExperience;

    if (!lighthouse) return null;

    const categories = lighthouse.categories || {};
    const performanceScore = Math.round(
      (categories.performance?.score || 0) * 100
    );

    const audits = lighthouse.audits || {};

    // 1. LCP (Largest Contentful Paint)
    const lcpAudit = audits['largest-contentful-paint'] || {};
    const lcpVal = (lcpAudit.numericValue || 2500) / 1000;
    const lcpCategory: 'FAST' | 'AVERAGE' | 'SLOW' =
      lcpVal <= 2.5 ? 'FAST' : lcpVal <= 4.0 ? 'AVERAGE' : 'SLOW';

    const lcp: CoreWebVitalsMetric = {
      value: Number(lcpVal.toFixed(2)),
      displayValue: lcpAudit.displayValue || `${lcpVal.toFixed(1)} s`,
      category: lcpCategory,
      score: lcpAudit.score || 0,
    };

    // 2. INP / TBT (Interaction to Next Paint / Total Blocking Time)
    const inpAudit = audits['interactive'] || audits['total-blocking-time'] || {};
    const inpVal = inpAudit.numericValue || 150;
    const inpCategory: 'FAST' | 'AVERAGE' | 'SLOW' =
      inpVal <= 200 ? 'FAST' : inpVal <= 500 ? 'AVERAGE' : 'SLOW';

    const inp: CoreWebVitalsMetric = {
      value: Math.round(inpVal),
      displayValue: `${Math.round(inpVal)} ms`,
      category: inpCategory,
      score: inpAudit.score || 0,
    };

    // 3. CLS (Cumulative Layout Shift)
    const clsAudit = audits['cumulative-layout-shift'] || {};
    const clsVal = clsAudit.numericValue || 0.05;
    const clsCategory: 'FAST' | 'AVERAGE' | 'SLOW' =
      clsVal <= 0.1 ? 'FAST' : clsVal <= 0.25 ? 'AVERAGE' : 'SLOW';

    const cls: CoreWebVitalsMetric = {
      value: Number(clsVal.toFixed(3)),
      displayValue: clsAudit.displayValue || `${clsVal.toFixed(2)}`,
      category: clsCategory,
      score: clsAudit.score || 0,
    };

    // 4. FCP (First Contentful Paint)
    const fcpAudit = audits['first-contentful-paint'] || {};
    const fcpVal = (fcpAudit.numericValue || 1800) / 1000;
    const fcpCategory: 'FAST' | 'AVERAGE' | 'SLOW' =
      fcpVal <= 1.8 ? 'FAST' : fcpVal <= 3.0 ? 'AVERAGE' : 'SLOW';

    const fcp: CoreWebVitalsMetric = {
      value: Number(fcpVal.toFixed(2)),
      displayValue: fcpAudit.displayValue || `${fcpVal.toFixed(1)} s`,
      category: fcpCategory,
      score: fcpAudit.score || 0,
    };

    // 5. TTFB (Server Response Time)
    const ttfbAudit = audits['server-response-time'] || {};
    const ttfbVal = ttfbAudit.numericValue || 200;
    const ttfbCategory: 'FAST' | 'AVERAGE' | 'SLOW' =
      ttfbVal <= 200 ? 'FAST' : ttfbVal <= 600 ? 'AVERAGE' : 'SLOW';

    const ttfb: CoreWebVitalsMetric = {
      value: Math.round(ttfbVal),
      displayValue: `${Math.round(ttfbVal)} ms`,
      category: ttfbCategory,
      score: ttfbAudit.score || 0,
    };

    // Extract Speed Opportunities
    const opportunities: SpeedOpportunity[] = [];
    Object.keys(audits).forEach((key) => {
      const audit = audits[key];
      if (
        audit.details &&
        audit.details.type === 'opportunity' &&
        audit.score !== null &&
        audit.score < 0.9
      ) {
        opportunities.push({
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue,
          score: audit.score,
        });
      }
    });

    return {
      url,
      strategy,
      performanceScore,
      lcp,
      inp,
      cls,
      fcp,
      ttfb,
      opportunities: opportunities.slice(0, 6),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in fetchGooglePageSpeedData:', error);
    return null;
  }
}
