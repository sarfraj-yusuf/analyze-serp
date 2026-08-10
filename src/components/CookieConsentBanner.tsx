'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X, ArrowRight } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has already accepted or dismissed the privacy consent
    const consentAccepted = localStorage.getItem('analyzeserp_consent_accepted');
    if (!consentAccepted) {
      // Delay display slightly for smooth page load UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('analyzeserp_consent_accepted', 'true');
    setIsVisible(false);
  };

  const handleDismissTemporary = () => {
    // Only hide for current session without saving consent to localStorage
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-5 rounded-2xl border-2 border-emerald-500/50 shadow-2xl space-y-3.5 bg-slate-900 text-white shadow-emerald-950/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Data Privacy & Usage Notice
            </h4>
          </div>

          <button
            onClick={handleDismissTemporary}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
            title="Temporarily dismiss notice"
            aria-label="Temporarily dismiss privacy notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
          We collect anonymous usage analytics and audit data to continuously improve AnalyzeSERP accuracy, keyword extraction, and speed. By using our tool, you agree to our{' '}
          <Link
            href="/privacy"
            className="text-cyan-400 font-bold underline hover:text-cyan-300 transition-colors"
          >
            Privacy Policy
          </Link>.
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/30 cursor-pointer"
          >
            <span>Accept & Continue</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
