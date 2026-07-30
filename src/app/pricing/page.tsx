'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { Zap, Check, X, Sparkles, ShieldCheck, HelpCircle, ArrowRight, Layers, Download } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const featuresList = [
    { name: 'Daily Audit Limit', free: '5 URLs / day', pro: '100 URLs / day', agency: 'Unlimited URLs' },
    { name: 'Competitor Multi-URL Batching', free: 'Up to 5 URLs', pro: 'Up to 10 URLs', agency: 'Up to 25 URLs' },
    { name: 'White-Label PDF Client Reports', free: false, pro: true, agency: true },
    { name: 'Custom Agency Logo & Brand Colors', free: false, pro: true, agency: true },
    { name: 'Keyword Gap & Overlap Matrix', free: true, pro: true, agency: true },
    { name: 'Flesch Readability & Tone Engine', free: true, pro: true, agency: true },
    { name: 'Lightweight Technical Speed (TTFB)', free: true, pro: true, agency: true },
    { name: 'Deep Link & Affiliate Inspector', free: true, pro: true, agency: true },
    { name: 'SERP & Social Card Simulator', free: true, pro: true, agency: true },
    { name: 'Export Content Brief (.MD & PDF)', free: 'Watermarked', pro: 'Full Export', agency: 'Full Export' },
    { name: 'Team Seats', free: '1 User', pro: '3 Users', agency: '10 Users' },
    { name: 'Priority Server Crawling Speed', free: false, pro: true, agency: true },
  ];

  const faqs = [
    {
      q: 'Is there a free trial for the Pro plan?',
      a: 'Yes! The Free plan allows 5 daily audits with full access to our non-AI scraper. You can upgrade to Pro ($9/mo) anytime to unlock unlimited white-label PDF reports and higher daily audit limits.',
    },
    {
      q: 'What is White-Label PDF Export?',
      a: 'White-Label PDF Export allows B2B agencies and freelancers to generate multi-page client audit reports customized with your agency name, logo, client domain, and primary brand accent colors.',
    },
    {
      q: 'How does AnalyzeSERP audit websites without AI latency?',
      a: 'AnalyzeSERP uses high-performance serverless Node.js Cheerio DOM parsing. Instead of waiting 30+ seconds for AI models, AnalyzeSERP extracts raw HTML metadata, heading trees, and keyword densities in under 500ms.',
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Absolutely. You can cancel your subscription at any time with 1-click in your account billing dashboard. No contract or hidden fees.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Plans Built for Writers, <br />
            <span className="gradient-text">SEO Pros & B2B Agencies</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Audit competitor search results, extract missing keyword gaps, and generate white-label client PDF reports with zero AI latency.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}>
              Monthly Billing
            </span>

            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-white/10 p-1 transition-colors cursor-pointer border border-slate-300 dark:border-white/20"
            >
              <div
                className={`w-5 h-5 rounded-full bg-emerald-500 transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>

            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}>
              Annual Billing
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Free Starter Tier */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Free Starter</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500 dark:text-gray-400">/ forever free</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                Perfect for casual bloggers and single site owners auditing 1 to 5 pages per day.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-gray-300 pt-4 border-t border-slate-200 dark:border-white/10">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>5 Free Audits per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Competitor Multi-URL Batching</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Keyword Gap & Overlap Matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Flesch Readability Engine</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-gray-500 line-through">
                  <X className="w-4 h-4 shrink-0 text-slate-400 dark:text-gray-600" />
                  <span>White-Label PDF Reports</span>
                </li>
              </ul>
            </div>

            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold text-xs text-center border border-slate-200 dark:border-white/10 transition-all cursor-pointer block"
            >
              Start Free Audits
            </Link>
          </div>

          {/* Pro Tier (Featured Most Popular) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/80 bg-emerald-500/5 flex flex-col justify-between space-y-6 shadow-2xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-md">
              100% FREE IN PUBLIC BETA
            </div>

            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Pro Auditor</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">$0</span>
                <span className="line-through text-sm text-slate-400">$19 / month</span>
                <span className="text-[11px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  FREE Beta Access
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                <strong>AnalyzeSERP Pro (Valued at $19/month) is 100% FREE during Public Beta!</strong> Enjoy 5 audits per batch with a fast 120s cooldown reset.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-gray-300 pt-4 border-t border-slate-200 dark:border-white/10">
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>5 Audits per Batch (120s Cooldown Reset)</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Batch Competitor Multi-URL Audits</span>
                </li>
                <li className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>White-Label PDF Client Reports Included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Custom Agency Logo & Brand Colors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Priority Non-AI Server Crawling</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsProModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all cursor-pointer"
            >
              Upgrade to Pro ($9/mo)
            </button>
          </div>

          {/* Agency Scale Tier */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Agency Unlimited</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  ${billingCycle === 'yearly' ? '23' : '29'}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400">/ month</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                Built for digital agencies needing team seats and high-volume client audit reports.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-gray-300 pt-4 border-t border-slate-200 dark:border-white/10">
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Daily Audits</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Batch Audit Up to 25 URLs</span>
                </li>
                <li className="flex items-center gap-2 font-semibold text-cyan-600 dark:text-cyan-400">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>10 Team Member Seats</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Account Manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Custom API Access</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsProModalOpen(true)}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold text-xs text-center border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
            >
              Contact Agency Sales
            </button>
          </div>
        </div>

        {/* Pro vs Free Feature Comparison Table */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Detailed Feature Comparison Matrix
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080c14] shadow-inner">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4 w-1/3">Feature</th>
                  <th className="py-4 px-4 text-center">Free Tier ($0)</th>
                  <th className="py-4 px-4 text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                    Pro Plan ($9/mo)
                  </th>
                  <th className="py-4 px-4 text-center">Agency ($29/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-gray-200">
                {featuresList.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{f.name}</td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {typeof f.free === 'boolean' ? (
                        f.free ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-400 dark:text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span>{f.free}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold bg-emerald-500/5 text-emerald-700 dark:text-emerald-300">
                      {typeof f.pro === 'boolean' ? (
                        f.pro ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-400 dark:text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span>{f.pro}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      {typeof f.agency === 'boolean' ? (
                        f.agency ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-400 dark:text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span>{f.agency}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">Q:</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
