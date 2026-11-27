import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const showPricing = process.env.NEXT_PUBLIC_SHOW_PRICING === 'true';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-panel border-t border-slate-200/80 dark:border-white/10 mt-16 pt-12 pb-10 text-xs text-slate-600 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main 5-Column Sitemap Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10">
          {/* Brand & Trust Column (Spans 2 columns on desktop) */}
          <div className="space-y-4 md:col-span-2 lg:col-span-2">
            <Link href="/" aria-label="AnalyzeSERP Home" className="inline-block">
              <Logo size="lg" variant="full" showTagline={true} />
            </Link>

            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              <strong>AnalyzeSERP.com</strong> is a fast, accurate competitor SEO auditor with an on-demand AI writing co-pilot. Built for content writers, SEO specialists, developers, and digital marketing agencies.
            </p>

            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold">All Systems Operational</span>
              <span className="text-emerald-500/40">•</span>
              <span className="font-mono text-[10px] text-slate-500 dark:text-gray-400">99.9% Uptime</span>
            </div>
          </div>

          {/* Column 2: SERP & Content Intelligence */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              SERP &amp; Content
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Competitor Audit Suite
                </Link>
              </li>
              <li>
                <Link
                  href="/serp-snippet-preview"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  SERP Snippet Simulator
                </Link>
              </li>
              <li>
                <Link
                  href="/readability"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Readability &amp; Tone Analyzer
                </Link>
              </li>
              <li>
                <Link
                  href="/featured-snippet-optimizer"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Snippet Optimizer
                </Link>
              </li>
              <li>
                <Link
                  href="/content-scratchpad"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Content Scratchpad
                </Link>
              </li>
              <li>
                <Link
                  href="/affiliate-link-checker"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Affiliate Link Validator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Technical Health & Core Web Vitals */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Technical Health
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/technical-health"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Technical Health Audit
                </Link>
              </li>
              <li>
                <Link
                  href="/site-speed-checker"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Site Speed &amp; TTFB
                </Link>
              </li>
              <li>
                <Link
                  href="/redirect-checker"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Redirect Chain Tracer
                </Link>
              </li>
              <li>
                <Link
                  href="/contrast-checker"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Color Contrast Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/internal-link-mapper"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Internal Link Checker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Access */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/pdf-reports"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  White-Label PDF Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold transition-colors inline-block py-0.5"
                >
                  Pricing &amp; Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Product Changelog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Request Feature
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Company & Resources */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Resources &amp; Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/blog"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  SEO Knowledge Base
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Why AnalyzeSERP
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Sign In to Workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/rss.xml"
                  target="_blank"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 py-0.5 font-medium"
                >
                  <span>RSS XML Feed</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-Footer Legal & Compliance Baseline */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-gray-500">
          <div>
            &copy; {currentYear} <strong>AnalyzeSERP.com</strong>. All rights reserved.
          </div>

          <div className="flex items-center flex-wrap justify-center gap-4 text-[11px]">
            <Link
              href="/privacy"
              className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300 dark:text-white/10">&bull;</span>
            <Link
              href="/terms"
              className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-slate-300 dark:text-white/10">&bull;</span>
            <Link
              href="/rss.xml"
              target="_blank"
              className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              RSS XML
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 dark:text-gray-500 text-[10.5px]">
            <span>Deterministic, high-speed competitor SEO suite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
