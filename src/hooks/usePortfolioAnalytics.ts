/**
 * V1.2 Portfolio Analytics - Profile Page Tracking
 *
 * React hook for tracking portfolio page interactions:
 * - portfolio_page_viewed: Fires on page load
 * - portfolio_section_viewed: Fires when sections enter viewport
 * - portfolio_project_clicked: Tracks project interactions
 * - portfolio_cta_clicked: Tracks CTA clicks
 *
 * Linear Issue: RES-485
 * @see https://linear.app/resu-me-ai/issue/RES-485/v12-portfolio-analytics-profile-page-tracking
 */

import { useCallback, useEffect, useRef } from 'react'
import { track } from '@/lib/mixpanel'

// Track page load time for time_on_page calculations
const pageLoadTime = Date.now()

/**
 * Extract UTM parameters from current URL
 */
function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  const searchParams = new URLSearchParams(window.location.search)
  const utmParams: Record<string, string> = {}

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  utmKeys.forEach((key) => {
    const value = searchParams.get(key)
    if (value) {
      utmParams[key] = value
    }
  })

  return utmParams
}

/**
 * Get current time on page in milliseconds
 */
function getTimeOnPage(): number {
  return Date.now() - pageLoadTime
}

export function usePortfolioAnalytics() {
  // Track which sections have been viewed (for deduplication)
  const viewedSections = useRef<Set<string>>(new Set())

  // Store intersection observers for cleanup
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map())

  /**
   * Track page view event - fires on page load
   */
  const trackPageViewed = useCallback(() => {
    const utmParams = getUtmParams()
    const referrer = typeof document !== 'undefined' ? document.referrer : ''

    track('portfolio_page_viewed', {
      page_name: 'profile',
      referrer,
      ...utmParams,
    })
  }, [])

  /**
   * Track section viewed event - fires when section enters viewport
   * Deduplicates to only fire once per section per session
   */
  const trackSectionViewed = useCallback((sectionName: string) => {
    // Deduplicate - only fire once per section
    if (viewedSections.current.has(sectionName)) {
      return
    }

    viewedSections.current.add(sectionName)

    track('portfolio_section_viewed', {
      section_name: sectionName,
      time_on_page_ms: getTimeOnPage(),
    })
  }, [])

  /**
   * Track project click event
   */
  const trackProjectClicked = useCallback(
    (projectName: string, section: string, hat?: string) => {
      const properties: Record<string, unknown> = {
        project_name: projectName,
        section,
      }

      if (hat) {
        properties.hat = hat
      }

      track('portfolio_project_clicked', properties)
    },
    []
  )

  /**
   * Track CTA click event
   */
  const trackCtaClicked = useCallback(
    (ctaType: string, ctaText: string, location: string) => {
      track('portfolio_cta_clicked', {
        cta_type: ctaType,
        cta_text: ctaText,
        location,
      })
    },
    []
  )

  /**
   * Create a ref callback for observing section visibility
   * Uses IntersectionObserver to track when sections enter viewport
   */
  const createSectionRef = useCallback(
    (sectionName: string) => {
      return (element: HTMLElement | null) => {
        if (!element) {
          // Cleanup observer if element is removed
          const existingObserver = observersRef.current.get(sectionName)
          if (existingObserver) {
            existingObserver.disconnect()
            observersRef.current.delete(sectionName)
          }
          return
        }

        // Skip if already observing
        if (observersRef.current.has(sectionName)) {
          return
        }

        // Create IntersectionObserver to track visibility
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                trackSectionViewed(sectionName)
                // Disconnect after first view since we only track once
                observer.disconnect()
                observersRef.current.delete(sectionName)
              }
            })
          },
          {
            threshold: 0.3, // Fire when 30% of section is visible
            rootMargin: '0px',
          }
        )

        observer.observe(element)
        observersRef.current.set(sectionName, observer)
      }
    },
    [trackSectionViewed]
  )

  // Cleanup observers on unmount
  useEffect(() => {
    return () => {
      observersRef.current.forEach((observer) => observer.disconnect())
      observersRef.current.clear()
    }
  }, [])

  return {
    trackPageViewed,
    trackSectionViewed,
    trackProjectClicked,
    trackCtaClicked,
    createSectionRef,
  }
}

