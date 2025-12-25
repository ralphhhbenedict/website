# Profile Builder Pillar - Strategic Vision

**Status:** Marinating 🧠
**Last Updated:** December 25, 2024
**Author:** Ralph Bautista

---

## The Idea

ralphhhbenedict.com is not just a personal website - it's the R&D sandbox for the public-facing profile feature of Resume Studio.

Every component tested here becomes a template our users can generate from their own data.

---

## The One-Liner

> "My personal website is the R&D lab for our public profile product - every component I build and test there becomes a template our users can generate."

---

## Strategic Context

### What We're Building

A **free public-facing profile** for Resume Studio / Workspaces Studio users.

- Working professionals (consultants, freelancers, fractional execs, agency founders)
- Content populated from their Resume Studio data + uploads
- Custom design system (not generic like Bolt/Lovable)
- Guided customization (not open-ended prompts)

### Why This Approach

1. **Validate before building** - Test components with real traffic + analytics
2. **Narrow beats horizontal** - Purpose-built for professionals, not everyone
3. **Data-driven profiles** - Content from DB, not blank canvas
4. **Free tier acquisition** - Public profiles drive signups to paid tiers

---

## Current State → Future State

```
┌─────────────────────────────────────────────────────────────────┐
│  NOW: ralphhhbenedict.com (Sandbox)                             │
│  ─────────────────────────────────────────────────────────────  │
│  • Manually coded components                                    │
│  • Ralph's personal content (hardcoded)                         │
│  • Testing what works for consultants/freelancers              │
│  • Mixpanel tracking engagement                                 │
│  • shadcn/tailwind (temporary)                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  FUTURE: Profile Builder (User-Generated)                       │
│  ─────────────────────────────────────────────────────────────  │
│  • Guided customization (not open prompts)                      │
│  • Content from Resume Studio DB + uploaded files               │
│  • Proven components from sandbox                               │
│  • Custom design system (narrow use case)                       │
│  • Free tier of Resume Studio                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Catalog

See: `docs/COMPONENT_CATALOG.md`

**Current inventory (all 🧪 Testing):**

| Component | Purpose |
|-----------|---------|
| ProfileDashboard | Main layout with tabs |
| SevenHats | Portfolio grid by skill category |
| CaseStudies | Project showcase cards |
| HowIWork | Working style description |
| ExitIntentPopup | Exit intent email capture |
| StickyFooterCTA | Scroll-triggered CTA |
| Waitlist | Email signup |
| LeaveAMessage | Video/audio recorder |
| ShareButton | Native share + fallback |
| PortfolioPreview | Figma/Miro/PDF embeds |

---

## Data Model Connection

Components will pull from Resume Studio schema:

```
users
├── name, handle, location
├── role_family, job_title
└── preferences, aspirations

resumes
├── parsed content
├── skills[] (47+)
└── professional_summary

evidence_portfolio[]
├── title, format, category
└── verification_status

career_arc[]
├── company, title, duration
├── impact_badge
└── achievements[]
```

**Data binding approach:** Store in Storybook `parameters.dataBinding` meta field, extract programmatically for production.

---

## Framing for Cofounders

### Slack/Discord Version

**What I'm building with ralphhhbenedict.com:**

My personal site isn't just a portfolio - it's a sandbox for testing what works for the "public-facing profile" feature of Resume Studio.

**The insight:** Working professionals (consultants, freelancers, fractional execs) need a better way to showcase their work than LinkedIn. But instead of building a generic website builder like Bolt or Lovable, we're building something purpose-built for this specific use case.

**How it works:**
1. I build components on my site (portfolio grids, case study cards, conversion CTAs)
2. I test them with real traffic + Mixpanel analytics
3. Components that work become the template library
4. Users generate their profile from their Resume Studio data via guided prompts

**Why this matters:**
- We're not guessing what works - we're validating with real users
- The design system is narrow (for professionals) not generic (for everyone)
- Content comes from data users already have (resume, uploads, context answers)
- It's the FREE public-facing tier of Resume Studio - drives acquisition

### Pitch Deck Slide

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROFILE BUILDER PILLAR                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   SANDBOX                           PRODUCT                     │
│   (ralphhhbenedict.com)             (Resume Studio Profiles)    │
│                                                                 │
│   ┌─────────────┐                   ┌─────────────────────┐    │
│   │ Test with   │                   │ User generates      │    │
│   │ real traffic│  ───Proven───▶    │ from their data     │    │
│   │ + analytics │   Components      │ via guided prompts  │    │
│   └─────────────┘                   └─────────────────────┘    │
│                                                                 │
│   DIFFERENTIATION:                                              │
│   • Purpose-built for professionals (not generic builder)       │
│   • Content from Resume Studio data (not blank canvas)          │
│   • Guided customization (not open-ended prompts)               │
│   • Free tier drives acquisition → paid conversion              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The "Why Now" Answer

> "We're already building the components anyway for my site. By treating it as a sandbox with proper tracking, we get validated templates for free. When we're ready to ship the profile feature, we'll have proven components + real usage data instead of guessing."

---

## Open Questions

### Decided
- [x] Users: Working professionals (consultants, freelancers, fractional execs, agency founders)
- [x] Data sources: Resume Studio DB + uploads (see MVP_V1_*.md)
- [x] UX approach: Guided customization, not open-ended prompts
- [x] Relationship to product: Free public profile tier of Resume Studio

### TBD
- [ ] Design system tokens (need Kat)
- [ ] Exact data binding implementation (on the fly as we build)
- [ ] What makes narrow better than horizontal? (will discover through iteration)
- [ ] Pricing/gating for premium profile features?
- [ ] Custom domain support?
- [ ] SEO optimization for profiles?

---

## Key Documents

- `docs/COMPONENT_CATALOG.md` - Component tracking
- `docs/MIXPANEL_TRACKING_PLAN.md` - Analytics events
- `MVP_V1_SCOPE_DECISIONS.md` - Resume Studio data model
- `MVP_MASTER_SPEC_PART1_PRODUCT.md` - Full product vision

---

## Changelog

| Date | Note |
|------|------|
| 2024-12-25 | Initial strategy doc created, letting it marinate |

---

*This idea is marinating. Revisit when ready to refine.*
