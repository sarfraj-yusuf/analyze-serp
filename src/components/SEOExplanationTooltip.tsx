'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface SEOExplanationTooltipProps {
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const SEOExplanationTooltip: React.FC<SEOExplanationTooltipProps> = ({
  text,
  side = 'top',
}) => {
  return (
    <Tooltip content={text} side={side}>
      <span className="inline-flex items-center cursor-pointer ml-1.5 align-middle group/icon">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover/icon:text-emerald-500 dark:group-hover/icon:text-emerald-400 transition-colors shrink-0" />
      </span>
    </Tooltip>
  );
};
