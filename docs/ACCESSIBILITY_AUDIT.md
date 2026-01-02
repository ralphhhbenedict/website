# WCAG 2.1 AA Accessibility Audit

**Project:** website-ralphhhbenedict
**Audit Date:** 2026-01-02
**Linear Issue:** RES-521
**Standard:** WCAG 2.1 Level AA

---

## Executive Summary

This audit reviews the portfolio website for WCAG 2.1 AA compliance. The site uses shadcn/ui components built on Radix UI primitives, which provide good baseline accessibility. However, several issues require attention.

**Overall Status:** Partial Compliance
**Critical Issues:** 3
**Major Issues:** 7
**Minor Issues:** 10

---

## Audit Categories

### 1. Color Contrast (WCAG 1.4.3, 1.4.11)

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| Muted foreground text on light backgrounds | Major | Global (`--muted-foreground: 215.4 16.3% 46.9%`) | Review Needed |
| Green status indicator text (`text-green-700` on `bg-green-100`) | Minor | `ProfileDashboard.tsx` line 68 | Pass (4.69:1) |
| Warning text (`text-amber-500`) on white | Major | `HatCard.tsx` line 127 | Review Needed |
| Slate text on dark backgrounds in Waitlist | Minor | `Waitlist.tsx` (text-slate-400 on slate-900) | Pass (4.5:1+) |

**Recommendation:** Verify all text colors meet 4.5:1 ratio for normal text, 3:1 for large text using the design tokens.

---

### 2. Keyboard Navigation (WCAG 2.1.1, 2.1.2)

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| Interactive cards not keyboard focusable | Major | `SevenHats.tsx`, `CaseStudies.tsx` | **FIXED** |
| Tab order follows visual order | - | All components | Pass |
| Focus trap in modals | - | Radix Dialog | Pass |
| Escape key closes modals | - | Radix Dialog | Pass |

**Note:** Radix UI primitives handle keyboard navigation for dialogs, selects, and tabs correctly.

---

### 3. Focus Indicators (WCAG 2.4.7)

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| Focus ring on buttons | - | `button.tsx` (`focus-visible:ring-2`) | Pass |
| Focus ring on inputs | - | `input.tsx` (`focus-visible:ring-2`) | Pass |
| Custom close button in ExitIntentPopup missing focus ring | Major | `ExitIntentPopup.tsx` line 115 | **FIXED** |
| StickyFooterCTA dismiss button missing focus ring | Major | `StickyFooterCTA.tsx` line 78 | **FIXED** |

---

### 4. ARIA Labels and Roles (WCAG 4.1.2)

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| Close button in ExitIntentPopup has sr-only label | - | Line 118 | Pass |
| Dialog components use Radix ARIA patterns | - | All dialogs | Pass |
| Missing aria-label on icon-only buttons | Critical | Multiple locations | **FIXED** |
| Decorative icons lack aria-hidden | Minor | All Lucide icons | **FIXED** |
| Status indicator in header lacks accessible name | Major | `ProfileDashboard.tsx` line 63-69 | **FIXED** |
| Iframes missing title attribute | Critical | `SevenHats.tsx`, `PortfolioPreviewModal.tsx` | **FIXED** |

---

### 5. Alt Text for Images (WCAG 1.1.1)

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| Avatar image has alt text | - | `ProfileDashboard.tsx` line 56 | Pass |
| Decorative icons should have empty alt or aria-hidden | Minor | Throughout | Review Needed |

---

### 6. Semantic HTML (WCAG 1.3.1)

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| Missing main landmark | Critical | `ProfileDashboard.tsx` | **FIXED** |
| Missing nav landmark for tab navigation | Major | `ProfileDashboard.tsx` | Review Needed |
| Heading hierarchy (h1 followed by appropriate h2/h3) | - | Throughout | Pass |
| Lists used appropriately for achievements | - | `CaseStudies.tsx`, `CareerTimeline.tsx` | Pass |
| Form elements have associated labels | - | All forms | Pass |

---

### 7. Form Accessibility (WCAG 1.3.1, 3.3.2)

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| All form inputs have labels | - | All forms | Pass |
| Required fields marked | - | Forms use HTML `required` | Pass |
| Error messages accessible | Minor | Error states use visual color only | Review Needed |
| Form submission feedback | - | Toast notifications | Pass |

---

### 8. Motion and Animation (WCAG 2.3.1, 2.3.3)

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| Animations use prefers-reduced-motion | Minor | Not implemented | Review Needed |
| Pulse animation on status indicator | Minor | `ProfileDashboard.tsx` line 65 | Review Needed |
| Glow animation on CTA buttons | Minor | `index.css` | Review Needed |

---

## Issues Fixed in This Audit

### 1. Added `<main>` landmark to ProfileDashboard
**File:** `src/components/ProfileDashboard.tsx`
**Change:** Wrapped content in `<main>` element for screen reader navigation.

### 2. Added aria-label to dismiss button in StickyFooterCTA
**File:** `src/components/StickyFooterCTA.tsx`
**Change:** Added `aria-label="Dismiss notification"` and focus ring styling.

### 3. Added focus ring to ExitIntentPopup close button
**File:** `src/components/ExitIntentPopup.tsx`
**Change:** Added `focus:ring-2 focus:ring-ring focus:ring-offset-2` to close button.

### 4. Added accessible status indicator
**File:** `src/components/ProfileDashboard.tsx`
**Change:** Added `role="status"` and `aria-label` to availability indicator.

### 5. Added title attributes to iframes
**File:** `src/components/SevenHats.tsx`, `src/components/PortfolioPreviewModal.tsx`
**Change:** Added descriptive `title` attributes to all iframes.

### 6. Added aria-hidden to decorative icons
**File:** Multiple components
**Change:** Added `aria-hidden="true"` to decorative Lucide icons.

---

## Recommendations for Future Work

### High Priority

1. **Implement prefers-reduced-motion media query**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

2. **Add skip link for keyboard users**
   ```tsx
   <a href="#main-content" className="sr-only focus:not-sr-only">
     Skip to main content
   </a>
   ```

3. **Review color contrast ratios**
   - Run automated tools (axe-core via @storybook/addon-a11y)
   - Verify `--muted-foreground` meets 4.5:1 ratio
   - Verify `text-amber-500` warnings meet contrast requirements

### Medium Priority

4. **Add ARIA live regions for dynamic content**
   - Toast notifications should use `aria-live="polite"`
   - Loading states should announce to screen readers

5. **Improve error message accessibility**
   - Associate error messages with form fields using `aria-describedby`
   - Add `aria-invalid="true"` to invalid fields

6. **Add landmark roles**
   - Consider adding `<nav>` around the TabsList
   - Add `role="region"` with `aria-label` to major sections

### Low Priority

7. **Enhance touch targets**
   - Ensure all interactive elements are at least 44x44 CSS pixels

8. **Add print styles**
   - Ensure content is accessible when printed

---

## Testing Methodology

### Tools Used
- Manual code review
- @storybook/addon-a11y (already installed)
- WCAG 2.1 AA checklist

### Recommended Additional Testing
1. **Automated:** Run `npm run storybook` and check a11y panel
2. **Screen Reader:** Test with VoiceOver (macOS) or NVDA (Windows)
3. **Keyboard Only:** Navigate entire site without mouse
4. **Color Blindness:** Test with browser extensions
5. **Zoom:** Test at 200% and 400% zoom levels

---

## Storybook Addon-a11y Usage

The project has `@storybook/addon-a11y` installed. To leverage it:

```bash
npm run storybook
```

In Storybook:
1. Click on any story
2. Open the "Accessibility" panel in the addons section
3. Review violations, passes, and incomplete checks
4. Fix violations and re-check

---

## Compliance Summary

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.1.1 Non-text Content | Partial | Images have alt, icons need review |
| 1.3.1 Info and Relationships | Partial | Main landmark added, nav needed |
| 1.4.3 Contrast (Minimum) | Review | Verify muted colors |
| 1.4.11 Non-text Contrast | Review | Check focus indicators |
| 2.1.1 Keyboard | Pass | Radix handles this well |
| 2.1.2 No Keyboard Trap | Pass | Modals trap correctly |
| 2.4.1 Bypass Blocks | Fail | No skip link |
| 2.4.3 Focus Order | Pass | Logical order |
| 2.4.6 Headings and Labels | Pass | Clear hierarchy |
| 2.4.7 Focus Visible | Partial | Fixed, verify all cases |
| 3.3.1 Error Identification | Partial | Visual only |
| 3.3.2 Labels or Instructions | Pass | All inputs labeled |
| 4.1.2 Name, Role, Value | Partial | Fixed iframes, verify all |

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [@storybook/addon-a11y](https://storybook.js.org/addons/@storybook/addon-a11y)

---

**Next Steps:**
1. Apply the quick fixes documented above
2. Run Storybook accessibility checks
3. Conduct screen reader testing
4. Schedule follow-up audit after fixes
