/**
 * Profile API Logic Module
 * ========================
 * GREEN PHASE: Minimum implementation to pass tests.
 *
 * Provides business logic for profile API operations:
 * - Username validation (format, reserved words)
 * - Username availability checking
 * - Profile data retrieval
 */

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface UsernameAvailabilityResult {
  available: boolean;
  reason?: string;
}

export interface ProfileData {
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

// ============================================================================
// Constants
// ============================================================================

/**
 * Reserved words that cannot be used as usernames
 * These are system routes and commonly requested endpoints
 */
export const RESERVED_WORDS = new Set([
  // System routes
  'admin',
  'api',
  'profile',
  'profiles',
  'settings',
  'account',
  'dashboard',

  // Auth routes
  'login',
  'logout',
  'signup',
  'signin',
  'signout',
  'register',
  'auth',
  'oauth',

  // Support routes
  'help',
  'support',
  'contact',
  'feedback',
  'docs',
  'documentation',

  // Legal routes
  'terms',
  'privacy',
  'legal',
  'tos',
  'cookies',

  // Marketing routes
  'about',
  'pricing',
  'features',
  'blog',
  'news',
  'careers',
  'jobs',

  // Technical routes
  'static',
  'assets',
  'public',
  'images',
  'css',
  'js',
  'fonts',
  '_next',
  'storybook',

  // Reserved platform names
  'resume',
  'resu-me',
  'resumerai',
  'app',
  'www',
  'mail',
  'ftp',
]);

/**
 * Username format requirements:
 * - 3-30 characters
 * - Alphanumeric and underscore only
 * - Must start with a letter
 * - Cannot have consecutive underscores
 */
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate username format
 * @param username - The username to validate
 * @returns ValidationResult with valid boolean and optional error message
 */
export function validateUsername(username: string): ValidationResult {
  // Check length first
  if (username.length < 3) {
    return {
      valid: false,
      error: 'Username must be at least 3 characters long',
    };
  }

  if (username.length > 30) {
    return {
      valid: false,
      error: 'Username must be at most 30 characters long',
    };
  }

  // Check if starts with letter
  if (!/^[a-zA-Z]/.test(username)) {
    return {
      valid: false,
      error: 'Username must start with a letter',
    };
  }

  // Check format (alphanumeric + underscore)
  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  // Check for consecutive underscores
  if (/__/.test(username)) {
    return {
      valid: false,
      error: 'Username cannot have consecutive underscores',
    };
  }

  return { valid: true };
}

/**
 * Check if a word is reserved (case-insensitive)
 * @param word - The word to check
 * @returns true if the word is reserved
 */
export function isReservedWord(word: string): boolean {
  return RESERVED_WORDS.has(word.toLowerCase());
}

// ============================================================================
// Availability Functions
// ============================================================================

/**
 * Check if a username is available
 * @param username - The username to check
 * @param takenUsernames - Array of already taken usernames (mock database)
 * @returns Promise<UsernameAvailabilityResult>
 */
export async function checkUsernameAvailability(
  username: string,
  takenUsernames: string[] = []
): Promise<UsernameAvailabilityResult> {
  const normalizedUsername = username.toLowerCase();

  // First, validate format
  const validation = validateUsername(username);
  if (!validation.valid) {
    return {
      available: false,
      reason: `Invalid format: ${validation.error}`,
    };
  }

  // Check if reserved word
  if (isReservedWord(normalizedUsername)) {
    return {
      available: false,
      reason: `"${username}" is a reserved word and cannot be used as a username`,
    };
  }

  // Check if already taken (case-insensitive)
  const isTaken = takenUsernames.some(
    (taken) => taken.toLowerCase() === normalizedUsername
  );

  if (isTaken) {
    return {
      available: false,
      reason: `Username "${username}" is already taken`,
    };
  }

  return { available: true };
}

// ============================================================================
// Profile Functions
// ============================================================================

/**
 * Get profile data by username
 * @param username - The username to look up (case-insensitive)
 * @param profiles - Record of username -> ProfileData (mock database)
 * @returns Promise<ProfileData | null>
 */
export async function getProfileByUsername(
  username: string,
  profiles: Record<string, ProfileData> = {}
): Promise<ProfileData | null> {
  const normalizedUsername = username.toLowerCase();

  // Find the profile (case-insensitive)
  for (const [key, profile] of Object.entries(profiles)) {
    if (key.toLowerCase() === normalizedUsername) {
      return profile;
    }
  }

  return null;
}

// ============================================================================
// API Helpers (for serverless functions)
// ============================================================================

/**
 * Create a JSON response (for API routes)
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create an error response
 */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}
