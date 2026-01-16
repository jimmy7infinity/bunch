/**
 * Simple caching utility for PolyBanter
 * 
 * MVP implementation uses in-memory cache with TTL
 * Can be upgraded to Redis later for production scaling
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get cached value by key
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached value with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Delete cached value
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    }

    return {
      total: this.cache.size,
      active: activeEntries,
      expired: expiredEntries,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
export const cache = new CacheService();

// Cache key builders
export const CacheKeys = {
  marketPositions: (marketId: string) => `market:${marketId}:positions`,
  userDashboard: (userId: string) => `user:${userId}:dashboard`,
  userMarketStatus: (userId: string, marketId: string) => `user:${userId}:market:${marketId}:status`,
  whaleThreshold: (marketId: string) => `market:${marketId}:whale_threshold`,
};

// TTL constants (in milliseconds)
export const CacheTTL = {
  MARKET_POSITIONS: 10 * 60 * 1000, // 10 minutes
  USER_DASHBOARD: 12 * 60 * 60 * 1000, // 12 hours
  MARKET_STATUS: 5 * 60 * 1000, // 5 minutes
  WHALE_THRESHOLD: 10 * 60 * 1000, // 10 minutes
};

// Run cleanup every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);
