'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  AlertTriangle,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Bug,
  HelpCircle,
} from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log client error to console in production and telemetry
    console.error('App Router Uncaught Boundary Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col justify-center items-center">
        <div className="glass-panel border border-red-500/20 dark:border-red-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 w-full shadow-lg relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-28 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Warning Icon Badge */}
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
            <AlertTriangle className="size-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <span>Application Error</span>
              {error.digest && <span>• ID: {error.digest.slice(0, 8)}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Something went wrong
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              An unexpected runtime exception occurred while processing this component. Your existing session data and browser preferences remain intact.
            </p>
          </div>

          {/* Recovery Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="size-4" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all border border-slate-200 dark:border-white/10 active:scale-95 cursor-pointer"
            >
              <Home className="size-4" />
              <span>Return to Homepage</span>
            </Link>
          </div>

          {/* Collapsible Diagnostic Details for Debugging */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <Bug className="size-3.5" />
              <span>{showDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}</span>
              {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            {showDetails && (
              <div className="mt-3 p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 overflow-x-auto border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span>Diagnostic Trace</span>
                  {error.digest && <span>Digest: {error.digest}</span>}
                </div>
                <p className="text-red-400 whitespace-pre-wrap break-words">
                  {error.message || 'No explicit error message provided by runtime.'}
                </p>
                {error.stack && (
                  <pre className="text-[10px] text-slate-500 overflow-x-auto pt-2 border-t border-slate-800">
                    {error.stack.split('\n').slice(0, 6).join('\n')}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Help Note */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 flex items-center gap-1.5">
          <HelpCircle className="size-3.5 text-emerald-500" />
          <span>If this issue persists, please report it via our in-app feedback trigger.</span>
        </p>
      </main>

      <Footer />
    </div>
  );
}
