'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Search,
  Eye,
  FileText,
  FileCheck,
  ShieldCheck,
  Gauge,
  Route,
  Palette,
  ChevronDown,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  History,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  Layers,
  Award,
  FileEdit,
  Network,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { Logo } from './Logo';
import { LiveAnnouncementBanner } from './LiveAnnouncementBanner';
import { Tooltip } from './Tooltip';

interface ToolItem {
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface ToolCategory {
  title: string;
  description: string;
  tools: ToolItem[];
}

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    title: 'SERP & Content Intelligence',
    description: 'On-page audits, SERP appearance & content flow',
    tools: [
      {
        title: 'Competitor SEO Audit',
        href: '/',
        description: 'Comprehensive on-page, heading & competitor SERP audit',
        icon: Search,
      },
      {
        title: 'SERP Snippet & Pixel Preview',
        href: '/serp-snippet-preview',
        description: 'Pixel-accurate 600px desktop & mobile SERP simulator',
        icon: Eye,
      },
      {
        title: 'Flesch Readability Analyzer',
        href: '/readability',
        description: 'Content grading, reading ease score & sentence flow',
        icon: FileText,
      },
      {
        title: 'White-Label PDF Reports',
        href: '/pdf-reports',
        description: 'Client-ready executive audit exports with custom branding',
        icon: FileCheck,
      },
      {
        title: 'Featured Snippet Optimizer',
        href: '/featured-snippet-optimizer',
        description: 'Position 0 snippet bait studio, intent classifier & SERP simulator',
        icon: Award,
        badge: 'NEW',
      },
      {
        title: 'Live SEO Scratchpad',
        href: '/content-scratchpad',
        description: 'Real-time lexical scoring & competitor keyword checklist editor',
        icon: FileEdit,
        badge: 'NEW',
      },
    ],
  },
  {
    title: 'Technical Health & Performance',
    description: 'Server latency, Core Web Vitals & code hygiene',
    tools: [
      {
        title: 'Technical Health Audit',
        href: '/technical-health',
        description: 'Inspect TTFB, security headers, DOM depth & robots',
        icon: ShieldCheck,
      },
      {
        title: 'Site Speed & Web Vitals',
        href: '/site-speed-checker',
        description: 'LCP, CLS, INP field metrics & performance diagnostics',
        icon: Gauge,
      },
      {
        title: 'Redirect Chain Tracer',
        href: '/redirect-checker',
        description: 'Trace 301/302 multi-hop redirect loops & canonicals',
        icon: Route,
      },
      {
        title: 'WCAG Color Contrast',
        href: '/contrast-checker',
        description: 'Analyze contrast ratios against WCAG 2.2 accessibility',
        icon: Palette,
      },
      {
        title: 'Internal Link Mapper',
        href: '/internal-link-mapper',
        description: 'Topology graph, destination hubs & anchor text distribution',
        icon: Network,
        badge: 'NEW',
      },
    ],
  },
];

interface ResourceItem {
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const RESOURCE_ITEMS: ResourceItem[] = [
  {
    title: 'SEO Articles & Knowledge Base',
    href: '/blog',
    description: 'Algorithm teardowns, competitor insights & SEO playbooks',
    icon: BookOpen,
    badge: 'NEW',
  },
  {
    title: 'Why AnalyzeSERP',
    href: '/about',
    description: 'Deterministic raw DOM parsing vs hallucinating AI scrapers',
    icon: Sparkles,
  },
  {
    title: 'Product Changelog',
    href: '/changelog',
    description: 'Weekly release notes, engine optimizations & milestones',
    icon: History,
    badge: 'v2.5',
  },
  {
    title: 'Google SERP & Pixel Standards',
    href: '/serp-snippet-preview',
    description: 'Pixel-accurate 600px desktop & mobile title/meta CTR caps',
    icon: Eye,
  },
];

interface NavbarProps {
  onOpenProModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProModal }) => {
  const { data: session, status } = useSession();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const resourcesMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Sync theme with localStorage & HTML root
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

  // Click outside & Escape key listeners for accessible dismissal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
      if (resourcesMenuRef.current && !resourcesMenuRef.current.contains(event.target as Node)) {
        setIsResourcesOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsToolsOpen(false);
        setIsResourcesOpen(false);
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close menus upon pathname navigation
  useEffect(() => {
    setIsToolsOpen(false);
    setIsResourcesOpen(false);
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Determine whether current path matches any specialized tool
  const isAnyToolActive = TOOL_CATEGORIES.some((category) =>
    category.tools.some((tool) => tool.href === pathname || (tool.href !== '/' && pathname?.startsWith(tool.href)))
  );

  return (
    <div className="sticky top-0 z-50">
      {/* WCAG 2.4.1 Bypass Blocks: Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:font-bold focus:text-xs focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-950 transition-all"
      >
        Skip to main content
      </a>

      <LiveAnnouncementBanner />
      <header className="glass-panel border-b border-slate-200/80 dark:border-white/10 px-4 lg:px-8 py-3 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* AnalyzeSERP Brand Logo */}
        <Link href="/" aria-label="AnalyzeSERP Home" className="flex items-center shrink-0">
          <Logo size="md" variant="full" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Desktop Navigation" className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
          {/* Tools ▾ 2-Column Mega Flyout Dropdown */}
          <div
            ref={toolsMenuRef}
            className="relative"
            onMouseEnter={() => setIsToolsOpen(true)}
            onMouseLeave={() => setIsToolsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsToolsOpen((prev) => !prev)}
              aria-expanded={isToolsOpen}
              aria-haspopup="true"
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isToolsOpen || isAnyToolActive
                  ? 'bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100/80 dark:hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tools</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isToolsOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Mega Flyout Menu */}
            {isToolsOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-[680px] -ml-20 lg:ml-0 rounded-2xl glass-panel p-5 border border-slate-200/90 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                role="menu"
                aria-label="SEO Tools Directory"
              >
                {/* Invisible Hover Bridge to prevent gap hover flicker */}
                <div className="absolute -top-2 left-0 right-0 h-2" />

                <div className="grid grid-cols-2 gap-5">
                  {TOOL_CATEGORIES.map((category) => (
                    <div key={category.title} className="space-y-2.5">
                      <div className="pb-1.5 border-b border-slate-100 dark:border-white/5">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                          {category.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-tight mt-0.5">
                          {category.description}
                        </p>
                      </div>

                      <div className="space-y-1">
                        {category.tools.map((tool) => {
                          const IconComponent = tool.icon;
                          const isActive = pathname === tool.href;
                          return (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              role="menuitem"
                              className={`group/item flex items-start gap-3 p-2 rounded-xl transition-all ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                                  : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-200'
                              }`}
                            >
                              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors shrink-0 mt-0.5">
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold truncate group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">
                                    {tool.title}
                                  </span>
                                  {tool.badge && (
                                    <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                      {tool.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10.5px] text-slate-500 dark:text-gray-400 leading-snug line-clamp-2 mt-0.5">
                                  {tool.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Callout in Mega Menu */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>All 11 tools are <strong>100% Free</strong> during Public Beta.</span>
                  </div>
                  <Link
                    href="/pricing"
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View Beta Access</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* White-Label PDF Reports Link (Configuration 1) */}
          <Link
            href="/pdf-reports"
            aria-current={pathname === '/pdf-reports' ? 'page' : undefined}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold ${
              pathname === '/pdf-reports'
                ? 'bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100/80 dark:hover:bg-white/5'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>PDF Reports</span>
            <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              NEW
            </span>
          </Link>

          {/* Resources ▾ Flyout Dropdown */}
          <div
            ref={resourcesMenuRef}
            className="relative"
            onMouseEnter={() => setIsResourcesOpen(true)}
            onMouseLeave={() => setIsResourcesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsResourcesOpen((prev) => !prev)}
              aria-expanded={isResourcesOpen}
              aria-haspopup="true"
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isResourcesOpen || pathname?.startsWith('/blog') || pathname === '/about' || pathname === '/changelog'
                  ? 'bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100/80 dark:hover:bg-white/5'
              }`}
            >
              <span>Resources</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isResourcesOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Resources Dropdown Menu */}
            {isResourcesOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-[360px] rounded-2xl glass-panel p-3 border border-slate-200/90 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                role="menu"
                aria-label="Resources Directory"
              >
                {/* Invisible Hover Bridge */}
                <div className="absolute -top-2 left-0 right-0 h-2" />

                <div className="space-y-1">
                  {RESOURCE_ITEMS.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={`group/item flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-200'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors shrink-0 mt-0.5">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-500 dark:text-gray-400 leading-snug line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Link with Beta Badge */}
          <Link
            href="/pricing"
            aria-current={pathname === '/pricing' ? 'page' : undefined}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold ${
              pathname === '/pricing'
                ? 'bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100/80 dark:hover:bg-white/5'
            }`}
          >
            <span>Pricing</span>
            <span className="px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Free Beta
            </span>
          </Link>
        </nav>

        {/* Right Utility Cluster: Theme Toggle, Auth / Credits & Mobile Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Light / Dark Mode Icon-Only Toggle Button */}
          <Tooltip content={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} side="bottom">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-90" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>
          </Tooltip>

          {/* User Authentication & AI Credits Dock */}
          {status === 'loading' ? (
            <div className="h-[38px] w-[38px] rounded-full bg-slate-200/60 dark:bg-white/5 animate-pulse shrink-0" />
          ) : session?.user ? (
            <div ref={profileMenuRef} className="relative flex items-center">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-label="User account menu"
                aria-expanded={isProfileMenuOpen}
                className="relative h-[38px] w-[38px] rounded-full ring-2 ring-transparent hover:ring-emerald-500/40 dark:hover:ring-emerald-400/50 transition-all cursor-pointer active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 flex items-center justify-center shrink-0"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-[32px] h-[32px] rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-xs"
                  />
                ) : (
                  <div className="w-[32px] h-[32px] rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {session.user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 top-full w-64 rounded-2xl glass-panel p-3 border border-slate-200 dark:border-white/10 shadow-xl bg-white dark:bg-slate-900 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pb-2 border-b border-slate-200/80 dark:border-white/10">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {session.user.name || 'Signed In User'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono truncate">
                      {session.user.email}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Daily AI Credits:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {session.user.credits?.remainingCredits ?? 5} / {session.user.credits?.limit ?? 5}
                      </strong>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-gray-400 leading-tight">
                      Resets automatically every 24 hours.
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Workspace &amp; History</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs shadow-emerald-600/20 active:scale-95 shrink-0"
            >
              <User className="w-4 h-4 text-white" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden h-[38px] w-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden pt-4 pb-3 px-2 border-t border-slate-200/80 dark:border-white/10 mt-3 space-y-3 animate-in fade-in duration-200 max-h-[80vh] overflow-y-auto"
        >
          {/* Categorized Tools on Mobile */}
          <div className="space-y-3">
            {TOOL_CATEGORIES.map((category) => (
              <div key={category.title} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {category.title}
                </p>
                {category.tools.map((tool) => {
                  const IconComponent = tool.icon;
                  const isActive = pathname === tool.href;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <IconComponent className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{tool.title}</span>
                      </div>
                      {tool.badge && (
                        <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                          {tool.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Direct Navigation Links on Mobile */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 space-y-1">
            <Link
              href="/pdf-reports"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                pathname === '/pdf-reports'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span>White-Label PDF Reports</span>
              </div>
              <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                NEW
              </span>
            </Link>

            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                pathname === '/pricing'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Pricing Plans</span>
              </div>
              <span className="px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Free Beta
              </span>
            </Link>

            <Link
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                pathname?.startsWith('/blog')
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>SEO Articles &amp; Blog</span>
              </div>
              <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                NEW
              </span>
            </Link>

            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold transition-all ${
                pathname === '/about'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Why AnalyzeSERP</span>
            </Link>

            <Link
              href="/changelog"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                pathname === '/changelog'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-emerald-500" />
                <span>Product Changelog</span>
              </div>
              <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                v2.4
              </span>
            </Link>
          </div>

          {/* Mobile Auth Row */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-white/10">
            {session?.user ? (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || 'User'} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{session.user.name || 'User'}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    {session.user.credits?.remainingCredits ?? 5} AI
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="py-1.5 px-3 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Sign In to Unlock AI (Free)</span>
              </Link>
            )}
          </div>
        </nav>
      )}

      {/* 1-Click Google & GitHub Sign In Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  </div>
  );
};
