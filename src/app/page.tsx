'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SingleAuditCard } from '@/components/SingleAuditCard';
import { ComparisonMatrix } from '@/components/ComparisonMatrix';
import { KeywordGapMatrix } from '@/components/KeywordGapMatrix';
import { ContentBriefGenerator } from '@/components/ContentBriefGenerator';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { BatchAuditResponse, SinglePageAudit, KeywordGapAnalysis } from '@/types/seo';
import { analyzeKeywordGaps } from '@/lib/keyword-gap';
import { Search, Plus, Trash2, Zap, AlertCircle, Sparkles, Layers, ShieldCheck, ArrowRight, Clock, X } from 'lucide-react';

import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

const MAX_FREE_DAILY_AUDITS = 20;

import { AuditSkeleton } from '@/components/AuditSkeleton';
import { SEOContentSection } from '@/components/SEOContentSection';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';

export default function Home() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResponse, setAuditResponse] = useState<BatchAuditResponse | null>(null);
  const [keywordGapAnalysis, setKeywordGapAnalysis] = useState<KeywordGapAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dailyAuditCount, setDailyAuditCount] = useState<number>(0);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [isCooldownActive, setIsCooldownActive] = useState<boolean>(false);
  const [isQuotaBarDismissed, setIsQuotaBarDismissed] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldownActive && cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            setIsCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCooldownActive, cooldownSeconds]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedQuota = localStorage.getItem('daily_audit_quota');
    if (savedQuota) {
      try {
        const parsed = JSON.parse(savedQuota);
        if (parsed.date === today) {
          setDailyAuditCount(parsed.count || 0);
        }
      } catch (e) {}
    }

    if (localStorage.getItem('quota_bar_dismissed') === 'true') {
      setIsQuotaBarDismissed(true);
    }
  }, []);

  const incrementDailyQuota = (count: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newCount = dailyAuditCount + count;
    setDailyAuditCount(newCount);
    localStorage.setItem('daily_audit_quota', JSON.stringify({ date: today, count: newCount }));
  };

  const addUrlInput = () => {
    if (urls.length >= 5) {
      setErrorMsg('Free mode allows up to 5 URLs. Upgrade to Pro for unlimited batch auditing.');
      return;
    }
    setUrls([...urls, '']);
  };

  const removeUrlInput = (index: number) => {
    if (urls.length === 1) return;
    const updated = urls.filter((_, i) => i !== index);
    setUrls(updated);
  };

  const handleUrlChange = (index: number, val: string) => {
    const updated = [...urls];
    updated[index] = val;
    setUrls(updated);
  };

  const [showSampleArrow, setShowSampleArrow] = useState(false);

  const handleTrySample = () => {
    setUrls(['https://analyzeserp.com', 'https://vercel.com']);
    setShowSampleArrow(true);
    setErrorMsg(null);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSampleArrow(false);
    setErrorMsg(null);

    if (isCooldownActive && cooldownSeconds > 0) {
      setErrorMsg(`Quota limit reached. Please wait ${cooldownSeconds}s before your next 5 free audits unlock.`);
      return;
    }

    const validUrls = urls.map((u) => u.trim()).filter(Boolean);
    if (validUrls.length === 0) {
      setErrorMsg('Please enter at least 1 valid URL to run the audit.');
      return;
    }

    if (dailyAuditCount + validUrls.length > MAX_FREE_DAILY_AUDITS) {
      setIsProModalOpen(true);
      return;
    }

    setIsAuditing(true);
    setAuditResponse(null);
    setKeywordGapAnalysis(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls }),
      });

      if (!res.ok) {
        const errData = await res.json();
        if (errData.isQuotaExceeded || res.status === 403) {
          const seconds = errData.cooldownSeconds || 120;
          setCooldownSeconds(seconds);
          setIsCooldownActive(true);
        }
        throw new Error(errData.error || 'Server error running competitor audit.');
      }

      const data: BatchAuditResponse = await res.json();
      setAuditResponse(data);

      const successfulAudits = data.results.filter((r) => r.status === 'success');
      if (successfulAudits.length >= 2) {
        const gapAnalysis = analyzeKeywordGaps(successfulAudits);
        setKeywordGapAnalysis(gapAnalysis);
      }

      incrementDailyQuota(validUrls.length);
      triggerToolExecutionFeedback();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while fetching audit data.');
    } finally {
      setIsAuditing(false);
    }
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AnalyzeSERP',
    url: 'https://analyzeserp.com',
    applicationCategory: 'SEOApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires HTML5 and JavaScript',
    description:
      'Fast non-AI competitor SERP & on-page SEO audit suite. Analyze title tags, meta descriptions, Flesch readability grades, TTFB latency, keyword gaps, and export white-label client PDF reports.',
    author: {
      '@type': 'Person',
      name: 'Sarfraj Yusuf',
      jobTitle: 'Founder & Senior SEO Strategist',
      url: 'https://analyzeserp.com/about',
    },
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'AnalyzeSERP',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      {/* WebApplication / SoftwareApplication JSON-LD Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* Daily Quota Freemium Bar */}
      {!isQuotaBarDismissed && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border-b border-emerald-500/20 py-2.5 px-4 text-center text-xs font-semibold text-slate-800 dark:text-gray-200 relative animate-in fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap pr-8 sm:pr-0">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>⚡ <strong>Public Beta Active:</strong> Enjoy 100% free competitor SEO audits & multi-URL benchmarking!</span>
            </span>
            <span className="text-slate-400 dark:text-gray-500 hidden sm:inline">•</span>
            <button
              onClick={() => setIsProModalOpen(true)}
              className="text-emerald-700 dark:text-emerald-300 underline font-bold hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors cursor-pointer"
            >
              White-label PDF exports & competitor keyword gap extraction unlocked (~~$19/mo~~ FREE)
            </button>
          </div>

          {/* Close X Dismiss Button */}
          <button
            onClick={() => {
              setIsQuotaBarDismissed(true);
              localStorage.setItem('quota_bar_dismissed', 'true');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10"
            aria-label="Dismiss notification bar"
            title="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* AnalyzeSERP Brand Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AnalyzeSERP — Free On-Page SEO Audit Tool</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Free Competitor <br />
            <span className="gradient-text">SEO Analysis Tool</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Compare up to 5 competitor pages and see what their content is doing better. Analyze title tags, meta descriptions, headings, keyword usage, readability, page speed signals, internal links, images, and technical SEO issues — then turn the results into a content brief or PDF report.
          </p>
        </div>

        {/* Cooldown Timer Card if 5/5 audits used */}
        {isCooldownActive && cooldownSeconds > 0 && (
          <div className="glass-panel p-6 rounded-3xl border-2 border-amber-500/60 bg-amber-500/10 space-y-3 text-center animate-in fade-in max-w-3xl mx-auto shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Quota Cooldown Active: 5/5 Audits Used</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Next 5 Free Audits Unlock In:{' '}
              <span className="font-mono text-3xl text-amber-500 underline ml-2">
                {cooldownSeconds}s
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
              <strong>AnalyzeSERP Pro (Valued at $19/month) is 100% FREE during Public Beta!</strong> While your 120-second timer counts down, please leave a quick review or suggestion below.
            </p>
          </div>
        )}

        {/* Audit Input Form Box */}
        <div className="max-w-[830px] mx-auto w-full">
          <div className="glass-panel p-7 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-6">
          <form onSubmit={handleAuditSubmit} className="space-y-4">
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-2">
                  <span>Enter Up to 5 Competitor Page URLs</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400 font-normal">
                    ({urls.length} / 5 URLs)
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleTrySample}
                  className="px-3.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm w-fit"
                  title="Auto-fill sample competitor URLs to see how it works"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>✨ Try Live Sample Comparison</span>
                </button>
              </div>

              {urls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="relative flex-1">
                    <span
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                        idx === 0
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                      }`}
                    >
                      {idx === 0 ? 'YOUR PAGE' : `COMP #${idx}`}
                    </span>
                    <input
                      type="text"
                      placeholder={
                        idx === 0
                          ? 'URL #1: Your Target Page (e.g. https://yourdomain.com/my-article)'
                          : `Competitor #${idx} Page URL (e.g. https://competitor.com/ranking-page)`
                      }
                      value={url}
                      onChange={(e) => handleUrlChange(idx, e.target.value)}
                      className="w-full pl-28 pr-4 py-3.5 sm:py-4 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all shadow-sm"
                    />
                  </div>

                  {urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUrlInput(idx)}
                      className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
                      title="Remove URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 relative">
              <button
                type="button"
                onClick={addUrlInput}
                disabled={urls.length >= 5}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Competitor Page</span>
              </button>

              <div className="w-full sm:w-auto flex flex-col items-center sm:items-end relative">
                {/* Animated Bouncing Pointer Arrow Prompt */}
                {showSampleArrow && (
                  <div className="absolute -top-11 right-0 sm:right-2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-[11px] font-black shadow-xl shadow-emerald-500/30 animate-bounce whitespace-nowrap border border-emerald-400">
                    <span>👇 Click here to launch live sample analysis!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuditing}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {isAuditing ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin" />
                      <span>Running On-Page SEO Audit...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Analyze Competitor SEO</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        </div>

        {/* Audit Results Dashboard */}
        {isAuditing ? (
          <AuditSkeleton />
        ) : auditResponse ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Side-by-Side Comparison Matrix */}
            <ComparisonMatrix results={auditResponse.results} />

            {/* Keyword Gap Matrix */}
            {auditResponse.results.filter((r) => r.status === 'success').length >= 2 && (
              <KeywordGapMatrix results={auditResponse.results.filter((r) => r.status === 'success')} />
            )}

            {/* Content Brief Generator Export */}
            {auditResponse.results.filter((r) => r.status === 'success').length > 0 && (
              <ContentBriefGenerator results={auditResponse.results.filter((r) => r.status === 'success')} />
            )}

            {/* Detailed Single Page Audit Cards */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Detailed Page Audit Inspector ({auditResponse.results.length})
              </h3>

              {auditResponse.results.map((audit, idx) => (
                <SingleAuditCard key={idx} audit={audit} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-16 pt-6">
            {/* Feature Highlights Grid */}
            <div className="space-y-8 max-w-6xl mx-auto">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Powerful On-Page SEO Features</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Everything You Need to Outrank Your Competitors
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                  Analyze competitor pages, discover keyword opportunities, and turn data into actionable SEO briefs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Fast SEO Page Analysis</h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400">
                    Get quick, reliable SEO data from real page HTML — no waiting for AI-generated guesses.
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Keyword Gap Analysis</h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400">
                    Find important words and phrases competitors use, then spot missing keyword opportunities in your own content.
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Technical SEO Checker</h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400">
                    Review page speed signals, HTML size, HTTPS, mobile viewport tags, DOM depth, scripts, and other technical SEO issues.
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">SEO Reports and Content Briefs</h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400">
                    Export easy-to-read SEO reports and content briefs for your team, clients, or agency workflow.
                  </p>
                </div>
              </div>
            </div>

            <SEOContentSection
              toolName="Competitor SEO Audit Suite"
              title="Why Use a Competitor SEO Analysis Tool?"
              description="The pages ranking above you often reveal what Google expects for a topic. Analyze their titles, headings, keyword usage, readability, links, images, and technical SEO signals to find practical ways to improve your own page."
              steps={[
                {
                  title: 'Enter Your Competitor Pages',
                  description:
                    'Paste up to 5 URLs from competing pages, blog posts, landing pages, or Google search results.',
                },
                {
                  title: 'Analyze On-Page SEO Signals',
                  description:
                    'Analyze title tags, meta descriptions, headings, word count, keyword usage, readability, links, images, and page speed signals.',
                },
                {
                  title: 'Find SEO Gaps and Build Better Content',
                  description:
                    'Compare competitor pages side by side, find missing keywords and content opportunities, then export a content brief or SEO report.',
                },
              ]}
              importanceTitle="How Competitor Analysis Helps Your Rankings"
              importanceContent={`A competitor SEO analysis tool helps you understand how top-ranking pages are structured. Instead of guessing what to add to your content, you can compare real pages side by side and identify missing keywords, weak headings, thin sections, technical issues, and content gaps.

AnalyzeSERP gives you a fast way to review multiple competitor URLs at once. You can inspect title tags, meta descriptions, heading structure, word count, keyword density, readability, image alt text, internal and external links, and technical health signals from one dashboard.`}
              faqs={[
                {
                  question: 'What is a competitor SEO analysis tool?',
                  answer:
                    'A competitor SEO analysis tool compares your page with competing pages to show differences in keywords, headings, metadata, readability, links, images, and technical SEO signals.',
                },
                {
                  question: 'How does AnalyzeSERP help improve SEO?',
                  answer:
                    'AnalyzeSERP helps you see what top-ranking pages include, what your page may be missing, and which on-page SEO updates could improve your content.',
                },
                {
                  question: 'Can I compare multiple competitor URLs?',
                  answer:
                    'Yes. You can enter up to 5 URLs and compare their on-page SEO metrics side by side.',
                },
                {
                  question: 'What does the keyword gap report show?',
                  answer:
                    'The keyword gap report shows important words and phrases used by competitors, including terms that may be missing from your own content.',
                },
                {
                  question: 'Is AnalyzeSERP free?',
                  answer:
                    'Yes. AnalyzeSERP currently allows free competitor SEO audits with usage limits.',
                },
                {
                  question: 'Do I need an account?',
                  answer:
                    'No account is required to run free competitor SEO audits. You can paste URLs and get instant audit results immediately.',
                },
              ]}
            />
          </div>
        )}
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
      <CookieConsentBanner />
    </div>
  );
}
