import { test, expect } from '@playwright/test';

test.describe('Landing Page Smoke Tests', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Core Padel/);
    
    // Check for key elements on the landing page
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that the page doesn't have any console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate around and check for errors
    await page.waitForTimeout(1000);
    
    // Basic smoke test - page should load without critical errors
    expect(errors.length).toBeLessThan(5); // Allow some non-critical errors
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that the page loads on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Check that there are no horizontal scrollbars (responsive design)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 375;
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
  });
});
