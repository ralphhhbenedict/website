/**
 * V1.2.1 Portfolio Analytics: URL Slugs + Hash Navigation
 *
 * React hook for hash-based URL scroll navigation:
 * - Scrolls to sections via URL hash (e.g., /#case-studies)
 * - Fires hash_navigation event on navigation
 * - Supports both initial load and hash change events
 *
 * Linear Issue: RES-504
 * @see https://linear.app/resu-me-ai/issue/RES-504/v121-portfolio-analytics-url-slugs-lexicon-property-sync
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { track } from '@/lib/mixpanel'

// Valid section slugs from PAGE_VIEW_TAXONOMY.md
const VALID_SLUGS = [
  'seven-hats',
  'case-studies',
  'how-i-work',
  'career-timeline',
  'evidence-portfolio',
  'skills',
  'waitlist',
] as const

type SectionSlug = (typeof VALID_SLUGS)[number]

// Track page load time for time_to_section_ms calculations
const pageLoadTime = Date.now()

/**
 * Get time since page load in milliseconds
 */
function getTimeSincePageLoad(): number {
  return Date.now() - pageLoadTime
}

/**
 * Extract hash from URL without the # prefix
 */
function getHashSlug(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  if (!hash || hash === '#') return null
  return hash.slice(1) // Remove # prefix
}

/**
 * Check if a slug is valid
 */
function isValidSlug(slug: string): slug is SectionSlug {
  return VALID_SLUGS.includes(slug as SectionSlug)
}

export function useHashScrolling() {
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const hasScrolledOnLoad = useRef(false)

  /**
   * Scroll to a section and fire analytics event
   */
  const scrollToSectionInternal = useCallback(
    (slug: string, navigationType: 'initial_load' | 'hash_change' | 'programmatic') => {
      if (!isValidSlug(slug)) return false

      const element = document.getElementById(slug)
      if (!element) return false

      // Scroll to section
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      // Update current section
      setCurrentSection(slug)

      // Fire analytics event
      const eventProperties: Record<string, unknown> = {
        section_slug: slug,
        navigation_type: navigationType,
        time_to_section_ms: getTimeSincePageLoad(),
      }

      // Include referrer if available
      if (typeof document !== 'undefined' && document.referrer) {
        eventProperties.referrer = document.referrer
      }

      track('hash_navigation', eventProperties)

      return true
    },
    []
  )

  /**
   * Public function to programmatically scroll to a section
   */
  const scrollToSection = useCallback(
    (slug: string) => {
      if (!isValidSlug(slug)) return

      // Update URL hash
      if (typeof window !== 'undefined') {
        window.location.hash = `#${slug}`
      }

      scrollToSectionInternal(slug, 'programmatic')
    },
    [scrollToSectionInternal]
  )

  /**
   * Handle hash changes
   */
  const handleHashChange = useCallback(() => {
    const slug = getHashSlug()
    if (slug && isValidSlug(slug)) {
      scrollToSectionInternal(slug, 'hash_change')
    }
  }, [scrollToSectionInternal])

  // Handle initial load and hash changes
  useEffect(() => {
    // Handle initial load with hash
    if (!hasScrolledOnLoad.current) {
      const slug = getHashSlug()
      if (slug && isValidSlug(slug)) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          scrollToSectionInternal(slug, 'initial_load')
        }, 100)
        setCurrentSection(slug)
      }
      hasScrolledOnLoad.current = true
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [handleHashChange, scrollToSectionInternal])

  return {
    validSlugs: VALID_SLUGS as unknown as string[],
    currentSection,
    scrollToSection,
  }
}
