'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { signIn } from 'next-auth/react';
import {
  X,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Lock,
} from 'lucide-react';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  featureTitle = 'Free AI Co-Pilot',
}) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSignIn = async (provider: 'google' | 'github') => {
    try {
      setLoadingProvider(provider);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('analyzeserp_just_logged_in', 'true');
        } catch {
          // ignore storage error
        }
      }

      let callbackUrl = typeof window !== 'undefined' ? window.location.href : '/';
      const hasAuditResults =
        typeof document !== 'undefined' && !!document.getElementById('audit-results-container');
      const hasSavedAudit =
        typeof window !== 'undefined' &&
        !!localStorage.getItem('analyzeserp_active_audit_session');

      if ((hasAuditResults || hasSavedAudit) && !callbackUrl.includes('#audit-results-container')) {
        try {
          const urlObj = new URL(callbackUrl, window.location.origin);
          urlObj.hash = 'audit-results-container';
          callbackUrl = urlObj.toString();
        } catch {
          callbackUrl = `${callbackUrl}#audit-results-container`;
        }
      }

      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error('[Auth Error] Failed to initiate sign in:', error);
      setLoadingProvider(null);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3.5 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[430px] bg-white dark:bg-[#0c1220] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-white/10 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100 my-auto max-h-[92vh] overflow-y-auto modal-scroll animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close sign in dialog"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Visual Anchor & Header */}
        <div className="space-y-3 pr-6">
          <div className="flex items-center gap-2.5">
            <Logo variant="icon" size="md" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span>{featureTitle}</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 id="auth-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sign in to AnalyzeSERP
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect in 1 click to unlock daily Gemini AI rewrites, developer code fixes, and executive reports.
            </p>
          </div>
        </div>

        {/* Primary Action Zone: 1-Click Instant OAuth Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Google Sign In */}
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleSignIn('google')}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white hover:bg-slate-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-between gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="flex items-center gap-3">
              {loadingProvider === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{loadingProvider === 'google' ? 'Redirecting to Google...' : 'Continue with Google'}</span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
              1-Click
            </span>
          </button>

          {/* GitHub Sign In */}
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleSignIn('github')}
            className="w-full py-3 px-4 rounded-xl border border-slate-900/10 dark:border-white/10 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-between gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="flex items-center gap-3">
              {loadingProvider === 'github' ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
              ) : (
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              )}
              <span>{loadingProvider === 'github' ? 'Redirecting to GitHub...' : 'Continue with GitHub'}</span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">
              1-Click
            </span>
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="relative flex items-center justify-center pt-1">
          <div className="border-t border-slate-200/80 dark:border-white/10 w-full" />
          <span className="absolute px-2.5 bg-white dark:bg-[#0c1220] text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Free Daily Member Perks
          </span>
        </div>

        {/* Clean, Unified Value Proposition (Calm Emerald & Slate) */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="text-slate-800 dark:text-slate-200">5 Daily AI Credits: </strong>
              <span className="text-slate-600 dark:text-slate-400">Quota auto-resets every 24 hours. No subscription required.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="text-slate-800 dark:text-slate-200">1-Click SERP &amp; Meta Rewrites: </strong>
              <span className="text-slate-600 dark:text-slate-400">3 High-CTR Title and Description options with pixel width meters.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="text-slate-800 dark:text-slate-200">Developer Code Fix Guides: </strong>
              <span className="text-slate-600 dark:text-slate-400">Step-by-step copy-paste fixes for Core Web Vitals, schema, and meta tags.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="text-slate-800 dark:text-slate-200">EEAT Content Drafter: </strong>
              <span className="text-slate-600 dark:text-slate-400">Draft high-ranking section outlines with People Also Ask FAQ answers.</span>
            </div>
          </div>
        </div>

        {/* Privacy & Zero-Spam Guarantee Footer */}
        <div className="pt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>OAuth 2.0 Security · Zero Passwords</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>100% Free Forever</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
