'use client';

import React, { useState } from 'react';
import { BetaBanner } from './BetaBanner';
import { FloatingFeedbackButton } from './FloatingFeedbackButton';
import { FeedbackModal } from './FeedbackModal';

export const ClientFeedbackWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <BetaBanner onOpenFeedback={() => setIsFeedbackOpen(true)} />
      {children}
      <FloatingFeedbackButton onOpenFeedback={() => setIsFeedbackOpen(true)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};
