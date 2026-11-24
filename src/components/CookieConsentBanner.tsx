'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

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
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-3 duration-200">
      <div className="p-3 sm:py-2.5 sm:px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/5 flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-300">
            We use anonymous analytics to optimize audit accuracy. See our{' '}
            <Link
              href="/privacy"
              className="text-emerald-600 dark:text-emerald-400 font-semibold underline hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Privacy Policy
            </Link>.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleAccept}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors cursor-pointer"
          >
            Accept
          </button>
          <button
            onClick={handleDismissTemporary}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-md"
            title="Dismiss notice"
            aria-label="Dismiss privacy notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
