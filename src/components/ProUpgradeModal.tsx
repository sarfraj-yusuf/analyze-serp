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
            <span>Public Beta Free Access</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AnalyzeSERP Pro <span className="gradient-text">(Valued at $19/month)</span> is 100% FREE during Public Beta!
          </h3>

          <p className="text-xs text-slate-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
            All features, multi-URL competitor audits, readability grade metrics, and white-label PDF report exports are currently unlocked for early adopters.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="text-xs text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider">Public Beta Status</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">$0</span>
              <span className="line-through text-xs text-slate-400">$19 / month</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer shrink-0 w-full sm:w-auto"
          >
            Start Using Free Now
          </button>
        </div>

        {/* Feature List */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-gray-300">
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-500 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Unlimited Competitor On-Page & Technical Audits</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700 dark:text-gray-300">
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-500 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>1-Gram, 2-Gram & 3-Gram Keyword Gap Extraction</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700 dark:text-gray-300">
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-500 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>White-Label Branded Client PDF Report Exports</span>
          </div>
        </div>
      </div>
    </div>
  );
};
