/**
 * API Route: /api/username/check
 * ===============================
 * Check if a username is available for registration.
 *
 * GET /api/username/check?username=johndoe
 *
 * Response:
 * - 200: { available: true }
 * - 200: { available: false, reason: "Username is already taken" }
 * - 400: { error: "Username is required" }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inlined validation logic for Edge runtime compatibility
const RESERVED_WORDS = new Set([
  'admin', 'api', 'profile', 'profiles', 'settings', 'account', 'dashboard',
  'login', 'logout', 'signup', 'signin', 'signout', 'register', 'auth', 'oauth',
  'help', 'support', 'contact', 'feedback', 'docs', 'documentation',
  'terms', 'privacy', 'legal', 'tos', 'cookies',
  'about', 'pricing', 'features', 'blog', 'news', 'careers', 'jobs',
  'static', 'assets', 'public', 'images', 'css', 'js', 'fonts', '_next', 'storybook',
  'resume', 'resu-me', 'resumerai', 'app', 'www', 'mail', 'ftp',
]);

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/;

function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }
  if (username.length > 30) {
    return { valid: false, error: 'Username must be at most 30 characters long' };
  }
  if (!/^[a-zA-Z]/.test(username)) {
    return { valid: false, error: 'Username must start with a letter' };
  }
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  if (/__/.test(username)) {
    return { valid: false, error: 'Username cannot have consecutive underscores' };
  }
  return { valid: true };
}

function isReservedWord(word: string): boolean {
  return RESERVED_WORDS.has(word.toLowerCase());
}

// TODO: Replace with actual database lookup
async function getUsernameFromDatabase(username: string): Promise<boolean> {
  // Mock implementation - in production, query Supabase/database
  const mockTakenUsernames = ['ralphhhbenedict', 'johndoe', 'janedoe'];
  return mockTakenUsernames.some(u => u.toLowerCase() === username.toLowerCase());
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

  const normalizedUsername = username.toLowerCase();

  // Step 1: Validate format
  const validation = validateUsername(username);
  if (!validation.valid) {
    return res.status(200).json({
      available: false,
      reason: `Invalid format: ${validation.error}`,
    });
  }

  // Step 2: Check reserved words
  if (isReservedWord(normalizedUsername)) {
    return res.status(200).json({
      available: false,
      reason: `"${username}" is a reserved word`,
    });
  }

  // Step 3: Check database
  const isTaken = await getUsernameFromDatabase(normalizedUsername);
  if (isTaken) {
    return res.status(200).json({
      available: false,
      reason: `Username "${username}" is already taken`,
    });
  }

  // Username is available
  return res.status(200).json({ available: true });
}
