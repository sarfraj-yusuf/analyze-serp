'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ContrastPreviewController } from '@/components/ContrastPreviewController';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { ContrastReportData } from '@/lib/contrast-analyzer';
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
} from 'lucide-react';
import Link from 'next/link';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

export default function ColorContrastCheckerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ContrastReportData | null>(null);
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

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contrast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="text-slate-400 dark:text-gray-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            Color Contrast & WCAG Auditor
          </span>
        </nav>

        {/* Hero Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm">
            <Palette className="w-3.5 h-3.5" />
            <span>Website Color Contrast & WCAG Accessibility Inspector</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Free Color Contrast <br />
            <span className="gradient-text">Checker & WCAG Auditor</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Using a dedicated <strong>color contrast checker</strong> allows designers and developers to run a <strong>wcag accessibility auditor</strong> in real time. Calculate relative luminance ratios, test <strong>wcag 2.1 aa ratio tester</strong> compliance (4.5:1 normal text, 3:1 large text), analyze custom hex palette pairs with our <strong>hex color contrast analyzer</strong>, and strengthen your site’s <strong>google accessibility search signal</strong>.
          </p>
        </header>

        {/* Layer 1: Input Audit Box & Manual Sandbox Option */}
        <section aria-label="Color Contrast Audit Input Form" className="max-w-[830px] mx-auto w-full">
          <div className="glass-panel p-7 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <form onSubmit={handleAudit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Enter Webpage URL to Extract Colors
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/landing-page"
                    className="w-full pl-4 pr-4 py-3.5 sm:py-4 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Scraping Note / Fallback Alert:</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Colors & Calculating Ratios...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Audit Color Contrast & WCAG Ratios</span>
                  </>
                )}
              </button>
            </form>

            {/* Privacy Guarantee Badge */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-gray-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>Privacy & Security Guarantee:</strong> Color contrast testing is executed locally in real time. We do not store, log, or collect your design tokens or color palettes.
              </span>
            </div>
          </div>
        </section>

        {/* Audit Results & Interactive Live Controller */}
        {report && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <ContrastPreviewController report={report} />
          </div>
        )}

        {/* Layer 2: 3-Step How-To-Use Visual Grid */}
        <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Usage Guide
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            How to Use the Color Contrast Checker
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 relative overflow-hidden shadow-sm"
              >
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Layer 3: Real-World Persona Use Cases */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Use Cases & Benchmarks
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Real-World Use Cases for Visual Contrast Auditing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-emerald-600 dark:text-emerald-400">
                UI/UX Designers & Product Managers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Build WCAG-compliant design systems. Test brand typography and background color combinations before launching design tokens to ensure readable interfaces for low-vision users.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-cyan-600 dark:text-cyan-400">
                Frontend Developers & Engineers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Pass automated Lighthouse & WCAG 2.1 AA audits. Audit extracted CSS color pairs across buttons, body paragraphs, and navigation links to fix low-contrast accessibility errors.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-indigo-600 dark:text-indigo-400">
                SEO Copywriters & Conversion Specialists
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Increase Call-to-Action (CTA) button conversion rates. High-contrast CTA buttons stand out visually on mobile screens, reducing reader friction and increasing button click-through rates.
              </p>
            </div>
          </div>
        </section>

        {/* Layer 4: Deep-Dive Technical Guide (~800 Words with Cited Stats & Google Docs Links) */}
        <article className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-500/20">
              Deep-Dive Technical Guide
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            The Mathematics of Color Contrast: WCAG 2.1 AA vs AAA Standards
          </h2>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                1. Understanding Relative Luminance Formula (L1 / L2)
              </h3>
              <p>
                W3C defines color contrast ratio as the relative brightness of two colors, calculated from their sRGB component values normalized for human visual perception:
              </p>
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-white/10">
                Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)
              </div>
              <p>
                where <code>L1</code> is the relative luminance of the lighter color and <code>L2</code> is the relative luminance of the darker color. The resulting ratio ranges from <code>1:1</code> (zero contrast, e.g., white text on white background) to <code>21:1</code> (maximum contrast, e.g., black text on white background).
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                2. WCAG 2.1 Level AA Standards (Minimum Legibility Threshold)
              </h3>
              <p>
                The Web Content Accessibility Guidelines (WCAG) 2.1 Level AA requirement establishes mandatory contrast minimums:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>Normal Text (under 18pt / 24px or under 14pt / 18.5px bold)</strong>: Minimum <strong>4.5:1</strong> contrast ratio.</li>
                <li><strong>Large Text (18pt / 24px+ or 14pt / 18.5px+ bold)</strong>: Minimum <strong>3.0:1</strong> contrast ratio.</li>
                <li><strong>UI Components & Graphical Objects</strong>: Minimum <strong>3.0:1</strong> contrast ratio.</li>
              </ul>
              <div className="pt-1">
                <a
                  href="https://www.w3.org/TR/WCAG21/#contrast-minimum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: W3C WCAG 2.1 Guideline 1.4.3 Minimum Contrast Standard <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                3. WCAG 2.1 Level AAA Standards (Enhanced Legibility)
              </h3>
              <p>
                Level AAA represents the gold standard for visual accessibility:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>Normal Text</strong>: Minimum <strong>7.0:1</strong> contrast ratio.</li>
                <li><strong>Large Text</strong>: Minimum <strong>4.5:1</strong> contrast ratio.</li>
              </ul>
              <div className="pt-1">
                <a
                  href="https://www.w3.org/TR/WCAG21/#contrast-enhanced"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: W3C WCAG 2.1 Guideline 1.4.6 Enhanced Contrast Standard <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                4. Accessibility as a Google Search User Experience Signal
              </h3>
              <p>
                While WCAG compliance is an ethical and legal web standard, Google's Search Central documentation explicitly notes that accessible page layouts prevent reader frustration and reduce bounce rates, directly contributing to strong Core Web Vitals and user engagement signals.
              </p>
              <div className="pt-1">
                <a
                  href="https://developers.google.com/search/docs/fundamentals/accessibility"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Search Central Guidance on Accessible Web Design <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>
          </div>
        </article>

        {/* Layer 5: Dedicated Internal Cross-Linking Section: Explore Related AnalyzeSERP Tools */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Related AnalyzeSERP Tools
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Explore Related SEO & Content Optimization Utilities
          </h3>

          <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
            Enhance your site's visual accessibility by combining contrast audits with our complete suite of free SEO tools:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
            <Link
              href="/serp-snippet-preview"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>SERP Preview</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Test title tag width & meta.
                </p>
              </div>
            </Link>

            <Link
              href="/affiliate-link-checker"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Affiliate Auditor</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Audit rel="sponsored".
                </p>
              </div>
            </Link>

            <Link
              href="/technical-health"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Technical Health</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Audit SSL & indexation.
                </p>
              </div>
            </Link>

            <Link
              href="/readability"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Readability</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Analyze Flesch grade.
                </p>
              </div>
            </Link>

            <Link
              href="/redirect-checker"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Redirect Auditor</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Trace 301/302 HTTP chains.
                </p>
              </div>
            </Link>

            <Link
              href="/site-speed-checker"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Site Speed</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Test TTFB & Core Web Vitals.
                </p>
              </div>
            </Link>

            <Link
              href="/pdf-reports"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>PDF Reports</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Build white-label audits.
                </p>
              </div>
            </Link>

            <Link
              href="/"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Competitor Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Compare 5 competitor URLs.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Layer 6: Frequently Asked Questions Accordion + JSON-LD Schema */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions About Color Contrast & Accessibility
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-controls={`faq-answer-${index}`}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
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
                      className="px-6 pb-4 pt-2 text-xs text-slate-600 dark:text-gray-300 border-t border-slate-100 dark:border-white/5 leading-relaxed"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
