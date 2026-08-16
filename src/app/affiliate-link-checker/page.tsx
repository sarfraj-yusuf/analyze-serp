'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LinkInspectorCard } from '@/components/LinkInspectorCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { LinkAudit } from '@/types/seo';
import {
  Sparkles,
  ArrowLeft,
  Search,
  Globe,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  Users,
  Lock,
  ArrowRight,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function AffiliateLinkCheckerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkAudit, setLinkAudit] = useState<LinkAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      title: '01. Enter Webpage URL to Scan',
      description:
        'Paste any affiliate article, review post, or product comparison URL into the input bar above.',
    },
    {
      title: '02. Extract DOM Link Footprints',
      description:
        'Our non-AI DOM parser extracts all internal links, external citations, commercial referral links, and anchor text types in real time.',
    },
    {
      title: '03. Audit rel="sponsored" Compliance',
      description:
        'Verify if commercial affiliate tracking URLs contain Google-compliant rel="sponsored" or rel="nofollow" link attributes to avoid manual link penalties.',
    },
  ];

  const faqs = [
    {
      question: 'What is an affiliate link checker tool?',
      answer:
        'An affiliate link checker tool is a specialized SEO auditor that scans webpage HTML to identify outbound commercial links, detect affiliate network parameters (Amazon, ShareASale, CJ, Impact), and verify rel="sponsored" and rel="nofollow" compliance.',
    },
    {
      question: 'What is the difference between rel="sponsored", rel="nofollow", and rel="ugc"?',
      answer:
        'rel="sponsored" is explicitly designed for commercial and affiliate links; rel="nofollow" is for general un-endorsed external links; and rel="ugc" is for user-generated content like blog comments and forum posts.',
    },
    {
      question: 'Will untagged affiliate links cause a Google manual penalty?',
      answer:
        'Yes. Google\'s Link Spam policy considers untagged affiliate links as paid link violations. Sites failing to use rel="sponsored" risk losing organic search visibility or receiving manual link action warnings in Search Console.',
    },
    {
      question: 'Does Google require rel="sponsored" for Amazon Associates links?',
      answer:
        'Yes. Google explicitly guidelines state that all affiliate program links—including Amazon Associates links—must be qualified with rel="sponsored" or rel="nofollow".',
    },
    {
      question: 'How many outbound links are considered excessive per page?',
      answer:
        'There is no hard numerical limit, but having dozens of untagged commercial outbound links relative to your word count creates a spam footprint. Aim to keep outbound commercial links natural and fully labeled.',
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

  const handleInspectUrl = async (e: React.FormEvent) => {
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
        throw new Error('Failed to fetch link footprint data');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setLinkAudit(data.results[0].linkAudit);
      } else {
        throw new Error(data.results[0]?.errorMessage || 'Failed to inspect link footprint');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while inspecting links.');
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
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="text-slate-400 dark:text-gray-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            Affiliate Link Checker
          </span>
        </nav>

        {/* Hero Header Section */}
        <header className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Outbound Link Footprint & Rel Inspector</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Free Affiliate Link <span className="gradient-text">Checker & Audit Tool</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Using an online <strong>affiliate link checker</strong> allows webmasters to audit outbound link footprints, detect hidden tracking parameters (Amazon, ShareASale, CJ, Impact), and verify Google <code className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">rel="sponsored"</code> and <code className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">rel="nofollow"</code> link spam compliance to protect your domain from manual actions.
          </p>
        </header>

        {/* Layer 1: Interactive Tool Form Box */}
        <section aria-label="Affiliate Link Checker Tool Input Form">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-6 max-w-2xl mx-auto">
            <form onSubmit={handleInspectUrl} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  placeholder="https://example.com/best-product-reviews"
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
                  <span>Inspecting DOM...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Links</span>
                  </>
                )}
              </button>
            </form>

            {/* Privacy & Data Handling Guarantee Badge */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-gray-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>Privacy & Security Guarantee:</strong> We do not store, log, or sell your scanned URLs. All link audits are processed transiently in real time.
              </span>
            </div>

            {error && <div className="text-xs text-red-600 dark:text-red-400 text-center font-semibold">{error}</div>}
          </div>

          {linkAudit && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 mt-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Link Inspection Results</h3>
              <LinkInspectorCard linkAudit={linkAudit} />
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
            How to Use the Affiliate Link Checker Tool
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

        {/* Layer 3: Real-World Use Cases */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Use Cases & Benchmarks
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Real-World Use Cases for Outbound Link Auditing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-emerald-600 dark:text-emerald-400">
                Affiliate Site Owners & Publishers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Protect your monetized content from manual penalties. Using our <strong>rel sponsored auditor</strong> ensures Amazon Associates, CJ Affiliate, and ShareASale links contain required link directives.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-cyan-600 dark:text-cyan-400">
                SEO Consultants & Technical Auditors
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Identify untagged commercial links that leak internal PageRank equity to third-party domains. Maintain healthy internal vs external link distribution across client architectures.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-indigo-600 dark:text-indigo-400">
                Niche Site Buyers & Investors
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Run pre-acquisition due diligence using our <strong>affiliate link footprint detector</strong> to uncover hidden PBN footprints or non-compliant monetized links before purchasing website assets.
              </p>
            </div>
          </div>
        </section>

        {/* Layer 4: Deep-Dive Technical Guide (~750 Words with Cited Stats & Google Docs Links) */}
        <article className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-500/20">
              Deep-Dive Technical Guide
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            The Science of Outbound Links: Google Link Spam, Rel Attributes & AI SpamBrain
          </h2>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                1. Google Link Spam Updates & AI SpamBrain System Explained
              </h3>
              <p>
                Google’s Webmaster Guidelines explicitly require webmasters to qualify any commercial or affiliate link. With the rollout of Google’s AI-driven <strong>SpamBrain Link Update</strong>, Google’s automated classifiers actively detect non-compliant commercial footprints at scale
                <a
                  href="https://developers.google.com/search/blog/2022/12/december-22-link-spam-update"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline font-semibold ml-1 inline-flex items-center gap-0.5"
                >
                  [Google SpamBrain Update Announcement] <ExternalLink className="w-3 h-3 inline" />
                </a>.
              </p>
              <p>
                Websites publishing commercial referral links without proper attribute tags face algorithmic link devaluation or manual action penalties in Google Search Console. When you <strong>check outbound links for rel sponsored</strong> compliance, you protect your site’s indexability and authority.
              </p>
              <div className="pt-1">
                <a
                  href="https://developers.google.com/search/docs/essentials/spam-policies#link-spam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Search Central Link Spam Policies <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                2. Qualifying Outbound Links — rel="sponsored" vs rel="nofollow" vs rel="ugc"
              </h3>
              <p>
                Google introduced granular HTML <code>rel</code> attribute directives to distinguish commercial relationships from organic editorial citations:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li>
                  <code>rel="sponsored"</code>: Mandatory attribute for affiliate links, sponsored articles, paid reviews, or any link involving financial compensation.
                </li>
                <li>
                  <code>rel="nofollow"</code>: General directive used when you do not want Google to endorse an external destination or pass PageRank equity.
                </li>
                <li>
                  <code>rel="ugc"</code>: Reserved for user-generated content such as blog comments, forum posts, and user submissions.
                </li>
              </ul>
              <div className="pt-1">
                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Guidelines for Qualifying Outbound Links <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                3. Detecting Hidden Affiliate Network Tracking Parameters
              </h3>
              <p>
                Commercial referral programs append distinct parameter signatures to destination URLs:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>Amazon Associates</strong>: <code>tag=</code>, <code>linkCode=</code>, <code>ascsubtag=</code></li>
                <li><strong>ShareASale</strong>: <code>merchantID=</code>, <code>afftrack=</code></li>
                <li><strong>CJ Affiliate</strong>: <code>clickid=</code>, <code>PID=</code></li>
                <li><strong>Impact Radius</strong>: <code>irclickid=</code>, <code>clickid=</code></li>
              </ul>
              <p>
                Our <strong>google link spam compliance</strong> parser analyzes raw HTML anchor tags to surface all monetized URLs regardless of shortener redirects.
              </p>
            </section>
          </div>
        </article>

        {/* Dedicated Internal Cross-Link Section: Explore Related AnalyzeSERP Tools */}
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
            Enhance your page optimization by pairing outbound link audits with our full suite of free SEO utilities:
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

        {/* Layer 5: Frequently Asked Questions Accordion + JSON-LD Schema */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions About Affiliate Link Auditing
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
