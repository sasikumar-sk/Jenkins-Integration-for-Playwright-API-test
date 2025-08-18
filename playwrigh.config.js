module.exports = {
  testDir: './tests',          // Path to your tests
  timeout: 30_000,             // Each test timeout
  retries: 1,                  // Retries on failure
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  workers: 4,                  // Parallel test workers
};
