import mixpanel from 'mixpanel-browser'

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || 'e33a77b6ed1f2cb817270b89435ae93d'

let initialized = false

export const initMixpanel = () => {
  if (initialized || typeof window === 'undefined') return

  mixpanel.init(MIXPANEL_TOKEN, {
    track_pageview: true,
    persistence: 'localStorage',
    debug: import.meta.env.DEV,
  })

  initialized = true
  console.log('[Mixpanel] Initialized', import.meta.env.DEV ? '(debug mode)' : '')
}

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (!initialized) initMixpanel()
  mixpanel.track(event, properties)
  if (import.meta.env.DEV) console.log('[Mixpanel]', event, properties)
}

export const identify = (userId: string) => {
  if (!initialized) initMixpanel()
  mixpanel.identify(userId)
}

// Pre-defined events
export const trackPageView = (pageName: string) => {
  track('Page Viewed', { page_name: pageName })
}

export const trackCTAClick = (ctaType: string, ctaText: string, location?: string) => {
  track('CTA Clicked', { cta_type: ctaType, cta_text: ctaText, location })
}

export const trackFormStarted = (formType: string) => {
  track('Form Started', { form_type: formType })
}

export const trackFormSubmitted = (formType: string, properties?: Record<string, unknown>) => {
  track('Form Submitted', { form_type: formType, ...properties })
}

export const trackFormSuccess = (formType: string) => {
  track('Form Success', { form_type: formType })
}

export const trackFormError = (formType: string, error: string) => {
  track('Form Error', { form_type: formType, error })
}

export const trackModalOpened = (modalName: string, properties?: Record<string, unknown>) => {
  track('Modal Opened', { modal_name: modalName, ...properties })
}

export const trackCaseStudyRequested = (caseStudies: string[], serviceInterest?: string) => {
  track('Case Study Requested', {
    case_studies: caseStudies,
    case_study_count: caseStudies.length,
    service_interest: serviceInterest
  })
}

export const trackEmailCaptured = (source: 'waitlist' | 'case_study_request', emailDomain?: string) => {
  track('Email Captured', {
    source,
    email_domain: emailDomain,
  })
}
