interface CooldownQuotaRecord {
  usedCount: number;
  cooldownUntil: number; // Timestamp ms when cooldown expires
}

/**
 * Server-side IP-based Cooldown Quota Tracker
 * 5 Audits per batch, followed by a 120-second cooldown
 */
class FreemiumLimiter {
  private ipQuotas = new Map<string, CooldownQuotaRecord>();
  private maxBatchAudits: number;
  private cooldownDurationMs: number;

  constructor(maxBatchAudits: number = 5, cooldownSeconds: number = 120) {
    this.maxBatchAudits = maxBatchAudits;
    this.cooldownDurationMs = cooldownSeconds * 1000;
  }

  /**
   * Checks if an IP is allowed to run audit or in 120s cooldown
   */
  public check(ip: string, requestedCount: number = 1): {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    cooldownSeconds: number;
  } {
    const now = Date.now();
    let record = this.ipQuotas.get(ip);

    if (!record) {
      record = { usedCount: 0, cooldownUntil: 0 };
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
   * Consumes audit count for an IP address and triggers 120s cooldown if 5 audits reached
   */
  public consume(ip: string, count: number): void {
    const now = Date.now();
    let record = this.ipQuotas.get(ip);

    if (!record) {
      record = { usedCount: 0, cooldownUntil: 0 };
      this.ipQuotas.set(ip, record);
    }

    if (record.cooldownUntil > 0 && now >= record.cooldownUntil) {
      record.usedCount = 0;
      record.cooldownUntil = 0;
    }

    record.usedCount += count;

    if (record.usedCount >= this.maxBatchAudits) {
      record.cooldownUntil = now + this.cooldownDurationMs;
    }
  }
}

export const freemiumLimiter = new FreemiumLimiter(20, 120);
