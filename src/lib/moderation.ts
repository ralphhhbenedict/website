/**
 * Content Moderation Module
 * =========================
 * Pattern-based content moderation without external API dependencies.
 * Provides profanity filtering, spam detection, and malicious link checking.
 */

export interface ModerationResult {
  safe: boolean;
  issues: string[];
}

// Profanity word list (basic set - expand as needed)
const PROFANITY_WORDS = [
  'damn', 'hell', 'crap', 'shit', 'fuck', 'ass', 'bitch', 'bastard',
  'piss', 'dick', 'cock', 'pussy', 'slut', 'whore',
];

// L33t speak mappings for bypass detection
const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
};

// Spam trigger phrases
const SPAM_PHRASES = [
  'click here',
  'free money',
  'free prize',
  'act now',
  'limited time',
  'buy now',
  'winner',
  'congratulations you won',
  'claim your',
  'make money fast',
  'work from home',
  'no obligation',
  'risk free',
  'double your',
  'earn extra cash',
];

// URL shorteners to flag
const URL_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'adf.ly',
  'j.mp',
  'tr.im',
  'short.io',
];

// Known safe domains (won't be flagged)
const SAFE_DOMAINS = [
  'google.com',
  'github.com',
  'linkedin.com',
  'twitter.com',
  'facebook.com',
  'youtube.com',
  'microsoft.com',
  'apple.com',
  'amazon.com',
  'wikipedia.org',
  'stackoverflow.com',
  'medium.com',
  'example.com',
  'resu-me.ai',
];

// Suspicious domain patterns (typosquatting, etc.)
// Note: These patterns match ONLY typosquatted versions, not the real domains
const SUSPICIOUS_DOMAIN_PATTERNS = [
  /^g[0o]{2}gle\.com$/i,     // g00gle.com (not google.com)
  /^faceb[0o]{2}k\.com$/i,   // faceb00k.com
  /^amaz[0o]n\.com$/i,       // amaz0n.com (not amazon.com)
  /^micr[0o]s[0o]ft\.com$/i, // micr0soft.com
  /^paypa[l1]\.com$/i,       // paypa1.com
];

/**
 * Normalize text for comparison
 * Converts l33t speak and removes spacing tricks
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();

  // Replace l33t speak characters
  for (const [leet, normal] of Object.entries(LEET_MAP)) {
    normalized = normalized.replace(new RegExp(leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), normal);
  }

  return normalized;
}

/**
 * Remove spacing between characters (for bypass detection)
 */
function removeSpacing(text: string): string {
  return text.replace(/\s+/g, '');
}

/**
 * Check text for profanity
 * @param text - The text to check
 * @returns Array of issue descriptions (empty if clean)
 */
export function checkProfanity(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const issues: string[] = [];
  const normalizedText = normalizeText(text);
  const noSpacingText = normalizeText(removeSpacing(text));

  for (const word of PROFANITY_WORDS) {
    // Check for word boundaries to avoid false positives like "scrap" containing "crap"
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');

    if (wordRegex.test(normalizedText)) {
      issues.push('profanity detected');
      break; // One detection is enough
    }

    // Check for spaced-out attempts (s h i t)
    if (noSpacingText.includes(word) && !normalizedText.includes(word)) {
      issues.push('profanity detected');
      break;
    }
  }

  return issues;
}

/**
 * Check text for spam patterns
 * @param text - The text to check
 * @returns Array of issue descriptions (empty if clean)
 */
export function checkSpam(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const issues: string[] = [];

  // Check for excessive capitalization (more than 60% caps, min 10 chars)
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 10) {
    const capsCount = (letters.match(/[A-Z]/g) || []).length;
    const capsRatio = capsCount / letters.length;

    // Common spam words that should NOT be considered acronyms
    const SPAM_WORDS = ['buy', 'now', 'free', 'deal', 'win', 'get', 'act', 'new', 'hot', 'best'];

    // Allow for legitimate acronyms (2-4 letter all-caps words like NASA, API, SQL)
    // But NOT common spam words
    const words = text.split(/\s+/).filter(w => /[a-zA-Z]/.test(w));

    // True acronyms are 2-4 letters AND not common spam words
    const trueAcronyms = words.filter(w => {
      const lettersOnly = w.replace(/[^a-zA-Z]/g, '');
      const isShort = lettersOnly.length >= 2 && lettersOnly.length <= 4;
      const isAllCaps = lettersOnly === lettersOnly.toUpperCase();
      const isSpamWord = SPAM_WORDS.includes(lettersOnly.toLowerCase());
      return isShort && isAllCaps && !isSpamWord;
    });

    // If most words are true acronyms (not spam words), it's likely legitimate
    const isMostlyAcronyms = trueAcronyms.length >= words.length * 0.5;

    // Flag if high caps ratio AND not mostly true acronyms
    if (capsRatio > 0.6 && !isMostlyAcronyms) {
      issues.push('excessive capitalization detected');
    }
  }

  // Check for repeated characters (4+ in a row)
  if (/(.)\1{3,}/i.test(text)) {
    issues.push('repeated characters detected');
  }

  // Check for excessive punctuation (4+ of same punctuation)
  if (/([!?.])\1{3,}/.test(text)) {
    issues.push('excessive punctuation detected');
  }

  // Check for spam trigger phrases
  const lowerText = text.toLowerCase();
  for (const phrase of SPAM_PHRASES) {
    if (lowerText.includes(phrase)) {
      issues.push('spam phrase detected');
      break;
    }
  }

  return issues;
}

/**
 * Extract URLs from text
 */
function extractUrls(text: string): string[] {
  // Match standard URLs
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const standardUrls = text.match(urlRegex) || [];

  // Match obfuscated URLs (hxxp, [.], etc.)
  const obfuscatedRegex = /hxxps?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const obfuscatedUrls = text.match(obfuscatedRegex) || [];

  // Check for bracket-obfuscated domains
  const bracketRegex = /\w+\[\.\]\w+/gi;
  const bracketDomains = text.match(bracketRegex) || [];

  return [...standardUrls, ...obfuscatedUrls, ...bracketDomains];
}

/**
 * Check if a URL is a known safe domain
 */
function isSafeDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return SAFE_DOMAINS.some(safe => hostname === safe || hostname.endsWith('.' + safe));
  } catch {
    return false;
  }
}

/**
 * Check if URL is a URL shortener
 */
function isUrlShortener(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return URL_SHORTENERS.some(shortener => hostname === shortener || hostname.endsWith('.' + shortener));
  } catch {
    return false;
  }
}

/**
 * Check if URL uses an IP address
 */
function isIpAddress(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    // Check for IPv4
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  } catch {
    return false;
  }
}

/**
 * Check if domain matches suspicious patterns
 */
function isSuspiciousDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SUSPICIOUS_DOMAIN_PATTERNS.some(pattern => pattern.test(hostname));
  } catch {
    return false;
  }
}

/**
 * Check text for malicious or suspicious links
 * @param text - The text to check
 * @returns Array of issue descriptions (empty if clean)
 */
export function checkMaliciousLinks(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const issues: string[] = [];
  const urls = extractUrls(text);

  // Check for obfuscated URLs (hxxp, brackets)
  if (/hxxps?:\/\//i.test(text) || /\w+\[\.\]\w+/.test(text)) {
    issues.push('obfuscated URL detected - suspicious');
  }

  for (const url of urls) {
    // Skip obfuscated URLs (already flagged above)
    if (url.startsWith('hxxp') || url.includes('[.]')) {
      continue;
    }

    // Check if it's a safe domain first (before other checks)
    const isSafe = isSafeDomain(url);

    // Skip further checks for safe domains
    if (isSafe) {
      continue;
    }

    // Flag IP address URLs FIRST (always suspicious, even with HTTPS)
    // This takes priority over HTTP warning since IP is more specific
    if (isIpAddress(url)) {
      issues.push('IP address URL detected - suspicious');
      continue;
    }

    // Flag HTTP (non-secure) URLs
    if (url.startsWith('http://')) {
      issues.push('insecure HTTP link detected');
      continue;
    }

    // Flag URL shorteners
    if (isUrlShortener(url)) {
      issues.push('URL shortener detected - destination unknown');
      continue;
    }

    // Flag suspicious domain patterns (typosquatting)
    if (isSuspiciousDomain(url)) {
      issues.push('suspicious/phishing domain detected');
    }
  }

  return issues;
}

/**
 * Combined content moderation check
 * @param content - The content to moderate
 * @returns ModerationResult with safety status and list of issues
 */
export function moderateContent(content: string): ModerationResult {
  if (!content || content.trim().length === 0) {
    return { safe: true, issues: [] };
  }

  const allIssues: string[] = [];

  // Run all checks
  const profanityIssues = checkProfanity(content);
  const spamIssues = checkSpam(content);
  const linkIssues = checkMaliciousLinks(content);

  // Aggregate issues with categories for clarity
  profanityIssues.forEach(issue => allIssues.push(`Profanity: ${issue}`));
  spamIssues.forEach(issue => allIssues.push(`Spam: ${issue}`));
  linkIssues.forEach(issue => allIssues.push(`Link: ${issue}`));

  return {
    safe: allIssues.length === 0,
    issues: allIssues,
  };
}
