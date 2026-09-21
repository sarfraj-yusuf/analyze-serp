'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RedirectChainVisualizer } from '@/components/RedirectChainVisualizer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { RedirectChainReportData } from '@/lib/redirect-tracer';
import { CompactToolDock } from '@/components/CompactToolDock';
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
  ShieldCheck,
  Globe,
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

    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
      setUrlInput(targetUrl);
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
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
          <span className="text-slate-800 dark:text-slate-100 font-medium">Redirect Chain Tracer</span>
        </nav>

        {/* Compact App-First Header */}
        <header className="space-y-2 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Layers className="w-3 h-3" />
            <span>HTTP Header Inspector</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
            301/302 HTTP Redirect Chain Inspector
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Trace multi-hop HTTP redirects in real time, uncover 301 vs 302 status codes, diagnose infinite loops, and measure per-hop latency to preserve crawl budget and PageRank equity.
          </p>
        </header>

        {/* Top-Fold Tool Input Dock */}
        <section aria-label="Redirect Chain Audit Input Form" className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel hero-input-dock rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.08] space-y-4">
            <form onSubmit={handleAudit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="example.com or https://example.com/old-page"
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
                    <span>Tracing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Trace Chain</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero data logging · Transient HTTP trace</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">Follows 301, 302, 307, 308 headers</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Audit Results & Flowchart Visualizer */}
          {report && (
            <div className="animate-in fade-in duration-200">
              <RedirectChainVisualizer report={report} />
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
                How to Use the Redirect Checker Tool
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Trace HTTP status codes, detect redirect chains, and protect link equity in 3 simple steps.
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
                  <strong>Migration Teams:</strong> Ensure 100% PageRank link equity transfer
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>E-Commerce Managers:</strong> Eliminate multi-hop affiliate referral latency
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Technical SEOs:</strong> Protect Googlebot crawl budget from 5+ hop caps
                </span>
              </div>
            </div>
          </section>

          {/* 2. 4-Pillar Redirect & Latency Architecture (2x2 Bento Grid) */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Layers className="w-3.5 h-3.5" />
                <span>HTTP Architecture</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                The Technical Architecture of HTTP Redirects: Status Codes & Crawl Budget
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Critical server routing directives that preserve PageRank equity, reduce round-trip latency, and prevent loop crashes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: 301 Permanent vs 302 Temporary */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Link Equity
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      301 vs 302
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    1. 301 Permanent vs 302 Temporary Routing
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    HTTP status codes inform crawlers how to handle indexing. A 301 permanently consolidates ranking signals and PageRank, whereas 302 flags temporary routing without indexation transfer.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>301 Moved Permanently:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Transfers PageRank</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>302 Found (Temporary):</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Retains Source URL</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>308 Permanent Redirect:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">Preserves HTTP Method</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/301-redirects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central 301 Redirect Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 2: Multi-Hop Crawl Budget Dilution */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Latency & Crawling
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/20">
                      5-Hop Cap
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    2. Multi-Hop Chains & Crawl Budget Dilution
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Each redirect hop requires a distinct Round-Trip Time (RTT) exchange: DNS lookup, TCP connection, TLS handshake, and TTFB. Googlebot aborts crawl chains exceeding 5 consecutive hops.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>1-Hop Baseline Latency:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">~100ms Overhead</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>3+ Hop Chain Penalty:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">+300ms – 800ms</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Googlebot Stop Threshold:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Max 5 Hops</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central Crawl Budget Management</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 3: Infinite Redirect Loops */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Availability Risk
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold border border-rose-500/20">
                      Loop Prevention
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    3. Infinite Loops & ERR_TOO_MANY_REDIRECTS
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Circular redirects (A &rarr; B &rarr; A) cause browsers and search crawlers to abort with fatal errors, immediately de-indexing landing pages and driving bounce rates to 100%.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Browser Crash Threshold:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">10–20 Hops (Crash)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Search Indexation Impact:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">Target De-indexed</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Remediation Strategy:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Direct 1:1 Mapping</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/http-network-errors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central HTTP Network Errors Guide</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 4: Protocol & Canonical Alignment */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Hygiene & Edge
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/20">
                      Single-Hop Canonical
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    4. Protocol & Canonical Normalization
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Prevent split redirect chains where HTTP to HTTPS, non-www to www, and trailing slashes trigger multiple cascading hops. Edge rules should route all requests to the canonical URL in a single hop.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>HTTP &rarr; HTTPS Security:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">1 Hop Direct</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Non-WWW &rarr; WWW Consolidation:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Consolidated</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Trailing Slash Normalization:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Edge Rewrite Rule</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central Canonicalization Guidance</span>
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
                Frequently Asked Questions About HTTP Redirects
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Essential insights into 301 vs 302 directives, chain latency, and Googlebot hop limits.
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
          <CompactToolDock currentTool="redirect-checker" />
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
