/**
 * Rate limiting utility for Bunch
 * 
 * Prevents abuse and controls API costs by limiting expensive operations
 * MVP implementation uses in-memory storage
 * Can be upgraded to Redis for production scaling
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if action is rate limited
   * @throws Error if rate limit exceeded
   */
  async checkRateLimit(params: {
    userId: string;
    action: 'refresh_dashboard' | 'set_market_status';
    key?: string; // Optional additional key (e.g., marketId)
    windowMs: number;
  }): Promise<void> {
    const { userId, action, key, windowMs } = params;
    
    // Build unique rate limit key
    const rateLimitKey = key 
      ? `${userId}:${action}:${key}`
      : `${userId}:${action}`;

    const now = Date.now();
    const entry = this.limits.get(rateLimitKey);

    // If no entry or expired, allow and create new entry
    if (!entry || now > entry.resetAt) {
      this.limits.set(rateLimitKey, {
        count: 1,
        resetAt: now + windowMs,
      });
      return;
    }

    // Rate limit exceeded
    const timeUntilReset = Math.ceil((entry.resetAt - now) / 1000);
    throw new Error(
      `Rate limit exceeded for ${action}. Please wait ${timeUntilReset} seconds.`
    );
  }

  /**
   * Get remaining time until rate limit resets
   */
  getTimeUntilReset(params: {
    userId: string;
    action: string;
    key?: string;
  }): number | null {
    const { userId, action, key } = params;
    const rateLimitKey = key 
      ? `${userId}:${action}:${key}`
      : `${userId}:${action}`;

    const entry = this.limits.get(rateLimitKey);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.resetAt) return null;

    return Math.ceil((entry.resetAt - now) / 1000);
  }

  /**
   * Clear rate limit for a specific action
   */
  clearRateLimit(params: {
    userId: string;
    action: string;
    key?: string;
  }): void {
    const { userId, action, key } = params;
    const rateLimitKey = key 
      ? `${userId}:${action}:${key}`
      : `${userId}:${action}`;

    this.limits.delete(rateLimitKey);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.limits.delete(key));
  }

  /**
   * Get rate limit statistics
   */
  getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    }

    return {
      total: this.limits.size,
      active: activeEntries,
      expired: expiredEntries,
    };
  }
}

// Singleton instance
export const rateLimit = new RateLimitService();

// Rate limit windows (in milliseconds)
export const RateLimitWindows = {
  REFRESH_DASHBOARD: 5 * 60 * 1000, // 5 minutes
  SET_MARKET_STATUS: 5 * 60 * 1000, // 5 minutes per market
};

// Run cleanup every minute
setInterval(() => {
  rateLimit.cleanup();
}, 60 * 1000);
