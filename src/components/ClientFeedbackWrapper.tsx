'use client';

import React, { useState, useEffect } from 'react';
import { FloatingFeedbackButton } from './FloatingFeedbackButton';
import { FeedbackModal } from './FeedbackModal';

export const ClientFeedbackWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [hasCompletedAudit, setHasCompletedAudit] = useState(false);

  useEffect(() => {
    // Only display the floating feedback widget if the user has performed at least one audit
    if (localStorage.getItem('has_completed_audit') === 'true') {
      setHasCompletedAudit(true);
    }

    const handleToolExecuted = () => {
      localStorage.setItem('has_completed_audit', 'true');
      setHasCompletedAudit(true);

      const hasSubmitted = localStorage.getItem('has_submitted_feedback') === 'true';
      if (!hasSubmitted) {
        setIsFeedbackOpen(true);
      }
    };

    window.addEventListener('tool_executed', handleToolExecuted);
    return () => window.removeEventListener('tool_executed', handleToolExecuted);
  }, []);

  return (
    <>
      {children}
      {hasCompletedAudit && (
        <FloatingFeedbackButton onOpenFeedback={() => setIsFeedbackOpen(true)} />
      )}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};
