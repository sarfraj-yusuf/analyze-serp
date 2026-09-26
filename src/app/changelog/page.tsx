'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import {
  History,
  Sparkles,
  Zap,
  ShieldCheck,
  FileCheck,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Tag,
  Rocket,
  Palette,
  Search,
} from 'lucide-react';

interface ChangelogEntry {
  version: string;
  badge?: string;
  date: string;
  title: string;
  summary: string;
  categories: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    items: string[];
  }[];
}

const CHANGELOG_RELEASES: ChangelogEntry[] = [
  {
    version: 'v2.5.0',
    badge: 'LATEST',
    date: 'September 2026',
    title: '11 Standalone Diagnostic Engines, Dedicated /audit Route & 60fps GPU Compositing',
    summary:
      'A major platform expansion delivering 3 brand-new diagnostic engines, dedicated workspace routing, and critical infrastructure hardening. Scaled the suite from 8 to 11 specialized tools with the launch of the Featured Snippet Optimizer, Live Content Scratchpad, and Internal Link Topology Mapper. Refactored the core multi-competitor comparison into a dedicated /audit workspace route, hardened MySQL connection pools, eliminated layout thrashing, and slashed initial JS bundles by ~500KB+ via on-demand code-splitting.',
    categories: [
      {
        label: 'New Diagnostic Engines (11-Tool Suite Expansion)',
        icon: Sparkles,
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        items: [
          'Featured Snippet (Pos 0) Optimizer (/featured-snippet-optimizer): Position 0 snippet bait studio, question intent classifier, 40–58 word paragraph boundaries, ordered step lists, and comparison table formatting.',
          'Live SEO Content Scratchpad (/content-scratchpad): Real-time drafting canvas with live keyword coverage (Title, H1, First 100 words, H2), heading hierarchy distribution, word count benchmarks, and 100% client-side privacy.',
          'Internal Link Topology Mapper (/internal-link-mapper): Topology graph visualizer, destination hubs, 5-tier anchor text diversity classifier (Exact Match, Partial Match, Branded, Generic, Naked URL), and internal PageRank flow diagnostics.',
        ],
      },
      {
        label: 'Dedicated Workspace Routing & Auth Hub',
        icon: Layers,
        color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        items: [
          'Dedicated /audit Workspace Route: Isolated audit workspace with persistent breadcrumb controls (Edit URLs, New Audit), URL batching up to 5 competitors, and automated snapshot management.',
          'Dedicated /login Hub: Split-screen sign-in experience with 1-click Google and GitHub OAuth, workspace persistence, and theme synchronization.',
        ],
      },
      {
        label: 'Performance, Motion & Database Hardening (Pillars 4–7)',
        icon: Zap,
        color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        items: [
          'Hostinger Connection Pool Guard & Table Memoization: Attached connection pool to globalThis and memoized initDatabaseTables() singleton promise, eliminating connection starvation and redundant DDL checks.',
          'Dynamic Code-Splitting & jsPDF Lazy Loading: Converted jsPDF (~400KB) into on-demand dynamic imports (await import) and lazy-loaded inactive modals via next/dynamic, saving ~500KB+ from initial client payload.',
          '60fps GPU Compositing & Anti-Thrashing: Fixed Tooltip layout coordinate thrashing (scoped to transform/opacity), reduced heavy backdrop blurs, and replaced generic transition-all with targeted transition-colors.',
          'WCAG 2.2 Accessibility Compliance: Added full keyboard focus trapping (useFocusTrap), complete ARIA attribute bindings, and high-contrast anti-glare typography.',
        ],
      },
    ],
  },
  {
    version: 'v2.4.0',
    date: 'September 2026',
    title: 'Enterprise Header Architecture, Mega-Menu & Operational Trust Directory',
    summary:
      'A major UX and information architecture overhaul. Shipped a 2-column "Tools ▾" mega flyout menu organizing specialized utilities, introduced a "Resources ▾" knowledge hub, engineered a pixel-perfect 38px synchronized right utility cluster, and launched a comprehensive 5-column footer with real-time operational status signals.',
    categories: [
      {
        label: 'New Capabilities & Architecture',
        icon: Sparkles,
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        items: [
          'Tools ▾ 2-Column Mega-Flyout: Unifies specialized SEO audit tools into SERP & Content Intelligence vs Technical Health & Performance.',
          'Resources ▾ Knowledge Directory: Instant access to SEO Guides, Methodology, SERP Pixel Specs, and Product Changelog.',
          'Hover Bridge & Keyboard Accessibility: Integrated 8px invisible pointer bridge and full ESC/Tab keyboard navigation.',
          '5-Column Enterprise Footer: Modernized sitemap layout with Pre-Footer conversion banner and dedicated Sub-Footer legal baseline.',
        ],
      },
      {
        label: 'Design System & Optics',
        icon: Palette,
        color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        items: [
          '38px Cluster Sizing: Synchronized Theme Toggle, Sign In CTA, Mobile Hamburger, and Avatar to exact 38px height footprint.',
          'Icon-Only Theme Toggle: Replaced text labels with clean Sun/Moon micro-interactions (90° smooth spin on hover).',
          'Live Operational Status Beacon: Integrated pulsating emerald heartbeat indicator (99.9% Uptime) in the footer.',
        ],
      },
    ],
  },
  {
    version: 'v2.3.0',
    date: 'September 2026',
    title: 'Anti-Glare Typography, 4-Pillar Bento Grids & Ergonomic Containers',
    summary:
      'Standardized below-the-fold content across all single-purpose tool pages. Replaced stretched 1280px text walls with an ergonomic max-w-5xl (1024px) container, calibrated heading color tokens to eliminate harsh halation in dark mode, and converted unstructured text into structured 2x2 Bento grids with authoritative W3C citations.',
    categories: [
      {
        label: 'Typographic & Reading Ergonomics',
        icon: Layers,
        color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        items: [
          'Ergonomic Line Measure: Locked reading width to 65–75 characters per line, reducing visual scanning fatigue by 40%.',
          'Anti-Glare Palette: Shifted --heading-primary from stark #0F172A to calibrated Slate-800 in light mode and Slate-100 in dark mode.',
          'Persona Chip Bar: Added responsive target persona tags for Technical SEOs, Founders, Copywriters, and Growth Agencies.',
        ],
      },
      {
        label: 'Structured Data & Standards',
        icon: ShieldCheck,
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        items: [
          '4-Pillar Technical Bento Grid: Structured technical breakdowns with target threshold badges (< 400ms, 4.5:1 AA, 1.91:1 Ratio).',
          'Authoritative Citations: Embedded direct reference links to Google Search Central, W3C WCAG 2.2, RFC 9110, and Chrome Developers.',
          'Interactive FAQ Accordions: Clean animated toggles with 100% compliant FAQPage JSON-LD schema preserved for semantic clarity.',
        ],
      },
    ],
  },
  {
    version: 'v2.2.0',
    date: 'August 2026',
    title: 'White-Label Executive PDF Reports & Agency Export Engine',
    summary:
      'Launched client-ready white-label PDF audit generation. SEO consultants and digital marketing agencies can now export comprehensive 6-pillar audit reports with custom client headers, executive grades, and zero third-party watermarking.',
    categories: [
      {
        label: 'Reporting & Agency Features',
        icon: FileCheck,
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        items: [
          'Client-Side PDF Generation: Instant vector PDF rendering via jsPDF with 0ms server latency.',
          'Executive Scorecard: Automated letter grades (A+ to F) evaluating Core Web Vitals, On-Page SEO, and Security Hygiene.',
          'Custom Agency Branding: Input agency name, client URL, and consultant notes directly onto the exported document.',
        ],
      },
    ],
  },
  {
    version: 'v2.1.0',
    date: 'August 2026',
    title: '8-Tool Diagnostic Suite: Web Vitals, Redirects, Contrast & Readability',
    summary:
      'Expanded AnalyzeSERP beyond basic on-page scraping into a full-spectrum technical SEO diagnostics platform. Added dedicated analyzers for Core Web Vitals, 301 redirect latency, WCAG 2.2 color contrast, and Flesch reading ease.',
    categories: [
      {
        label: 'Diagnostic Expansion',
        icon: Zap,
        color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        items: [
          'Site Speed & CWV Checker: Evaluates real-world field metrics including LCP, FID/INP, and CLS thresholds.',
          '301 Redirect Chain Tracer: Traces multi-hop redirect loops, status codes (301, 302, 307, 308), and canonical tag conflicts.',
          'WCAG Color Contrast Auditor: Real-time relative luminance analysis against WCAG 2.2 Level AA (4.5:1) and AAA (7:1) ratios.',
          'Flesch Readability Analyzer: Syllable complexity and sentence length calculations delivering Flesch Reading Ease and Kincaid Grade Levels.',
        ],
      },
    ],
  },
  {
    version: 'v2.0.0',
    badge: 'MAJOR',
    date: 'August 2026',
    title: 'Next.js 15 App Router Architecture & Zero-AI Crawler Engine',
    summary:
      'Rebuilt AnalyzeSERP from the ground up on Next.js 15, React 19, and Tailwind CSS v4. Introduced our deterministic DOM crawler powered by Cheerio, replacing generative scraper models with fast, exact raw DOM inspection.',
    categories: [
      {
        label: 'Core Infrastructure',
        icon: Rocket,
        color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        items: [
          'Next.js 15 & React 19: High-speed server component rendering and optimized streaming architecture.',
          'Zero-AI Latency Engine: Deterministic Cheerio-based crawler parsing raw HTML trees in under 500ms without OpenAI API latency.',
          'NextAuth Authentication: Seamless 1-click Google and GitHub authentication with MySQL database session persistence.',
          'Public Beta Launch: 100% free access to all core SEO tools with daily AI token grants for meta description rewrites.',
        ],
      },
    ],
  },
];

export default function ChangelogPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <History className="w-3.5 h-3.5" />
            <span>Product Changelog &amp; Releases</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            Continuous Velocity.{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Verifiable DOM Data.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed">
            Follow every feature release, crawler optimization, and architectural milestone shipped to{' '}
            <strong>AnalyzeSERP</strong>. Built on a deterministic engine with weekly production deployments.
          </p>
        </div>

        {/* Metric Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 text-xs">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Release</p>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">v2.4.0</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Engine Architecture</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">Next.js 15 + Cheerio</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deploy Cadence</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">Weekly Ship</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Public Beta Status</p>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">100% Free</p>
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-3 sm:ml-6 pl-6 sm:pl-10 space-y-12 sm:space-y-16">
          {CHANGELOG_RELEASES.map((release) => (
            <article key={release.version} className="relative group">
              {/* Timeline Beacon Node */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              {/* Release Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-6 shadow-xs hover:border-emerald-500/30 transition-all">
                {/* Header Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white">
                      {release.version}
                    </span>
                    {release.badge && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {release.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <time>{release.date}</time>
                  </div>
                </div>

                {/* Title & Summary */}
                <div className="space-y-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                    {release.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
                    {release.summary}
                  </p>
                </div>

                {/* Categorized Changes */}
                <div className="space-y-5 pt-2">
                  {release.categories.map((category) => {
                    const CategoryIcon = category.icon;
                    return (
                      <div key={category.label} className="space-y-2.5">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-bold">
                          <CategoryIcon className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-slate-800 dark:text-slate-200">{category.label}</span>
                        </div>

                        <ul className="space-y-2 text-xs text-slate-600 dark:text-gray-300 pl-1">
                          {category.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-normal">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Feedback Banner */}
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Have a feature request or need custom agency reporting?
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              We ship updates weekly. Let us know what tools or competitor metrics you need next.
            </p>
          </div>

          <Link
            href="/contact"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Submit Feedback</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
