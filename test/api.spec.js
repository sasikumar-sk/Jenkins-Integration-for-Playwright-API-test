const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

test.describe('CERN Catalogue API - Advanced Tests', () => {

  const apiUrl = 'https://catalogue.library.cern/api/literature/?q=html&sort=bestmatch&page=1&size=15';
  const outputDir = './api_responses';

  test.beforeAll(async () => {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
  });

  test('Network spy: capture all XHR/fetch and parse JSON safely', async ({ page }) => {
    const capturedResponses = [];

    // Listen for all network responses
    page.on('response', async (response) => {
      const url = response.url();
      const resourceType = response.request().resourceType();

      if (resourceType === 'xhr' || resourceType === 'fetch') {
        try {
          const json = await response.json(); // safe parse
          capturedResponses.push({ url, status: response.status(), json });
          console.log(`Captured XHR/fetch: ${url}`);
        } catch (e) {
          console.log(`Non-JSON or failed parse from: ${url}`);
        }
      }
    });

    await page.goto('https://catalogue.library.cern/'); // or another URL that triggers API requests

    // Wait a bit for any requests to finish
    await page.waitForTimeout(3000);

    // Save captured responses to file
    const filePath = path.join(outputDir, 'network_spy_responses.json');
    await fs.writeFile(filePath, JSON.stringify(capturedResponses, null, 2));

    console.log(`Captured responses saved to ${filePath}`);

    expect(capturedResponses.length).toBeGreaterThan(0);
  });

  test('Mocking API response with custom payload', async ({ page }) => {
    await page.route('https://catalogue.library.cern/api/literature/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'mocked response',
          hits: [{ id: 'mock1', title: 'Mocked paper' }],
          total: 1
        }),
      });
    });

    const response = await page.goto(apiUrl);
    expect(response.status()).toBe(200);

    const jsonResponse = await response.json();
    console.log('Mocked JSON Response:', JSON.stringify(jsonResponse, null, 2));

    expect(jsonResponse.total).toBe(1);

    // Save mocked response to file
    const filePath = path.join(outputDir, 'mocked_response.json');
    await fs.writeFile(filePath, JSON.stringify(jsonResponse, null, 2));
  });

  test('Direct API test using Playwright request fixture', async ({ request }) => {
    const apiResponse = await request.get(apiUrl);
    expect(apiResponse.ok()).toBeTruthy();

    const json = await apiResponse.json();
    console.log('Direct API Response:', JSON.stringify(json, null, 2));
    expect(json).toHaveProperty('hits');

    // Save direct API response to file
    const filePath = path.join(outputDir, 'direct_api_response.json');
    await fs.writeFile(filePath, JSON.stringify(json, null, 2));
  });

});
