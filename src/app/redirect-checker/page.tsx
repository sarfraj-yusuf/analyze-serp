'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RedirectChainVisualizer } from '@/components/RedirectChainVisualizer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { RedirectChainReportData } from '@/lib/redirect-tracer';
import {
  Layers,
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

export default function RedirectChainCheckerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<RedirectChainReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      title: '01. Enter Starting Web Address',
      description:
        'Submit any HTTP or HTTPS web address to trigger server-side step-by-step redirect header tracing.',
    },
    {
      title: '02. Trace HTTP Headers & Location Hops',
      description:
        'Our parser recursively follows Location headers, measures latency per hop (ms), and flags status codes (301, 302, 307, 308, 404).',
    },
    {
      title: '03. Review Flowchart Tree & Shorten Chains',
      description:
        'Inspect the visual step-by-step flowchart and apply direct 1-to-1 redirect updates to preserve link equity and crawler budget.',
    },
  ];

  const faqs = [
    {
      question: 'What is a redirect checker tool?',
      answer:
        'A redirect checker tool is a technical SEO utility that traces HTTP response headers (Location), identifies status codes (301, 302, 307, 308, 404), measures latency per hop, and detects redirect chains or loops.',
    },
    {
      question: 'What is the difference between a 301 Permanent Redirect and a 302 Temporary Redirect?',
      answer:
        'A 301 redirect signals a permanent move and transfers PageRank link equity to the destination URL. A 302 redirect indicates a temporary move, which may cause Google not to consolidate search rankings.',
    },
    {
      question: 'Why are redirect chains harmful for SEO and crawling budget?',
      answer:
        'Redirect chains add unnecessary latency (100ms–500ms per hop) and waste Googlebot crawl budget. Long chains can cause crawlers to abandon request processing.',
    },
    {
      question: 'What is a redirect loop (ERR_TOO_MANY_REDIRECTS)?',
      answer:
        'A redirect loop occurs when two or more URLs continuously redirect to each other in a circular chain, causing browsers to display an error and blocking user access.',
    },
    {
      question: 'How many redirect hops will Googlebot follow before dropping the request?',
      answer:
        'Googlebot typically follows up to 5 consecutive redirect hops. Beyond 5 hops, Googlebot treats the request as a crawl error and drops the destination page.',
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
      const res = await fetch('/api/redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to trace HTTP redirect chain.');
      }

      const json = await res.json();
      setReport(json.report);
      triggerToolExecutionFeedback();
    } catch (err: any) {
      setError(err.message || 'Unable to trace target URL. Please verify the web address.');
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
            Redirect Chain Auditor
          </span>
        </nav>

        {/* Hero Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>HTTP Redirect Chain & Infinite Loop Inspector</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Free Redirect Checker & <br />
            <span className="gradient-text">HTTP Header Chain Auditor</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Using an online <strong>redirect checker</strong> enables site owners and technical SEO engineers to run a <strong>http header chain auditor</strong> in real time. Trace multi-hop HTTP redirects, distinguish <strong>301 vs 302 redirect inspector</strong> status codes, resolve <strong>redirect loop detector</strong> errors, and guarantee <strong>pagerank link equity preservation</strong>.
          </p>
        </header>

        {/* Layer 1: Input Audit Box */}
        <section aria-label="Redirect Chain Audit Input Form" className="max-w-[830px] mx-auto w-full">
          <div className="glass-panel p-7 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <form onSubmit={handleAudit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Enter Starting URL to Trace Redirects
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="http://example.com"
                    className="w-full pl-4 pr-4 py-3.5 sm:py-4 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
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
                    <span>Tracing HTTP Headers & Location Hops...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Trace Redirect Chain & Measure Latency</span>
                  </>
                )}
              </button>
            </form>

            {/* Privacy Guarantee Badge */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-gray-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>Privacy & Security Guarantee:</strong> All HTTP header and redirect trace audits are performed transiently in real time. We do not store, log, or sell your scanned website data.
              </span>
            </div>
          </div>
        </section>

        {/* Audit Results & Flowchart Visualizer */}
        {report && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <RedirectChainVisualizer report={report} />
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
            How to Use the Redirect Checker Tool
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
            Real-World Use Cases for Redirect Chain Auditing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-emerald-600 dark:text-emerald-400">
                Web Migration Specialists & Rebranding Teams
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Ensure 100% Link Equity transfer. Audit HTTP headers during domain migrations to confirm legacy URLs use 301 permanent redirects rather than temporary 302 status codes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-cyan-600 dark:text-cyan-400">
                E-Commerce & Affiliate Managers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Eliminate outdated promotional redirect chains. Inspect affiliate referral links to eliminate multi-step redirect hops that increase load latency and hurt mobile conversions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-indigo-600 dark:text-indigo-400">
                Technical SEO Engineers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Protect Googlebot crawl budget. Audit redirect chains to ensure Googlebot isn't stranded in 5+ hop chains that waste crawling allocations.
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
            The Technical Architecture of HTTP Redirects: 301 vs 302 & Latency
          </h2>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                1. 301 Permanent vs 302 Temporary Redirect Directives
              </h3>
              <p>
                HTTP response status codes inform web browsers and search engine crawlers how to process destination URLs:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>301 Moved Permanently</strong>: Signals search engines to transfer indexation, ranking signals, and PageRank link equity to the new target URL.</li>
                <li><strong>302 Found (Temporary)</strong>: Tells crawlers the move is temporary, meaning Google may retain the original URL in search results and delay link equity consolidation.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                2. The Hidden Cost of Multi-Hop Redirect Chains (RTT & TTFB Impact)
              </h3>
              <p>
                Every redirect hop requires a separate Round-Trip Time (RTT) exchange, including DNS lookup, TCP connection handshake, TLS negotiation, and server response time. A 3-hop redirect chain can add <strong>300ms to 800ms of latency</strong> before initial HTML parsing even begins.
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                3. Googlebot Redirect Hop Limit (Maximum 3–5 Hops Rule)
              </h3>
              <p>
                Official Google Search Central documentation explicitly notes that Googlebot follows a limited number of redirect hops (typically up to 5 consecutive hops). If a chain exceeds this threshold, Googlebot aborts the request, leaving destination pages unindexed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/301-redirects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Search Central 301 Redirect Documentation <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/http-network-errors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Search Central HTTP Status Errors Guide <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                4. Fixing Infinite Redirect Loops (ERR_TOO_MANY_REDIRECTS)
              </h3>
              <p>
                An infinite redirect loop occurs when URL A redirects to URL B, and URL B redirects back to URL A (or via an intermediary URL C). Modern browsers terminate loops by throwing <code>ERR_TOO_MANY_REDIRECTS</code>, resulting in 100% page downtime.
              </p>
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
            Enhance your site's redirect architecture by combining chain audits with our complete suite of free SEO tools:
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
            Frequently Asked Questions About HTTP Redirect Chains
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
