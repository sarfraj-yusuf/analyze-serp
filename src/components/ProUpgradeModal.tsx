import React from 'react';
import { X, Check, Zap, ShieldCheck, Sparkles, FileText, Download } from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/20 shadow-2xl space-y-6 overflow-hidden text-slate-900 dark:text-white">
        {/* Decorative ambient background glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unlock Unlimited Competitor Intelligence</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Upgrade to <span className="gradient-text">SEO Matrix Pro</span>
          </h3>

          <p className="text-xs text-slate-600 dark:text-gray-300 max-w-md mx-auto">
            Supercharge your content workflow with batch multi-URL audits, unlimited PDF exports, and deep SERP benchmarks.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-[#080c14] border border-emerald-500/40 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider">Pro Monthly Membership</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">$9</span>
              <span className="text-xs text-slate-500 dark:text-gray-400">/ month</span>
            </div>
          </div>

          <button
            onClick={() => alert('Pro Subscription Checkout Demo Triggered!')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer shrink-0"
          >
            Start 7-Day Free Trial
          </button>
        </div>

        {/* Feature Comparison List */}
        <div className="space-y-2.5 text-xs text-slate-700 dark:text-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span><strong className="text-slate-900 dark:text-white">Batch Processing:</strong> Audit up to 10 URLs simultaneously (Free tier: 5).</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span><strong className="text-slate-900 dark:text-white">Unlimited Audits:</strong> No daily limit counters or IP rate throttling.</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span><strong className="text-slate-900 dark:text-white">Branded Client PDF Reports:</strong> White-label exports with your agency logo.</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span><strong className="text-slate-900 dark:text-white">Priority Scraping Pipeline:</strong> Instant 1-second DOM parsing without queues.</span>
          </div>
        </div>

        {/* Guarantee Footer */}
        <div className="text-center text-[11px] text-slate-500 dark:text-gray-400 flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>30-Day Money Back Guarantee • Cancel Anytime with 1 Click</span>
        </div>
      </div>
    </div>
  );
};
