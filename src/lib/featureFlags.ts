/**
 * Feature Flags System
 * ====================
 * A flexible feature flag system supporting:
 * - Global on/off flags via environment variables
 * - Percentage-based rollout for gradual releases
 * - User-specific overrides via allowlists
 *
 * Environment Variables (VITE_FF_* prefix):
 * - VITE_FF_{FLAG_NAME}: "true" or "false" - global toggle
 * - VITE_FF_{FLAG_NAME}_PERCENTAGE: 0-100 - rollout percentage
 * - VITE_FF_{FLAG_NAME}_USERS: comma-separated list of userIds
 */

/**
 * Available feature flags
 */
export enum FeatureFlags {
  CUSTOM_DOMAINS = 'CUSTOM_DOMAINS',
  VISIBILITY_CONTROLS = 'VISIBILITY_CONTROLS',
  ANALYTICS_V2 = 'ANALYTICS_V2',
}

/**
 * Configuration for a feature flag
 */
export interface FeatureFlagConfig {
  enabled: boolean;
  percentage: number | null;
  allowedUsers: string[];
}

/**
 * Get all flag names from the enum
 */
const ALL_FLAGS = Object.values(FeatureFlags);

/**
 * Simple string hash function for deterministic user bucketing
 * Uses djb2 algorithm for consistent hashing
 *
 * @param userId - The user identifier
 * @param flag - The feature flag (used as salt for different distributions per flag)
 * @returns A number between 0 and 99
 */
export function hashUserId(userId: string, flag: FeatureFlags): number {
  const input = `${flag}:${userId}`;
  let hash = 5381;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) + hash) ^ char; // hash * 33 ^ char
  }

  // Ensure positive value and normalize to 0-99
  return Math.abs(hash % 100);
}

/**
 * Get the environment variable value for a flag
 */
function getEnvVar(key: string): string | undefined {
  // Use import.meta.env for Vite
  return import.meta.env[key];
}

/**
 * Parse a boolean-like environment variable
 */
function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return value === 'true' || value === '1';
}

/**
 * Parse a percentage value from environment variable
 */
function parsePercentage(value: string | undefined): number | null {
  if (!value) return null;
  const num = parseInt(value, 10);
  if (isNaN(num)) return null;
  return Math.max(0, Math.min(100, num));
}

/**
 * Parse comma-separated user list
 */
function parseUserList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
}

/**
 * Get the configuration for a feature flag
 *
 * @param flag - The feature flag to get config for
 * @returns The feature flag configuration
 */
export function getFeatureFlagConfig(flag: FeatureFlags): FeatureFlagConfig {
  const baseKey = `VITE_FF_${flag}`;

  return {
    enabled: parseBoolean(getEnvVar(baseKey)),
    percentage: parsePercentage(getEnvVar(`${baseKey}_PERCENTAGE`)),
    allowedUsers: parseUserList(getEnvVar(`${baseKey}_USERS`)),
  };
}

/**
 * Check if a feature flag is enabled
 *
 * Priority order:
 * 1. User allowlist (highest priority - allows override for specific users)
 * 2. Percentage rollout (if userId provided)
 * 3. Global flag (base toggle)
 *
 * @param flag - The feature flag to check
 * @param userId - Optional user identifier for percentage rollout and allowlist
 * @returns true if the feature is enabled for this context
 */
export function isFeatureEnabled(
  flag: FeatureFlags,
  userId?: string
): boolean {
  const config = getFeatureFlagConfig(flag);

  // If userId provided, check allowlist first (highest priority)
  if (userId !== undefined) {
    const isInAllowlist = config.allowedUsers.some(
      (allowedUser) => allowedUser.toLowerCase() === userId.toLowerCase()
    );
    if (isInAllowlist) {
      return true;
    }
  }

  // If global flag is off, feature is disabled (unless user was in allowlist above)
  if (!config.enabled) {
    return false;
  }

  // If percentage is set and userId provided, use percentage rollout
  if (config.percentage !== null && userId !== undefined) {
    const userHash = hashUserId(userId, flag);
    return userHash < config.percentage;
  }

  // Default to global flag value
  return config.enabled;
}

/**
 * Get all enabled feature flags
 *
 * @param userId - Optional user identifier for percentage rollout and allowlist
 * @returns Array of enabled feature flags
 */
export function getEnabledFeatures(userId?: string): FeatureFlags[] {
  return ALL_FLAGS.filter((flag) => isFeatureEnabled(flag, userId));
}
