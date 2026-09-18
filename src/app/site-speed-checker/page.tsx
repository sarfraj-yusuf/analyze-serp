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
  Clock,
  Gauge,
  Activity,
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

    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
      setUrlInput(targetUrl);
    }

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
          <span className="text-slate-800 dark:text-slate-100 font-medium">Site Speed & Core Web Vitals</span>
        </nav>

        {/* Compact App-First Header */}
        <header className="space-y-2 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Zap className="w-3 h-3" />
            <span>Core Web Vitals Auditor</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
            Site Speed & Core Web Vitals Auditor
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Test real-time Time to First Byte (TTFB), LCP, INP, CLS benchmarks, server fetch latency, and DOM payload bloat to boost Core Web Vitals rankings.
          </p>
        </header>

        {/* Top-Fold Tool Input Dock */}
        <section aria-label="Site Speed Audit Input Form" className="max-w-3xl mx-auto">
          <div className="glass-panel hero-input-dock rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.08] space-y-4">
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
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-50 active:scale-[0.98]"
              >
                {isLoading ? (
                  <span>Auditing...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Speed Audit</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero data logging · Transient client fetch</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">Target: TTFB &lt;200ms · LCP &lt;2.5s</span>
            </div>

            {error && <div className="text-xs text-red-600 dark:text-red-400 text-center font-semibold pt-1">{error}</div>}
          </div>

          {/* Audit Results */}
          {technicalAudit && (
            <div className="space-y-6 mt-6 animate-in fade-in duration-200">
              <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Technical Speed Scorecard</h3>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{urlInput}</span>
                </div>
                <TechnicalHealthCard technicalAudit={technicalAudit} />
              </div>

              <CoreWebVitalsCard initialUrl={urlInput} />
            </div>
          )}
        </section>

        {/* Editorial SEO & Technical Knowledge Container */}
        <div className="max-w-5xl mx-auto w-full space-y-16 pt-10 border-t border-slate-200/80 dark:border-white/[0.08]">
          {/* 1. 3-Step How-To-Use Workflow */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Usage & Workflow</span>
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
                  <strong>Technical SEOs:</strong> Pass Google Page Experience LCP &lt;2.5s
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>DevOps & Engineers:</strong> Pinpoint edge caching & TTFB spikes
                </span>
              </div>
            </div>
          </section>

          {/* 2. 4-Pillar Performance Architecture (2x2 Bento Grid) */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                <Gauge className="w-3.5 h-3.5" />
                <span>Performance Benchmarks</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                The Science of Page Speed: Core Web Vitals & TTFB Benchmarks
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-user experience metrics that define Google ranking criteria, search intent satisfaction, and conversion health.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: TTFB Benchmarks */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Server Latency
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      &lt; 200ms Optimal
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    1. Time to First Byte (TTFB) Latency
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    TTFB measures the duration between an HTTP request and the first byte returned. Fast TTFB ensures search bots and visitors can begin rendering without network waiting stalls.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                      <span>Good (Fast):</span>
                      <span className="font-bold">&lt; 200ms</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                      <span>Acceptable:</span>
                      <span className="font-bold">200ms – 400ms</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-700 dark:text-rose-400">
                      <span>Poor (Slow Server):</span>
                      <span className="font-bold">&gt; 600ms</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://web.dev/ttfb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Web.dev TTFB Optimization Guidance</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 2: Core Web Vitals (LCP, INP, CLS) */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Experience Signals
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/20">
                      3 Field Vitals
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    2. Google Core Web Vitals Standards
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Google evaluates user experience quality through three field metrics that measure perceived loading, interaction responsiveness, and layout stability.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Largest Contentful Paint (LCP):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 2.5s</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Interaction to Next Paint (INP):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 200ms</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Cumulative Layout Shift (CLS):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 0.1 score</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://web.dev/vitals/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Web.dev Core Web Vitals Guidelines</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 3: Bounce Rate Research */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Conversion Impact
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold border border-rose-500/20">
                      +32% Bounce Risk
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    3. Google 1s-to-3s Bounce Rate Study
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Official research from Google proves that as page load duration increases from 1 second to 3 seconds, mobile visitor bounce probability surges by <strong>32%</strong>, and surges by <strong>90%</strong> at 5 seconds.
                  </p>

                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-rose-800 dark:text-rose-300">
                      <span>1s &rarr; 3s Load Time:</span>
                      <span className="font-bold">+32% bounce rate</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-rose-800 dark:text-rose-300">
                      <span>1s &rarr; 5s Load Time:</span>
                      <span className="font-bold">+90% bounce rate</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.thinkwithgoogle.com/marketing-strategies/app-marketing/mobile-page-speed-new-industry-benchmarks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Think with Google Mobile Page Speed Benchmarks</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 4: Technical Health Cross-Ref */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Infrastructure
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      Crawl & Index
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    4. Technical Site Hygiene & Crawlability
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    While speed audits test client-side rendering latency, healthy Google indexation also requires SSL security, canonical tags, and DOM tree depth under 1,500 nodes.
                  </p>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Need Infrastructure Diagnostics?</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Audit DOM depth, SSL protocols, and robots directives with our{' '}
                      <Link href="/technical-health" className="text-emerald-600 dark:text-emerald-400 font-semibold underline hover:text-emerald-500">
                        dedicated Technical SEO Health Auditor
                      </Link>.
                    </p>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/crawling-indexing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central Crawling & Indexing</span>
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
                Frequently Asked Questions About Page Speed
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Essential insights into TTFB, Largest Contentful Paint, and mobile performance factors.
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

          {/* 4. Related AnalyzeSERP Tools (Clean 4-Column Grid) */}
          <section className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>AnalyzeSERP Utility Suite</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Explore Related SEO & Performance Tools
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enhance your site's search visibility by pairing speed checks with our specialized tools:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Link
                href="/technical-health"
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 group"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Technical Health</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  DOM depth, SSL & headers
                </p>
              </Link>

              <Link
                href="/serp-snippet-preview"
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 group"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>SERP Preview</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Pixel width & meta snippet test
                </p>
              </Link>

              <Link
                href="/redirect-checker"
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 group"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Redirects</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Trace 301/302 HTTP chains
                </p>
              </Link>

              <Link
                href="/contrast-checker"
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 group"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Contrast</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  W3C WCAG 2.2 color check
                </p>
              </Link>

              <Link
                href="/affiliate-link-checker"
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 group"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Affiliate Links</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Audit rel="sponsored" tags
                </p>
              </Link>

              <Link
                href="/readability"
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 group"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Readability</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Flesch score & tone check
                </p>
              </Link>

              <Link
                href="/"
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 group"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Competitor Audit</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Compare 5 competitor URLs
                </p>
              </Link>

              <Link
                href="/pdf-reports"
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 group"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>PDF Reports</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  White-label client exports
                </p>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
