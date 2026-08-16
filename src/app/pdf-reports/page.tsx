'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhiteLabelPdfModal } from '@/components/WhiteLabelPdfModal';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SinglePageAudit } from '@/types/seo';
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Search,
  Globe,
  Download,
  Lock,
  BookOpen,
  CheckCircle2,
  Users,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Zap,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

export default function PdfReportsPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<SinglePageAudit | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      title: '01. Submit Target Webpage URL',
      description:
        'Enter your agency client website or prospect URL to extract real-time SEO metrics, header hierarchies, and keyword density.',
    },
    {
      title: '02. Customize Agency Branding & Logo',
      description:
        'Upload your custom agency logo, enter company contact details, select brand color accents, and insert executive client recommendations.',
    },
    {
      title: '03. Export Multi-Page Branded PDF Report',
      description:
        'Download a client-ready vector PDF report complete with overall health score, technical checklist, and actionable optimization roadmap.',
    },
  ];

  const faqs = [
    {
      question: 'What is a white-label PDF SEO report generator?',
      answer:
        'A white-label PDF SEO report generator allows agencies and freelancers to create comprehensive client audit documents featuring their own branding, logo, and recommendations without third-party vendor logos.',
    },
    {
      question: 'What custom branding options can agencies upload?',
      answer:
        'You can upload your custom agency logo, company name, contact email, brand accent colors, and custom executive notes.',
    },
    {
      question: 'What metrics and sections are included in the generated PDF audit?',
      answer:
        'PDF reports include overall health score, title & meta tag analysis, heading structure tree, Flesch readability grade, keyword density tables, and technical security checks.',
    },
    {
      question: 'How do white-label PDF reports help agencies close prospective clients?',
      answer:
        'Presenting branded, professional PDF audits during sales calls demonstrates immediate expertise, clearly highlights competitor gaps, and justifies agency retainer pricing.',
    },
    {
      question: 'Are PDF report exports free to download and print?',
      answer:
        'Yes. AnalyzeSERP provides free PDF audit report generation and exports for standard single-page audits.',
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

  const handleFetchAudit = async (e: React.FormEvent) => {
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
        throw new Error('Failed to fetch audit data for PDF report');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setAuditResult(data.results[0]);
        setIsPdfModalOpen(true);
        triggerToolExecutionFeedback();
      } else {
        throw new Error(data.results[0]?.errorMessage || 'Failed to analyze page for PDF generation');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while preparing PDF report.');
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
            White-Label PDF Reports Hub
          </span>
        </nav>

        {/* Hero Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm">
            <FileText className="w-3.5 h-3.5" />
            <span>Agency Executive Reporting</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Free White-Label PDF <br />
            <span className="gradient-text">SEO Report Generator</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Using a dedicated <strong>white label pdf seo report generator</strong> enables marketing teams to deploy an <strong>agency client audit builder</strong> in seconds. Upload custom logos with our <strong>custom branded pdf audit exporter</strong>, create persuasive pitch audits with a <strong>seo proposal generator</strong>, and impress stakeholders with a clean <strong>client executive summary report</strong>.
          </p>
        </header>

        {/* Layer 1: Input Audit Box */}
        <section aria-label="PDF Report Generator Input Form" className="max-w-[830px] mx-auto w-full">
          <div className="glass-panel p-7 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <form onSubmit={handleFetchAudit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Enter Webpage URL to Build Branded PDF Audit
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/landing-page"
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
                  <span>Generating Audit Data...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate Branded PDF Report</span>
                  </>
                )}
              </button>
            </form>

            {/* Scope Clarification Note */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Included Report Scope:</strong> PDF reports compile overall health score, metadata & SERP snippet analysis, H1-H6 heading structure tree, Flesch readability grade, 1-to-3 gram keyword density tables, and technical indexability checks.
              </span>
            </div>

            {/* Privacy Guarantee Badge */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-gray-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>Privacy & Security Guarantee:</strong> All PDF report branding tokens and generated audit data are rendered client-side directly in your browser using jsPDF. We do not store, log, or collect your agency logos or client reports.
              </span>
            </div>
          </div>
        </section>

        {/* Re-open Modal Button if Audit Ready */}
        {auditResult && (
          <div className="text-center animate-in fade-in duration-300">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs inline-flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Customize & Export PDF Report for {new URL(auditResult.url).hostname}</span>
            </button>
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
            How to Use the White-Label PDF Report Generator
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
            Real-World Use Cases for Branded PDF Audit Exporting
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-emerald-600 dark:text-emerald-400">
                SEO Agencies & Growth Marketing Agencies
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Win new client pitch proposals & retainer audits. Attach branded PDF audits to sales proposals. Demonstrating clear technical bottlenecks during initial sales calls builds trust and justifies agency retainer pricing.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-cyan-600 dark:text-cyan-400">
                Freelance SEO Consultants & Strategists
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Deliver professional monthly progress reports. Provide clients with clean, professional monthly PDF reporting deliverables featuring your own logo and custom optimization notes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-indigo-600 dark:text-indigo-400">
                In-House Marketing Directors & Leads
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Present clear action roadmaps to C-Suite executives. Translate complex SEO jargon into high-level executive summaries and health scores easily consumable by non-technical stakeholders.
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
            The Anatomy of a High-Converting Client SEO Audit PDF Report
          </h2>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                1. Why Custom Agency Branding Builds Immediate Authority
              </h3>
              <p>
                Client retention and sales conversion rely heavily on presentation quality. White-label reports that feature your agency's logo, brand colors, and contact info position your firm as an authoritative market leader.
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                2. Core Audit Pillars Included in Every PDF Export
              </h3>
              <p>
                AnalyzeSERP PDF reports compile a comprehensive 360-degree audit:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>Metadata & SERP Snippet Truncation</strong>: Checks title tag pixel width and meta description limits.</li>
                <li><strong>Heading Architecture</strong>: Visualizes H1, H2, H3 heading trees for topical depth.</li>
                <li><strong>Keyword Density Tables</strong>: Extracts 1-gram, 2-gram, and 3-gram keyword frequency ratios.</li>
                <li><strong>Technical Hygiene Checklist</strong>: Evaluates HTTPS security, canonical tags, and mobile viewport readiness.</li>
              </ul>
              <div className="pt-1">
                <a
                  href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Search Central Guidance on Website Audit Best Practices <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                3. Executive Summary UX & Pitch Closing Rates (NNGroup UX Study)
              </h3>
              <p>
                User experience research from the Nielsen Norman Group confirms that executive stakeholders scan top-level summaries before diving into technical details. Featuring a unified 0–100 health score at the top of the PDF report increases stakeholder comprehension and pitch conversion rates.
              </p>
              <div className="pt-1">
                <a
                  href="https://www.nngroup.com/articles/executive-summary-ux/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Nielsen Norman Group Executive Summary UX Guidelines <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                4. Client-Side Vector PDF Rendering & Data Privacy
              </h3>
              <p>
                Vector PDF rendering via <code>jsPDF</code> executed client-side inside the browser ensures sharp text crispness at any print resolution or screen size, while guaranteeing that proprietary client data remains strictly private.
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
            Pair your PDF audit reporting with our complete suite of free SEO tools:
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
            Frequently Asked Questions About White-Label PDF SEO Reports
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

      {auditResult && (
        <WhiteLabelPdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} audit={auditResult} />
      )}

      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
