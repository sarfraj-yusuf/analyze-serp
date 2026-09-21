import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface BlogCalloutProps {
  type?: 'tip' | 'warning' | 'takeaway' | 'note' | 'info';
  title?: string;
  children: React.ReactNode;
}

export const BlogCallout: React.FC<BlogCalloutProps> = ({
  type = 'tip',
  title,
  children,
}) => {
  const configs = {
    tip: {
      icon: Lightbulb,
      defaultTitle: 'Pro Tip',
      borderClass: 'border-emerald-500/30 dark:border-emerald-500/20',
      bgClass: 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]',
      iconClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20',
      titleClass: 'text-emerald-900 dark:text-emerald-200',
    },
    takeaway: {
      icon: CheckCircle2,
      defaultTitle: 'Key Takeaway',
      borderClass: 'border-teal-500/30 dark:border-teal-500/20',
      bgClass: 'bg-teal-500/[0.04] dark:bg-teal-500/[0.06]',
      iconClass: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 dark:bg-teal-500/20',
      titleClass: 'text-teal-900 dark:text-teal-200',
    },
    warning: {
      icon: AlertTriangle,
      defaultTitle: 'Important Warning',
      borderClass: 'border-amber-500/30 dark:border-amber-500/20',
      bgClass: 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06]',
      iconClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20',
      titleClass: 'text-amber-900 dark:text-amber-200',
    },
    note: {
      icon: Info,
      defaultTitle: 'Note',
      borderClass: 'border-blue-500/30 dark:border-blue-500/20',
      bgClass: 'bg-blue-500/[0.04] dark:bg-blue-500/[0.06]',
      iconClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20',
      titleClass: 'text-blue-900 dark:text-blue-200',
    },
    info: {
      icon: Info,
      defaultTitle: 'Deep Dive',
      borderClass: 'border-slate-300 dark:border-white/15',
      bgClass: 'bg-slate-100/60 dark:bg-white/[0.03]',
      iconClass: 'text-slate-700 dark:text-slate-300 bg-slate-200/60 dark:bg-white/10',
      titleClass: 'text-slate-900 dark:text-slate-100',
    },
  };

  const config = configs[type] || configs.tip;
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <aside
      role="note"
      className={`my-8 rounded-2xl border ${config.borderClass} ${config.bgClass} p-5 sm:p-6 text-sm sm:text-base leading-relaxed not-prose transition-colors`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-2 rounded-xl shrink-0 ${config.iconClass}`}>
          <Icon className="size-4 sm:size-4.5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <div className={`font-bold tracking-tight text-sm sm:text-base ${config.titleClass}`}>
            {displayTitle}
          </div>
          <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
};
