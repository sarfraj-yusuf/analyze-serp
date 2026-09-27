'use client';

import { useState, useEffect } from 'react';

/**
 * Event-driven Real-Time Credit Synchronization Engine
 * Enables instant, zero-latency credit balance synchronization across all
 * components (Navbar, Modals, Workspace, Dashboard) and all open browser tabs
 * without page reloads.
 */

export interface LiveCreditUpdate {
  remaining: number;
  limit?: number;
}

const CREDIT_EVENT_NAME = 'analyzeserp:credits-updated';
const STORAGE_SYNC_KEY = 'analyzeserp_live_credits_sync';
const BROADCAST_CHANNEL_NAME = 'analyzeserp_credits_channel';

/**
 * Broadcasts an updated credit balance to all listening components and other open tabs.
 */
export function broadcastCreditUpdate(credits: LiveCreditUpdate): void {
  if (typeof window === 'undefined') return;

  // 1. Dispatch custom event for same-tab instant UI updates (0ms latency)
  try {
    window.dispatchEvent(
      new CustomEvent<LiveCreditUpdate>(CREDIT_EVENT_NAME, { detail: credits })
    );
  } catch (err) {
    console.warn('[Credits Sync] CustomEvent dispatch error:', err);
  }

  // 2. Broadcast across tabs via modern BroadcastChannel or localStorage fallback
  try {
    if (typeof (window as any).BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage(credits);
      channel.close();
    } else {
      localStorage.setItem(
        STORAGE_SYNC_KEY,
        JSON.stringify({ ...credits, timestamp: Date.now() })
      );
    }
  } catch (err) {
    // Graceful fallback if storage or BroadcastChannel is blocked
  }
}

/**
 * Subscribes a listener callback to real-time credit updates.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToCreditUpdates(
  callback: (credits: LiveCreditUpdate) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<LiveCreditUpdate>;
    if (customEvent.detail && typeof customEvent.detail.remaining === 'number') {
      callback(customEvent.detail);
    }
  };

  let channel: BroadcastChannel | null = null;

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_SYNC_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (typeof parsed.remaining === 'number') {
          callback(parsed);
        }
      } catch {}
    }
  };

  window.addEventListener(CREDIT_EVENT_NAME, handleCustomEvent);

  const hasBroadcast = typeof (window as any).BroadcastChannel !== 'undefined';

  if (hasBroadcast) {
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data && typeof event.data.remaining === 'number') {
          callback(event.data);
        }
      };
    } catch {}
  } else {
    window.addEventListener('storage', handleStorageEvent);
  }

  return () => {
    window.removeEventListener(CREDIT_EVENT_NAME, handleCustomEvent);
    if (channel) {
      channel.close();
    } else {
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}

/**
 * Custom React Hook to consume live credit updates seamlessly.
 * Provides live remaining/limit counts and an `isJustUpdated` pulse trigger.
 */
export function useLiveCredits(
  fallbackRemaining: number = 5,
  fallbackLimit: number = 5
) {
  const [credits, setCredits] = useState<{ remaining: number; limit: number }>({
    remaining: fallbackRemaining,
    limit: fallbackLimit,
  });
  const [isJustUpdated, setIsJustUpdated] = useState<boolean>(false);

  // Sync state if session fallback props change (e.g. initial login)
  useEffect(() => {
    setCredits((prev) => ({
      remaining: fallbackRemaining ?? prev.remaining,
      limit: fallbackLimit ?? prev.limit,
    }));
  }, [fallbackRemaining, fallbackLimit]);

  // Subscribe to real-time broadcasts
  useEffect(() => {
    const unsubscribe = subscribeToCreditUpdates((newCredits) => {
      setCredits((prev) => ({
        remaining: newCredits.remaining,
        limit: newCredits.limit !== undefined ? newCredits.limit : prev.limit,
      }));

      // Trigger a brief 1.2s visual pulse feedback
      setIsJustUpdated(true);
      const timer = setTimeout(() => setIsJustUpdated(false), 1200);
      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  return { ...credits, isJustUpdated };
}
