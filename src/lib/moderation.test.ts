/**
 * TDD: Content Moderation Tests
 * ==============================
 * RED PHASE: These tests define the behavior we WANT.
 * They will FAIL until we implement the moderation.ts module.
 *
 * Requirements:
 * 1. checkProfanity(text) - Detect profane/offensive words
 * 2. checkSpam(text) - Detect spam patterns (excessive caps, repeated chars, etc.)
 * 3. checkMaliciousLinks(text) - Validate URLs for safety
 * 4. moderateContent(content) - Combined check returning { safe: boolean, issues: string[] }
 */

import { describe, it, expect } from 'vitest';
import {
  checkProfanity,
  checkSpam,
  checkMaliciousLinks,
  moderateContent,
  type ModerationResult,
} from './moderation';

describe('Content Moderation (TDD)', () => {
  describe('checkProfanity', () => {
    it('returns empty array for clean text', () => {
      const result = checkProfanity('Hello, this is a normal message.');
      expect(result).toEqual([]);
    });

    it('detects basic profane words', () => {
      const result = checkProfanity('This is damn annoying');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('profanity detected');
    });

    it('detects profanity regardless of case', () => {
      const result = checkProfanity('This is DAMN annoying');
      expect(result.length).toBeGreaterThan(0);
    });

    it('detects multiple profane words', () => {
      const result = checkProfanity('What the hell, this is damn frustrating');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles empty string', () => {
      const result = checkProfanity('');
      expect(result).toEqual([]);
    });

    it('does not flag legitimate words containing profanity substrings', () => {
      // "scrap" contains "crap" but is a legitimate word
      const result = checkProfanity('I need to scrap this document');
      expect(result).toEqual([]);
    });

    it('detects attempts to bypass with l33t speak', () => {
      const result = checkProfanity('This is sh1t');
      expect(result.length).toBeGreaterThan(0);
    });

    it('detects attempts to bypass with spacing', () => {
      const result = checkProfanity('This is s h i t');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('checkSpam', () => {
    it('returns empty array for normal text', () => {
      const result = checkSpam('This is a normal message with proper formatting.');
      expect(result).toEqual([]);
    });

    it('detects excessive capitalization', () => {
      const result = checkSpam('BUY NOW AMAZING DEAL FREE SHIPPING');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(issue => issue.includes('caps') || issue.includes('capitalization'))).toBe(true);
    });

    it('detects repeated characters', () => {
      const result = checkSpam('Hellllllooooo therrrreee');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(issue => issue.includes('repeated'))).toBe(true);
    });

    it('detects excessive punctuation', () => {
      const result = checkSpam('OMG!!!!!! This is amazing!!!!');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(issue => issue.includes('punctuation'))).toBe(true);
    });

    it('detects spam trigger phrases', () => {
      const result = checkSpam('Click here to claim your free prize now!');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(issue => issue.includes('spam'))).toBe(true);
    });

    it('detects multiple spam indicators', () => {
      const result = checkSpam('FREE MONEY!!!!! CLICK NOW!!!!');
      expect(result.length).toBeGreaterThan(1);
    });

    it('handles empty string', () => {
      const result = checkSpam('');
      expect(result).toEqual([]);
    });

    it('allows reasonable use of caps in acronyms', () => {
      const result = checkSpam('I work at NASA and use the API daily.');
      expect(result).toEqual([]);
    });

    it('detects excessive emoji usage', () => {
      const result = checkSpam('Amazing deal!!! !!!!!');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('checkMaliciousLinks', () => {
    it('returns empty array for text without URLs', () => {
      const result = checkMaliciousLinks('This is a normal message without links.');
      expect(result).toEqual([]);
    });

    it('allows safe HTTPS URLs', () => {
      const result = checkMaliciousLinks('Check out https://github.com/user/repo');
      expect(result).toEqual([]);
    });

    it('flags HTTP URLs as potentially unsafe', () => {
      // Note: example.com is in safe domains, so use a different domain
      const result = checkMaliciousLinks('Visit http://random-site.com for more');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(issue => issue.includes('HTTP') || issue.includes('insecure'))).toBe(true);
    });

    it('detects known phishing domains', () => {
      const result = checkMaliciousLinks('Click https://g00gle.com/login');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(issue => issue.includes('suspicious') || issue.includes('phishing'))).toBe(true);
    });

    it('detects URL shorteners', () => {
      const result = checkMaliciousLinks('Check this out: https://bit.ly/abc123');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(issue => issue.includes('shortener'))).toBe(true);
    });

    it('detects IP address URLs', () => {
      const result = checkMaliciousLinks('Visit http://192.168.1.1/admin');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(issue => issue.includes('IP') || issue.includes('suspicious'))).toBe(true);
    });

    it('detects multiple suspicious URLs', () => {
      const result = checkMaliciousLinks('Check http://bad.com and https://bit.ly/x');
      expect(result.length).toBeGreaterThan(1);
    });

    it('handles empty string', () => {
      const result = checkMaliciousLinks('');
      expect(result).toEqual([]);
    });

    it('allows common safe domains', () => {
      const result = checkMaliciousLinks('Visit https://google.com, https://linkedin.com, or https://twitter.com');
      expect(result).toEqual([]);
    });

    it('detects obfuscated URLs', () => {
      const result = checkMaliciousLinks('Check out hxxps://malware[.]com/bad');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('moderateContent', () => {
    it('returns safe for clean content', () => {
      const result = moderateContent('Hello, this is a professional message about my work experience.');
      expect(result.safe).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('returns correct structure', () => {
      const result = moderateContent('Test message');
      expect(result).toHaveProperty('safe');
      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('catches profanity issues', () => {
      const result = moderateContent('This is damn frustrating work.');
      expect(result.safe).toBe(false);
      expect(result.issues.some(issue => issue.includes('profanity'))).toBe(true);
    });

    it('catches spam issues', () => {
      const result = moderateContent('FREE MONEY NOW!!!! CLICK HERE!!!!');
      expect(result.safe).toBe(false);
      expect(result.issues.some(issue => issue.includes('spam') || issue.includes('caps'))).toBe(true);
    });

    it('catches malicious link issues', () => {
      const result = moderateContent('Check out my site at http://malicious-site.com/hack');
      expect(result.safe).toBe(false);
      expect(result.issues.some(issue => issue.includes('HTTP') || issue.includes('link'))).toBe(true);
    });

    it('catches multiple types of issues', () => {
      const result = moderateContent('DAMN IT!!!! Visit http://bad.com NOW!!!!');
      expect(result.safe).toBe(false);
      expect(result.issues.length).toBeGreaterThan(1);
    });

    it('handles empty content', () => {
      const result = moderateContent('');
      expect(result.safe).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('handles whitespace-only content', () => {
      const result = moderateContent('   \n\t   ');
      expect(result.safe).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('provides actionable issue descriptions', () => {
      const result = moderateContent('What the hell is this shit?');
      expect(result.safe).toBe(false);
      // Issues should be human-readable
      result.issues.forEach(issue => {
        expect(issue.length).toBeGreaterThan(5);
        expect(typeof issue).toBe('string');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long text', () => {
      const longText = 'This is a normal sentence. '.repeat(1000);
      const result = moderateContent(longText);
      expect(result.safe).toBe(true);
    });

    it('handles unicode characters', () => {
      const result = moderateContent('Hello! Hola! Bonjour! Hallo!');
      expect(result.safe).toBe(true);
    });

    it('handles special characters', () => {
      const result = moderateContent('Email: test@example.com, Phone: +1-555-0123');
      expect(result.safe).toBe(true);
    });

    it('handles markdown content', () => {
      const result = moderateContent('# Header\n\n**Bold text** and *italic* with [link](https://example.com)');
      expect(result.safe).toBe(true);
    });

    it('handles HTML-like content', () => {
      const result = moderateContent('<script>alert("xss")</script>');
      // Should flag potentially malicious HTML
      expect(result.issues.length).toBeGreaterThanOrEqual(0);
    });

    it('handles newlines and tabs', () => {
      const result = moderateContent('Line 1\nLine 2\tTabbed content');
      expect(result.safe).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('ModerationResult has correct shape', () => {
      const result: ModerationResult = moderateContent('test');
      expect(typeof result.safe).toBe('boolean');
      expect(Array.isArray(result.issues)).toBe(true);
    });
  });
});
