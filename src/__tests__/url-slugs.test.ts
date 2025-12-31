/**
 * V1.2.1 Portfolio Analytics: URL Slugs + Lexicon Property Sync
 *
 * TDD Tests for hash-based URL scroll navigation
 *
 * Linear Issue: RES-504
 * @see https://linear.app/resu-me-ai/issue/RES-504/v121-portfolio-analytics-url-slugs-lexicon-property-sync
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock Mixpanel before importing hook
vi.mock('@/lib/mixpanel', () => ({
  track: vi.fn(),
  default: {
    track: vi.fn(),
    identify: vi.fn(),
    init: vi.fn(),
  },
}))

// Import after mocking
import { track } from '@/lib/mixpanel'
import { useHashScrolling } from '@/hooks/useHashScrolling'

describe('V1.2.1 URL Slugs - useHashScrolling Hook', () => {
  const mockTrack = track as ReturnType<typeof vi.fn>

  // Mock scrollIntoView
  const mockScrollIntoView = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Reset hash
    window.location.hash = ''

    // Mock getElementById to return element with scrollIntoView
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (['seven-hats', 'case-studies', 'how-i-work', 'career-timeline', 'evidence-portfolio', 'skills', 'waitlist'].includes(id)) {
        return {
          scrollIntoView: mockScrollIntoView,
          id,
        } as unknown as HTMLElement
      }
      return null
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should return valid section slugs', () => {
    const { result } = renderHook(() => useHashScrolling())

    expect(result.current.validSlugs).toEqual([
      'seven-hats',
      'case-studies',
      'how-i-work',
      'career-timeline',
      'evidence-portfolio',
      'skills',
      'waitlist',
    ])
  })

  it('should scroll to section when hash matches valid slug', async () => {
    // Set hash before rendering
    window.location.hash = '#case-studies'

    renderHook(() => useHashScrolling())

    // Advance timers to trigger setTimeout
    await act(async () => {
      vi.advanceTimersByTime(150)
    })

    // Should call scrollIntoView
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('should NOT scroll when hash does not match valid slug', () => {
    window.location.hash = '#invalid-section'

    renderHook(() => useHashScrolling())

    expect(mockScrollIntoView).not.toHaveBeenCalled()
  })

  it('should fire hash_navigation event when scrolling to section', async () => {
    window.location.hash = '#seven-hats'

    renderHook(() => useHashScrolling())

    // Advance timers to trigger setTimeout
    await act(async () => {
      vi.advanceTimersByTime(150)
    })

    expect(mockTrack).toHaveBeenCalledWith('hash_navigation', expect.objectContaining({
      section_slug: 'seven-hats',
      navigation_type: 'initial_load',
    }))
  })

  it('should handle hash change events', () => {
    const { result } = renderHook(() => useHashScrolling())

    // Simulate hash change
    act(() => {
      window.location.hash = '#how-i-work'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(mockScrollIntoView).toHaveBeenCalled()
    expect(mockTrack).toHaveBeenCalledWith('hash_navigation', expect.objectContaining({
      section_slug: 'how-i-work',
      navigation_type: 'hash_change',
    }))
  })

  it('should provide scrollToSection function', () => {
    const { result } = renderHook(() => useHashScrolling())

    act(() => {
      result.current.scrollToSection('waitlist')
    })

    expect(mockScrollIntoView).toHaveBeenCalled()
    expect(window.location.hash).toBe('#waitlist')
  })

  it('should update currentSection when scrolling', () => {
    window.location.hash = '#skills'

    const { result } = renderHook(() => useHashScrolling())

    expect(result.current.currentSection).toBe('skills')
  })

  it('should cleanup hashchange listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useHashScrolling())
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function))
  })
})

describe('V1.2.1 URL Slugs - Section ID Validation', () => {
  it('should map all documented sections from PAGE_VIEW_TAXONOMY.md', () => {
    // Per PAGE_VIEW_TAXONOMY.md, these sections should exist:
    const expectedSections = [
      'seven-hats',      // /#seven-hats
      'case-studies',    // /#case-studies
      'how-i-work',      // /#how-i-work
      'career-timeline', // /#career-timeline
      'evidence-portfolio', // /#evidence-portfolio
      'skills',          // /#skills
      'waitlist',        // /#waitlist
    ]

    const { result } = renderHook(() => useHashScrolling())

    expectedSections.forEach((section) => {
      expect(result.current.validSlugs).toContain(section)
    })
  })
})

describe('V1.2.1 URL Slugs - Analytics Integration', () => {
  const mockTrack = track as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    window.location.hash = ''

    // Mock getElementById
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      return {
        scrollIntoView: vi.fn(),
        id,
      } as unknown as HTMLElement
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should include referrer in hash_navigation event', async () => {
    // Mock document.referrer
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com',
      configurable: true,
    })

    window.location.hash = '#case-studies'

    renderHook(() => useHashScrolling())

    // Advance timers to trigger setTimeout
    await act(async () => {
      vi.advanceTimersByTime(150)
    })

    expect(mockTrack).toHaveBeenCalledWith('hash_navigation', expect.objectContaining({
      section_slug: 'case-studies',
      referrer: 'https://google.com',
    }))
  })

  it('should track time_to_section_ms when navigating via programmatic scroll', () => {
    const { result } = renderHook(() => useHashScrolling())

    // Wait a bit then scroll
    act(() => {
      result.current.scrollToSection('case-studies')
    })

    expect(mockTrack).toHaveBeenCalledWith('hash_navigation', expect.objectContaining({
      section_slug: 'case-studies',
      time_to_section_ms: expect.any(Number),
    }))
  })
})
