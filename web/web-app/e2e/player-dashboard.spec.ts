import { test, expect } from '@playwright/test';

test.describe('Player Dashboard Smoke Tests', () => {
  test('should load player dashboard', async ({ page }) => {
    await page.goto('/player/dashboard');
    
    // Check that the page loads without crashing
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for any async content to load
    await page.waitForLoadState('networkidle');
    
    // Basic smoke test - page should be responsive
    const bodyElement = page.locator('body');
    await expect(bodyElement).toBeVisible();
  });

  test('should handle court booking navigation', async ({ page }) => {
    await page.goto('/player/court-booking');
    
    // Check that the court booking page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for the page to stabilize
    await page.waitForLoadState('networkidle');
    
    // Look for common booking elements
    const bookingElements = [
      page.locator('button'),
      page.locator('input'),
      page.locator('[data-testid*="booking"]'),
      page.locator('[class*="booking"]'),
      page.locator('[class*="court"]')
    ];
    
    // At least one interactive element should be present
    let foundElement = false;
    for (const element of bookingElements) {
      if (await element.count() > 0) {
        foundElement = true;
        break;
      }
    }
    
    expect(foundElement).toBe(true);
  });

  test('should handle clubs page navigation', async ({ page }) => {
    await page.goto('/player/clubs');
    
    // Check that the clubs page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for any data to load
    await page.waitForLoadState('networkidle');
    
    // Basic smoke test - page should not have critical errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Allow some non-critical errors but not too many
    expect(errors.length).toBeLessThan(10);
  });
});
