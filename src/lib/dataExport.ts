/**
 * Data Export Module (GDPR Compliance)
 * =====================================
 * GREEN PHASE: Minimum implementation to pass tests.
 *
 * Provides data export functionality for GDPR compliance:
 * - exportProfileData(username) - gather all user data
 * - formatAsJSON(data) - structured JSON export
 * - formatAsCSV(data) - CSV format for spreadsheets
 * - generateExportBundle(username) - create downloadable package
 *
 * Linear Issue: RES-524
 */

import type { ProfileData } from './api';

// ============================================================================
// Types
// ============================================================================

export interface ExportData {
  profile: ProfileData;
  exportedAt: string;
  exportVersion: string;
  exportFormat: 'GDPR_EXPORT_V1';
}

export interface ExportBundle {
  username: string;
  json: string;
  csv: string;
  filenames: {
    json: string;
    csv: string;
  };
  exportedAt: string;
  format: 'GDPR_EXPORT_V1';
}

// ============================================================================
// Constants
// ============================================================================

const EXPORT_VERSION = '1.0.0';
const EXPORT_FORMAT = 'GDPR_EXPORT_V1' as const;

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export all profile data for a user (GDPR data portability)
 * @param username - The username to export data for
 * @param profiles - Record of username -> ProfileData (mock database)
 * @returns Promise<ExportData | null>
 */
export async function exportProfileData(
  username: string,
  profiles: Record<string, ProfileData> = {}
): Promise<ExportData | null> {
  const normalizedUsername = username.toLowerCase();

  // Find the profile (case-insensitive)
  let foundProfile: ProfileData | null = null;
  for (const [key, profile] of Object.entries(profiles)) {
    if (key.toLowerCase() === normalizedUsername) {
      foundProfile = profile;
      break;
    }
  }

  if (!foundProfile) {
    return null;
  }

  return {
    profile: foundProfile,
    exportedAt: new Date().toISOString(),
    exportVersion: EXPORT_VERSION,
    exportFormat: EXPORT_FORMAT,
  };
}

/**
 * Format export data as JSON string (human-readable)
 * @param data - The export data to format
 * @returns JSON string with 2-space indentation
 */
export function formatAsJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Escape a value for CSV format
 * - Wraps in quotes if contains comma, newline, or quote
 * - Doubles internal quotes
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return value;
}

/**
 * Format export data as CSV string (field,value format)
 * @param data - The export data to format
 * @returns CSV string with headers
 */
export function formatAsCSV(data: ExportData): string {
  const rows: string[] = [];

  // Header row
  rows.push('field,value');

  // Profile fields (flattened)
  const profile = data.profile;

  // Simple fields
  rows.push(`username,${escapeCSVValue(profile.username)}`);
  rows.push(`displayName,${escapeCSVValue(profile.displayName)}`);
  rows.push(`bio,${escapeCSVValue(profile.bio)}`);
  rows.push(`avatarUrl,${escapeCSVValue(profile.avatarUrl)}`);

  // Flatten socialLinks
  if (profile.socialLinks) {
    if (profile.socialLinks.linkedin) {
      rows.push(`socialLinks.linkedin,${escapeCSVValue(profile.socialLinks.linkedin)}`);
    }
    if (profile.socialLinks.twitter) {
      rows.push(`socialLinks.twitter,${escapeCSVValue(profile.socialLinks.twitter)}`);
    }
    if (profile.socialLinks.github) {
      rows.push(`socialLinks.github,${escapeCSVValue(profile.socialLinks.github)}`);
    }
    if (profile.socialLinks.email) {
      rows.push(`socialLinks.email,${escapeCSVValue(profile.socialLinks.email)}`);
    }
  }

  // Sections as comma-separated list
  const sectionsValue =
    profile.sections.length > 0 ? profile.sections.join(',') : '';
  rows.push(`sections,${escapeCSVValue(sectionsValue)}`);

  // Optional customDomain
  if (profile.customDomain) {
    rows.push(`customDomain,${escapeCSVValue(profile.customDomain)}`);
  }

  // Timestamps
  rows.push(`createdAt,${escapeCSVValue(profile.createdAt)}`);

  // Export metadata
  rows.push(`exportedAt,${escapeCSVValue(data.exportedAt)}`);
  rows.push(`exportVersion,${escapeCSVValue(data.exportVersion)}`);
  rows.push(`exportFormat,${escapeCSVValue(data.exportFormat)}`);

  return rows.join('\n');
}

/**
 * Generate filename with username and timestamp
 * @param username - The username
 * @param extension - File extension (json, csv)
 * @returns Filename string
 */
function generateFilename(username: string, extension: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${username}-export-${date}.${extension}`;
}

/**
 * Generate a complete export bundle with JSON and CSV formats
 * @param username - The username to export data for
 * @param profiles - Record of username -> ProfileData (mock database)
 * @returns Promise<ExportBundle | null>
 */
export async function generateExportBundle(
  username: string,
  profiles: Record<string, ProfileData> = {}
): Promise<ExportBundle | null> {
  const exportData = await exportProfileData(username, profiles);

  if (!exportData) {
    return null;
  }

  const normalizedUsername = exportData.profile.username;
  const json = formatAsJSON(exportData);
  const csv = formatAsCSV(exportData);

  return {
    username: normalizedUsername,
    json,
    csv,
    filenames: {
      json: generateFilename(normalizedUsername, 'json'),
      csv: generateFilename(normalizedUsername, 'csv'),
    },
    exportedAt: exportData.exportedAt,
    format: EXPORT_FORMAT,
  };
}
