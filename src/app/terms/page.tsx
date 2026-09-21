'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Scale,
  Building,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function TermsPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Legal Hub Navigation Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 w-fit mx-auto text-xs">
          <Link
            href="/privacy"
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-sm cursor-default"
          >
            Terms of Service
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>ENTERPRISE SERVICE AGREEMENT • VERSION 2.4</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            Terms of Service
          </h1>

          <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
            Effective Date: September 2026 • Platform Release v2.4
          </p>
        </div>

        {/* Executive Summary TL;DR Card */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.02] space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <Scale className="w-4 h-4" />
            <span>Terms Summary at a Glance (TL;DR)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
            Please read these terms before using AnalyzeSERP. Here is an overview of our key service terms:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Free Public Beta</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                All 8 diagnostic tools, multi-URL batching, and vector PDF exports are free. No credit card required and no surprise recurring charges.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Commercial Report Rights</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                Agencies and consultants hold 100% commercial ownership to sell, deliver, or present unbranded white-label PDFs to paying clients.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ranking Disclaimer</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                Metrics are empirical engineering benchmarks. Search engine rankings are controlled independently by Google and Bing algorithms.
              </p>
            </div>
          </div>
        </div>

        {/* Quick-Jump Section Anchor Pills */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-gray-400 font-semibold">
            Quick Navigation:
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { label: '1. Acceptance of Terms', href: '#acceptance' },
              { label: '2. Public Beta & Pricing', href: '#beta-billing' },
              { label: '3. Acceptable Crawler Use', href: '#acceptable-use' },
              { label: '4. White-Label Report Rights', href: '#white-label-rights' },
              { label: '5. Intellectual Property', href: '#intellectual-property' },
              { label: '6. Search Warranties Disclaimer', href: '#search-warranties' },
              { label: '7. Limitation of Liability', href: '#liability' },
              { label: '8. Service Availability & SLA', href: '#service-sla' },
              { label: '9. Fair Usage & Termination', href: '#termination' },
              { label: '10. Governing Law', href: '#governing-law' },
            ].map((anchor) => (
              <a
                key={anchor.href}
                href={anchor.href}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/10 border border-slate-200/70 dark:border-white/[0.06] text-slate-700 dark:text-gray-300 font-medium transition-colors"
              >
                {anchor.label}
              </a>
            ))}
          </div>
        </div>

        {/* Full Terms Content Body */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-10 text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section id="acceptance" className="space-y-3 scroll-mt-20">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">01.</span>
              <span>Acceptance of Terms &amp; Scope of Service</span>
            </h2>
            <p>
              By accessing, browsing, or running audits on <strong>analyzeserp.com</strong> (&quot;Platform&quot;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy. If you are entering into these Terms on behalf of a digital agency or corporate entity, you represent that you possess the authority to bind that entity.
            </p>
            <p>
              AnalyzeSERP provides webmasters, technical SEO professionals, and content directors with high-speed, non-AI technical audit tooling, multi-URL competitor comparisons, Core Web Vitals checks, and white-label vector PDF reporting.
            </p>
          </section>

          {/* Section 2 */}
          <section id="beta-billing" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">02.</span>
              <span>Public Beta Access &amp; Future Subscription Tiers</span>
            </h2>
            <p>
              AnalyzeSERP is currently operating in a <strong>100% Free Public Beta</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-gray-400">
              <li>
                <strong>No Credit Card Required:</strong> Access to all 8 diagnostic engines, competitor multi-URL batching (up to 5 URLs), and unbranded White-Label PDF exports is available at $0/month.
              </li>
              <li>
                <strong>Early Adopter Grandfathering Guarantee:</strong> Users who create accounts and test our tooling during the Public Beta lock in an exclusive, permanent <strong>50% lifetime discount</strong> on all future paid subscription plans (regularly $19/mo Pro and $49/mo Agency).
              </li>
              <li>
                <strong>No Automatic Surprise Charges:</strong> You will never be billed automatically when the Public Beta concludes. Any future transition to paid tiers will require explicit opt-in confirmation from the user.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="acceptable-use" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">03.</span>
              <span>Acceptable Crawler Use &amp; Server Etiquette</span>
            </h2>
            <p>
              AnalyzeSERP utilizes server-side Node.js Cheerio crawlers to inspect publicly accessible HTML markup. You agree to adhere to the following acceptable use policies:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-gray-400">
              <li>
                <strong>Public URLs Only:</strong> You may only submit URLs that are accessible to the public internet. You must not attempt to audit internal intranets, private IP ranges (RFC 1918), localhost addresses, or services behind authentication firewalls.
              </li>
              <li>
                <strong>No API Abuse or DDoS:</strong> You agree not to reverse-engineer private endpoints, deploy automated botnets against our audit routes, or attempt to overwhelm third-party audited servers with concurrent requests.
              </li>
              <li>
                <strong>Cooldown Observance:</strong> Users must respect our client-side 120-second cooldown resets and daily batch rate limits.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="white-label-rights" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">04.</span>
              <span>White-Label PDF Reports &amp; Commercial Ownership</span>
            </h2>
            <p>
              AnalyzeSERP grants you an unrestricted, worldwide, royalty-free commercial license to generate, modify, brand, and distribute audit deliverables produced via our White-Label PDF Engine (<code>/pdf-reports</code>):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-gray-400">
              <li>Agencies and freelancers may sell exported PDF audits directly to clients as part of consulting retainers.</li>
              <li>AnalyzeSERP claims zero copyright, ownership, or licensing fees over client recommendations, custom logos, or branding uploaded to the report generator.</li>
              <li>You are solely responsible for the accuracy of any consultant commentary or strategic advice appended to client-facing PDFs.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="intellectual-property" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">05.</span>
              <span>AnalyzeSERP Intellectual Property</span>
            </h2>
            <p>
              The AnalyzeSERP name, brand marks, logo, proprietary DOM scraping algorithms, N-gram extraction models, design systems, and frontend source code are the exclusive intellectual property of AnalyzeSERP and Sarfraj Yusuf. You may not mirror, clone, or resell the underlying software infrastructure without prior written authorization.
            </p>
          </section>

          {/* Section 6 */}
          <section id="search-warranties" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">06.</span>
              <span>Search Engine Rankings &amp; Warranty Disclaimer</span>
            </h2>
            <p>
              <strong>No Guarantee of Search Placement:</strong> Search engine ranking algorithms (including Googlebot, Bingbot, and AI Overviews) utilize hundreds of dynamic, proprietary ranking signals that update continuously without notice.
            </p>
            <p>
              AnalyzeSERP provides deterministic engineering telemetry (e.g. Flesch Reading Ease scores, Core Web Vitals milliseconds, 600px pixel caps, and keyword density percentages) for diagnostic guidance only. <strong>AnalyzeSERP does not guarantee that implementing suggested fixes will result in specific organic ranking improvements, traffic increases, or revenue gains.</strong>
            </p>
          </section>

          {/* Section 7 */}
          <section id="liability" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">07.</span>
              <span>Limitation of Liability &amp; Indemnification</span>
            </h2>
            <p>
              To the maximum extent permitted by applicable law, AnalyzeSERP, its founder, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use of, or inability to use, our service, including lost client retainers, search ranking drops, or crawler timeouts.
            </p>
            <p>
              In all circumstances, AnalyzeSERP&apos;s cumulative aggregate liability shall be limited to the total amount paid by you to AnalyzeSERP in the three (3) months preceding the claim, or $50.00 USD, whichever is lower.
            </p>
          </section>

          {/* Section 8 */}
          <section id="service-sla" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">08.</span>
              <span>Platform Availability &amp; Scheduled Maintenance</span>
            </h2>
            <p>
              We strive to maintain 99.9% platform availability across our global edge network. However, services may occasionally experience transient interruptions for maintenance, engine upgrades, or upstream network provider degradation.
            </p>
          </section>

          {/* Section 9 */}
          <section id="termination" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">09.</span>
              <span>Fair Usage &amp; Service Termination</span>
            </h2>
            <p>
              We reserve the right to suspend or block IP addresses that engage in abusive scraping patterns, security probing, or systematic circumvention of rate limits. Users may discontinue use of the platform at any time.
            </p>
          </section>

          {/* Section 10 */}
          <section id="governing-law" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">10.</span>
              <span>Governing Law &amp; Legal Notices</span>
            </h2>
            <p>
              These Terms shall be governed by international SaaS guidelines and the applicable laws of the jurisdiction operating AnalyzeSERP. For legal notices, contract questions, or agency licensing inquiries, please reach our legal office:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-1.5 text-xs font-mono">
              <div className="text-slate-800 dark:text-slate-100 font-bold">AnalyzeSERP Legal Operations</div>
              <div className="text-slate-600 dark:text-gray-400">Attn: Legal Counsel &amp; Operations</div>
              <div>
                Email:{' '}
                <a
                  href="mailto:legal@analyzeserp.com"
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  legal@analyzeserp.com
                </a>
              </div>
              <div>Official Portal: https://analyzeserp.com</div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
