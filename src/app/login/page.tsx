'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Loader2,
  Sparkles,
  Search,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  Award,
  Terminal,
  TrendingUp,
  Globe,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync theme with HTML root class on mount & check for OAuth error query param
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    if (typeof window !== 'undefined') {
      const errorParam = new URLSearchParams(window.location.search).get('error');
      if (errorParam === 'AccessDenied') {
        setAuthError('Sign-in rejected: Your account has been suspended by an administrator.');
      } else if (errorParam) {
        setAuthError('Authentication failed. Please try signing in again.');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignIn = async (provider: 'google' | 'github') => {
    try {
      setLoadingProvider(provider);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('analyzeserp_just_logged_in', 'true');
        } catch {}
      }
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err) {
      console.error('[Login] Sign in failed:', err);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-50/70 dark:bg-[#070a11] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* ======================================================== */}
      {/* LEFT COLUMN: Product Showcase & Visual Audit Preview (6 cols) */}
      {/* ======================================================== */}
      <aside className="order-2 lg:order-1 lg:col-span-6 bg-slate-100/50 dark:bg-[#080c14]/70 text-slate-800 dark:text-slate-100 relative p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-2xl">
        {/* Ambient Radial Glow for Dark Mode */}
        <div
          className="hidden dark:block pointer-events-none absolute -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-emerald-500/10 blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="hidden dark:block pointer-events-none absolute -bottom-32 -right-32 w-[440px] h-[440px] rounded-full bg-cyan-500/10 blur-[100px]"
          aria-hidden="true"
        />

        {/* Left Side: Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="AnalyzeSERP Home"
            className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          >
            <Logo size="md" variant="full" />
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>Public Beta &bull; 100% Free</span>
          </div>
        </div>

        {/* Left Side: Central Narrative & Interactive Mockup */}
        <div className="relative z-10 space-y-5 my-auto py-6 sm:py-8 max-w-xl">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-white dark:bg-white/[0.05] text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-white/10 shadow-xs">
              <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sub-500ms Deterministic Crawler</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight [letter-spacing:-0.03em] [text-wrap:balance]">
              Enterprise Competitor SEO Intelligence — Powered by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 dark:from-emerald-400 dark:via-emerald-300 dark:to-cyan-400">
                Mathematical Facts.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg [text-wrap:pretty]">
              AnalyzeSERP replaces heavy headless browsers and probabilistic LLMs with a dedicated Node.js Cheerio DOM parser. Audit up to 5 competitor URLs side-by-side with 100% deterministic precision.
            </p>
          </div>

          {/* VISUAL SERP AUDIT PREVIEW MOCKUP CARD */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-md shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-xs p-4 sm:p-4.5 space-y-3">
            {/* Mockup Browser Window Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 ml-2 truncate max-w-[150px] sm:max-w-none">
                  analyzeserp.com/audit
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>DOM AST: 342ms</span>
              </div>
            </div>

            {/* Mockup Competitor Comparison Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400">Target URL</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Score 94</span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">yoursite.com/seo-guide</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span>2,480 words</span>
                  <span>&bull;</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% H-Tree</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400">Competitor</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">Score 78</span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">rivalrank.io/seo-guide</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span>1,820 words</span>
                  <span>&bull;</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Gap: 3 Keywords</span>
                </div>
              </div>
            </div>

            {/* Mockup 3 Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
              <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-500/5 border border-emerald-200/60 dark:border-emerald-500/20">
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Keyword Overlap</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">86.4% Matched</div>
              </div>
              <div className="p-2 rounded-lg bg-cyan-50/70 dark:bg-cyan-500/5 border border-cyan-200/60 dark:border-cyan-500/20">
                <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-medium">Snippet Target</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">Pos 0 Ready</div>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-500/5 border border-indigo-200/60 dark:border-indigo-500/20">
                <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">Speed Ratio</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">+4.2x Faster</div>
              </div>
            </div>
          </div>

          {/* Founder Credential Card */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-300/80 dark:border-emerald-500/30">
              SY
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[11px] text-slate-700 dark:text-slate-300 italic leading-relaxed [text-wrap:pretty]">
                &ldquo;We engineered AnalyzeSERP for SEO specialists who value verifiable DOM facts over generative AI guesswork.&rdquo;
              </p>
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                Sarfraj Yusuf &bull; <span className="text-slate-500 dark:text-slate-400 font-normal">Founder &amp; Senior SEO Strategist</span>
              </p>
            </div>
          </div>
        </div>

        {/* Left Side: Bottom Trust Signals */}
        <div className="relative z-10 pt-4 border-t border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Google Search Central Compliant</span>
            </span>
            <span className="text-slate-400 dark:text-slate-600">&bull;</span>
            <span>Zero Telemetry Logging</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">99.9% Uptime SLA</span>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: Elevated Card Studio (6 cols)             */}
      {/* ======================================================== */}
      <main id="main-content" className="order-1 lg:order-2 lg:col-span-6 bg-slate-50/50 dark:bg-[#070a11] px-6 sm:px-8 lg:px-10 xl:px-12 pt-5 sm:pt-6 lg:pt-8 pb-8 sm:pb-10 lg:pb-12 flex flex-col justify-between">
        {/* Right Side: Top Navigation & Theme Bar */}
        <div className="flex items-center justify-between w-full max-w-[460px] mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-1.5 px-2.5 -ml-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="p-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:border-emerald-500/40 shadow-xs transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            <span>Back to Home</span>
          </Link>

          {/* Theme Switcher Toggle Button (WCAG 44x44 target area) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 shadow-xs transition-all active:scale-[0.95] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>

        {/* ELEVATED AUTHENTICATION CARD STUDIO */}
        <div className="w-full max-w-[460px] mx-auto mt-6 sm:mt-8 mb-auto py-2">
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-2xl dark:shadow-black/60 p-6 sm:p-8 xl:p-9 space-y-6">
            {/* Header Title with Mobile Logo */}
            <div className="space-y-3 text-center sm:text-left">
              {/* Show logo on mobile/tablet screens */}
              <div className="lg:hidden flex justify-center pb-1">
                <Logo size="md" variant="full" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Lock className="w-3 h-3" />
                  <span>Secure Workspace Access</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight [letter-spacing:-0.025em]">
                  Sign In to AnalyzeSERP
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed [text-wrap:pretty]">
                  Welcome back. Sign in to access your saved competitor audits, cloud snapshots &amp; daily AI credits.
                </p>
              </div>
            </div>

            {/* Error Notification Alert */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            {/* Authenticated State vs Sign In Actions */}
            {status === 'authenticated' && session?.user ? (
              session.user.status === 'suspended' ? (
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-11 h-11 rounded-xl object-cover border border-rose-500/30 shadow-xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm shadow-xs">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {session.user.name || 'User'}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300">
                          Suspended
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                    This account has been suspended by an administrator. Workspace access and tool features are locked.
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-11 h-11 rounded-xl object-cover border border-emerald-500/30 shadow-xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shadow-xs">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {session.user.name || 'Signed In User'}
                        </p>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2.5 border-t border-emerald-500/20">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Daily AI Credits:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {session.user.credits?.remainingCredits ?? 5} / {session.user.credits?.limit ?? 5} Available
                    </span>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <Link
                      href="/dashboard"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Enter SEO Workspace</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-rose-500/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {/* 1-Click OAuth Buttons */}
                <div className="space-y-3">
                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={() => handleSignIn('google')}
                    disabled={loadingProvider !== null}
                    aria-label="Sign in with Google"
                    className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/80 hover:bg-slate-100/90 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    {loadingProvider === 'google' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
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
                    <span>Continue with Google</span>
                  </button>

                  {/* GitHub Sign In Button */}
                  <button
                    type="button"
                    onClick={() => handleSignIn('github')}
                    disabled={loadingProvider !== null}
                    aria-label="Sign in with GitHub"
                    className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/80 hover:bg-slate-100/90 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    {loadingProvider === 'github' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    ) : (
                      <svg
                        className="w-4 h-4 shrink-0 fill-current text-slate-900 dark:text-white"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        />
                      </svg>
                    )}
                    <span>Continue with GitHub</span>
                  </button>
                </div>

                {/* Passwordless 1-Click Divider */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  <span className="absolute px-3 bg-white dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Passwordless &bull; 1-Click Access
                  </span>
                </div>

                {/* Security & Zero Friction Trust Points */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Immediate access to all 21 diagnostic tools &amp; snapshots</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>256-bit encrypted authentication. No passwords stored.</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>5 daily AI credits renewed automatically every 24 hours</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Bottom Legal Navigation */}
        <div className="w-full max-w-[460px] mx-auto pt-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} AnalyzeSERP.com. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-emerald-500 transition-colors">
              Terms
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-emerald-500 transition-colors">
              Privacy
            </Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-emerald-500 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
