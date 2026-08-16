'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TechnicalHealthCard } from '@/components/TechnicalHealthCard';
import { CoreWebVitalsCard } from '@/components/CoreWebVitalsCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { TechnicalAudit } from '@/types/seo';
import {
  Zap,
  Sparkles,
  ArrowLeft,
  Search,
  Globe,
  Lock,
  BookOpen,
  CheckCircle2,
  Users,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

export default function SiteSpeedCheckerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [technicalAudit, setTechnicalAudit] = useState<TechnicalAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      title: '01. Enter Target Website URL',
      description:
        'Submit any webpage URL to trigger real-time server fetch latency measurement and technical DOM evaluation.',
    },
    {
      title: '02. Measure Time to First Byte (TTFB)',
      description:
        'Record server connection setup, DNS lookup speed, and initial HTTP response latency before DOM rendering begins.',
    },
    {
      title: '03. Audit Technical Core Web Vitals Signals',
      description:
        'Analyze Largest Contentful Paint (LCP), Interaction to Next Paint (INP), Cumulative Layout Shift (CLS), and DOM tree depth.',
    },
  ];

  const faqs = [
    {
      question: 'What is a site speed checker tool?',
      answer:
        'A site speed checker tool tests server response latency (TTFB), total fetch timing, and Google Core Web Vitals performance indicators to identify speed bottlenecks.',
    },
    {
      question: 'What is Time to First Byte (TTFB) and why is under 200ms recommended?',
      answer:
        'TTFB measures how fast a web server returns initial data. Maintaining a TTFB under 200ms (Good: <200ms, Acceptable: 200-400ms, Poor: >600ms) ensures rapid browser rendering and prevents page abandonment.',
    },
    {
      question: 'What are the three official Google Core Web Vitals metrics (LCP, INP, CLS)?',
      answer:
        'LCP measures loading speed (<2.5s), INP measures input responsiveness (<200ms), and CLS measures visual layout stability (<0.1).',
    },
    {
      question: 'How does page speed impact Google search rankings and mobile bounce rates?',
      answer:
        'Fast page speed reduces mobile bounce rates (by up to 32% as load time goes from 1s to 3s) and satisfies Google Page Experience ranking signals, directly improving organic search visibility.',
    },
    {
      question: 'How can webmasters fix slow server response times and render-blocking resources?',
      answer:
        'Webmasters can improve TTFB by enabling server-side caching, using a global CDN, minifying CSS/JS bundles, deferring scripts, and serving WebP images.',
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

  const handleCheckSpeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [urlInput.trim()] }),
      });

      if (!res.ok) {
        throw new Error('Failed to audit technical site speed');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setTechnicalAudit(data.results[0].technicalAudit);
        triggerToolExecutionFeedback();
      } else {
        throw new Error(data.results[0]?.errorMessage || 'Failed to analyze technical health');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during speed analysis.');
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
            Site Speed & Core Web Vitals Auditor
          </span>
        </nav>

        {/* Hero Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>Server Response & Core Web Vitals Speed Inspector</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Free Page Speed <br />
            <span className="gradient-text">& Core Web Vitals Auditor</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Using a dedicated <strong>site speed checker</strong> enables webmasters to run a <strong>core web vitals auditor</strong> in seconds. Test <strong>ttfb latency checker</strong> metrics (under 200ms target), measure Google <strong>google pagespeed insights tool</strong> signals (LCP, INP, CLS), compress HTML payload sizes, and strengthen your site’s <strong>mobile page experience signal</strong>.
          </p>
        </header>

        {/* Layer 1: Input Audit Box */}
        <section aria-label="Site Speed Audit Input Form" className="max-w-[830px] mx-auto w-full">
          <div className="glass-panel p-7 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <form onSubmit={handleCheckSpeed} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Enter Webpage URL to Test Speed & Core Web Vitals
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-11 pr-4 py-3.5 sm:py-4 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Auditing Speed & Latency...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Audit Page Speed & Core Web Vitals</span>
                  </>
                )}
              </button>
            </form>

            {/* Privacy Guarantee Badge */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-gray-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>Privacy & Security Guarantee:</strong> All page speed and latency audits are executed transiently in real time. We do not store, log, or track your website speed diagnostics.
              </span>
            </div>
          </div>
        </section>

        {/* Audit Results */}
        {technicalAudit && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Speed Audit Results</h3>
              <TechnicalHealthCard technicalAudit={technicalAudit} />
            </div>

            <CoreWebVitalsCard initialUrl={urlInput} />
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
            How to Use the Site Speed Checker
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
            Real-World Use Cases for Page Speed Auditing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-emerald-600 dark:text-emerald-400">
                E-Commerce Store Owners & Merchants
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Eliminate high cart abandonment rates. Every 100ms delay in page load time reduces mobile conversion rates by 7%. Auditing speed guarantees snappy checkout flows.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-cyan-600 dark:text-cyan-400">
                Technical SEO Specialists & Consultants
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Pass Google Page Experience ranking filters. Audit client sites against official Google Core Web Vitals thresholds (LCP under 2.5s) to preserve organic search traffic.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-indigo-600 dark:text-indigo-400">
                Web Developers & DevOps Engineers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Identify server latency & CDN bottlenecks. Pinpoint high TTFB response times, uncompressed image payloads, and excessive DOM node counts to optimize edge caching.
              </p>
            </div>
          </div>
        </section>

        {/* Layer 4: Deep-Dive Technical Guide (~850 Words with Cited Stats & Google Docs Links) */}
        <article className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-500/20">
              Deep-Dive Technical Guide
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            The Technical Science of Page Speed: Core Web Vitals & TTFB Benchmarks
          </h2>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                1. Time to First Byte (TTFB) Latency Benchmarks
              </h3>
              <p>
                Time to First Byte (TTFB) measures the duration between the browser initiating an HTTP request and receiving the first byte of response data from the server. Maintaining a fast TTFB is essential for initial rendering:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>Good (Fast)</strong>: Less than <strong>200ms</strong>.</li>
                <li><strong>Acceptable (Needs Improvement)</strong>: Between <strong>200ms – 400ms</strong>.</li>
                <li><strong>Poor (Slow Server Response)</strong>: Greater than <strong>600ms</strong>.</li>
              </ul>
              <div className="pt-1">
                <a
                  href="https://web.dev/ttfb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Web.dev TTFB Optimization Guidance <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                2. Google Core Web Vitals Metrics (LCP, INP & CLS)
              </h3>
              <p>
                Google evaluates real-user experience signals through three Core Web Vitals metrics:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>Largest Contentful Paint (LCP)</strong>: Measures perceived loading speed. Target benchmark: <strong>&lt; 2.5 seconds</strong>.</li>
                <li><strong>Interaction to Next Paint (INP)</strong>: Measures page responsiveness to user input. Target benchmark: <strong>&lt; 200 milliseconds</strong>.</li>
                <li><strong>Cumulative Layout Shift (CLS)</strong>: Measures visual stability during loading. Target benchmark: <strong>&lt; 0.1 score</strong>.</li>
              </ul>
              <div className="pt-1">
                <a
                  href="https://web.dev/vitals/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Web.dev Core Web Vitals Standard Guidelines <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                3. Google 1s-to-3s Bounce Rate Study (+32% Bounce Risk)
              </h3>
              <p>
                Research conducted by Google reveals that as page load time increases from 1 second to 3 seconds, the probability of a mobile visitor bouncing increases by <strong>32%</strong>. As load time reaches 5 seconds, bounce probability rises by <strong>90%</strong>.
              </p>
              <div className="pt-1">
                <a
                  href="https://www.thinkwithgoogle.com/marketing-strategies/app-marketing/mobile-page-speed-new-industry-benchmarks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Think with Google Mobile Page Speed Benchmarks Study <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            {/* Cross-Reference Card to Page 3: Technical Health Audit */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Looking for Crawlability, Canonical & Technical Indexing Audits?
              </h4>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                While this tool focuses on pure speed metrics (TTFB, LCP, INP, CLS), for crawling, indexability, HTTPS security, and viewport technical health, check our dedicated{' '}
                <Link
                  href="/technical-health"
                  className="text-emerald-600 dark:text-emerald-400 font-bold underline hover:text-emerald-500"
                >
                  Technical SEO Health Audit Tool
                </Link>.
              </p>
            </div>
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
            Enhance your page performance by combining speed audits with our complete suite of free SEO tools:
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
              href="/contrast-checker"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Color Contrast</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Test W3C WCAG contrast.
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
            Frequently Asked Questions About Page Speed & Core Web Vitals
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
