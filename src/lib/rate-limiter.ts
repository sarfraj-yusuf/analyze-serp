import { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

/**
 * In-memory sliding-window IP Rate Limiter
 */
class RateLimiter {
  private requests = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;
  private cleanupIntervalMs: number;
  private lastCleanup: number = Date.now();

  /**
   * @param windowMs Time window in milliseconds (e.g. 60,000 for 1 minute)
   * @param maxRequests Maximum allowed requests per IP per window
   */
  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.cleanupIntervalMs = windowMs * 2;
  }

  /**
   * Extract client IP address from request headers
   */
  public getClientIp(req: NextRequest): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
      return realIp.trim();
    }

    const cfIp = req.headers.get('cf-connecting-ip');
    if (cfIp) {
      return cfIp.trim();
    }

    return '127.0.0.1';
  }

  /**
   * Check if an IP address has exceeded the rate limit
   */
  public check(ip: string): { success: boolean; limit: number; remaining: number; resetMs: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Periodic cleanup of stale IPs
    if (now - this.lastCleanup > this.cleanupIntervalMs) {
      this.cleanup(windowStart);
    }

    let record = this.requests.get(ip);
    if (!record) {
      record = { timestamps: [] };
      this.requests.set(ip, record);
    }

    // Filter out timestamps outside current window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const resetMs = oldestInWindow + this.windowMs - now;

      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        resetMs: Math.max(1000, resetMs),
      };
    }

    record.timestamps.push(now);
    const remaining = this.maxRequests - record.timestamps.length;

    return {
      success: true,
      limit: this.maxRequests,
      remaining,
      resetMs: this.windowMs,
    };
  }

  /**
   * Purge IP records older than the active window
   */
  private cleanup(windowStart: number): void {
    this.lastCleanup = Date.now();
    for (const [ip, record] of this.requests.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.requests.delete(ip);
      }
    }
  }
}

// Global rate limiter instance: max 10 audit requests per IP per 1 minute
export const auditRateLimiter = new RateLimiter(60 * 1000, 10);
