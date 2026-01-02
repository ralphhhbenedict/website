/**
 * Edge Middleware Module
 * ======================
 * GREEN PHASE: Minimum implementation to pass tests.
 *
 * Provides middleware logic for domain detection:
 * - Sets x-domain-type header (custom, profile, localhost, unknown)
 * - Sets x-profile-username header when username can be resolved
 * - Sets x-analytics-source header for tracking
 * - Handles URL rewrites for custom domains
 */

import { getDomainType, getUsername, getAnalyticsSource, type DomainType, type AnalyticsSource } from './domain';

// Types for middleware processing
export interface MiddlewareRequest {
  url: string;
  hostname: string;
  pathname: string;
  headers: Map<string, string>;
}

export interface MiddlewareResult {
  headers: Map<string, string | null>;
  rewriteUrl?: string;
}

export interface MiddlewareResponse {
  type: 'pass-through' | 'rewrite';
  headers: Map<string, string | null>;
  destination?: string;
}

// Domain to username mapping for custom domains (duplicated from domain.ts for middleware context)
const CUSTOM_DOMAIN_MAP: Record<string, string> = {
  'ralphhhbenedict.com': 'ralphhhbenedict',
  'www.ralphhhbenedict.com': 'ralphhhbenedict',
};

/**
 * Extract hostname from a URL string
 */
export function extractHostname(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    // If URL parsing fails, try to extract manually
    const match = url.match(/^https?:\/\/([^/:]+)/);
    return match ? match[1] : '';
  }
}

/**
 * Create domain middleware result with headers and optional rewrite
 */
export function createDomainMiddleware(request: MiddlewareRequest): MiddlewareResult {
  const { hostname, pathname } = request;

  // Determine domain type
  const domainType = getDomainType(hostname);

  // Get username from path or custom domain mapping
  const username = getUsername(pathname, hostname);

  // Get analytics source
  const analyticsSource = getAnalyticsSource(hostname);

  // Build headers map
  const headers = new Map<string, string | null>();
  headers.set('x-domain-type', domainType);
  headers.set('x-profile-username', username);
  headers.set('x-analytics-source', analyticsSource);

  // Determine if rewrite is needed (custom domain only)
  let rewriteUrl: string | undefined;

  if (domainType === 'custom' && CUSTOM_DOMAIN_MAP[hostname]) {
    const mappedUsername = CUSTOM_DOMAIN_MAP[hostname];

    if (pathname === '/') {
      // Root path -> rewrite to /@username
      rewriteUrl = `/@${mappedUsername}`;
    } else if (!pathname.startsWith('/@')) {
      // Subpath without @ -> rewrite to /@username/subpath
      rewriteUrl = `/@${mappedUsername}${pathname}`;
    }
  }

  return {
    headers,
    rewriteUrl,
  };
}

/**
 * Create middleware response object from result
 */
export function createMiddlewareResponse(result: MiddlewareResult): MiddlewareResponse {
  if (result.rewriteUrl) {
    return {
      type: 'rewrite',
      headers: result.headers,
      destination: result.rewriteUrl,
    };
  }

  return {
    type: 'pass-through',
    headers: result.headers,
  };
}

/**
 * Main middleware handler for Vercel Edge
 * This is the function called by the Vercel Edge runtime
 */
export function handleDomainMiddleware(request: Request): MiddlewareResult {
  const url = new URL(request.url);

  const middlewareRequest: MiddlewareRequest = {
    url: request.url,
    hostname: url.hostname,
    pathname: url.pathname,
    headers: new Map(Object.entries(Object.fromEntries(request.headers))),
  };

  return createDomainMiddleware(middlewareRequest);
}
