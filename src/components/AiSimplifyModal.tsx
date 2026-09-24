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
  BookOpen,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { ReadabilityRewriteResult } from '@/lib/gemini';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface AiSimplifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  onApply: (simplifiedText: string) => void;
}

export const AiSimplifyModal: React.FC<AiSimplifyModalProps> = ({
  isOpen,
  onClose,
  text,
  onApply,
}) => {
  const { data: session, update: updateSession } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReadabilityRewriteResult | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(
    session?.user?.credits?.remainingCredits ?? null
  );
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const modalRef = useFocusTrap({ isOpen, onClose });

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
            type: 'simplify',
            text,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn('[AiSimplifyModal] Failed to save pending simplify modal state:', e);
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
          type: 'simplify-tone',
          text,
          targetGrade: '7th-8th Grade (Plain English)',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresAuth) {
          triggerAuthModal();
          return;
        }
        throw new Error(data.error || 'Failed to simplify readability tone');
      }

      setResult(data.data as ReadabilityRewriteResult);
      if (data.credits?.remaining !== undefined) {
        setRemainingCredits(data.credits.remaining);
      }
      updateSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown AI error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (content: string) => {
    onApply(content);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1000);
  };

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-simplify-title"
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 sm:p-7 space-y-5 my-8 max-h-[90vh] overflow-y-auto modal-scroll"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>Google Gemini 3.6 Flash</span>
                </span>

                {session && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Credits: <strong className="text-emerald-600 dark:text-emerald-400">{remainingCredits ?? 5}/5</strong> daily
                  </span>
                )}
              </div>

              <h3 id="ai-simplify-title" className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pt-1">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>AI Readability &amp; Plain-English Simplifier</span>
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Rewrites complex sentences and academic jargon to achieve an accessible 7th–8th grade reading level.
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Text Snippet Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Input Draft Text ({text.length} characters):
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-mono">
              &quot;{text}&quot;
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Initial State / Generation CTA */}
          {!result && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Ready to optimize reading ease?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Gemini will convert passive sentences to active voice, reduce syllable density, and produce clean web copy that satisfies Google Helpful Content standards.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !text.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 mx-auto transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Simplifying Text with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simplify Text (1 Free Credit)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result View */}
          {result && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              {/* Grade Level Shift Comparison Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Estimated Grade:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono line-through text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-white/5">
                    {result.originalGradeEstimate}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {result.newGradeEstimate}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Simplified Output Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    Simplified Plain-English Result:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(result.simplifiedText)}
                      className="px-2 py-1 rounded text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApply(result.simplifiedText)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      {applied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied to Editor!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Apply to Editor</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-sans shadow-inner">
                  {result.simplifiedText}
                </div>
              </div>

              {/* Key Improvements List */}
              {result.keyImprovements && result.keyImprovements.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Key Readability Enhancements:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.keyImprovements.map((imp, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200/70 dark:border-white/5 bg-white dark:bg-slate-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};
