/**
 * Rate Limiting Module
 * ====================
 * GREEN PHASE: Minimum implementation to pass tests.
 *
 * Provides rate limiting for API endpoints:
 * - createRateLimiter(options) - factory function to create rate limiters
 * - checkRateLimit(key) - check if request is allowed
 * - Returns standard rate limit headers
 *
 * RES-523: Rate limiting and abuse prevention
 */

/**
 * Options for creating a rate limiter
 */
export interface RateLimiterOptions {
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  windowMs?: number;
  /** Maximum number of requests per window (default: 100) */
  maxRequests?: number;
  /** Prefix for stored keys (default: '') */
  keyPrefix?: string;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Maximum requests per window */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Timestamp when the rate limit resets (ms since epoch) */
  resetAt: number;
  /** Standard rate limit headers */
  headers: RateLimitHeaders;
}

/**
 * Standard rate limit headers
 */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

/**
 * Rate limiter interface
 */
export interface RateLimiter {
  /** Check if a request is allowed for the given key */
  check: (key: string) => RateLimitResult;
  /** Reset rate limit for a specific key */
  reset: (key: string) => void;
}

/**
 * Internal record for tracking rate limits
 */
interface RateLimitRecord {
  /** Number of requests made in current window */
  count: number;
  /** Timestamp when the window started (ms since epoch) */
  windowStart: number;
}

/**
 * Default options for rate limiter
 */
const DEFAULT_OPTIONS: Required<RateLimiterOptions> = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  keyPrefix: '',
};

/**
 * Create a new rate limiter instance
 *
 * @param options - Configuration options
 * @returns RateLimiter instance
 *
 * @example
 * ```ts
 * const limiter = createRateLimiter({
 *   windowMs: 60000,  // 1 minute
 *   maxRequests: 100, // 100 requests per minute
 *   keyPrefix: 'api:', // prefix for stored keys
 * });
 *
 * const result = limiter.check('user-123');
 * if (!result.allowed) {
 *   // Return 429 Too Many Requests with headers
 * }
 * ```
 */
export function createRateLimiter(options: RateLimiterOptions = {}): RateLimiter {
  // Merge with defaults
  const config: Required<RateLimiterOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // In-memory store for rate limit records
  const store = new Map<string, RateLimitRecord>();

  /**
   * Get the full key with prefix
   */
  function getFullKey(key: string): string {
    return `${config.keyPrefix}${key}`;
  }

  /**
   * Clean up expired records to prevent memory leaks
   */
  function cleanupExpired(now: number): void {
    for (const [key, record] of store.entries()) {
      if (now - record.windowStart >= config.windowMs) {
        store.delete(key);
      }
    }
  }

  /**
   * Check if a request is allowed for the given key
   */
  function check(key: string): RateLimitResult {
    const now = Date.now();
    const fullKey = getFullKey(key);

    // Periodically clean up expired records (every 100 checks)
    if (Math.random() < 0.01) {
      cleanupExpired(now);
    }

    // Get or create record for this key
    let record = store.get(fullKey);

    // Check if window has expired
    if (record && now - record.windowStart >= config.windowMs) {
      // Window expired, start fresh
      record = undefined;
      store.delete(fullKey);
    }

    // Create new record if needed
    if (!record) {
      record = {
        count: 0,
        windowStart: now,
      };
    }

    // Calculate reset time
    const resetAt = record.windowStart + config.windowMs;

    // Handle zero maxRequests (deny all)
    if (config.maxRequests === 0) {
      return buildResult(false, 0, 0, resetAt, now);
    }

    // Check if request is allowed
    const allowed = record.count < config.maxRequests;

    // Increment count if allowed
    if (allowed) {
      record.count++;
      store.set(fullKey, record);
    }

    // Calculate remaining
    const remaining = Math.max(0, config.maxRequests - record.count);

    return buildResult(allowed, config.maxRequests, remaining, resetAt, now);
  }

  /**
   * Build the rate limit result with headers
   */
  function buildResult(
    allowed: boolean,
    limit: number,
    remaining: number,
    resetAt: number,
    now: number
  ): RateLimitResult {
    // Calculate reset in Unix seconds
    const resetUnixSeconds = Math.ceil(resetAt / 1000);

    // Build headers
    const headers: RateLimitHeaders = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetUnixSeconds.toString(),
    };

    // Add Retry-After if rate limited
    if (!allowed) {
      const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);
      headers['Retry-After'] = Math.max(1, retryAfterSeconds).toString();
    }

    return {
      allowed,
      limit,
      remaining,
      resetAt,
      headers,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  function reset(key: string): void {
    const fullKey = getFullKey(key);
    store.delete(fullKey);
  }

  return {
    check,
    reset,
  };
}

/**
 * Convenience function to create rate limiter for API endpoints
 *
 * @example
 * ```ts
 * const apiLimiter = createApiRateLimiter(100, 60000);
 * const result = apiLimiter.check(request.ip);
 * ```
 */
export function createApiRateLimiter(
  maxRequests: number = 100,
  windowMs: number = 60000
): RateLimiter {
  return createRateLimiter({
    maxRequests,
    windowMs,
    keyPrefix: 'api:',
  });
}

/**
 * Convenience function to create stricter rate limiter for auth endpoints
 *
 * @example
 * ```ts
 * const authLimiter = createAuthRateLimiter();
 * const result = authLimiter.check(request.ip);
 * ```
 */
export function createAuthRateLimiter(
  maxRequests: number = 5,
  windowMs: number = 60000
): RateLimiter {
  return createRateLimiter({
    maxRequests,
    windowMs,
    keyPrefix: 'auth:',
  });
}

/**
 * Extract client identifier from request for rate limiting
 * Falls back to a default key if no identifier available
 *
 * @param headers - Request headers
 * @returns Client identifier key
 */
export function getClientKey(headers: Headers | Map<string, string>): string {
  // Try common headers for client identification
  const headersMap = headers instanceof Map ? headers : new Map(headers.entries());

  // Prefer X-Forwarded-For (set by proxies/CDN)
  const forwardedFor = headersMap.get('x-forwarded-for');
  if (forwardedFor) {
    // Use first IP in chain (original client)
    return forwardedFor.split(',')[0].trim();
  }

  // Fall back to X-Real-IP (set by some proxies)
  const realIp = headersMap.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fall back to CF-Connecting-IP (Cloudflare)
  const cfIp = headersMap.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  // Default key for anonymous requests
  return 'anonymous';
}
