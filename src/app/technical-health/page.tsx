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

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [urlInput.trim()] }),
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
            Technical Health Audit
          </span>
        </nav>

        {/* Page Hero Header */}
        <header className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Technical SEO Infrastructure Scanner</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Technical SEO <span className="gradient-text">Audit & Health Checker</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Using a dedicated <strong>technical seo audit tool</strong> allows developers and webmasters to run a comprehensive <strong>speed health check</strong>. Measure server response time (TTFB latency), HTML document payload size, DOM node depth, SSL/HTTPS encryption, canonical declarations, and robots indexability to eliminate hidden crawler bottlenecks.
          </p>
        </header>

        {/* Layer 1: Search Input Card & Tool execution */}
        <section aria-label="Technical SEO Audit Input Form">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-6 max-w-2xl mx-auto">
            <form onSubmit={handleAuditUrl} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs focus:outline-none font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Auditing Health...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Health Audit</span>
                  </>
                )}
              </button>
            </form>

            {/* Privacy & Data Handling Guarantee Badge */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-gray-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>Privacy & Security Guarantee:</strong> All technical performance audits are executed transiently in real time. We do not store, log, or sell your scanned website data.
              </span>
            </div>

            {error && <div className="text-xs text-red-600 dark:text-red-400 text-center font-semibold">{error}</div>}
          </div>

          {/* Audit Results */}
          {technicalAudit && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 mt-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Audit Results</h3>
              <TechnicalHealthCard technicalAudit={technicalAudit} />
            </div>
          )}
        </section>

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
            How to Use the Technical SEO Audit Tool
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
            Real-World Use Cases for Technical SEO Health Auditing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-emerald-600 dark:text-emerald-400">
                Web Developers & Frontend Engineers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Eliminate DOM tree bloat. Using our <strong>dom node depth checker</strong> ensures React, Next.js, or WordPress themes stay under 1,500 total elements so mobile rendering isn't bottlenecked.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-cyan-600 dark:text-cyan-400">
                Technical SEO Specialists
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Maximize crawler budget. Performing a <strong>ttfb speed audit</strong> helps uncover database latency or un-cached server queries that prevent Googlebot from crawling deep site architectures.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-indigo-600 dark:text-indigo-400">
                SaaS & E-Commerce Marketing Teams
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Guarantee SSL and viewport compliance. Ensure landing pages pass HTTPS security protocols and mobile viewport rules to satisfy Google's Mobile-First Indexing requirements.
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
            The Science of Technical SEO: TTFB Latency, DOM Depth & Crawlability
          </h2>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                1. Server Latency & Time-to-First-Byte (TTFB &lt;400ms Target)
              </h3>
              <p>
                Time-to-First-Byte (TTFB) measures the latency between a web browser issuing an HTTP request and receiving the initial byte of data from the web server. Official Google Search Central documentation emphasizes that slow TTFB directly throttles crawler budget: if a server takes over 1,000ms to respond, Googlebot scales back its crawling frequency to avoid overloading host resources.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>Optimal Latency (Good)</strong>: <code>&lt; 200ms</code></li>
                <li><strong>Acceptable Threshold</strong>: <code>200ms – 400ms</code></li>
                <li><strong>High Latency (Action Required)</strong>: <code>&gt; 600ms</code></li>
              </ul>
              <div className="pt-1">
                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/large-sites/crawl-budget-management"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Search Central Crawl Budget Management Guide <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                2. DOM Element Tree Depth & Mobile Memory Impact (&lt;1,500 Nodes)
              </h3>
              <p>
                The Document Object Model (DOM) is the tree structure constructed by the browser to parse HTML markup. When a webpage contains deeply nested <code>&lt;div&gt;</code> elements, custom web components, or excessive DOM nodes (&gt;1,500 total nodes or maximum tree depth &gt;32), mobile devices suffer rendering lag and high memory consumption.
              </p>
              <div className="pt-1">
                <a
                  href="https://developer.chrome.com/docs/lighthouse/performance/dom-size/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Chrome DevTools Lighthouse Excessive DOM Size Audit Guide <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                3. HTML Document Payload Size & Uncompressed Code Overhead (&lt;150KB)
              </h3>
              <p>
                While external media assets and JavaScript bundles load asynchronously, the initial <strong>html document payload size</strong> must be parsed synchronously before the DOM tree can begin rendering. Keeping raw uncompressed HTML payload sizes under 150KB ensures faster First Contentful Paint (FCP) times and lowers bandwidth overhead.
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                4. Technical Hygiene Checklist (SSL, Canonical & Viewport Directives)
              </h3>
              <p>
                - <strong>HTTPS Security</strong>: SSL/TLS certificate encryption is a confirmed Google Search ranking signal and mandatory web security requirement.
                <br />
                - <strong>Canonical Alignment</strong>: Explicit self-referencing <code>&lt;link rel="canonical" href="..."&gt;</code> tags prevent duplicate content indexation.
                <br />
                - <strong>Mobile Viewport</strong>: <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code> guarantees proper responsive scaling for Mobile-First indexing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href="https://developers.google.com/search/docs/crawling-indexing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Search Central Crawling & Indexing Guide <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://web.dev/vitals/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Web.dev Core Web Vitals Documentation <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>
            {/* Cross-Reference Card to Page 7: Site Speed Auditor */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Looking for Core Web Vitals (LCP, INP, CLS) & Pure Speed Performance Audits?
              </h4>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                While this tool audits technical site hygiene, crawlability, HTTPS security, and viewport directives, for real-user Google Core Web Vitals performance benchmarks, check our dedicated{' '}
                <Link
                  href="/site-speed-checker"
                  className="text-emerald-600 dark:text-emerald-400 font-bold underline hover:text-emerald-500"
                >
                  Page Speed & Core Web Vitals Auditor Tool
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
            Enhance your site's technical health by combining speed audits with our full suite of free SEO tools:
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
            Frequently Asked Questions About Technical SEO Audits
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
