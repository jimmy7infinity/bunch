/**
 * Rate Limiting and Throttling Utilities for Extension
 * 
 * Provides client-side rate limiting to prevent API abuse and excessive requests
 */

/**
 * Simple rate limiter that tracks call frequency
 */
export class RateLimiter {
  private calls: number[] = [];
  private readonly maxCalls: number;
  private readonly windowMs: number;

  constructor(maxCalls: number, windowMs: number) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
  }

  /**
   * Check if the action is allowed based on rate limit
   * @returns true if allowed, false if rate limited
   */
  canProceed(): boolean {
    const now = Date.now();
    
    // Remove calls outside the time window
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    
    // Check if under limit
    if (this.calls.length < this.maxCalls) {
      this.calls.push(now);
      return true;
    }
    
    return false;
  }

  /**
   * Get time until next allowed call
   * @returns milliseconds until next call is allowed, or 0 if allowed now
   */
  getTimeUntilReset(): number {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    
    if (this.calls.length < this.maxCalls) {
      return 0;
    }
    
    const oldestCall = Math.min(...this.calls);
    return this.windowMs - (now - oldestCall);
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.calls = [];
  }
}

/**
 * Throttle function - only execute once per wait period
 * Returns a throttled version of the function that will only execute once per wait period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastRan = 0;

  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    
    if (!lastRan || now - lastRan >= wait) {
      func.apply(this, args);
      lastRan = now;
    } else {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
        lastRan = Date.now();
      }, wait - (now - lastRan));
    }
  };
}

/**
 * Debounce function - delay execution until after wait period of inactivity
 * Returns a debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * Message sending rate limiter
 * Prevents message spam: max 3 messages per 3 seconds
 */
export const messageSendLimiter = new RateLimiter(3, 3000);

/**
 * API request rate limiter
 * Prevents API spam: max 30 requests per minute
 */
export const apiRequestLimiter = new RateLimiter(30, 60000);

/**
 * WebSocket event rate limiter
 * Prevents event spam: max 10 events per 5 seconds
 */
export const websocketEventLimiter = new RateLimiter(10, 5000);

/**
 * Storage write rate limiter
 * Prevents excessive storage writes: max 5 writes per 10 seconds
 */
export const storageWriteLimiter = new RateLimiter(5, 10000);

/**
 * Exponential backoff calculator
 * Used for retry logic with increasing delays
 */
export function calculateExponentialBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000,
  jitter: boolean = true
): number {
  // Calculate exponential delay: baseDelay * 2^attempt
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  
  // Add random jitter to prevent thundering herd
  if (jitter) {
    const jitterAmount = exponentialDelay * 0.3; // 30% jitter
    return exponentialDelay + (Math.random() * jitterAmount * 2 - jitterAmount);
  }
  
  return exponentialDelay;
}

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterMs: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Format time remaining for user display
 */
export function formatTimeRemaining(ms: number): string {
  if (ms < 1000) return 'less than a second';
  
  const seconds = Math.ceil(ms / 1000);
  
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Create a rate-limited version of an async function
 */
export function rateLimited<T extends (...args: any[]) => Promise<any>>(
  func: T,
  limiter: RateLimiter
): T {
  return (async function(this: any, ...args: Parameters<T>) {
    if (!limiter.canProceed()) {
      const timeUntilReset = limiter.getTimeUntilReset();
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${formatTimeRemaining(timeUntilReset)}.`,
        timeUntilReset
      );
    }
    
    return await func.apply(this, args);
  }) as T;
}
