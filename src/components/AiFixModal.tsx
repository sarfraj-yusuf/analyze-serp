'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  X,
  Check,
  Copy,
  Zap,
  AlertCircle,
  Loader2,
  RefreshCw,
  Code2,
  TrendingUp,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { FixRecommendationResult } from '@/lib/gemini';

interface AiFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueTitle: string;
  issueCategory: string;
  issueDescription: string;
  currentCode?: string;
  pageUrl?: string;
}

export const AiFixModal: React.FC<AiFixModalProps> = ({
  isOpen,
  onClose,
  issueTitle,
  issueCategory,
  issueDescription,
  currentCode,
  pageUrl,
}) => {
  const { data: session, update: updateSession } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FixRecommendationResult | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(
    session?.user?.credits?.remainingCredits ?? null
  );
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const triggerAuthModal = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'analyzeserp_pending_ai_modal',
          JSON.stringify({
            type: 'fix',
            issueTitle,
            issueCategory,
            issueDescription,
            currentCode,
            pageUrl,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn('[AiFixModal] Failed to save pending fix modal state:', e);
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
          type: 'fix-recommendation',
          issueTitle,
          issueCategory,
          issueDescription,
          currentCode,
          pageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresAuth) {
          triggerAuthModal();
          return;
        }
        throw new Error(data.error || 'Failed to generate AI fix guide');
      }

      setResult(data.data as FixRecommendationResult);
      if (data.credits?.remaining !== undefined) {
        setRemainingCredits(data.credits.remaining);
      }
      updateSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error generating AI fix.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const modalContent = (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-fix-title"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-white/15 shadow-2xl space-y-6 bg-white dark:bg-[#0c1220] my-auto max-h-[92vh] overflow-y-auto modal-scroll text-slate-800 dark:text-slate-100 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close AI fix modal"
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>AI Developer Fix Guide</span>
              </div>
              <h3 id="ai-fix-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {issueTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Category: <strong className="text-slate-700 dark:text-slate-300">{issueCategory}</strong>
              </p>
            </div>

            {session && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start sm:self-auto shrink-0">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>
                  {remainingCredits !== null ? remainingCredits : session.user?.credits?.remainingCredits ?? 5} / 5 Credits
                </span>
              </div>
            )}
          </div>

          {/* Issue Context Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-1 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Detected Audit Recommendation:</span>
            <p className="text-slate-700 dark:text-slate-300">{issueDescription}</p>
          </div>

          {/* Sign In Banner if unauthenticated */}
          {!session && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 font-medium">
                  Sign in with Google or GitHub to get <strong>step-by-step code fixes</strong> for this issue.
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

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Generated Content */}
          {result && (
            <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
              {/* Badges & Root Cause */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    Impact: {result.impactScore}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/50">
                    Effort: {result.effortLevel}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Root Cause Analysis</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{result.rootCause}</p>
                </div>
              </div>

              {/* Step by Step Action Checklist */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Step-by-Step Developer Remediation</span>
                </h4>
                <div className="space-y-2">
                  {result.stepByStepFix.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 text-xs flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Snippet */}
              {result.codeSnippet?.code && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{result.codeSnippet.title || 'Recommended Implementation Code'}</span>
                    </h4>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                      {result.codeSnippet.language}
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 text-slate-100">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px] font-mono text-slate-400">{result.codeSnippet.language}</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(result.codeSnippet.code)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {codeCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-emerald-400 selection:bg-emerald-500/30">
                      <code>{result.codeSnippet.code}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Business & SERP Impact */}
              {result.serpImpactExplanation && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-emerald-700 dark:text-emerald-400">Expected SERP Ranking Impact:</strong>
                    <p className="mt-0.5 leading-relaxed">{result.serpImpactExplanation}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
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
                  <span>Generating Fix Instructions (Gemini)...</span>
                </>
              ) : result ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate (1 Credit)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Code &amp; Fix Guide (1 Credit)</span>
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
        featureTitle="AI Code Fix Guide"
      />
    </>
  );

  return createPortal(modalContent, document.body);
};
