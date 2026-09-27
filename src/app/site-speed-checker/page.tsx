'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TechnicalHealthCard } from '@/components/TechnicalHealthCard';
import { CoreWebVitalsCard } from '@/components/CoreWebVitalsCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { TechnicalAudit } from '@/types/seo';
import { CompactToolDock } from '@/components/CompactToolDock';
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
  Clock,
  Gauge,
  Activity,
  Layers,
  Check,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

const SAMPLE_DEMO_URLS = [
  'stripe.com',
  'github.com',
  'wikipedia.org',
  'example.com',
];

function SiteSpeedCheckerContent() {
  const searchParams = useSearchParams();
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeAuditedUrl, setActiveAuditedUrl] = useState('');
  const [auditRunId, setAuditRunId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [technicalAudit, setTechnicalAudit] = useState<TechnicalAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const runAuditForUrl = async (rawUrl: string) => {
    if (!rawUrl.trim()) return;

    let targetUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    setUrlInput(targetUrl);
    setActiveAuditedUrl(targetUrl);
    setAuditRunId(Date.now());
    setTechnicalAudit(null);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [targetUrl] }),
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

  const handleCheckSpeed = async (e: React.FormEvent) => {
    e.preventDefault();
    await runAuditForUrl(urlInput);
  };

  // Support deep-linking via ?url= query parameter
  useEffect(() => {
    const urlQuery = searchParams.get('url');
    if (urlQuery && !activeAuditedUrl) {
      runAuditForUrl(urlQuery);
    }
  }, [searchParams]);

  const steps = [
    {
      title: '01. Enter Target Website URL',
      description:
        'Submit any webpage URL to trigger real-time Google PageSpeed Insights laboratory evaluation and Chrome User Experience (CrUX) field data lookup.',
    },
    {
      title: '02. Audit Core Web Vitals & Diagnostics',
      description:
        'Evaluate 4 Google Lighthouse pillars (Performance, SEO, Best Practices, Accessibility) alongside LCP, INP, CLS, FCP, TTFB, and Speed Index.',
    },
    {
      title: '03. Apply Copy-Ready Code Fixes',
      description:
        'Expand step-by-step resolution guides with tailored, copyable code snippets for Next.js/React, WordPress, or your Nginx/Apache web server.',
    },
  ];

  const faqs = [
    {
      question: 'What is a Google PageSpeed & Core Web Vitals checker tool?',
      answer:
        'A Core Web Vitals and site speed checker evaluates real-world loading speed (LCP), user responsiveness (INP), and visual stability (CLS) against Google Page Experience ranking thresholds.',
    },
    {
      question: 'What are the three official Google Core Web Vitals metrics (LCP, INP, CLS)?',
      answer:
        'LCP (Largest Contentful Paint) measures loading speed (Good: <=2.5s), INP (Interaction to Next Paint) measures user input responsiveness (Good: <=200ms), and CLS (Cumulative Layout Shift) measures visual layout stability (Good: <=0.10).',
    },
    {
      question: 'What is Time to First Byte (TTFB) and why is under 200ms recommended?',
      answer:
        'TTFB measures server response and network latency before HTML begins downloading. Maintaining a TTFB under 200ms (Good: <=200ms, Acceptable: 200-400ms, Poor: >600ms) ensures rapid browser rendering and prevents page abandonment.',
    },
    {
      question: 'How do render-blocking resources hurt page performance and how can they be fixed?',
      answer:
        'Render-blocking scripts and stylesheets in the HTML <head> force the browser parser to pause until they download. You can eliminate render-blocking by adding defer/async to scripts, moving non-critical widgets to next/script (afterInteractive), and using critical CSS.',
    },
    {
      question: 'How does page speed impact Google search rankings and mobile bounce rates?',
      answer:
        'Fast page speed reduces mobile bounce rates (by up to 32% as load time goes from 1s to 3s) and satisfies Google Page Experience ranking signals, directly improving organic search visibility.',
    },
  ];

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
          <span className="text-slate-800 dark:text-slate-100 font-medium">Site Speed &amp; Core Web Vitals</span>
        </nav>

        {/* Compact App-First Header */}
        <header className="space-y-2.5 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Zap className="w-3 h-3" />
            <span>Google PageSpeed &amp; Core Web Vitals Suite</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
            Site Speed &amp; Core Web Vitals Auditor
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Run an in-depth Google Lighthouse &amp; CrUX audit. Diagnose LCP, INP, CLS, TTFB, and render-blocking bottlenecks with step-by-step, copyable code fix guides.
          </p>
        </header>

        {/* Top-Fold Tool Input Dock */}
        <section aria-label="Site Speed Audit Input Form" className="max-w-3xl mx-auto">
          <div className="glass-panel hero-input-dock rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-white/[0.08] shadow-lg space-y-4">
            <form onSubmit={handleCheckSpeed} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="example.com or https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-50 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Auditing Speed...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Speed Audit</span>
                  </>
                )}
              </button>
            </form>

            {/* One-Click Quick Demo Sites */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400">
                  Quick Demo:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {SAMPLE_DEMO_URLS.map((demo) => (
                    <button
                      key={demo}
                      type="button"
                      onClick={() => runAuditForUrl(demo)}
                      disabled={isLoading}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200/60 dark:border-white/5 text-[10px] font-mono transition-all cursor-pointer disabled:opacity-50"
                    >
                      {demo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Zero Data Logging · 100% Transient</span>
              </div>
            </div>

            {error && (
              <div className="text-xs text-rose-600 dark:text-rose-400 text-center font-semibold pt-1">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Audit Results Container */}
        {activeAuditedUrl && (
          <section aria-label="Speed Audit Results" className="space-y-8 animate-in fade-in duration-200">
            {/* Primary Google Core Web Vitals Suite & Fix Guide Engine */}
            <CoreWebVitalsCard key={`${activeAuditedUrl}-${auditRunId}`} initialUrl={activeAuditedUrl} />

            {/* Secondary Lightweight Technical Infrastructure Health Card */}
            {isLoading && !technicalAudit ? (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col items-center justify-center py-10 space-y-3 text-center animate-in fade-in duration-200">
                <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Analyzing Server Latency &amp; DOM Infrastructure...
                </div>
                <p className="text-[11px] text-slate-400">
                  Measuring direct TTFB, payload size, and script density.
                </p>
              </div>
            ) : technicalAudit ? (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-white/5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      Server-Side DOM &amp; Latency Infrastructure Scorecard
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Direct server-to-server HTTP fetch breakdown without browser rendering overhead.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {activeAuditedUrl}
                  </span>
                </div>
                <TechnicalHealthCard technicalAudit={technicalAudit} />
              </div>
            ) : null}
          </section>
        )}

        {/* Editorial SEO & Technical Knowledge Container */}
        <div className="max-w-5xl mx-auto w-full space-y-16 pt-10 border-t border-slate-200/80 dark:border-white/[0.08]">
          {/* 1. 3-Step How-To-Use Workflow */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Usage &amp; Workflow</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                How to Use the Site Speed Checker
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Diagnose Core Web Vitals, server response latency, and rendering speed bottlenecks in 3 simple steps.
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
                  <strong>E-Commerce Stores:</strong> Eliminate checkout abandonment from lag
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Technical SEOs:</strong> Pass Google Page Experience LCP &lt;= 2.5s
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Developers:</strong> Copy Next.js &amp; Nginx code fixes instantly
                </span>
              </div>
            </div>
          </section>

          {/* 2. Educational Deep-Dive on Core Web Vitals */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Gauge className="w-3.5 h-3.5" />
                <span>Technical Specifications</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Understanding Google Core Web Vitals Thresholds
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Google uses real-user Chrome field data to rank web pages. Learn how each metric is measured and what values determine a passing grade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    LCP &lt;= 2.5s
                  </div>
                  <Clock className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Largest Contentful Paint (LCP)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Measures perceived loading speed by marking when the main hero image or primary text block has loaded. A score under 2.5 seconds ensures visitors perceive immediate value.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    INP &lt;= 200ms
                  </div>
                  <Activity className="w-4 h-4 text-cyan-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Interaction to Next Paint (INP)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Replaced First Input Delay (FID) as an official Core Web Vital in March 2024. Evaluates responsiveness by measuring the longest lag between user clicks/taps and visual feedback.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    CLS &lt;= 0.10
                  </div>
                  <Layers className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Cumulative Layout Shift (CLS)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Quantifies unexpected visual movement of elements during load. Keeping CLS under 0.10 prevents accidental clicks on shifted buttons and creates a polished, premium experience.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Comprehensive FAQs Accordion */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Page Speed &amp; Performance FAQs
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Expert answers on Google Page Experience optimization, Core Web Vitals thresholds, and latency diagnostics.
              </p>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer select-none"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        openFaqIndex === idx ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>

                  {openFaqIndex === idx && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-white/[0.05] animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 4. Compact Related Tools Dock */}
          <CompactToolDock currentTool="/site-speed-checker" />
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}

export default function SiteSpeedCheckerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)]" />}>
      <SiteSpeedCheckerContent />
    </Suspense>
  );
}
