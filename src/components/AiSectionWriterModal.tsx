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
  FileText,
  HelpCircle,
  ListOrdered,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { ContentSectionResult } from '@/lib/gemini';

interface AiSectionWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  targetKeyword: string;
  sectionHeading?: string;
  context?: string;
}

export const AiSectionWriterModal: React.FC<AiSectionWriterModalProps> = ({
  isOpen,
  onClose,
  topic,
  targetKeyword,
  sectionHeading,
  context,
}) => {
  const { data: session, update: updateSession } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContentSectionResult | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(
    session?.user?.credits?.remainingCredits ?? null
  );
  const [copied, setCopied] = useState(false);

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
            type: 'section-writer',
            topic,
            targetKeyword,
            sectionHeading,
            context,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn('[AiSectionWriterModal] Failed to save pending section modal state:', e);
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
          type: 'content-section',
          topic,
          targetKeyword,
          sectionHeading,
          context,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresAuth) {
          triggerAuthModal();
          return;
        }
        throw new Error(data.error || 'Failed to generate content section');
      }

      setResult(data.data as ContentSectionResult);
      if (data.credits?.remaining !== undefined) {
        setRemainingCredits(data.credits.remaining);
      }
      updateSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error generating content section.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = (markdown: string) => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-writer-title"
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
            aria-label="Close AI section writer modal"
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>AI EEAT Section Writer</span>
              </div>
              <h3 id="ai-writer-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                SEO Section Copy &amp; FAQ Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Target Keyword: <strong className="text-slate-800 dark:text-slate-200 font-mono">{targetKeyword}</strong>
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

          {/* Context box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 text-xs space-y-1">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Section Topic: </span>
            <span className="text-slate-800 dark:text-slate-200">{topic}</span>
            {sectionHeading && (
              <div>
                <span className="font-semibold text-slate-600 dark:text-slate-400">Heading: </span>
                <span className="text-slate-700 dark:text-slate-300">{sectionHeading}</span>
              </div>
            )}
          </div>

          {/* Sign In Banner if unauthenticated */}
          {!session && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 font-medium">
                  Sign in with Google or GitHub to unlock <strong>5 daily AI section drafts</strong>.
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

          {/* Generated Result */}
          {result && (
            <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1 text-xs">
              {/* Heading */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Suggested Heading
                </span>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {result.suggestedHeading}
                </h4>
              </div>

              {/* Content Markdown Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>EEAT-Optimized Section Copy (Markdown)</span>
                  </span>
                  <button
                    onClick={() => handleCopyMarkdown(result.contentMarkdown)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {result.contentMarkdown}
                </div>
              </div>

              {/* Key Takeaways */}
              {result.keyTakeaways?.length > 0 && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Key Takeaways</span>
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                    {result.keyTakeaways.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* FAQs */}
              {result.suggestedFaqs?.length > 0 && (
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>People Also Ask (FAQ Schema Ready)</span>
                  </span>
                  <div className="space-y-2">
                    {result.suggestedFaqs.map((faq, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-1">
                        <strong className="text-slate-800 dark:text-slate-100 block">{faq.question}</strong>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
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
                  <span>Drafting Section (Gemini)...</span>
                </>
              ) : result ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate (1 Credit)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft Section with AI (1 Credit)</span>
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
        featureTitle="AI Section Copywriter"
      />
    </>
  );

  return createPortal(modalContent, document.body);
};
