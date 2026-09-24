'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  X,
  Check,
  Copy,
  ArrowRight,
  Zap,
  AlertCircle,
  Loader2,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { MetaRewriteResult } from '@/lib/gemini';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface AiRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle?: string;
  currentDescription?: string;
  pageUrl?: string;
  targetKeyword?: string;
  onApplyTitle?: (newTitle: string) => void;
  onApplyDescription?: (newDescription: string) => void;
}

export const AiRewriteModal: React.FC<AiRewriteModalProps> = ({
  isOpen,
  onClose,
  currentTitle = '',
  currentDescription = '',
  pageUrl = '',
  targetKeyword = '',
  onApplyTitle,
  onApplyDescription,
}) => {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });
  const { data: session, update: updateSession } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MetaRewriteResult | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(
    session?.user?.credits?.remainingCredits ?? null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const [copiedIndex, setCopiedIndex] = useState<{ type: 'title' | 'desc'; idx: number } | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<{ type: 'title' | 'desc'; idx: number } | null>(null);

  if (!isOpen || !mounted) return null;

  const triggerAuthModal = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'analyzeserp_pending_ai_modal',
          JSON.stringify({
            type: 'rewrite',
            currentTitle,
            currentDescription,
            pageUrl,
            targetKeyword,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn('[AiRewriteModal] Failed to save pending rewrite modal state:', e);
      }
    }
    setShowAuthModal(true);
  };

  const handleGenerate = async () => {
    if (!session) {
      triggerAuthModal();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'meta-rewrite',
          title: currentTitle,
          description: currentDescription,
          targetKeyword,
          pageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresAuth) {
          triggerAuthModal();
          return;
        }
        throw new Error(data.error || 'Failed to generate AI rewrites');
      }

      setResult(data.data as MetaRewriteResult);
      if (data.credits?.remaining !== undefined) {
        setRemainingCredits(data.credits.remaining);
      }
      // Trigger session update in background to sync Navbar credit badge
      updateSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown AI error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, type: 'title' | 'desc', idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex({ type, idx });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApply = (text: string, type: 'title' | 'desc', idx: number) => {
    if (type === 'title' && onApplyTitle) {
      onApplyTitle(text);
    } else if (type === 'desc' && onApplyDescription) {
      onApplyDescription(text);
    }
    setAppliedIndex({ type, idx });
    setTimeout(() => setAppliedIndex(null), 2000);
  };

  const modalContent = (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-rewrite-title"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-3xl rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-white/15 shadow-2xl space-y-6 bg-white dark:bg-slate-900 my-auto max-h-[92vh] overflow-y-auto modal-scroll text-slate-800 dark:text-slate-100 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close AI rewrite modal"
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Gemini 3.6 Flash Optimization</span>
              </div>
              <h3 id="ai-rewrite-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                AI Meta Tags &amp; CTR Rewriter
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Generate high-ranking Title &amp; Description variations calibrated for 600px desktop SERPs.
              </p>
            </div>

            {/* Credit Counter Pill */}
            {session && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start sm:self-auto shrink-0">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>
                  {remainingCredits !== null ? remainingCredits : session.user?.credits?.remainingCredits ?? 5} / 5 Credits
                </span>
              </div>
            )}
          </div>

          {/* Current Metadata Snapshot */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Current Title: </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{currentTitle || 'None specified'}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 ml-1.5">({currentTitle.length} chars)</span>
            </div>
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Current Description: </span>
              <span className="text-slate-700 dark:text-slate-300">{currentDescription || 'None specified'}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 ml-1.5">({currentDescription.length} chars)</span>
            </div>
          </div>

          {/* Not signed in banner */}
          {!session && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 font-medium">
                  Sign in with Google or GitHub to unlock <strong>5 free daily AI rewrites</strong>.
                </span>
              </div>
              <button
                onClick={triggerAuthModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Sign In Free
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
              {/* Intent & Keyword Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-500/20">
                  Search Intent: <strong>{result.searchIntent}</strong>
                </span>
                {result.recommendedKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[11px] font-mono flex items-center gap-1 border border-slate-200/60 dark:border-white/5"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {kw}
                  </span>
                ))}
              </div>

              {/* Title Variations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span>3 AI-Optimized Titles</span>
                  <span className="text-[10px] font-normal lowercase">(target 50–60 chars)</span>
                </h4>
                <div className="space-y-2.5">
                  {result.titles.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-slate-900/40 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {t.style}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            t.length <= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {t.length} / 60 chars
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">{t.text}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400 italic">{t.rationale}</p>
                      <div className="flex items-center gap-2 pt-1">
                        {onApplyTitle && (
                          <button
                            onClick={() => handleApply(t.text, 'title', idx)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            {appliedIndex?.type === 'title' && appliedIndex.idx === idx ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Applied!</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-3 h-3" />
                                <span>Apply to Editor</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(t.text, 'title', idx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {copiedIndex?.type === 'title' && copiedIndex.idx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Variations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span>3 AI-Optimized Meta Descriptions</span>
                  <span className="text-[10px] font-normal lowercase">(target 140–160 chars)</span>
                </h4>
                <div className="space-y-2.5">
                  {result.descriptions.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-slate-900/40 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {d.style}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            d.length <= 160 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {d.length} / 160 chars
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-gray-200 leading-relaxed">{d.text}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400 italic">{d.rationale}</p>
                      <div className="flex items-center gap-2 pt-1">
                        {onApplyDescription && (
                          <button
                            onClick={() => handleApply(d.text, 'desc', idx)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            {appliedIndex?.type === 'desc' && appliedIndex.idx === idx ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Applied!</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-3 h-3" />
                                <span>Apply to Editor</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(d.text, 'desc', idx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {copiedIndex?.type === 'desc' && copiedIndex.idx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing &amp; Writing (Gemini)...</span>
                </>
              ) : result ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate (Uses 1 Credit)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate 3 AI Variations (1 Credit)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          try {
            localStorage.removeItem('analyzeserp_pending_ai_modal');
          } catch (e) {}
        }}
        featureTitle="AI Meta Tags Rewriter"
      />
    </>
  );

  return createPortal(modalContent, document.body);
};
