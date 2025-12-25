# ralphhhbenedict.com

Personal website and R&D sandbox for Resume Studio public profiles.

## Purpose

This site serves dual purposes:
1. **Personal Portfolio** - Showcasing work as a product leader and consultant
2. **Component Sandbox** - Testing components that will become templates for Resume Studio's public-facing profile feature

## Tech Stack

- **Framework:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Analytics:** Mixpanel
- **Backend:** Supabase
- **Hosting:** Vercel (Personal account)
- **Documentation:** Storybook

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Start Storybook
npm run storybook

# Build for production
npm run build
```

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utilities (mixpanel, supabase)
│   └── pages/         # Page components
├── docs/              # Strategy & tracking docs
│   ├── COMPONENT_CATALOG.md
│   ├── MIXPANEL_TRACKING_PLAN.md
│   ├── PROFILE_BUILDER_STRATEGY.md
│   └── VERCEL_GITHUB_CONSOLIDATION.md
├── .storybook/        # Storybook config
└── public/            # Static assets
```

## Key Components

| Component | Purpose | Status |
|-----------|---------|--------|
| ProfileDashboard | Main layout with tabs | Testing |
| SevenHats | Portfolio grid by skill category | Testing |
| CaseStudies | Project showcase cards | Testing |
| HowIWork | Working style description | Testing |
| ExitIntentPopup | Exit intent email capture | Testing |
| StickyFooterCTA | Scroll-triggered CTA | Testing |

See `docs/COMPONENT_CATALOG.md` for full inventory.

## Analytics

Mixpanel tracking is implemented for:
- Page views
- CTA clicks
- Form submissions
- Portfolio interactions
- Tab navigation

See `docs/MIXPANEL_TRACKING_PLAN.md` for event specifications.

## Deployment

```
Local: /Users/ralphbautista/website-ralphhhbenedict
         ↓
GitHub: ralphhhbenedict/website
         ↓
Vercel: vercel.com/resu-me-ai/website → ralphhhbenedict.com
```

Deploy via:
```bash
vercel --prod --token $VERCEL_TOKEN_PERSONAL
```

## Related

- **Resume Studio** - Parent product this sandbox feeds into
- **Profile Builder Strategy** - See `docs/PROFILE_BUILDER_STRATEGY.md`

---

*Last Updated: December 25, 2024*
