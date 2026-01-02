import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Public Profile WebApp
 * =================================
 * Tests the core user flows for profile.resu-me.ai
 */

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads successfully', async ({ page }) => {
    // Check page title or main content
    await expect(page).toHaveTitle(/Ralph/i);
  });

  test('displays profile name', async ({ page }) => {
    await expect(page.getByText('Ralph Benedict Bautista')).toBeVisible();
  });

  test('displays current status', async ({ page }) => {
    await expect(page.getByText(/Building.*Startups/i)).toBeVisible();
  });

  test('renders tab navigation', async ({ page }) => {
    // Use role selectors to target tab buttons specifically
    await expect(page.getByRole('tab', { name: 'Case Studies' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'The 7 Hats' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'How I Work' })).toBeVisible();
  });

  test('tab navigation works', async ({ page }) => {
    // Click on a tab using role selector
    await page.getByRole('tab', { name: 'The 7 Hats' }).click();

    // Verify the tab is selected (has aria-selected="true")
    await expect(page.getByRole('tab', { name: 'The 7 Hats' })).toHaveAttribute('aria-selected', 'true');
  });

  test('CTA buttons are present', async ({ page }) => {
    await expect(page.getByText('See My Work')).toBeVisible();
    // Multiple "Get in Touch" buttons may exist
    const getInTouchButtons = page.getByText('Get in Touch');
    await expect(getInTouchButtons.first()).toBeVisible();
  });

  test('availability badge is visible', async ({ page }) => {
    // Use .first() since there are multiple availability indicators
    await expect(page.getByText(/Accepting.*client/i).first()).toBeVisible();
  });
});

test.describe('Social Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('LinkedIn link exists', async ({ page }) => {
    const linkedinLink = page.locator('a[href*="linkedin.com"]');
    await expect(linkedinLink.first()).toBeVisible();
  });

  test('email link exists', async ({ page }) => {
    const emailLink = page.locator('a[href^="mailto:"]');
    await expect(emailLink.first()).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('displays correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Profile should still be visible
    await expect(page.getByText('Ralph Benedict Bautista')).toBeVisible();
  });

  test('displays correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByText('Ralph Benedict Bautista')).toBeVisible();
  });

  test('displays correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await expect(page.getByText('Ralph Benedict Bautista')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page has proper heading structure', async ({ page }) => {
    // Should have at least one h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Either has alt text or is decorative (role="presentation")
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    // Tab through the page and verify focus states
    await page.keyboard.press('Tab');

    // Something should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
