'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5" />
            <span>GDPR & CCPA Compliant</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy — <span className="gradient-text">AnalyzeSERP.com</span>
          </h1>

          <p className="text-xs text-slate-500 dark:text-gray-400">
            Last Updated: January 2026 • Official Domain: <strong>https://analyzeserp.com</strong>
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
            <p>
              AnalyzeSERP ("we", "our", or "us") respects your privacy. When you use <strong>analyzeserp.com</strong>, we collect minimal data required to perform live web audits:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-gray-400">
              <li><strong>Audited URLs:</strong> Public web page addresses submitted for competitor SEO analysis.</li>
              <li><strong>Usage Telemetry:</strong> Anonymized daily usage counts (e.g. 2/5 free daily audits used) stored locally in your browser's LocalStorage.</li>
              <li><strong>Technical Log File Data:</strong> Standard server access logs (IP address, user-agent) retained temporarily for rate-limiting and DDoS prevention.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. How We Process URL Data</h2>
            <p>
              URLs submitted to AnalyzeSERP are fetched on-demand using server-side Cheerio parsing. We do not store or sell scraped content. Temporary audit results may be cached in memory for up to 24 hours to prevent redundant server traffic.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. User Consent & Usage Data Processing</h2>
            <p>
              When you visit AnalyzeSERP, a Privacy & Usage Consent Banner is presented. Clicking <strong>"Accept & Continue"</strong> saves your consent preference token (<code>analyzeserp_consent_accepted</code>) in your browser's LocalStorage. This acknowledges your agreement for AnalyzeSERP to collect anonymous usage telemetry, audit frequency logs, target domain performance metrics, and technical signals used strictly to continuously improve tool accuracy, speed, and overall user experience.
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Closing the banner via the X button temporarily dismisses the notice for your current view, re-prompting on future visits until explicit consent is given. You may clear your browser LocalStorage at any time to reset your consent preferences.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Cookies & Local Storage</h2>
            <p>
              AnalyzeSERP uses browser LocalStorage solely to remember your light/dark theme preference, privacy consent status, and free daily audit quota. We do not use intrusive third-party tracking cookies or advertising tracking pixels.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Zero Data Selling Guarantee</h2>
            <p>
              We never sell, rent, or trade your audit data, client details, or agency white-label reports to third-party advertisers or data brokers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Contact Privacy & Support</h2>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              For privacy inquiries, data deletion requests, or general support, contact Founder Sarfraj Yusuf and our team at{' '}
              <a
                href="mailto:support@analyzeserp.com"
                className="text-emerald-600 dark:text-emerald-400 font-bold underline hover:text-emerald-500 transition-colors"
              >
                support@analyzeserp.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
