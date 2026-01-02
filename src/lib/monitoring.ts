/**
 * Monitoring Utilities
 * ====================
 * Error tracking, custom metrics, and performance monitoring.
 *
 * Integrates with:
 * - Vercel Analytics (built-in)
 * - Mixpanel/PostHog (via existing analytics)
 * - Sentry (optional, see docs/MONITORING_SETUP.md)
 */

import { track } from './mixpanel';

// ============================================
// Types
// ============================================

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface MetricTags {
  component?: string;
  page?: string;
  variant?: string;
  [key: string]: string | undefined;
}

export interface PerformanceMetrics {
  pageLoad?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
  cumulativeLayoutShift?: number;
}

// ============================================
// Error Tracking
// ============================================

/**
 * Track an error with context.
 * Logs to console, sends to analytics, and optionally to Sentry.
 *
 * @param error - The error object or message
 * @param context - Additional context about where/how the error occurred
 *
 * @example
 * ```ts
 * try {
 *   await submitForm(data);
 * } catch (error) {
 *   trackError(error, {
 *     component: 'WaitlistForm',
 *     action: 'submit',
 *     metadata: { formData: data }
 *   });
 * }
 * ```
 */
export function trackError(
  error: Error | string | unknown,
  context: ErrorContext = {}
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorName = error instanceof Error ? error.name : 'UnknownError';

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('[Monitoring] Error tracked:', {
      error,
      context,
    });
  }

  // Send to analytics (Mixpanel + PostHog via existing track function)
  track('error_occurred', {
    error_name: errorName,
    error_message: errorMessage,
    error_stack: errorStack?.slice(0, 1000), // Truncate stack trace
    component: context.component,
    action: context.action,
    user_id: context.userId,
    ...context.metadata,
  });

  // Sentry integration (if configured)
  if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (e: unknown, c?: unknown) => void } }).Sentry) {
    const Sentry = (window as unknown as { Sentry: { captureException: (e: unknown, c?: unknown) => void } }).Sentry;
    Sentry.captureException(error instanceof Error ? error : new Error(errorMessage), {
      tags: {
        component: context.component,
        action: context.action,
      },
      extra: context.metadata,
    });
  }
}

// ============================================
// Custom Metrics
// ============================================

/**
 * Track a custom metric with optional tags.
 * Useful for business metrics, feature usage, and custom performance data.
 *
 * @param name - Metric name (use snake_case)
 * @param value - Numeric value
 * @param tags - Optional tags for segmentation
 *
 * @example
 * ```ts
 * // Track form completion time
 * trackMetric('form_completion_time_ms', 3500, {
 *   component: 'WaitlistForm',
 *   variant: 'long_form'
 * });
 *
 * // Track scroll depth
 * trackMetric('scroll_depth_percent', 75, { page: 'home' });
 * ```
 */
export function trackMetric(
  name: string,
  value: number,
  tags: MetricTags = {}
): void {
  // Log in development
  if (import.meta.env.DEV) {
    console.log('[Monitoring] Metric:', name, value, tags);
  }

  // Send to analytics
  track(`metric_${name}`, {
    metric_name: name,
    metric_value: value,
    ...tags,
  });
}

// ============================================
// Performance Monitoring
// ============================================

/**
 * Track page load performance.
 * Automatically captures Web Vitals if available.
 *
 * @param duration - Page load duration in milliseconds
 *
 * @example
 * ```ts
 * // Track on page load
 * window.addEventListener('load', () => {
 *   const loadTime = performance.now();
 *   trackPageLoad(loadTime);
 * });
 * ```
 */
export function trackPageLoad(duration: number): void {
  const metrics: PerformanceMetrics = {
    pageLoad: duration,
  };

  // Capture Web Vitals if Performance API is available
  if (typeof window !== 'undefined' && 'performance' in window) {
    try {
      const paintEntries = performance.getEntriesByType('paint');

      // First Contentful Paint
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.firstContentfulPaint = fcpEntry.startTime;
      }

      // Navigation timing
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const nav = navEntries[0];
        metrics.timeToInteractive = nav.domInteractive - nav.fetchStart;
      }
    } catch {
      // Performance API not fully supported
    }
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.log('[Monitoring] Page Load:', metrics);
  }

  // Send to analytics
  track('page_load_performance', {
    ...metrics,
    url: typeof window !== 'undefined' ? window.location.pathname : undefined,
  });
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Track component render performance.
 *
 * @param componentName - Name of the component
 * @param renderTime - Render time in milliseconds
 */
export function trackRenderTime(componentName: string, renderTime: number): void {
  trackMetric('component_render_time_ms', renderTime, {
    component: componentName,
  });
}

/**
 * Track API call performance.
 *
 * @param endpoint - API endpoint path
 * @param duration - Call duration in milliseconds
 * @param status - HTTP status code
 */
export function trackApiCall(
  endpoint: string,
  duration: number,
  status: number
): void {
  const isError = status >= 400;

  track('api_call', {
    endpoint,
    duration_ms: duration,
    status_code: status,
    is_error: isError,
  });

  // Also track as metric for aggregation
  trackMetric('api_response_time_ms', duration, {
    endpoint: endpoint.replace(/[^a-zA-Z0-9_]/g, '_'),
  });
}

/**
 * Create a timer for measuring durations.
 *
 * @returns Object with end() method that returns duration
 *
 * @example
 * ```ts
 * const timer = startTimer();
 * await doSomething();
 * const duration = timer.end();
 * trackMetric('operation_duration_ms', duration);
 * ```
 */
export function startTimer(): { end: () => number } {
  const start = performance.now();
  return {
    end: () => Math.round(performance.now() - start),
  };
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize monitoring and set up automatic performance tracking.
 * Call this once at app startup.
 */
export function initMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Track page load on window load
  window.addEventListener('load', () => {
    // Use requestIdleCallback for non-blocking measurement
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
        trackPageLoad(performance.now());
      });
    } else {
      setTimeout(() => {
        trackPageLoad(performance.now());
      }, 0);
    }
  });

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    trackError(event.error || event.message, {
      component: 'window',
      action: 'unhandled_error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError(event.reason, {
      component: 'window',
      action: 'unhandled_rejection',
    });
  });

  if (import.meta.env.DEV) {
    console.log('[Monitoring] Initialized');
  }
}
