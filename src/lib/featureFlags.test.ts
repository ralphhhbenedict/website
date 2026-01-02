/**
 * TDD: Feature Flags System Tests
 * ================================
 * RED PHASE: These tests define the behavior we WANT.
 * They will FAIL until we implement the featureFlags.ts module.
 *
 * Requirements:
 * 1. FeatureFlags enum with flags: CUSTOM_DOMAINS, VISIBILITY_CONTROLS, ANALYTICS_V2
 * 2. isFeatureEnabled(flag, userId?) - check if feature is on
 * 3. getEnabledFeatures(userId?) - get all enabled features
 * 4. Support for: global flags, percentage rollout, user-specific overrides
 * 5. Environment variable configuration (VITE_FF_* prefix)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  FeatureFlags,
  isFeatureEnabled,
  getEnabledFeatures,
  getFeatureFlagConfig,
  hashUserId,
  type FeatureFlagConfig,
} from './featureFlags';

describe('Feature Flags System (TDD)', () => {
  // Store original env vars to restore after tests
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Reset env vars before each test
    vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', undefined);
    vi.stubEnv('VITE_FF_VISIBILITY_CONTROLS', undefined);
    vi.stubEnv('VITE_FF_ANALYTICS_V2', undefined);
    vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', undefined);
    vi.stubEnv('VITE_FF_VISIBILITY_CONTROLS_PERCENTAGE', undefined);
    vi.stubEnv('VITE_FF_ANALYTICS_V2_PERCENTAGE', undefined);
    vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_USERS', undefined);
    vi.stubEnv('VITE_FF_VISIBILITY_CONTROLS_USERS', undefined);
    vi.stubEnv('VITE_FF_ANALYTICS_V2_USERS', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('FeatureFlags Enum', () => {
    it('has CUSTOM_DOMAINS flag', () => {
      expect(FeatureFlags.CUSTOM_DOMAINS).toBe('CUSTOM_DOMAINS');
    });

    it('has VISIBILITY_CONTROLS flag', () => {
      expect(FeatureFlags.VISIBILITY_CONTROLS).toBe('VISIBILITY_CONTROLS');
    });

    it('has ANALYTICS_V2 flag', () => {
      expect(FeatureFlags.ANALYTICS_V2).toBe('ANALYTICS_V2');
    });
  });

  describe('Global Flag: isFeatureEnabled', () => {
    it('returns false when flag is not set', () => {
      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS)).toBe(false);
    });

    it('returns true when flag is set to "true"', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS)).toBe(true);
    });

    it('returns false when flag is set to "false"', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'false');
      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS)).toBe(false);
    });

    it('returns true when flag is set to "1"', () => {
      vi.stubEnv('VITE_FF_VISIBILITY_CONTROLS', '1');
      expect(isFeatureEnabled(FeatureFlags.VISIBILITY_CONTROLS)).toBe(true);
    });

    it('returns false for invalid flag values', () => {
      vi.stubEnv('VITE_FF_ANALYTICS_V2', 'invalid');
      expect(isFeatureEnabled(FeatureFlags.ANALYTICS_V2)).toBe(false);
    });
  });

  describe('Percentage Rollout: isFeatureEnabled', () => {
    it('enables for users within rollout percentage', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '100');
      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, 'user123')).toBe(true);
    });

    it('disables for 0% rollout', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '0');
      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, 'user123')).toBe(false);
    });

    it('provides deterministic results for same userId', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '50');

      const userId = 'consistent-user-id';
      const result1 = isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, userId);
      const result2 = isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, userId);

      expect(result1).toBe(result2); // Should always be the same
    });

    it('distributes users across percentage threshold', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '50');

      // Generate many users and check distribution
      const results: boolean[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, `user-${i}`));
      }

      const enabledCount = results.filter(Boolean).length;
      // With 50% rollout, we expect roughly 40-60 users enabled (allowing variance)
      expect(enabledCount).toBeGreaterThan(30);
      expect(enabledCount).toBeLessThan(70);
    });

    it('ignores percentage when no userId provided', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '50');

      // Without userId, should just check global flag
      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS)).toBe(true);
    });
  });

  describe('User-Specific Overrides: isFeatureEnabled', () => {
    it('enables for user in allowlist even when global is off', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'false');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_USERS', 'user-alpha,user-beta,user-gamma');

      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, 'user-alpha')).toBe(true);
      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, 'user-beta')).toBe(true);
    });

    it('returns false for user not in allowlist when global is off', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'false');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_USERS', 'user-alpha,user-beta');

      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, 'user-other')).toBe(false);
    });

    it('allowlist takes precedence over percentage rollout', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '0'); // 0% rollout
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_USERS', 'special-user');

      // Should be enabled because user is in allowlist
      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, 'special-user')).toBe(true);
    });

    it('handles whitespace in user list', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'false');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_USERS', 'user-alpha, user-beta , user-gamma');

      expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, 'user-beta')).toBe(true);
    });
  });

  describe('getEnabledFeatures', () => {
    it('returns empty array when no flags enabled', () => {
      const features = getEnabledFeatures();
      expect(features).toEqual([]);
    });

    it('returns all enabled global flags', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_ANALYTICS_V2', 'true');

      const features = getEnabledFeatures();
      expect(features).toContain(FeatureFlags.CUSTOM_DOMAINS);
      expect(features).toContain(FeatureFlags.ANALYTICS_V2);
      expect(features).not.toContain(FeatureFlags.VISIBILITY_CONTROLS);
    });

    it('includes user-specific flags when userId provided', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'false');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_USERS', 'special-user');
      vi.stubEnv('VITE_FF_ANALYTICS_V2', 'true');

      const features = getEnabledFeatures('special-user');
      expect(features).toContain(FeatureFlags.CUSTOM_DOMAINS);
      expect(features).toContain(FeatureFlags.ANALYTICS_V2);
    });

    it('respects percentage rollout for userId', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '100');

      const features = getEnabledFeatures('any-user');
      expect(features).toContain(FeatureFlags.CUSTOM_DOMAINS);
    });
  });

  describe('getFeatureFlagConfig', () => {
    it('returns config with default values when no env vars set', () => {
      const config = getFeatureFlagConfig(FeatureFlags.CUSTOM_DOMAINS);

      expect(config).toEqual({
        enabled: false,
        percentage: null,
        allowedUsers: [],
      });
    });

    it('parses all configuration correctly', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '75');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_USERS', 'user1,user2');

      const config = getFeatureFlagConfig(FeatureFlags.CUSTOM_DOMAINS);

      expect(config).toEqual({
        enabled: true,
        percentage: 75,
        allowedUsers: ['user1', 'user2'],
      });
    });

    it('handles invalid percentage gracefully', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', 'not-a-number');

      const config = getFeatureFlagConfig(FeatureFlags.CUSTOM_DOMAINS);
      expect(config.percentage).toBeNull();
    });
  });

  describe('hashUserId', () => {
    it('returns consistent hash for same userId and flag', () => {
      const hash1 = hashUserId('user123', FeatureFlags.CUSTOM_DOMAINS);
      const hash2 = hashUserId('user123', FeatureFlags.CUSTOM_DOMAINS);
      expect(hash1).toBe(hash2);
    });

    it('returns different hash for different userIds', () => {
      const hash1 = hashUserId('user123', FeatureFlags.CUSTOM_DOMAINS);
      const hash2 = hashUserId('user456', FeatureFlags.CUSTOM_DOMAINS);
      expect(hash1).not.toBe(hash2);
    });

    it('returns different hash for same userId but different flags', () => {
      const hash1 = hashUserId('user123', FeatureFlags.CUSTOM_DOMAINS);
      const hash2 = hashUserId('user123', FeatureFlags.ANALYTICS_V2);
      expect(hash1).not.toBe(hash2);
    });

    it('returns value between 0 and 100', () => {
      for (let i = 0; i < 100; i++) {
        const hash = hashUserId(`user-${i}`, FeatureFlags.CUSTOM_DOMAINS);
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(hash).toBeLessThan(100);
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles empty userId string', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '50');

      // Empty string should still work deterministically
      const result = isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, '');
      expect(typeof result).toBe('boolean');
    });

    it('handles special characters in userId', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '50');

      const result = isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, 'user@example.com');
      expect(typeof result).toBe('boolean');
    });

    it('handles very long userId', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '50');

      const longUserId = 'a'.repeat(1000);
      const result = isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, longUserId);
      expect(typeof result).toBe('boolean');
    });

    it('percentage of 100 enables for all users', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '100');

      // All users should be enabled
      for (let i = 0; i < 50; i++) {
        expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, `user-${i}`)).toBe(true);
      }
    });

    it('percentage of 0 disables for all users', () => {
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS', 'true');
      vi.stubEnv('VITE_FF_CUSTOM_DOMAINS_PERCENTAGE', '0');

      // All users should be disabled (unless in allowlist)
      for (let i = 0; i < 50; i++) {
        expect(isFeatureEnabled(FeatureFlags.CUSTOM_DOMAINS, `user-${i}`)).toBe(false);
      }
    });
  });
});
