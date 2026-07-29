import React from 'react';
import { ExternalLink, ShieldAlert, Sparkles, Server, PenTool } from 'lucide-react';

interface MonetizationBannerProps {
  type: 'adsense' | 'affiliate_hosting' | 'affiliate_copywriter';
}

export const MonetizationBanner: React.FC<MonetizationBannerProps> = ({ type }) => {
  if (type === 'adsense') {
    return (
      <div className="w-full my-6 p-4 rounded-xl glass-panel border border-dashed border-slate-300 dark:border-white/20 text-center relative overflow-hidden shadow-sm">
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-gray-500 mb-1">
          Advertisement Placeholder
        </div>
        <div className="text-xs text-slate-600 dark:text-gray-400 py-3 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
          Google AdSense / Ezoic Banner Slot (Capturing High eCPM Search Traffic)
        </div>
      </div>
    );
  }

  if (type === 'affiliate_hosting') {
    return (
      <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-cyan-50 to-indigo-50 dark:from-cyan-950/60 dark:to-indigo-950/60 border border-cyan-200 dark:border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-800 dark:text-cyan-300">
                Recommended Hosting
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Slow Competitor Load Times Detected?
            </h4>
            <p className="text-xs text-slate-600 dark:text-gray-300">
              Upgrade your hosting to high-speed NVMe cloud infrastructure for faster SERP rankings.
            </p>
          </div>
        </div>

        <a
          href="https://hostinger.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-md shadow-cyan-500/20"
        >
          <span>Explore Fast Hosting</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border border-emerald-200 dark:border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
          <PenTool className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              Copywriting AI Assistant
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            Need to Write 2,000+ Words Fast?
          </h4>
          <p className="text-xs text-slate-600 dark:text-gray-300">
            Generate long-form articles matching your competitor's heading structure in minutes.
          </p>
        </div>
      </div>

      <a
        href="https://copy.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-md shadow-emerald-500/20"
      >
        <span>Try Copywriter Assistant</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
