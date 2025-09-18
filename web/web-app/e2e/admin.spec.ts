import { test, expect } from '@playwright/test';

test.describe('Admin Section Smoke Tests', () => {
  test('should load admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Check that the admin page loads (might redirect to auth)
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for the page to stabilize
    await page.waitForLoadState('networkidle');
    
    // Check that we're either on admin page or redirected to auth
    const currentUrl = page.url();
    const isAdminPage = currentUrl.includes('/admin');
    const isAuthPage = currentUrl.includes('/auth');
    
    expect(isAdminPage || isAuthPage).toBe(true);
  });

  test('should handle tournament management navigation', async ({ page }) => {
    await page.goto('/admin/tournaments');
    
    // Check that the tournaments page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for any async content
    await page.waitForLoadState('networkidle');
    
    // Basic smoke test - page should be responsive
    const bodyElement = page.locator('body');
    await expect(bodyElement).toBeVisible();
  });

  test('should handle court schedules navigation', async ({ page }) => {
    await page.goto('/admin/court-schedules');
    
    // Check that the court schedules page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for common admin elements
    const adminElements = [
      page.locator('button'),
      page.locator('input'),
      page.locator('[data-testid*="admin"]'),
      page.locator('[class*="admin"]'),
      page.locator('table'),
      page.locator('form')
    ];
    
    // At least one admin-related element should be present
    let foundElement = false;
    for (const element of adminElements) {
      if (await element.count() > 0) {
        foundElement = true;
        break;
      }
    }
    
    expect(foundElement).toBe(true);
  });
});
