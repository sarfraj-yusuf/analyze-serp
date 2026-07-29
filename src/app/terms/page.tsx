'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Terms of Service — <span className="gradient-text">AnalyzeSERP.com</span>
          </h1>

          <p className="text-xs text-slate-500 dark:text-gray-400">
            Effective Date: January 2026 • Official Domain: <strong>https://analyzeserp.com</strong>
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong>AnalyzeSERP.com</strong> ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Acceptable Use & Fair Usage Limits</h2>
            <p>
              AnalyzeSERP provides automated competitor audit tools. Free tier accounts are limited to 5 URL audits per 24-hour window. You agree not to attempt to bypass rate limits, launch denial-of-service attacks, or abuse server-side scraping endpoints.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Pro Plan Subscriptions & Billing</h2>
            <p>
              Pro subscriptions ($9/mo or $29/mo) unlock batch audits up to 10 URLs simultaneously and unlimited white-label PDF client report exports. Subscriptions auto-renew monthly and may be cancelled at any time in your account portal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Disclaimer of Search Engine Warranties</h2>
            <p>
              AnalyzeSERP provides algorithmic metrics (Flesch readability, TTFB latency, keyword density) for guidance only. Search engine rankings are controlled exclusively by Google, Bing, and third-party algorithms. AnalyzeSERP does not guarantee specific organic ranking positions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Governing Law</h2>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              These terms shall be governed by international SaaS guidelines and the laws of the jurisdiction operating AnalyzeSERP.com. For legal inquiries, contact <strong className="text-emerald-600 dark:text-emerald-400">legal@analyzeserp.com</strong>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
