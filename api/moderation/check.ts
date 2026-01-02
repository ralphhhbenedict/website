/**
 * API Route: /api/moderation/check
 * =================================
 * Content moderation endpoint for checking user-submitted content.
 *
 * POST /api/moderation/check
 *
 * Request Body:
 * {
 *   "content": "Text to moderate"
 * }
 *
 * Response:
 * - 200: { safe: boolean, issues: string[], timestamp: string }
 * - 400: { error: "Content is required" }
 * - 405: { error: "Method not allowed" }
 * - 500: { error: "Internal server error" }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import moderation functions
// Note: In Vercel serverless, we need to handle the import path carefully
// The moderation module exports the functions we need

// Since we're in api/ and the module is in src/lib/, we use a relative path
// For Vercel deployment, this will be bundled correctly
import {
  moderateContent,
  checkProfanity,
  checkSpam,
  checkMaliciousLinks,
  type ModerationResult,
} from '../../src/lib/moderation';

interface CheckRequest {
  content: string;
  checks?: ('profanity' | 'spam' | 'links' | 'all')[];
}

interface CheckResponse extends ModerationResult {
  timestamp: string;
  content_length: number;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Validate the request body
 */
function validateRequest(body: unknown): { valid: true; data: CheckRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { content, checks } = body as Record<string, unknown>;

  if (typeof content !== 'string') {
    return { valid: false, error: 'Content field is required and must be a string' };
  }

  if (content.length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }

  if (content.length > 50000) {
    return { valid: false, error: 'Content exceeds maximum length of 50,000 characters' };
  }

  // Validate checks array if provided
  if (checks !== undefined) {
    if (!Array.isArray(checks)) {
      return { valid: false, error: 'Checks field must be an array' };
    }
    const validChecks = ['profanity', 'spam', 'links', 'all'];
    const invalidChecks = checks.filter(c => !validChecks.includes(c as string));
    if (invalidChecks.length > 0) {
      return { valid: false, error: `Invalid checks: ${invalidChecks.join(', ')}. Valid options: ${validChecks.join(', ')}` };
    }
  }

  return {
    valid: true,
    data: {
      content,
      checks: checks as CheckRequest['checks'],
    },
  };
}

/**
 * Run moderation with optional selective checks
 */
function runModeration(content: string, checks?: CheckRequest['checks']): ModerationResult {
  // If no checks specified or 'all' is included, run full moderation
  if (!checks || checks.length === 0 || checks.includes('all')) {
    return moderateContent(content);
  }

  // Run selective checks
  const allIssues: string[] = [];

  if (checks.includes('profanity')) {
    const issues = checkProfanity(content);
    issues.forEach(issue => allIssues.push(`Profanity: ${issue}`));
  }

  if (checks.includes('spam')) {
    const issues = checkSpam(content);
    issues.forEach(issue => allIssues.push(`Spam: ${issue}`));
  }

  if (checks.includes('links')) {
    const issues = checkMaliciousLinks(content);
    issues.forEach(issue => allIssues.push(`Link: ${issue}`));
  }

  return {
    safe: allIssues.length === 0,
    issues: allIssues,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    const errorResponse: ErrorResponse = { error: 'Method not allowed. Use POST.' };
    return res.status(405).json(errorResponse);
  }

  try {
    // Validate request
    const validation = validateRequest(req.body);

    if (!validation.valid) {
      const errorResponse: ErrorResponse = { error: validation.error };
      return res.status(400).json(errorResponse);
    }

    const { content, checks } = validation.data;

    // Run moderation
    const result = runModeration(content, checks);

    // Build response
    const response: CheckResponse = {
      ...result,
      timestamp: new Date().toISOString(),
      content_length: content.length,
    };

    // Set cache headers (don't cache moderation results)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    return res.status(200).json(response);
  } catch (error) {
    console.error('Moderation error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    };

    return res.status(500).json(errorResponse);
  }
}
