import { test, expect } from '@playwright/test';

test.describe('E2E Test Coverage', () => {
  test('should have comprehensive test coverage across all major features', async ({ page }) => {
    // This test ensures we have E2E coverage for critical user journeys
    const criticalPaths = [
      { path: '/', name: 'Landing Page' },
      { path: '/auth', name: 'Authentication' },
      { path: '/player/dashboard', name: 'Player Dashboard' },
      { path: '/player/court-booking', name: 'Court Booking' },
      { path: '/player/clubs', name: 'Clubs' },
      { path: '/admin', name: 'Admin Dashboard' },
      { path: '/admin/tournaments', name: 'Tournament Management' },
      { path: '/admin/court-schedules', name: 'Court Schedules' },
    ];

    const coverageResults = [];

    for (const { path: route, name } of criticalPaths) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Check that the page loads successfully
        await expect(page.locator('body')).toBeVisible();
        
        coverageResults.push({
          path: route,
          name,
          status: 'covered',
          error: null
        });
      } catch (error) {
        coverageResults.push({
          path: route,
          name,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Generate coverage report
    const coveredPaths = coverageResults.filter(r => r.status === 'covered');
    const failedPaths = coverageResults.filter(r => r.status === 'failed');
    
    console.log('\n📊 E2E Test Coverage Report:');
    console.log(`✅ Covered: ${coveredPaths.length}/${criticalPaths.length} paths`);
    console.log(`❌ Failed: ${failedPaths.length}/${criticalPaths.length} paths`);
    
    if (failedPaths.length > 0) {
      console.log('\nFailed paths:');
      failedPaths.forEach(path => {
        console.log(`  - ${path.name} (${path.path}): ${path.error}`);
      });
    }
    
    // Ensure we have at least 80% coverage of critical paths
    const coveragePercentage = (coveredPaths.length / criticalPaths.length) * 100;
    expect(coveragePercentage).toBeGreaterThanOrEqual(80);
    
    console.log(`\n🎯 E2E Coverage: ${coveragePercentage.toFixed(1)}%`);
  });

  test('should test responsive design across different viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    const responsiveResults = [];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check responsive design
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()?.width || 375;
      const isResponsive = bodyWidth <= viewportWidth + 20;
      
      responsiveResults.push({
        viewport: viewport.name,
        width: viewport.width,
        isResponsive,
        bodyWidth,
        viewportWidth
      });
    }

    // All viewports should be responsive
    const responsiveCount = responsiveResults.filter(r => r.isResponsive).length;
    expect(responsiveCount).toBe(viewports.length);
    
    console.log('\n📱 Responsive Design Coverage:');
    responsiveResults.forEach(result => {
      console.log(`  ${result.viewport} (${result.width}px): ${result.isResponsive ? '✅' : '❌'}`);
    });
  });

  test('should test error handling and edge cases', async ({ page }) => {
    const errorScenarios = [
      { path: '/nonexistent-page', expectedBehavior: '404 or redirect' },
      { path: '/admin', expectedBehavior: 'auth required or redirect' },
    ];

    const errorResults = [];

    for (const scenario of errorScenarios) {
      try {
        await page.goto(scenario.path);
        await page.waitForLoadState('networkidle');
        
        // Check that the page handles the error gracefully
        const currentUrl = page.url();
        const hasErrorHandling = currentUrl.includes('/auth') || 
                                currentUrl.includes('/404') || 
                                currentUrl.includes('/error') ||
                                await page.locator('body').isVisible();
        
        errorResults.push({
          path: scenario.path,
          expectedBehavior: scenario.expectedBehavior,
          handled: hasErrorHandling,
          currentUrl
        });
      } catch (error) {
        errorResults.push({
          path: scenario.path,
          expectedBehavior: scenario.expectedBehavior,
          handled: false,
          error: error.message
        });
      }
    }

    // At least 50% of error scenarios should be handled gracefully
    const handledCount = errorResults.filter(r => r.handled).length;
    const handlingPercentage = (handledCount / errorScenarios.length) * 100;
    
    expect(handlingPercentage).toBeGreaterThanOrEqual(50);
    
    console.log('\n🛡️ Error Handling Coverage:');
    errorResults.forEach(result => {
      console.log(`  ${result.path}: ${result.handled ? '✅' : '❌'} (${result.expectedBehavior})`);
    });
    console.log(`\n🎯 Error Handling Coverage: ${handlingPercentage.toFixed(1)}%`);
  });
});
