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
  Target,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { TopicalGapBlueprintResult } from '@/lib/gemini';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { broadcastCreditUpdate } from '@/lib/credit-events';

interface AiTopicalGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  targetTitle?: string;
  targetDescription?: string;
  targetHeadings?: string[];
  competitorUrls?: string[];
  missingKeywords: string[];
  searchIntent?: string;
}

export const AiTopicalGapModal: React.FC<AiTopicalGapModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
  targetTitle,
  targetDescription,
  targetHeadings,
  competitorUrls,
  missingKeywords,
  searchIntent,
}) => {
  const { data: session, update: updateSession } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TopicalGapBlueprintResult | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(
    session?.user?.credits?.remainingCredits ?? null
  );
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedFaq, setCopiedFaq] = useState(false);
  const modalRef = useFocusTrap({ isOpen, onClose });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const triggerAuthModal = () => {
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
          type: 'topical-gap-blueprint',
          targetUrl,
          targetTitle,
          targetDescription,
          targetHeadings,
          competitorUrls,
          missingKeywords: missingKeywords.slice(0, 15),
          searchIntent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresAuth) {
          triggerAuthModal();
          return;
        }
        throw new Error(data.error || 'Failed to generate Topical Gap Blueprint');
      }

      setResult(data.data as TopicalGapBlueprintResult);
      if (data.credits?.remaining !== undefined) {
        setRemainingCredits(data.credits.remaining);
        broadcastCreditUpdate(data.credits);
      }
      updateSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error generating blueprint.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = (markdown: string) => {
    navigator.clipboard.writeText(markdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleCopyFaqs = () => {
    if (!result?.peopleAlsoAskFaqs) return;
    const faqText = result.peopleAlsoAskFaqs
      .map((f) => `### ${f.question}\n${f.answer}`)
      .join('\n\n');
    navigator.clipboard.writeText(faqText);
    setCopiedFaq(true);
    setTimeout(() => setCopiedFaq(false), 2000);
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
          aria-labelledby="ai-blueprint-title"
          className="relative w-full max-w-4xl rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-white/15 shadow-2xl space-y-6 bg-white dark:bg-slate-900 my-auto max-h-[94vh] overflow-y-auto modal-scroll text-slate-800 dark:text-slate-100 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close AI modal"
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                <Sparkles className="size-3 text-emerald-500" />
                <span>AI Topical Gap &amp; Entity Blueprint</span>
              </div>
              <h3 id="ai-blueprint-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Topical Authority Masterplan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Strategic on-page expansion for <strong className="text-slate-800 dark:text-slate-200 font-mono">{getHostname(targetUrl)}</strong>
              </p>
            </div>

            {session && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start sm:self-auto shrink-0">
                <Zap className="size-3.5 text-amber-500 fill-amber-500" />
                <span>
                  {remainingCredits !== null ? remainingCredits : session.user?.credits?.remainingCredits ?? 5} / 5 Credits
                </span>
              </div>
            )}
          </div>

          {/* Context Overview Box */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Target Page</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {targetTitle || getHostname(targetUrl)}
                </span>
              </div>
              {searchIntent && (
                <div className="shrink-0">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block sm:text-right">Intent Focus</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{searchIntent}</span>
                </div>
              )}
            </div>

            {/* Target Entities to be clustered */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Top Missing Competitor Gaps Clustered Together:</span>
                <span className="font-mono text-[11px] text-slate-500">{missingKeywords.slice(0, 12).length} entities</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingKeywords.slice(0, 12).map((k, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  >
                    {k}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                Rather than spending credits on individual words, this blueprint analyzes all missing entities collectively within your domain niche to craft ready-to-publish content.
              </p>
            </div>
          </div>

          {/* Sign In Banner if unauthenticated */}
          {!session && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 font-medium">
                  Sign in with Google or GitHub to unlock <strong>5 daily AI credits</strong>.
                </span>
              </div>
              <button
                type="button"
                onClick={triggerAuthModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Sign In Free
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated High-Value Deliverable */}
          {result && (
            <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-1 text-xs">
              {/* 1. Executive Gap Diagnosis */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Executive Gap Diagnosis</span>
                  </span>
                  {result.targetNicheIdentified && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      Niche: {result.targetNicheIdentified}
                    </span>
                  )}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {result.executiveSummary}
                </p>
              </div>

              {/* 2. Comprehensive EEAT Section Draft */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Ready-to-Publish EEAT Section Copy
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyMarkdown(result.recommendedSection.contentMarkdown)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto text-xs"
                  >
                    {copiedMarkdown ? (
                      <>
                        <Check className="size-3.5 text-emerald-500" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/60 space-y-3">
                  <div className="border-b border-slate-200/70 dark:border-white/10 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Suggested H2 Heading</span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {result.recommendedSection.suggestedH2}
                    </h4>
                  </div>

                  <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-xs font-sans">
                    {result.recommendedSection.contentMarkdown}
                  </div>

                  {result.recommendedSection.entitiesIntegrated?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-white/10 flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Integrated Entities:</span>
                      {result.recommendedSection.entitiesIntegrated.map((e, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono border border-emerald-200 dark:border-emerald-900">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. In-Context Entity Placement Matrix */}
              {result.inContextInsertions?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      In-Context Semantic Entity Placements
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {result.inContextInsertions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-xs">
                            {item.targetEntity}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Location: <strong>{item.suggestedPlacement}</strong>
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic border-l-2 border-emerald-500 pl-2.5">
                          &ldquo;{item.exampleSentence}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. People Also Ask FAQ Schema Block */}
              {result.peopleAlsoAskFaqs?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        High-Intent FAQ &amp; Schema Answers
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyFaqs}
                      className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/10 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedFaq ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      <span>{copiedFaq ? 'Copied FAQs' : 'Copy FAQs'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.peopleAlsoAskFaqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-1"
                      >
                        <strong className="text-slate-900 dark:text-slate-100 block text-xs">
                          {faq.question}
                        </strong>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                          {faq.answer}
                        </p>
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
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Synthesizing Topical Blueprint...</span>
                </>
              ) : result ? (
                <>
                  <RefreshCw className="size-3.5" />
                  <span>Regenerate Blueprint (1 Credit)</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Generate Topical Gap Blueprint (1 Credit)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        featureTitle="AI Topical Authority Blueprint"
      />
    </>
  );

  return createPortal(modalContent, document.body);
};
