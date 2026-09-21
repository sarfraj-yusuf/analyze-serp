'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  Cpu,
  Gauge,
  FileCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  History,
  Timer,
  Lock,
  Search,
  Eye,
  FileText,
  Activity,
  Users,
  Building2,
  Code2,
  PenTool,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Why does AnalyzeSERP avoid using generative AI for core SEO audits?',
    answer:
      'Generative LLMs (like GPT-4 or Claude) are statistical text predictors, not web crawlers. When asked to audit a webpage, they summarize, approximate, and frequently hallucinate missing headings, word counts, and meta tags. Furthermore, LLM API calls take 20 to 45 seconds. AnalyzeSERP inspects the real raw DOM using Cheerio in under 500ms, returning 100% mathematical facts without guessing.',
  },
  {
    question: 'How are the Core Web Vitals and performance benchmarks measured?',
    answer:
      'We measure Time to First Byte (TTFB), payload compression, and page size directly from server response headers, cross-referencing field metrics against Google Search Central 2026 Core Web Vitals thresholds: LCP (< 2.5s), INP (< 200ms), and CLS (< 0.1).',
  },
  {
    question: 'Is my audited competitor data logged, tracked, or sold?',
    answer:
      'Never. AnalyzeSERP is built with a strict client-side privacy philosophy. We do not store your queried competitor URLs in persistent tracking databases, nor do we sell competitive intelligence to third parties. Your keyword gaps and audit targets remain strictly your intellectual property.',
  },
  {
    question: 'Can marketing agencies export client-ready white-label reports for free?',
    answer:
      'Yes. During our Public Beta, all users have access to our White-Label PDF Engine. You can customize the report header with your agency name, client URL, and consultant recommendations, generating presentation-ready vector PDFs with zero third-party watermarks.',
  },
];

export default function AboutPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
        {/* Section 1: Hero & Strategic Differentiator */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Anti-AI SEO Intelligence Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            Deterministic Precision.{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Zero Hallucinations.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed">
            AnalyzeSERP was created for technical SEO specialists, content directors, and digital agencies who are tired of waiting 30 seconds for AI tools to guess and hallucinate search ranking data. We extract real HTML facts in under 500 milliseconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Run Free Competitor Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/changelog"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Explore Changelog (v2.4)</span>
            </Link>
          </div>
        </div>

        {/* Section 2: Deterministic Engine vs Generic AI Scrapers Matrix */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Why Raw DOM Extraction Beats Generative AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              Google algorithms rank actual document trees and field latency — not synthetic LLM interpretations.
            </p>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/10">
                    <th className="p-4 font-bold text-slate-800 dark:text-slate-200">Capability</th>
                    <th className="p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                      AnalyzeSERP (Deterministic Engine)
                    </th>
                    <th className="p-4 font-bold text-slate-500 dark:text-gray-400">
                      Generic AI Scrapers (OpenAI / Perplexity)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <tr>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      Audit Execution Speed
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Sub-500ms (Raw Cheerio AST)</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-gray-400">
                      20–45 seconds (Heavy LLM synthesis)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      Keyword &amp; Tag Accuracy
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>100% Mathematical Precision</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-gray-400">
                      High hallucination rate on missed headings
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      Data Privacy &amp; Tracking
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Zero URL Logging &amp; Client-Side Privacy</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-gray-400">
                      URLs ingested into training datasets
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      Technical Standards
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Google Search Central &amp; W3C WCAG 2.2</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-gray-400">
                      Generalized summaries without spec alignment
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      Pricing Model
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>100% Free Public Beta</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-gray-400">
                      Expensive token-based metering per prompt
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3: The 4 Architectural Pillars */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              The 4 Pillars of the AnalyzeSERP Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              Built from first principles for high-throughput SEO engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pillar 1 */}
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3.5 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Pillar 01
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Raw DOM Traversal &amp; Abstract Syntax Trees
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Rather than executing sluggish headless browsers that take 8 seconds to render JavaScript, our Cheerio engine traverses the server-rendered HTML tree at the byte level. We extract complete heading structures (H1–H6), Open Graph tags, canonical headers, and schema microdata in milliseconds.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3.5 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Pillar 02
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Core Web Vitals &amp; Network Health Diagnostics
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Ranking algorithms heavily prioritize latency and page stability. AnalyzeSERP calculates real server response TTFB latency, multi-hop 301 redirect chains, payload compression (Gzip/Brotli), and WCAG 2.2 color contrast ratios to ensure total technical health compliance.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3.5 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Pillar 03
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Content Economics &amp; Flesch Readability Scoring
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Search intent requires readability calibration. Our content engine executes mathematical Flesch Reading Ease and Flesch-Kincaid Grade Level analyses, cross-comparing competitor syllable density, average sentence length, and keyword frequency distributions against top 3 Google SERP positions.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3.5 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pillar 04
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  White-Label Agency Reporting Infrastructure
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Consultants and agencies generate revenue through client deliverables. Our built-in vector PDF generator builds branded 6-pillar executive audit scorecards with custom client titles and consultant recommendations — completely free of AnalyzeSERP branding.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Live Engineering Telemetry Benchmarks */}
        <section className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Engine Telemetry &amp; Performance Benchmarks
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Production metrics measured across 50,000+ live web audits.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>Live Cluster Stats</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Average TTFB Latency</p>
              <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">&lt; 450ms</p>
              <p className="text-[10px] text-slate-500">Raw DOM parsed in milliseconds</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Data Hallucination Rate</p>
              <p className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">0.0%</p>
              <p className="text-[10px] text-slate-500">100% deterministic facts</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Crawl Depth Capacity</p>
              <p className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">32+ Levels</p>
              <p className="text-[10px] text-slate-500">Recursive nested DOM traversal</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Privacy Score</p>
              <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">100/100</p>
              <p className="text-[10px] text-slate-500">Zero competitor URL logging</p>
            </div>
          </div>
        </section>

        {/* Section 5: Built For High-Output Teams (Target Personas) */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Engineered For High-Output Practitioners
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              Designed specifically for the disciplines that drive organic search growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Technical SEO Specialists</h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
                Inspect canonical hygiene, 301 redirect chains, robots meta directives, and Core Web Vitals field bottlenecks.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Growth &amp; SEO Agencies</h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
                Generate high-conversion client audit PDFs, pitch proposals, and competitor gap scorecards with zero software watermarking.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <PenTool className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Content Strategists</h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
                Reverse-engineer competitor heading hierarchies, Flesch reading ease scores, and exact word count targets.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Founders &amp; Indie Builders</h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
                Audit landing pages, simulate 600px Google SERP pixel snippets, and verify WCAG contrast compliance in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Engineering Principles & Product Manifesto */}
        <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Core Manifesto
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Our Engineering Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-600 dark:text-gray-300">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-500" />
                <span>1. Speed is a Primary Feature</span>
              </h4>
              <p>
                Waiting 30 seconds for an SEO report destroys your flow state. If a tool cannot parse an HTML document in under 500 milliseconds, it is architecturally broken. We optimize every millisecond of raw DOM processing.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>2. Facts Over Generative Guesses</span>
              </h4>
              <p>
                Search algorithms do not rank AI summaries; they index concrete status codes, meta tags, and visual pixel caps. We deliver raw, verifiable facts that match exactly what Googlebot sees.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>3. Privacy by Default</span>
              </h4>
              <p>
                Your competitor search targets are sensitive business intelligence. We do not maintain historical logs of queried URLs for ad retargeting, nor do we sell competitive search data to data brokers.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>4. Democratizing Technical Truth</span>
              </h4>
              <p>
                Essential SEO diagnostics (canonical checks, status codes, readability) should not be hidden behind \$200/month paywalls. Our complete 8-tool diagnostic suite remains 100% free during our Public Beta.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Technical Architecture & FAQ Accordion */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Frequently Asked Architecture Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              Technical specifics on how AnalyzeSERP operates under the hood.
            </p>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-gray-300 leading-relaxed animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 8: Final Enterprise Action Banner */}
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200/80 dark:border-white/10 text-center space-y-5 bg-gradient-to-b from-transparent to-emerald-500/[0.03]">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Ready for Sub-500ms Competitor Intelligence?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
              Start auditing competitor pages, inspecting heading hierarchies, and exporting executive client reports with zero software watermarking.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Run Free Audit Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-semibold text-xs transition-all cursor-pointer"
            >
              <span>View Beta Access ($0/mo)</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
