'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import {
  FileCode,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Download,
  Layers,
  Globe,
  RefreshCw,
  X,
  Code2,
  Eye,
  BookOpen,
  ArrowUp,
  ArrowDown,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  FaqItem,
  ArticleSchemaData,
  generateFaqSchema,
  generateArticleSchema,
  generateCombinedGraphSchema,
  validateFaqSchema,
  validateArticleSchema,
  safeJsonStringify,
  formatScriptTag,
  formatReactScript,
  extractQuestionsFromHeadings,
} from '@/lib/schema-generator';
import { AuthModal } from './AuthModal';

const EMPTY_FAQS: { question: string; answer: string }[] = [];
const EMPTY_HEADINGS: { level: string; text: string }[] = [];

export interface JsonLdSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialDescription?: string;
  initialUrl?: string;
  initialKeyword?: string;
  headings?: { level: string; text: string }[];
  initialFaqs?: { question: string; answer: string }[];
}

type SchemaMode = 'FAQ' | 'ARTICLE' | 'COMBINED';
type OutputTab = 'SERP_PREVIEW' | 'CODE_HTML' | 'CODE_RAW' | 'CODE_REACT' | 'VALIDATOR';

export const JsonLdSchemaModal: React.FC<JsonLdSchemaModalProps> = ({
  isOpen,
  onClose,
  initialTitle = '',
  initialDescription = '',
  initialUrl = '',
  initialKeyword = '',
  headings = EMPTY_HEADINGS,
  initialFaqs = EMPTY_FAQS,
}) => {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const prevIsOpenRef = useRef(false);

  // Schema Mode & Output Tab
  const [mode, setMode] = useState<SchemaMode>('FAQ');
  const [activeTab, setActiveTab] = useState<OutputTab>('SERP_PREVIEW');

  // FAQ State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [expandedAccordionIdx, setExpandedAccordionIdx] = useState<number | null>(0);

  // Article State
  const [articleData, setArticleData] = useState<ArticleSchemaData>({
    headline: initialTitle,
    description: initialDescription,
    url: initialUrl,
    authorName: '',
    authorType: 'Person',
    publisherName: '',
    publisherLogoUrl: '',
    datePublished: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    imageUrl: '',
    articleType: 'Article',
  });

  // AI Generation State for single FAQ item
  const [aiGeneratingFaqId, setAiGeneratingFaqId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Copy feedback state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize FAQs strictly once when transitioning from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      if (initialFaqs && initialFaqs.length > 0) {
        setFaqs(
          initialFaqs.map((f, i) => ({
            id: `faq-${Date.now()}-${i}`,
            question: f.question,
            answer: f.answer,
          }))
        );
      } else if (headings && headings.length > 0) {
        const extracted = extractQuestionsFromHeadings(headings);
        if (extracted.length > 0) {
          setFaqs(
            extracted.slice(0, 5).map((q, i) => ({
              id: `faq-${Date.now()}-${i}`,
              question: q,
              answer: '',
            }))
          );
        } else {
          setFaqs([
            {
              id: `faq-${Date.now()}-1`,
              question: initialKeyword ? `What is ${initialKeyword}?` : 'What are the main benefits?',
              answer: '',
            },
            {
              id: `faq-${Date.now()}-2`,
              question: initialKeyword ? `How does ${initialKeyword} work?` : 'How do I get started?',
              answer: '',
            },
          ]);
        }
      } else {
        setFaqs([
          {
            id: `faq-${Date.now()}-1`,
            question: initialKeyword ? `What is ${initialKeyword}?` : 'What are the key benefits?',
            answer: '',
          },
          {
            id: `faq-${Date.now()}-2`,
            question: initialKeyword ? `How does ${initialKeyword} work?` : 'How does it work?',
            answer: '',
          },
        ]);
      }

      setArticleData({
        headline: initialTitle,
        description: initialDescription,
        url: initialUrl,
        authorName: '',
        authorType: 'Person',
        publisherName: '',
        publisherLogoUrl: '',
        datePublished: new Date().toISOString().split('T')[0],
        dateModified: new Date().toISOString().split('T')[0],
        imageUrl: '',
        articleType: 'Article',
      });
    }

    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialFaqs, headings, initialKeyword, initialTitle, initialDescription, initialUrl]);

  // Compute schemas
  const faqSchema = useMemo(() => generateFaqSchema(faqs), [faqs]);
  const articleSchema = useMemo(() => generateArticleSchema(articleData), [articleData]);
  const combinedSchema = useMemo(
    () => generateCombinedGraphSchema(articleData, faqs),
    [articleData, faqs]
  );

  const activeSchemaObject = useMemo(() => {
    if (mode === 'FAQ') return faqSchema;
    if (mode === 'ARTICLE') return articleSchema;
    return combinedSchema;
  }, [mode, faqSchema, articleSchema, combinedSchema]);

  // Validation results
  const faqValidation = useMemo(() => validateFaqSchema(faqs), [faqs]);
  const articleValidation = useMemo(() => validateArticleSchema(articleData), [articleData]);
  const activeValidation = useMemo(() => {
    if (mode === 'FAQ') return faqValidation;
    if (mode === 'ARTICLE') return articleValidation;
    // Combine for combined mode
    const combinedIssues = [...faqValidation.issues, ...articleValidation.issues];
    const avgScore = Math.round((faqValidation.score + articleValidation.score) / 2);
    return {
      isValid: faqValidation.isValid && articleValidation.isValid,
      score: avgScore,
      issues: combinedIssues,
    };
  }, [mode, faqValidation, articleValidation]);

  // Available candidate questions from headings not yet in FAQs
  const availableQuestions = useMemo(() => {
    if (!headings || headings.length === 0) return [];
    const extracted = extractQuestionsFromHeadings(headings);
    const existingQuestions = new Set(faqs.map((f) => f.question.trim().toLowerCase()));
    return extracted.filter((q) => !existingQuestions.has(q.toLowerCase()));
  }, [headings, faqs]);

  if (!isOpen || !mounted) return null;

  // FAQ handlers
  const handleAddFaq = (questionText: string = '', answerText: string = '') => {
    setFaqs((prev) => [
      ...prev,
      {
        id: `faq-${Date.now()}-${prev.length}`,
        question: questionText,
        answer: answerText,
      },
    ]);
  };

  const handleUpdateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === faqs.length - 1)
    ) {
      return;
    }
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFaqs[index];
    newFaqs[index] = newFaqs[targetIndex];
    newFaqs[targetIndex] = temp;
    setFaqs(newFaqs);
  };

  // AI Draft Answer for an FAQ Item
  const handleAiDraftAnswer = async (faqId: string, questionText: string) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (!questionText.trim()) {
      setAiError('Please enter a question first before drafting an answer.');
      return;
    }

    try {
      setAiGeneratingFaqId(faqId);
      setAiError(null);

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'section-writer',
          topic: questionText,
          targetKeyword: initialKeyword || questionText,
          sectionHeading: questionText,
          context: `Target Page Topic: ${initialTitle || initialKeyword || 'SEO Topic'}. Write a direct, authoritative, search-friendly FAQ answer (2-4 sentences, max 80 words) answering this exact question for Schema.org JSON-LD FAQPage markup.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to draft AI answer');
      }

      const generatedAnswer = data.data?.content || data.data?.summary || '';
      // Clean leading markdown headers if any
      const cleanAnswer = generatedAnswer.replace(/^#+\s.*?\n+/g, '').trim();

      handleUpdateFaq(faqId, 'answer', cleanAnswer);
    } catch (err: unknown) {
      console.error('[JsonLdSchemaModal] AI answer draft error:', err);
      setAiError(err instanceof Error ? err.message : 'Error generating AI answer');
    } finally {
      setAiGeneratingFaqId(null);
    }
  };

  // Code Copy & Download Handlers
  const getOutputText = (tab: OutputTab): string => {
    if (tab === 'CODE_HTML') {
      return formatScriptTag(activeSchemaObject);
    }
    if (tab === 'CODE_RAW') {
      return safeJsonStringify(activeSchemaObject, 2);
    }
    if (tab === 'CODE_REACT') {
      return formatReactScript(activeSchemaObject, `${mode.toLowerCase()}-schema`);
    }
    return safeJsonStringify(activeSchemaObject, 2);
  };

  const handleCopy = () => {
    const text = getOutputText(activeTab === 'SERP_PREVIEW' || activeTab === 'VALIDATOR' ? 'CODE_HTML' : activeTab);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const jsonStr = safeJsonStringify(activeSchemaObject, 2);
    const blob = new Blob([jsonStr], { type: 'application/ld+json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mode.toLowerCase()}-schema.jsonld`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Extract host from initialUrl or default
  let displayHost = 'example.com';
  try {
    if (initialUrl) {
      displayHost = new URL(initialUrl).hostname;
    }
  } catch {
    displayHost = 'example.com';
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-white/10 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  JSON-LD Schema Builder &amp; Validator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Schema.org
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Build Google-compliant structured data for rich snippet accordions and enhanced SERP visibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="hidden sm:flex items-center p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setMode('FAQ')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  mode === 'FAQ'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                FAQPage
              </button>
              <button
                type="button"
                onClick={() => setMode('ARTICLE')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  mode === 'ARTICLE'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Article / Blog
              </button>
              <button
                type="button"
                onClick={() => setMode('COMBINED')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  mode === 'COMBINED'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Combined (@graph)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Mode Switcher Bar */}
        <div className="sm:hidden px-4 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/90 flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('FAQ')}
            className={`flex-1 py-1 rounded text-center font-medium ${
              mode === 'FAQ'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            FAQPage
          </button>
          <button
            type="button"
            onClick={() => setMode('ARTICLE')}
            className={`flex-1 py-1 rounded text-center font-medium ${
              mode === 'ARTICLE'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Article
          </button>
          <button
            type="button"
            onClick={() => setMode('COMBINED')}
            className={`flex-1 py-1 rounded text-center font-medium ${
              mode === 'COMBINED'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Combined
          </button>
        </div>

        {/* Main Content Area (Dual Column Grid) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-white/10">
          
          {/* Left Column: Visual Editor (6 or 7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-0 overflow-y-auto modal-scroll p-4 sm:p-5 space-y-4">
            
            {/* FAQ Visual Editor */}
            {(mode === 'FAQ' || mode === 'COMBINED') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      FAQ Items ({faqs.length})
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Google Rich Accordions
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddFaq('', '')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {/* Question Suggestion Pills from Headings */}
                {availableQuestions.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Detected Questions from Headings ({availableQuestions.length}):</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {availableQuestions.slice(0, 4).map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddFaq(q, '')}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-1 cursor-pointer"
                          title="Click to add this question"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[200px]">{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Error Alert */}
                {aiError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{aiError}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiError(null)}
                      className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* FAQ List Cards */}
                {faqs.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                    <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      No FAQ items yet. Click <strong>&quot;Add Question&quot;</strong> or select from detected headings above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faqs.map((faq, index) => {
                      const isAiGenerating = aiGeneratingFaqId === faq.id;
                      return (
                        <div
                          key={faq.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/10 space-y-2.5 shadow-2xs group transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Question #{index + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveFaq(index, 'up')}
                                disabled={index === 0}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move question up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveFaq(index, 'down')}
                                disabled={index === faqs.length - 1}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move question down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFaq(faq.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete this FAQ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Question Input */}
                          <div>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => handleUpdateFaq(faq.id, 'question', e.target.value)}
                              placeholder="e.g. What is SEO and why is it important?"
                              className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Answer Textarea + AI Generate Button */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                Accepted Answer
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAiDraftAnswer(faq.id, faq.question)}
                                disabled={isAiGenerating || !faq.question.trim()}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Draft concise search-friendly answer with AI"
                              >
                                {isAiGenerating ? (
                                  <>
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                    <span>Drafting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>AI Draft Answer</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <textarea
                              rows={3}
                              value={faq.answer}
                              onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                              placeholder="Direct, factual answer explaining the solution in 2-3 sentences..."
                              className="w-full p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Article Visual Editor */}
            {(mode === 'ARTICLE' || mode === 'COMBINED') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Article &amp; Publisher Details
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Google Discover &amp; E-E-A-T
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Headline */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Article Headline (Max 110 chars)
                    </label>
                    <input
                      type="text"
                      value={articleData.headline}
                      onChange={(e) =>
                        setArticleData({ ...articleData, headline: e.target.value })
                      }
                      placeholder="e.g. The Complete Guide to Technical SEO in 2026"
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {articleData.headline.length} / 110 characters
                    </span>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Meta / Article Description
                    </label>
                    <textarea
                      rows={2}
                      value={articleData.description}
                      onChange={(e) =>
                        setArticleData({ ...articleData, description: e.target.value })
                      }
                      placeholder="Compelling summary explaining the article topic..."
                      className="w-full p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Canonical URL & Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Canonical Article URL
                      </label>
                      <input
                        type="url"
                        value={articleData.url}
                        onChange={(e) =>
                          setArticleData({ ...articleData, url: e.target.value })
                        }
                        placeholder="https://example.com/blog/seo-guide"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Featured Image URL
                      </label>
                      <input
                        type="url"
                        value={articleData.imageUrl || ''}
                        onChange={(e) =>
                          setArticleData({ ...articleData, imageUrl: e.target.value })
                        }
                        placeholder="https://example.com/images/cover.webp"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Author Name & Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={articleData.authorName || ''}
                        onChange={(e) =>
                          setArticleData({ ...articleData, authorName: e.target.value })
                        }
                        placeholder="e.g. Jane Doe"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Author Type
                      </label>
                      <select
                        value={articleData.authorType || 'Person'}
                        onChange={(e) =>
                          setArticleData({
                            ...articleData,
                            authorType: e.target.value as 'Person' | 'Organization',
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Person">Person</option>
                        <option value="Organization">Organization</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Date Published
                      </label>
                      <input
                        type="date"
                        value={articleData.datePublished || ''}
                        onChange={(e) =>
                          setArticleData({ ...articleData, datePublished: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Date Modified
                      </label>
                      <input
                        type="date"
                        value={articleData.dateModified || ''}
                        onChange={(e) =>
                          setArticleData({ ...articleData, dateModified: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Output, SERP Preview & Validator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/40">
            
            {/* View Tabs */}
            <div className="p-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('SERP_PREVIEW')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'SERP_PREVIEW'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>SERP Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('CODE_HTML')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'CODE_HTML'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>HTML &lt;script&gt;</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('CODE_RAW')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'CODE_RAW'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Raw JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('VALIDATOR')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'VALIDATOR'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {activeValidation.isValid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>Validator ({activeValidation.score}%)</span>
                </button>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 p-4 overflow-y-auto modal-scroll min-h-0">
              
              {/* Tab 1: Google SERP Preview */}
              {activeTab === 'SERP_PREVIEW' && (
                <div className="space-y-4">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Google Search Result Snippet Simulation</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Interactive Accordion</span>
                  </div>

                  {/* Google Search Result Card */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                    {/* Breadcrumb row */}
                    <div className="flex items-center gap-2 text-[12px] leading-tight">
                      <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
                        {displayHost.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1 text-[#202124] dark:text-[#dadce0] font-sans truncate">
                        <span className="text-[12px] font-medium">{displayHost}</span>
                        <span className="text-slate-400 dark:text-slate-600">›</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {mode === 'FAQ' ? 'faq' : 'article'}
                        </span>
                      </div>
                    </div>

                    {/* Headline / Title */}
                    <h3 className="text-base sm:text-lg font-normal text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
                      {articleData.headline || initialTitle || 'Your Page Title & Snippet Preview'}
                    </h3>

                    {/* Meta description */}
                    <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2 font-sans">
                      {articleData.description ||
                        initialDescription ||
                        'Discover comprehensive answers, insights, and evidence-based guidance in this complete walkthrough.'}
                    </p>

                    {/* FAQ Rich Result Accordions */}
                    {faqs.filter((f) => f.question.trim().length > 0).length > 0 && (
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-0.5">
                          People Also Ask / FAQ Rich Snippet:
                        </div>
                        {faqs
                          .filter((f) => f.question.trim().length > 0)
                          .map((faq, idx) => {
                            const isExpanded = expandedAccordionIdx === idx;
                            return (
                              <div
                                key={faq.id || idx}
                                className="rounded border border-slate-200/80 dark:border-slate-700/60 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 transition-all"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedAccordionIdx(isExpanded ? null : idx)
                                  }
                                  className="w-full p-2 text-left flex items-center justify-between gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                                >
                                  <span className="truncate">{faq.question}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                </button>
                                {isExpanded && (
                                  <div className="p-2.5 pt-1 text-[11px] text-[#4d5156] dark:text-[#bdc1c6] border-t border-slate-200/60 dark:border-slate-700/40 bg-white dark:bg-[#202124] leading-relaxed">
                                    {faq.answer.trim() || (
                                      <span className="italic text-slate-400">
                                        (No answer provided yet. Add an answer in the editor to preview.)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      Google displays these interactive accordion drop-downs on search results when valid <strong>FAQPage</strong> JSON-LD schema is present, increasing organic CTR significantly.
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2, 3, 4: Code Output */}
              {(activeTab === 'CODE_HTML' || activeTab === 'CODE_RAW' || activeTab === 'CODE_REACT') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>
                      {activeTab === 'CODE_HTML'
                        ? 'WordPress, Webflow & Static HTML'
                        : activeTab === 'CODE_RAW'
                        ? 'Next.js App Router metadata'
                        : 'Next.js <Script> Component'}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      UTF-8 Safe
                    </span>
                  </div>

                  <pre className="p-3 rounded-xl bg-slate-900 dark:bg-black text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[380px] border border-slate-800 select-all">
                    <code>{getOutputText(activeTab)}</code>
                  </pre>
                </div>
              )}

              {/* Tab 5: Validator */}
              {activeTab === 'VALIDATOR' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      {activeValidation.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {activeValidation.isValid
                            ? 'Google Schema Conformance Passed'
                            : 'Schema Validation Action Items'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {activeValidation.issues.length} check
                          {activeValidation.issues.length === 1 ? '' : 's'} reported
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-mono font-black text-slate-900 dark:text-white">
                        {activeValidation.score}/100
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Health Score
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {activeValidation.issues.length === 0 ? (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>All Google Rich Results criteria satisfied! Ready to publish.</span>
                      </div>
                    ) : (
                      activeValidation.issues.map((issue, idx) => {
                        let badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                        let icon = <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />;

                        if (issue.type === 'error') {
                          badgeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900';
                          icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
                        } else if (issue.type === 'warning') {
                          badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900';
                          icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
                        }

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${badgeClass}`}
                          >
                            {icon}
                            <div className="space-y-0.5">
                              <span className="font-semibold block">{issue.field}</span>
                              <p className="leading-snug">{issue.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar Footer */}
            <div className="p-3.5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download .jsonld file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">.jsonld</span>
                </button>
              </div>

              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Test with Google's official Rich Results Test tool"
              >
                <span>Google Rich Results Test</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          featureTitle="AI FAQ Answer Writer"
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};
