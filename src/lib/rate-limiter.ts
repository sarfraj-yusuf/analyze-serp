import { NextRequest } from 'next/server';
import { isIpBannedFast, logSecurityIncident } from '@/lib/db';

export interface SuspiciousBotRecord {
  ip: string;
  callsLastMinute: number;
  peakCount: number;
  severity: 'high' | 'critical';
  details: string;
  detectedAt: string;
  lastSeenAt: string;
  isBanned: boolean;
  status: 'active_flood' | 'quarantined' | 'banned';
}

/**
 * High-Velocity Bot & Scraper Detection Engine
 * Tracks cross-endpoint tool call velocity and flags IPs making 50+ calls / 60 seconds
 */
class BotDetectionEngine {
  private ipCalls = new Map<
    string,
    {
      timestamps: number[];
      lastIncidentLoggedAt?: number;
      flaggedAt?: number;
      peakCount: number;
    }
  >();
  private windowMs = 60 * 1000; // 60 seconds rolling window
  private botThreshold = 50; // 50 requests in 60s
  private criticalThreshold = 100; // 100 requests in 60s
  private quarantineDurationMs = 5 * 60 * 1000; // 5 minutes quarantine penalty

  /**
   * Record an incoming request from an IP across any tool or endpoint
   */
  public recordRequest(
    ip: string,
    endpoint?: string
  ): { isSuspiciousBot: boolean; callsInWindow: number; isQuarantined: boolean } {
    if (isIpBannedFast(ip)) {
      return { isSuspiciousBot: true, callsInWindow: 0, isQuarantined: true };
    }

    const now = Date.now();
    const windowStart = now - this.windowMs;

    let data = this.ipCalls.get(ip);
    if (!data) {
      data = { timestamps: [], peakCount: 0 };
      this.ipCalls.set(ip, data);
    }

    // Filter to current 60s window
    data.timestamps = data.timestamps.filter((t) => t > windowStart);
    data.timestamps.push(now);

    const callsInWindow = data.timestamps.length;
    data.peakCount = Math.max(data.peakCount || 0, callsInWindow);

    const isBot = callsInWindow >= this.botThreshold;

    if (isBot) {
      if (!data.flaggedAt) {
        data.flaggedAt = now;
      }

      // Debounce security incident logging to MySQL (at most once every 2 minutes per IP)
      if (!data.lastIncidentLoggedAt || now - data.lastIncidentLoggedAt > 2 * 60 * 1000) {
        data.lastIncidentLoggedAt = now;
        const severity = callsInWindow >= this.criticalThreshold ? 'critical' : 'high';
        logSecurityIncident({
          incident_type: 'SUSPICIOUS_BOT_FLOOD',
          severity,
          ip_address: ip,
          target_endpoint: endpoint || null,
          details: `High-frequency bot scraping detected: ${callsInWindow} requests in 60s (Burst peak: ${data.peakCount})`,
        }).catch(() => {});
      }

      return {
        isSuspiciousBot: true,
        callsInWindow,
        isQuarantined: true,
      };
    }

    // Check if still in cool-down quarantine
    const isQuarantined = data.flaggedAt ? now - data.flaggedAt < this.quarantineDurationMs : false;

    return {
      isSuspiciousBot: false,
      callsInWindow,
      isQuarantined,
    };
  }

  /**
   * Return detected suspicious bots list for Admin Dashboard
   */
  public getSuspiciousBots(): SuspiciousBotRecord[] {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const results: SuspiciousBotRecord[] = [];

    for (const [ip, data] of this.ipCalls.entries()) {
      const activeTimestamps = data.timestamps.filter((t) => t > windowStart);
      const callsInWindow = activeTimestamps.length;
      const isBanned = isIpBannedFast(ip);

      const isRecentlyFlagged = data.flaggedAt && now - data.flaggedAt < 24 * 60 * 60 * 1000;
      if (callsInWindow >= this.botThreshold || isRecentlyFlagged) {
        const severity = (data.peakCount || callsInWindow) >= this.criticalThreshold ? 'critical' : 'high';
        const status: 'active_flood' | 'quarantined' | 'banned' = isBanned
          ? 'banned'
          : callsInWindow >= this.botThreshold
          ? 'active_flood'
          : 'quarantined';

        results.push({
          ip,
          callsLastMinute: callsInWindow,
          peakCount: data.peakCount || callsInWindow,
          severity,
          details: `Automated Tool Scraping Flood: ${data.peakCount || callsInWindow} calls/min peak`,
          detectedAt: new Date(data.flaggedAt || now).toISOString(),
          lastSeenAt: new Date(data.timestamps[data.timestamps.length - 1] || now).toISOString(),
          isBanned,
          status,
        });
      }
    }

    return results.sort((a, b) => b.callsLastMinute - a.callsLastMinute);
  }
}

export const botDetectionEngine = new BotDetectionEngine();
export const getDetectedSuspiciousBots = () => botDetectionEngine.getSuspiciousBots();

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
   * Extract client IP address securely from request headers.
   * Prioritizes tamper-proof edge headers (cf-connecting-ip, x-real-ip) over
   * client-controllable x-forwarded-for to prevent IP spoofing and rate limit evasion.
   */
  public getClientIp(req: NextRequest | Request): string {
    // 1. Cloudflare Edge header (tamper-proof when behind Cloudflare)
    const cfIp = req.headers.get('cf-connecting-ip');
    if (cfIp && this.isValidIp(cfIp.trim())) {
      return cfIp.trim();
    }

    // 2. Direct Reverse Proxy header (Nginx / Caddy / Traefik)
    const realIp = req.headers.get('x-real-ip');
    if (realIp && this.isValidIp(realIp.trim())) {
      return realIp.trim();
    }

    // 3. Fallback to X-Forwarded-For (sanitized)
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
      const parts = forwardedFor.split(',').map((p) => p.trim()).filter(Boolean);
      for (let i = parts.length - 1; i >= 0; i--) {
        if (this.isValidIp(parts[i])) {
          return parts[i];
        }
      }
    }

    return '127.0.0.1';
  }

  /**
   * Validate that the extracted string is syntactically a valid IPv4 or IPv6 address
   */
  private isValidIp(ip: string): boolean {
    if (!ip || ip.length > 45) return false;
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      const octets = ip.split('.').map(Number);
      return octets.every((o) => o >= 0 && o <= 255);
    }
    if (ip.includes(':') && /^[0-9a-fA-F:]+$/.test(ip)) {
      return true;
    }
    return false;
  }

  /**
   * Check if an IP address has exceeded the rate limit or is banned
   */
  public check(
    ip: string,
    endpoint?: string
  ): {
    success: boolean;
    limit: number;
    remaining: number;
    resetMs: number;
    banned?: boolean;
    suspiciousBot?: boolean;
    callsInWindow?: number;
  } {
    // 1. Instant check for blacklisted IPs
    if (isIpBannedFast(ip)) {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        resetMs: 86400000,
        banned: true,
      };
    }

    // 2. Cross-cutting Bot Detection check (50+ calls/min)
    const botCheck = botDetectionEngine.recordRequest(ip, endpoint);
    if (botCheck.isSuspiciousBot || botCheck.isQuarantined) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        resetMs: 300000, // 5 min quarantine
        banned: false,
        suspiciousBot: true,
        callsInWindow: botCheck.callsInWindow,
      };
    }

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

      // Log security incident asynchronously
      logSecurityIncident({
        incident_type: 'RATE_LIMIT_429',
        severity: 'medium',
        ip_address: ip,
        target_endpoint: endpoint || null,
        details: `Exceeded request limit (${this.maxRequests} req / ${Math.round(this.windowMs / 1000)}s)`,
      }).catch(() => {});

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

// AI generation rate limiter: max 10 requests per IP per 1 minute
export const aiRateLimiter = new RateLimiter(60 * 1000, 10);
