/**
 * External Link Click Tracking Hook
 *
 * RES-557: profile_link_clicked - Track external link clicks with destination
 *
 * @see PROFILE_DOMAIN_FULL.json for event specifications
 */

import { useCallback } from 'react'
import { trackProfileLinkClicked } from '@/lib/mixpanel'

type LinkType = 'email' | 'linkedin' | 'instagram' | 'twitter' | 'github'
type LinkPosition = 'header' | 'waitlist' | 'footer' | 'case_study'

// Default profile username for the prototype site
const DEFAULT_PROFILE_USERNAME = '@ralphbautista'

/**
 * Detect link type from URL
 */
function detectLinkType(url: string): LinkType {
  const lowerUrl = url.toLowerCase()

  if (lowerUrl.startsWith('mailto:')) return 'email'
  if (lowerUrl.includes('linkedin.com')) return 'linkedin'
  if (lowerUrl.includes('instagram.com')) return 'instagram'
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter'
  if (lowerUrl.includes('github.com')) return 'github'

  // Default to email if can't detect (shouldn't happen with proper usage)
  return 'email'
}

/**
 * Hook for tracking external link clicks
 */
export function useLinkTracking(profileUsername: string = DEFAULT_PROFILE_USERNAME) {
  /**
   * Create a click handler for tracking link clicks
   * Can be used as onClick or to wrap existing handlers
   */
  const trackLinkClick = useCallback(
    (linkUrl: string, linkPosition: LinkPosition, linkType?: LinkType) => {
      const detectedType = linkType || detectLinkType(linkUrl)
      trackProfileLinkClicked(profileUsername, detectedType, linkUrl, linkPosition)
    },
    [profileUsername]
  )

  /**
   * Create props to spread onto anchor elements
   * Useful for declarative tracking setup
   */
  const createLinkProps = useCallback(
    (linkUrl: string, linkPosition: LinkPosition, linkType?: LinkType) => {
      return {
        onClick: () => trackLinkClick(linkUrl, linkPosition, linkType),
      }
    },
    [trackLinkClick]
  )

  /**
   * Higher-order function to wrap existing click handlers
   */
  const withLinkTracking = useCallback(
    <T extends (...args: unknown[]) => void>(
      handler: T,
      linkUrl: string,
      linkPosition: LinkPosition,
      linkType?: LinkType
    ) => {
      return (...args: Parameters<T>) => {
        trackLinkClick(linkUrl, linkPosition, linkType)
        return handler(...args)
      }
    },
    [trackLinkClick]
  )

  return {
    trackLinkClick,
    createLinkProps,
    withLinkTracking,
  }
}

/**
 * Tracked Link Component Props
 * Can be used for creating a TrackedLink component
 */
export interface TrackedLinkProps {
  href: string
  position: LinkPosition
  linkType?: LinkType
  profileUsername?: string
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
}
