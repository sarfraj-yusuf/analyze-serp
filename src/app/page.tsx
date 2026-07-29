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
import { Search, Plus, Trash2, Zap, AlertCircle, Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

const MAX_FREE_DAILY_AUDITS = 5;

export default function Home() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResponse, setAuditResponse] = useState<BatchAuditResponse | null>(null);
  const [keywordGapAnalysis, setKeywordGapAnalysis] = useState<KeywordGapAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dailyAuditCount, setDailyAuditCount] = useState<number>(0);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedQuota = localStorage.getItem('daily_audit_quota');
    if (savedQuota) {
      try {
        const parsed = JSON.parse(savedQuota);
        if (parsed.date === today) {
          setDailyAuditCount(parsed.count || 0);
        } else {
          localStorage.setItem('daily_audit_quota', JSON.stringify({ date: today, count: 0 }));
        }
      } catch {
        localStorage.setItem('daily_audit_quota', JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      localStorage.setItem('daily_audit_quota', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  const incrementDailyQuota = (countAdded: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newCount = dailyAuditCount + countAdded;
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
      <title>Competitor SEO Audit | AnalyzeSERP</title>
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
            Competitor SEO Audit & <br />
            <span className="gradient-text">Outrank Top Search Results</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Enter up to 5 competitor URLs to instantly analyze title tags, meta descriptions, Flesch readability grades, TTFB latency, keyword gaps, and export white-label client PDF reports.
          </p>
        </div>

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
        {auditResponse && (
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
        )}
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
