'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CompetitorWorkspace } from '@/components/CompetitorWorkspace';
import { AuditSkeleton } from '@/components/AuditSkeleton';
import { BatchAuditResponse, SinglePageAudit, KeywordGapAnalysis } from '@/types/seo';
import { analyzeKeywordGaps } from '@/lib/keyword-gap';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';
import { autoCaptureSnapshot } from '@/lib/audit-snapshot-manager';
import { normalizeUrl, isValidUrl } from '@/lib/url-utils';
import {
  Search,
  Plus,
  Trash2,
  Zap,
  AlertCircle,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileEdit,
  RefreshCw,
} from 'lucide-react';

const ACTIVE_AUDIT_STORAGE_KEY = 'analyzeserp_active_audit_session';

interface PersistedAuditSession {
  urls: string[];
  targetKeyword: string;
  auditResponse: BatchAuditResponse;
  keywordGapAnalysis: KeywordGapAnalysis | null;
  savedAt: number;
}

function AuditWorkspaceClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [urls, setUrls] = useState<string[]>(['']);
  const [targetKeyword, setTargetKeyword] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResponse, setAuditResponse] = useState<BatchAuditResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});
  const [isEditDockOpen, setIsEditDockOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewingSnapshotInfo, setViewingSnapshotInfo] = useState<{
    id: string | number;
    label: string;
    date: string;
  } | null>(null);

  // Parse URLs from query parameter (comma-separated)
  const getQueryUrls = useCallback((): string[] => {
    const rawUrls = searchParams.get('urls');
    if (!rawUrls) return [];
    return rawUrls
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
  }, [searchParams]);

  const queryKeyword = searchParams.get('keyword') || '';

  // Core audit execution function
  const runAudit = useCallback(
    async (urlsToAudit: string[], keyword: string = '') => {
      const rawUrls = urlsToAudit.map((u) => u.trim()).filter(Boolean);
      if (rawUrls.length === 0) {
        setErrorMsg('Please enter at least 1 valid URL to run the audit.');
        return;
      }

      const invalidList: string[] = [];
      const normalizedUrls: string[] = [];
      for (const u of rawUrls) {
        if (!isValidUrl(u)) {
          invalidList.push(u);
        } else {
          normalizedUrls.push(normalizeUrl(u));
        }
      }

      if (invalidList.length > 0) {
        setErrorMsg(`Invalid URL format: "${invalidList[0]}". Please enter a valid web domain or URL (e.g. example.com or https://example.com).`);
        return;
      }

      setIsAuditing(true);
      setErrorMsg(null);

      try {
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            urls: normalizedUrls,
            keyword: keyword.trim() || undefined,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Server error running competitor audit.');
        }

        const data: BatchAuditResponse = await res.json();
        setAuditResponse(data);
        setIsEditDockOpen(false);

        const successfulAudits = data.results.filter((r) => r.status === 'success');
        let gapAnalysis: KeywordGapAnalysis | null = null;
        if (successfulAudits.length >= 2) {
          gapAnalysis = analyzeKeywordGaps(successfulAudits);
        }

        // Persist session
        try {
          const sessionPayload: PersistedAuditSession = {
            urls: normalizedUrls,
            targetKeyword: keyword.trim(),
            auditResponse: data,
            keywordGapAnalysis: gapAnalysis,
            savedAt: Date.now(),
          };
          localStorage.setItem(ACTIVE_AUDIT_STORAGE_KEY, JSON.stringify(sessionPayload));

          // Auto-capture baseline snapshot for target URL
          if (successfulAudits.length > 0) {
            autoCaptureSnapshot(successfulAudits[0], keyword.trim());
          }
        } catch (e) {}

        triggerToolExecutionFeedback();
      } catch (err: any) {
        console.error('[Audit] Failed to execute competitor audit:', err);
        setErrorMsg(err.message || 'Failed to complete competitor audit. Please retry.');
      } finally {
        setIsAuditing(false);
      }
    },
    []
  );

  // Dynamic client document title based on active audit URLs
  useEffect(() => {
    const validUrls = urls.map((u) => u.trim()).filter(Boolean);
    if (validUrls.length > 1) {
      const displayUrls = validUrls.map((u) => {
        try {
          return new URL(normalizeUrl(u)).hostname.replace(/^www\./, '');
        } catch {
          return u;
        }
      });
      document.title = `Audit: ${displayUrls.join(' vs ')} | AnalyzeSERP`;
    } else if (validUrls.length === 1) {
      try {
        const host = new URL(normalizeUrl(validUrls[0])).hostname.replace(/^www\./, '');
        document.title = `Audit: ${host} | AnalyzeSERP`;
      } catch {
        document.title = `Audit: ${validUrls[0]} | AnalyzeSERP`;
      }
    } else {
      document.title = 'Competitor SEO Audit Report | AnalyzeSERP';
    }
  }, [urls]);

  // Initialize from Query Params or LocalStorage on mount
  useEffect(() => {
    if (isInitialized) return;
    setIsInitialized(true);

    const querySnapshotId = searchParams.get('snapshotId');
    if (querySnapshotId) {
      setIsAuditing(true);
      setErrorMsg(null);
      fetch(`/api/audit/snapshots?id=${encodeURIComponent(querySnapshotId)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && (json.snapshot?.parsed?.results || json.snapshot?.parsed?.audit)) {
            const snap = json.snapshot.parsed;
            if (snap.results && Array.isArray(snap.results) && snap.results.length > 0) {
              // Version 2: Multi-URL Competitor Workspace restoration
              const restoredUrls =
                Array.isArray(snap.urls) && snap.urls.length > 0
                  ? snap.urls
                  : snap.results.map((r: SinglePageAudit) => r.url);
              setUrls(restoredUrls);
              setTargetKeyword(snap.targetKeyword || '');
              setAuditResponse({
                timestamp: new Date(snap.timestamp || Date.now()).toISOString(),
                totalUrls: snap.results.length,
                results: snap.results,
              });
            } else if (snap.audit) {
              // Legacy Version 1: Single-URL restoration
              setUrls([snap.url]);
              setTargetKeyword(snap.targetKeyword || '');
              setAuditResponse({
                timestamp: new Date(snap.timestamp || Date.now()).toISOString(),
                totalUrls: 1,
                results: [snap.audit],
              });
            }
            setViewingSnapshotInfo({
              id: json.snapshot.id,
              label: json.snapshot.label || 'Saved Snapshot',
              date: new Date(json.snapshot.created_at || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            });
          } else {
            setErrorMsg('Could not find or load the requested saved snapshot.');
          }
        })
        .catch(() => {
          setErrorMsg('Failed to restore saved snapshot from cloud database.');
        })
        .finally(() => setIsAuditing(false));
      return;
    }

    const queryUrls = getQueryUrls();
    const queryKw = queryKeyword.trim();

    if (queryUrls.length > 0) {
      setUrls(queryUrls);
      setTargetKeyword(queryKw);

      // Check if localStorage already has the exact same audit cached
      try {
        const savedSession = localStorage.getItem(ACTIVE_AUDIT_STORAGE_KEY);
        if (savedSession) {
          const parsed: PersistedAuditSession = JSON.parse(savedSession);
          const isSameUrls =
            parsed.urls.length === queryUrls.length &&
            parsed.urls.every((u, i) => u === queryUrls[i]);
          const isFresh = Date.now() - parsed.savedAt < 24 * 60 * 60 * 1000;

          if (isSameUrls && isFresh && parsed.auditResponse?.results?.length > 0) {
            setAuditResponse(parsed.auditResponse);
            return;
          }
        }
      } catch (e) {}

      // Otherwise, execute fresh audit
      runAudit(queryUrls, queryKw);
    } else {
      // No query params: check if active session exists in localStorage
      try {
        const savedSession = localStorage.getItem(ACTIVE_AUDIT_STORAGE_KEY);
        if (savedSession) {
          const parsed: PersistedAuditSession = JSON.parse(savedSession);
          if (parsed.auditResponse?.results?.length > 0 && parsed.urls?.length > 0) {
            setUrls(parsed.urls);
            setTargetKeyword(parsed.targetKeyword || '');
            setAuditResponse(parsed.auditResponse);
          }
        }
      } catch (e) {}
    }
  }, [getQueryUrls, queryKeyword, isInitialized, runAudit]);

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

  const addUrlInput = () => {
    if (urls.length >= 5) {
      setErrorMsg('Public Beta supports up to 5 URLs per comparison run for optimal crawl performance.');
      return;
    }
    setUrls([...urls, '']);
  };

  const removeUrlInput = (index: number) => {
    if (urls.length <= 1) return;
    const updated = urls.filter((_, i) => i !== index);
    setUrls(updated);
    if (fieldErrors[index]) {
      const updatedErrors = { ...fieldErrors };
      delete updatedErrors[index];
      setFieldErrors(updatedErrors);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const trimmedUrls = urls.map((u) => u.trim());
    const newFieldErrors: Record<number, string> = {};

    // 1. Target URL (index 0) is mandatory
    if (!trimmedUrls[0]) {
      newFieldErrors[0] = 'Please enter your Target page URL.';
    }

    // 2. Validate URL formats
    const normalizedMap: Record<number, string> = {};
    trimmedUrls.forEach((u, idx) => {
      if (idx === 0 && !u) return;
      if (u) {
        if (!isValidUrl(u)) {
          newFieldErrors[idx] = 'Invalid URL (e.g. example.com or https://example.com)';
        } else {
          normalizedMap[idx] = normalizeUrl(u);
        }
      }
    });

    // 3. Validate Duplicates: Target vs Competitor
    const targetNormalized = normalizedMap[0];
    Object.entries(normalizedMap).forEach(([idxStr, normUrl]) => {
      const idx = Number(idxStr);
      if (idx > 0 && targetNormalized && normUrl.toLowerCase() === targetNormalized.toLowerCase()) {
        newFieldErrors[idx] = 'Competitor URL cannot be identical to Target URL.';
      }
    });

    // 4. Validate Duplicates: Competitor vs Competitor
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
      setErrorMsg('Please correct the highlighted URL fields before re-running the audit.');
      return;
    }

    const finalUrls = Object.values(normalizedMap);
    if (finalUrls.length === 0) {
      setErrorMsg('Please enter at least 1 valid URL to run the audit.');
      return;
    }

    setUrls(finalUrls);
    const newQuery = new URLSearchParams();
    newQuery.set('urls', finalUrls.join(','));
    if (targetKeyword.trim()) {
      newQuery.set('keyword', targetKeyword.trim());
    }
    router.push(`/audit?${newQuery.toString()}`);

    runAudit(finalUrls, targetKeyword);
  };

  const handleTrySample = () => {
    const sampleUrls = ['https://analyzeserp.com', 'https://vercel.com'];
    const sampleKw = 'seo competitor analysis tool';
    setUrls(sampleUrls);
    setTargetKeyword(sampleKw);
    setErrorMsg(null);
    router.push(`/audit?urls=${encodeURIComponent(sampleUrls.join(','))}&keyword=${encodeURIComponent(sampleKw)}`);
    runAudit(sampleUrls, sampleKw);
  };

  const handleClearAndNew = () => {
    setAuditResponse(null);
    setUrls(['']);
    setTargetKeyword('');
    setErrorMsg(null);
    try {
      localStorage.removeItem(ACTIVE_AUDIT_STORAGE_KEY);
    } catch (e) {}
    router.push('/#hero-audit-dock');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Navigation Breadcrumb Bar with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/[0.04] text-xs">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3 text-slate-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Competitor SEO Audit Report
            </span>
          </nav>

          {auditResponse && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsEditDockOpen(!isEditDockOpen)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-all border border-slate-200/60 dark:border-white/[0.06] cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5 text-emerald-500" />
                <span>{isEditDockOpen ? 'Close URL Editor' : 'Edit URLs'}</span>
                {isEditDockOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleClearAndNew}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-200/60 dark:border-white/[0.06] cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>New Audit</span>
              </button>
            </div>
          )}
        </div>

        {/* Saved Snapshot Historical Notice Banner */}
        {viewingSnapshotInfo && (
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="size-2 rounded-full bg-indigo-500 shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Viewing Historical Snapshot:
                </span>{' '}
                <span className="font-mono text-indigo-700 dark:text-indigo-300">
                  {viewingSnapshotInfo.label} ({viewingSnapshotInfo.date})
                </span>
                <span className="hidden md:inline ml-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  • Instant Restoration • 0 Quota Used
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => runAudit(urls, targetKeyword)}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
              >
                <RotateCcw className="size-3" />
                <span>Re-audit Live Webpage</span>
              </button>
              <Link
                href="/dashboard"
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200/60 dark:border-white/[0.06] transition-all"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Collapsible Edit URLs Dock */}
        {isEditDockOpen && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-500" />
                  <span>Adjust Competitor URLs &amp; Re-run Benchmark</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your target page or competitor list. The workspace will recalculate all keyword gaps and matrix signals.
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 pt-1">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <label htmlFor="audit-edit-keyword" className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Optional Focus Keyword
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Highlights keyword gaps; does not alter crawled URLs
                  </span>
                </div>
                <input
                  id="audit-edit-keyword"
                  type="text"
                  placeholder="e.g. seo competitor analysis tool"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Target Page &amp; Competitor URLs (Max 5)
                </span>
                {urls.map((url, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 w-24 text-center shrink-0">
                        {idx === 0 ? 'TARGET' : `COMP #${idx}`}
                      </span>
                      <label htmlFor={`audit-edit-url-${idx}`} className="sr-only">
                        {idx === 0 ? 'Target Page URL' : `Competitor ${idx} Page URL`}
                      </label>
                      <input
                        id={`audit-edit-url-${idx}`}
                        type="text"
                        aria-label={idx === 0 ? 'Target Page URL' : `Competitor ${idx} Page URL`}
                        aria-invalid={Boolean(fieldErrors[idx])}
                        aria-describedby={fieldErrors[idx] ? `audit-field-error-${idx}` : undefined}
                        value={url}
                        onChange={(e) => handleUrlChange(idx, e.target.value)}
                        onBlur={() => handleUrlBlur(idx)}
                        placeholder={
                          idx === 0
                            ? 'https://yourdomain.com/landing-page'
                            : `https://competitor-${idx}.com/ranking-page`
                        }
                        className={`flex-1 px-3 py-2 rounded-xl glass-input text-xs font-mono ${
                          fieldErrors[idx]
                            ? 'border-red-500/80 dark:border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : ''
                        }`}
                      />
                      {urls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrlInput(idx)}
                          aria-label={`Remove URL ${idx + 1}`}
                          className="min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-500/10 dark:text-slate-400 dark:hover:text-red-400 transition-colors shrink-0 cursor-pointer active:scale-95"
                          title={`Remove URL ${idx + 1}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    {fieldErrors[idx] && (
                      <p
                        id={`audit-field-error-${idx}`}
                        role="alert"
                        className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5 pl-1 pt-0.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors[idx]}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div id="audit-edit-error-msg" role="alert" aria-live="polite" className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={addUrlInput}
                  disabled={urls.length >= 5}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Add URL</span>
                </button>

                <button
                  type="submit"
                  disabled={isAuditing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Re-Auditing...</span>
                    </>
                  ) : (
                    <>
                      <Search className="size-3.5" />
                      <span>Apply Changes &amp; Re-Analyze</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Global Audit Error Alert Banner when results exist */}
        {errorMsg && !isEditDockOpen && auditResponse && auditResponse.results.length > 0 && (
          <div role="alert" aria-live="polite" className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-700 dark:text-red-400 flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="size-4 shrink-0 text-red-500" />
              <span className="font-medium truncate">{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditDockOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-700 dark:text-red-300 font-semibold text-[11px] shrink-0 transition-colors cursor-pointer"
            >
              Edit URLs
            </button>
          </div>
        )}

        {/* Audit Workspace or Loading or Error Recovery or Empty State */}
        {isAuditing ? (
          <div className="py-4">
            <AuditSkeleton urls={urls} targetKeyword={targetKeyword} />
          </div>
        ) : errorMsg && (!auditResponse || auditResponse.results.length === 0) ? (
          /* Actionable Error Recovery State */
          <div className="py-10 text-center space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
            <div className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="size-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Audit Benchmark Incomplete
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                {errorMsg}
              </p>
            </div>

            {/* Diagnostic helper tips based on error category */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-left text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider font-mono">
                Troubleshooting Recommendations:
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>Verify that the URLs are accessible in your browser without requiring authentication.</li>
                <li>Check if bot protection firewalls (e.g. Cloudflare / WAF) are blocking automated crawls.</li>
                <li>Ensure full domain protocol is specified (e.g. <code className="font-mono text-emerald-600 dark:text-emerald-400">https://example.com</code>).</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsEditDockOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <FileEdit className="size-3.5" />
                <span>Adjust &amp; Edit URLs</span>
              </button>

              <button
                type="button"
                onClick={() => runAudit(urls, targetKeyword)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 transition-all border border-slate-200 dark:border-white/10 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Retry Audit</span>
              </button>

              <button
                type="button"
                onClick={handleTrySample}
                className="px-4 py-2.5 rounded-xl text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>Try Known Working Sample</span>
              </button>
            </div>
          </div>
        ) : auditResponse && auditResponse.results.length > 0 ? (
          <CompetitorWorkspace
            results={auditResponse.results}
            targetUrl={urls.map((u) => u.trim()).filter(Boolean)[0]}
            targetKeyword={targetKeyword.trim() || undefined}
            urls={urls}
            initialOpenDiff={searchParams.get('openDiff') === 'true'}
            onStartNewAudit={handleClearAndNew}
            onEditUrls={() => setIsEditDockOpen((prev) => !prev)}
          />
        ) : (
          /* Empty State: Onboarding Checklist & Launchpad */
          <div className="py-8 sm:py-12 text-center space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
            <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <Search className="size-7" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Ready to Benchmark Your SERP Competitors
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Compare your webpage against up to 4 ranking competitors to pinpoint content gaps, missing heading subtopics, keyword deficits, and Core Web Vitals opportunities.
              </p>
            </div>

            {/* 4-Step How It Works Checklist Card */}
            <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-200/90 dark:border-white/10 text-left space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  How Competitor Benchmarking Works
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  4 Easy Steps
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Set Target URL
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      The page on your domain you want to optimize and rank higher.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Add 1–4 Competitors
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      The top ranking URLs currently winning organic visibility.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Optional Focus Query
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      Calibrates intent match and phrase density gap recommendations.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Execute &amp; Export
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      Generate side-by-side matrices, action items, and white-label PDFs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsEditDockOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Open URL Dock &amp; Start Audit</span>
              </button>

              <button
                type="button"
                onClick={handleTrySample}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 transition-all border border-slate-200 dark:border-white/10 active:scale-95 cursor-pointer"
              >
                <Sparkles className="size-3.5 text-emerald-500" />
                <span>Try Live Sample: AnalyzeSERP vs Vercel</span>
              </button>

              <Link
                href="/"
                className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold text-xs transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12">
            <AuditSkeleton />
          </main>
          <Footer />
        </div>
      }
    >
      <AuditWorkspaceClient />
    </Suspense>
  );
}
