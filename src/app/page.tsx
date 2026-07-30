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
import { Search, Plus, Trash2, Zap, AlertCircle, Sparkles, Layers, ShieldCheck, ArrowRight, Clock } from 'lucide-react';

const MAX_FREE_DAILY_AUDITS = 5;

import { AuditSkeleton } from '@/components/AuditSkeleton';
import { SEOContentSection } from '@/components/SEOContentSection';

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

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while fetching audit data.');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      {/* Daily Quota Freemium Bar */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border-b border-emerald-500/20 py-2.5 px-4 text-center text-xs font-semibold text-slate-800 dark:text-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Free Daily Audits: <strong className="text-slate-900 dark:text-white font-mono">{dailyAuditCount} / {MAX_FREE_DAILY_AUDITS}</strong> used today</span>
          </span>
          <span className="text-slate-400 dark:text-gray-500 hidden sm:inline">•</span>
          <button
            onClick={() => setIsProModalOpen(true)}
            className="text-emerald-700 dark:text-emerald-300 underline font-bold hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors cursor-pointer"
          >
            Need batch audits up to 10 URLs & unlimited PDF exports? Upgrade to Pro ($9/mo)
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* AnalyzeSERP Brand Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AnalyzeSERP.com — Non-AI Fast Auditor</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Audit Competitor SERPs & <br />
            <span className="gradient-text">Outrank Top Search Results</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Enter up to 5 competitor URLs to instantly analyze title tags, meta descriptions, Flesch readability grades, TTFB latency, keyword gaps, and export white-label client PDF reports.
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
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-6">
          <form onSubmit={handleAuditSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center justify-between">
                <span>Enter Competitor Page URLs (1 to 5 URLs)</span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400 font-normal">
                  {urls.length} / 5 URLs Added
                </span>
              </label>

              {urls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 dark:text-gray-500 font-bold">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={
                        idx === 0
                          ? 'https://ahrefs.com/blog/on-page-seo/'
                          : `Competitor #${idx + 1} URL (e.g. https://moz.com/beginners-guide-to-seo)`
                      }
                      value={url}
                      onChange={(e) => handleUrlChange(idx, e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs focus:outline-none font-mono"
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={addUrlInput}
                disabled={urls.length >= 5}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Competitor URL</span>
              </button>

              <button
                type="submit"
                disabled={isAuditing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
              >
                {isAuditing ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>Scraping DOM & Analyzing SERP...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Competitor Audit</span>
                  </>
                )}
              </button>
            </div>
          </form>
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
            {/* 3-Step How It Works Section */}
            <div className="space-y-8 max-w-5xl mx-auto text-center">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Simple 3-Step Workflow
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  How Analyze<span className="gradient-text">SERP</span> Works
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-lg mx-auto">
                  Audit and outrank competitors in 3 simple steps without complex setups or waiting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Step 1 */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-lg">
                    1
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Paste Competitor URLs</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                    Input 1 to 5 competitor web page URLs from Google search results into the auditor tool bar above.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-mono font-bold text-lg">
                    2
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Extract & Analyze DOM Data</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                    Our high-speed engine parses raw HTML, title tags, heading trees, word counts, N-grams, and TTFB latency instantly.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-lg">
                    3
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Get Gaps & Client Reports</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                    Review side-by-side keyword gaps, generate content outlines, and export white-label PDF reports for your clients.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Non-AI Speed Engine</h4>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  Zero AI latency or hallucination. Pure deterministic HTML parsing & DOM metric computation.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Keyword Gap Matrix</h4>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  Find high-density 1-gram, 2-gram, and 3-gram terms competitors use that your content lacks.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Technical Health Check</h4>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  Diagnose TTFB latency, payload weight, DOM depth levels, SSL security, and viewport rules.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">White-Label PDFs</h4>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  Export branded executive client reports with custom agency colors, scorecards, and action plans.
                </p>
              </div>
            </div>

            <SEOContentSection
              toolName="Competitor SEO Audit Suite"
              title="Dominate Search Engine Result Pages (SERP) with Data-Driven SEO Intelligence"
              description="Analyze competitor content strategy, uncover hidden keyword gaps, and optimize your on-page SEO signals without expensive monthly subscriptions."
              steps={[
                {
                  title: 'Paste Up to 5 Competitor URLs',
                  description: 'Input your page URL along with top-ranking competitor URLs in your niche.',
                },
                {
                  title: 'Extract On-Page & Technical Metrics',
                  description: 'Our non-AI parsing engine extracts titles, meta tags, heading trees, word counts, N-grams, and TTFB latency.',
                },
                {
                  title: 'Identify Keyword Gaps & Outperform Competitors',
                  description: 'Discover missing 1-gram, 2-gram, and 3-gram search terms and export white-label PDF reports.',
                },
              ]}
              importanceTitle="Why On-Page SEO & Competitor Analysis Matter"
              importanceContent={`On-page SEO remains the foundation of organic search visibility. While off-page backlinks build domain authority, on-page optimization tells Google exactly what your content is about and which search intent it fulfills.

Key Advantages of Competitor Gap Analysis:
1. Eliminates Content Guesswork: Identify exact keyword densities used by Page 1 Google results.
2. Structure Optimization: Model your heading hierarchy (H1, H2, H3) based on top-performing search competitors.
3. Rapid Execution: Make data-backed content updates in minutes instead of waiting months for trial-and-error tests.`}
              faqs={[
                {
                  question: 'What is a Competitor SEO Audit Tool?',
                  answer: 'A Competitor SEO Audit Tool analyzes the on-page HTML, title tags, heading structures, keyword densities, and technical performance of top-ranking search engine results to identify optimization opportunities for your own content.',
                },
                {
                  question: 'How does AnalyzeSERP differ from AI SEO tools?',
                  answer: 'AnalyzeSERP uses pure, deterministic DOM parsing and non-AI statistical algorithms. This guarantees 100% accurate, hallucination-free data extraction at ultra-fast speeds.',
                },
                {
                  question: 'What is a Keyword Gap Analysis?',
                  answer: 'A Keyword Gap Analysis compares your content against top-ranking competitors to discover essential single-word and multi-word phrases that appear in competitor articles but are missing from your page.',
                },
                {
                  question: 'Is AnalyzeSERP free to use?',
                  answer: 'Yes! AnalyzeSERP allows up to 5 free comprehensive competitor audits per day with no registration required.',
                },
              ]}
            />
          </div>
        )}
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
