/**
 * API Route: /api/profile/[username]/export
 * ==========================================
 * Export user profile data (GDPR compliance).
 *
 * GET /api/profile/ralphhhbenedict/export
 * GET /api/profile/ralphhhbenedict/export?format=json (default)
 * GET /api/profile/ralphhhbenedict/export?format=csv
 *
 * Response:
 * - 200: ExportBundle JSON (default) or raw JSON/CSV file
 * - 404: { error: "Profile not found" }
 * - 400: { error: "Invalid format parameter" }
 *
 * Linear Issue: RES-524
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============================================================================
// Types (same as api.ts and dataExport.ts)
// ============================================================================

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
  sections: string[];
  customDomain?: string;
  createdAt: string;
}

interface ExportData {
  profile: ProfileData;
  exportedAt: string;
  exportVersion: string;
  exportFormat: 'GDPR_EXPORT_V1';
}

interface ExportBundle {
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
// Helper Functions (duplicated from dataExport.ts for serverless compatibility)
// ============================================================================

function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return value;
}

function formatAsJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

function formatAsCSV(data: ExportData): string {
  const rows: string[] = [];
  rows.push('field,value');

  const profile = data.profile;
  rows.push(`username,${escapeCSVValue(profile.username)}`);
  rows.push(`displayName,${escapeCSVValue(profile.displayName)}`);
  rows.push(`bio,${escapeCSVValue(profile.bio)}`);
  rows.push(`avatarUrl,${escapeCSVValue(profile.avatarUrl)}`);

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

  const sectionsValue = profile.sections.length > 0 ? profile.sections.join(',') : '';
  rows.push(`sections,${escapeCSVValue(sectionsValue)}`);

  if (profile.customDomain) {
    rows.push(`customDomain,${escapeCSVValue(profile.customDomain)}`);
  }

  rows.push(`createdAt,${escapeCSVValue(profile.createdAt)}`);
  rows.push(`exportedAt,${escapeCSVValue(data.exportedAt)}`);
  rows.push(`exportVersion,${escapeCSVValue(data.exportVersion)}`);
  rows.push(`exportFormat,${escapeCSVValue(data.exportFormat)}`);

  return rows.join('\n');
}

function generateFilename(username: string, extension: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${username}-export-${date}.${extension}`;
}

// ============================================================================
// Database Mock (TODO: Replace with Supabase)
// ============================================================================

async function getProfileFromDatabase(username: string): Promise<ProfileData | null> {
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
  };

  const normalizedUsername = username.toLowerCase();

  for (const [key, profile] of Object.entries(mockProfiles)) {
    if (key.toLowerCase() === normalizedUsername) {
      return profile;
    }
  }

  return null;
}

// ============================================================================
// API Handler
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, format = 'bundle' } = req.query;

  // Validate username
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Validate format parameter
  const validFormats = ['bundle', 'json', 'csv'];
  const formatStr = Array.isArray(format) ? format[0] : format;
  if (!validFormats.includes(formatStr)) {
    return res.status(400).json({
      error: `Invalid format parameter. Valid options: ${validFormats.join(', ')}`,
    });
  }

  // Get profile from database
  const profile = await getProfileFromDatabase(username);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Create export data
  const exportedAt = new Date().toISOString();
  const exportData: ExportData = {
    profile,
    exportedAt,
    exportVersion: EXPORT_VERSION,
    exportFormat: EXPORT_FORMAT,
  };

  // Return based on format
  if (formatStr === 'json') {
    // Return raw JSON file
    const jsonContent = formatAsJSON(exportData);
    const filename = generateFilename(profile.username, 'json');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(jsonContent);
  }

  if (formatStr === 'csv') {
    // Return raw CSV file
    const csvContent = formatAsCSV(exportData);
    const filename = generateFilename(profile.username, 'csv');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  }

  // Default: Return full bundle as JSON
  const bundle: ExportBundle = {
    username: profile.username,
    json: formatAsJSON(exportData),
    csv: formatAsCSV(exportData),
    filenames: {
      json: generateFilename(profile.username, 'json'),
      csv: generateFilename(profile.username, 'csv'),
    },
    exportedAt,
    format: EXPORT_FORMAT,
  };

  return res.status(200).json(bundle);
}
