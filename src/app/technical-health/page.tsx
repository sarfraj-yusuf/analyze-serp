'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TechnicalHealthCard } from '@/components/TechnicalHealthCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { TechnicalAudit } from '@/types/seo';
import {
  Zap,
  Sparkles,
  ArrowLeft,
  Search,
  Globe,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  Users,
  Lock,
  ArrowRight,
  Clock,
  Layers,
  FileCode,
  ShieldCheck,
  Gauge,
} from 'lucide-react';
import Link from 'next/link';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

export default function TechnicalHealthPage() {
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
      title: '01. Enter Target Webpage URL',
      description:
        'Submit any webpage URL to initiate real-time server-side HTTP header analysis and DOM infrastructure parsing.',
    },
    {
      title: '02. Scan Security & Speed Directives',
      description:
        'Audit HTTPS protocol encryption, canonical tag declarations, robots meta directives, and mobile viewport configurations.',
    },
    {
      title: '03. Review 0–100 Health Score Card',
      description:
        'Receive an instant technical health scorecard with prioritized recommendations to fix response latency and crawlability bottlenecks.',
    },
  ];

  const faqs = [
    {
      question: 'What is a technical SEO audit tool?',
      answer:
        'A technical SEO audit tool evaluates website infrastructure elements (HTTPS, server response time, HTML payload size, DOM node depth, canonical tags, and robots directives) to ensure search engine crawlers can index your pages without performance bottlenecks.',
    },
    {
      question: 'What is Time to First Byte (TTFB) and why does it impact Google crawling?',
      answer:
        'Time to First Byte (TTFB) is the measurement of server response latency. If your TTFB exceeds 600ms–1000ms, search engine crawlers like Googlebot may throttle their crawl rate across your domain to prevent server overload.',
    },
    {
      question: 'How does HTML document payload size affect page speed and mobile rankings?',
      answer:
        'HTML payload size represents the raw uncompressed HTML file byte size. Keeping HTML payloads under 150KB ensures faster initial parsing and lower mobile memory consumption.',
    },
    {
      question: 'What is the maximum recommended DOM node count for mobile rendering?',
      answer:
        'Google Lighthouse recommends keeping total DOM nodes under 1,500 elements, with a maximum DOM depth of 32 nodes and no parent node having more than 60 child nodes.',
    },
    {
      question: 'Is HTTPS security mandatory for Google search indexing?',
      answer:
        'Yes. Secure Sockets Layer (SSL/TLS) encryption via HTTPS is a confirmed Google Search ranking signal and standard web security requirement.',
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

  const handleAuditUrl = async (e: React.FormEvent) => {
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
        throw new Error('Failed to fetch technical health audit data');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setTechnicalAudit(data.results[0].technicalAudit);
        triggerToolExecutionFeedback();
      } else {
        throw new Error(data.results[0]?.errorMessage || 'Failed to inspect technical health');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing technical health audit.');
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
          <span className="text-slate-800 dark:text-slate-100 font-medium">Technical SEO Health</span>
        </nav>

        {/* Compact App-First Header */}
        <header className="space-y-2 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" />
            <span>Infrastructure Scanner</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
            Technical SEO Health & Speed Inspector
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Measure server response time (TTFB), document payload size, DOM node depth, SSL/HTTPS encryption, canonical declarations, and robots crawlability in real time.
          </p>
        </header>

        {/* Top-Fold Tool Input Dock */}
        <section aria-label="Technical SEO Audit Input Form" className="max-w-3xl mx-auto">
          <div className="glass-panel hero-input-dock rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.08] space-y-4">
            <form onSubmit={handleAuditUrl} className="flex flex-col sm:flex-row items-center gap-3">
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
                    <span>Run Health Audit</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero data logging · Transient client fetch</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">Target: TTFB &lt;400ms · HTML &lt;150KB</span>
            </div>

            {error && <div className="text-xs text-red-600 dark:text-red-400 text-center font-semibold pt-1">{error}</div>}
          </div>

          {/* Immediate Audit Results Payoff */}
          {technicalAudit && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4 mt-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Technical Audit Scorecard</h3>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{urlInput}</span>
              </div>
              <TechnicalHealthCard technicalAudit={technicalAudit} />
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
                How to Use the Technical SEO Health Inspector
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Run automated server and DOM infrastructure diagnostics in 3 simple steps without writing code.
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
                  <strong>Frontend Devs:</strong> DOM node depth &lt;1,500
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Technical SEOs:</strong> TTFB crawl budget audit
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Growth Teams:</strong> Mobile-First & HTTPS
                </span>
              </div>
            </div>
          </section>

          {/* 2. 4-Pillar Technical Architecture (2x2 Bento Grid) */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                <Gauge className="w-3.5 h-3.5" />
                <span>Technical Architecture</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                The Science of Technical SEO: Core Signals & Benchmarks
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Key server-side and DOM metrics that govern Googlebot crawling efficiency and mobile user experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: TTFB & Server Latency */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Crawl Budget
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      &lt; 400ms Target
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    1. Server Latency & Time-to-First-Byte (TTFB)
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    TTFB measures the latency between an HTTP request and the arrival of the initial response byte. If a server takes &gt;1,000ms, Googlebot scales back crawling frequency to prevent host overload.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                      <span>Optimal (Good):</span>
                      <span className="font-bold">&lt; 200ms</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                      <span>Acceptable:</span>
                      <span className="font-bold">200ms – 400ms</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-700 dark:text-rose-400">
                      <span>High Latency:</span>
                      <span className="font-bold">&gt; 600ms</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/large-sites/crawl-budget-management"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Crawl Budget Management Guide</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 2: DOM Element Depth & Memory */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        DOM Structure
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/20">
                      &lt; 1,500 Nodes
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    2. DOM Tree Depth & Mobile Memory Impact
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Deeply nested <code>&lt;div&gt;</code> elements and bloated node counts (&gt;1,500 nodes or depth &gt;32) trigger style recalculation overhead and render lag on mobile devices.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Total DOM Nodes:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 1,500 elements</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Maximum Depth:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 32 levels</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Max Child Nodes:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 60 children</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developer.chrome.com/docs/lighthouse/performance/dom-size/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Chrome Lighthouse DOM Size Guide</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 3: HTML Payload & First Contentful Paint */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Payload Size
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/20">
                      &lt; 150KB Target
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    3. HTML Document Payload & Uncompressed Overhead
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The initial HTML document is parsed synchronously before rendering begins. Keeping uncompressed HTML under 150KB accelerates First Contentful Paint (FCP) and reduces mobile bandwidth overhead.
                  </p>

                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-300">
                      <Zap className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Need Core Web Vitals (LCP, INP, CLS)?</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      For lab speed tests and field CWV data, use our{' '}
                      <Link href="/site-speed-checker" className="text-indigo-600 dark:text-indigo-400 font-semibold underline hover:text-indigo-500">
                        dedicated Site Speed Auditor
                      </Link>.
                    </p>
                  </div>
                </div>

                <a
                  href="https://web.dev/vitals/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Web.dev Core Web Vitals Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 4: Technical Hygiene Checklist */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Hygiene Directives
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      3 Directives Pass
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    4. Security, Canonical & Viewport Directives
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>HTTPS Security:</strong> SSL/TLS certificate encryption is an active Google Search ranking signal.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Canonical Alignment:</strong> Self-referencing <code>&lt;link rel="canonical"&gt;</code> prevents duplicate indexing.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Mobile Viewport:</strong> Responsive viewport tag ensures proper Mobile-First rendering.</span>
                    </div>
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
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Answers to common technical SEO audit, TTFB, and DOM health questions.
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
                Enhance your site's search visibility by pairing technical health audits with our specialized tools:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
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
                href="/site-speed-checker"
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 group"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Site Speed</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  TTFB & Core Web Vitals
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
