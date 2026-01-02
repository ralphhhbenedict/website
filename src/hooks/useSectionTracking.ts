/**
 * Section Visibility & Scroll Depth Tracking Hook
 *
 * RES-556: profile_section_viewed - IntersectionObserver for sections entering viewport
 * RES-558: tab_scroll_depth - Scroll depth tracking within tabs
 *
 * @see PROFILE_DOMAIN_FULL.json for event specifications
 */

import { useCallback, useEffect, useRef } from 'react'
import { trackProfileSectionViewed, trackTabScrollDepth } from '@/lib/mixpanel'

type SectionName = 'header' | 'services' | 'waitlist' | 'loom_cta' | 'tabs'
type TabName = 'case-studies' | 'seven-hats' | 'how-i-work'
type ScrollDepthThreshold = 25 | 50 | 75 | 100

const SCROLL_THRESHOLDS: ScrollDepthThreshold[] = [25, 50, 75, 100]

// Default profile username for the prototype site
const DEFAULT_PROFILE_USERNAME = '@ralphbautista'

/**
 * Hook for tracking section visibility using IntersectionObserver
 * Fires profile_section_viewed when sections enter viewport
 */
export function useSectionVisibility(profileUsername: string = DEFAULT_PROFILE_USERNAME) {
  // Track which sections have been viewed (deduplication)
  const viewedSections = useRef<Set<SectionName>>(new Set())

  // Track section entry times for time_on_section_ms calculation
  const sectionEntryTimes = useRef<Map<SectionName, number>>(new Map())

  // Store observers for cleanup
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map())

  /**
   * Create a ref callback for observing section visibility
   * Uses IntersectionObserver to track when sections enter viewport
   */
  const createSectionRef = useCallback(
    (sectionName: SectionName) => {
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

        // Skip if already observing this section
        if (observersRef.current.has(sectionName)) {
          return
        }

        // Create IntersectionObserver to track visibility
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // Section entered viewport
                if (!viewedSections.current.has(sectionName)) {
                  viewedSections.current.add(sectionName)
                  sectionEntryTimes.current.set(sectionName, Date.now())

                  // Fire the event
                  trackProfileSectionViewed(profileUsername, sectionName)
                }
              } else {
                // Section left viewport - calculate time on section if we have entry time
                const entryTime = sectionEntryTimes.current.get(sectionName)
                if (entryTime) {
                  const timeOnSection = Date.now() - entryTime
                  // We could fire an updated event here if needed
                  sectionEntryTimes.current.delete(sectionName)
                }
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
    [profileUsername]
  )

  // Cleanup observers on unmount
  useEffect(() => {
    return () => {
      observersRef.current.forEach((observer) => observer.disconnect())
      observersRef.current.clear()
    }
  }, [])

  return { createSectionRef }
}

/**
 * Hook for tracking scroll depth within tab content
 * Fires tab_scroll_depth at 25%, 50%, 75%, 100% thresholds
 */
export function useTabScrollDepth(activeTab: TabName | null) {
  // Track which thresholds have been reached per tab (for deduplication)
  const reachedThresholds = useRef<Map<TabName, Set<ScrollDepthThreshold>>>(new Map())

  // Track when scrolling started for time_to_depth_ms
  const scrollStartTime = useRef<number>(Date.now())

  // Track the scroll container element
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  // Reset thresholds when tab changes
  useEffect(() => {
    if (activeTab) {
      // Reset scroll start time when switching tabs
      scrollStartTime.current = Date.now()

      // Initialize threshold set for new tab if not exists
      if (!reachedThresholds.current.has(activeTab)) {
        reachedThresholds.current.set(activeTab, new Set())
      }
    }
  }, [activeTab])

  /**
   * Create a ref callback for the scrollable tab content container
   */
  const createScrollRef = useCallback(() => {
    return (element: HTMLElement | null) => {
      scrollContainerRef.current = element
    }
  }, [])

  /**
   * Handle scroll events and check for threshold crossings
   */
  const handleScroll = useCallback(() => {
    if (!activeTab || !scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollHeight = container.scrollHeight - container.clientHeight

    if (scrollHeight <= 0) return // No scroll possible

    const scrollPercent = (container.scrollTop / scrollHeight) * 100
    const tabThresholds = reachedThresholds.current.get(activeTab) || new Set()

    // Check each threshold
    SCROLL_THRESHOLDS.forEach((threshold) => {
      if (scrollPercent >= threshold && !tabThresholds.has(threshold)) {
        tabThresholds.add(threshold)
        reachedThresholds.current.set(activeTab, tabThresholds)

        const timeToDepth = Date.now() - scrollStartTime.current
        trackTabScrollDepth(activeTab, threshold, timeToDepth)
      }
    })
  }, [activeTab])

  // Set up scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return { createScrollRef, handleScroll }
}

/**
 * Combined hook for all section tracking needs
 */
export function useSectionTracking(
  profileUsername: string = DEFAULT_PROFILE_USERNAME,
  activeTab: TabName | null = null
) {
  const { createSectionRef } = useSectionVisibility(profileUsername)
  const { createScrollRef, handleScroll } = useTabScrollDepth(activeTab)

  return {
    createSectionRef,
    createScrollRef,
    handleScroll,
  }
}
