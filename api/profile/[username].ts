/**
 * API Route: /api/profile/[username]
 * ===================================
 * Get profile data by username.
 *
 * GET /api/profile/ralphhhbenedict
 *
 * Response:
 * - 200: ProfileData object
 * - 404: { error: "Profile not found" }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Profile data type
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

// TODO: Replace with actual database lookup
async function getProfileFromDatabase(username: string): Promise<ProfileData | null> {
  // Mock implementation - in production, query Supabase/database
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  // Validate input
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Get profile from database
  const profile = await getProfileFromDatabase(username);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Return profile data
  return res.status(200).json(profile);
}
