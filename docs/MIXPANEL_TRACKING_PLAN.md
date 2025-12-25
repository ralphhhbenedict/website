# Mixpanel Tracking Plan - ralphhhbenedict.com

**Project:** ralphhhbenedict
**Project ID:** 3973375
**Token:** `e33a77b6ed1f2cb817270b89435ae93d`
**Last Updated:** December 24, 2024

---

## Event Taxonomy

### Page & Session Events

| Event | Description | Properties | Trigger |
|-------|-------------|------------|---------|
| `[Auto] Page View` | Automatic page view | `current_url`, `referrer` | Mixpanel auto-track |
| `Session Start` | User session begins | `$device`, `$browser`, `$city` | Mixpanel auto-track |
| `Session End` | User session ends | `session_duration` | Mixpanel auto-track |
| `Page Viewed` | Manual page view | `page_name` | `trackPageView()` |

---

### Navigation Events

| Event | Description | Properties | Trigger |
|-------|-------------|------------|---------|
| `Tab Changed` | User switches tabs | `from_tab`, `to_tab` | Tab click in ProfileDashboard |

**Property Values:**
- `from_tab`: `"case-studies"` | `"seven-hats"` | `"how-i-work"` | `null` (initial)
- `to_tab`: `"case-studies"` | `"seven-hats"` | `"how-i-work"`

---

### Portfolio Events (7 Hats Section)

| Event | Description | Properties | Trigger |
|-------|-------------|------------|---------|
| `Portfolio Item Selected` | Dropdown selection | `hat`, `portfolio_item` | Select dropdown change |
| `Portfolio Preview Opened` | View button clicked | `hat`, `portfolio_item`, `portfolio_type` | View button click |
| `Portfolio Zoom Attempted` | User tried to zoom | `hat`, `portfolio_item`, `zoom_type` | Pinch/keyboard zoom blocked |
| `Portfolio PDF Requested` | PDF request submitted | `hat`, `portfolio_item`, `service_interest` | Form submission |

**Property Values:**
- `hat`: `"Product Manager"` | `"Data Analyst"` | `"Technical PM"` | etc.
- `portfolio_item`: `"E2E Product Artifact"` | `"18-Month Platform Overhaul"` | `"Discovery & Alignment"` | `"19-Page Technical PRD"`
- `portfolio_type`: `"figma"` | `"figjam"` | `"miro"` | `"pdf"`
- `zoom_type`: `"pinch"` | `"keyboard"`
- `service_interest`: `"ai-ops"` | `"fractional-cpo"` | `"series-a-prep"` | `"technical-pm"` | `"product-strategy"` | `"data-analytics"` | `"just-browsing"`

---

### Form Events

| Event | Description | Properties | Trigger |
|-------|-------------|------------|---------|
| `Form Started` | User begins form | `form_type` | Form input focus or modal open |
| `Form Submitted` | Form submitted | `form_type`, `...custom` | Form submit |
| `Form Success` | Submission succeeded | `form_type` | After successful insert |
| `Form Error` | Submission failed | `form_type`, `error` | Catch block |

**Property Values:**
- `form_type`: `"waitlist"` | `"case_study_request"` | `"portfolio_request"` | `"exit_intent"` | `"portfolio_request_auto_zoom"`

---

### CTA & Modal Events

| Event | Description | Properties | Trigger |
|-------|-------------|------------|---------|
| `CTA Clicked` | Button/link clicked | `cta_type`, `cta_text`, `location` | CTA button click |
| `Modal Opened` | Modal/dialog opened | `modal_name`, `...custom` | Dialog open |
| `Share Clicked` | Share button clicked | `method` | Share button click |

**Property Values:**
- `cta_type`: `"see_my_work"` | `"get_in_touch"` | `"leave_a_message"` | etc.
- `location`: `"header"` | `"waitlist"` | `"sticky_footer"` | etc.
- `method`: `"native_or_modal"` | `"native_share"` | `"linkedin"` | `"twitter"` | `"copy_link"` | `"email"`

---

### Exit Intent Events

| Event | Description | Properties | Trigger |
|-------|-------------|------------|---------|
| `Exit Intent Triggered` | Popup shown on exit | `delay_ms` | Mouse leaves viewport top |
| `Exit Intent Dismissed` | Popup closed without submit | `had_email` | User closes popup |

**Behavior:**
- Triggers when cursor moves above y=50px (toward browser close/tabs)
- Only fires once per session (stored in sessionStorage)
- Skipped if user already has email in localStorage
- Configurable delay before detection starts (default 5000ms)

---

### Sticky CTA Events

| Event | Description | Properties | Trigger |
|-------|-------------|------------|---------|
| `Sticky CTA Shown` | Sticky bar appeared | `scroll_percent` | User scrolls past threshold |
| `Sticky CTA Clicked` | User clicked CTA | - | Button click |
| `Sticky CTA Dismissed` | User closed bar | - | X button click |

**Behavior:**
- Appears after scrolling past configurable percentage (default 30%)
- Dismissed state persists in sessionStorage
- Slides in from bottom with animation

---

### Leave Me a Message Events (Video/Audio Recording)

| Event | Description | Properties | Trigger |
|-------|-------------|------------|---------|
| `Message Recording Started` | User starts recording | `mode` | Start button click |
| `Message Recording Paused` | User pauses recording | `duration` | Pause button click |
| `Message Recording Resumed` | User resumes recording | `pause_count` | Resume button click |
| `Message Recording Completed` | Recording finished | `mode`, `duration` | Done/auto-stop at 5:00 |
| `Message Submitted` | Recording uploaded | `mode`, `duration`, `file_size` | Send button click |
| `ToS Accepted` | User accepted terms | `source` | Checkbox checked |

**Property Values:**
- `mode`: `"video"` | `"audio"`
- `duration`: Recording duration in seconds
- `file_size`: File size in bytes
- `source`: `"leave_a_message"`

**State Machine:**
```
ENTRY → RECORDING → PAUSED → REVIEW → UPLOADING → SUBMITTED
                 ↑         ↓
                 └─────────┘ (Resume)
```

**Data Storage:**
- Supabase Storage bucket: `intakes`
- Supabase table: `intakes` (email, mode, storage_path, duration_seconds, file_size_bytes, tos_consent, tos_consent_at)

---

### Lead Capture Events

| Event | Description | Properties | Trigger |
|-------|-------------|------------|---------|
| `Email Captured` | Email collected | `source`, `email_domain` | Form success |
| `Case Study Requested` | Case study request | `case_studies[]`, `case_study_count`, `service_interest`, `initial_case_study`, `expanded_selection`, `added_studies[]` | CaseStudies form |

**Property Values:**
- `source`: `"waitlist"` | `"case_study_request"` | `"portfolio_request"` | `"exit_intent"`
- `email_domain`: Extracted from email (e.g., `"gmail.com"`, `"company.com"`)

---

## User Journey Mapping

### Primary Conversion Funnel
```
Session Start
    ↓
Page Viewed
    ↓
Tab Changed (to: seven-hats)
    ↓
Portfolio Item Selected
    ↓
Portfolio Preview Opened
    ↓
Form Started (portfolio_request)
    ↓
Form Success
    ↓
Email Captured (source: portfolio_request)
```

### Alternative Funnel: Waitlist
```
Session Start
    ↓
Page Viewed
    ↓
Form Started (waitlist)
    ↓
Form Success
    ↓
Email Captured (source: waitlist)
```

### Alternative Funnel: Case Study Request
```
Session Start
    ↓
Tab Changed (to: case-studies)
    ↓
CTA Clicked (Request Case Study)
    ↓
Modal Opened (case_study_request)
    ↓
Case Study Requested
    ↓
Email Captured (source: case_study_request)
```

---

## Key Metrics & KPIs

### Engagement
| Metric | Calculation | Target |
|--------|-------------|--------|
| Tab Engagement Rate | Users who change tabs / Total users | >50% |
| Portfolio View Rate | Portfolio Preview Opened / Tab Changed (seven-hats) | >30% |
| Zoom Attempt Rate | Portfolio Zoom Attempted / Portfolio Preview Opened | <10% |

### Conversion
| Metric | Calculation | Target |
|--------|-------------|--------|
| Lead Conversion Rate | Email Captured / Session Start | >5% |
| Portfolio → Lead | Form Success (portfolio) / Portfolio Preview Opened | >10% |
| Waitlist Conversion | Form Success (waitlist) / Session Start | >3% |

### Share
| Metric | Calculation | Target |
|--------|-------------|--------|
| Share Rate | Share Clicked / Session Start | >2% |
| Share Method Distribution | By method property | Track |

### Optimization Features
| Metric | Calculation | Target |
|--------|-------------|--------|
| Exit Intent Trigger Rate | Exit Intent Triggered / Session Start | 5-15% |
| Exit Intent Conversion | Email Captured (exit_intent) / Exit Intent Triggered | >10% |
| Sticky CTA View Rate | Sticky CTA Shown / Session Start | >40% |
| Sticky CTA Click Rate | Sticky CTA Clicked / Sticky CTA Shown | >5% |
| Header CTA Click Rate | CTA Clicked (header) / Session Start | >10% |

---

## Recommended Mixpanel Reports

### Funnels
1. **Portfolio Lead Funnel**: `Tab Changed` → `Portfolio Preview Opened` → `Form Started` → `Email Captured`
2. **Waitlist Funnel**: `Session Start` → `Form Started (waitlist)` → `Email Captured`
3. **Case Study Funnel**: `CTA Clicked` → `Modal Opened` → `Case Study Requested`
4. **Exit Intent Recovery**: `Exit Intent Triggered` → `Form Started (exit_intent)` → `Email Captured`
5. **Sticky CTA Funnel**: `Sticky CTA Shown` → `Sticky CTA Clicked` → `Form Started` → `Email Captured`
6. **Header CTA Funnel**: `CTA Clicked (see_my_work)` → `Tab Changed` → `Portfolio Preview Opened`

### Flows
1. **Entry Flow**: Start with `Session Start` → see first actions
2. **Pre-Conversion Flow**: End with `Form Success` → see what leads to conversion
3. **Portfolio Flow**: Start with `Portfolio Preview Opened` → see next actions

### Insights
1. **Top Portfolio Items**: Breakdown `Portfolio Item Selected` by `portfolio_item`
2. **Service Interest**: Breakdown `Form Success` by `service_interest`
3. **Tab Distribution**: Breakdown `Tab Changed` by `to_tab`

---

## Implementation Files

| File | Events Implemented |
|------|-------------------|
| `src/lib/mixpanel.ts` | All tracking functions |
| `src/components/ProfileDashboard.tsx` | Tab Changed, Share Clicked, CTA Clicked (header) |
| `src/components/SevenHats.tsx` | Portfolio events, Form events |
| `src/components/Waitlist.tsx` | Form events, Email Captured |
| `src/components/CaseStudies.tsx` | CTA Clicked, Case Study Requested |
| `src/components/ExitIntentPopup.tsx` | Exit Intent events, Form events |
| `src/components/StickyFooterCTA.tsx` | Sticky CTA events |
| `src/components/LeaveAMessage.tsx` | Message Recording events, ToS Accepted |

---

## Data Destinations

| Destination | Data |
|-------------|------|
| **Mixpanel** | All events above |
| **Supabase** | `waitlist` table, `pdf_requests` table, `intakes` table |
| **Supabase Storage** | `intakes` bucket (video/audio recordings) |
| **localStorage** | `ralphhhbenedict_email` (for form prefill) |
| **sessionStorage** | `exit_intent_shown`, `sticky_cta_dismissed` |

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-24 | Initial tracking plan created |
| 2024-12-24 | Added Tab Changed, Share Clicked events |
| 2024-12-24 | Added Portfolio events (Selected, Opened, Zoom, PDF) |
| 2024-12-24 | Added Exit Intent events (Triggered, Dismissed) |
| 2024-12-24 | Added Sticky CTA events (Shown, Clicked, Dismissed) |
| 2024-12-24 | Added above-fold CTA tracking (see_my_work, get_in_touch) |
| 2024-12-24 | Added auto-zoom form trigger (portfolio_request_auto_zoom) |
| 2024-12-25 | Added Leave Me a Message events (video/audio recording) |
| 2024-12-25 | Renamed "Leave a Loom" to "Leave Me a Message" |
