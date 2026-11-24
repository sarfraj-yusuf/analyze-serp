'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FaqAccordion } from '@/components/FaqAccordion';
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  ArrowRight,
  Layers,
  HelpCircle,
  ChevronDown,
  Zap,
  FileCheck,
  Users,
  Building2,
  Lock,
  Download,
  Activity,
  Gauge,
  Compass,
  Star,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const PRICING_FAQS: FaqItem[] = [
  {
    q: 'Is AnalyzeSERP really 100% free during the Public Beta?',
    a: 'Yes. During our Public Beta, every single diagnostic tool—including multi-URL competitor audits, Core Web Vitals diagnostics, and executive white-label vector PDF exports—is completely free to use with zero credit card required.',
  },
  {
    q: 'Will I be prompted for a credit card or automatically charged later?',
    a: 'No. You will never be asked for billing details during the beta. When paid subscription tiers officially launch in the future, early beta users will receive ample notice and can choose whether to remain on the Free Starter plan or upgrade with a permanent grandfathered discount.',
  },
  {
    q: 'Can marketing agencies use the White-Label PDF reports for paying clients?',
    a: 'Absolutely. All PDF reports generated during the Public Beta include full commercial usage rights. You can customize the document with your agency name, client URL, and consultant recommendations, producing unbranded, executive-ready deliverables with zero AnalyzeSERP watermarks.',
  },
  {
    q: 'How does AnalyzeSERP extract search data in under 500 milliseconds without AI latency?',
    a: 'AnalyzeSERP bypasses heavy headless browsers and generative LLMs in favor of a specialized, high-concurrency Node.js parsing engine. We extract live HTML tags, heading hierarchies, schema markup, and keyword phrases directly from the page source with 100% accuracy and zero AI hallucinations.',
  },
  {
    q: 'How will pricing work once AnalyzeSERP transitions out of Public Beta?',
    a: 'AnalyzeSERP will always offer a Free Forever Starter plan for individual site owners. Our Pro Auditor plan will be $19/month (or $15/month billed annually), and Agency Scale will be $49/month. All active beta testers will receive an exclusive 50% lifetime grandfathered discount.',
  },
  {
    q: 'What is included in the Early Adopter lifetime discount?',
    a: 'Anyone who creates a free account and audits websites during our Public Beta locks in a permanent 50% discount on all future paid plans for life. Your price will never increase as long as your account remains active.',
  },
];

interface FeatureRow {
  name: string;
  starter: string | boolean;
  proBeta: string | boolean;
  agency: string | boolean;
  highlight?: boolean;
}

interface FeatureCategory {
  category: string;
  icon: React.ReactNode;
  features: FeatureRow[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    category: '1. Crawling & Velocity Engine',
    icon: <Zap className="w-4 h-4 text-emerald-500" />,
    features: [
      { name: 'Core Engine Architecture', starter: 'Direct HTML Parser', proBeta: 'Direct HTML Parser', agency: 'Dedicated Cluster' },
      { name: 'Average Extraction Latency', starter: '< 500ms TTFB', proBeta: '< 450ms TTFB', agency: '< 350ms TTFB' },
      { name: 'Extraction Mode', starter: 'Live Page Analysis', proBeta: 'Live Page Analysis', agency: 'Live Page Analysis' },
      { name: 'Raw HTML Payload & Status Codes', starter: true, proBeta: true, agency: true },
      { name: 'Priority Server Crawl Queue', starter: false, proBeta: true, agency: true, highlight: true },
    ],
  },
  {
    category: '2. On-Page & Competitor Intelligence',
    icon: <Compass className="w-4 h-4 text-emerald-500" />,
    features: [
      { name: 'Competitor Multi-URL Batching', starter: '1 URL at a time', proBeta: 'Up to 5 URLs', agency: 'Up to 25 URLs', highlight: true },
      { name: 'Single & Multi-Word Keyword Gap Analysis', starter: true, proBeta: true, agency: true },
      { name: 'Heading Tree Hierarchy (H1–H6 Depth)', starter: true, proBeta: true, agency: true },
      { name: 'SERP & Social Card Pixel Simulator (600px)', starter: true, proBeta: true, agency: true },
      { name: 'Content Economics & Word Count Maps', starter: true, proBeta: true, agency: true },
    ],
  },
  {
    category: '3. Technical SEO & Core Web Vitals',
    icon: <Gauge className="w-4 h-4 text-emerald-500" />,
    features: [
      { name: 'Google 2026 Core Web Vitals (LCP, INP, CLS)', starter: true, proBeta: true, agency: true },
      { name: '301/302 Redirect Multi-Hop Chain Tracer', starter: true, proBeta: true, agency: true },
      { name: 'WCAG 2.2 AA/AAA Color Contrast Studio', starter: true, proBeta: true, agency: true },
      { name: 'Flesch Reading Ease & Grade Level Scoring', starter: true, proBeta: true, agency: true },
      { name: 'Affiliate & Sponsored Link Hygiene Inspector', starter: true, proBeta: true, agency: true },
    ],
  },
  {
    category: '4. Agency White-Label & Deliverables',
    icon: <FileCheck className="w-4 h-4 text-emerald-500" />,
    features: [
      { name: 'Executive Vector PDF Report Engine', starter: false, proBeta: 'Full (Zero Watermarks)', agency: 'Full (Zero Watermarks)', highlight: true },
      { name: 'Custom Agency Name & Branding in Header', starter: false, proBeta: true, agency: true, highlight: true },
      { name: 'Custom Accent Brand Color Palette', starter: false, proBeta: true, agency: true },
      { name: 'Client Consultant Recommendations Block', starter: false, proBeta: true, agency: true },
      { name: 'Export Markdown Content Briefs (.md)', starter: 'Watermarked', proBeta: 'Unbranded', agency: 'Unbranded' },
    ],
  },
  {
    category: '5. Capacity, Seats & Governance',
    icon: <Users className="w-4 h-4 text-emerald-500" />,
    features: [
      { name: 'Daily Audit Capacity', starter: '5 URLs / day', proBeta: 'Unlimited (in Beta)', agency: 'Unlimited Priority', highlight: true },
      { name: 'Team Member Seats', starter: '1 Seat', proBeta: '1 Seat', agency: '10 Seats' },
      { name: 'Client-Side Privacy (Zero URL Tracking)', starter: true, proBeta: true, agency: true },
      { name: 'Support Tier', starter: 'Community Docs', proBeta: 'Priority Beta Channel', agency: 'Dedicated Account Lead' },
    ],
  },
];

export default function PricingPage() {
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const faqAccordionItems = PRICING_FAQS.map((faq) => ({
    question: faq.q,
    answer: faq.a,
  }));

  const pricingSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: PRICING_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      '@id': 'https://analyzeserp.com/#webapp',
      name: 'AnalyzeSERP Competitor SEO Suite',
      url: 'https://analyzeserp.com/pricing',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      provider: {
        '@id': 'https://analyzeserp.com/#organization',
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Public Beta',
          price: '0.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'Unlimited competitor SEO audits, Core Web Vitals checks, and white-label vector PDF exports.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      {/* Pricing JSON-LD Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchemas) }}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-20">
        {/* Section 1: Hero & Trust Strip */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Public Beta Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            100% Free in Public Beta.{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Enterprise Diagnostics for Everyone.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Audit competitor search pages, inspect technical DOM health, and export white-label agency client reports in sub-500ms with zero credit card required.
          </p>

          {/* 4-Pillar Trust Strip */}
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-gray-300">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-gray-300">
              <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sub-500ms Crawls</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-gray-300">
              <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>White-Label Rights</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-gray-300">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zero Data Brokering</span>
            </div>
          </div>
        </div>

        {/* Section 2: Current Beta Access (2 Clear Options) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-4xl mx-auto">
          {/* Card 1: Instant Guest Access */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                  <span>Instant Access</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Guest Auditor
                </h2>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">$0</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ no signup required</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Run immediate multi-URL competitor audits and test standalone utilities with zero friction.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-gray-300 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Multi-URL Competitor Audits</strong> (up to 5 URLs in parallel)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>All 10 Standalone Micro-Diagnostic Utilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Keyword Gap &amp; Missing Search Intent Matrices</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Executive Vector PDF Report Generator</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Direct HTML Extraction (&lt;500ms TTFB)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Complete Client-Side Privacy (Zero URL Tracking)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/"
                className="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 font-bold text-xs text-center border border-slate-200 dark:border-white/10 transition-all cursor-pointer block"
              >
                Run an Instant Audit →
              </Link>
              <p className="text-[11px] text-center text-slate-500 dark:text-gray-400">
                No credit card &bull; No login required
              </p>
            </div>
          </div>

          {/* Card 2: Free Beta Account (Featured) */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border-2 border-emerald-500/80 bg-emerald-500/[0.04] flex flex-col justify-between space-y-6 shadow-xl relative">
            {/* Active Beta Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3 h-3" />
              <span>RECOMMENDED FOR AGENCIES &amp; TEAMS</span>
            </div>

            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <span>Free Account</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>Beta Member Workspace</span>
                </h2>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">$0</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ 100% free beta access</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Save your agency branding, keep persistent audit history across devices, and lock in grandfathered perks.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-gray-300 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <li className="flex items-start gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Everything in Guest Auditor, plus:</span>
                </li>
                <li className="flex items-start gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Persistent Workspace Audit History</strong> (access past runs anytime)</span>
                </li>
                <li className="flex items-start gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Saved Agency Branding</strong> (custom logo &amp; name on all PDF reports)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Custom Brand Accent Colors for White-Label Briefs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Consultant Recommendation Notes &amp; Action Items</span>
                </li>
                <li className="flex items-start gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Early Adopter 50% Lifetime Discount</strong> on future plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Priority Beta Feedback &amp; Feature Requests Channel</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer block text-center"
              >
                <span>Create Free Beta Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <p className="text-[11px] text-center text-slate-500 dark:text-gray-400">
                Takes 30 seconds via Google or GitHub &bull; No credit card
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Early Adopter Grandfathering Guarantee Banner */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/30 bg-emerald-500/[0.02] flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Early Adopter Guarantee</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
              Why is Pro 100% Free Right Now?
            </h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed max-w-2xl">
              We believe diagnostic accuracy should be democratized. By testing our live page auditor today, you help us refine our platform. In return, all active beta users lock in a permanent <strong>50% lifetime grandfathered discount</strong> on all future paid plans.
            </p>
          </div>

          <Link
            href="/login"
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 font-bold text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            Claim 50% Lifetime Discount →
          </Link>
        </div>

        {/* Section 4: Collapsible Post-Beta Commercial Roadmap & Comparison Matrix */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] overflow-hidden transition-all max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => setIsRoadmapOpen(!isRoadmapOpen)}
            aria-expanded={isRoadmapOpen}
            className="w-full p-5 sm:p-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Commercial Roadmap (Post-Beta)</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Post-Beta Commercial Pricing &amp; Feature Comparison Matrix
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Explore our planned post-beta subscription tiers ($0 Starter, $19 Pro, $49 Agency) and early adopter grandfathered rates.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
              <span>{isRoadmapOpen ? 'Hide Commercial Roadmap' : 'View Commercial Roadmap'}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isRoadmapOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {isRoadmapOpen && (
            <div className="p-5 sm:p-8 pt-4 sm:pt-6 border-t border-slate-200/80 dark:border-white/10 space-y-10 animate-in fade-in duration-200">
              {/* 3-Tier Post-Beta Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Tier 1: Starter */}
                <div className="p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Starter Tier</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">$0</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">/ forever free</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Essential single-page audits for site owners running occasional health checks.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-white/5">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 5 single-URL audits/day</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Direct HTML page extraction</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Core Web Vitals checks</li>
                      <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500 line-through"><X className="w-3.5 h-3.5 text-slate-400 shrink-0" /> White-Label PDF reports</li>
                    </ul>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 text-center block pt-2 border-t border-slate-100 dark:border-white/5">Post-Beta Base Tier</span>
                </div>

                {/* Tier 2: Pro Auditor */}
                <div className="p-5 sm:p-6 rounded-xl border-2 border-emerald-500/70 bg-emerald-500/[0.02] flex flex-col justify-between space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pro Auditor</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">$19</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                      Early beta members lock in 50% off ($9.50/mo)
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-white/5">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Multi-URL competitor batching</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Executive White-Label PDF exports</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Custom agency branding</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Keyword gap matrices</li>
                    </ul>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 text-center block pt-2 border-t border-slate-100 dark:border-white/5">100% Free During Beta</span>
                </div>

                {/* Tier 3: Agency Scale */}
                <div className="p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Agency Scale</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">$49</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                      Early beta members lock in 50% off ($24.50/mo)
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-white/5">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Batch audit up to 25 URLs</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 10 team member workspace seats</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Dedicated crawl infrastructure</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Priority agency support</li>
                    </ul>
                  </div>
                  <Link href="/contact" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline text-center block pt-2 border-t border-slate-100 dark:border-white/5">
                    Inquire for Agency Beta →
                  </Link>
                </div>
              </div>

              {/* Detailed Feature Comparison Matrix Table */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Full Feature Breakdown Matrix
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Comprehensive comparison across our 10 standalone diagnostic utilities and competitor suite.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4 sm:px-5 w-2/5">Platform Feature</th>
                        <th className="py-3.5 px-3 text-center w-1/5">Starter ($0)</th>
                        <th className="py-3.5 px-3 text-center w-1/5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold">
                          Pro Auditor ($19)
                        </th>
                        <th className="py-3.5 px-3 text-center w-1/5">Agency ($49)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-gray-200">
                      {FEATURE_CATEGORIES.map((cat, catIdx) => (
                        <React.Fragment key={catIdx}>
                          {/* Category Header Row */}
                          <tr className="bg-slate-100/60 dark:bg-white/[0.02]">
                            <td
                              colSpan={4}
                              className="py-2.5 px-4 sm:px-5 text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider"
                            >
                              <div className="flex items-center gap-2">
                                {cat.icon}
                                <span>{cat.category}</span>
                              </div>
                            </td>
                          </tr>

                          {/* Category Features */}
                          {cat.features.map((feat, featIdx) => (
                            <tr
                              key={featIdx}
                              className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${
                                feat.highlight ? 'bg-emerald-500/[0.02]' : ''
                              }`}
                            >
                              <td className="py-2.5 px-4 sm:px-5 font-medium text-slate-700 dark:text-gray-300">
                                {feat.name}
                              </td>

                              {/* Starter Tier Value */}
                              <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600 dark:text-gray-400">
                                {typeof feat.starter === 'boolean' ? (
                                  feat.starter ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 text-slate-300 dark:text-gray-600 mx-auto" />
                                  )
                                ) : (
                                  <span>{feat.starter}</span>
                                )}
                              </td>

                              {/* Pro Beta Tier Value */}
                              <td className="py-2.5 px-3 text-center font-mono text-[11px] font-bold bg-emerald-500/[0.04] text-emerald-700 dark:text-emerald-300">
                                {typeof feat.proBeta === 'boolean' ? (
                                  feat.proBeta ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 text-slate-300 dark:text-gray-600 mx-auto" />
                                  )
                                ) : (
                                  <span>{feat.proBeta}</span>
                                )}
                              </td>

                              {/* Agency Tier Value */}
                              <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-700 dark:text-gray-300">
                                {typeof feat.agency === 'boolean' ? (
                                  feat.agency ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 text-slate-300 dark:text-gray-600 mx-auto" />
                                  )
                                ) : (
                                  <span>{feat.agency}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Interactive Pricing FAQ Accordion */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              <span>Frequently Asked Pricing Questions</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              Clear, transparent answers about our beta access and future plans.
            </p>
          </div>

          <FaqAccordion items={faqAccordionItems} />
        </div>

        {/* Section 6: High-Conversion Enterprise Action Strip */}
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200/80 dark:border-white/10 text-center space-y-5 bg-gradient-to-b from-transparent to-emerald-500/[0.03]">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Ready to Audit Competitors in Sub-500ms?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
              Experience fast, accurate SEO intelligence with verifiable live HTML facts, unlimited audits, and unbranded client reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Run Free Competitor Audit Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-semibold text-xs transition-all cursor-pointer"
            >
              <span>Inquire for Agency Access</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
