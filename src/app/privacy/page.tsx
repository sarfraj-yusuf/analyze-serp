'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  FileText,
  Server,
  Database,
  EyeOff,
  Scale,
  Mail,
  ArrowRight,
} from 'lucide-react';

export default function PrivacyPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Legal Hub Navigation Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 w-fit mx-auto text-xs">
          <Link
            href="/privacy"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-sm cursor-default"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
          >
            Terms of Service
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GDPR &amp; CCPA COMPLIANT • ZERO DATA BROKERING</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            Privacy Policy
          </h1>

          <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
            Last Updated: September 2026 • Effective Version 2.5
          </p>
        </div>

        {/* Executive Summary TL;DR Card */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.02] space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <Lock className="w-4 h-4" />
            <span>Executive Privacy Summary (TL;DR)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
            AnalyzeSERP is architected around a strict client-side privacy philosophy. Here are our non-negotiable data commitments:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Transient URL Parsing</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                Audited URLs are parsed in volatile server RAM and discarded immediately. We do not retain competitor query logs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>No Data Brokering</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                We never sell, trade, or monetize your search queries, keyword gaps, or competitor lists to third-party ad networks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Tracking Pixels</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                LocalStorage is used strictly for theme mode and daily audit rate limits. No invasive ad tracking cookies.
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
              { label: '1. Architecture & Scope', href: '#scope' },
              { label: '2. Transient URL Parsing', href: '#url-processing' },
              { label: '3. Data We Collect', href: '#data-collection' },
              { label: '4. Cookies & LocalStorage', href: '#cookies-storage' },
              { label: '5. White-Label PDF Rights', href: '#white-label' },
              { label: '6. Sub-Processors', href: '#subprocessors' },
              { label: '7. GDPR & CCPA Rights', href: '#user-rights' },
              { label: '8. Security Safeguards', href: '#security' },
              { label: '9. Data Retention', href: '#retention' },
              { label: '10. Legal & DPO Contact', href: '#contact' },
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

        {/* Full Legal Policy Content Body */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-10 text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section id="scope" className="space-y-3 scroll-mt-20">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">01.</span>
              <span>Scope &amp; Operating Philosophy</span>
            </h2>
            <p>
              This Privacy Policy explains how <strong>AnalyzeSERP</strong> (&quot;AnalyzeSERP&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated under the leadership of Senior SEO Strategist Sarfraj Yusuf, collects, processes, and protects information when you visit and use <strong>analyzeserp.com</strong> (&quot;Platform&quot; or &quot;Service&quot;).
            </p>
            <p>
              AnalyzeSERP provides high-speed, non-AI technical search diagnostics, multi-URL competitor audits, Core Web Vitals checks, and white-label vector PDF reports. Because search optimization queries often involve confidential commercial strategy, our technical architecture is built to minimize data collection by default.
            </p>
          </section>

          {/* Section 2 */}
          <section id="url-processing" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">02.</span>
              <span>Transient Server-Side URL Processing</span>
            </h2>
            <p>
              When you enter a website address into our audit dock or any single-purpose tool, AnalyzeSERP makes an on-demand, stateless HTTP request to fetch the publicly accessible HTML markup of that webpage using our Node.js Cheerio crawler:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-gray-400">
              <li>
                <strong>No Long-Term Content Storage:</strong> The extracted DOM nodes, title tags, heading hierarchies, word counts, and metadata are processed in volatile server RAM to calculate diagnostic scores and return the JSON response to your browser.
              </li>
              <li>
                <strong>No Scraping Archives:</strong> We do not archive or index scraped webpage content in persistent data warehouses for commercial resale or training generative AI models.
              </li>
              <li>
                <strong>Transient In-Memory Caching:</strong> To protect audited third-party servers from denial-of-service impacts when users refresh pages, lightweight result payloads may be cached in temporary volatile memory for up to 60 minutes before automatic garbage collection.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="data-collection" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">03.</span>
              <span>Data We Collect vs. Data We Never Collect</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Data We Process (Minimal)
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-gray-400">
                  <li>• Publicly submitted webpage URLs for live analysis</li>
                  <li>• Anonymized IP hash used strictly for 120s cooldown limits</li>
                  <li>• User email and name if submitted via our Contact or Auth forms</li>
                  <li>• Browser technical headers (user-agent, screen size) for rendering</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
                  Data We Never Collect
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-gray-400">
                  <li>• Credit card or billing info during Public Beta ($0/mo)</li>
                  <li>• Internal analytics tracking or third-party pixel beacons</li>
                  <li>• Competitor search lists sold to data brokers</li>
                  <li>• Cross-site user tracking or behavioral advertising profiles</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="cookies-storage" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">04.</span>
              <span>Cookies &amp; LocalStorage Architecture</span>
            </h2>
            <p>
              AnalyzeSERP does not use tracking cookies for cross-site behavioral retargeting. We use modern client-side <code>localStorage</code> exclusively for user convenience:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-gray-400 font-mono text-xs">
              <li><code>analyzeserp_theme</code>: Remembers whether you prefer Dark or Light interface mode.</li>
              <li><code>daily_audit_quota</code>: Tracks your client-side daily audit counter locally.</li>
              <li><code>analyzeserp_consent_accepted</code>: Remembers when you dismiss the consent notification banner.</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              You can clear your browser LocalStorage at any time through your browser settings to reset these preferences completely.
            </p>
          </section>

          {/* Section 5 */}
          <section id="white-label" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">05.</span>
              <span>White-Label PDF Client Data Rights</span>
            </h2>
            <p>
              When marketing agencies and SEO consultants use our White-Label PDF Engine (<code>/pdf-reports</code>), you may input custom agency branding, consultant names, client URLs, and confidential advisory notes:
            </p>
            <p>
              <strong>100% Client-Side Assembly:</strong> The vector PDF document is assembled directly within your client browser using <code>jspdf</code>. Custom agency logos, consultant observations, and unbranded templates are not stored on AnalyzeSERP servers. You maintain complete intellectual property rights over all generated reports.
            </p>
          </section>

          {/* Section 6 */}
          <section id="subprocessors" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">06.</span>
              <span>Infrastructure &amp; Sub-Processors</span>
            </h2>
            <p>
              AnalyzeSERP partners strictly with enterprise-grade hosting providers that maintain ISO/IEC 27001, SOC 2 Type II, and GDPR compliance:
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 font-bold uppercase text-[10px] text-slate-500 dark:text-gray-400">
                    <th className="py-2.5 px-4">Sub-Processor</th>
                    <th className="py-2.5 px-4">Purpose</th>
                    <th className="py-2.5 px-4">Data Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">Vercel Inc.</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-gray-400">Edge Network &amp; Serverless Compute</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-gray-400">United States / Global Edge</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">Cloudflare Inc.</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-gray-400">DNS &amp; DDoS Security Filtering</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-gray-400">Global Anycast Network</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7 */}
          <section id="user-rights" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">07.</span>
              <span>GDPR (EU) &amp; CCPA/CPRA (California) Rights</span>
            </h2>
            <p>
              Regardless of your geographic location, AnalyzeSERP extends comprehensive global privacy rights to all visitors:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-gray-400">
              <li><strong>Right of Access:</strong> You may request confirmation of any personal data processed by us.</li>
              <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You may request complete deletion of your account or contact records at any time.</li>
              <li><strong>Right to Opt-Out of Data Sales:</strong> We do not sell personal data. Therefore, we do not require a &quot;Do Not Sell My Info&quot; opt-out link.</li>
              <li><strong>Non-Discrimination:</strong> We will never degrade service quality or deny access based on the exercise of your privacy rights.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="security" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">08.</span>
              <span>Security Safeguards &amp; Responsible Disclosure</span>
            </h2>
            <p>
              We enforce strict transport security (HSTS), TLS 1.3 encryption across all API endpoints, Server-Side Request Forgery (SSRF) validation on user-submitted domains, and automated rate-limiting to prevent malicious misuse.
            </p>
            <p>
              Security researchers who identify potential vulnerabilities are encouraged to report them responsibly to <strong className="text-emerald-600 dark:text-emerald-400">security@analyzeserp.com</strong>.
            </p>
          </section>

          {/* Section 9 */}
          <section id="retention" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">09.</span>
              <span>Data Retention &amp; Deletion Schedule</span>
            </h2>
            <p>
              Standard server connection access logs (containing client IP and user-agent) are retained for a maximum of 14 days for cybersecurity analysis, DDoS mitigation, and firewall telemetry, after which they are permanently purged.
            </p>
          </section>

          {/* Section 10 */}
          <section id="contact" className="space-y-3 scroll-mt-20 border-t border-slate-100 dark:border-white/5 pt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">10.</span>
              <span>Legal &amp; Data Protection Officer Contact</span>
            </h2>
            <p>
              For legal inquiries, GDPR data requests, or privacy clarifications, you may reach our Data Protection team directly:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-1.5 text-xs font-mono">
              <div className="text-slate-800 dark:text-slate-100 font-bold">AnalyzeSERP Legal &amp; Privacy Office</div>
              <div className="text-slate-600 dark:text-gray-400">Attn: Sarfraj Yusuf (Data Protection Lead)</div>
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
