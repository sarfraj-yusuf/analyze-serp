import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-panel border-t border-slate-200/80 dark:border-white/10 mt-20 pt-14 pb-10 text-xs text-slate-600 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Pre-Footer Quick Value & Action Banner */}
        <div className="pb-10 border-b border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Instant Competitor SEO Intelligence — Zero Lock-In</span>
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                100% Free Beta
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
              Deterministic SERP crawling, on-page competitor gap detection, Core Web Vitals benchmarks, and client-ready audit exports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Run Free Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-semibold text-xs transition-all cursor-pointer"
            >
              <span>View Beta Access</span>
            </Link>
          </div>
        </div>

        {/* Main 5-Column Sitemap Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10">
          {/* Brand & Trust Column (Spans 2 columns on desktop) */}
          <div className="space-y-5 md:col-span-2 lg:col-span-2">
            <Link href="/" aria-label="AnalyzeSERP Home" className="inline-block">
              <Logo size="lg" variant="full" showTagline={true} />
            </Link>

            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              <strong>AnalyzeSERP.com</strong> is a high-speed non-AI competitor SEO auditor and SERP intelligence suite. Built for content writers, SEO specialists, developers, and digital marketing agencies.
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

            {/* Security & Reliability Signals */}
            <div className="space-y-2 pt-1 text-[11px] text-slate-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>100% Client-Side Privacy &amp; Zero Data Lock-In</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Deterministic Engine &amp; Google Search Central Compliant</span>
              </div>
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
                  SERP Snippet Preview
                </Link>
              </li>
              <li>
                <Link
                  href="/readability"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Flesch Readability Score
                </Link>
              </li>
              <li>
                <Link
                  href="/pdf-reports"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium"
                >
                  <span>White-Label Reports</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/featured-snippet-optimizer"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium"
                >
                  <span>Featured Snippet (Pos 0)</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/content-scratchpad"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium"
                >
                  <span>Live SEO Scratchpad</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/affiliate-link-checker"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block py-0.5 font-medium"
                >
                  Affiliate Link Auditor
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
                  Technical SEO Audit
                </Link>
              </li>
              <li>
                <Link
                  href="/site-speed-checker"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium"
                >
                  <span>Site Speed &amp; CWV</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/redirect-checker"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium"
                >
                  <span>301 Redirect Tracer</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contrast-checker"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium"
                >
                  <span>WCAG Color Contrast</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/internal-link-mapper"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium"
                >
                  <span>Internal Link Mapper</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    NEW
                  </span>
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
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold transition-colors inline-flex items-center gap-1.5 py-0.5"
                >
                  <span>Pricing &amp; Plans</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    FREE
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium"
                >
                  <span>Product Changelog</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    v2.4
                  </span>
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
                  className="text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium"
                >
                  <span>SEO Knowledge Base</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                    NEW
                  </span>
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
