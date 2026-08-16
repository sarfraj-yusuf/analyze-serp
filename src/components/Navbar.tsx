'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Sun, Moon, Share2, Search, Link2, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenProModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProModal }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme ? savedTheme : 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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

  return (
    <header className="sticky top-0 z-50 glass-panel border-b px-4 lg:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* AnalyzeSERP Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-900 dark:bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Analyze<span className="gradient-text font-black">SERP</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 hidden lg:block">
              Competitor Audit & Content Intelligence Suite
            </p>
          </div>
        </Link>

        {/* Multi-Page Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              pathname === '/'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Audit Suite</span>
          </Link>

          <Link
            href="/technical-health"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              pathname === '/technical-health'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Tech Health</span>
          </Link>

          <Link
            href="/serp-snippet-preview"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              pathname === '/serp-snippet-preview'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>SERP Snippet</span>
          </Link>

          <Link
            href="/blog"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all relative ${
              pathname?.startsWith('/blog')
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <span className="relative">
              Blog
              <span className="absolute -top-2.5 -right-6 px-1 py-0.2 text-[8px] font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-sm animate-pulse">
                NEW
              </span>
            </span>
          </Link>
        </nav>

        {/* Badges, Theme Toggle & Strikethrough Beta Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Strikethrough Price Anchor Button */}
          <button
            onClick={onOpenProModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-black fill-black/20" />
            <span>
              <span className="line-through opacity-75 mr-1">$19/mo</span>
              <span className="font-extrabold underline">FREE Beta</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
