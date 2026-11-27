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
  AlertCircle,
  Sparkles,
  Layers,
  ShieldCheck,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  Key,
  Target,
  HelpCircle,
  BookOpen,
  ExternalLink,
  Users,
  Compass,
  Gauge,
  FileCheck,
  Check,
  Eye,
  Palette,
  Link2,
  GitFork,
  RotateCcw,
  RefreshCw,
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

const ACTIVE_AUDIT_STORAGE_KEY = 'analyzeserp_active_audit_session';

interface PersistedAuditSession {
  urls: string[];
  targetKeyword: string;
  savedAt: number;
}

type ToolCategory = 'all' | 'content' | 'technical' | 'accessibility';

interface StandaloneToolItem {
  id: string;
  title: string;
  description: string;
  href: string;
  category: 'content' | 'technical' | 'accessibility';
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconText: string;
  iconBorder: string;
  hoverBorder: string;
  hoverText: string;
  actionText: string;
}

const TOOL_CATEGORIES = [
  { id: 'all', label: 'All Tools', count: 10 },
  { id: 'content', label: 'On-Page & Content', count: 4 },
  { id: 'technical', label: 'Technical SEO', count: 4 },
  { id: 'accessibility', label: 'Accessibility & UX', count: 2 },
] as const;

const STANDALONE_TOOLS: StandaloneToolItem[] = [
  // Technical SEO (4)
  {
    id: 'technical-health',
    title: 'Technical Health',
    description: 'DOM depth, SSL cipher validation, status codes, and robots indexation directives.',
    href: '/technical-health',
    category: 'technical',
    icon: ShieldCheck,
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-600 dark:text-blue-400',
    iconBorder: 'border-blue-500/20',
    hoverBorder: 'hover:border-blue-500/40',
    hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    actionText: 'Launch audit',
  },
  {
    id: 'site-speed',
    title: 'Site Speed & TTFB',
    description: 'Server response latency, DNS timing breakdown, and Core Web Vitals readiness.',
    href: '/site-speed-checker',
    category: 'technical',
    icon: Gauge,
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-600 dark:text-amber-400',
    iconBorder: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
    hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    actionText: 'Test speed',
  },
  {
    id: 'redirect-tracer',
    title: 'Redirect Chain Tracer',
    description: 'Trace multi-hop HTTP redirect pathways and detect infinite redirection loops.',
    href: '/redirect-checker',
    category: 'technical',
    icon: GitFork,
    iconBg: 'bg-sky-500/10',
    iconText: 'text-sky-600 dark:text-sky-400',
    iconBorder: 'border-sky-500/20',
    hoverBorder: 'hover:border-sky-500/40',
    hoverText: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
    actionText: 'Trace chain',
  },
  {
    id: 'internal-link-checker',
    title: 'Internal Link Checker',
    description: 'Map crawl depth, detect orphaned URLs, and audit internal link anchor text distribution.',
    href: '/internal-link-mapper',
    category: 'technical',
    icon: Network,
    iconBg: 'bg-purple-500/10',
    iconText: 'text-purple-600 dark:text-purple-400',
    iconBorder: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/40',
    hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    actionText: 'Check internal links',
  },
  // On-Page & Content (4)
  {
    id: 'serp-snippet-preview',
    title: 'SERP Snippet Simulator',
    description: 'Preview Google desktop and mobile title & meta snippet truncation boundaries in real-time.',
    href: '/serp-snippet-preview',
    category: 'content',
    icon: Eye,
    iconBg: 'bg-violet-500/10',
    iconText: 'text-violet-600 dark:text-violet-400',
    iconBorder: 'border-violet-500/20',
    hoverBorder: 'hover:border-violet-500/40',
    hoverText: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    actionText: 'Preview SERP',
  },
  {
    id: 'featured-snippet-optimizer',
    title: 'Snippet Optimizer',
    description: 'Format definition bait, comparison tables, and ordered step lists to win Google Position 0.',
    href: '/featured-snippet-optimizer',
    category: 'content',
    icon: Target,
    iconBg: 'bg-cyan-500/10',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    iconBorder: 'border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/40',
    hoverText: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    actionText: 'Optimize snippets',
  },
  {
    id: 'content-scratchpad',
    title: 'Content Scratchpad',
    description: 'Real-time drafting canvas with live keyword density, heading distribution, and word metrics.',
    href: '/content-scratchpad',
    category: 'content',
    icon: FileEdit,
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    iconBorder: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    actionText: 'Draft content',
  },
  {
    id: 'readability-tone',
    title: 'Readability & Tone',
    description: 'Calculate Flesch Reading Ease, grade level complexity, and sentence syllable rhythm.',
    href: '/readability',
    category: 'content',
    icon: FileCheck,
    iconBg: 'bg-teal-500/10',
    iconText: 'text-teal-600 dark:text-teal-400',
    iconBorder: 'border-teal-500/20',
    hoverBorder: 'hover:border-teal-500/40',
    hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    actionText: 'Analyze tone',
  },
  // Accessibility & UX (2)
  {
    id: 'contrast-checker',
    title: 'Color Contrast Studio',
    description: 'Validate text and UI contrast ratios against official W3C accessibility compliance.',
    href: '/contrast-checker',
    category: 'accessibility',
    icon: Palette,
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    iconBorder: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    actionText: 'Check contrast',
  },
  {
    id: 'affiliate-link-checker',
    title: 'Affiliate Link Validator',
    description: 'Audit rel="sponsored" and rel="nofollow" attributes for FTC & search safety.',
    href: '/affiliate-link-checker',
    category: 'accessibility',
    icon: Link2,
    iconBg: 'bg-indigo-500/10',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    iconBorder: 'border-indigo-500/20',
    hoverBorder: 'hover:border-indigo-500/40',
    hoverText: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    actionText: 'Audit tags',
  },
];

export default function Home() {
  const router = useRouter();
  const [urls, setUrls] = useState<string[]>(['', '']);
  const [targetKeyword, setTargetKeyword] = useState<string>('');
  const [isKeywordExpanded, setIsKeywordExpanded] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasActiveAudit, setHasActiveAudit] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [isCooldownActive, setIsCooldownActive] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedToolCategory, setSelectedToolCategory] = useState<ToolCategory>('all');

  const filteredTools = selectedToolCategory === 'all'
    ? STANDALONE_TOOLS
    : STANDALONE_TOOLS.filter((tool) => tool.category === selectedToolCategory);

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
    setUrls(['', '']);
    setTargetKeyword('');
    setIsKeywordExpanded(false);
    setErrorMsg(null);
    setFieldErrors({});
    try {
      localStorage.removeItem(ACTIVE_AUDIT_STORAGE_KEY);
      localStorage.removeItem('analyzeserp_pending_ai_modal');
      localStorage.removeItem('analyzeserp_just_logged_in');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addUrlInput = () => {
    if (urls.length >= 5) {
      setErrorMsg('Public Beta supports up to 5 URLs per comparison run for optimal crawl performance.');
      return;
    }
    setUrls([...urls, '']);
  };

  const removeUrlInput = (index: number) => {
    if (index === 0 || urls.length <= 2) return;
    const updated = urls.filter((_, i) => i !== index);
    setUrls(updated);
    if (fieldErrors[index]) {
      const updatedErrors = { ...fieldErrors };
      delete updatedErrors[index];
      setFieldErrors(updatedErrors);
    }
  };

  const handleUrlChange = (index: number, val: string) => {
    const updated = [...urls];
    updated[index] = val;
    setUrls(updated);
    if (fieldErrors[index]) {
      const updatedErrors = { ...fieldErrors };
      delete updatedErrors[index];
      setFieldErrors(updatedErrors);
    }
    if (errorMsg) {
      setErrorMsg(null);
    }
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
      if (fieldErrors[index]) {
        const updatedErrors = { ...fieldErrors };
        delete updatedErrors[index];
        setFieldErrors(updatedErrors);
      }
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        [index]: 'Invalid URL format (e.g. example.com or https://example.com)',
      }));
    }
  };

  const handleTrySample = () => {
    const sampleUrls = ['https://analyzeserp.com', 'https://ahrefs.com/seo-checker'];
    const sampleKw = 'seo competitor analysis tool';
    router.push(`/audit?urls=${encodeURIComponent(sampleUrls.join(','))}&keyword=${encodeURIComponent(sampleKw)}`);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    if (isCooldownActive && cooldownSeconds > 0) {
      setErrorMsg(`Anti-abuse cooldown active. Please wait ${cooldownSeconds}s before starting your next batch audit.`);
      return;
    }

    const trimmedUrls = urls.map((u) => u.trim());
    const newFieldErrors: Record<number, string> = {};

    // 1. Target URL (index 0) is mandatory
    if (!trimmedUrls[0]) {
      newFieldErrors[0] = 'Please enter your Target page URL.';
    }

    // 2. Competitor #1 (index 1) is mandatory for competitor benchmarking
    if (!trimmedUrls[1]) {
      newFieldErrors[1] = 'Please enter at least 1 competitor URL to benchmark against.';
    }

    // 3. Validate URL formats
    const normalizedMap: Record<number, string> = {};
    trimmedUrls.forEach((u, idx) => {
      if ((idx === 0 || idx === 1) && !u) return;
      if (u) {
        if (!isValidUrl(u)) {
          newFieldErrors[idx] = 'Invalid URL (e.g. example.com or https://example.com)';
        } else {
          normalizedMap[idx] = normalizeUrl(u);
        }
      }
    });

    // 4. Validate Duplicates: Target vs Competitor
    const targetNormalized = normalizedMap[0];
    Object.entries(normalizedMap).forEach(([idxStr, normUrl]) => {
      const idx = Number(idxStr);
      if (idx > 0 && targetNormalized && normUrl.toLowerCase() === targetNormalized.toLowerCase()) {
        newFieldErrors[idx] = 'Competitor URL cannot be identical to Target URL.';
      }
    });

    // 5. Validate Duplicates: Competitor vs Competitor
    const seenCompetitors = new Map<string, number>();
    Object.entries(normalizedMap).forEach(([idxStr, normUrl]) => {
      const idx = Number(idxStr);
      if (idx > 0) {
        const lower = normUrl.toLowerCase();
        if (seenCompetitors.has(lower)) {
          newFieldErrors[idx] = `Duplicate competitor URL (already entered in Competitor #${seenCompetitors.get(lower)})`;
        } else {
          seenCompetitors.set(lower, idx);
        }
      }
    });

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setErrorMsg('Please correct the highlighted URL fields before running the audit.');
      return;
    }

    const finalUrls = Object.values(normalizedMap);
    if (finalUrls.length < 2) {
      setErrorMsg('Please enter both your Target URL and at least 1 Competitor URL to run the comparison.');
      return;
    }

    setUrls(finalUrls);
    setIsSubmitting(true);
    const queryParams = new URLSearchParams();
    queryParams.set('urls', finalUrls.join(','));
    if (targetKeyword.trim()) {
      queryParams.set('keyword', targetKeyword.trim());
    }
    router.push(`/audit?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* AnalyzeSERP Brand Hero */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto pt-2 pb-1">
          {process.env.NEXT_PUBLIC_SHOW_PRICING === 'true' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Public Beta: Free Multi-URL Audits &amp; PDF Reports</span>
              <span className="text-emerald-500/40">•</span>
              <button
                onClick={() => setIsProModalOpen(true)}
                className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                $19/mo Free
              </button>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.03em] leading-tight">
            See Why Your Competitors Outrank You
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Benchmark your page against up to 4 competitors to uncover content gaps, heading structure differences, and technical SEO issues.
          </p>
        </div>

        {/* Cooldown Timer Card if 5/5 audits used */}
        {isCooldownActive && cooldownSeconds > 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-3 text-center animate-in fade-in max-w-2xl mx-auto shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Clock className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Quota Cooldown: 5/5 Audits Used</span>
            </div>
            <p role="status" className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Next 5 Free Audits Unlock In:{' '}
              <span className="font-mono text-2xl text-amber-500 underline ml-2">
                {cooldownSeconds}s
              </span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {process.env.NEXT_PUBLIC_SHOW_PRICING === 'true' && (
                <><strong>AnalyzeSERP Pro ($19/mo value) is 100% free during public beta.</strong>{' '}</>
              )}
              While the timer counts down, feel free to submit feedback or test other utilities.
            </p>
          </div>
        )}

        {/* Audit Input Form Box */}
        <div className="max-w-[760px] mx-auto w-full">
          <div className="glass-panel hero-input-dock p-5 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-white/10 space-y-5 shadow-xs">
            {/* Dock Top Utility Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                Compare Your Page Against Competitors
              </span>

              <button
                type="button"
                onClick={handleTrySample}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
                title="Auto-fill sample URLs to test competitor comparison"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Try Sample Audit</span>
              </button>
            </div>

            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div className="space-y-3.5">
                {/* 1. Target URL (Your Page) */}
                <div className="space-y-1.5">
                  <label htmlFor="hero-url-input-0" className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Your Page URL
                  </label>
                  <div className="relative">
                    <input
                      id="hero-url-input-0"
                      type="text"
                      aria-label="Your Page URL"
                      aria-invalid={Boolean(fieldErrors[0])}
                      aria-describedby={fieldErrors[0] ? "hero-url-error-0" : undefined}
                      placeholder="https://yourdomain.com/your-page"
                      value={urls[0] || ''}
                      onChange={(e) => handleUrlChange(0, e.target.value)}
                      onBlur={() => handleUrlBlur(0)}
                      className={`w-full px-4 py-3 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all border-l-4 border-l-emerald-500 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                        fieldErrors[0]
                          ? 'border-red-500/80 dark:border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : ''
                      }`}
                    />
                  </div>
                  {fieldErrors[0] && (
                    <p
                      id="hero-url-error-0"
                      role="alert"
                      className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5 pl-1 pt-0.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors[0]}</span>
                    </p>
                  )}
                </div>

                {/* 2. Competitor URLs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Competitor URLs
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {urls.length - 1} of 4
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {urls.slice(1).map((url, sliceIdx) => {
                      const idx = sliceIdx + 1;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <label htmlFor={`hero-url-input-${idx}`} className="sr-only">
                                {`Competitor ${idx} Page URL`}
                              </label>
                              <input
                                id={`hero-url-input-${idx}`}
                                type="text"
                                aria-label={`Competitor #${idx} Page URL`}
                                aria-invalid={Boolean(fieldErrors[idx])}
                                aria-describedby={fieldErrors[idx] ? `hero-url-error-${idx}` : undefined}
                                placeholder={
                                  idx === 1
                                    ? 'https://competitor.com/ranking-page'
                                    : `https://competitor-${idx}.com/ranking-page`
                                }
                                value={url}
                                onChange={(e) => handleUrlChange(idx, e.target.value)}
                                onBlur={() => handleUrlBlur(idx)}
                                className={`w-full px-4 py-3 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                                  fieldErrors[idx]
                                    ? 'border-red-500/80 dark:border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    : ''
                                }`}
                              />
                            </div>

                            {urls.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeUrlInput(idx)}
                                aria-label={`Remove Competitor ${idx}`}
                                className="min-w-[40px] h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
                                title={`Remove Competitor ${idx}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {fieldErrors[idx] && (
                            <p
                              id={`hero-url-error-${idx}`}
                              role="alert"
                              className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5 pl-1 pt-0.5"
                            >
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{fieldErrors[idx]}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline Action Triggers Directly Below Competitors */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                    {urls.length < 5 && (
                      <button
                        type="button"
                        onClick={addUrlInput}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer py-0.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add another competitor URL (up to 4)</span>
                      </button>
                    )}

                    {!isKeywordExpanded && (
                      <button
                        type="button"
                        onClick={() => setIsKeywordExpanded(true)}
                        className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer py-0.5 transition-colors ml-auto sm:ml-0"
                      >
                        <Key className="w-3.5 h-3.5 text-slate-400" />
                        <span>+ Add target keyword (optional)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Collapsible Focus Keyword */}
                {isKeywordExpanded && (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="target-keyword-input" className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <Key className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Target Keyword <span className="text-slate-400 font-normal">(Optional)</span></span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetKeyword('');
                          setIsKeywordExpanded(false);
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      id="target-keyword-input"
                      type="text"
                      aria-label="Target search keyword or focus query"
                      placeholder="e.g. seo competitor audit"
                      value={targetKeyword}
                      onChange={(e) => setTargetKeyword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {errorMsg && (
                <div id="audit-error" role="alert" aria-live="polite" className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Full-Width Action Row */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-500/35 ring-1 ring-white/20 active:scale-[0.99] cursor-pointer disabled:opacity-50 group"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
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

                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
                  No login required &bull; Results in ~30s &bull; Compare titles, headings, keywords &amp; speed
                </p>

                {hasActiveAudit && (
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <Link
                      href="/audit"
                      className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/20"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Active Audit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleClearAudit}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-white/10 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear Audit</span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Competitor SERP Intelligence Landing Content */}
        <div className="max-w-5xl mx-auto space-y-16 pt-12 border-t border-slate-200/80 dark:border-white/[0.08]">
            {/* 1. How It Works & Target Personas */}
            <section className="space-y-6">
              <div className="space-y-2 text-center max-w-2xl mx-auto">
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
                <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                  <span>Technical SEOs</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>Content Directors</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>Agency Consultants</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>Growth Founders</span>
                </div>
              </div>

              {/* 3 Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      STEP 01
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      Input Up to 5 Competitor URLs
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Enter your own target page alongside up to 4 ranking competitors, product review pages, or category hubs into the input dock above.
                    </p>
                  </div>
                </div>

                <div className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      STEP 02
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      Real-Time Signal &amp; Gap Extraction
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Our fast crawler inspects live HTML across all pages in parallel—pinpointing title pixel limits, missing headings, keyword gaps, and site speed.
                    </p>
                  </div>
                </div>

                <div className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      STEP 03
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      Export Roadmap &amp; Briefs
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Review missing keywords and phrases, prioritize quick-win content fixes, and export an unbranded executive Markdown brief or White-Label client PDF report.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Interactive Before vs After SERP Simulator */}
            <SerpComparisonToggle />

            {/* 3. 4-Pillar Competitor Intelligence Bento Grid (with Magnetic Spotlight) */}
            <section className="space-y-6">
              <div className="space-y-2 text-center max-w-2xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  The 4 Pillars of Live Competitor Analysis
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Every metric is measured against authoritative Google Search Central standards and W3C specifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Pillar 1: Keyword & Topic Gaps */}
                <SpotlightCard
                  variant="emerald"
                  className="h-full"
                  innerClassName="p-5 sm:p-6 flex flex-col justify-start space-y-3 flex-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Key className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Keyword &amp; Topic Gaps
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Compare phrase frequencies and uncover high-impact search terms top-ranking competitors target that your page is missing.
                  </p>
                </SpotlightCard>

                {/* Pillar 2: Heading Structure (H1–H6) */}
                <SpotlightCard
                  variant="cyan"
                  className="h-full"
                  innerClassName="p-5 sm:p-6 flex flex-col justify-start space-y-3 flex-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Heading Structure (H1–H6)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Map outline hierarchies side-by-side to fix skipped levels, resolve duplicate H1s, and match competitor content depth.
                  </p>
                </SpotlightCard>

                {/* Pillar 3: Google SERP Pixel Preview */}
                <SpotlightCard
                  variant="emerald"
                  className="h-full"
                  innerClassName="p-5 sm:p-6 flex flex-col justify-start space-y-3 flex-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20 group-hover:scale-105 transition-transform">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Google SERP Pixel Preview
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Simulate desktop and mobile SERP title boundaries in real time to prevent truncated headlines and awkward ellipses.
                  </p>
                </SpotlightCard>

                {/* Pillar 4: Page Speed & Technical Health */}
                <SpotlightCard
                  variant="purple"
                  className="h-full"
                  innerClassName="p-5 sm:p-6 flex flex-col justify-start space-y-3 flex-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Page Speed &amp; Technical Health
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Benchmark server latency (TTFB), document size, canonical directives, and Core Web Vitals against rival pages.
                  </p>
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
                          text: 'Unlike generative AI tools that synthesize approximate summaries, AnalyzeSERP inspects real-time source code directly in under 500 milliseconds—returning exact structural tags, heading hierarchies, and word counts with zero synthetic guesswork.',
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
                        name: 'How does the keyword gap matrix calculate missing phrases?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'Our engine analyzes full text from all audited URLs and extracts single words, two-word combinations, and three-word phrases. It calculates keyword frequency across all competitor pages and highlights terms that appear repeatedly across top-ranking rivals but are missing or underutilized on your page.',
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
                      'Unlike generative AI tools that synthesize approximate summaries, AnalyzeSERP inspects real-time source code directly in under 500 milliseconds—returning exact structural tags, heading hierarchies, and word counts with zero synthetic guesswork.',
                  },
                  {
                    question: 'Can I compare multiple competitor URLs side by side?',
                    answer:
                      'Yes. You can paste up to 5 URLs (your page plus 4 competitors) to benchmark title tag pixel widths, heading hierarchy depth, word volume, Flesch reading levels, and Core Web Vitals side by side in a synchronized comparison matrix.',
                  },
                  {
                    question: 'How does the keyword gap matrix calculate missing phrases?',
                    answer:
                      'Our engine analyzes full text from all audited URLs and extracts single words, two-word combinations, and three-word phrases. It calculates the frequency across all competitor pages and highlights terms that appear repeatedly across top-ranking rivals but are absent or underutilized on your page.',
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
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Zero-Latency Single-Purpose Diagnostic Utilities
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Need an isolated check without executing a full multi-competitor SERP crawl? Launch dedicated micro-engines engineered for immediate, deterministic verification.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 bg-slate-100 dark:bg-white/[0.03] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>10 Dedicated Utilities</span>
                </div>
              </div>

              {/* Segmented Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Tool Categories">
                {TOOL_CATEGORIES.map((tab) => {
                  const isSelected = selectedToolCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedToolCategory(tab.id as ToolCategory)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-semibold shadow-xs'
                          : 'bg-slate-100/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-200/60 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? 'bg-emerald-500/25 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-slate-200/70 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {filteredTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={`p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] ${tool.hoverBorder} hover:bg-white dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md`}
                    >
                      <div className="space-y-2">
                        <div
                          className={`w-8 h-8 rounded-lg ${tool.iconBg} ${tool.iconText} flex items-center justify-center border ${tool.iconBorder} group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4
                            className={`text-xs font-bold text-slate-800 dark:text-slate-100 ${tool.hoverText} transition-colors`}
                          >
                            {tool.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 ${tool.hoverText} transition-colors`}
                      >
                        <span>{tool.actionText}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Reassurance Ribbon */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Fast, live HTML analysis &bull; Zero third-party telemetry &bull; 100% Free Public Beta</span>
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
