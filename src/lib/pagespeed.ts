export interface CoreWebVitalsMetric {
  value: number;
  displayValue: string;
  category: 'FAST' | 'AVERAGE' | 'SLOW'; // Good, Needs Improvement, Poor
  score: number; // 0 - 1
  source?: 'field' | 'origin' | 'lab';
  label?: string;
}

export interface SpeedOpportunityItem {
  url?: string;
  totalBytes?: number;
  wastedBytes?: number;
  wastedMs?: number;
  label?: string;
}

export interface SpeedOpportunity {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
  score: number;
  wastedMs?: number;
  wastedBytes?: number;
  items?: SpeedOpportunityItem[];
}

export interface SpeedDiagnostic {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
  score?: number | null;
}

export interface PassedAudit {
  id: string;
  title: string;
  description?: string;
}

export interface CoreWebVitalsData {
  url: string;
  strategy: 'mobile' | 'desktop';
  performanceScore: number; // 0 - 100
  seoScore?: number; // 0 - 100
  accessibilityScore?: number; // 0 - 100
  bestPracticesScore?: number; // 0 - 100
  coreWebVitalsPassed: boolean;
  lcp: CoreWebVitalsMetric; // Largest Contentful Paint (s)
  inp: CoreWebVitalsMetric; // Interaction to Next Paint (ms)
  cls: CoreWebVitalsMetric; // Cumulative Layout Shift
  fcp: CoreWebVitalsMetric; // First Contentful Paint (s)
  ttfb: CoreWebVitalsMetric; // Time to First Byte (ms)
  speedIndex?: CoreWebVitalsMetric; // Speed Index (s)
  opportunities: SpeedOpportunity[];
  diagnostics: SpeedDiagnostic[];
  passedAudits: PassedAudit[];
  timestamp: string;
  isCached?: boolean;
}

/**
 * Fetches Google PageSpeed Insights API v5 data with CrUX Field & Lighthouse metrics.
 * Runs multi-pillar audit: Performance, SEO, Accessibility, Best Practices.
 */
export async function fetchGooglePageSpeedData(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<CoreWebVitalsData | null> {
  try {
    const apiKey = process.env.PAGESPEED_API_KEY || '';
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&strategy=${strategy}&category=performance&category=seo&category=accessibility&category=best-practices${
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
    const originCrux = json.originLoadingExperience;

    if (!lighthouse) return null;

    const categories = lighthouse.categories || {};
    const performanceScore = Math.round(
      (categories.performance?.score || 0) * 100
    );
    const seoScore = typeof categories.seo?.score === 'number'
      ? Math.round(categories.seo.score * 100)
      : undefined;
    const accessibilityScore = typeof categories.accessibility?.score === 'number'
      ? Math.round(categories.accessibility.score * 100)
      : undefined;
    const bestPracticesScore = typeof categories['best-practices']?.score === 'number'
      ? Math.round(categories['best-practices'].score * 100)
      : undefined;

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
      source: 'lab',
    };

    // 2. INP (Interaction to Next Paint) - Authentic CrUX Field metric with explicit TBT Lab Fallback
    const cruxInp = crux?.metrics?.INTERACTION_TO_NEXT_PAINT;
    const originInp = originCrux?.metrics?.INTERACTION_TO_NEXT_PAINT;
    const tbtAudit = audits['total-blocking-time'] || {};

    let inp: CoreWebVitalsMetric;

    if (cruxInp && typeof cruxInp.percentile === 'number') {
      const inpVal = Math.round(cruxInp.percentile);
      const inpCategory: 'FAST' | 'AVERAGE' | 'SLOW' =
        cruxInp.category === 'FAST'
          ? 'FAST'
          : cruxInp.category === 'SLOW'
          ? 'SLOW'
          : inpVal <= 200
          ? 'FAST'
          : inpVal <= 500
          ? 'AVERAGE'
          : 'SLOW';

      inp = {
        value: inpVal,
        displayValue: `${inpVal} ms`,
        category: inpCategory,
        score: inpCategory === 'FAST' ? 1 : inpCategory === 'AVERAGE' ? 0.65 : 0.2,
        source: 'field',
        label: 'CrUX Field Data',
      };
    } else if (originInp && typeof originInp.percentile === 'number') {
      const inpVal = Math.round(originInp.percentile);
      const inpCategory: 'FAST' | 'AVERAGE' | 'SLOW' =
        originInp.category === 'FAST'
          ? 'FAST'
          : originInp.category === 'SLOW'
          ? 'SLOW'
          : inpVal <= 200
          ? 'FAST'
          : inpVal <= 500
          ? 'AVERAGE'
          : 'SLOW';

      inp = {
        value: inpVal,
        displayValue: `${inpVal} ms`,
        category: inpCategory,
        score: inpCategory === 'FAST' ? 1 : inpCategory === 'AVERAGE' ? 0.65 : 0.2,
        source: 'origin',
        label: 'Origin CrUX Field',
      };
    } else {
      // When URL has insufficient real-user CrUX field traffic, use Lighthouse Total Blocking Time as honest lab proxy
      const tbtVal = Math.round(tbtAudit.numericValue ?? 150);
      const tbtCategory: 'FAST' | 'AVERAGE' | 'SLOW' =
        tbtVal <= 200 ? 'FAST' : tbtVal <= 600 ? 'AVERAGE' : 'SLOW';

      inp = {
        value: tbtVal,
        displayValue: `${tbtVal} ms (Lab TBT)`,
        category: tbtCategory,
        score: tbtAudit.score ?? (tbtCategory === 'FAST' ? 1 : tbtCategory === 'AVERAGE' ? 0.65 : 0.2),
        source: 'lab',
        label: 'TBT Lab Proxy (No CrUX Field Data)',
      };
    }

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

    // 6. Speed Index
    const speedIndexAudit = audits['speed-index'] || {};
    const speedIndexVal = (speedIndexAudit.numericValue || 2500) / 1000;
    const speedIndexCategory: 'FAST' | 'AVERAGE' | 'SLOW' =
      speedIndexVal <= 3.4 ? 'FAST' : speedIndexVal <= 5.8 ? 'AVERAGE' : 'SLOW';

    const speedIndex: CoreWebVitalsMetric = {
      value: Number(speedIndexVal.toFixed(2)),
      displayValue: speedIndexAudit.displayValue || `${speedIndexVal.toFixed(1)} s`,
      category: speedIndexCategory,
      score: speedIndexAudit.score || 0,
    };

    // Official Core Web Vitals Pass / Fail evaluation (LCP <= 2.5s, INP <= 200ms, CLS <= 0.1)
    const coreWebVitalsPassed = lcp.category === 'FAST' && inp.category === 'FAST' && cls.category === 'FAST';

    // Extract Speed Opportunities & Itemized Details
    const opportunities: SpeedOpportunity[] = [];
    const diagnostics: SpeedDiagnostic[] = [];
    const passedAudits: PassedAudit[] = [];

    Object.keys(audits).forEach((key) => {
      const audit = audits[key];
      if (!audit) return;

      // Opportunities (score < 0.9 and opportunity details)
      if (
        audit.details &&
        audit.details.type === 'opportunity' &&
        audit.score !== null &&
        audit.score < 0.9
      ) {
        const items: SpeedOpportunityItem[] = [];
        if (Array.isArray(audit.details.items)) {
          audit.details.items.slice(0, 5).forEach((item: any) => {
            items.push({
              url: item.url,
              totalBytes: item.totalBytes,
              wastedBytes: item.wastedBytes,
              wastedMs: item.wastedMs,
              label: item.label,
            });
          });
        }

        opportunities.push({
          id: key,
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue,
          score: audit.score,
          wastedMs: audit.details.overallSavingsMs,
          wastedBytes: audit.details.overallSavingsBytes,
          items,
        });
      }
      // Diagnostics (informational audits with scores or metrics)
      else if (
        audit.details &&
        audit.details.type === 'table' &&
        audit.score !== null &&
        audit.score < 0.9 &&
        !['largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'first-contentful-paint', 'speed-index'].includes(key)
      ) {
        diagnostics.push({
          id: key,
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue,
          score: audit.score,
        });
      }
      // Passed Audits
      else if (audit.score === 1 && audit.title) {
        passedAudits.push({
          id: key,
          title: audit.title,
          description: audit.description,
        });
      }
    });

    // Sort opportunities by largest impact (wastedMs or wastedBytes)
    opportunities.sort((a, b) => {
      const aImpact = (a.wastedMs || 0) * 10 + (a.wastedBytes || 0) / 1024;
      const bImpact = (b.wastedMs || 0) * 10 + (b.wastedBytes || 0) / 1024;
      return bImpact - aImpact;
    });

    return {
      url,
      strategy,
      performanceScore,
      seoScore,
      accessibilityScore,
      bestPracticesScore,
      coreWebVitalsPassed,
      lcp,
      inp,
      cls,
      fcp,
      ttfb,
      speedIndex,
      opportunities: opportunities.slice(0, 10),
      diagnostics: diagnostics.slice(0, 8),
      passedAudits: passedAudits.slice(0, 20),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in fetchGooglePageSpeedData:', error);
    return null;
  }
}
