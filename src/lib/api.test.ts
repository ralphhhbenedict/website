/**
 * TDD: Profile API Logic Tests
 * ============================
 * RED PHASE: These tests define the behavior we WANT.
 * They will FAIL until we implement the api.ts module.
 *
 * Requirements:
 * 1. Validate username format (alphanumeric, 3-30 chars)
 * 2. Check reserved words (admin, api, profile, etc.)
 * 3. Check username availability (mock database)
 * 4. Get profile data by username
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateUsername,
  isReservedWord,
  checkUsernameAvailability,
  getProfileByUsername,
  type ProfileData,
  type ValidationResult,
  type UsernameAvailabilityResult,
} from './api';

describe('Profile API Logic (TDD)', () => {
  describe('validateUsername', () => {
    it('accepts valid usernames', () => {
      expect(validateUsername('johndoe').valid).toBe(true);
      expect(validateUsername('john_doe').valid).toBe(true);
      expect(validateUsername('john123').valid).toBe(true);
      expect(validateUsername('JohnDoe').valid).toBe(true);
    });

    it('rejects usernames shorter than 3 characters', () => {
      const result = validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('3');
    });

    it('rejects usernames longer than 30 characters', () => {
      const result = validateUsername('a'.repeat(31));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('30');
    });

    it('rejects usernames with special characters', () => {
      expect(validateUsername('john@doe').valid).toBe(false);
      expect(validateUsername('john doe').valid).toBe(false);
      expect(validateUsername('john.doe').valid).toBe(false);
      expect(validateUsername('john-doe').valid).toBe(false);
    });

    it('rejects usernames starting with underscore or number', () => {
      expect(validateUsername('_johndoe').valid).toBe(false);
      expect(validateUsername('123john').valid).toBe(false);
    });

    it('accepts usernames with underscores in middle', () => {
      expect(validateUsername('john_doe').valid).toBe(true);
      expect(validateUsername('john_doe_123').valid).toBe(true);
    });
  });

  describe('isReservedWord', () => {
    it('identifies reserved system words', () => {
      expect(isReservedWord('admin')).toBe(true);
      expect(isReservedWord('api')).toBe(true);
      expect(isReservedWord('profile')).toBe(true);
      expect(isReservedWord('settings')).toBe(true);
      expect(isReservedWord('login')).toBe(true);
      expect(isReservedWord('signup')).toBe(true);
      expect(isReservedWord('help')).toBe(true);
      expect(isReservedWord('support')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(isReservedWord('ADMIN')).toBe(true);
      expect(isReservedWord('Admin')).toBe(true);
      expect(isReservedWord('AdMiN')).toBe(true);
    });

    it('returns false for non-reserved words', () => {
      expect(isReservedWord('johndoe')).toBe(false);
      expect(isReservedWord('ralphhhbenedict')).toBe(false);
      expect(isReservedWord('myusername')).toBe(false);
    });
  });

  describe('checkUsernameAvailability', () => {
    // Mock database lookup
    const mockTakenUsernames = ['ralphhhbenedict', 'johndoe', 'janedoe'];

    it('returns available for unused username', async () => {
      const result = await checkUsernameAvailability('newuser', mockTakenUsernames);
      expect(result.available).toBe(true);
    });

    it('returns unavailable for taken username', async () => {
      const result = await checkUsernameAvailability('johndoe', mockTakenUsernames);
      expect(result.available).toBe(false);
      expect(result.reason).toContain('taken');
    });

    it('returns unavailable for reserved words', async () => {
      const result = await checkUsernameAvailability('admin', []);
      expect(result.available).toBe(false);
      expect(result.reason).toContain('reserved');
    });

    it('returns unavailable for invalid format', async () => {
      const result = await checkUsernameAvailability('ab', []);
      expect(result.available).toBe(false);
      expect(result.reason).toContain('Invalid');
    });

    it('is case-insensitive for availability check', async () => {
      const result = await checkUsernameAvailability('JohnDoe', mockTakenUsernames);
      expect(result.available).toBe(false);
    });
  });

  describe('getProfileByUsername', () => {
    // Mock profile data
    const mockProfiles: Record<string, ProfileData> = {
      ralphhhbenedict: {
        username: 'ralphhhbenedict',
        displayName: 'Ralph Benedict',
        bio: 'Tech entrepreneur and product designer',
        avatarUrl: 'https://example.com/avatar.jpg',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/ralphhhbenedict',
          twitter: 'https://twitter.com/ralphhhbenedict',
        },
        sections: ['hero', 'case-studies', 'seven-hats', 'how-i-work'],
        customDomain: 'ralphhhbenedict.com',
        createdAt: '2025-01-01T00:00:00Z',
      },
    };

    it('returns profile data for valid username', async () => {
      const result = await getProfileByUsername('ralphhhbenedict', mockProfiles);
      expect(result).not.toBeNull();
      expect(result?.username).toBe('ralphhhbenedict');
      expect(result?.displayName).toBe('Ralph Benedict');
    });

    it('returns null for non-existent username', async () => {
      const result = await getProfileByUsername('nonexistent', mockProfiles);
      expect(result).toBeNull();
    });

    it('is case-insensitive', async () => {
      const result = await getProfileByUsername('RalphhhBenedict', mockProfiles);
      expect(result).not.toBeNull();
      expect(result?.username).toBe('ralphhhbenedict');
    });

    it('includes all profile fields', async () => {
      const result = await getProfileByUsername('ralphhhbenedict', mockProfiles);
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('displayName');
      expect(result).toHaveProperty('bio');
      expect(result).toHaveProperty('avatarUrl');
      expect(result).toHaveProperty('socialLinks');
      expect(result).toHaveProperty('sections');
      expect(result).toHaveProperty('customDomain');
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('Integration: Username Registration Flow', () => {
    const mockTakenUsernames = ['ralphhhbenedict'];

    it('validates format before checking availability', async () => {
      // First check format
      const validation = validateUsername('@invalid');
      expect(validation.valid).toBe(false);

      // If invalid format, don't even check availability
      if (!validation.valid) {
        // This is expected - we stop here
        expect(validation.error).toBeDefined();
      }
    });

    it('completes full availability check flow', async () => {
      const username = 'newuser123';

      // Step 1: Validate format
      const validation = validateUsername(username);
      expect(validation.valid).toBe(true);

      // Step 2: Check if reserved
      expect(isReservedWord(username)).toBe(false);

      // Step 3: Check availability in database
      const availability = await checkUsernameAvailability(username, mockTakenUsernames);
      expect(availability.available).toBe(true);
    });
  });
});
