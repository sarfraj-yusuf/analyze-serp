interface DailyQuotaRecord {
  date: string; // YYYY-MM-DD
  usedCount: number;
}

/**
 * Server-side IP-based Freemium Daily Quota Tracker
 */
class FreemiumLimiter {
  private ipQuotas = new Map<string, DailyQuotaRecord>();
  private maxFreeDailyAudits: number;

  constructor(maxFreeDailyAudits: number = 5) {
    this.maxFreeDailyAudits = maxFreeDailyAudits;
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Checks if an IP has remaining free daily audits
   */
  public check(ip: string, requestedCount: number = 1): {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
  } {
    const today = this.getTodayString();
    let record = this.ipQuotas.get(ip);

    if (!record || record.date !== today) {
      record = { date: today, usedCount: 0 };
      this.ipQuotas.set(ip, record);
    }

    const remaining = Math.max(0, this.maxFreeDailyAudits - record.usedCount);
    const allowed = record.usedCount + requestedCount <= this.maxFreeDailyAudits;

    return {
      allowed,
      used: record.usedCount,
      limit: this.maxFreeDailyAudits,
      remaining,
    };
  }

  /**
   * Consumes daily quota for an IP address
   */
  public consume(ip: string, count: number): void {
    const today = this.getTodayString();
    let record = this.ipQuotas.get(ip);

    if (!record || record.date !== today) {
      record = { date: today, usedCount: 0 };
      this.ipQuotas.set(ip, record);
    }

    record.usedCount += count;
  }

  /**
   * Cleanup stale records from past days
   */
  public cleanupStale(): void {
    const today = this.getTodayString();
    for (const [ip, record] of this.ipQuotas.entries()) {
      if (record.date !== today) {
        this.ipQuotas.delete(ip);
      }
    }
  }
}

export const freemiumLimiter = new FreemiumLimiter(5);
