/**
 * TDD: Rate Limiting Tests
 * ========================
 * RED PHASE: These tests define the behavior we WANT.
 * They will FAIL until we implement the rateLimit.ts module.
 *
 * Requirements (RES-523):
 * 1. createRateLimiter(options) - factory function
 * 2. checkRateLimit(key) - check if request allowed
 * 3. Options: windowMs, maxRequests, keyPrefix
 * 4. Use in-memory store (Map) for now
 * 5. Return rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createRateLimiter,
  type RateLimiterOptions,
  type RateLimitResult,
  type RateLimiter,
} from './rateLimit';

describe('Rate Limiting (TDD)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createRateLimiter', () => {
    it('creates a rate limiter with default options', () => {
      const limiter = createRateLimiter();

      expect(limiter).toBeDefined();
      expect(typeof limiter.check).toBe('function');
      expect(typeof limiter.reset).toBe('function');
    });

    it('creates a rate limiter with custom options', () => {
      const limiter = createRateLimiter({
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        keyPrefix: 'api:',
      });

      expect(limiter).toBeDefined();
    });

    it('accepts partial options with defaults for missing values', () => {
      const limiter = createRateLimiter({
        maxRequests: 50,
      });

      expect(limiter).toBeDefined();
    });
  });

  describe('checkRateLimit', () => {
    let limiter: RateLimiter;

    beforeEach(() => {
      limiter = createRateLimiter({
        windowMs: 60000, // 1 minute
        maxRequests: 5,
        keyPrefix: 'test:',
      });
    });

    it('allows requests under the limit', () => {
      const result = limiter.check('user-123');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 max - 1 used
      expect(result.limit).toBe(5);
    });

    it('tracks requests per unique key', () => {
      // User A makes 3 requests
      limiter.check('user-a');
      limiter.check('user-a');
      const resultA = limiter.check('user-a');

      // User B makes 1 request
      const resultB = limiter.check('user-b');

      expect(resultA.remaining).toBe(2); // 5 - 3 = 2
      expect(resultB.remaining).toBe(4); // 5 - 1 = 4
    });

    it('blocks requests over the limit', () => {
      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        limiter.check('user-123');
      }

      // 6th request should be blocked
      const result = limiter.check('user-123');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('includes reset timestamp in result', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = limiter.check('user-123');

      // Reset should be windowMs from now
      expect(result.resetAt).toBe(now + 60000);
    });

    it('resets counter after window expires', () => {
      // Make 5 requests (exhaust limit)
      for (let i = 0; i < 5; i++) {
        limiter.check('user-123');
      }

      // Verify blocked
      expect(limiter.check('user-123').allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(60001);

      // Should be allowed again
      const result = limiter.check('user-123');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('applies key prefix to stored keys', () => {
      const prefixedLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        keyPrefix: 'api:v1:',
      });

      // This internally stores as 'api:v1:user-123'
      const result = prefixedLimiter.check('user-123');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Rate Limit Headers', () => {
    let limiter: RateLimiter;

    beforeEach(() => {
      limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 100,
      });
    });

    it('returns X-RateLimit-Limit header value', () => {
      const result = limiter.check('user-123');

      expect(result.headers['X-RateLimit-Limit']).toBe('100');
    });

    it('returns X-RateLimit-Remaining header value', () => {
      const result = limiter.check('user-123');

      expect(result.headers['X-RateLimit-Remaining']).toBe('99');
    });

    it('returns X-RateLimit-Reset header value', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = limiter.check('user-123');

      // Reset is Unix timestamp in seconds
      const expectedReset = Math.ceil((now + 60000) / 1000);
      expect(result.headers['X-RateLimit-Reset']).toBe(expectedReset.toString());
    });

    it('returns Retry-After header when rate limited', () => {
      // Exhaust the limit
      for (let i = 0; i < 100; i++) {
        limiter.check('user-123');
      }

      const now = Date.now();
      vi.setSystemTime(now);

      const result = limiter.check('user-123');

      expect(result.allowed).toBe(false);
      expect(result.headers['Retry-After']).toBeDefined();
      // Retry-After should be seconds until reset
      const retryAfter = parseInt(result.headers['Retry-After']!);
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(60);
    });
  });

  describe('reset', () => {
    it('clears rate limit for a specific key', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        limiter.check('user-123');
      }
      expect(limiter.check('user-123').allowed).toBe(false);

      // Reset the key
      limiter.reset('user-123');

      // Should be allowed again with fresh count
      const result = limiter.check('user-123');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 - 1 = 4 (this check counts as 1)
    });

    it('only clears the specified key', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      // Both users make requests
      limiter.check('user-a');
      limiter.check('user-a');
      limiter.check('user-b');

      // Reset only user-a
      limiter.reset('user-a');

      // user-a should be fresh, user-b unchanged
      expect(limiter.check('user-a').remaining).toBe(4); // Fresh start
      expect(limiter.check('user-b').remaining).toBe(3); // Had 1 request, now 2
    });
  });

  describe('Edge Cases', () => {
    it('handles empty key gracefully', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      const result = limiter.check('');

      expect(result.allowed).toBe(true);
    });

    it('handles very short window (1ms)', () => {
      const limiter = createRateLimiter({
        windowMs: 1,
        maxRequests: 1,
      });

      limiter.check('user-123');

      // Wait for window to expire
      vi.advanceTimersByTime(2);

      const result = limiter.check('user-123');
      expect(result.allowed).toBe(true);
    });

    it('handles concurrent requests to same key', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      // Simulate concurrent requests
      const results = [
        limiter.check('user-123'),
        limiter.check('user-123'),
        limiter.check('user-123'),
      ];

      // All should be allowed but with decreasing remaining
      expect(results[0].remaining).toBe(4);
      expect(results[1].remaining).toBe(3);
      expect(results[2].remaining).toBe(2);
    });

    it('handles zero maxRequests (deny all)', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 0,
      });

      const result = limiter.check('user-123');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('Default Options', () => {
    it('uses sensible defaults when no options provided', () => {
      const limiter = createRateLimiter();

      // Default should allow reasonable number of requests
      const result = limiter.check('user-123');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBeGreaterThan(0);
      expect(result.remaining).toBe(result.limit - 1);
    });
  });

  describe('API Endpoint Rate Limiting', () => {
    it('supports different limits for different endpoints', () => {
      const apiLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: 'api:',
      });

      const authLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5, // Stricter for auth endpoints
        keyPrefix: 'auth:',
      });

      // Both limiters track independently
      const apiResult = apiLimiter.check('user-123');
      const authResult = authLimiter.check('user-123');

      expect(apiResult.limit).toBe(100);
      expect(authResult.limit).toBe(5);
    });
  });
});
