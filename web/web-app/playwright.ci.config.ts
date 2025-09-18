import { defineConfig, devices } from '@playwright/test';

/**
 * CI-specific Playwright configuration
 * Optimized for GitHub Actions and other CI environments
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2, // More retries in CI
  workers: 1, // Single worker in CI for stability
  timeout: 30000, // Longer timeout for CI
  expect: {
    timeout: 10000, // Longer expect timeout
  },
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['github'], // GitHub Actions integration
  ],
  
  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] || 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // CI-specific settings
    headless: true,
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Only run on Chromium in CI for speed
    // Uncomment these for more comprehensive testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: false, // Always start fresh in CI
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
    },
  },
});
