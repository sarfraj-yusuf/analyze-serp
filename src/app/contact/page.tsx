'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import {
  Mail,
  Send,
  CheckCircle2,
  Globe,
  Building,
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowRight,
  ChevronDown,
  Terminal,
  FileCheck,
  Layers,
  HelpCircle,
  Activity,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const SUPPORT_FAQS: FaqItem[] = [
  {
    q: 'How fast does the AnalyzeSERP engineering team respond to inquiries?',
    a: 'We respond to all technical support tickets, crawler error reports, and agency partnership inquiries within 24 hours (Monday through Friday, 9:00 AM – 6:00 PM IST / UTC +5:30). Urgent crawler infrastructure tickets are prioritized.',
  },
  {
    q: 'What should I do if a competitor URL fails to crawl or times out?',
    a: 'AnalyzeSERP includes automated protocol normalization (testing HTTPS with automatic HTTP fallback) and anti-bot retry loops. If a URL still fails, please submit the URL in the form above. Some websites with extreme Cloudflare challenge interstitials or strict geo-blocks may require custom user-agent rules, which our engineers can adjust.',
  },
  {
    q: 'Can marketing agencies request custom white-label features or report sections?',
    a: 'Yes! We actively collaborate with digital marketing agencies and technical SEO consultants during our Public Beta. If you need custom report sections, specific metrics, or specialized client notes in the White-Label PDF Engine, choose "Agency & White-Label Partnerships" in the form.',
  },
  {
    q: 'Is any confidential client or competitor URL data retained or logged?',
    a: 'Never. AnalyzeSERP operates on a strict client-side privacy philosophy. We do not store competitor query targets in historical databases, nor do we sell competitive intelligence to third parties. Your audit queries remain strictly private.',
  },
];

export default function ContactPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hpWebsite, setHpWebsite] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General & Beta Feedback',
    targetUrl: '',
    message: '',
  });

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        rating: 5,
        category: `[Contact] ${formData.subject}`,
        message: `Name: ${formData.name.trim()}${formData.targetUrl ? `\nTarget URL: ${formData.targetUrl.trim()}` : ''}\n\nMessage:\n${formData.message.trim()}`,
        email: formData.email.trim(),
        user_type: 'Contact Inquiry',
        hp_website: hpWebsite,
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch message. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected network error occurred. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        name: 'AnalyzeSERP Contact & Support Hub',
        description: 'Get in touch with the AnalyzeSERP team for technical support, agency partnerships, or feedback.',
        url: 'https://analyzeserp.com/contact',
        mainEntity: {
          '@type': 'Organization',
          name: 'AnalyzeSERP',
          url: 'https://analyzeserp.com',
          email: 'support@analyzeserp.com',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: SUPPORT_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      {/* Structured JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-20">
        {/* Section 1: Hero & SLA Strip */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Support Operations Active • Sub-24h Response Window</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            Get in Touch with the{' '}
            <span className="text-emerald-600 dark:text-emerald-400">AnalyzeSERP Team</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Have questions regarding our sub-500ms Cheerio crawler, agency white-label PDF reports, or custom integrations? We respond quickly with concrete, actionable answers.
          </p>
        </div>

        {/* Section 2: 2-Column Support Hub Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Inquiry Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Direct Channels
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                Route your inquiry directly to the right engineering team.
              </p>
            </div>

            {/* Channel 1: Technical & Crawler */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2.5 transition-colors hover:border-emerald-500/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    Technical & Crawler Support
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400">
                    Timeouts, DOM parsing & status code discrepancies
                  </div>
                </div>
              </div>
              <a
                href="mailto:support@analyzeserp.com"
                className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline block pt-1"
              >
                support@analyzeserp.com
              </a>
            </div>

            {/* Channel 2: Agency & Enterprise */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2.5 transition-colors hover:border-emerald-500/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    Agency & Enterprise
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400">
                    White-label branding, team seats & custom crawls
                  </div>
                </div>
              </div>
              <a
                href="mailto:agency@analyzeserp.com"
                className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold hover:underline block pt-1"
              >
                agency@analyzeserp.com
              </a>
            </div>

            {/* Channel 3: Security & Privacy */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2.5 transition-colors hover:border-emerald-500/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-500/20 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    Security & Disclosure
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400">
                    Zero-storage policy & responsible vulnerability reports
                  </div>
                </div>
              </div>
              <a
                href="mailto:security@analyzeserp.com"
                className="text-xs font-mono text-slate-700 dark:text-gray-300 font-bold hover:underline block pt-1"
              >
                security@analyzeserp.com
              </a>
            </div>

            {/* Channel 4: Founder & SLA Assurance */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Response SLA: &lt; 24 Hours</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                Directly overseen by <strong>Sarfraj Yusuf</strong> (Senior SEO Strategist & Creator). Mon–Fri, 9:00 AM – 6:00 PM IST (UTC +5:30).
              </p>
            </div>
          </div>

          {/* Right Column: Intelligent Contact Form (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-6">
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Message Dispatched Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    Thank you for contacting AnalyzeSERP. Our engineering team will review your inquiry and reply to <strong className="text-emerald-600 dark:text-emerald-400">{formData.email}</strong> within 24 hours.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        subject: 'General & Beta Feedback',
                        targetUrl: '',
                        message: '',
                      });
                      setErrorMsg(null);
                      setHpWebsite('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                    Send Direct Message
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Fill out the form below and we'll get back to you promptly.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Hidden Honeypot anti-spam field */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="contact_hp_website">Leave this field blank</label>
                  <input
                    id="contact_hp_website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={hpWebsite}
                    onChange={(e) => setHpWebsite(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                      Your Name <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Rivera"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                      Work Email <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. alex@agency.com"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                      Inquiry Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="General & Beta Feedback">General Product & Beta Feedback</option>
                      <option value="Technical & Crawler Support">Technical & Crawler Error Report</option>
                      <option value="Agency White-Label & PDF">Agency White-Label & PDF Reports</option>
                      <option value="Enterprise High-Volume & API">Enterprise API & Batch Limits</option>
                      <option value="Security & Responsible Disclosure">Security & Vulnerability Disclosure</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                      Target Website URL <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      placeholder="e.g. https://example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                    Your Message <span className="text-emerald-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your query, crawler discrepancy, or agency partnership requirement..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message to Support Team</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Section 3: Self-Service Resource Bento */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
              Instant Self-Service Discovery
            </h3>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Find immediate answers and documentation without waiting for a reply.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/pdf-reports"
              className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-all group cursor-pointer space-y-2.5 block"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>White-Label PDFs</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed mt-1">
                  Generate unbranded client reports with your custom agency name and consultant notes.
                </p>
              </div>
            </Link>

            <Link
              href="/changelog"
              className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-all group cursor-pointer space-y-2.5 block"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span>Product Changelog</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed mt-1">
                  View weekly engine releases, Cheerio DOM upgrades, and newly deployed tools.
                </p>
              </div>
            </Link>

            <Link
              href="/about"
              className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-all group cursor-pointer space-y-2.5 block"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center justify-between">
                  <span>Why AnalyzeSERP</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed mt-1">
                  Read why sub-500ms deterministic extraction eliminates generative AI hallucinations.
                </p>
              </div>
            </Link>

            <Link
              href="/pricing"
              className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-all group cursor-pointer space-y-2.5 block"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Public Beta Free ($0)</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed mt-1">
                  100% free beta access, early adopter 50% lifetime grandfathered discount details.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Section 4: Support FAQ Accordion */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              <span>Frequently Asked Support Questions</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              Quick answers to common questions regarding our crawler and support SLAs.
            </p>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
            {SUPPORT_FAQS.map((faq, index) => {
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

        {/* Section 5: Enterprise Partnership Banner */}
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200/80 dark:border-white/10 text-center space-y-5 bg-gradient-to-b from-transparent to-emerald-500/[0.03]">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Scaling SEO Audits for Your Entire Agency?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
              We provide dedicated IP clusters, high-concurrency batch crawl pipelines, and custom white-label reports for marketing agencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="mailto:agency@analyzeserp.com"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Email Agency Partnerships</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-semibold text-xs transition-all cursor-pointer"
            >
              <span>Run Free Competitor Audit</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
