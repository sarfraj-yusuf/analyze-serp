'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
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
    a: 'AnalyzeSERP bypasses heavy headless browsers and generative LLMs in favor of a specialized, high-concurrency Node.js Cheerio DOM engine. We extract raw HTML tags, heading hierarchies, schema markup, and keyword n-grams directly from the document AST with zero hallucinations.',
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
      { name: 'Core Engine Architecture', starter: 'Cheerio Raw DOM AST', proBeta: 'Cheerio Raw DOM AST', agency: 'Dedicated Cluster' },
      { name: 'Average Extraction Latency', starter: '< 500ms TTFB', proBeta: '< 450ms TTFB', agency: '< 350ms TTFB' },
      { name: 'Generative AI Hallucination Rate', starter: '0.0% (Exact Facts)', proBeta: '0.0% (Exact Facts)', agency: '0.0% (Exact Facts)' },
      { name: 'Raw HTML Payload & Status Codes', starter: true, proBeta: true, agency: true },
      { name: 'Priority Server Crawl Queue', starter: false, proBeta: true, agency: true, highlight: true },
    ],
  },
  {
    category: '2. On-Page & Competitor Intelligence',
    icon: <Compass className="w-4 h-4 text-emerald-500" />,
    features: [
      { name: 'Competitor Multi-URL Batching', starter: '1 URL at a time', proBeta: 'Up to 5 URLs', agency: 'Up to 25 URLs', highlight: true },
      { name: '1-Gram, 2-Gram & 3-Gram Keyword Gaps', starter: true, proBeta: true, agency: true },
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
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

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
      name: 'AnalyzeSERP Competitor SEO Suite',
      url: 'https://analyzeserp.com/pricing',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Public Beta',
          price: '0.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'Unlimited competitor SEO audits, Core Web Vitals checks, and white-label vector PDF exports.',
        },
        {
          '@type': 'Offer',
          name: 'Pro Auditor Plan',
          price: '19.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/PreOrder',
          description: '5 competitor URLs, unlimited audit history, and priority crawling.',
        },
        {
          '@type': 'Offer',
          name: 'Agency Scale Plan',
          price: '49.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/PreOrder',
          description: 'Up to 25 competitor URLs, unbranded client reporting, and dedicated crawler queue.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

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

        {/* Section 2: 3-Tier Enterprise Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* Card 1: Free Starter (Post-Beta Base) */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Starter Tier
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">$0</span>
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">/ forever free</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Essential single-page audits for bloggers, indie hackers, and site owners running occasional health checks.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-gray-300 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>5 Single-URL Audits per day</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Raw DOM Cheerio Extraction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Google 2026 Core Web Vitals</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>SERP & Social Snippet Simulator</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Flesch Readability Scoring</span>
                </li>
                <li className="flex items-start gap-2 text-slate-400 dark:text-gray-500 line-through">
                  <X className="w-4 h-4 shrink-0 mt-0.5 text-slate-400 dark:text-gray-600" />
                  <span>White-Label PDF Reports (Post-Beta)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 font-bold text-xs text-center border border-slate-200 dark:border-white/10 transition-all cursor-pointer block"
            >
              Start Free Audits
            </Link>
          </div>

          {/* Card 2: Pro Auditor (Featured Focal Point - Public Beta Active) */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border-2 border-emerald-500/80 bg-emerald-500/[0.04] flex flex-col justify-between space-y-6 shadow-xl relative">
            {/* Active Beta Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>ACTIVE IN PUBLIC BETA • 100% UNLOCKED</span>
            </div>

            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pro Auditor (Featured)</span>
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">$0</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ month</span>
                  <span className="line-through text-xs text-slate-400 font-medium">($19 value)</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Public Beta Free
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Full access to our deterministic crawler and unbranded agency PDF engine. Zero credit card required during Public Beta.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-gray-300 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <li className="flex items-start gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Unlimited Audits (with 120s Cooldown Reset)</span>
                </li>
                <li className="flex items-start gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Batch Multi-URL Competitor Analysis</span>
                </li>
                <li className="flex items-start gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Executive White-Label PDF Reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Custom Agency Logo & Brand Accent</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>1-Gram, 2-Gram & 3-Gram Keyword Gaps</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>301/302 Redirect Multi-Hop Tracer</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>WCAG 2.2 AA/AAA Color Contrast Studio</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Export Unbranded Markdown Briefs</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Link
                href="/"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer block text-center"
              >
                <span>Start Free Auditing Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="text-[11px] text-center text-slate-500 dark:text-gray-400">
                Instant access • No credit card needed
              </div>
            </div>
          </div>

          {/* Card 3: Agency Scale Tier */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Agency Scale
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">$49</span>
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">/ month (post-beta)</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Designed for high-output SEO agencies, consultants, and growth teams managing multiple client portfolios.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-gray-300 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <li className="flex items-start gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Batch Audit Up to 25 URLs at once</span>
                </li>
                <li className="flex items-start gap-2 font-semibold text-slate-800 dark:text-slate-200">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>10 Team Member Workspace Seats</span>
                </li>
                <li className="flex items-start gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Unlimited Unbranded Client Reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Client Consultant Recommendations in PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Dedicated Crawl IP Infrastructure</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Priority Slack / Telegram Support</span>
                </li>
              </ul>
            </div>

            <Link
              href="/contact"
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 font-bold text-xs text-center border border-slate-200 dark:border-white/10 transition-all cursor-pointer block"
            >
              Inquire for Agency Beta
            </Link>
          </div>
        </div>

        {/* Section 3: Early Adopter Grandfathering Guarantee Banner */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/30 bg-emerald-500/[0.02] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Early Adopter Guarantee</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
              Why is Pro 100% Free Right Now?
            </h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed max-w-2xl">
              We believe diagnostic accuracy should be democratized. By testing our deterministic DOM scraper today, you help us refine our telemetry. In return, all active beta users lock in a permanent <strong>50% lifetime grandfathered discount</strong> on all future paid plans.
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 font-bold text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            Claim Beta Access Free →
          </Link>
        </div>

        {/* Section 4: Categorized Detailed Feature Comparison Matrix */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <span>Detailed Feature Comparison Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Compare our 8 single-purpose diagnostic engines across each tier.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5 w-2/5">Platform Feature</th>
                  <th className="py-4 px-4 text-center w-1/5">Starter ($0)</th>
                  <th className="py-4 px-4 text-center w-1/5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold">
                    Pro Auditor ($0 Beta)
                  </th>
                  <th className="py-4 px-4 text-center w-1/5">Agency ($49)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-gray-200">
                {FEATURE_CATEGORIES.map((cat, catIdx) => (
                  <React.Fragment key={catIdx}>
                    {/* Category Header Row */}
                    <tr className="bg-slate-100/60 dark:bg-white/[0.02]">
                      <td
                        colSpan={4}
                        className="py-3 px-5 text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider"
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
                        <td className="py-3 px-5 font-medium text-slate-700 dark:text-gray-300">
                          {feat.name}
                        </td>

                        {/* Starter Tier Value */}
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600 dark:text-gray-400">
                          {typeof feat.starter === 'boolean' ? (
                            feat.starter ? (
                              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 dark:text-gray-600 mx-auto" />
                            )
                          ) : (
                            <span>{feat.starter}</span>
                          )}
                        </td>

                        {/* Pro Beta Tier Value */}
                        <td className="py-3 px-4 text-center font-mono text-[11px] font-bold bg-emerald-500/[0.04] text-emerald-700 dark:text-emerald-300">
                          {typeof feat.proBeta === 'boolean' ? (
                            feat.proBeta ? (
                              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 dark:text-gray-600 mx-auto" />
                            )
                          ) : (
                            <span>{feat.proBeta}</span>
                          )}
                        </td>

                        {/* Agency Tier Value */}
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-700 dark:text-gray-300">
                          {typeof feat.agency === 'boolean' ? (
                            feat.agency ? (
                              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 dark:text-gray-600 mx-auto" />
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

          <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
            {PRICING_FAQS.map((faq, index) => {
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
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-gray-300 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 6: High-Conversion Enterprise Action Strip */}
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200/80 dark:border-white/10 text-center space-y-5 bg-gradient-to-b from-transparent to-emerald-500/[0.03]">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Ready to Audit Competitors in Sub-500ms?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
              Experience deterministic SEO intelligence with zero AI hallucinations, unlimited audits, and unbranded client reports.
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
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
