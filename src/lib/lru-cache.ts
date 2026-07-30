import { SinglePageAudit } from '@/types/seo';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * High-performance, Bounded LRU (Least Recently Used) Cache with TTL
 * Prevents memory leaks by capping the maximum number of entries
 * and evicting the least recently accessed items when full.
 */
export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxEntries: number;
  private defaultTtlMs: number;

  constructor(maxEntries: number = 500, defaultTtlMs: number = 24 * 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh position for LRU eviction (delete & re-set puts it at the end of Map iteration)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { value, expiresAt });
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public size(): number {
    return this.cache.size;
  }

  public clear(): void {
    this.cache.clear();
  }
}

// Global audit cache instance: max 500 entries, 24h TTL
export const auditCache = new LRUCache<SinglePageAudit>(500, 24 * 60 * 60 * 1000);
