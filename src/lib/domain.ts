/**
 * Domain Detection Module
 * =======================
 * GREEN PHASE: Minimum implementation to pass tests.
 *
 * Handles domain detection for profile mirroring:
 * - ralphhhbenedict.com (custom domain)
 * - profile.resu-me.ai/@username (profile subdomain)
 */

export type DomainType = 'custom' | 'profile' | 'localhost' | 'unknown';
export type AnalyticsSource = 'custom_domain' | 'profile_subdomain' | 'development' | 'unknown';

// Domain to username mapping for custom domains
const CUSTOM_DOMAIN_MAP: Record<string, string> = {
  'ralphhhbenedict.com': 'ralphhhbenedict',
  'www.ralphhhbenedict.com': 'ralphhhbenedict',
};

/**
 * Determine the type of domain we're running on
 */
export function getDomainType(hostname: string): DomainType {
  // Check for custom domains
  if (hostname === 'ralphhhbenedict.com' || hostname === 'www.ralphhhbenedict.com') {
    return 'custom';
  }

  // Check for profile subdomain
  if (hostname === 'profile.resu-me.ai') {
    return 'profile';
  }

  // Check for localhost
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return 'localhost';
  }

  return 'unknown';
}

/**
 * Check if we're on a custom domain
 */
export function isCustomDomain(hostname: string): boolean {
  return getDomainType(hostname) === 'custom';
}

/**
 * Check if we're on the profile subdomain
 */
export function isProfileSubdomain(hostname: string): boolean {
  return getDomainType(hostname) === 'profile';
}

/**
 * Extract username from path or resolve from custom domain
 *
 * @param path - The URL path (e.g., "/@ralphhhbenedict")
 * @param hostname - Optional hostname for custom domain resolution
 * @returns Username or null if not found
 */
export function getUsername(path: string, hostname?: string): string | null {
  // If on a custom domain with root path, resolve from domain map
  if (hostname && CUSTOM_DOMAIN_MAP[hostname] && path === '/') {
    return CUSTOM_DOMAIN_MAP[hostname];
  }

  // Extract from /@username path pattern
  const match = path.match(/^\/@([^/]+)/);
  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Get analytics source identifier for tracking
 */
export function getAnalyticsSource(hostname: string): AnalyticsSource {
  switch (getDomainType(hostname)) {
    case 'custom':
      return 'custom_domain';
    case 'profile':
      return 'profile_subdomain';
    case 'localhost':
      return 'development';
    default:
      return 'unknown';
  }
}

/**
 * Convenience function to get current domain context
 */
export function getCurrentDomainContext() {
  if (typeof window === 'undefined') {
    return { type: 'unknown' as DomainType, username: null, source: 'unknown' as AnalyticsSource };
  }

  const { hostname, pathname } = window.location;
  return {
    type: getDomainType(hostname),
    username: getUsername(pathname, hostname),
    source: getAnalyticsSource(hostname),
    hostname,
    pathname,
  };
}
