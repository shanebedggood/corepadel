import { Page, expect } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for the Angular app to be ready
   */
  async waitForAngularReady() {
    await this.page.waitForFunction(() => {
      return window.ng !== undefined;
    }, { timeout: 10000 });
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.waitForAngularReady();
  }

  /**
   * Check for console errors
   */
  async checkForConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    return errors;
  }

  /**
   * Take a screenshot for debugging
   */
  async takeDebugScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/debug-${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if the page is responsive
   */
  async checkResponsiveDesign() {
    const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = this.page.viewportSize()?.width || 375;
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  }

  /**
   * Wait for an element to be visible and stable
   */
  async waitForElementStable(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    
    // Wait for any animations to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if the page has any critical accessibility issues
   */
  async checkBasicAccessibility() {
    // Check for basic accessibility elements
    const hasHeading = await this.page.locator('h1, h2, h3, h4, h5, h6').count() > 0;
    const hasMainContent = await this.page.locator('main, [role="main"]').count() > 0;
    
    // These are basic checks - for comprehensive accessibility testing,
    // you'd want to use tools like axe-core
    expect(hasHeading || hasMainContent).toBe(true);
  }
}
