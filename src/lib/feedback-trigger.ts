'use client';

/**
 * Triggers a client-side custom event whenever any tool or audit is executed
 */
export function triggerToolExecutionFeedback(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tool_executed'));
  }
}
