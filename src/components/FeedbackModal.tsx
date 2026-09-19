'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  Send,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Bug,
  BarChart3,
  MessageSquarePlus,
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'Feature Request', label: 'Feature Idea', icon: Sparkles },
  { id: 'Bug Report', label: 'Bug Report', icon: Bug },
  { id: 'Data & Metrics', label: 'Metric Request', icon: BarChart3 },
  { id: 'General Review', label: 'General Review', icon: MessageSquare },
];

const USER_ROLES = [
  'SEO Specialist',
  'Content Marketer',
  'Web Developer',
  'Agency / Consultant',
  'Site Owner / Founder',
  'Other',
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Frustrating / Needs Work',
  2: 'Below Expectations',
  3: 'Average Experience',
  4: 'Good & Productive',
  5: 'Exceptional & Fast',
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>('Feature Request');
  const [userType, setUserType] = useState<string>('SEO Specialist');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Hidden Honeypot Field for anti-spam bot protection
  const [hpWebsite, setHpWebsite] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setErrorMsg('Please enter a message of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          category,
          user_type: userType,
          message,
          email: email.trim() || null,
          hp_website: hpWebsite,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSuccess(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('has_submitted_feedback', 'true');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Outer Card with Rounded Corners and Subtle Elevation */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800 dark:text-slate-100">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          aria-label="Close feedback dialog"
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200/80 dark:border-white/[0.08]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Inner Scrollable Container with Smooth Transparent Scrollbar */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-4 modal-scroll">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Feedback Received</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Thank you for taking the time to share your thoughts. Every note is reviewed directly by our engineering team to prioritize upcoming releases.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setMessage('');
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  Back to Tools
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Clean Dialog Header */}
              <div className="space-y-1.5 pr-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <MessageSquarePlus className="w-3 h-3" />
                  <span>Product Roadmap Feedback</span>
                </div>
                <h3 id="feedback-modal-title" className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  Help Us Improve AnalyzeSERP
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Have an idea for a new tool, encountered an issue, or want a specific SEO benchmark? Let us know below.
                </p>
              </div>

              {/* HONEYPOT ANTI-SPAM FIELD (Hidden from real users) */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="hp_website"
                  tabIndex={-1}
                  value={hpWebsite}
                  onChange={(e) => setHpWebsite(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Category Pill Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Feedback Type</span>
                  <span className="text-[11px] font-normal text-slate-400">Select one</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
                            : 'bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/15'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Star Rating with Dynamic Sentiment Indicator */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Overall Experience
                  </div>
                  <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {RATING_DESCRIPTIONS[rating]}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} of 5 stars`}
                      className="p-1 text-amber-400 hover:scale-115 transition-transform focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input with Dynamic Placeholder */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Your Message</span>
                  <span className="text-[11px] font-normal text-slate-400">Minimum 5 characters</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    category === 'Bug Report'
                      ? 'What happened, which tool or URL failed, and what did you expect to see?'
                      : category === 'Feature Request'
                      ? 'What new tool or capability would make AnalyzeSERP indispensable for your workflow?'
                      : category === 'Data & Metrics'
                      ? 'What specific technical SEO metric, benchmark, or export format do you need?'
                      : 'Share your thoughts, suggestions, or experience using AnalyzeSERP...'
                  }
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                />
              </div>

              {/* Role & Email Compact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Your Role
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    {USER_ROLES.map((role) => (
                      <option key={role} value={role} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Email</span>
                    <span className="text-[11px] font-normal text-slate-400">Optional</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons Dock */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t border-slate-200/70 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer text-center"
                >
                  Dismiss
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || message.trim().length < 5}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-white/10 disabled:text-slate-400 dark:disabled:text-slate-500 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Send Feedback</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
