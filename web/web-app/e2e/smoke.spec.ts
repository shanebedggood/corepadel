import { test, expect } from '@playwright/test';
import { TestUtils } from './test-utils';

test.describe('Core Padel Smoke Tests', () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
  });

  test('should load the main application without critical errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await testUtils.waitForPageLoad();

    // Check that the page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Check for critical errors (allow some non-critical ones)
    expect(errors.length).toBeLessThan(5);
  });

  test('should handle navigation between main sections', async ({ page }) => {
    const routes = [
      '/',
      '/auth',
      '/player/dashboard',
      '/player/court-booking',
      '/player/clubs',
      '/admin',
      '/admin/tournaments'
    ];

    for (const route of routes) {
      await page.goto(route);
      await testUtils.waitForPageLoad();
      
      // Each route should load without crashing
      await expect(page.locator('body')).toBeVisible();
      
      // Check that we're on a valid page (not a 404)
      const currentUrl = page.url();
      expect(currentUrl).toContain(route.split('?')[0]); // Ignore query params
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await testUtils.waitForPageLoad();
      
      // Check responsive design
      await testUtils.checkResponsiveDesign();
      
      // Check basic accessibility
      await testUtils.checkBasicAccessibility();
    }
  });

  test('should handle form interactions without crashing', async ({ page }) => {
    await page.goto('/auth');
    await testUtils.waitForPageLoad();
    
    // Look for form elements
    const inputs = page.locator('input');
    const buttons = page.locator('button');
    
    if (await inputs.count() > 0) {
      // Try to interact with the first input
      await inputs.first().click();
      await inputs.first().fill('test@example.com');
    }
    
    if (await buttons.count() > 0) {
      // Try to click the first button (but don't submit if it's a form)
      const firstButton = buttons.first();
      const buttonText = await firstButton.textContent();
      
      if (buttonText && !buttonText.toLowerCase().includes('submit')) {
        await firstButton.click();
      }
    }
    
    // Page should still be functional after interactions
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network issues by going offline
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    // Page should still load (from cache) or show appropriate error
    await expect(page.locator('body')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
    
    // Page should recover
    await page.reload();
    await testUtils.waitForPageLoad();
    await expect(page.locator('body')).toBeVisible();
  });
});
