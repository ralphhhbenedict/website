/**
 * TDD: Edge Middleware Tests
 * ==========================
 * RED PHASE: These tests define the behavior we WANT.
 * They will FAIL until we implement the middleware.ts module.
 *
 * Requirements:
 * 1. Detect domain type from request hostname
 * 2. Resolve username from path or custom domain
 * 3. Add x-domain-type header to response
 * 4. Add x-profile-username header when username resolved
 * 5. Add x-analytics-source header for tracking
 * 6. Handle rewrites for custom domains (/ -> /@username internally)
 */

import { describe, it, expect } from 'vitest';
import {
  createDomainMiddleware,
  extractHostname,
  createMiddlewareResponse,
  type MiddlewareRequest,
  type MiddlewareResult,
} from './middleware';

// Helper to create mock request
function mockRequest(url: string, hostname?: string): MiddlewareRequest {
  const urlObj = new URL(url, 'https://example.com');
  return {
    url,
    hostname: hostname || urlObj.hostname,
    pathname: urlObj.pathname,
    headers: new Map(),
  };
}

describe('Edge Middleware (TDD)', () => {
  describe('extractHostname', () => {
    it('extracts hostname from full URL', () => {
      const result = extractHostname('https://ralphhhbenedict.com/');
      expect(result).toBe('ralphhhbenedict.com');
    });

    it('handles www subdomain', () => {
      const result = extractHostname('https://www.ralphhhbenedict.com/');
      expect(result).toBe('www.ralphhhbenedict.com');
    });

    it('handles profile subdomain', () => {
      const result = extractHostname('https://profile.resu-me.ai/@username');
      expect(result).toBe('profile.resu-me.ai');
    });

    it('handles localhost', () => {
      const result = extractHostname('http://localhost:5173/');
      expect(result).toBe('localhost');
    });
  });

  describe('createDomainMiddleware', () => {
    it('returns domain-type header for custom domain', () => {
      const request = mockRequest('https://ralphhhbenedict.com/', 'ralphhhbenedict.com');
      const result = createDomainMiddleware(request);

      expect(result.headers.get('x-domain-type')).toBe('custom');
    });

    it('returns domain-type header for profile subdomain', () => {
      const request = mockRequest('https://profile.resu-me.ai/@johndoe', 'profile.resu-me.ai');
      const result = createDomainMiddleware(request);

      expect(result.headers.get('x-domain-type')).toBe('profile');
    });

    it('returns username header for custom domain root', () => {
      const request = mockRequest('https://ralphhhbenedict.com/', 'ralphhhbenedict.com');
      const result = createDomainMiddleware(request);

      expect(result.headers.get('x-profile-username')).toBe('ralphhhbenedict');
    });

    it('returns username header for profile subdomain with @path', () => {
      const request = mockRequest('https://profile.resu-me.ai/@johndoe', 'profile.resu-me.ai');
      const result = createDomainMiddleware(request);

      expect(result.headers.get('x-profile-username')).toBe('johndoe');
    });

    it('returns null username for profile subdomain without @path', () => {
      const request = mockRequest('https://profile.resu-me.ai/', 'profile.resu-me.ai');
      const result = createDomainMiddleware(request);

      expect(result.headers.get('x-profile-username')).toBeNull();
    });

    it('returns analytics-source header for custom domain', () => {
      const request = mockRequest('https://ralphhhbenedict.com/', 'ralphhhbenedict.com');
      const result = createDomainMiddleware(request);

      expect(result.headers.get('x-analytics-source')).toBe('custom_domain');
    });

    it('returns analytics-source header for profile subdomain', () => {
      const request = mockRequest('https://profile.resu-me.ai/@test', 'profile.resu-me.ai');
      const result = createDomainMiddleware(request);

      expect(result.headers.get('x-analytics-source')).toBe('profile_subdomain');
    });

    it('returns analytics-source header for localhost', () => {
      const request = mockRequest('http://localhost:5173/', 'localhost');
      const result = createDomainMiddleware(request);

      expect(result.headers.get('x-analytics-source')).toBe('development');
    });
  });

  describe('URL Rewriting', () => {
    it('rewrites custom domain root to internal @username path', () => {
      const request = mockRequest('https://ralphhhbenedict.com/', 'ralphhhbenedict.com');
      const result = createDomainMiddleware(request);

      expect(result.rewriteUrl).toBe('/@ralphhhbenedict');
    });

    it('rewrites custom domain subpath to internal @username/subpath', () => {
      const request = mockRequest('https://ralphhhbenedict.com/case-studies', 'ralphhhbenedict.com');
      const result = createDomainMiddleware(request);

      expect(result.rewriteUrl).toBe('/@ralphhhbenedict/case-studies');
    });

    it('does not rewrite profile subdomain @username paths', () => {
      const request = mockRequest('https://profile.resu-me.ai/@johndoe', 'profile.resu-me.ai');
      const result = createDomainMiddleware(request);

      expect(result.rewriteUrl).toBeUndefined();
    });

    it('does not rewrite localhost', () => {
      const request = mockRequest('http://localhost:5173/@test', 'localhost');
      const result = createDomainMiddleware(request);

      expect(result.rewriteUrl).toBeUndefined();
    });
  });

  describe('createMiddlewareResponse', () => {
    it('creates response with all domain headers', () => {
      const result: MiddlewareResult = {
        headers: new Map([
          ['x-domain-type', 'custom'],
          ['x-profile-username', 'ralphhhbenedict'],
          ['x-analytics-source', 'custom_domain'],
        ]),
      };

      const response = createMiddlewareResponse(result);

      expect(response.headers.get('x-domain-type')).toBe('custom');
      expect(response.headers.get('x-profile-username')).toBe('ralphhhbenedict');
      expect(response.headers.get('x-analytics-source')).toBe('custom_domain');
    });

    it('passes through when no rewrite needed', () => {
      const result: MiddlewareResult = {
        headers: new Map([['x-domain-type', 'profile']]),
      };

      const response = createMiddlewareResponse(result);

      // Should return undefined to signal pass-through
      expect(response.type).toBe('pass-through');
    });

    it('signals rewrite when rewriteUrl is set', () => {
      const result: MiddlewareResult = {
        headers: new Map([['x-domain-type', 'custom']]),
        rewriteUrl: '/@ralphhhbenedict',
      };

      const response = createMiddlewareResponse(result);

      expect(response.type).toBe('rewrite');
      expect(response.destination).toBe('/@ralphhhbenedict');
    });
  });

  describe('Integration: Full Request Flow', () => {
    it('handles custom domain request end-to-end', () => {
      const request = mockRequest('https://ralphhhbenedict.com/', 'ralphhhbenedict.com');
      const result = createDomainMiddleware(request);
      const response = createMiddlewareResponse(result);

      expect(response.type).toBe('rewrite');
      expect(response.destination).toBe('/@ralphhhbenedict');
      expect(response.headers.get('x-profile-username')).toBe('ralphhhbenedict');
    });

    it('handles profile subdomain request end-to-end', () => {
      const request = mockRequest('https://profile.resu-me.ai/@katfeliena', 'profile.resu-me.ai');
      const result = createDomainMiddleware(request);
      const response = createMiddlewareResponse(result);

      expect(response.type).toBe('pass-through');
      expect(response.headers.get('x-profile-username')).toBe('katfeliena');
      expect(response.headers.get('x-domain-type')).toBe('profile');
    });
  });
});
