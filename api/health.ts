/**
 * API Route: /api/health
 * =======================
 * Health check endpoint for monitoring and deployment verification.
 *
 * GET /api/health
 *
 * Response:
 * - 200: { status: "ok", timestamp: "ISO8601", version: "1.0.0", ... }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Version from package.json (injected at build time or hardcoded)
const VERSION = process.env.npm_package_version || '1.0.0';

// Track uptime
const startTime = Date.now();

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  uptime_seconds: number;
  environment: string;
  region?: string;
  checks?: {
    name: string;
    status: 'pass' | 'fail';
    latency_ms?: number;
    message?: string;
  }[];
}

/**
 * Run optional health checks on dependencies.
 * Add checks for database, external APIs, etc. as needed.
 */
async function runHealthChecks(): Promise<HealthResponse['checks']> {
  const checks: HealthResponse['checks'] = [];

  // Example: Check if environment variables are set
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

  checks.push({
    name: 'environment',
    status: missingEnvVars.length === 0 ? 'pass' : 'fail',
    message:
      missingEnvVars.length === 0
        ? 'All required environment variables set'
        : `Missing: ${missingEnvVars.join(', ')}`,
  });

  // TODO: Add more checks as needed
  // - Database connectivity
  // - External API availability
  // - Cache health

  return checks;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  // Determine if we should run detailed checks
  const detailed = req.query.detailed === 'true';
  const checks = detailed ? await runHealthChecks() : undefined;

  // Determine overall status based on checks
  let status: HealthResponse['status'] = 'ok';
  if (checks) {
    const failedChecks = checks.filter((c) => c.status === 'fail');
    if (failedChecks.length > 0) {
      status = failedChecks.length === checks.length ? 'error' : 'degraded';
    }
  }

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: VERSION,
    uptime_seconds: uptimeSeconds,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION,
    ...(checks && { checks }),
  };

  // Set cache headers (don't cache health checks)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  return res.status(status === 'error' ? 503 : 200).json(response);
}
