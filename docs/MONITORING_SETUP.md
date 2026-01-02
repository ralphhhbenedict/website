# Monitoring Setup Guide

Complete guide for setting up monitoring and alerting for the ralphhhbenedict website.

## Overview

The monitoring infrastructure consists of:

1. **Vercel Analytics** - Built-in performance and usage metrics
2. **Mixpanel + PostHog** - Custom event tracking (already configured)
3. **Sentry** - Error tracking and alerting (optional)
4. **Health Check Endpoint** - `/api/health` for uptime monitoring

---

## 1. Vercel Analytics (Already Active)

Vercel provides built-in analytics that are automatically enabled for all deployments.

### What's Tracked

- **Web Vitals**: LCP, FID, CLS, FCP, TTFB
- **Page Views**: Unique visitors, page performance
- **Functions**: API route execution time, errors

### Accessing Analytics

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select the `ralphhhbenedict-website` project
3. Click "Analytics" tab

### Speed Insights

To enable detailed Speed Insights, add to your layout:

```tsx
// src/App.tsx
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      {/* Your app content */}
      <SpeedInsights />
    </>
  );
}
```

Install the package:

```bash
npm install @vercel/speed-insights
```

---

## 2. Custom Metrics (Mixpanel + PostHog)

Already configured in `src/lib/mixpanel.ts`. The monitoring utilities in `src/lib/monitoring.ts` build on top of this.

### Using the Monitoring Utilities

```typescript
import {
  trackError,
  trackMetric,
  trackPageLoad,
  trackApiCall,
  startTimer,
  initMonitoring,
} from '@/lib/monitoring';

// Initialize on app startup
initMonitoring();

// Track errors with context
try {
  await submitForm(data);
} catch (error) {
  trackError(error, {
    component: 'WaitlistForm',
    action: 'submit',
    metadata: { email: data.email },
  });
}

// Track custom metrics
trackMetric('scroll_depth_percent', 75, { page: 'home' });
trackMetric('form_completion_time_ms', 3500, { component: 'WaitlistForm' });

// Track API performance
const timer = startTimer();
const response = await fetch('/api/profile/ralphhhbenedict');
trackApiCall('/api/profile', timer.end(), response.status);
```

### Key Events to Track

| Event | Description | Tags |
|-------|-------------|------|
| `error_occurred` | Any error in the app | component, action, error_message |
| `metric_*` | Custom metrics | metric_name, metric_value |
| `page_load_performance` | Page load timing | pageLoad, FCP, LCP |
| `api_call` | API request performance | endpoint, duration_ms, status_code |

---

## 3. Sentry Integration (Optional)

For production-grade error tracking with alerting.

### Setup

1. **Create Sentry Account**: https://sentry.io

2. **Install SDK**:
   ```bash
   npm install @sentry/react
   ```

3. **Initialize in App**:
   ```typescript
   // src/main.tsx
   import * as Sentry from '@sentry/react';

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     integrations: [
       Sentry.browserTracingIntegration(),
       Sentry.replayIntegration(),
     ],
     tracesSampleRate: 0.1, // 10% of transactions
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0, // 100% of error sessions
   });
   ```

4. **Add Environment Variable**:
   ```bash
   # .env.local
   VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

5. **Configure Alerts** in Sentry Dashboard:
   - Error rate threshold alerts
   - New issue notifications
   - Slack/email integration

### Error Boundary

Wrap your app with Sentry's error boundary:

```tsx
import * as Sentry from '@sentry/react';

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => {
        trackError(error, { component: 'App', action: 'crash' });
      }}
    >
      {/* App content */}
    </Sentry.ErrorBoundary>
  );
}
```

---

## 4. Health Check Endpoint

Available at `/api/health` for uptime monitoring.

### Basic Response

```bash
curl https://ralphhhbenedict.com/api/health
```

```json
{
  "status": "ok",
  "timestamp": "2025-01-02T12:00:00.000Z",
  "version": "1.0.0",
  "uptime_seconds": 3600,
  "environment": "production",
  "region": "iad1"
}
```

### Detailed Response

```bash
curl https://ralphhhbenedict.com/api/health?detailed=true
```

```json
{
  "status": "ok",
  "timestamp": "2025-01-02T12:00:00.000Z",
  "version": "1.0.0",
  "uptime_seconds": 3600,
  "environment": "production",
  "region": "iad1",
  "checks": [
    {
      "name": "environment",
      "status": "pass",
      "message": "All required environment variables set"
    }
  ]
}
```

### Status Codes

| Status | HTTP Code | Meaning |
|--------|-----------|---------|
| `ok` | 200 | All systems operational |
| `degraded` | 200 | Some non-critical checks failing |
| `error` | 503 | Critical systems down |

### Uptime Monitoring Services

Configure these services to poll `/api/health`:

1. **Better Uptime** (recommended): https://betteruptime.com
2. **UptimeRobot** (free): https://uptimerobot.com
3. **Pingdom**: https://pingdom.com

Example Better Uptime setup:
- URL: `https://ralphhhbenedict.com/api/health`
- Method: GET
- Check interval: 1 minute
- Alert conditions: Status != 200 OR response.status != "ok"

---

## 5. Dashboard Setup (Mixpanel)

Create a monitoring dashboard in Mixpanel:

### Recommended Charts

1. **Error Rate Over Time**
   - Event: `error_occurred`
   - Breakdown by: `error_name`
   - Time: Last 7 days

2. **Page Load Performance**
   - Event: `page_load_performance`
   - Measure: Average of `pageLoad`
   - Breakdown by: `url`

3. **API Response Times**
   - Event: `api_call`
   - Measure: Average of `duration_ms`
   - Breakdown by: `endpoint`

4. **Error by Component**
   - Event: `error_occurred`
   - Breakdown by: `component`

### Alerts (Mixpanel)

Set up alerts for:
- Error rate > 1% of sessions
- API response time > 2000ms average
- Spike in specific error types

---

## 6. Local Development

### Viewing Logs

All monitoring events log to console in development:

```
[Monitoring] Metric: scroll_depth_percent 75 { page: 'home' }
[Monitoring] Error tracked: { error: Error, context: {...} }
[Analytics] page_viewed { page_name: 'home', timestamp: '...' }
```

### Testing Health Endpoint

```bash
# Start dev server
npm run dev

# In another terminal
curl http://localhost:5173/api/health
```

Note: Vercel API routes only work when deployed. For local testing of the health endpoint, you can use:

```bash
npx vercel dev
```

---

## 7. Best Practices

### Error Tracking

1. **Always include context**: component, action, relevant data
2. **Don't track sensitive data**: Redact emails, passwords, tokens
3. **Use consistent error names**: Makes grouping easier

### Performance Metrics

1. **Track user-centric metrics**: Time to interactive, not just load time
2. **Sample appropriately**: Don't track every metric at 100%
3. **Set baselines**: Know what "normal" looks like before alerting

### Alerting

1. **Start with high thresholds**: Avoid alert fatigue
2. **Route alerts appropriately**: Critical to PagerDuty, warnings to Slack
3. **Document runbooks**: What to do when each alert fires

---

## Quick Reference

| Tool | Purpose | Access |
|------|---------|--------|
| Vercel Analytics | Web Vitals, page views | vercel.com dashboard |
| Mixpanel | Custom events, user behavior | mixpanel.com |
| PostHog | Session replays, feature flags | posthog.com |
| Sentry | Error tracking, alerting | sentry.io |
| `/api/health` | Uptime monitoring | HTTP endpoint |

---

## Environment Variables

Required for full monitoring:

```bash
# Already configured
VITE_MIXPANEL_TOKEN=xxx
VITE_POSTHOG_KEY=xxx
VITE_POSTHOG_HOST=https://us.i.posthog.com

# Optional - add for Sentry
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

Last Updated: 2025-01-02
