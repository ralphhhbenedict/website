# Portfolio Site Event Schema

> **Domain:** ralphhhbenedict.com | profile.resu-me.ai
> **Last Updated:** December 31, 2025
> **Analytics:** Dual-fire to Mixpanel + PostHog

---

## Event Hierarchy

```
Tier 1 (Atoms)     - Single action events (page_viewed, cta_clicked)
Tier 2 (Molecules) - Multi-step events (form_started → form_submitted)
Tier 3 (Organisms) - Session-level events (deck_view_completed, email_captured)
```

---

## Core Events

### Page & Navigation

| Event | Type | Description | Properties |
|-------|------|-------------|------------|
| `page_viewed` | Atom | Page load | `page_name`, `referrer`, `utm_*` |
| `portfolio_page_viewed` | Atom | Profile page load | `page_name`, `referrer`, `utm_*` |
| `portfolio_section_viewed` | Molecule | Section enters viewport | `section_name`, `time_on_page_ms` |
| `tab_changed` | Atom | Tab switch | `from_tab`, `to_tab` |

### CTA & Clicks

| Event | Type | Description | Properties |
|-------|------|-------------|------------|
| `cta_clicked` | Atom | Generic CTA click | `cta_type`, `cta_text`, `location` |
| `portfolio_cta_clicked` | Atom | Portfolio-specific CTA | `cta_type`, `cta_text`, `location` |
| `portfolio_project_clicked` | Molecule | Project card click | `project_name`, `section`, `hat` |
| `share_clicked` | Atom | Share button click | `method` |

---

## Form Events

### Waitlist Form

| Event | Type | Description | Properties |
|-------|------|-------------|------------|
| `form_started` | Atom | Form field focused | `form_type: "waitlist"` |
| `form_submitted` | Molecule | Form submitted | `form_type`, `email_domain` |
| `form_success` | Molecule | Form accepted | `form_type` |
| `form_error` | Molecule | Form failed | `form_type`, `error` |

### Case Study Request

| Event | Type | Description | Properties |
|-------|------|-------------|------------|
| `modal_opened` | Atom | Request modal opened | `modal_name`, `initial_case_study` |
| `case_study_requested` | Organism | Studies selected | `case_studies[]`, `case_study_count`, `service_interest`, `expanded_selection` |
| `email_captured` | Organism | Email collected | `source`, `email_domain` |

### Exit Intent

| Event | Type | Description | Properties |
|-------|------|-------------|------------|
| `Exit Intent Triggered` | Atom | Mouse left viewport | `delay_ms` |
| `Exit Intent Dismissed` | Atom | Popup closed | `had_email` |

---

## SevenHats Portfolio Events

| Event | Type | Description | Properties |
|-------|------|-------------|------------|
| `portfolio_item_selected` | Atom | Dropdown selection | `hat`, `portfolio_item` |
| `portfolio_preview_opened` | Molecule | Modal opened | `hat`, `portfolio_item`, `portfolio_type` |
| `portfolio_zoom_attempted` | Molecule | Zoom blocked | `hat`, `portfolio_item`, `zoom_type` |
| `portfolio_pdf_requested` | Organism | PDF request submitted | `hat`, `portfolio_item`, `service_interest` |

---

## HowIWork Events

| Event | Type | Description | Properties |
|-------|------|-------------|------------|
| `how_i_work_viewed` | Atom | Section viewed | `timestamp` |
| `how_i_work_stat_engaged` | Molecule | Stat card hovered | `stat_label`, `timestamp` |
| `how_i_work_service_viewed` | Molecule | Service card hovered | `service_title`, `timestamp` |

---

## LeaveALoom Events

| Event | Type | Description | Properties |
|-------|------|-------------|------------|
| `loom_recording_started` | Atom | Recording began | `mode` |
| `loom_recording_paused` | Atom | Recording paused | `duration_seconds` |
| `loom_recording_resumed` | Atom | Recording resumed | `pause_count` |
| `loom_recording_completed` | Molecule | Recording stopped | `mode`, `duration_seconds` |
| `loom_submitted` | Organism | Upload complete | `mode`, `duration_seconds`, `file_size_bytes` |
| `loom_error` | Atom | Error occurred | `error_type`, `error_message` |
| `tos_accepted` | Atom | ToS checkbox | `source` |

---

## Sticky CTA Events

| Event | Type | Description | Properties |
|-------|------|-------------|------------|
| `Sticky CTA Shown` | Atom | CTA appeared | `scroll_percent` |
| `Sticky CTA Clicked` | Atom | CTA clicked | - |
| `Sticky CTA Dismissed` | Atom | CTA closed | - |

---

## Super Properties (Auto-Attached)

These properties are automatically added to ALL events:

```json
{
  "domain": "ralphhhbenedict.com | profile.resu-me.ai",
  "is_prototype": true | false,
  "is_production_profile": false | true,
  "app_version": "1.0.0",
  "platform": "web",
  "timestamp": "ISO 8601"
}
```

---

## Identity Management

### Cross-Domain Behavior

| Domain | Cookie Scope | Identity Sharing |
|--------|--------------|------------------|
| `*.resu-me.ai` | `.resu-me.ai` | Shared with ecosystem |
| `ralphhhbenedict.com` | Current domain only | Isolated |

### User Identification

```typescript
// Called when email is captured
identify(email, {
  $email: email,
  source: "waitlist" | "case_study_request" | "portfolio_request",
  first_seen: timestamp,
});
```

---

## Component → Event Mapping

| Component | Events Tracked |
|-----------|----------------|
| `ProfileDashboard` | page_viewed, tab_changed, share_clicked, cta_clicked, section_viewed |
| `CaseStudies` | modal_opened, form_*, case_study_requested, email_captured |
| `SevenHats` | portfolio_*, form_*, email_captured |
| `HowIWork` | how_i_work_viewed, how_i_work_stat_engaged, how_i_work_service_viewed |
| `Waitlist` | form_*, email_captured, cta_clicked |
| `ExitIntentPopup` | Exit Intent *, form_*, email_captured |
| `StickyFooterCTA` | Sticky CTA * |
| `LeaveALoom` | loom_*, modal_opened, form_started, tos_accepted |

---

## Funnel Definitions

### Waitlist Funnel
```
page_viewed → form_started → form_submitted → form_success
```

### Case Study Request Funnel
```
cta_clicked → modal_opened → form_started → case_study_requested → email_captured
```

### Portfolio Preview Funnel
```
portfolio_item_selected → portfolio_preview_opened → portfolio_zoom_attempted → portfolio_pdf_requested
```

### Loom Recording Funnel
```
modal_opened → loom_recording_started → loom_recording_completed → loom_submitted
```

---

## Implementation Files

```
src/
├── lib/
│   └── mixpanel.ts          # Event functions + initialization
├── hooks/
│   └── usePortfolioAnalytics.ts  # Section tracking hook
└── components/
    ├── ProfileDashboard.tsx      # Main page tracking
    ├── CaseStudies.tsx           # Case study events
    ├── SevenHats.tsx             # Portfolio events
    ├── HowIWork.tsx              # Service engagement
    ├── Waitlist.tsx              # Form tracking
    ├── ExitIntentPopup.tsx       # Exit intent
    ├── StickyFooterCTA.tsx       # Sticky CTA
    └── LeaveALoom.tsx            # Loom recording
```

---

## Verification Checklist

- [x] All components import from `@/lib/mixpanel`
- [x] Dual-fire enabled (Mixpanel + PostHog)
- [x] Super properties registered
- [x] Identity management implemented
- [x] Form tracking complete (started → submitted → success/error)
- [x] Section viewport tracking
- [x] CTA click tracking
- [x] HowIWork tracking added (Dec 31, 2025)

---

*Generated: 2025-12-31 | Source: Component audit*
