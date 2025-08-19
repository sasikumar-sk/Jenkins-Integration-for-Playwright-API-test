// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',          // Path to your tests
  timeout: 30_000,             // Each test timeout
  fullyParallel: true,         // Run tests inside files in parallel
  forbidOnly: !!process.env.CI, // Fail CI if test.only is left in code
  retries: process.env.CI ? 2 : 0, // Retries only on CI
  workers: process.env.CI ? 1 : undefined, // Parallel workers (auto adjust locally)

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['allure-playwright']
  ],

  use: {
    // baseURL: 'http://127.0.0.1:3000',  // Enable if you want a baseURL
    trace: 'on-first-retry',   // Collect trace when retrying
    screenshot: 'only-on-failure',
    video: 'on',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'api',
      use: {},  // no browser engine required
    },
  ],

  // Optional: Run your dev server before tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
