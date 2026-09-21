'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ContrastPreviewController } from '@/components/ContrastPreviewController';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { ContrastReportData } from '@/lib/contrast-analyzer';
import { CompactToolDock } from '@/components/CompactToolDock';
import {
  Palette,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Search,
  ArrowLeft,
  Lock,
  BookOpen,
  CheckCircle2,
  Users,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Zap,
  Eye,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

const DEFAULT_SAMPLE_REPORT: ContrastReportData = {
  url: 'Interactive Sandbox Specimen',
  overallScore: 92,
  totalPairsAudited: 4,
  passedAaCount: 4,
  passedAaaCount: 3,
  failedCount: 0,
  brandPalette: ['#090d16', '#10b981', '#06b6d4', '#f8fafc', '#64748b'],
  timestamp: new Date().toISOString(),
  pairs: [
    {
      element: 'Primary Action Button',
      selector: 'button.btn-primary',
      fgColor: '#000000',
      bgColor: '#10B981',
      ratio: 10.42,
      wcagAaNormal: true,
      wcagAaLarge: true,
      wcagAaaNormal: true,
      suggestedFgColor: '#000000',
      suggestedBgColor: '#10B981',
      recommendation: 'Exceeds WCAG AAA requirements. Excellent legibility.',
    },
    {
      element: 'Hero Headline',
      selector: 'h1.text-hero',
      fgColor: '#F8FAFC',
      bgColor: '#090D16',
      ratio: 18.25,
      wcagAaNormal: true,
      wcagAaLarge: true,
      wcagAaaNormal: true,
      suggestedFgColor: '#F8FAFC',
      suggestedBgColor: '#090D16',
      recommendation: 'Exceptional contrast. Meets all WCAG AAA standards.',
    },
    {
      element: 'Secondary Body Copy',
      selector: 'p.text-muted',
      fgColor: '#94A3B8',
      bgColor: '#090D16',
      ratio: 7.21,
      wcagAaNormal: true,
      wcagAaLarge: true,
      wcagAaaNormal: true,
      suggestedFgColor: '#94A3B8',
      suggestedBgColor: '#090D16',
      recommendation: 'Passes AAA for normal copy.',
    },
    {
      element: 'Accent Badge Link',
      selector: 'a.badge-link',
      fgColor: '#06B6D4',
      bgColor: '#090D16',
      ratio: 7.84,
      wcagAaNormal: true,
      wcagAaLarge: true,
      wcagAaaNormal: true,
      suggestedFgColor: '#06B6D4',
      suggestedBgColor: '#090D16',
      recommendation: 'Vibrant accent with high contrast compliance.',
    },
  ],
};

export default function ColorContrastCheckerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ContrastReportData | null>(DEFAULT_SAMPLE_REPORT);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      title: '01. Enter Target Webpage URL',
      description:
        'Submit any landing page URL to trigger server-side DOM parsing and CSS background/text color pair extraction.',
    },
    {
      title: '02. Compute W3C Relative Luminance & Contrast Ratios',
      description:
        'Our algorithm calculates official W3C relative luminance values and tests color pairs against WCAG 2.1 AA (4.5:1) and AAA (7.0:1) requirements.',
    },
    {
      title: '03. Tweak Live Color Controller & Apply Suggestions',
      description:
        'Select color pairs or tweak Hex values live in our interactive sandbox preview to achieve 100% WCAG visual accessibility compliance.',
    },
  ];

  const faqs = [
    {
      question: 'What is a color contrast checker tool?',
      answer:
        'A color contrast checker tool measures the relative brightness between foreground text and background elements to determine whether a webpage meets W3C WCAG 2.1 visual accessibility standards.',
    },
    {
      question: 'What is the minimum WCAG 2.1 AA contrast ratio for web text?',
      answer:
        'WCAG 2.1 Level AA requires a minimum contrast ratio of 4.5:1 for standard body text and 3.0:1 for large text (18pt+ or 14pt bold+).',
    },
    {
      question: 'What is the difference between WCAG AA and WCAG AAA compliance?',
      answer:
        'Level AA is the standard legal and web benchmark (4.5:1 minimum). Level AAA is the enhanced gold standard (7.0:1 minimum) designed for high-contrast accessibility requirements.',
    },
    {
      question: 'Why does color contrast impact mobile usability and Google rankings?',
      answer:
        'Low color contrast makes text unreadable under bright sunlight on mobile devices, increasing bounce rates and degrading user engagement signals evaluated by search engines.',
    },
    {
      question: 'How is color contrast ratio mathematically calculated?',
      answer:
        'Color contrast ratio is calculated using relative luminance values derived from sRGB color space components: Contrast Ratio = (L1 + 0.05) / (L2 + 0.05), ranging from 1:1 (identical colors) to 21:1 (black on white).',
    },
  ];

  // FAQPage JSON-LD Structured Data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
      setUrlInput(targetUrl);
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contrast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to analyze color contrast.');
      }

      const json = await res.json();
      setReport(json.report);
      triggerToolExecutionFeedback();
    } catch (err: any) {
      setError(
        err.message ||
          'Unable to automatically extract CSS colors from this page. You can still test any custom color pair using our Live Color Sandbox below!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      {/* FAQ Schema Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-emerald-500 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Audit Suite</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-100 font-medium">WCAG Color Contrast</span>
        </nav>

        {/* Compact App-First Header */}
        <header className="space-y-2 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Palette className="w-3 h-3" />
            <span>WCAG 2.1 Accessibility</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
            WCAG 2.1 Color Contrast Checker
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Audit webpage color accessibility, test W3C relative luminance ratios against WCAG 2.1 AA (4.5:1) &amp; AAA (7.0:1) thresholds, and tweak hex values in real time.
          </p>
        </header>

        {/* Top-Fold Tool Input Dock & Live Sandbox */}
        <section aria-label="Color Contrast Audit Input Form" className="space-y-6">
          <div className="max-w-3xl mx-auto glass-panel hero-input-dock rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.08] space-y-4">
            <form onSubmit={handleAudit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="example.com or https://example.com/landing-page"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-50 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Extract Live Colors</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero data logging · Client-side analysis</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">WCAG AA: &ge;4.5:1 · WCAG AAA: &ge;7.0:1</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Interactive Live Controller & Sandbox always available */}
          {report && (
            <div className="animate-in fade-in duration-200">
              <ContrastPreviewController report={report} />
            </div>
          )}
        </section>

        {/* Editorial SEO & Accessibility Knowledge Container */}
        <div className="max-w-5xl mx-auto w-full space-y-16 pt-10 border-t border-slate-200/80 dark:border-white/[0.08]">
          {/* 1. 3-Step How-To-Use Workflow */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Usage & Workflow</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                How to Use the Color Contrast Checker
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Audit foreground-to-background contrast ratios and guarantee WCAG 2.2 accessibility in 3 simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-2 relative shadow-xs"
                >
                  <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06]">
                    STEP 0{idx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    {step.title.replace(/^\d+\.\s*/, '')}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Persona Target Chips */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Who Uses This:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>UI/UX Designers:</strong> Build WCAG-compliant design tokens & color systems
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Frontend Devs:</strong> Pass Lighthouse & axe-core accessibility checks
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Conversion Specialists:</strong> Increase mobile CTA button click-through rates
                </span>
              </div>
            </div>
          </section>

          {/* 2. 4-Pillar Visual Accessibility Architecture (2x2 Bento Grid) */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Compliance & Science</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                The Science of Color Contrast: WCAG 2.2 AA vs AAA Standards
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                International visual legibility guidelines that determine search readability, legal compliance, and conversion efficiency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: WCAG 2.2 Level AA */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Legal Baseline
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      WCAG 2.2 Level AA
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    1. Mandatory Level AA Contrast Minimums
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The baseline legal standard across the US (ADA Section 508) and EU (EN 301 549). Ensures standard body copy and navigation controls remain readable for moderate visual impairments.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Standard Body Text (&lt;24px):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&ge; 4.5:1</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Large Text (&ge;24px or &ge;18.5px bold):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&ge; 3.0:1</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>UI Components & Focus Borders:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&ge; 3.0:1</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.w3.org/TR/WCAG21/#contrast-minimum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>W3C WCAG 2.2 Guideline 1.4.3 Minimum Contrast</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 2: WCAG Level AAA */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Enhanced Legibility
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/20">
                      WCAG 2.2 Level AAA
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    2. Enhanced Level AAA Legibility
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The gold standard for government websites, healthcare portals, and high-readability interfaces. Guarantees visual comfort for seniors and users experiencing screen glare.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Normal Text Enhanced Ratio:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">&ge; 7.0:1</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Large Text Enhanced Ratio:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">&ge; 4.5:1</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Target Audience Coverage:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">Low Vision & Glare</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.w3.org/TR/WCAG21/#contrast-enhanced"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>W3C WCAG 2.2 Guideline 1.4.6 Enhanced Contrast</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 3: Relative Luminance Math */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Palette className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Mathematics
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/20">
                      (L1+0.05)/(L2+0.05)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    3. Relative Luminance Calculation
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    W3C defines color contrast ratio from the normalized sRGB relative luminance values of foreground and background colors, reflecting real human eye sensitivity.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Maximum Scale (Black on White):</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">21.0:1</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Optimal Digital Reading Range:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">7.0:1 – 14.0:1</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Zero Contrast (Identical Colors):</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">1.0:1 (Fail)</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.w3.org/WAI/GL/wiki/Relative_luminance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>W3C Relative Luminance Technical Specification</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 4: Google Search UX Synergy */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Search Signals
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                      UX & Engagement
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    4. Accessibility as a Google Search Signal
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Google Search Central highlights accessible page layouts as vital for positive user engagement. Unreadable low-contrast copy spikes mobile bounce rates and harms Core Web Vitals interaction.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Lighthouse Accessibility Weight:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Mandatory Factor</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Mobile Outdoor Legibility:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Prevents Bounces</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>CTA Conversion Uplift:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Up to +34%</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/fundamentals/accessibility"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central Accessibility Guidance</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

          {/* 3. Frequently Asked Questions (Accordion) */}
          <section className="space-y-6 max-w-4xl mx-auto">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Common Questions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Frequently Asked Questions About Color Contrast
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Essential insights into WCAG 2.2 AA ratios, calculation mathematics, and search impact.
              </p>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className={`rounded-xl border transition-colors duration-150 ${
                      isOpen
                        ? 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-300 dark:border-white/15'
                        : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      aria-controls={`faq-answer-${index}`}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-emerald-500' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-hidden={!isOpen}
                        className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 leading-relaxed"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Complementary Diagnostic Engines */}
          <CompactToolDock currentTool="contrast-checker" />
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
