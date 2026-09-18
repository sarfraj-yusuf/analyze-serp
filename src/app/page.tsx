'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BatchAuditResponse, SinglePageAudit, KeywordGapAnalysis } from '@/types/seo';
import { analyzeKeywordGaps } from '@/lib/keyword-gap';
import { Search, Plus, Trash2, Zap, AlertCircle, Sparkles, Layers, ShieldCheck, ArrowRight, Clock, X, ChevronDown, ChevronUp, Key } from 'lucide-react';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';
import { AuditSkeleton } from '@/components/AuditSkeleton';
import { KeywordGapSkeleton, ContentBriefSkeleton, ComparisonMatrixSkeleton } from '@/components/SkeletonComponents';
import { SEOContentSection } from '@/components/SEOContentSection';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';

// Lazy-loaded heavy result & modal components (reduces initial JS payload by ~209 KiB)
const SerpDecisionCenter = dynamic(
  () => import('@/components/SerpDecisionCenter').then((mod) => mod.SerpDecisionCenter),
  {
    loading: () => <AuditSkeleton />,
    ssr: false,
  }
);

const KeywordGapMatrix = dynamic(
  () => import('@/components/KeywordGapMatrix').then((mod) => mod.KeywordGapMatrix),
  {
    loading: () => <KeywordGapSkeleton />,
    ssr: false,
  }
);

const ContentBriefGenerator = dynamic(
  () => import('@/components/ContentBriefGenerator').then((mod) => mod.ContentBriefGenerator),
  {
    loading: () => <ContentBriefSkeleton />,
    ssr: false,
  }
);

const ComparisonMatrix = dynamic(
  () => import('@/components/ComparisonMatrix').then((mod) => mod.ComparisonMatrix),
  {
    loading: () => <ComparisonMatrixSkeleton />,
    ssr: false,
  }
);

const SingleAuditCard = dynamic(
  () => import('@/components/SingleAuditCard').then((mod) => mod.SingleAuditCard),
  {
    loading: () => <AuditSkeleton />,
    ssr: false,
  }
);

const ProUpgradeModal = dynamic(
  () => import('@/components/ProUpgradeModal').then((mod) => mod.ProUpgradeModal),
  {
    ssr: false,
  }
);

const MAX_FREE_DAILY_AUDITS = 20;

export default function Home() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [targetKeyword, setTargetKeyword] = useState<string>('');
  const [isKeywordExpanded, setIsKeywordExpanded] = useState<boolean>(false);
  const [showDeepDiveData, setShowDeepDiveData] = useState<boolean>(false);
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

  const handleTrySample = () => {
    setTargetKeyword('seo competitor analysis tool');
    setUrls(['https://analyzeserp.com', 'https://vercel.com']);
    setErrorMsg(null);
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
      'Run a free competitor SEO audit instantly. Compare titles, meta tags, headings, keywords, links & technical SEO — no signup, no credit card required.',
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
        <div className="bg-slate-100/90 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/[0.08] py-2 px-4 text-center text-xs text-slate-600 dark:text-slate-400 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap pr-8 sm:pr-0">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Public Beta:</span>
            </span>
            <span>Free multi-URL competitor audits & keyword gap benchmarking unlocked</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <button
              onClick={() => setIsProModalOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              White-label client PDF exports included (<span className="line-through text-slate-400 dark:text-slate-500">$19/mo</span> Free)
            </button>
          </div>

          {/* Close X Dismiss Button */}
          <button
            onClick={() => {
              setIsQuotaBarDismissed(true);
              localStorage.setItem('quota_bar_dismissed', 'true');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer rounded-md hover:bg-slate-200/50 dark:hover:bg-white/10"
            aria-label="Dismiss notification bar"
            title="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* AnalyzeSERP Brand Hero */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2 pb-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Competitor Benchmark Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.03em] leading-tight">
            Competitor SEO Analysis <br />
            <span className="text-slate-500 dark:text-slate-400 font-semibold">& SERP Benchmarking</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            Compare on-page signals, heading trees, keyword gaps, and technical health side-by-side across up to 5 URLs in seconds.
          </p>
        </div>

        {/* Cooldown Timer Card if 5/5 audits used */}
        {isCooldownActive && cooldownSeconds > 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-3 text-center animate-in fade-in max-w-2xl mx-auto shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Clock className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Quota Cooldown: 5/5 Audits Used</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Next 5 Free Audits Unlock In:{' '}
              <span className="font-mono text-2xl text-amber-500 underline ml-2">
                {cooldownSeconds}s
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              <strong>AnalyzeSERP Pro ($19/mo value) is 100% free during public beta.</strong> While the timer counts down, feel free to submit feedback or test other utilities.
            </p>
          </div>
        )}

        {/* Audit Input Form Box */}
        <div className="max-w-[830px] mx-auto w-full">
          <div className="glass-panel hero-input-dock p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 space-y-5">
            {/* Dock Top Utility Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Target & Competitor URLs
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                  {urls.length} / 5 URLs
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTrySample}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
                  title="Auto-fill sample URLs to test competitor comparison"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Load Sample Benchmark</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div className="space-y-3">
                {/* Integrated Focus Keyword Field */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Key className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Focus Keyword <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional for intent alignment)</span></span>
                  </div>
                  <div className="w-full sm:max-w-xs">
                    <input
                      id="target-keyword-input"
                      type="text"
                      aria-label="Target search keyword or focus query"
                      placeholder="e.g. seo competitor audit"
                      value={targetKeyword}
                      onChange={(e) => setTargetKeyword(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs focus:outline-none font-mono transition-all"
                    />
                  </div>
                </div>

                {/* URLs Inputs */}
                {urls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span
                        className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          idx === 0
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {idx === 0 ? 'TARGET' : `COMP #${idx}`}
                      </span>
                      <input
                        type="text"
                        aria-label={idx === 0 ? "Your Target Page URL" : `Competitor ${idx} Page URL`}
                        placeholder={
                          idx === 0
                            ? 'Your Target Page (e.g. https://yourdomain.com/my-article)'
                            : `Competitor #${idx} Page (e.g. https://competitor.com/ranking-page)`
                        }
                        value={url}
                        onChange={(e) => handleUrlChange(idx, e.target.value)}
                        className="w-full pl-22 sm:pl-26 pr-4 py-3 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all"
                      />
                    </div>

                    {urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlInput(idx)}
                        aria-label={`Remove URL ${idx + 1}`}
                        className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer active:scale-[0.98] shrink-0"
                        title={`Remove URL ${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div id="audit-error" role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={addUrlInput}
                    disabled={urls.length >= 5}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Competitor URL</span>
                  </button>

                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {Math.max(0, MAX_FREE_DAILY_AUDITS - dailyAuditCount)}/20 free audits today
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isAuditing}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isAuditing ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin" />
                      <span>Running SEO Audit...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Analyze Competitor SEO</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Audit Results Dashboard */}
        {isAuditing ? (
          <AuditSkeleton />
        ) : auditResponse && auditResponse.results.length > 0 ? (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* 1. SERP Consensus & Master Priority Action Center */}
            <SerpDecisionCenter
              results={auditResponse.results}
              targetUrl={urls.map((u) => u.trim()).filter(Boolean)[0]}
              targetKeyword={targetKeyword.trim() || undefined}
            />

            {/* 2. Side-by-Side Keyword Gap Matrix */}
            {auditResponse.results.filter((r) => r.status === 'success').length >= 2 && (
              <KeywordGapMatrix results={auditResponse.results.filter((r) => r.status === 'success')} />
            )}

            {/* 3. Architected Strategic Content Brief Generator Export */}
            {auditResponse.results.filter((r) => r.status === 'success').length > 0 && (
              <ContentBriefGenerator results={auditResponse.results.filter((r) => r.status === 'success')} />
            )}

            {/* 4. Deep-Dive Raw Matrix & Single Page Inspector (Collapsible) */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Deep-Dive Technical Data & Benchmark Inspector
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-gray-200 mt-0.5">
                    Raw tabular comparison data, N-gram keyword frequency tables, and individual DOM audit cards.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeepDiveData(!showDeepDiveData)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
                >
                  <span>{showDeepDiveData ? 'Hide Raw Technical Metrics' : 'Show Deep-Dive Technical Inspector'}</span>
                  {showDeepDiveData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showDeepDiveData && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <ComparisonMatrix results={auditResponse.results} />

                  <div className="space-y-6 pt-2">
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      Single Page DOM Inspector ({auditResponse.results.length} URLs)
                    </h4>
                    {auditResponse.results.map((audit, idx) => (
                      <SingleAuditCard key={idx} audit={audit} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-16 pt-6">
            {/* Feature Highlights Bento Showcase */}
            <div className="space-y-6 max-w-5xl mx-auto pt-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                  <span>Audit Capabilities</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
                  Empirical SERP Intelligence
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Direct server-side HTML parsing and competitive gap detection without AI latency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Hero Feature Card: Multi-URL Benchmark (Spans 7 cols) */}
                <div className="md:col-span-7 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Signature Benchmark
                      </span>
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Layers className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      Multi-URL Competitor Consensus & Differential
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Benchmark title tag pixel budgets (580px/600px), complete heading hierarchy trees (H1–H6), word volumes, and Flesch reading levels side-by-side to uncover exactly why ranking pages hold top search positions.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Side-by-side comparison for up to 5 URLs</span>
                  </div>
                </div>

                {/* Feature Card 2: Keyword Gap (Spans 5 cols) */}
                <div className="md:col-span-5 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Topic Telemetry
                      </span>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300">
                        <Key className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      N-Gram Keyword Gap Matrix
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Extract 1-gram, 2-gram, and 3-gram phrases to expose common core topics across all competitors and identify high-value keyword deficits in your content.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>1-Gram, 2-Gram & 3-Gram extraction</span>
                  </div>
                </div>

                {/* Feature Card 3: Technical Health (Spans 5 cols) */}
                <div className="md:col-span-5 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Infrastructure
                      </span>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      Technical SEO & Speed Signals
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Measure real server response latency (TTFB ms), HTML payload bytes, DOM depth, SSL encryption, canonical declarations, and Core Web Vitals signals.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Transient DOM inspection</span>
                  </div>
                </div>

                {/* Feature Card 4: Action Roadmap & Briefs (Spans 7 cols) */}
                <div className="md:col-span-7 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Deliverables
                      </span>
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      Action Matrix & White-Label Client Reports
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Translate competitive gaps into a prioritized Impact × Effort roadmap, structured markdown content brief, or branded 3-page executive client PDF report with custom agency logo and colors.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>1-Click Markdown & Vector PDF export</span>
                  </div>
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
