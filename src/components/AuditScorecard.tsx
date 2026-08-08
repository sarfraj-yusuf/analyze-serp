import React from 'react';
import { SinglePageAudit } from '@/types/seo';
import { CheckCircle2, AlertTriangle, XCircle, Check } from 'lucide-react';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';

interface AuditScorecardProps {
  audit: SinglePageAudit;
}

export const AuditScorecard: React.FC<AuditScorecardProps> = ({ audit }) => {
  if (audit.status === 'error') return null;

  const { meta, wordCount, headings, imageAudit, keywords } = audit;

  // 1. Calculate On-Page SEO Basics Score (0 - 100)
  let score = 0;
  const checklist: { title: string; desc: string; status: 'pass' | 'warn' | 'fail' }[] = [];

  // Check 1: Title Tag (Max 15 pts)
  if (meta.titleLength > 0 && !meta.titleTruncated) {
    score += 15;
    checklist.push({
      title: 'Title Tag Length Optimal',
      desc: `Title tag is ${meta.titleLength} characters (~${meta.titlePixelEstimate}px). It will display cleanly on search engine result pages.`,
      status: 'pass',
    });
  } else if (meta.titleLength === 0) {
    checklist.push({
      title: 'Missing Title Tag',
      desc: 'No <title> tag was found. Add a descriptive title tag containing your primary keyword.',
      status: 'fail',
    });
  } else {
    score += 8;
    checklist.push({
      title: 'Title Tag May Truncate',
      desc: `Title tag is ${meta.titleLength} characters (~${meta.titlePixelEstimate}px). Consider trimming under 60 characters to avoid SERP truncation.`,
      status: 'warn',
    });
  }

  // Check 2: Meta Description (Max 15 pts)
  if (meta.descriptionLength > 0 && !meta.descriptionTruncated) {
    score += 15;
    checklist.push({
      title: 'Meta Description Optimal',
      desc: `Meta description is ${meta.descriptionLength} characters. Great length for driving organic search click-through rates.`,
      status: 'pass',
    });
  } else if (meta.descriptionLength === 0) {
    checklist.push({
      title: 'Missing Meta Description',
      desc: 'No meta description detected. Add a compelling 120-155 character description to boost CTR.',
      status: 'fail',
    });
  } else {
    score += 8;
    checklist.push({
      title: 'Meta Description Too Long',
      desc: `Meta description is ${meta.descriptionLength} characters. Trim to under 160 characters to prevent snippet truncation.`,
      status: 'warn',
    });
  }

  // Check 3: Heading Hierarchy (Max 20 pts)
  const h1Count = headings.filter((h) => h.level === 'h1').length;
  const h2Count = headings.filter((h) => h.level === 'h2').length;

  if (h1Count === 1 && h2Count > 0) {
    score += 20;
    checklist.push({
      title: 'Heading Hierarchy Well-Structured',
      desc: `Page contains exactly 1 H1 tag and ${h2Count} sub-topic H2 headings for clean content organization.`,
      status: 'pass',
    });
  } else if (h1Count === 0) {
    checklist.push({
      title: 'Missing H1 Heading',
      desc: 'No H1 tag found. Ensure your page includes a clear single H1 main title.',
      status: 'fail',
    });
  } else if (h1Count > 1) {
    score += 10;
    checklist.push({
      title: 'Multiple H1 Headings Detected',
      desc: `Detected ${h1Count} H1 tags. Best practice is to use a single H1 tag and structure sub-topics with H2/H3 tags.`,
      status: 'warn',
    });
  } else {
    score += 10;
    checklist.push({
      title: 'Limited Sub-Headings',
      desc: 'Few H2 headings detected. Break up your article with H2 and H3 headings to improve readability.',
      status: 'warn',
    });
  }

  // Check 4: Word Volume Benchmark (Max 20 pts)
  if (wordCount >= 800) {
    score += 20;
    checklist.push({
      title: 'Comprehensive Word Volume',
      desc: `Content body contains ${wordCount.toLocaleString()} words. Provides sufficient topical depth for search engine evaluation.`,
      status: 'pass',
    });
  } else if (wordCount >= 450) {
    score += 14;
    checklist.push({
      title: 'Moderate Content Volume',
      desc: `Content contains ${wordCount} words. Consider adding sub-sections or FAQ topics to expand coverage.`,
      status: 'pass',
    });
  } else if (wordCount >= 250) {
    score += 8;
    checklist.push({
      title: 'Short Content Volume',
      desc: `Content contains ${wordCount} words. Suitable for short pages, but may lack depth for competitive topics.`,
      status: 'warn',
    });
  } else {
    score += 4;
    checklist.push({
      title: 'Thin Content Volume',
      desc: `Content body contains only ${wordCount} words. Expand your article to compete effectively on SERPs.`,
      status: 'fail',
    });
  }

  // Check 5: Image Alt Attributes (Max 15 pts)
  if (imageAudit.totalImages > 0 && imageAudit.missingAltCount === 0) {
    score += 15;
    checklist.push({
      title: 'Image Alt Attributes Optimal',
      desc: `All ${imageAudit.totalImages} images contain descriptive ALT text for search engines and accessibility.`,
      status: 'pass',
    });
  } else if (imageAudit.totalImages === 0) {
    score += 10;
    checklist.push({
      title: 'Text-Only Page (No Images)',
      desc: 'No images detected on page. HTML markup is clean, though adding visual diagrams can improve user engagement.',
      status: 'pass',
    });
  } else {
    const pts = Math.max(0, Math.round(12 - imageAudit.missingAltCount * 2.5));
    score += pts;
    checklist.push({
      title: `${imageAudit.missingAltCount} Images Missing Alt Text`,
      desc: `Found ${imageAudit.missingAltCount} image(s) lacking alt attributes. Add descriptive alt text for accessibility & image search SEO.`,
      status: imageAudit.missingAltCount > 3 ? 'fail' : 'warn',
    });
  }

  // Check 6: Keyword Overuse & Stuffing Check (Max 15 pts)
  const stuffed1Gram = keywords.oneGram.filter((k) => k.isStuffing);
  const stuffed2Gram = (keywords.twoGram || []).filter((k) => k.density > 2.5);
  const stuffed3Gram = (keywords.threeGram || []).filter((k) => k.density > 2.5);
  const hasStuffing = stuffed1Gram.length > 0 || stuffed2Gram.length > 0 || stuffed3Gram.length > 0;

  if (!hasStuffing) {
    score += 15;
    checklist.push({
      title: 'Keyword Density Within Safe Limits',
      desc: 'No keyword stuffing or phrase overuse detected. Keyword distribution appears natural.',
      status: 'pass',
    });
  } else {
    score += 5;
    const overusedPhrase =
      stuffed1Gram[0]?.phrase ||
      stuffed2Gram[0]?.phrase ||
      stuffed3Gram[0]?.phrase ||
      'keyword';

    checklist.push({
      title: 'High Keyword Density Warning',
      desc: `Keyword phrase "${overusedPhrase}" shows high density. Reduce frequency to ensure natural reading flow.`,
      status: 'warn',
    });
  }

  // Grade color styling
  const gradeColor =
    score >= 85
      ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : score >= 65
      ? 'text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-red-600 dark:text-red-400 border-red-500/40 bg-red-500/10';

  const gradeLabel =
    score >= 85
      ? 'Excellent On-Page Basics'
      : score >= 65
      ? 'Good (Minor Tweaks Needed)'
      : 'Needs On-Page Optimization';

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-6 my-6">
      {/* Header Score Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-4">
          {/* Circular / Badge Score Gauge */}
          <div
            className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-md ${gradeColor}`}
          >
            <span className="text-2xl font-black">{score}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
              / 100
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${gradeColor}`}
              >
                {gradeLabel}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
              <span>On-Page SEO Basics Score</span>
              <SEOExplanationTooltip text="Evaluates foundational HTML markup, title/meta length, image alt tags, and keyword safety. Measures technical on-page health — not Google rank position." />
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Automated audit summary evaluating key metadata, content volume, heading hierarchy, image ALT tags, and keyword frequency.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400 sm:self-center shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{checklist.filter((c) => c.status === 'pass').length} Passed</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-2 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{checklist.filter((c) => c.status !== 'pass').length} Action Items</span>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations Checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
          On-Page SEO Basics Checklist ({checklist.length} Checks)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm hover:border-slate-300 dark:hover:border-white/10 transition-all flex items-start gap-3"
            >
              {item.status === 'pass' && (
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
              {item.status === 'warn' && (
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
              {item.status === 'fail' && (
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}

              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{item.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
