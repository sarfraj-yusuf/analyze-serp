'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  isValidElement,
  cloneElement,
} from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  content: ReactNode;
  subtitle?: string;
  badge?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'start' | 'end';
  delayMs?: number;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  badge,
  side = 'top',
  align = 'center',
  delayMs = 100,
  className = '',
  children,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    actualSide: 'top' | 'bottom' | 'left' | 'right';
  }>({
    top: 0,
    left: 0,
    actualSide: side,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    let targetSide = side;
    if (side === 'top' && rect.top < 44) {
      targetSide = 'bottom';
    } else if (side === 'bottom' && rect.bottom > window.innerHeight - 44) {
      targetSide = 'top';
    }

    let top = 0;
    let left = 0;

    if (targetSide === 'top') {
      top = rect.top - 6;
      left = align === 'start' ? rect.left : align === 'end' ? rect.right : rect.left + rect.width / 2;
    } else if (targetSide === 'bottom') {
      top = rect.bottom + 6;
      left = align === 'start' ? rect.left : align === 'end' ? rect.right : rect.left + rect.width / 2;
    } else if (targetSide === 'left') {
      left = rect.left - 6;
      top = rect.top + rect.height / 2;
    } else if (targetSide === 'right') {
      left = rect.right + 6;
      top = rect.top + rect.height / 2;
    }

    const margin = 12;
    left = Math.max(margin, Math.min(window.innerWidth - margin, left));

    setCoords({
      top,
      left,
      actualSide: targetSide,
    });
  }, [side, align]);

  const showTooltip = useCallback(() => {
    if (disabled || !content) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, delayMs);
  }, [disabled, content, delayMs, calculatePosition]);

  const hideTooltip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(false);
  }, []);

  // Close on scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      hideTooltip();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, hideTooltip]);

  const tooltipElement =
    mounted && isOpen && content && !disabled
      ? createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 999999,
            }}
            role="tooltip"
            className={`pointer-events-none transition-all duration-100 ease-out transform ${
              coords.actualSide === 'top'
                ? '-translate-x-1/2 -translate-y-full'
                : coords.actualSide === 'bottom'
                ? '-translate-x-1/2'
                : coords.actualSide === 'left'
                ? '-translate-x-full -translate-y-1/2'
                : '-translate-y-1/2'
            } animate-in fade-in zoom-in-95 duration-100 ${className}`}
          >
            <div className="relative px-2.5 py-1 rounded-md bg-slate-900/90 dark:bg-slate-900/95 text-slate-100 shadow-md shadow-black/20 border border-slate-700/60 dark:border-white/10 backdrop-blur-sm max-w-xs text-center select-none flex items-center gap-1.5">
              <span className="text-[11px] font-medium leading-tight text-slate-100 tracking-tight">
                {content}
              </span>
              {badge && (
                <span className="px-1 py-0.5 rounded bg-white/10 text-emerald-300 font-mono text-[9px] font-semibold leading-none">
                  {badge}
                </span>
              )}

              {/* Minimal Arrow Pointer */}
              {coords.actualSide === 'top' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-slate-900/90 border-r border-b border-slate-700/60 dark:border-white/10" />
              )}
              {coords.actualSide === 'bottom' && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-slate-900/90 border-l border-t border-slate-700/60 dark:border-white/10" />
              )}
              {coords.actualSide === 'left' && (
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-slate-900/90 border-r border-t border-slate-700/60 dark:border-white/10" />
              )}
              {coords.actualSide === 'right' && (
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-slate-900/90 border-l border-b border-slate-700/60 dark:border-white/10" />
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  // If children is a valid React element, clone and attach event handlers directly
  if (isValidElement(children)) {
    const childProps = children.props as any;
    return (
      <>
        {cloneElement(children as React.ReactElement<any>, {
          ref: (node: HTMLElement | null) => {
            triggerRef.current = node;
            const originalRef = (children as any).ref;
            if (typeof originalRef === 'function') {
              originalRef(node);
            } else if (originalRef && typeof originalRef === 'object') {
              originalRef.current = node;
            }
          },
          onMouseEnter: (e: React.MouseEvent) => {
            showTooltip();
            childProps.onMouseEnter?.(e);
          },
          onMouseLeave: (e: React.MouseEvent) => {
            hideTooltip();
            childProps.onMouseLeave?.(e);
          },
          onFocus: (e: React.FocusEvent) => {
            showTooltip();
            childProps.onFocus?.(e);
          },
          onBlur: (e: React.FocusEvent) => {
            hideTooltip();
            childProps.onBlur?.(e);
          },
          onClick: (e: React.MouseEvent) => {
            hideTooltip();
            childProps.onClick?.(e);
          },
          'aria-label':
            childProps['aria-label'] || (typeof content === 'string' ? content : undefined),
        })}
        {tooltipElement}
      </>
    );
  }

  // Fallback: wrap in span
  return (
    <>
      <span
        ref={(el) => {
          triggerRef.current = el;
        }}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onClick={hideTooltip}
        className="inline-flex items-center"
      >
        {children}
      </span>
      {tooltipElement}
    </>
  );
};
