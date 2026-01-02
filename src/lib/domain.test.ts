/**
 * TDD: Domain Detection Tests
 * ============================
 * RED PHASE: These tests define the behavior we WANT.
 * They will FAIL until we implement the domain.ts module.
 *
 * Requirements:
 * 1. Detect if we're on the custom domain (ralphhhbenedict.com)
 * 2. Detect if we're on the profile subdomain (profile.resu-me.ai)
 * 3. Extract username from /@username path pattern
 * 4. Provide analytics source for tracking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDomainType,
  getUsername,
  getAnalyticsSource,
  isCustomDomain,
  isProfileSubdomain,
} from './domain';

describe('Domain Detection (TDD)', () => {
  describe('getDomainType', () => {
    it('returns "custom" for ralphhhbenedict.com', () => {
      const result = getDomainType('ralphhhbenedict.com');
      expect(result).toBe('custom');
    });

    it('returns "custom" for www.ralphhhbenedict.com', () => {
      const result = getDomainType('www.ralphhhbenedict.com');
      expect(result).toBe('custom');
    });

    it('returns "profile" for profile.resu-me.ai', () => {
      const result = getDomainType('profile.resu-me.ai');
      expect(result).toBe('profile');
    });

    it('returns "localhost" for localhost', () => {
      const result = getDomainType('localhost');
      expect(result).toBe('localhost');
    });

    it('returns "unknown" for unrecognized domains', () => {
      const result = getDomainType('example.com');
      expect(result).toBe('unknown');
    });
  });

  describe('isCustomDomain', () => {
    it('returns true for ralphhhbenedict.com', () => {
      expect(isCustomDomain('ralphhhbenedict.com')).toBe(true);
    });

    it('returns false for profile.resu-me.ai', () => {
      expect(isCustomDomain('profile.resu-me.ai')).toBe(false);
    });
  });

  describe('isProfileSubdomain', () => {
    it('returns true for profile.resu-me.ai', () => {
      expect(isProfileSubdomain('profile.resu-me.ai')).toBe(true);
    });

    it('returns false for ralphhhbenedict.com', () => {
      expect(isProfileSubdomain('ralphhhbenedict.com')).toBe(false);
    });
  });

  describe('getUsername', () => {
    it('extracts username from /@username path', () => {
      const result = getUsername('/@ralphhhbenedict');
      expect(result).toBe('ralphhhbenedict');
    });

    it('extracts username from /@username/subpath', () => {
      const result = getUsername('/@johndoe/case-studies');
      expect(result).toBe('johndoe');
    });

    it('returns null for root path /', () => {
      const result = getUsername('/');
      expect(result).toBeNull();
    });

    it('returns null for paths without @ prefix', () => {
      const result = getUsername('/about');
      expect(result).toBeNull();
    });

    it('returns the default username for custom domain root', () => {
      // On ralphhhbenedict.com, / should resolve to ralphhhbenedict
      const result = getUsername('/', 'ralphhhbenedict.com');
      expect(result).toBe('ralphhhbenedict');
    });
  });

  describe('getAnalyticsSource', () => {
    it('returns "custom_domain" for ralphhhbenedict.com', () => {
      const result = getAnalyticsSource('ralphhhbenedict.com');
      expect(result).toBe('custom_domain');
    });

    it('returns "profile_subdomain" for profile.resu-me.ai', () => {
      const result = getAnalyticsSource('profile.resu-me.ai');
      expect(result).toBe('profile_subdomain');
    });

    it('returns "development" for localhost', () => {
      const result = getAnalyticsSource('localhost');
      expect(result).toBe('development');
    });
  });
});

describe('Domain + Path Integration (TDD)', () => {
  it('resolves username on custom domain root', () => {
    // When on ralphhhbenedict.com at /
    // Should resolve to username: "ralphhhbenedict"
    const domain = 'ralphhhbenedict.com';
    const path = '/';
    const username = getUsername(path, domain);
    expect(username).toBe('ralphhhbenedict');
  });

  it('resolves username on profile subdomain with @path', () => {
    // When on profile.resu-me.ai at /@ralphhhbenedict
    // Should resolve to username: "ralphhhbenedict"
    const domain = 'profile.resu-me.ai';
    const path = '/@ralphhhbenedict';
    const username = getUsername(path, domain);
    expect(username).toBe('ralphhhbenedict');
  });
});
