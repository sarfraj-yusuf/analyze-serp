'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LinkInspectorCard } from '@/components/LinkInspectorCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { LinkAudit } from '@/types/seo';
import { CompactToolDock } from '@/components/CompactToolDock';
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
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

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
        throw new Error('Failed to fetch link footprint data');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setLinkAudit(data.results[0].linkAudit);
        triggerToolExecutionFeedback();
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-emerald-500 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Audit Suite</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-100 font-medium">Affiliate Link Checker</span>
        </nav>

        {/* Compact App-First Header */}
        <header className="space-y-2 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            <span>Monetization Compliance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
            Affiliate Link &amp; rel=&quot;sponsored&quot; Compliance Checker
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Audit outbound links for affiliate parameters (Amazon, ShareASale, CJ, Impact), verify rel=&quot;sponsored&quot; &amp; rel=&quot;nofollow&quot; compliance, and align with Google link spam guidelines.
          </p>
        </header>

        {/* Top-Fold Tool Input Dock */}
        <section aria-label="Affiliate Link Checker Tool Input Form" className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel hero-input-dock rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.08] space-y-4">
            <form onSubmit={handleInspectUrl} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="example.com or https://example.com/reviews"
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
                  <span>Inspecting...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Links</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero data logging · Transient client fetch</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">Checks Amazon, CJ, ShareASale, Impact</span>
            </div>

            {error && <div className="text-xs text-red-600 dark:text-red-400 text-center font-semibold pt-1">{error}</div>}
          </div>

          {/* Results Card */}
          {linkAudit && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Affiliate Link Audit Results</h3>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{urlInput}</span>
              </div>
              <LinkInspectorCard linkAudit={linkAudit} />
            </div>
          )}
        </section>

        {/* Editorial SEO & Link Compliance Knowledge Container */}
        <div className="max-w-5xl mx-auto w-full space-y-16 pt-10 border-t border-slate-200/80 dark:border-white/[0.08]">
          {/* 1. 3-Step How-To-Use Workflow */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Usage & Workflow</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                How to Use the Affiliate Link Checker
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Scan outbound links, audit rel="sponsored" compliance, and protect PageRank in 3 simple steps.
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
                  <strong>Affiliate Publishers:</strong> Comply with Amazon, CJ, and ShareASale terms
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Technical SEOs:</strong> Stop PageRank link equity leaks to third parties
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Site Buyers & Investors:</strong> Perform pre-acquisition PBN link due diligence
                </span>
              </div>
            </div>
          </section>

          {/* 2. 4-Pillar Link Spam & Compliance Architecture (2x2 Bento Grid) */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Link Compliance</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                The Science of Outbound Links: Google SpamBrain & rel Directives
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Official Google guidelines for qualifying commercial links, maintaining search compliance, and preserving link equity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: rel="sponsored" Qualification */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Mandatory Directive
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      rel="sponsored"
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    1. Qualifying Monetized & Commercial Links
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Google Webmaster Guidelines mandate that commercial and affiliate links carry <code>rel="sponsored"</code> or <code>rel="nofollow"</code>. Google's AI SpamBrain actively detects untagged commercial footprints.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Affiliate Referral Links:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">rel="sponsored"</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Sponsored / Paid Reviews:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">rel="sponsored"</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>User-Generated Links:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">rel="ugc"</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Guidelines for Qualifying Outbound Links</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 2: PageRank Equity Leakage */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Link Equity
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/20">
                      Zero PageRank Leak
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    2. PageRank Leakage Prevention
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Unqualified commercial links bleed valuable PageRank equity to third-party domains. Tagging outbound links ensures internal PageRank stays focused on ranking your own authoritative content.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Unqualified Commercial Link:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">Leaks Authority</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>rel="sponsored" Tagged:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Equity Retained</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Compliance Posture:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Policy Compliant</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/essentials/spam-policies#link-spam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Essentials Link Spam Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 3: FTC & Network Terms */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Legal & Compliance
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                      FTC 16 CFR § 255
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    3. FTC & Affiliate Network Regulations
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Commercial regulations and major affiliate networks (Amazon Associates, CJ, ShareASale) require clear, conspicuous disclosure placed above the fold prior to the first affiliate interaction.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Disclosure Placement:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Above the Fold</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Amazon Operating Agreement:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Mandatory Clause</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Account Suspension Risk:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Protected</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>FTC Guidance on Endorsement & Affiliate Disclosures</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 4: Tracking Footprint Detection */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Footprint Detection
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/20">
                      4 Top Networks
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    4. Network Parameter Footprints
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Commercial referral programs append distinct tracking parameter signatures. Our parser inspects raw DOM anchors to surface all monetized URLs regardless of shortener redirects.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Amazon Associates:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">tag=, linkCode=</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>ShareASale & CJ Affiliate:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">merchantID=, clickid=</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Impact & Rakuten:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">irclickid=, ranMID=</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/blog/2022/12/december-22-link-spam-update"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google SpamBrain System & Link Spam Announcement</span>
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
                Frequently Asked Questions About Affiliate Link Auditing
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Essential insights into rel="sponsored" requirements, Google SpamBrain, and PageRank leakage.
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
          <CompactToolDock currentTool="affiliate-link-checker" />
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
