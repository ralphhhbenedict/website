/**
 * Vercel Edge Middleware
 * ======================
 * Handles three concerns:
 * 1. Domain detection for profile mirroring (custom domain ↔ profile subdomain)
 * 2. Basic auth protection for Storybook routes
 * 3. Rate limiting for API endpoints (RES-523)
 *
 * Domain headers set:
 * - x-domain-type: custom | profile | localhost | unknown
 * - x-profile-username: resolved username (if available)
 * - x-analytics-source: custom_domain | profile_subdomain | development | unknown
 *
 * Rate limit headers (for API routes):
 * - X-RateLimit-Limit: max requests per window
 * - X-RateLimit-Remaining: remaining requests in current window
 * - X-RateLimit-Reset: Unix timestamp when window resets
 * - Retry-After: seconds until reset (only when rate limited)
 */

// ============================================================================
// Domain Detection (inlined from src/lib/domain.ts for Edge runtime)
// ============================================================================

const CUSTOM_DOMAIN_MAP = {
  'ralphhhbenedict.com': 'ralphhhbenedict',
  'www.ralphhhbenedict.com': 'ralphhhbenedict',
};

function getDomainType(hostname) {
  if (hostname === 'ralphhhbenedict.com' || hostname === 'www.ralphhhbenedict.com') {
    return 'custom';
  }
  if (hostname === 'profile.resu-me.ai') {
    return 'profile';
  }
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return 'localhost';
  }
  return 'unknown';
}

function getUsername(path, hostname) {
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

function getAnalyticsSource(hostname) {
  const domainType = getDomainType(hostname);
  switch (domainType) {
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

// ============================================================================
// Storybook Auth
// ============================================================================

const AUTHORIZED_USERS = [
  { username: 'ralph', password: 'storybook2024' },
  { username: 'kat', password: 'fernandez' },
  { username: 'kelbz', password: 'itaewon' },
];

function handleStorybookAuth(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Storybook"' },
    });
  }

  const [scheme, encoded] = authHeader.split(' ');

  if (scheme !== 'Basic' || !encoded) {
    return new Response('Invalid authentication', { status: 401 });
  }

  try {
    const decoded = atob(encoded);
    const [user, pass] = decoded.split(':');

    const isAuthorized = AUTHORIZED_USERS.some(
      (u) => u.username === user && u.password === pass
    );

    if (!isAuthorized) {
      return new Response('Invalid credentials', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Storybook"' },
      });
    }
  } catch (e) {
    return new Response('Invalid authentication', { status: 401 });
  }

  return null; // Auth passed, continue
}

// ============================================================================
// Rate Limiting (inlined from src/lib/rateLimit.ts for Edge runtime)
// ============================================================================

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  api: {
    windowMs: 60000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  auth: {
    windowMs: 60000, // 1 minute
    maxRequests: 5, // 5 auth attempts per minute
  },
};

// In-memory store for rate limits (per edge instance)
// Note: In production with multiple edge instances, use KV or external store
const rateLimitStore = new Map();

/**
 * Get client identifier from request headers
 */
function getClientKey(request) {
  // Try X-Forwarded-For (set by proxies/CDN)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Try X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Try CF-Connecting-IP (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  return 'anonymous';
}

/**
 * Check rate limit for a given key and config
 */
function checkRateLimit(key, config) {
  const now = Date.now();
  const fullKey = `${config.prefix || ''}${key}`;

  // Get or create record
  let record = rateLimitStore.get(fullKey);

  // Check if window expired
  if (record && now - record.windowStart >= config.windowMs) {
    record = null;
    rateLimitStore.delete(fullKey);
  }

  // Create new record if needed
  if (!record) {
    record = {
      count: 0,
      windowStart: now,
    };
  }

  const resetAt = record.windowStart + config.windowMs;
  const allowed = record.count < config.maxRequests;

  if (allowed) {
    record.count++;
    rateLimitStore.set(fullKey, record);
  }

  const remaining = Math.max(0, config.maxRequests - record.count);
  const resetUnixSeconds = Math.ceil(resetAt / 1000);

  return {
    allowed,
    headers: {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetUnixSeconds.toString(),
      ...(allowed ? {} : { 'Retry-After': Math.ceil((resetAt - now) / 1000).toString() }),
    },
  };
}

/**
 * Handle rate limiting for API endpoints
 * Returns response if rate limited, null otherwise
 */
function handleRateLimiting(request, pathname) {
  // Only rate limit API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  const clientKey = getClientKey(request);

  // Determine which config to use
  const isAuthEndpoint = pathname.startsWith('/api/auth');
  const config = isAuthEndpoint
    ? { ...RATE_LIMIT_CONFIG.auth, prefix: 'auth:' }
    : { ...RATE_LIMIT_CONFIG.api, prefix: 'api:' };

  const result = checkRateLimit(clientKey, config);

  if (!result.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...result.headers,
      },
    });
  }

  // Return headers to be merged into response
  return { rateLimitHeaders: result.headers };
}

// ============================================================================
// Main Middleware
// ============================================================================

export default function middleware(request) {
  const url = new URL(request.url);
  const { hostname, pathname } = url;

  // 1. Handle Storybook auth
  if (pathname.startsWith('/storybook-js')) {
    const authResponse = handleStorybookAuth(request);
    if (authResponse) return authResponse;
  }

  // 2. Handle rate limiting for API endpoints
  const rateLimitResult = handleRateLimiting(request, pathname);
  if (rateLimitResult instanceof Response) {
    // Rate limited - return 429 response
    return rateLimitResult;
  }

  // Extract rate limit headers if available
  const rateLimitHeaders = rateLimitResult?.rateLimitHeaders || {};

  // 3. Domain detection
  const domainType = getDomainType(hostname);
  const username = getUsername(pathname, hostname);
  const analyticsSource = getAnalyticsSource(hostname);

  // 4. Handle URL rewriting for custom domains
  if (domainType === 'custom' && CUSTOM_DOMAIN_MAP[hostname]) {
    const mappedUsername = CUSTOM_DOMAIN_MAP[hostname];

    // Rewrite root path or non-@ paths to internal /@username format
    if (pathname === '/' || (!pathname.startsWith('/@') && !pathname.startsWith('/storybook'))) {
      const rewritePath = pathname === '/' ? `/@${mappedUsername}` : `/@${mappedUsername}${pathname}`;

      // Create rewrite response with domain headers and rate limit headers
      const rewriteUrl = new URL(rewritePath, request.url);
      return new Response(null, {
        status: 200,
        headers: {
          'x-middleware-rewrite': rewriteUrl.toString(),
          'x-domain-type': domainType,
          'x-profile-username': username || mappedUsername,
          'x-analytics-source': analyticsSource,
          ...rateLimitHeaders,
        },
      });
    }
  }

  // 5. For non-rewrite cases, set domain headers via NextResponse pattern
  // Note: Vercel Edge requires using Response headers for pass-through
  // The client can read these from document.head meta tags injected by the app
  return new Response(null, {
    headers: {
      'x-domain-type': domainType,
      'x-profile-username': username || '',
      'x-analytics-source': analyticsSource,
      'x-middleware-next': '1', // Signal to continue to origin
      ...rateLimitHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
