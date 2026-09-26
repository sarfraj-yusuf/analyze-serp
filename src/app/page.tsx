'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Search,
  Plus,
  Trash2,
  Zap,
  AlertCircle,
  Sparkles,
  Layers,
  ShieldCheck,
  ArrowRight,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Key,
  Target,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  Users,
  Compass,
  Gauge,
  FileCheck,
  Check,
  Activity,
  Eye,
  Palette,
  Link2,
  GitFork,
  RotateCcw,
  Network,
  FileEdit,
} from 'lucide-react';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { SpotlightCard } from '@/components/SpotlightCard';
import { SerpComparisonToggle } from '@/components/SerpComparisonToggle';
import { normalizeUrl, isValidUrl } from '@/lib/url-utils';

const ProUpgradeModal = dynamic(
  () => import('@/components/ProUpgradeModal').then((mod) => mod.ProUpgradeModal),
  {
    ssr: false,
  }
);

const MAX_FREE_DAILY_AUDITS = 20;
const ACTIVE_AUDIT_STORAGE_KEY = 'analyzeserp_active_audit_session';

interface PersistedAuditSession {
  urls: string[];
  targetKeyword: string;
  savedAt: number;
}

export default function Home() {
  const router = useRouter();
  const [urls, setUrls] = useState<string[]>(['']);
  const [targetKeyword, setTargetKeyword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasActiveAudit, setHasActiveAudit] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dailyAuditCount, setDailyAuditCount] = useState<number>(0);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [isCooldownActive, setIsCooldownActive] = useState<boolean>(false);
  const [isQuotaBarDismissed, setIsQuotaBarDismissed] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

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

    // Check if an active audit session exists in localStorage for quick navigation
    try {
      const storedAudit = localStorage.getItem(ACTIVE_AUDIT_STORAGE_KEY);
      if (storedAudit) {
        const parsed = JSON.parse(storedAudit);
        const isFresh = Date.now() - (parsed.savedAt || 0) < 24 * 60 * 60 * 1000;
        if (isFresh && parsed.urls && parsed.urls.length > 0) {
          setHasActiveAudit(true);
        }
      }
    } catch (auditRestoreErr) {
      console.warn('[Storage] Failed to check active audit session:', auditRestoreErr);
    }
  }, []);

  const handleClearAudit = () => {
    setHasActiveAudit(false);
    setUrls(['']);
    setTargetKeyword('');
    setErrorMsg(null);
    try {
      localStorage.removeItem(ACTIVE_AUDIT_STORAGE_KEY);
      localStorage.removeItem('analyzeserp_pending_ai_modal');
      localStorage.removeItem('analyzeserp_just_logged_in');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleUrlBlur = (index: number) => {
    const val = urls[index]?.trim();
    if (!val) return;
    if (isValidUrl(val)) {
      const normalized = normalizeUrl(val);
      if (normalized !== val) {
        const updated = [...urls];
        updated[index] = normalized;
        setUrls(updated);
      }
    }
  };

  const handleTrySample = () => {
    const sampleUrls = ['https://analyzeserp.com', 'https://vercel.com'];
    const sampleKw = 'seo competitor analysis tool';
    router.push(`/audit?urls=${encodeURIComponent(sampleUrls.join(','))}&keyword=${encodeURIComponent(sampleKw)}`);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isCooldownActive && cooldownSeconds > 0) {
      setErrorMsg(`Quota limit reached. Please wait ${cooldownSeconds}s before your next 5 free audits unlock.`);
      return;
    }

    const rawUrls = urls.map((u) => u.trim()).filter(Boolean);
    if (rawUrls.length === 0) {
      setErrorMsg('Please enter at least 1 valid URL to run the audit.');
      return;
    }

    const invalidList: string[] = [];
    const normalizedList: string[] = [];
    for (const u of rawUrls) {
      if (!isValidUrl(u)) {
        invalidList.push(u);
      } else {
        normalizedList.push(normalizeUrl(u));
      }
    }

    if (invalidList.length > 0) {
      setErrorMsg(`Invalid URL format: "${invalidList[0]}". Please enter a valid web domain or URL (e.g. example.com or https://example.com).`);
      return;
    }

    if (dailyAuditCount + normalizedList.length > MAX_FREE_DAILY_AUDITS) {
      setIsProModalOpen(true);
      return;
    }

    setUrls(normalizedList);
    setIsSubmitting(true);
    const queryParams = new URLSearchParams();
    queryParams.set('urls', normalizedList.join(','));
    if (targetKeyword.trim()) {
      queryParams.set('keyword', targetKeyword.trim());
    }
    router.push(`/audit?${queryParams.toString()}`);
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
              White-label client PDF exports included (<span className="line-through text-slate-500 dark:text-slate-400">$19/mo</span> Free)
            </button>
          </div>

          {/* Close X Dismiss Button */}
          <button
            onClick={() => {
              setIsQuotaBarDismissed(true);
              localStorage.setItem('quota_bar_dismissed', 'true');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer rounded-md hover:bg-slate-200/50 dark:hover:bg-white/10"
            aria-label="Dismiss notification bar"
            title="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* AnalyzeSERP Brand Hero */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2 pb-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Competitor Benchmark Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.03em] leading-tight">
            Competitor SEO Audit
            <span className="block text-base sm:text-xl lg:text-2xl font-semibold text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2">
              See Why Your Competitors Outrank You
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Compare your page with up to 4 competitors to find content gaps, heading issues, keyword opportunities, and technical SEO problems.
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
                {/* URLs Inputs */}
                {urls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span
                        className={`absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md min-w-[62px] sm:min-w-[70px] text-center select-none ${
                          idx === 0
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {idx === 0 ? 'TARGET' : `COMP #${idx}`}
                      </span>
                      <label htmlFor={`hero-url-input-${idx}`} className="sr-only">
                        {idx === 0 ? "Your Target Page URL" : `Competitor ${idx} Page URL`}
                      </label>
                      <input
                        id={`hero-url-input-${idx}`}
                        type="text"
                        aria-label={idx === 0 ? "Your Target Page URL" : `Competitor ${idx} Page URL`}
                        aria-invalid={!!errorMsg}
                        aria-describedby={errorMsg ? "audit-error" : undefined}
                        placeholder={
                          idx === 0
                            ? 'Your Target Page (e.g. https://yourdomain.com/my-article)'
                            : `Competitor #${idx} Page (e.g. https://competitor.com/ranking-page)`
                        }
                        value={url}
                        onChange={(e) => handleUrlChange(idx, e.target.value)}
                        onBlur={() => handleUrlBlur(idx)}
                        className="w-full pl-[80px] sm:pl-[94px] pr-4 py-2.5 sm:py-3 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all"
                      />
                    </div>

                    {urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlInput(idx)}
                        aria-label={`Remove URL ${idx + 1}`}
                        className="p-2.5 sm:p-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 dark:text-slate-400 transition-all cursor-pointer active:scale-[0.98] shrink-0"
                        title={`Remove URL ${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Integrated Focus Keyword Field */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <label htmlFor="target-keyword-input" className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <Key className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Focus Keyword <span className="text-slate-600 dark:text-slate-400 font-normal">(Optional for intent alignment)</span></span>
                  </label>
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
              </div>

              {errorMsg && (
                <div id="audit-error" role="alert" aria-live="polite" className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-3 pt-2">
                <div className="flex flex-col items-start gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={addUrlInput}
                      disabled={urls.length >= 5}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-[color,background-color,border-color,transform] border border-slate-200 dark:border-white/10 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Competitor URL</span>
                    </button>

                    {hasActiveAudit && (
                      <div className="flex items-center gap-2">
                        <Link
                          href="/audit"
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-[color,background-color,border-color,transform] border border-emerald-500/20 cursor-pointer active:scale-[0.98]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Active Audit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleClearAudit}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-[color,background-color,border-color,transform] border border-slate-200 dark:border-white/10 cursor-pointer active:scale-[0.98]"
                          title="Clear current audit and start a fresh benchmark"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Clear Audit</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums px-0.5">
                    {Math.max(0, MAX_FREE_DAILY_AUDITS - dailyAuditCount)}/20 free audits today
                  </span>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md shadow-emerald-600/30 hover:shadow-lg hover:shadow-emerald-500/40 ring-1 ring-white/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 group"
                  >
                    {isSubmitting ? (
                      <>
                        <Zap className="w-4 h-4 animate-spin" />
                        <span>Opening Audit...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>Start Free Audit</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-right font-medium">
                    No login required • Results in 30 seconds
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Competitor SERP Intelligence Landing Content */}
        <div className="max-w-5xl mx-auto space-y-16 pt-12 border-t border-slate-200/80 dark:border-white/[0.08]">
            {/* 1. How It Works & Target Personas */}
            <section className="space-y-6">
              <div className="space-y-2 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <Search className="w-3 h-3" />
                  <span>COMPETITOR SERP INTELLIGENCE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
                  Why Benchmark Multi-URL Competitor Signals?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The pages ranking on Page 1 demonstrate exactly what Google expects for a search query. By extracting real-time DOM differences across competitors, you isolate actionable content and technical gaps with zero guesswork.
                </p>
              </div>

              {/* Persona Chip Bar */}
              <div className="p-3.5 sm:p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                  <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Engineered for High-Output Search Teams:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                    Technical SEOs
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                    Content Directors
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                    Agency Consultants
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                    Growth Founders
                  </span>
                </div>
              </div>

              {/* 3 Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                      STEP 01
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      Input Up to 5 Competitor URLs
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Enter your own target page alongside up to 4 ranking competitors, product review pages, or category hubs into the input dock above.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Side-by-side batching</span>
                  </div>
                </div>

                <div className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                      STEP 02
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      Sub-500ms Cheerio Extraction
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Our deterministic serverless crawler inspects raw HTML DOM nodes in parallel—extracting title pixel caps, heading trees, word counts, and Core Web Vitals.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>0.0% AI Hallucination rate</span>
                  </div>
                </div>

                <div className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                      STEP 03
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      Export Roadmap &amp; Briefs
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Review N-gram keyword gaps, prioritize quick-win content fixes, and export an unbranded executive Markdown brief or White-Label client PDF report.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Client-ready deliverables</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Interactive Before vs After SERP Simulator */}
            <SerpComparisonToggle />

            {/* 3. 4-Pillar Competitor Intelligence Bento Grid (with Magnetic Spotlight) */}
            <section className="space-y-6">
              <div className="space-y-2 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>COMPETITOR BENCHMARK CRITERIA</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  The 4 Pillars of Deterministic SERP Analysis
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Every metric is measured against authoritative Google Search Central standards and W3C specifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Pillar 1: Search Intent & Keyword Gaps */}
                <SpotlightCard
                  variant="emerald"
                  className="h-full"
                  innerClassName="p-5 sm:p-6 flex flex-col justify-between flex-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                          <Key className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          TOPICAL RELEVANCE
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold group-hover:bg-emerald-500/20 transition-colors">
                        1, 2 &amp; 3-Grams
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Search Intent &amp; N-Gram Frequency Mining
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Uncover the exact phrase patterns, technical terms, and semantic subtopics top-ranking competitors share. Spotting high-frequency keyword voids allows you to expand topical depth without keyword stuffing.
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Multi-word semantic phrase frequency calculation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Competitor keyword overlap percentage matrix</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Missing search intent variations identification</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <span>Google Search Central Helpful Content System</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </SpotlightCard>

                {/* Pillar 2: Heading Tree & Outline Architecture */}
                <SpotlightCard
                  variant="cyan"
                  className="h-full"
                  innerClassName="p-5 sm:p-6 flex flex-col justify-between flex-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          DOM OUTLINE
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-bold group-hover:bg-cyan-500/20 transition-colors">
                        H1–H6 Depth
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      Heading Outline Mapping &amp; Content Architecture
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Extract complete H1, H2, and H3 structural blueprints. Comparing competitor heading depth uncovers missing sub-themes, schema headings, and structural flaws before you draft or revise content.
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Single H1 presence and semantic nesting integrity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Question-based heading intent detection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Content hierarchy gap analysis across top URLs</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://www.w3.org/WAI/tutorials/page-structure/headings/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <span>W3C Semantic HTML5 Heading Structure</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </SpotlightCard>

                {/* Pillar 3: Visual SERP Snippet & Pixel Budgeting */}
                <SpotlightCard
                  variant="emerald"
                  className="h-full"
                  innerClassName="p-5 sm:p-6 flex flex-col justify-between flex-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                          <Compass className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          SERP PRESENTATION
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold group-hover:bg-emerald-500/20 transition-colors">
                        600px / 580px Caps
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Pixel-Exact Title &amp; Description Simulation
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Google truncates title tags exceeding ~600 pixels on desktop and 580 pixels on mobile. Comparing pixel widths against rival snippets prevents truncated brand names and awkward ellipses.
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Proportional character width pixel math</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Description truncation risk &amp; CTR psychology</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Open Graph 1.91:1 social card alignment</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://developers.google.com/search/docs/appearance/title-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <span>Google Search Snippet Best Practices</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </SpotlightCard>

                {/* Pillar 4: Technical Overhead & Latency Benchmarks */}
                <SpotlightCard
                  variant="purple"
                  className="h-full"
                  innerClassName="p-5 sm:p-6 flex flex-col justify-between flex-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                          <Gauge className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          CORE INFRASTRUCTURE
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 font-bold group-hover:bg-purple-500/20 transition-colors">
                        &lt; 500ms TTFB
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Server Velocity &amp; Technical Hygiene Benchmarks
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Benchmark server response latency (TTFB), HTML document weight, canonical tag hygiene, and redirect counts across all 5 competitor targets to guarantee technical performance parity.
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Server Time to First Byte (TTFB) comparison</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Uncompressed vs compressed HTML payload bytes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Canonical declarations &amp; robots indexability</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://web.dev/explore/fast"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <span>Google Search Central Core Web Vitals Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </SpotlightCard>
              </div>
            </section>

            {/* 3. Frequently Asked Questions (Accordion) */}
            <section className="space-y-6 max-w-4xl mx-auto">
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Common Questions</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Answers to common questions about competitor SEO analysis and multi-URL benchmarks.
                </p>
              </div>

              {/* FAQ Schema Script */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: [
                      {
                        '@type': 'Question',
                        name: 'What makes AnalyzeSERP faster and more accurate than AI scraper tools?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'Generative LLMs take 20 to 45 seconds to summarize pages and frequently hallucinate missing headings, word counts, and meta tags. AnalyzeSERP uses a dedicated server-side Node.js Cheerio DOM parser that inspects the real raw HTML in under 500 milliseconds—returning 100% mathematical facts without guessing.',
                        },
                      },
                      {
                        '@type': 'Question',
                        name: 'Can I compare multiple competitor URLs side by side?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'Yes. You can paste up to 5 URLs to benchmark title tag pixel widths, heading hierarchy depth, word volume, Flesch reading levels, and Core Web Vitals side by side in a synchronized comparison matrix.',
                        },
                      },
                      {
                        '@type': 'Question',
                        name: 'How does the N-gram keyword gap matrix calculate missing phrases?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'Our engine tokenizes raw text from all audited URLs and extracts 1-grams, 2-grams, and 3-grams. It calculates frequency across all competitor pages and highlights terms that appear repeatedly across top-ranking rivals but are absent or underutilized on your page.',
                        },
                      },
                      {
                        '@type': 'Question',
                        name: 'What are the daily audit limits during the Public Beta?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'During our Public Beta, AnalyzeSERP is 100% free! You can run batches of up to 5 URLs at a time with a quick 120-second cooldown reset. There are no paywalls or credit card requirements.',
                        },
                      },
                      {
                        '@type': 'Question',
                        name: 'Do I need an account or credit card to run competitor audits?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'No account or credit card is required to perform audits. You can immediately paste competitor URLs and generate instant audit reports. Creating a free account enables persistent audit logging.',
                        },
                      },
                      {
                        '@type': 'Question',
                        name: 'Can I export the competitor audit results into a client-ready brief?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'Yes. You can export a comprehensive Markdown content brief (.md) or generate a 3-page unbranded Executive White-Label Vector PDF report customized with your agency name, client URL, and consultant notes.',
                        },
                      },
                    ],
                  }),
                }}
              />

              <div className="space-y-2.5">
                {[
                  {
                    question: 'What makes AnalyzeSERP faster and more accurate than AI scraper tools?',
                    answer:
                      'Generative LLMs (like GPT-4 or Claude web bots) take 20 to 45 seconds to summarize pages and frequently hallucinate missing headings, word counts, and meta tags. AnalyzeSERP uses a dedicated server-side Node.js Cheerio DOM parser that inspects the real raw HTML in under 500 milliseconds—returning 100% mathematical facts without guessing.',
                  },
                  {
                    question: 'Can I compare multiple competitor URLs side by side?',
                    answer:
                      'Yes. You can paste up to 5 URLs (your page plus 4 competitors) to benchmark title tag pixel widths, heading hierarchy depth, word volume, Flesch reading levels, and Core Web Vitals side by side in a synchronized comparison matrix.',
                  },
                  {
                    question: 'How does the N-gram keyword gap matrix calculate missing phrases?',
                    answer:
                      'Our engine tokenizes raw text from all audited URLs and extracts single words (1-grams), two-word combinations (2-grams), and three-word phrases (3-grams). It calculates the frequency across all competitor pages and highlights terms that appear repeatedly across top-ranking rivals but are absent or underutilized on your page.',
                  },
                  {
                    question: 'What are the daily audit limits during the Public Beta?',
                    answer:
                      'During our Public Beta, AnalyzeSERP is 100% free! You can run batches of up to 5 URLs at a time with a quick 120-second cooldown reset. There are no paywalls or credit card requirements.',
                  },
                  {
                    question: 'Do I need an account or credit card to run competitor audits?',
                    answer:
                      'No account or credit card is required to perform audits. You can immediately paste competitor URLs and generate instant audit reports. Creating a free account enables persistent audit logging and workspace history.',
                  },
                  {
                    question: 'Can I export the competitor audit results into a client-ready brief?',
                    answer:
                      'Yes. You can export a comprehensive Markdown content brief (.md) or generate a 3-page unbranded Executive White-Label Vector PDF report customized with your agency name, client URL, and consultant notes.',
                  },
                ].map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className={`rounded-xl border transition-colors duration-150 ${
                        isOpen
                          ? 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-300 dark:border-white/15'
                          : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        aria-controls={`faq-home-answer-${index}`}
                        aria-expanded={isOpen}
                        className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-emerald-500' : ''
                          }`}
                        />
                      </button>

                      <div
                        id={`faq-home-answer-${index}`}
                        role="region"
                        aria-hidden={!isOpen}
                        className={`px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 leading-relaxed ${
                          isOpen ? 'block' : 'hidden'
                        }`}
                      >
                        {faq.answer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. Standalone Micro-Diagnostics Suite */}
            <section className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200/70 dark:border-white/[0.06]">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <Activity className="w-3 h-3" />
                    <span>STANDALONE MICRO-AUDIT ENGINES</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Zero-Latency Single-Purpose Diagnostic Utilities
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Need an isolated check without executing a full multi-competitor SERP crawl? Launch dedicated micro-engines engineered for immediate, deterministic verification.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 bg-slate-100 dark:bg-white/[0.03] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>11 Live Standalone Engines</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Technical Health */}
                <Link
                  href="/technical-health"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-blue-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
                        HTTP / DOM / SSL
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Technical Health
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        DOM depth, SSL cipher validation, status codes, and robots indexation directives.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <span>Launch audit</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 2. Site Speed */}
                <Link
                  href="/site-speed-checker"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-amber-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                        <Gauge className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                        TTFB &amp; CWV
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Site Speed &amp; TTFB
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Server response latency, DNS timing breakdown, and Core Web Vitals readiness.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <span>Test speed</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 3. Redirect Tracer */}
                <Link
                  href="/redirect-checker"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-sky-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-105 transition-transform">
                        <GitFork className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 font-bold uppercase tracking-wider">
                        301 / 302 Chains
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        Redirect Chain Tracer
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Trace multi-hop HTTP redirect pathways and detect infinite redirection loops.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    <span>Trace chain</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 4. Contrast Studio */}
                <Link
                  href="/contrast-checker"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <Palette className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                        WCAG 2.2 AA / AAA
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Color Contrast Studio
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Validate text and UI contrast ratios against official W3C accessibility compliance.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    <span>Check contrast</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 5. Affiliate Links */}
                <Link
                  href="/affiliate-link-checker"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-indigo-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-bold uppercase tracking-wider">
                        rel Tagging
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Affiliate Link Validator
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Audit rel="sponsored" and rel="nofollow" attributes for FTC &amp; search safety.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <span>Audit tags</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 6. Readability */}
                <Link
                  href="/readability"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-teal-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 font-bold uppercase tracking-wider">
                        Flesch Scale
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        Readability &amp; Tone
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Calculate Flesch Reading Ease, grade level complexity, and sentence syllable rhythm.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    <span>Analyze tone</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 7. SERP Preview */}
                <Link
                  href="/serp-snippet-preview"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-violet-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20 group-hover:scale-105 transition-transform">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20 font-bold uppercase tracking-wider">
                        600px Bounds
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        SERP Snippet Simulator
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Preview Google desktop and mobile title &amp; meta snippet truncation boundaries in real-time.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    <span>Preview SERP</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 8. PDF Reports */}
                <Link
                  href="/pdf-reports"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-pink-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-500/20 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-500/20 font-bold uppercase tracking-wider">
                        Client Ready
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        White-Label PDF Reports
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Export unbranded stakeholder audits, executive checklists, and actionable briefs.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    <span>Generate report</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 9. Featured Snippet (Pos 0) Optimizer */}
                <Link
                  href="/featured-snippet-optimizer"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-cyan-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
                        <Target className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">
                        Position 0 Bait
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        Snippet Optimizer
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Format definition bait, comparison tables, and ordered step lists to win Google Position 0.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    <span>Optimize snippets</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 10. Live SEO Content Scratchpad */}
                <Link
                  href="/content-scratchpad"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <FileEdit className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                        Lexical Scorer
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Content Scratchpad
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Real-time drafting canvas with live keyword density, heading distribution, and word metrics.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    <span>Draft content</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 11. Internal Link Topology Mapper */}
                <Link
                  href="/internal-link-mapper"
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-purple-500/40 hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition-transform">
                        <Network className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 font-bold uppercase tracking-wider">
                        Topology &amp; Anchors
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Internal Link Mapper
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                        Map crawl depth, detect orphaned URLs, and audit internal PageRank anchor text distribution.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <span>Map topology</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* Bottom Reassurance Ribbon */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Deterministic edge execution &bull; Zero third-party telemetry &bull; 100% Free Public Beta</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <ExternalLink className="w-3 h-3" />
                  <span>W3C &amp; Google Search Central Compliant</span>
                </div>
              </div>
            </section>
          </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
      <CookieConsentBanner />
    </div>
  );
}
