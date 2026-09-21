'use client';

import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface BlogCodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  filename?: string;
}

export const BlogCodeBlock: React.FC<BlogCodeBlockProps> = ({
  children,
  className,
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  // Extract raw text content from children
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && node.props && node.props.children) return extractText(node.props.children);
    return '';
  };

  const handleCopy = () => {
    const rawText = extractText(children);
    if (!rawText) return;

    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine language label from class (e.g. language-bash -> BASH)
  let langLabel = '';
  if (className) {
    const match = className.match(/language-(\w+)/);
    if (match && match[1]) {
      langLabel = match[1].toUpperCase();
    }
  }

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-950 text-slate-100 shadow-sm not-prose">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          {filename ? (
            <span className="font-mono text-[11px] text-slate-400 pl-2 font-medium">
              {filename}
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 pl-2 font-mono text-[11px]">
              <Terminal className="size-3" />
              <span>{langLabel || 'TERMINAL'}</span>
            </div>
          )}
        </div>

        {/* 1-Click Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 sm:p-5 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed selection:bg-emerald-500 selection:text-black">
        {children}
      </div>
    </div>
  );
};
