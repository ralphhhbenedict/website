/**
 * TDD: Data Export Tests (GDPR Compliance)
 * =========================================
 * RED PHASE: These tests define the data export behavior for GDPR compliance.
 * They will FAIL until we implement the dataExport.ts module.
 *
 * Requirements (RES-524):
 * 1. exportProfileData(username) - gather all user data
 * 2. formatAsJSON(data) - structured JSON export
 * 3. formatAsCSV(data) - CSV format for spreadsheets
 * 4. generateExportBundle(username) - create downloadable package
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportProfileData,
  formatAsJSON,
  formatAsCSV,
  generateExportBundle,
  type ExportData,
  type ExportBundle,
} from './dataExport';
import type { ProfileData } from './api';

// ============================================================================
// Test Data
// ============================================================================

const mockProfiles: Record<string, ProfileData> = {
  ralphhhbenedict: {
    username: 'ralphhhbenedict',
    displayName: 'Ralph Benedict',
    bio: 'Tech entrepreneur and product designer building AI-powered career tools.',
    avatarUrl: 'https://ralphhhbenedict.com/avatar.jpg',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/ralphhhbenedict',
      twitter: 'https://twitter.com/ralphhhbenedict',
      github: 'https://github.com/ralphhhbenedict',
      email: 'ralph@resu-me.ai',
    },
    sections: ['hero', 'case-studies', 'seven-hats', 'how-i-work'],
    customDomain: 'ralphhhbenedict.com',
    createdAt: '2025-01-01T00:00:00Z',
  },
  testuser: {
    username: 'testuser',
    displayName: 'Test User',
    bio: 'A test user with minimal data',
    avatarUrl: '',
    socialLinks: {},
    sections: ['hero'],
    createdAt: '2025-06-15T12:00:00Z',
  },
};

// ============================================================================
// Tests: exportProfileData
// ============================================================================

describe('Data Export Module (TDD)', () => {
  describe('exportProfileData', () => {
    it('returns all user data for a valid username', async () => {
      const result = await exportProfileData('ralphhhbenedict', mockProfiles);

      expect(result).not.toBeNull();
      expect(result?.profile.username).toBe('ralphhhbenedict');
      expect(result?.profile.displayName).toBe('Ralph Benedict');
    });

    it('returns null for non-existent username', async () => {
      const result = await exportProfileData('nonexistent', mockProfiles);
      expect(result).toBeNull();
    });

    it('is case-insensitive for username lookup', async () => {
      const result = await exportProfileData('RalphhhBenedict', mockProfiles);

      expect(result).not.toBeNull();
      expect(result?.profile.username).toBe('ralphhhbenedict');
    });

    it('includes export metadata', async () => {
      const result = await exportProfileData('ralphhhbenedict', mockProfiles);

      expect(result).not.toBeNull();
      expect(result?.exportedAt).toBeDefined();
      expect(result?.exportVersion).toBeDefined();
      expect(result?.exportFormat).toBe('GDPR_EXPORT_V1');
    });

    it('includes all profile fields in export', async () => {
      const result = await exportProfileData('ralphhhbenedict', mockProfiles);

      expect(result).not.toBeNull();
      expect(result?.profile).toHaveProperty('username');
      expect(result?.profile).toHaveProperty('displayName');
      expect(result?.profile).toHaveProperty('bio');
      expect(result?.profile).toHaveProperty('avatarUrl');
      expect(result?.profile).toHaveProperty('socialLinks');
      expect(result?.profile).toHaveProperty('sections');
      expect(result?.profile).toHaveProperty('createdAt');
    });

    it('handles profiles with optional customDomain', async () => {
      const withDomain = await exportProfileData('ralphhhbenedict', mockProfiles);
      const withoutDomain = await exportProfileData('testuser', mockProfiles);

      expect(withDomain?.profile.customDomain).toBe('ralphhhbenedict.com');
      expect(withoutDomain?.profile.customDomain).toBeUndefined();
    });
  });

  // ============================================================================
  // Tests: formatAsJSON
  // ============================================================================

  describe('formatAsJSON', () => {
    let exportData: ExportData;

    beforeEach(async () => {
      const result = await exportProfileData('ralphhhbenedict', mockProfiles);
      if (result) {
        exportData = result;
      }
    });

    it('returns valid JSON string', () => {
      const jsonString = formatAsJSON(exportData);

      expect(() => JSON.parse(jsonString)).not.toThrow();
    });

    it('preserves all data in JSON format', () => {
      const jsonString = formatAsJSON(exportData);
      const parsed = JSON.parse(jsonString);

      expect(parsed.profile.username).toBe('ralphhhbenedict');
      expect(parsed.profile.displayName).toBe('Ralph Benedict');
      expect(parsed.exportFormat).toBe('GDPR_EXPORT_V1');
    });

    it('formats JSON with proper indentation (human-readable)', () => {
      const jsonString = formatAsJSON(exportData);

      // Should be multi-line (indented)
      expect(jsonString).toContain('\n');
      expect(jsonString).toContain('  '); // 2-space indentation
    });

    it('includes socialLinks in JSON output', () => {
      const jsonString = formatAsJSON(exportData);
      const parsed = JSON.parse(jsonString);

      expect(parsed.profile.socialLinks.linkedin).toBe('https://linkedin.com/in/ralphhhbenedict');
      expect(parsed.profile.socialLinks.twitter).toBe('https://twitter.com/ralphhhbenedict');
    });
  });

  // ============================================================================
  // Tests: formatAsCSV
  // ============================================================================

  describe('formatAsCSV', () => {
    let exportData: ExportData;

    beforeEach(async () => {
      const result = await exportProfileData('ralphhhbenedict', mockProfiles);
      if (result) {
        exportData = result;
      }
    });

    it('returns valid CSV string with headers', () => {
      const csvString = formatAsCSV(exportData);
      const lines = csvString.trim().split('\n');

      expect(lines.length).toBeGreaterThanOrEqual(2); // header + at least 1 data row
      expect(lines[0]).toContain('field');
      expect(lines[0]).toContain('value');
    });

    it('includes username in CSV output', () => {
      const csvString = formatAsCSV(exportData);

      expect(csvString).toContain('username');
      expect(csvString).toContain('ralphhhbenedict');
    });

    it('includes displayName in CSV output', () => {
      const csvString = formatAsCSV(exportData);

      expect(csvString).toContain('displayName');
      expect(csvString).toContain('Ralph Benedict');
    });

    it('flattens socialLinks into separate rows', () => {
      const csvString = formatAsCSV(exportData);

      expect(csvString).toContain('socialLinks.linkedin');
      expect(csvString).toContain('socialLinks.twitter');
      expect(csvString).toContain('socialLinks.github');
      expect(csvString).toContain('socialLinks.email');
    });

    it('handles sections array properly', () => {
      const csvString = formatAsCSV(exportData);

      expect(csvString).toContain('sections');
      // Sections should be comma-separated or JSON-encoded
      expect(csvString).toMatch(/hero.*case-studies|"hero,case-studies/);
    });

    it('escapes values containing commas', () => {
      // Create test data with comma in value
      const dataWithComma: ExportData = {
        profile: {
          ...mockProfiles.ralphhhbenedict,
          bio: 'Tech entrepreneur, product designer, and builder',
        },
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0.0',
        exportFormat: 'GDPR_EXPORT_V1',
      };

      const csvString = formatAsCSV(dataWithComma);

      // Value with comma should be quoted
      expect(csvString).toMatch(/".*Tech entrepreneur, product designer.*"/);
    });

    it('escapes values containing quotes', () => {
      const dataWithQuote: ExportData = {
        profile: {
          ...mockProfiles.ralphhhbenedict,
          bio: 'He said "hello" to the world',
        },
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0.0',
        exportFormat: 'GDPR_EXPORT_V1',
      };

      const csvString = formatAsCSV(dataWithQuote);

      // Quotes should be escaped with double quotes
      expect(csvString).toContain('""hello""');
    });
  });

  // ============================================================================
  // Tests: generateExportBundle
  // ============================================================================

  describe('generateExportBundle', () => {
    it('returns an export bundle for valid username', async () => {
      const bundle = await generateExportBundle('ralphhhbenedict', mockProfiles);

      expect(bundle).not.toBeNull();
      expect(bundle?.username).toBe('ralphhhbenedict');
    });

    it('returns null for non-existent username', async () => {
      const bundle = await generateExportBundle('nonexistent', mockProfiles);
      expect(bundle).toBeNull();
    });

    it('includes JSON export in bundle', async () => {
      const bundle = await generateExportBundle('ralphhhbenedict', mockProfiles);

      expect(bundle).not.toBeNull();
      expect(bundle?.json).toBeDefined();
      expect(() => JSON.parse(bundle!.json)).not.toThrow();
    });

    it('includes CSV export in bundle', async () => {
      const bundle = await generateExportBundle('ralphhhbenedict', mockProfiles);

      expect(bundle).not.toBeNull();
      expect(bundle?.csv).toBeDefined();
      expect(bundle?.csv).toContain('field,value');
    });

    it('includes filename suggestions', async () => {
      const bundle = await generateExportBundle('ralphhhbenedict', mockProfiles);

      expect(bundle).not.toBeNull();
      expect(bundle?.filenames.json).toMatch(/ralphhhbenedict.*\.json$/);
      expect(bundle?.filenames.csv).toMatch(/ralphhhbenedict.*\.csv$/);
    });

    it('includes timestamp in filenames', async () => {
      const bundle = await generateExportBundle('ralphhhbenedict', mockProfiles);

      expect(bundle).not.toBeNull();
      // Filename should include date like "2025-01-02"
      const datePattern = /\d{4}-\d{2}-\d{2}/;
      expect(bundle?.filenames.json).toMatch(datePattern);
      expect(bundle?.filenames.csv).toMatch(datePattern);
    });

    it('includes export metadata', async () => {
      const bundle = await generateExportBundle('ralphhhbenedict', mockProfiles);

      expect(bundle).not.toBeNull();
      expect(bundle?.exportedAt).toBeDefined();
      expect(bundle?.format).toBe('GDPR_EXPORT_V1');
    });
  });

  // ============================================================================
  // Tests: Integration - Full Export Flow
  // ============================================================================

  describe('Integration: Full Export Flow', () => {
    it('exports data and produces valid JSON and CSV', async () => {
      const bundle = await generateExportBundle('ralphhhbenedict', mockProfiles);

      expect(bundle).not.toBeNull();

      // Verify JSON
      const jsonData = JSON.parse(bundle!.json);
      expect(jsonData.profile.username).toBe('ralphhhbenedict');

      // Verify CSV has same data
      expect(bundle!.csv).toContain('ralphhhbenedict');
      expect(bundle!.csv).toContain('Ralph Benedict');
    });

    it('handles user with minimal data', async () => {
      const bundle = await generateExportBundle('testuser', mockProfiles);

      expect(bundle).not.toBeNull();
      expect(bundle?.username).toBe('testuser');

      // JSON should still be valid
      const jsonData = JSON.parse(bundle!.json);
      expect(jsonData.profile.displayName).toBe('Test User');

      // CSV should still have headers
      expect(bundle!.csv).toContain('field,value');
    });

    it('exports all GDPR-required data fields', async () => {
      const bundle = await generateExportBundle('ralphhhbenedict', mockProfiles);
      const jsonData = JSON.parse(bundle!.json);

      // GDPR requires all personal data to be exportable
      expect(jsonData.profile.username).toBeDefined();
      expect(jsonData.profile.displayName).toBeDefined();
      expect(jsonData.profile.bio).toBeDefined();
      expect(jsonData.profile.avatarUrl).toBeDefined();
      expect(jsonData.profile.socialLinks).toBeDefined();
      expect(jsonData.profile.createdAt).toBeDefined();
      expect(jsonData.exportedAt).toBeDefined();
    });
  });

  // ============================================================================
  // Tests: Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles empty socialLinks object', async () => {
      const bundle = await generateExportBundle('testuser', mockProfiles);

      expect(bundle).not.toBeNull();
      const jsonData = JSON.parse(bundle!.json);
      expect(jsonData.profile.socialLinks).toEqual({});
    });

    it('handles empty bio', async () => {
      const profileWithEmptyBio: Record<string, ProfileData> = {
        emptybio: {
          username: 'emptybio',
          displayName: 'Empty Bio User',
          bio: '',
          avatarUrl: '',
          socialLinks: {},
          sections: [],
          createdAt: '2025-01-01T00:00:00Z',
        },
      };

      const bundle = await generateExportBundle('emptybio', profileWithEmptyBio);
      expect(bundle).not.toBeNull();

      const jsonData = JSON.parse(bundle!.json);
      expect(jsonData.profile.bio).toBe('');
    });

    it('handles empty sections array', async () => {
      const profileWithNoSections: Record<string, ProfileData> = {
        nosections: {
          username: 'nosections',
          displayName: 'No Sections User',
          bio: 'Test',
          avatarUrl: '',
          socialLinks: {},
          sections: [],
          createdAt: '2025-01-01T00:00:00Z',
        },
      };

      const bundle = await generateExportBundle('nosections', profileWithNoSections);
      expect(bundle).not.toBeNull();

      const jsonData = JSON.parse(bundle!.json);
      expect(jsonData.profile.sections).toEqual([]);
    });

    it('handles special characters in bio (newlines, unicode)', async () => {
      const profileWithSpecialChars: Record<string, ProfileData> = {
        specialchars: {
          username: 'specialchars',
          displayName: 'Special Chars',
          bio: 'Line 1\nLine 2\n\tTabbed\nEmoji: \u{1F680}',
          avatarUrl: '',
          socialLinks: {},
          sections: [],
          createdAt: '2025-01-01T00:00:00Z',
        },
      };

      const bundle = await generateExportBundle('specialchars', profileWithSpecialChars);
      expect(bundle).not.toBeNull();

      // JSON should preserve special characters
      const jsonData = JSON.parse(bundle!.json);
      expect(jsonData.profile.bio).toContain('Line 1');
      expect(jsonData.profile.bio).toContain('\n');
    });
  });
});
