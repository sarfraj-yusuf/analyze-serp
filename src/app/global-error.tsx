'use client';

import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto">
            <AlertOctagon className="size-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 inline-block">
              Critical System Error
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Application Fatal Crash
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The root application layout encountered an unexpected failure. Reloading will reinitialize the core environment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="size-4" />
              <span>Retry Session</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 cursor-pointer"
            >
              <span>Hard Reload to Home</span>
            </button>
          </div>

          {error.digest && (
            <p className="text-[11px] font-mono text-slate-500">
              Digest: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
