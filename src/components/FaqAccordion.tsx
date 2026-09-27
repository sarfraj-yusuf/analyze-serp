'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqAccordionItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqAccordionItem[];
  defaultOpenIndex?: number | null;
}

export function FaqAccordion({ items, defaultOpenIndex = 0 }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="transition-colors">
            <button
              type="button"
              onClick={() => toggleFaq(index)}
              aria-expanded={isOpen}
              className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-emerald-500' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-gray-300 leading-relaxed animate-in fade-in duration-150">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
