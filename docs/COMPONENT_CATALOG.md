# Component Catalog - Profile Builder Pillar

**Purpose:** Track which components are proven in the sandbox (ralphhhbenedict.com) and ready for the user-generated profile template library.

**Last Updated:** December 25, 2024

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Proven | Tested in production, analytics validated, ready for template library |
| 🧪 Testing | In sandbox, collecting data, not yet validated |
| 📐 Designed | Designed but not implemented |
| ❌ Failed | Tested and rejected (document why) |

---

## Core Layout Components

| Component | Status | Storybook | Data Binding | Notes |
|-----------|--------|-----------|--------------|-------|
| `ProfileDashboard` | 🧪 Testing | - | `user.name`, `user.avatar`, tabs config | Main layout wrapper with header/tabs |
| `TabNavigation` | 🧪 Testing | - | `tabs[]` array | Reusable tab system |

---

## Content Display Components

| Component | Status | Storybook | Data Binding | Notes |
|-----------|--------|-----------|--------------|-------|
| `SevenHats` | 🧪 Testing | - | `skills[]`, `evidence_portfolio[]` | Portfolio grid by category |
| `CaseStudies` | 🧪 Testing | - | `case_studies[]`, `career_arc[]` | Project showcase cards |
| `HowIWork` | 🧪 Testing | - | `work_style`, `values[]` | Working style description |

---

## Conversion Components

| Component | Status | Storybook | Data Binding | Notes |
|-----------|--------|-----------|--------------|-------|
| `ExitIntentPopup` | 🧪 Testing | [Stories](../src/components/ExitIntentPopup.stories.tsx) | `cta_config` | Exit intent email capture |
| `StickyFooterCTA` | 🧪 Testing | [Stories](../src/components/StickyFooterCTA.stories.tsx) | `cta_config` | Scroll-triggered CTA bar |
| `Waitlist` | 🧪 Testing | - | `form_config` | Email signup form |
| `LeaveAMessage` | 🧪 Testing | - | `contact_config` | Video/audio message recorder |

---

## Utility Components

| Component | Status | Storybook | Data Binding | Notes |
|-----------|--------|-----------|--------------|-------|
| `ShareButton` | 🧪 Testing | - | `share_config` | Native share + fallback modal |
| `PortfolioPreview` | 🧪 Testing | - | `portfolio_item` | Figma/Miro/PDF embed viewer |

---

## Data Binding Strategy

**Goal:** Streamlined on-the-fly data binding documentation.

**Approach:** Each component's Storybook story includes a `dataBinding` meta field:

```tsx
// In ComponentName.stories.tsx
const meta: Meta<typeof ComponentName> = {
  title: "Category/ComponentName",
  component: ComponentName,
  parameters: {
    dataBinding: {
      sources: ["users", "evidence_portfolio"],
      fields: {
        name: "users.display_name",
        avatar: "users.avatar_url",
        items: "evidence_portfolio[].title"
      },
      notes: "Requires at least 3 portfolio items to render grid"
    }
  }
};
```

**Benefits:**
- Lives next to the component code
- Visible in Storybook docs
- Easy to update as we iterate
- Can be extracted programmatically for production

---

## Validation Criteria

A component is marked ✅ **Proven** when:

1. **Analytics validated** - Mixpanel shows positive engagement (define per component)
2. **No critical bugs** - Works across browsers/devices
3. **Storybook complete** - All states documented
4. **Data binding defined** - Clear mapping to Resume Studio schema
5. **Design approved** - Kat has reviewed for design system fit

---

## Resume Studio Data Model Reference

From `MVP_V1_SCOPE_DECISIONS.md`, the data sources available:

```
users
├── name, handle, birthday, location
├── years_of_experience, role_family, job_title
├── career_aspirations (salary, dream_company, work_location, team_size)
└── preferences (equity_vs_salary, company_stage, industry_focus, culture_values)

resumes
├── parsed_content (contact_info, education, work_experience)
├── skills[] (47+ extracted)
├── professional_summary (3-bullet framework)
└── career_metrics (years, team_led, promotions, companies)

evidence_portfolio[]
├── title, description, date, category
├── format (PDF, HTML, GitHub, Link)
├── verification_status
└── impact_highlight

career_arc[]
├── company, title, duration, location
├── impact_badge (High/Medium/Low)
├── achievements[]
└── skills_tags[]

context_additions[]
├── question_category
├── response_text (or transcription)
└── extracted_claims
```

---

## Design System (TBD - Needs Kat)

**Placeholder for design tokens:**

- Color palette: TBD
- Typography scale: TBD
- Spacing system: TBD
- Component variants: TBD
- Animation patterns: TBD

**Constraint:** Narrow use case for working professionals (consultants, freelancers, fractional execs, agency founders) - NOT generic like Bolt/Lovable.

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-25 | Initial catalog created with 10 components |
| 2024-12-25 | Added data binding strategy (Storybook meta approach) |
| 2024-12-25 | Added Resume Studio data model reference |
