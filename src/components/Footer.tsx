import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, Mail, FileText, Globe, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-slate-200 dark:border-white/10 mt-16 py-12 text-xs text-slate-600 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-0.5 shadow-md shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-900 dark:bg-[#0b0f19] rounded-[9px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Analyze<span className="gradient-text font-black">SERP</span>
              </span>
            </Link>

            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              <strong>AnalyzeSERP.com</strong> is a high-speed non-AI competitor SEO auditor and SERP intelligence suite. Built for content writers, SEO specialists, and agencies.
            </p>
          </div>

          {/* Tools Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">SEO Audit Tools</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Competitor Audit Suite
                </Link>
              </li>
              <li>
                <Link href="/technical-health" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Technical SEO Health Audit
                </Link>
              </li>
              <li>
                <Link href="/readability" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Flesch Readability Analyzer
                </Link>
              </li>
              <li>
                <Link href="/pdf-reports" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5">
                  <span>White-Label PDF Reports</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-emerald-600 dark:text-emerald-400 transition-colors">
                  Pricing & Beta Access (~~$19/mo~~ FREE)
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialized Utilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Specialized Utilities</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/serp-snippet-preview" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  SERP Snippet & Social Preview
                </Link>
              </li>
              <li>
                <Link href="/affiliate-link-checker" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Affiliate & Link Auditor
                </Link>
              </li>
              <li>
                <Link href="/site-speed-checker" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5">
                  <span>Site Speed & Core Web Vitals</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold shadow-sm animate-pulse">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contrast-checker" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5">
                  <span>Color Contrast & WCAG Auditor</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold shadow-sm animate-pulse">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/redirect-checker" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5">
                  <span>301 Redirect Chain Inspector</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold shadow-sm animate-pulse">
                    NEW
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Company & Resources</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/blog" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-emerald-600 dark:text-emerald-400 transition-colors inline-flex items-center gap-1.5">
                  <span>SEO Blog & Knowledge Base</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-extrabold shadow-sm animate-pulse">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  About AnalyzeSERP
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" target="_blank" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  RSS Feed (/rss.xml)
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-200 dark:border-white/10">
                <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-slate-500 dark:text-gray-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-slate-500 dark:text-gray-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-gray-500">
          <div>
            © {new Date().getFullYear()} <strong>AnalyzeSERP.com</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Designed for fast, non-AI SEO performance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
