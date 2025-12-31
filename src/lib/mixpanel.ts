/**
 * Dual-Fire Analytics (Mixpanel + PostHog)
 * Portfolio site: ralphhhbenedict
 *
 * Unified with Resu-ME analytics infrastructure
 */

import mixpanel from 'mixpanel-browser'
import posthog from 'posthog-js'

// Unified tokens (same as Resu-ME)
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || 'a400533785f80ae071a18393de060d52'
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_CqKZWjhSLToygqHWpRUk8AuAnRDsr49I3yg8AmGQvsk'
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

let initialized = false

export const initMixpanel = () => {
  if (initialized || typeof window === 'undefined') return

  // Domain-aware cookie configuration
  // - profile.resu-me.ai → shares identity with *.resu-me.ai ecosystem
  // - ralphhhbenedict.com → isolated identity (personal site / prototype)
  const hostname = window.location.hostname
  const isResuMeDomain = hostname.endsWith('.resu-me.ai') || hostname.endsWith('.local.resu-me.ai')

  const cookieDomain = isResuMeDomain
    ? (import.meta.env.DEV ? '.local.resu-me.ai' : '.resu-me.ai')
    : undefined  // Let browser set cookie on current domain only

  const domainLabel = isResuMeDomain ? 'profile.resu-me.ai' : 'ralphhhbenedict.com'

  // Initialize Mixpanel
  mixpanel.init(MIXPANEL_TOKEN, {
    track_pageview: false, // Disabled - we track manually via usePortfolioAnalytics
    persistence: 'localStorage',
    debug: import.meta.env.DEV,
    ...(cookieDomain && { cookie_domain: cookieDomain }),
    cross_subdomain_cookie: isResuMeDomain, // Only cross-subdomain for resu-me.ai
  })

  // Register super properties (domain-aware)
  mixpanel.register({
    domain: domainLabel,
    is_prototype: !isResuMeDomain,  // ralphhhbenedict.com = prototype
    is_production_profile: isResuMeDomain,  // profile.resu-me.ai = production
    app_version: '1.0.0',
    platform: 'web',
  })

  // Initialize PostHog (domain-aware)
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    cross_subdomain_cookie: isResuMeDomain, // Only cross-subdomain for resu-me.ai
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
    },
  })

  initialized = true
  console.log(`[Analytics] Initialized on ${domainLabel}`, isResuMeDomain ? '(ecosystem mode)' : '(prototype mode)', import.meta.env.DEV ? '(debug)' : '')
}

// Dual-fire track function
export const track = (event: string, properties?: Record<string, unknown>) => {
  if (!initialized) initMixpanel()

  const enriched = {
    ...properties,
    timestamp: new Date().toISOString(),
  }

  // Fire to both
  mixpanel.track(event, enriched)
  posthog.capture(event, enriched)

  if (import.meta.env.DEV) console.log('[Analytics]', event, enriched)
}

export const identify = (userId: string, traits?: Record<string, unknown>) => {
  if (!initialized) initMixpanel()
  mixpanel.identify(userId)
  if (traits) mixpanel.people.set(traits)
  posthog.identify(userId, traits)
}

export const reset = () => {
  mixpanel.reset()
  posthog.reset()
}

// ============================================
// Pre-defined events (unchanged API)
// ============================================

export const trackPageView = (pageName: string) => {
  track('page_viewed', { page_name: pageName })
}

export const trackCTAClick = (ctaType: string, ctaText: string, location?: string) => {
  track('cta_clicked', { cta_type: ctaType, cta_text: ctaText, location })
}

export const trackFormStarted = (formType: string) => {
  track('form_started', { form_type: formType })
}

export const trackFormSubmitted = (formType: string, properties?: Record<string, unknown>) => {
  track('form_submitted', { form_type: formType, ...properties })
}

export const trackFormSuccess = (formType: string) => {
  track('form_success', { form_type: formType })
}

export const trackFormError = (formType: string, error: string) => {
  track('form_error', { form_type: formType, error })
}

export const trackModalOpened = (modalName: string, properties?: Record<string, unknown>) => {
  track('modal_opened', { modal_name: modalName, ...properties })
}

export const trackCaseStudyRequested = (caseStudies: string[], serviceInterest?: string, initialCaseStudy?: string) => {
  const expandedSelection = initialCaseStudy && caseStudies.length > 1
  track('case_study_requested', {
    case_studies: caseStudies,
    case_study_count: caseStudies.length,
    service_interest: serviceInterest,
    initial_case_study: initialCaseStudy,
    expanded_selection: expandedSelection,
    added_studies: expandedSelection ? caseStudies.filter(s => s !== initialCaseStudy) : [],
  })
}

export const trackEmailCaptured = (source: 'waitlist' | 'case_study_request' | 'portfolio_request', emailDomain?: string) => {
  track('email_captured', {
    source,
    email_domain: emailDomain,
  })
}

// Portfolio tracking for SevenHats
export const trackPortfolioItemSelected = (hat: string, portfolioItem: string) => {
  track('portfolio_item_selected', {
    hat,
    portfolio_item: portfolioItem,
  })
}

export const trackPortfolioPreviewOpened = (hat: string, portfolioItem: string, portfolioType: string) => {
  track('portfolio_preview_opened', {
    hat,
    portfolio_item: portfolioItem,
    portfolio_type: portfolioType,
  })
}

export const trackPortfolioZoomAttempted = (hat: string, portfolioItem: string, zoomType: 'pinch' | 'keyboard') => {
  track('portfolio_zoom_attempted', {
    hat,
    portfolio_item: portfolioItem,
    zoom_type: zoomType,
  })
}

export const trackPortfolioPDFRequested = (hat: string, portfolioItem: string, serviceInterest?: string) => {
  track('portfolio_pdf_requested', {
    hat,
    portfolio_item: portfolioItem,
    service_interest: serviceInterest,
  })
}

// Tab navigation tracking
export const trackTabChanged = (fromTab: string | null, toTab: string) => {
  track('tab_changed', {
    from_tab: fromTab,
    to_tab: toTab,
  })
}

// Share tracking
export const trackShareClicked = (method?: string) => {
  track('share_clicked', {
    method,
  })
}

// Leave Me a Loom tracking
export const trackLoomStarted = (mode: 'audio' | 'video') => {
  track('loom_recording_started', { mode })
}

export const trackLoomPaused = (durationSeconds: number) => {
  track('loom_recording_paused', { duration_seconds: durationSeconds })
}

export const trackLoomResumed = (pauseCount: number) => {
  track('loom_recording_resumed', { pause_count: pauseCount })
}

export const trackLoomCompleted = (mode: 'audio' | 'video', durationSeconds: number) => {
  track('loom_recording_completed', { mode, duration_seconds: durationSeconds })
}

export const trackLoomSubmitted = (mode: 'audio' | 'video', durationSeconds: number, fileSizeBytes: number) => {
  track('loom_submitted', {
    mode,
    duration_seconds: durationSeconds,
    file_size_bytes: fileSizeBytes,
  })
}

export const trackLoomError = (errorType: string, errorMessage: string) => {
  track('loom_error', { error_type: errorType, error_message: errorMessage })
}

export const trackTosAccepted = (source: string) => {
  track('tos_accepted', { source })
}
