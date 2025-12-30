/**
 * V1.2 Portfolio Analytics - Profile Page Tracking
 * TDD Spec - Write tests FIRST, then implement
 *
 * Linear Issue: RES-485
 * @see https://linear.app/resu-me-ai/issue/RES-485/v12-portfolio-analytics-profile-page-tracking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePortfolioAnalytics } from '@/hooks/usePortfolioAnalytics'
import * as mixpanel from '@/lib/mixpanel'

// Mock mixpanel module
vi.mock('@/lib/mixpanel', () => ({
  track: vi.fn(),
  initMixpanel: vi.fn(),
}))

describe('V1.2 Portfolio Analytics - usePortfolioAnalytics', () => {
  const mockTrack = vi.mocked(mixpanel.track)

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset any state between tests
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('portfolio_page_viewed', () => {
    it('fires portfolio_page_viewed on page load', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())

      // Act
      act(() => {
        result.current.trackPageViewed()
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_page_viewed',
        expect.objectContaining({
          page_name: 'profile',
          referrer: expect.any(String),
        })
      )
    })

    it('includes UTM parameters when present in URL', () => {
      // Arrange - mock URL with UTM params
      const originalLocation = window.location
      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          search: '?utm_source=linkedin&utm_medium=social&utm_campaign=launch',
          href: 'https://profile.resu-me.ai?utm_source=linkedin',
        },
        writable: true,
      })

      // Act
      const { result } = renderHook(() => usePortfolioAnalytics())
      act(() => {
        result.current.trackPageViewed()
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_page_viewed',
        expect.objectContaining({
          utm_source: 'linkedin',
          utm_medium: 'social',
          utm_campaign: 'launch',
        })
      )

      // Cleanup
      Object.defineProperty(window, 'location', { value: originalLocation, writable: true })
    })
  })

  describe('portfolio_section_viewed', () => {
    it('fires portfolio_section_viewed when section enters viewport', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())
      const sectionName = 'case-studies'

      // Act
      act(() => {
        result.current.trackSectionViewed(sectionName)
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_section_viewed',
        expect.objectContaining({
          section_name: 'case-studies',
          time_on_page_ms: expect.any(Number),
        })
      )
    })

    it('tracks multiple sections independently', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())

      // Act
      act(() => {
        result.current.trackSectionViewed('case-studies')
        result.current.trackSectionViewed('seven-hats')
        result.current.trackSectionViewed('how-i-work')
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledTimes(3)
      expect(mockTrack).toHaveBeenNthCalledWith(
        1,
        'portfolio_section_viewed',
        expect.objectContaining({ section_name: 'case-studies' })
      )
      expect(mockTrack).toHaveBeenNthCalledWith(
        2,
        'portfolio_section_viewed',
        expect.objectContaining({ section_name: 'seven-hats' })
      )
      expect(mockTrack).toHaveBeenNthCalledWith(
        3,
        'portfolio_section_viewed',
        expect.objectContaining({ section_name: 'how-i-work' })
      )
    })

    it('only fires once per section (deduplication)', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())

      // Act - view same section multiple times
      act(() => {
        result.current.trackSectionViewed('case-studies')
        result.current.trackSectionViewed('case-studies')
        result.current.trackSectionViewed('case-studies')
      })

      // Assert - should only fire once
      expect(mockTrack).toHaveBeenCalledTimes(1)
    })
  })

  describe('portfolio_project_clicked', () => {
    it('fires portfolio_project_clicked when project is clicked', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())
      const projectData = {
        project_name: 'E2E Product Artifact',
        section: 'seven-hats',
        hat: 'Product Manager',
      }

      // Act
      act(() => {
        result.current.trackProjectClicked(
          projectData.project_name,
          projectData.section,
          projectData.hat
        )
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_project_clicked',
        expect.objectContaining({
          project_name: 'E2E Product Artifact',
          section: 'seven-hats',
          hat: 'Product Manager',
        })
      )
    })

    it('tracks click without hat for non-seven-hats sections', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())

      // Act
      act(() => {
        result.current.trackProjectClicked('AI Process Automation', 'case-studies')
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_project_clicked',
        expect.objectContaining({
          project_name: 'AI Process Automation',
          section: 'case-studies',
        })
      )
      // hat should be undefined for non-seven-hats
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_project_clicked',
        expect.not.objectContaining({
          hat: expect.any(String),
        })
      )
    })
  })

  describe('portfolio_cta_clicked', () => {
    it('fires portfolio_cta_clicked when CTA is clicked', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())
      const ctaData = {
        cta_type: 'request_case_study',
        cta_text: 'Request Full Case Study',
        location: 'case-studies',
      }

      // Act
      act(() => {
        result.current.trackCtaClicked(ctaData.cta_type, ctaData.cta_text, ctaData.location)
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_cta_clicked',
        expect.objectContaining({
          cta_type: 'request_case_study',
          cta_text: 'Request Full Case Study',
          location: 'case-studies',
        })
      )
    })

    it('tracks see_my_work CTA from header', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())

      // Act
      act(() => {
        result.current.trackCtaClicked('see_my_work', 'See My Work', 'header')
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_cta_clicked',
        expect.objectContaining({
          cta_type: 'see_my_work',
          location: 'header',
        })
      )
    })

    it('tracks get_in_touch CTA from sticky footer', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())

      // Act
      act(() => {
        result.current.trackCtaClicked('get_in_touch', 'Get in Touch', 'sticky_footer')
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_cta_clicked',
        expect.objectContaining({
          cta_type: 'get_in_touch',
          location: 'sticky_footer',
        })
      )
    })
  })

  describe('intersection observer integration', () => {
    it('returns a ref callback for section observation', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())

      // Assert
      expect(result.current.createSectionRef).toBeDefined()
      expect(typeof result.current.createSectionRef).toBe('function')
    })

    it('createSectionRef returns a valid ref function', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())

      // Act
      const ref = result.current.createSectionRef('test-section')

      // Assert
      expect(typeof ref).toBe('function')
    })
  })

  describe('time tracking', () => {
    it('includes accurate time_on_page_ms in section events', () => {
      // Arrange
      const { result } = renderHook(() => usePortfolioAnalytics())

      // Act - advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000)
        result.current.trackSectionViewed('case-studies')
      })

      // Assert
      expect(mockTrack).toHaveBeenCalledWith(
        'portfolio_section_viewed',
        expect.objectContaining({
          time_on_page_ms: expect.any(Number),
        })
      )

      // Verify the time is approximately correct (5000ms +/- tolerance)
      const call = mockTrack.mock.calls[0]
      const timeOnPage = (call[1] as Record<string, number>).time_on_page_ms
      expect(timeOnPage).toBeGreaterThanOrEqual(5000)
    })
  })
})

