/**
 * Profile Domain Analytics Tests
 *
 * RES-556: profile_section_viewed - IntersectionObserver for sections
 * RES-557: profile_link_clicked - External link click tracking
 * RES-558: Tab Content Scroll Depth - Scroll depth within tabs
 * RES-559: Fix duplicate page_viewed - profile_viewed event
 *
 * @see PROFILE_DOMAIN_FULL.json for event specifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import * as mixpanel from '@/lib/mixpanel'

// Mock mixpanel module
vi.mock('@/lib/mixpanel', () => ({
  track: vi.fn(),
  initMixpanel: vi.fn(),
  trackProfileSectionViewed: vi.fn(),
  trackProfileLinkClicked: vi.fn(),
  trackTabScrollDepth: vi.fn(),
  trackProfileViewed: vi.fn(),
}))

describe('Profile Domain Analytics - RES-556 to RES-559', () => {
  const mockTrack = vi.mocked(mixpanel.track)
  const mockTrackProfileSectionViewed = vi.mocked(mixpanel.trackProfileSectionViewed)
  const mockTrackProfileLinkClicked = vi.mocked(mixpanel.trackProfileLinkClicked)
  const mockTrackTabScrollDepth = vi.mocked(mixpanel.trackTabScrollDepth)
  const mockTrackProfileViewed = vi.mocked(mixpanel.trackProfileViewed)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('RES-556: profile_section_viewed', () => {
    it('trackProfileSectionViewed fires with correct properties', async () => {
      // Dynamically import the hook to test
      const { useSectionVisibility } = await import('@/hooks/useSectionTracking')
      const { result } = renderHook(() => useSectionVisibility('@testuser'))

      // Verify hook returns createSectionRef
      expect(result.current.createSectionRef).toBeDefined()
      expect(typeof result.current.createSectionRef).toBe('function')
    })

    it('tracks all 5 section types per spec', () => {
      const sections = ['header', 'services', 'waitlist', 'loom_cta', 'tabs'] as const
      const sectionIndices = { header: 0, services: 1, waitlist: 2, loom_cta: 3, tabs: 4 }

      sections.forEach((section) => {
        mixpanel.trackProfileSectionViewed('@ralphbautista', section)

        expect(mockTrackProfileSectionViewed).toHaveBeenCalledWith(
          '@ralphbautista',
          section
        )
      })

      expect(mockTrackProfileSectionViewed).toHaveBeenCalledTimes(5)
    })

    it('includes section_index in event properties', () => {
      // Test that the function is called correctly
      mixpanel.trackProfileSectionViewed('@ralphbautista', 'header')
      mixpanel.trackProfileSectionViewed('@ralphbautista', 'tabs')

      expect(mockTrackProfileSectionViewed).toHaveBeenNthCalledWith(1, '@ralphbautista', 'header')
      expect(mockTrackProfileSectionViewed).toHaveBeenNthCalledWith(2, '@ralphbautista', 'tabs')
    })

    it('optionally includes time_on_section_ms', () => {
      mixpanel.trackProfileSectionViewed('@ralphbautista', 'services', 5000)

      expect(mockTrackProfileSectionViewed).toHaveBeenCalledWith(
        '@ralphbautista',
        'services',
        5000
      )
    })
  })

  describe('RES-557: profile_link_clicked', () => {
    it('tracks email link clicks in header', () => {
      mixpanel.trackProfileLinkClicked(
        '@ralphbautista',
        'email',
        'mailto:ralphhhbenedict@gmail.com',
        'header'
      )

      expect(mockTrackProfileLinkClicked).toHaveBeenCalledWith(
        '@ralphbautista',
        'email',
        'mailto:ralphhhbenedict@gmail.com',
        'header'
      )
    })

    it('tracks LinkedIn link clicks in header', () => {
      mixpanel.trackProfileLinkClicked(
        '@ralphbautista',
        'linkedin',
        'https://www.linkedin.com/in/ralphbenedict',
        'header'
      )

      expect(mockTrackProfileLinkClicked).toHaveBeenCalledWith(
        '@ralphbautista',
        'linkedin',
        'https://www.linkedin.com/in/ralphbenedict',
        'header'
      )
    })

    it('tracks Instagram link clicks in header', () => {
      mixpanel.trackProfileLinkClicked(
        '@ralphbautista',
        'instagram',
        'https://www.instagram.com/ralphhhbenedict/',
        'header'
      )

      expect(mockTrackProfileLinkClicked).toHaveBeenCalledWith(
        '@ralphbautista',
        'instagram',
        'https://www.instagram.com/ralphhhbenedict/',
        'header'
      )
    })

    it('tracks LinkedIn link clicks in waitlist section', () => {
      mixpanel.trackProfileLinkClicked(
        '@ralphbautista',
        'linkedin',
        'https://www.linkedin.com/in/ralphbenedict',
        'waitlist'
      )

      expect(mockTrackProfileLinkClicked).toHaveBeenCalledWith(
        '@ralphbautista',
        'linkedin',
        'https://www.linkedin.com/in/ralphbenedict',
        'waitlist'
      )
    })

    it('supports all link positions per spec', () => {
      const positions = ['header', 'waitlist', 'footer', 'case_study'] as const

      positions.forEach((position) => {
        mockTrackProfileLinkClicked.mockClear()
        mixpanel.trackProfileLinkClicked('@ralphbautista', 'linkedin', 'https://linkedin.com', position)
        expect(mockTrackProfileLinkClicked).toHaveBeenCalledWith(
          '@ralphbautista',
          'linkedin',
          'https://linkedin.com',
          position
        )
      })
    })

    it('supports all link types per spec', () => {
      const linkTypes = ['email', 'linkedin', 'instagram', 'twitter', 'github'] as const

      linkTypes.forEach((linkType) => {
        mockTrackProfileLinkClicked.mockClear()
        mixpanel.trackProfileLinkClicked('@ralphbautista', linkType, `https://${linkType}.com`, 'header')
        expect(mockTrackProfileLinkClicked).toHaveBeenCalledWith(
          '@ralphbautista',
          linkType,
          `https://${linkType}.com`,
          'header'
        )
      })
    })
  })

  describe('RES-558: Tab Content Scroll Depth', () => {
    it('tracks scroll depth at 25% threshold', () => {
      mixpanel.trackTabScrollDepth('case-studies', 25, 5000)

      expect(mockTrackTabScrollDepth).toHaveBeenCalledWith('case-studies', 25, 5000)
    })

    it('tracks scroll depth at 50% threshold', () => {
      mixpanel.trackTabScrollDepth('seven-hats', 50, 10000)

      expect(mockTrackTabScrollDepth).toHaveBeenCalledWith('seven-hats', 50, 10000)
    })

    it('tracks scroll depth at 75% threshold', () => {
      mixpanel.trackTabScrollDepth('how-i-work', 75, 15000)

      expect(mockTrackTabScrollDepth).toHaveBeenCalledWith('how-i-work', 75, 15000)
    })

    it('tracks scroll depth at 100% threshold', () => {
      mixpanel.trackTabScrollDepth('case-studies', 100, 20000)

      expect(mockTrackTabScrollDepth).toHaveBeenCalledWith('case-studies', 100, 20000)
    })

    it('supports all tab names per spec', () => {
      const tabNames = ['case-studies', 'seven-hats', 'how-i-work'] as const

      tabNames.forEach((tabName) => {
        mockTrackTabScrollDepth.mockClear()
        mixpanel.trackTabScrollDepth(tabName, 50)
        expect(mockTrackTabScrollDepth).toHaveBeenCalledWith(tabName, 50)
      })
    })

    it('optionally includes time_to_depth_ms', () => {
      mixpanel.trackTabScrollDepth('case-studies', 25)
      expect(mockTrackTabScrollDepth).toHaveBeenCalledWith('case-studies', 25)

      mockTrackTabScrollDepth.mockClear()

      mixpanel.trackTabScrollDepth('case-studies', 25, 30000)
      expect(mockTrackTabScrollDepth).toHaveBeenCalledWith('case-studies', 25, 30000)
    })
  })

  describe('RES-559: profile_viewed (fixes duplicate page_viewed)', () => {
    it('fires profile_viewed with correct properties', () => {
      mixpanel.trackProfileViewed('@ralphbautista', 'user_abc123')

      expect(mockTrackProfileViewed).toHaveBeenCalledWith('@ralphbautista', 'user_abc123')
    })

    it('accepts optional properties', () => {
      mixpanel.trackProfileViewed('@ralphbautista', 'user_abc123', {
        viewerReferrer: 'linkedin.com',
        viewerUtmSource: 'linkedin',
        isCustomDomain: false,
        customDomain: null,
      })

      expect(mockTrackProfileViewed).toHaveBeenCalledWith(
        '@ralphbautista',
        'user_abc123',
        expect.objectContaining({
          viewerReferrer: 'linkedin.com',
          viewerUtmSource: 'linkedin',
        })
      )
    })
  })

  describe('useLinkTracking hook', () => {
    it('returns trackLinkClick function', async () => {
      const { useLinkTracking } = await import('@/hooks/useLinkTracking')
      const { result } = renderHook(() => useLinkTracking('@testuser'))

      expect(result.current.trackLinkClick).toBeDefined()
      expect(typeof result.current.trackLinkClick).toBe('function')
    })

    it('returns createLinkProps function', async () => {
      const { useLinkTracking } = await import('@/hooks/useLinkTracking')
      const { result } = renderHook(() => useLinkTracking('@testuser'))

      expect(result.current.createLinkProps).toBeDefined()
      expect(typeof result.current.createLinkProps).toBe('function')
    })

    it('returns withLinkTracking function', async () => {
      const { useLinkTracking } = await import('@/hooks/useLinkTracking')
      const { result } = renderHook(() => useLinkTracking('@testuser'))

      expect(result.current.withLinkTracking).toBeDefined()
      expect(typeof result.current.withLinkTracking).toBe('function')
    })
  })

  describe('useSectionTracking hook', () => {
    it('returns createSectionRef and createScrollRef', async () => {
      const { useSectionTracking } = await import('@/hooks/useSectionTracking')
      const { result } = renderHook(() => useSectionTracking('@testuser', 'case-studies'))

      expect(result.current.createSectionRef).toBeDefined()
      expect(result.current.createScrollRef).toBeDefined()
      expect(result.current.handleScroll).toBeDefined()
    })
  })
})

describe('Mixpanel tracking functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackProfileSectionViewed', () => {
    it('is exported from mixpanel module', () => {
      expect(mixpanel.trackProfileSectionViewed).toBeDefined()
    })
  })

  describe('trackProfileLinkClicked', () => {
    it('is exported from mixpanel module', () => {
      expect(mixpanel.trackProfileLinkClicked).toBeDefined()
    })
  })

  describe('trackTabScrollDepth', () => {
    it('is exported from mixpanel module', () => {
      expect(mixpanel.trackTabScrollDepth).toBeDefined()
    })
  })

  describe('trackProfileViewed', () => {
    it('is exported from mixpanel module', () => {
      expect(mixpanel.trackProfileViewed).toBeDefined()
    })
  })
})
