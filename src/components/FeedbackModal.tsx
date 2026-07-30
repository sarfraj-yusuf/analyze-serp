'use client';

import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
          hp_website: hpWebsite, // Honeypot field
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Feature Request', 'Bug Report', 'General Review', 'General Suggestion'];
  const userTypes = ['SEO Specialist', 'Content Writer', 'Agency Owner', 'Developer', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/20 shadow-2xl space-y-6 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Thank You!</h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
              Your feedback & suggestions have been stored in our database. You have officially unlocked <strong>Early Adopter Status</strong>!
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
                setMessage('');
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Back to Tools
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Public Beta Feedback & Review</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Help Us Improve AnalyzeSERP
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                AnalyzeSERP Pro (Valued at $19/month) is 100% FREE during Public Beta! Tell us what features to add next.
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

            {/* Star Rating */}
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                How would you rate AnalyzeSERP?
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      category === cat
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* User Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Your Role / Background
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full p-3 rounded-xl glass-input text-xs font-semibold focus:outline-none"
              >
                {userTypes.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Your Suggestion / Detailed Review
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What features or tools should we build next? Any bugs encountered?"
                className="w-full p-3 rounded-xl glass-input text-xs leading-relaxed focus:outline-none resize-none"
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Email Address <span className="text-slate-400 font-normal">(Optional for Early Adopter Rewards)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                className="w-full p-3 rounded-xl glass-input text-xs focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting to Database...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Review & Suggestion</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
