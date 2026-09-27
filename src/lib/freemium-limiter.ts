interface CooldownQuotaRecord {
  usedCount: number;
  cooldownUntil: number; // Timestamp ms when cooldown expires
  lastUpdated: number;
}

/**
 * Server-side IP-based Cooldown Quota Tracker
 * 20 Audits per batch window, followed by a 120-second cooldown
 */
class FreemiumLimiter {
  private ipQuotas = new Map<string, CooldownQuotaRecord>();
  private maxBatchAudits: number;
  private cooldownDurationMs: number;
  private maxEntries: number = 5000;
  private lastCleanup: number = Date.now();

  constructor(maxBatchAudits: number = 20, cooldownSeconds: number = 120) {
    this.maxBatchAudits = maxBatchAudits;
    this.cooldownDurationMs = cooldownSeconds * 1000;
  }

  /**
   * Prune stale guest quota records to prevent memory leaks
   */
  private cleanup(now: number): void {
    this.lastCleanup = now;
    const staleThreshold = now - 60 * 60 * 1000; // 1 hour inactivity

    for (const [ip, record] of this.ipQuotas.entries()) {
      const cooldownExpired = record.cooldownUntil > 0 && now >= record.cooldownUntil;
      const isStale = (record.lastUpdated || 0) < staleThreshold;
      if ((cooldownExpired && isStale) || (record.usedCount === 0 && isStale)) {
        this.ipQuotas.delete(ip);
      }
    }

    if (this.ipQuotas.size > this.maxEntries) {
      const excess = this.ipQuotas.size - this.maxEntries;
      const keysToDelete = Array.from(this.ipQuotas.keys()).slice(0, excess);
      for (const k of keysToDelete) {
        this.ipQuotas.delete(k);
      }
    }
  }

  /**
   * Checks if an IP is allowed to run audit or in 120s cooldown
   */
  public check(
    ip: string,
    requestedCount: number = 1
  ): {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    cooldownSeconds: number;
  } {
    const now = Date.now();
    if (now - this.lastCleanup > 10 * 60 * 1000 || this.ipQuotas.size > this.maxEntries) {
      this.cleanup(now);
    }

    let record = this.ipQuotas.get(ip);

    if (!record) {
      record = { usedCount: 0, cooldownUntil: 0, lastUpdated: now };
      this.ipQuotas.set(ip, record);
    }

    // Reset batch count if cooldown has passed
    if (record.cooldownUntil > 0 && now >= record.cooldownUntil) {
      record.usedCount = 0;
      record.cooldownUntil = 0;
    }

    // If currently in active cooldown
    if (record.cooldownUntil > 0 && now < record.cooldownUntil) {
      const cooldownSeconds = Math.ceil((record.cooldownUntil - now) / 1000);
      return {
        allowed: false,
        used: record.usedCount,
        limit: this.maxBatchAudits,
        remaining: 0,
        cooldownSeconds,
      };
    }

    const remaining = Math.max(0, this.maxBatchAudits - record.usedCount);
    const allowed = record.usedCount + requestedCount <= this.maxBatchAudits;

    let cooldownSeconds = 0;
    if (!allowed && record.cooldownUntil > 0) {
      cooldownSeconds = Math.ceil((record.cooldownUntil - now) / 1000);
    }

    return {
      allowed,
      used: record.usedCount,
      limit: this.maxBatchAudits,
      remaining,
      cooldownSeconds,
    };
  }

  /**
   * Atomically reserves audit quota before scraping starts to eliminate multi-tab concurrent race conditions.
   */
  public reserve(
    ip: string,
    count: number
  ): {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    cooldownSeconds: number;
  } {
    const status = this.check(ip, count);
    if (!status.allowed) {
      return status;
    }

    const now = Date.now();
    const record = this.ipQuotas.get(ip)!;
    record.usedCount += count;
    record.lastUpdated = now;

    if (record.usedCount >= this.maxBatchAudits) {
      record.cooldownUntil = now + this.cooldownDurationMs;
    }

    const remaining = Math.max(0, this.maxBatchAudits - record.usedCount);
    const cooldownSeconds = record.cooldownUntil > 0 ? Math.ceil((record.cooldownUntil - now) / 1000) : 0;

    return {
      allowed: true,
      used: record.usedCount,
      limit: this.maxBatchAudits,
      remaining,
      cooldownSeconds,
    };
  }

  /**
   * Refunds reserved audit count if target URLs fail to crawl.
   */
  public refund(ip: string, count: number): void {
    const record = this.ipQuotas.get(ip);
    if (!record) return;

    record.usedCount = Math.max(0, record.usedCount - count);
    record.lastUpdated = Date.now();

    // If quota is no longer maxed out, clear cooldown
    if (record.usedCount < this.maxBatchAudits && record.cooldownUntil > 0) {
      record.cooldownUntil = 0;
    }
  }

  /**
   * Consumes audit count for an IP address and triggers 120s cooldown if max reached
   */
  public consume(ip: string, count: number): void {
    this.reserve(ip, count);
  }
}

export const freemiumLimiter = new FreemiumLimiter(20, 120);
