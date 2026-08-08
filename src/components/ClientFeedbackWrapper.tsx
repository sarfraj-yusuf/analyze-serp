'use client';

import React, { useState, useEffect } from 'react';
import { BetaBanner } from './BetaBanner';
import { FloatingFeedbackButton } from './FloatingFeedbackButton';
import { FeedbackModal } from './FeedbackModal';

export const ClientFeedbackWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const handleToolExecuted = () => {
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
      <BetaBanner onOpenFeedback={() => setIsFeedbackOpen(true)} />
      {children}
      <FloatingFeedbackButton onOpenFeedback={() => setIsFeedbackOpen(true)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};
